import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { generateJSON } from '@/lib/ai/gemini'
import { cachedGenerate, hashPrompt } from '@/lib/ai/cache'
import { extractSkillsFromResumePrompt } from '@/lib/ai/prompts'
import {
  analyzeGitHubProfile,
  extractSkillsFromGitHub,
} from '@/lib/github/analyzer'
import type { APIResponse, SkillCategory, UserSkill } from '@/lib/types'

interface ExtractRequest {
  source: 'resume' | 'github'
  data: string // resume text or GitHub username
}

interface ExtractedSkill {
  name: string
  category: SkillCategory
  confidence: number
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient()

    // Validate auth
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' } satisfies APIResponse,
        { status: 401 }
      )
    }

    const body: ExtractRequest = await request.json()
    const { source, data } = body

    if (!source || !data) {
      return NextResponse.json(
        { success: false, error: 'Both source and data are required' } satisfies APIResponse,
        { status: 400 }
      )
    }

    if (source !== 'resume' && source !== 'github') {
      return NextResponse.json(
        { success: false, error: 'Source must be "resume" or "github"' } satisfies APIResponse,
        { status: 400 }
      )
    }

    let extractedSkills: ExtractedSkill[] = []
    let sourceType: 'resume' | 'github_repo' = 'resume'
    let sourceName = ''

    if (source === 'resume') {
      // Extract skills from resume text using AI
      const cacheKey = `resume_skills_${hashPrompt(data)}`
      const skillsRaw = await cachedGenerate(
        cacheKey,
        data,
        async () => {
          const prompt = extractSkillsFromResumePrompt(data)
          const result = await generateJSON<{ skills: ExtractedSkill[] }>(prompt)
          return JSON.stringify(result)
        }
      )

      const parsed = JSON.parse(skillsRaw) as { skills: ExtractedSkill[] }
      extractedSkills = parsed.skills
      sourceType = 'resume'
      sourceName = 'Uploaded Resume'
    } else {
      // Extract skills from GitHub profile
      const profile = await analyzeGitHubProfile(data)
      const githubSkills = extractSkillsFromGitHub(profile)

      extractedSkills = githubSkills.map((s) => ({
        name: s.name,
        category: s.category as SkillCategory,
        confidence: s.confidence,
      }))
      sourceType = 'github_repo'
      sourceName = `GitHub (${data})`
    }

    // Fetch existing user skills
    const { data: existingSkills } = await supabase
      .from('user_skills')
      .select('*')
      .eq('user_id', user.id)

    const existingSkillMap = new Map<string, UserSkill>(
      ((existingSkills as UserSkill[]) ?? []).map((s) => [
        s.skill_name.toLowerCase(),
        s,
      ])
    )

    // Merge extracted skills with existing ones
    const upsertedSkills: Partial<UserSkill>[] = []
    const validCategories = new Set([
      'language', 'framework', 'tool', 'platform', 'database', 'concept', 'soft_skill', 'other',
    ])

    for (const skill of extractedSkills) {
      const key = skill.name.toLowerCase()
      const existing = existingSkillMap.get(key)
      const category = validCategories.has(skill.category) ? skill.category : 'other'

      const newSource = {
        type: sourceType,
        name: sourceName,
        evidence: `Extracted from ${source}`,
      }

      if (existing) {
        // Update existing skill: merge sources, increase confidence
        const existingSources = Array.isArray(existing.sources_json)
          ? existing.sources_json
          : []

        // Don't duplicate sources of the same type
        const hasSource = existingSources.some(
          (s) => s.type === sourceType && s.name === sourceName
        )
        const updatedSources = hasSource
          ? existingSources
          : [...existingSources, newSource]

        // Boost confidence with multiple sources (max 1.0)
        const updatedConfidence = Math.min(
          1.0,
          Math.max(existing.confidence, skill.confidence) + 0.1
        )

        upsertedSkills.push({
          id: existing.id,
          user_id: user.id,
          skill_name: existing.skill_name, // Keep canonical name
          category: existing.category, // Keep existing category
          sources_json: updatedSources,
          confidence: updatedConfidence,
          verified: existing.verified, // Don't change verification status
        })
      } else {
        // Insert new skill
        upsertedSkills.push({
          user_id: user.id,
          skill_name: skill.name,
          category: category as SkillCategory,
          sources_json: [newSource],
          confidence: skill.confidence,
          verified: false, // New skills always start unverified
        })
      }
    }

    // Upsert all skills
    if (upsertedSkills.length > 0) {
      const { error: upsertError } = await supabase
        .from('user_skills')
        .upsert(
          upsertedSkills.map((s) => ({
            ...s,
            sources_json: JSON.stringify(s.sources_json),
          })),
          { onConflict: 'user_id,skill_name' }
        )

      if (upsertError) {
        console.error('[Skills Extract] Upsert error:', upsertError.message)
        return NextResponse.json(
          { success: false, error: 'Failed to save extracted skills' } satisfies APIResponse,
          { status: 500 }
        )
      }
    }

    // Fetch the final state of all user skills
    const { data: finalSkills } = await supabase
      .from('user_skills')
      .select('*')
      .eq('user_id', user.id)
      .order('confidence', { ascending: false })

    return NextResponse.json({
      success: true,
      data: {
        extracted_count: extractedSkills.length,
        total_skills: finalSkills?.length ?? 0,
        skills: finalSkills ?? [],
      },
      message: `Successfully extracted ${extractedSkills.length} skills from ${source}`,
    } satisfies APIResponse)
  } catch (error) {
    console.error('[Skills Extract] Unexpected error:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'An unexpected error occurred',
      } satisfies APIResponse,
      { status: 500 }
    )
  }
}
