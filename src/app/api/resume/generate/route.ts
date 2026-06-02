import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { generateJSON } from '@/lib/ai/gemini'
import { cachedGenerate, hashPrompt } from '@/lib/ai/cache'
import { generateResumePrompt } from '@/lib/ai/prompts'
import type {
  APIResponse,
  ResumeContent,
  ResumeChanges,
  ATSReport,
  UserProfile,
  UserSkill,
  Job,
  PLAN_LIMITS,
} from '@/lib/types'

interface GenerateRequest {
  job_id: string
  resume_id?: string
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
      const { plan, resumes_used, period_end } = subscription

      // Reset usage if period has expired
      if (new Date(period_end) < new Date()) {
        await supabase
          .from('user_subscriptions')
          .update({
            resumes_used: 0,
            period_start: new Date().toISOString(),
            period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
          })
          .eq('user_id', user.id)
      } else {
        const limits = { free: 5, pro: -1, premium: -1 }
        const limit = limits[plan as keyof typeof limits] ?? 5
        if (limit !== -1 && resumes_used >= limit) {
          return NextResponse.json(
            {
              success: false,
              error: `Monthly resume generation limit reached (${limit}). Upgrade your plan for unlimited generations.`,
            } satisfies APIResponse,
            { status: 429 }
          )
        }
      }
    }

    // Parse request
    const body: GenerateRequest = await request.json()
    const { job_id, resume_id } = body

    if (!job_id) {
      return NextResponse.json(
        { success: false, error: 'job_id is required' } satisfies APIResponse,
        { status: 400 }
      )
    }

    // Fetch job data (includes ATS report)
    const { data: job, error: jobError } = await supabase
      .from('jobs')
      .select('*')
      .eq('id', job_id)
      .eq('user_id', user.id)
      .single()

    if (jobError || !job) {
      return NextResponse.json(
        { success: false, error: 'Job not found' } satisfies APIResponse,
        { status: 404 }
      )
    }

    const typedJob = job as Job

    if (!typedJob.ats_report) {
      return NextResponse.json(
        {
          success: false,
          error: 'Job has not been analyzed yet. Run /api/job/analyze first.',
        } satisfies APIResponse,
        { status: 400 }
      )
    }

    // Fetch user profile
    const { data: profile, error: profileError } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('user_id', user.id)
      .single()

    if (profileError || !profile) {
      return NextResponse.json(
        { success: false, error: 'User profile not found' } satisfies APIResponse,
        { status: 404 }
      )
    }

    const typedProfile = profile as UserProfile

    // Fetch ONLY verified skills (anti-hallucination: never use unverified skills)
    const { data: skillsData } = await supabase
      .from('user_skills')
      .select('skill_name')
      .eq('user_id', user.id)
      .eq('verified', true)

    const verifiedSkills = (skillsData as Pick<UserSkill, 'skill_name'>[] | null)?.map(
      (s) => s.skill_name
    ) ?? []

    // Fetch existing resume text if resume_id provided
    let existingResumeText: string | null = null
    if (resume_id) {
      const { data: resume } = await supabase
        .from('resumes')
        .select('parsed_text')
        .eq('id', resume_id)
        .eq('user_id', user.id)
        .single()

      existingResumeText = resume?.parsed_text ?? null
    }

    // Generate resume content using AI (with caching)
    const atsReport = typedJob.ats_report as ATSReport
    const cacheKey = `resume_gen_${hashPrompt(
      JSON.stringify({
        profileId: user.id,
        jobId: job_id,
        skills: verifiedSkills.sort(),
        resumeId: resume_id ?? 'none',
      })
    )}`

    const resumeContentRaw = await cachedGenerate(
      cacheKey,
      `resume_for_${job_id}`,
      async () => {
        const prompt = generateResumePrompt(
          {
            full_name: typedProfile.full_name,
            email: typedProfile.email,
            location: typedProfile.location,
            experience_years: typedProfile.experience_years,
            github_username: typedProfile.github_username,
          },
          verifiedSkills,
          typedJob.description,
          {
            keyword_match: atsReport.keyword_match,
            recommendations: atsReport.recommendations,
          },
          existingResumeText
        )
        const result = await generateJSON<ResumeContent>(prompt)
        return JSON.stringify(result)
      }
    )

    const resumeContent: ResumeContent = JSON.parse(resumeContentRaw)

    // Calculate changes_json by comparing with previous version
    let changesJson: ResumeChanges | null = null
    const { data: previousVersions } = await supabase
      .from('resume_versions')
      .select('content_json')
      .eq('job_id', job_id)
      .order('generated_at', { ascending: false })
      .limit(1)

    if (previousVersions && previousVersions.length > 0) {
      const prevContent = previousVersions[0].content_json as ResumeContent
      changesJson = computeChanges(prevContent, resumeContent)
    }

    // Save resume version
    const { data: version, error: versionError } = await supabase
      .from('resume_versions')
      .insert({
        resume_id: resume_id ?? null,
        job_id,
        ats_score: atsReport.overall_score,
        content_json: resumeContent,
        changes_json: changesJson,
      })
      .select()
      .single()

    if (versionError) {
      console.error('[Resume Generate] Database error:', versionError.message)
      return NextResponse.json(
        { success: false, error: 'Failed to save resume version' } satisfies APIResponse,
        { status: 500 }
      )
    }

    // Increment resumes_used
    if (subscription) {
      await supabase
        .from('user_subscriptions')
        .update({ resumes_used: (subscription.resumes_used ?? 0) + 1 })
        .eq('user_id', user.id)
    }

    // Track analytics event
    await supabase.from('analytics_events').insert({
      user_id: user.id,
      event_type: 'resume_generated',
      event_data: {
        version_id: version.id,
        job_id,
        ats_score: atsReport.overall_score,
        verified_skills_count: verifiedSkills.length,
      },
    })

    return NextResponse.json({
      success: true,
      data: {
        version_id: version.id,
        content: resumeContent,
        ats_score: atsReport.overall_score,
        changes: changesJson,
      },
      message: 'Resume generated successfully',
    } satisfies APIResponse)
  } catch (error) {
    console.error('[Resume Generate] Unexpected error:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'An unexpected error occurred',
      } satisfies APIResponse,
      { status: 500 }
    )
  }
}

