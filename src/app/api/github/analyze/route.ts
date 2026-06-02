import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import {
  analyzeGitHubProfile,
  extractSkillsFromGitHub,
} from '@/lib/github/analyzer'
import type { APIResponse, GitHubProfile, SkillCategory } from '@/lib/types'

interface AnalyzeRequest {
  username: string
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

    const body: AnalyzeRequest = await request.json()
    const { username } = body

    if (!username || username.trim().length === 0) {
      return NextResponse.json(
        { success: false, error: 'GitHub username is required' } satisfies APIResponse,
        { status: 400 }
      )
    }

    // Clean the username
    const cleanUsername = username.trim().replace(/^@/, '')

    // Analyze GitHub profile
    const profile: GitHubProfile = await analyzeGitHubProfile(cleanUsername)

    // Extract skills from repos
    const extractedSkills = extractSkillsFromGitHub(profile)

    // Save extracted skills to user_skills table
    const validCategories = new Set([
      'language', 'framework', 'tool', 'platform', 'database', 'concept', 'soft_skill', 'other',
    ])

    for (const skill of extractedSkills) {
      const category = validCategories.has(skill.category) ? skill.category : 'other'
      const sourceJson = JSON.stringify([
        {
          type: 'github_repo',
          name: `GitHub (${cleanUsername})`,
          evidence: skill.evidence,
          url: profile.profile_url,
        },
      ])

      // Upsert — update confidence if skill already exists, merge sources
      const { data: existing } = await supabase
        .from('user_skills')
        .select('id, sources_json, confidence')
        .eq('user_id', user.id)
        .eq('skill_name', skill.name)
        .single()

      if (existing) {
        const existingSources = Array.isArray(existing.sources_json)
          ? existing.sources_json
          : JSON.parse(existing.sources_json as unknown as string) || []

        // Check if GitHub source already exists
        const hasGithubSource = existingSources.some(
          (s: { type: string }) => s.type === 'github_repo'
        )

        if (!hasGithubSource) {
          const updatedSources = [
            ...existingSources,
            {
              type: 'github_repo',
              name: `GitHub (${cleanUsername})`,
              evidence: skill.evidence,
              url: profile.profile_url,
            },
          ]

          await supabase
            .from('user_skills')
            .update({
              sources_json: JSON.stringify(updatedSources),
              confidence: Math.min(1.0, existing.confidence + 0.1),
            })
            .eq('id', existing.id)
        }
      } else {
        await supabase.from('user_skills').insert({
          user_id: user.id,
          skill_name: skill.name,
          category: category as SkillCategory,
          sources_json: sourceJson,
          confidence: skill.confidence,
          verified: false,
        })
      }
    }

    // Update user_profile with GitHub username
    await supabase
      .from('user_profiles')
      .update({ github_username: cleanUsername })
      .eq('user_id', user.id)

    // Track analytics event
    await supabase.from('analytics_events').insert({
      user_id: user.id,
      event_type: 'github_connected',
      event_data: {
        username: cleanUsername,
        repos_count: profile.repos.length,
        languages_count: profile.top_languages.length,
        skills_extracted: extractedSkills.length,
        contribution_score: profile.contribution_score,
      },
    })

    // Fetch final skills list
    const { data: allSkills } = await supabase
      .from('user_skills')
      .select('*')
      .eq('user_id', user.id)
      .order('confidence', { ascending: false })

    return NextResponse.json({
      success: true,
      data: {
        profile,
        extracted_skills: extractedSkills,
        total_skills: allSkills?.length ?? 0,
        all_skills: allSkills ?? [],
      },
      message: `Analyzed ${profile.repos.length} repos and extracted ${extractedSkills.length} skills`,
    } satisfies APIResponse)
  } catch (error) {
    console.error('[GitHub Analyze] Unexpected error:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'An unexpected error occurred',
      } satisfies APIResponse,
      { status: 500 }
    )
  }
}
