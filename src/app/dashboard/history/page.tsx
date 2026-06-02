'use client'

import React from 'react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'

export default function HistoryPage() {
  const mockHistory = [
    { id: 1, company: 'Google', role: 'Frontend Engineer', date: 'Oct 24, 2023', score: 92, status: 'applied' },
    { id: 2, company: 'Stripe', role: 'Full Stack Developer', date: 'Oct 20, 2023', score: 88, status: 'draft' },
    { id: 3, company: 'Vercel', role: 'Software Engineer', date: 'Oct 15, 2023', score: 95, status: 'interview' },
  ]

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Resume History</h1>
      </div>

      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[var(--bg-secondary)] border-b" style={{ borderColor: 'var(--border)' }}>
                <th className="p-4 font-semibold text-sm">Role & Company</th>
                <th className="p-4 font-semibold text-sm">Date Generated</th>
                <th className="p-4 font-semibold text-sm text-center">ATS Score</th>
                <th className="p-4 font-semibold text-sm text-center">Status</th>
                <th className="p-4 font-semibold text-sm text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {mockHistory.map((item) => (
                <tr key={item.id} className="border-b last:border-0 hover:bg-[var(--bg-secondary)] transition-colors" style={{ borderColor: 'var(--border)' }}>
                  <td className="p-4">
                    <div className="font-semibold">{item.role}</div>
                    <div className="text-sm text-[var(--text-muted)]">{item.company}</div>
                  </td>
                  <td className="p-4 text-sm text-[var(--text-muted)]">
                    {item.date}
                  </td>
                  <td className="p-4 text-center">
                    <span className={`inline-flex items-center justify-center w-8 h-8 rounded-full text-sm font-bold ${
                      item.score >= 90 ? 'bg-[var(--success)]/10 text-[var(--success)]' :
                      item.score >= 80 ? 'bg-[var(--warning)]/10 text-[var(--warning)]' :
                      'bg-[var(--error)]/10 text-[var(--error)]'
                    }`}>
                      {item.score}
                    </span>
                  </td>
                  <td className="p-4 text-center">
                    <Badge variant={
                      item.status === 'interview' ? 'success' :
                      item.status === 'applied' ? 'secondary' : 'default'
                    }>
                      {item.status}
                    </Badge>
                  </td>
                  <td className="p-4 text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="ghost" size="sm">📄 PDF</Button>
                      <Button variant="ghost" size="sm">⚙️ Edit</Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}
