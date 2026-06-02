// ============================================================
// OpenRouter AI Service — Wrapper with retry + error handling
// ============================================================

// Using a free model available on OpenRouter
const DEFAULT_MODEL = 'moonshotai/kimi-k2.6:free' 
// Note: OpenRouter supports some embedding models, but for free tiers you might need to check availability
const EMBEDDING_MODEL = 'nomic-ai/nomic-embed-text-v1.5'
const MAX_RETRIES = 3
const BASE_DELAY_MS = 1000

function getApiKey(): string {
  const apiKey = process.env.OPENROUTER_API_KEY
  if (!apiKey) {
    throw new Error('OPENROUTER_API_KEY environment variable is not set')
  }
  return apiKey
}

/**
 * Retry a function with exponential backoff.
 */
async function withRetry<T>(fn: () => Promise<T>, retries = MAX_RETRIES): Promise<T> {
  let lastError: Error | null = null

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      return await fn()
    } catch (error: unknown) {
      lastError = error instanceof Error ? error : new Error(String(error))

      const isRetryable =
        lastError.message.includes('429') ||
        lastError.message.includes('503') ||
        lastError.message.includes('500') ||
        lastError.message.includes('RESOURCE_EXHAUSTED')

      if (!isRetryable || attempt === retries) {
        throw lastError
      }

      const delay = BASE_DELAY_MS * Math.pow(2, attempt) + Math.random() * 500
      console.warn(
        `[OpenRouter] Rate limited or server error. Retrying in ${Math.round(delay)}ms (attempt ${attempt + 1}/${retries})`
      )
      await new Promise((resolve) => setTimeout(resolve, delay))
    }
  }

  throw lastError ?? new Error('Unexpected retry failure')
}

/**
 * Generate text using OpenRouter.
 */
export async function generateText(
  prompt: string,
  options?: { model?: string; temperature?: number }
): Promise<string> {
  const model = options?.model || DEFAULT_MODEL
  const apiKey = getApiKey()

  return withRetry(async () => {
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'http://localhost:3000', // Required by OpenRouter
        'X-Title': 'ResumeAI', // Required by OpenRouter
      },
      body: JSON.stringify({
        model: model,
        messages: [{ role: 'user', content: prompt }],
        temperature: options?.temperature ?? 0.7,
      }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`OpenRouter API error: ${response.status} - ${errorText}`)
    }

    const data = await response.json()
    const text = data.choices?.[0]?.message?.content

    if (!text) {
      throw new Error('OpenRouter returned an empty response')
    }

    return text
  })
}

/**
 * Generate an embedding vector for the given text.
 * Note: Free embeddings via OpenRouter might be limited.
 */
export async function generateEmbedding(text: string): Promise<number[]> {
  const apiKey = getApiKey()

  return withRetry(async () => {
    // Note: Some models support embeddings on OpenRouter, fallback to basic array if not using vector search yet
    const response = await fetch('https://openrouter.ai/api/v1/embeddings', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: EMBEDDING_MODEL,
        input: text,
      }),
    })

    if (!response.ok) {
      console.warn('Embeddings may not be fully supported on the free tier model selected. Returning zero vector.')
      return new Array(768).fill(0)
    }

    const data = await response.json()
    const embedding = data.data?.[0]?.embedding

    if (!embedding || embedding.length === 0) {
      return new Array(768).fill(0)
    }

    return embedding
  })
}

/**
 * Generate a response and parse it as JSON.
 */
export async function generateJSON<T>(
  prompt: string,
  schema?: string
): Promise<T> {
  const fullPrompt = schema
    ? `${prompt}\n\nExpected JSON schema:\n${schema}\n\nRespond with valid JSON only. No markdown, no code blocks, no explanations.`
    : `${prompt}\n\nRespond with valid JSON only. No markdown, no code blocks, no explanations.`

  const text = await generateText(fullPrompt, { temperature: 0.3 })

  try {
    const cleaned = text
      .replace(/^```(?:json)?\s*/i, '')
      .replace(/\s*```$/i, '')
      .trim()

    return JSON.parse(cleaned) as T
  } catch {
    throw new Error(
      `Failed to parse OpenRouter response as JSON. Raw response: ${text.substring(0, 500)}`
    )
  }
}