/**
 * Compute a simple diff between previous and new resume content.
 */
function computeChanges(
  prev: ResumeContent,
  next: ResumeContent
): ResumeChanges {
  const added: string[] = []
  const removed: string[] = []
  const changed: { from: string; to: string }[] = []

  // Compare summaries
  if (prev.summary !== next.summary) {
    changed.push({ from: prev.summary, to: next.summary })
  }

  // Compare skills
  const prevSkillItems = new Set(prev.skills.flatMap((s) => s.items))
  const nextSkillItems = new Set(next.skills.flatMap((s) => s.items))

  for (const skill of nextSkillItems) {
    if (!prevSkillItems.has(skill)) {
      added.push(`Skill: ${skill}`)
    }
  }
  for (const skill of prevSkillItems) {
    if (!nextSkillItems.has(skill)) {
      removed.push(`Skill: ${skill}`)
    }
  }

  // Compare experience entries
  const prevExpTitles = new Set(prev.experience.map((e) => `${e.title} @ ${e.company}`))
  const nextExpTitles = new Set(next.experience.map((e) => `${e.title} @ ${e.company}`))

  for (const title of nextExpTitles) {
    if (!prevExpTitles.has(title)) {
      added.push(`Experience: ${title}`)
    }
  }
  for (const title of prevExpTitles) {
    if (!nextExpTitles.has(title)) {
      removed.push(`Experience: ${title}`)
    }
  }

  // Compare projects
  const prevProjNames = new Set(prev.projects.map((p) => p.name))
  const nextProjNames = new Set(next.projects.map((p) => p.name))

  for (const name of nextProjNames) {
    if (!prevProjNames.has(name)) {
      added.push(`Project: ${name}`)
    }
  }
  for (const name of prevProjNames) {
    if (!nextProjNames.has(name)) {
      removed.push(`Project: ${name}`)
    }
  }

  return { added, removed, changed }
}
