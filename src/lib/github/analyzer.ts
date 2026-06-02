import type { GitHubRepo, GitHubProfile } from '@/lib/types'

// ============================================================
// GitHub Profile Analyzer
// ============================================================

const GITHUB_API_BASE = 'https://api.github.com'

function getHeaders(): HeadersInit {
  const headers: HeadersInit = {
    Accept: 'application/vnd.github.v3+json',
    'User-Agent': 'ai-resume-builder',
  }

  // Use token if available for higher rate limits and private repo access
  const token = process.env.GITHUB_TOKEN
  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }

  return headers
}

/**
 * Fetch public repos for a GitHub user.
 */
export async function fetchUserRepos(username: string): Promise<GitHubRepo[]> {
  const url = `${GITHUB_API_BASE}/users/${encodeURIComponent(username)}/repos?sort=updated&per_page=30&type=owner`

  const response = await fetch(url, { headers: getHeaders() })

  if (!response.ok) {
    if (response.status === 404) {
      throw new Error(`GitHub user "${username}" not found`)
    }
    if (response.status === 403) {
      throw new Error('GitHub API rate limit exceeded. Try again later or add a GITHUB_TOKEN.')
    }
    throw new Error(`GitHub API error: ${response.status} ${response.statusText}`)
  }

  const repos = await response.json()

  return repos
    .filter((repo: Record<string, unknown>) => !repo.fork) // Skip forks
    .map((repo: Record<string, unknown>) => {
      const stars = (repo.stargazers_count as number) ?? 0
      const size = (repo.size as number) ?? 0
      const topics = (repo.topics as string[]) ?? []
      const languagesCount = repo.language ? 1 : 0 // Simplified — full count requires another API call

      // Calculate complexity score (0-100)
      const complexity_score = Math.min(
        100,
        Math.round(
          stars * 5 +
          Math.log2(Math.max(size, 1)) * 3 +
          languagesCount * 10 +
          topics.length * 8 +
          ((repo.forks_count as number) ?? 0) * 3
        )
      )

      return {
        name: repo.name as string,
        description: (repo.description as string) ?? null,
        language: (repo.language as string) ?? null,
        stars,
        forks: (repo.forks_count as number) ?? 0,
        topics,
        url: repo.html_url as string,
        complexity_score,
      } satisfies GitHubRepo
    })
}

/**
 * Fetch the language breakdown across all repos.
 */
async function fetchLanguageBreakdown(
  username: string,
  repos: GitHubRepo[]
): Promise<{ name: string; percentage: number }[]> {
  const languageCounts: Record<string, number> = {}

  // Count primary language usage across repos
  for (const repo of repos) {
    if (repo.language) {
      languageCounts[repo.language] = (languageCounts[repo.language] || 0) + 1
    }
  }

  const total = Object.values(languageCounts).reduce((sum, count) => sum + count, 0)
  if (total === 0) return []

  return Object.entries(languageCounts)
    .map(([name, count]) => ({
      name,
      percentage: Math.round((count / total) * 100),
    }))
    .sort((a, b) => b.percentage - a.percentage)
}

/**
 * Analyze a GitHub profile — repos, languages, and contribution score.
 */
export async function analyzeGitHubProfile(username: string): Promise<GitHubProfile> {
  // Fetch user info
  const userResponse = await fetch(
    `${GITHUB_API_BASE}/users/${encodeURIComponent(username)}`,
    { headers: getHeaders() }
  )

  if (!userResponse.ok) {
    throw new Error(`Failed to fetch GitHub user "${username}": ${userResponse.status}`)
  }

  const userData = await userResponse.json()

  // Fetch repos
  const repos = await fetchUserRepos(username)

  // Calculate language breakdown
  const top_languages = await fetchLanguageBreakdown(username, repos)

  // Calculate contribution score (0-100) based on repo metrics
  const totalStars = repos.reduce((sum, r) => sum + r.stars, 0)
  const totalForks = repos.reduce((sum, r) => sum + r.forks, 0)
  const avgComplexity =
    repos.length > 0
      ? repos.reduce((sum, r) => sum + r.complexity_score, 0) / repos.length
      : 0

  const contribution_score = Math.min(
    100,
    Math.round(
      repos.length * 3 +
      totalStars * 2 +
      totalForks * 1.5 +
      avgComplexity * 0.5 +
      (userData.public_repos ?? 0) * 0.5
    )
  )

  return {
    username,
    repos,
    top_languages,
    total_commits: userData.public_repos ?? repos.length, // Approximation — exact commits require events API
    contribution_score,
    profile_url: `https://github.com/${username}`,
  } satisfies GitHubProfile
}

/**
 * Extract skills from a GitHub profile analysis.
 * Maps languages, frameworks, and tools to structured skills with evidence.
 */
export function extractSkillsFromGitHub(
  profile: GitHubProfile
): { name: string; category: string; evidence: string; confidence: number }[] {
  const skills: { name: string; category: string; evidence: string; confidence: number }[] = []
  const seen = new Set<string>()

  // Extract from languages
  for (const lang of profile.top_languages) {
    const normalized = lang.name.toLowerCase()
    if (seen.has(normalized)) continue
    seen.add(normalized)

    skills.push({
      name: lang.name,
      category: 'language',
      evidence: `Used in ${lang.percentage}% of repositories`,
      confidence: Math.min(1, lang.percentage / 100 + 0.3),
    })
  }

  // Extract from repo topics (frameworks, tools, platforms)
  const topicCategoryMap: Record<string, string> = {
    react: 'framework',
    nextjs: 'framework',
    'next-js': 'framework',
    vue: 'framework',
    angular: 'framework',
    svelte: 'framework',
    django: 'framework',
    flask: 'framework',
    express: 'framework',
    nestjs: 'framework',
    fastapi: 'framework',
    spring: 'framework',
    rails: 'framework',
    laravel: 'framework',
    docker: 'tool',
    kubernetes: 'platform',
    aws: 'platform',
    gcp: 'platform',
    azure: 'platform',
    terraform: 'tool',
    graphql: 'concept',
    'rest-api': 'concept',
    'machine-learning': 'concept',
    'deep-learning': 'concept',
    postgresql: 'database',
    mongodb: 'database',
    redis: 'database',
    mysql: 'database',
    firebase: 'platform',
    supabase: 'platform',
    tailwindcss: 'framework',
    'tailwind-css': 'framework',
  }

  const topicDisplayNames: Record<string, string> = {
    nextjs: 'Next.js',
    'next-js': 'Next.js',
    nestjs: 'NestJS',
    fastapi: 'FastAPI',
    graphql: 'GraphQL',
    'rest-api': 'REST API',
    'machine-learning': 'Machine Learning',
    'deep-learning': 'Deep Learning',
    postgresql: 'PostgreSQL',
    mongodb: 'MongoDB',
    tailwindcss: 'Tailwind CSS',
    'tailwind-css': 'Tailwind CSS',
    gcp: 'Google Cloud Platform',
    aws: 'AWS',
  }

  for (const repo of profile.repos) {
    for (const topic of repo.topics) {
      const normalized = topic.toLowerCase()
      if (seen.has(normalized)) continue

      const category = topicCategoryMap[normalized]
      if (category) {
        seen.add(normalized)
        const displayName = topicDisplayNames[normalized] || topic
        skills.push({
          name: displayName,
          category,
          evidence: `Found in repo "${repo.name}" topics`,
          confidence: Math.min(1, 0.4 + repo.complexity_score / 200),
        })
      }
    }
  }

  return skills
}
