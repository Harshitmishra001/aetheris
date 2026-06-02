import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { generateJSON, generateEmbedding } from '@/lib/ai/gemini'
import { cachedGenerate, hashPrompt } from '@/lib/ai/cache'
import {
  extractSkillsFromJDPrompt,
  generateATSReportPrompt,
} from '@/lib/ai/prompts'
import type { APIResponse, ATSReport, UserSkill } from '@/lib/types'

interface AnalyzeRequest {
  description: string
  company_name?: string
  title?: string
}

interface JDSkills {
  required_skills: string[]
  preferred_skills: string[]
  keywords: string[]
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

    // Check subscription limits
    const { data: subscription } = await supabase
      .from('user_subscriptions')
      .select('*')
      .eq('user_id', user.id)
      .single()

    if (subscription) {
      const { plan, analyses_used, period_end } = subscription

      // Reset usage if period has expired
      if (new Date(period_end) < new Date()) {
        await supabase
          .from('user_subscriptions')
          .update({
            analyses_used: 0,
            period_start: new Date().toISOString(),
            period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
          })
          .eq('user_id', user.id)
      } else {
        // Check limits for free tier
        const limits = { free: 10, pro: -1, premium: -1 }
        const limit = limits[plan as keyof typeof limits] ?? 10
        if (limit !== -1 && analyses_used >= limit) {
          return NextResponse.json(
            {
              success: false,
              error: `Monthly analysis limit reached (${limit}). Upgrade your plan for unlimited analyses.`,
            } satisfies APIResponse,
            { status: 429 }
          )
        }
      }
    }

    // Parse request
    const body: AnalyzeRequest = await request.json()
    const { description, company_name, title } = body

    if (!description || description.trim().length < 50) {
      return NextResponse.json(
        {
          success: false,
          error: 'Job description must be at least 50 characters',
        } satisfies APIResponse,
        { status: 400 }
      )
    }

    // Step 1: Extract skills from JD (with caching)
    const jdCacheKey = `jd_skills_${hashPrompt(description)}`
    const jdSkillsRaw = await cachedGenerate(
      jdCacheKey,
      description,
      async () => {
        const prompt = extractSkillsFromJDPrompt(description)
        const result = await generateJSON<JDSkills>(prompt)
        return JSON.stringify(result)
      }
    )

    const jdSkills: JDSkills = JSON.parse(jdSkillsRaw)

    // Step 2: Fetch user's verified skills
    const { data: userSkillsData } = await supabase
      .from('user_skills')
      .select('skill_name, verified')
      .eq('user_id', user.id)

    const userSkills = (userSkillsData as Pick<UserSkill, 'skill_name' | 'verified'>[] | null) ?? []
    const verifiedSkillNames = userSkills
      .filter((s) => s.verified)
      .map((s) => s.skill_name)
    const allSkillNames = userSkills.map((s) => s.skill_name)

    // Step 3: Generate ATS report (with caching)
    const reportCacheKey = `ats_report_${hashPrompt(
      JSON.stringify(jdSkills) + JSON.stringify(verifiedSkillNames.sort())
    )}`

    const atsReportRaw = await cachedGenerate(
      reportCacheKey,
      JSON.stringify({ jdSkills, verifiedSkillNames }),
      async () => {
        const prompt = generateATSReportPrompt(
          {
            required: jdSkills.required_skills,
            preferred: jdSkills.preferred_skills,
            keywords: jdSkills.keywords,
          },
          allSkillNames.length > 0 ? allSkillNames : verifiedSkillNames
        )
        const result = await generateJSON<ATSReport>(prompt)
        return JSON.stringify(result)
      }
    )

    const atsReport: ATSReport = JSON.parse(atsReportRaw)

    // Step 4: Generate embedding for the JD (for future similarity search)
    let embedding: number[] | null = null
    try {
      embedding = await generateEmbedding(description.substring(0, 5000))
    } catch (err) {
      console.warn('[Job Analyze] Embedding generation failed (non-critical):', err)
    }

    // Step 5: Save job to database
    const allExtractedSkills = [
      ...jdSkills.required_skills,
      ...jdSkills.preferred_skills,
    ]

    const { data: job, error: dbError } = await supabase
      .from('jobs')
      .insert({
        user_id: user.id,
        company_name: company_name ?? '',
        title: title ?? '',
        description,
        extracted_skills: allExtractedSkills,
        embedding: embedding ? JSON.stringify(embedding) : null,
        ats_report: atsReport,
      })
      .select()
      .single()

    if (dbError) {
      console.error('[Job Analyze] Database error:', dbError.message)
      return NextResponse.json(
        { success: false, error: 'Failed to save job analysis' } satisfies APIResponse,
        { status: 500 }
      )
    }

    // Step 6: Increment analyses_used
    if (subscription) {
      await supabase
        .from('user_subscriptions')
        .update({ analyses_used: (subscription.analyses_used ?? 0) + 1 })
        .eq('user_id', user.id)
    }

    // Step 7: Track analytics
    await supabase.from('analytics_events').insert({
      user_id: user.id,
      event_type: 'job_analyzed',
      event_data: {
        job_id: job.id,
        company_name: company_name ?? '',
        overall_score: atsReport.overall_score,
        skills_matched: atsReport.keyword_match.matched.length,
        skills_missing: atsReport.keyword_match.missing.length,
      },
    })

    return NextResponse.json({
      success: true,
      data: {
        job_id: job.id,
        jd_skills: jdSkills,
        ats_report: atsReport,
      },
      message: 'Job analyzed successfully',
    } satisfies APIResponse)
  } catch (error) {
    console.error('[Job Analyze] Unexpected error:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'An unexpected error occurred',
      } satisfies APIResponse,
      { status: 500 }
    )
  }
}
