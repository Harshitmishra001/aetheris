import CryptoJS from 'crypto-js'
import { createServiceClient } from '@/lib/supabase/server'

// ============================================================
// AI Cache — Cost control layer using Supabase ai_cache table
// ============================================================

const DEFAULT_TTL_HOURS = 24 * 7 // 7 days

/**
 * Generate a SHA-256 hash of a prompt string for cache lookups.
 */
export function hashPrompt(prompt: string): string {
  return CryptoJS.SHA256(prompt).toString(CryptoJS.enc.Hex)
}

/**
 * Look up a cached AI response by cache key.
 * Returns null if not found or expired.
 */
export async function getCachedResponse(cacheKey: string): Promise<string | null> {
  const supabase = await createServiceClient()

  const { data, error } = await supabase
    .from('ai_cache')
    .select('response, expires_at')
    .eq('cache_key', cacheKey)
    .single()

  if (error || !data) {
    return null
  }

  // Check if the cache entry has expired
  if (new Date(data.expires_at) < new Date()) {
    // Clean up this expired entry
    await supabase.from('ai_cache').delete().eq('cache_key', cacheKey)
    return null
  }

  return data.response
}

/**
 * Store a new AI response in the cache.
 */
export async function setCachedResponse(
  cacheKey: string,
  promptHash: string,
  response: string,
  model: string,
  tokensUsed: number,
  ttlHours: number = DEFAULT_TTL_HOURS
): Promise<void> {
  const supabase = await createServiceClient()

  const expiresAt = new Date()
  expiresAt.setHours(expiresAt.getHours() + ttlHours)

  const { error } = await supabase.from('ai_cache').upsert(
    {
      cache_key: cacheKey,
      prompt_hash: promptHash,
      response,
      model,
      tokens_used: tokensUsed,
      expires_at: expiresAt.toISOString(),
    },
    { onConflict: 'cache_key' }
  )

  if (error) {
    console.error('[AI Cache] Failed to write cache entry:', error.message)
  }
}

/**
 * Wrapper that checks cache before calling the expensive AI generation function.
 * If a cached response exists, returns it immediately.
 * Otherwise, calls generateFn, caches the result, and returns it.
 */
export async function cachedGenerate(
  cacheKey: string,
  prompt: string,
  generateFn: () => Promise<string>,
  model: string = 'gemini-2.0-flash',
  ttlHours: number = DEFAULT_TTL_HOURS
): Promise<string> {
  // Check cache first
  const cached = await getCachedResponse(cacheKey)
  if (cached) {
    console.log(`[AI Cache] HIT for key: ${cacheKey.substring(0, 20)}...`)
    return cached
  }

  console.log(`[AI Cache] MISS for key: ${cacheKey.substring(0, 20)}...`)

  // Generate fresh response
  const response = await generateFn()

  // Cache it (fire and forget — don't block the response)
  const promptHash = hashPrompt(prompt)
  setCachedResponse(cacheKey, promptHash, response, model, 0, ttlHours).catch((err) =>
    console.error('[AI Cache] Background cache write failed:', err)
  )

  return response
}

/**
 * Clean up expired cache entries.
 * Call this periodically (e.g., via a cron job or scheduled function).
 */
export async function cleanExpiredCache(): Promise<number> {
  const supabase = await createServiceClient()

  const { data, error } = await supabase
    .from('ai_cache')
    .delete()
    .lt('expires_at', new Date().toISOString())
    .select('id')

  if (error) {
    console.error('[AI Cache] Failed to clean expired entries:', error.message)
    return 0
  }

  const count = data?.length ?? 0
  if (count > 0) {
    console.log(`[AI Cache] Cleaned ${count} expired entries`)
  }

  return count
}
