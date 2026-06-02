import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import type { APIResponse } from '@/lib/types'

interface VerifySkill {
  skill_name: string
  verified: boolean
}

interface VerifyRequest {
  skills: VerifySkill[]
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

    const body: VerifyRequest = await request.json()
    const { skills } = body

    if (!skills || !Array.isArray(skills) || skills.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: 'skills array is required and must not be empty',
        } satisfies APIResponse,
        { status: 400 }
      )
    }

    // Validate each skill entry
    for (const skill of skills) {
      if (!skill.skill_name || typeof skill.verified !== 'boolean') {
        return NextResponse.json(
          {
            success: false,
            error: 'Each skill must have a skill_name (string) and verified (boolean)',
          } satisfies APIResponse,
          { status: 400 }
        )
      }
    }

    // Update each skill's verified status
    const updateResults: { skill_name: string; updated: boolean }[] = []

    for (const skill of skills) {
      const { error } = await supabase
        .from('user_skills')
        .update({ verified: skill.verified })
        .eq('user_id', user.id)
        .eq('skill_name', skill.skill_name)

      updateResults.push({
        skill_name: skill.skill_name,
        updated: !error,
      })

      if (error) {
        console.warn(
          `[Skills Verify] Failed to update "${skill.skill_name}":`,
          error.message
        )
      }
    }

    const successCount = updateResults.filter((r) => r.updated).length
    const failedSkills = updateResults
      .filter((r) => !r.updated)
      .map((r) => r.skill_name)

    // Track analytics event
    await supabase.from('analytics_events').insert({
      user_id: user.id,
      event_type: 'skills_verified',
      event_data: {
        total: skills.length,
        verified_true: skills.filter((s) => s.verified).length,
        verified_false: skills.filter((s) => !s.verified).length,
      },
    })

    // Fetch updated skills list
    const { data: updatedSkills } = await supabase
      .from('user_skills')
      .select('*')
      .eq('user_id', user.id)
      .order('verified', { ascending: false })
      .order('confidence', { ascending: false })

    return NextResponse.json({
      success: true,
      data: {
        updated: successCount,
        failed: failedSkills,
        skills: updatedSkills ?? [],
      },
      message: `Updated ${successCount}/${skills.length} skills`,
    } satisfies APIResponse)
  } catch (error) {
    console.error('[Skills Verify] Unexpected error:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'An unexpected error occurred',
      } satisfies APIResponse,
      { status: 500 }
    )
  }
}
