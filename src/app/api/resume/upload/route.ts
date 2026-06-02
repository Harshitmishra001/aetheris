import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import type { APIResponse, Resume } from '@/lib/types'

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

    // Parse multipart form data
    const formData = await request.formData()
    const file = formData.get('file') as File | null

    if (!file) {
      return NextResponse.json(
        { success: false, error: 'No file provided' } satisfies APIResponse,
        { status: 400 }
      )
    }

    // Validate file type
    if (file.type !== 'application/pdf') {
      return NextResponse.json(
        { success: false, error: 'Only PDF files are accepted' } satisfies APIResponse,
        { status: 400 }
      )
    }

    // Validate file size (10MB max)
    const MAX_SIZE = 10 * 1024 * 1024
    if (file.size > MAX_SIZE) {
      return NextResponse.json(
        { success: false, error: 'File size must be under 10MB' } satisfies APIResponse,
        { status: 400 }
      )
    }

    // Generate a unique file path
    const timestamp = Date.now()
    const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_')
    const filePath = `${user.id}/${timestamp}_${safeName}`

    // Upload to Supabase Storage
    const fileBuffer = await file.arrayBuffer()
    const { error: uploadError } = await supabase.storage
      .from('resumes')
      .upload(filePath, fileBuffer, {
        contentType: 'application/pdf',
        upsert: false,
      })

    if (uploadError) {
      console.error('[Resume Upload] Storage error:', uploadError.message)
      return NextResponse.json(
        { success: false, error: 'Failed to upload file' } satisfies APIResponse,
        { status: 500 }
      )
    }

    // Get public URL
    const {
      data: { publicUrl },
    } = supabase.storage.from('resumes').getPublicUrl(filePath)

    // Save resume record to database
    // For MVP, parsed_text is null — extraction happens via /api/skills/extract
    const { data: resume, error: dbError } = await supabase
      .from('resumes')
      .insert({
        user_id: user.id,
        file_url: publicUrl,
        file_name: file.name,
        parsed_text: null,
      })
      .select()
      .single()

    if (dbError) {
      console.error('[Resume Upload] Database error:', dbError.message)
      return NextResponse.json(
        { success: false, error: 'Failed to save resume record' } satisfies APIResponse,
        { status: 500 }
      )
    }

    // Track analytics event
    await supabase.from('analytics_events').insert({
      user_id: user.id,
      event_type: 'resume_uploaded',
      event_data: {
        resume_id: resume.id,
        file_name: file.name,
        file_size: file.size,
      },
    })

    return NextResponse.json({
      success: true,
      data: resume as Resume,
      message: 'Resume uploaded successfully',
    } satisfies APIResponse<Resume>)
  } catch (error) {
    console.error('[Resume Upload] Unexpected error:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'An unexpected error occurred',
      } satisfies APIResponse,
      { status: 500 }
    )
  }
}
