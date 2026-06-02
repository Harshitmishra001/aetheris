'use client'

import React from 'react'
import { Card } from '@/components/ui/Card'
import Link from 'next/link'

export default function DashboardOverview() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold mb-6">Dashboard</h1>
      
      {/* Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-6">
          <h3 className="text-sm font-medium text-[var(--text-muted)]">Resumes Generated</h3>
          <p className="text-3xl font-bold mt-2">0</p>
        </Card>
        <Card className="p-6">
          <h3 className="text-sm font-medium text-[var(--text-muted)]">Average ATS Score</h3>
          <p className="text-3xl font-bold mt-2 text-[var(--accent)]">--</p>
        </Card>
        <Card className="p-6">
          <h3 className="text-sm font-medium text-[var(--text-muted)]">Jobs Analyzed</h3>
          <p className="text-3xl font-bold mt-2">0</p>
        </Card>
        <Card className="p-6">
          <h3 className="text-sm font-medium text-[var(--text-muted)]">Verified Skills</h3>
          <p className="text-3xl font-bold mt-2 text-[var(--success)]">0</p>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="mt-8">
        <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link href="/dashboard/upload">
            <Card variant="glass" className="p-6 hover:-translate-y-1 transition-transform cursor-pointer h-full border border-[var(--border)] hover:border-[var(--accent)]">
              <div className="text-4xl mb-4">📄</div>
              <h3 className="text-lg font-semibold mb-2">Upload Base Resume</h3>
              <p className="text-sm text-[var(--text-muted)]">Start by uploading your current resume or LinkedIn PDF.</p>
            </Card>
          </Link>
          
          <Link href="/dashboard/skills">
            <Card variant="glass" className="p-6 hover:-translate-y-1 transition-transform cursor-pointer h-full border border-[var(--border)] hover:border-[var(--success)]">
              <div className="text-4xl mb-4">🛠️</div>
              <h3 className="text-lg font-semibold mb-2">Verify Skills</h3>
              <p className="text-sm text-[var(--text-muted)]">Connect GitHub and verify extracted skills for ATS matching.</p>
            </Card>
          </Link>

          <Link href="/dashboard/generate">
            <Card variant="glass" className="p-6 hover:-translate-y-1 transition-transform cursor-pointer h-full border border-[var(--border)] hover:border-[var(--warning)]">
              <div className="text-4xl mb-4">✨</div>
              <h3 className="text-lg font-semibold mb-2">Generate Tailored Resume</h3>
              <p className="text-sm text-[var(--text-muted)]">Paste a job description and generate an ATS-optimized PDF.</p>
            </Card>
          </Link>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="mt-8">
        <h2 className="text-xl font-semibold mb-4">Recent Activity</h2>
        <Card className="p-8 text-center text-[var(--text-muted)]">
          No activity yet. Upload a resume to get started!
        </Card>
      </div>
    </div>
  )
}
