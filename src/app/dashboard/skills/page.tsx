'use client'

import React, { useState } from 'react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'

export default function SkillsPage() {
  const [loading, setLoading] = useState(false)
  
  // Mock skills for MVP UI
  const [skills, setSkills] = useState([
    { name: 'TypeScript', category: 'language', confidence: 0.95, verified: true, sources: ['github', 'resume'] },
    { name: 'React', category: 'framework', confidence: 0.90, verified: true, sources: ['github', 'resume'] },
    { name: 'Next.js', category: 'framework', confidence: 0.85, verified: false, sources: ['resume'] },
    { name: 'Python', category: 'language', confidence: 0.70, verified: false, sources: ['github'] },
  ])

  const toggleVerification = (index: number) => {
    const newSkills = [...skills]
    newSkills[index].verified = !newSkills[index].verified
    setSkills(newSkills)
  }

  const handleSyncGithub = async () => {
    setLoading(true)
    setTimeout(() => {
      setLoading(false)
      alert('GitHub synced! (Mock)')
    }, 1500)
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">My Skills</h1>
        <Button variant="secondary" onClick={handleSyncGithub} loading={loading}>
          <span className="mr-2">🔄</span> Sync GitHub
        </Button>
      </div>

      <Card className="p-6 mb-8 border-[var(--accent)] bg-[var(--accent)]/5">
        <div className="flex items-start gap-4">
          <div className="text-3xl">🛡️</div>
          <div>
            <h3 className="text-lg font-semibold mb-1">Knowledge Graph Verification</h3>
            <p className="text-sm text-[var(--text-secondary)]">
              Verify your skills to ensure they are used in AI resume generation. 
              Only verified skills will be included in your generated resumes to prevent hallucinations.
            </p>
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {skills.map((skill, i) => (
          <Card key={i} className={`p-5 transition-colors ${skill.verified ? 'border-[var(--success)]/50' : 'border-[var(--border)]'}`}>
            <div className="flex justify-between items-start mb-3">
              <div>
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  {skill.name}
                  {skill.verified && <span className="text-[var(--success)] text-sm">✓ Verified</span>}
                </h3>
                <p className="text-xs text-[var(--text-muted)] capitalize">{skill.category}</p>
              </div>
              <div className="flex items-center">
                <input 
                  type="checkbox" 
                  className="w-5 h-5 rounded border-gray-300 text-[var(--accent)] focus:ring-[var(--accent)]"
                  checked={skill.verified}
                  onChange={() => toggleVerification(i)}
                />
              </div>
            </div>
            
            <div className="mt-4">
              <div className="flex justify-between text-xs mb-1">
                <span className="text-[var(--text-muted)]">AI Confidence</span>
                <span>{Math.round(skill.confidence * 100)}%</span>
              </div>
              <div className="w-full bg-[var(--bg-secondary)] rounded-full h-1.5">
                <div 
                  className="bg-[var(--accent)] h-1.5 rounded-full" 
                  style={{ width: `${skill.confidence * 100}%` }}
                ></div>
              </div>
            </div>

            <div className="mt-4 flex gap-2">
              {skill.sources.map(source => (
                <Badge key={source} variant={source === 'github' ? 'secondary' : 'default'} className="text-xs">
                  {source === 'github' ? 'Octocat' : '📄'} {source}
                </Badge>
              ))}
            </div>
          </Card>
        ))}
      </div>

      {skills.length === 0 && (
        <Card className="p-12 text-center text-[var(--text-muted)]">
          <div className="text-4xl mb-4">🔍</div>
          <p>No skills detected yet.</p>
          <p className="text-sm mt-2">Upload a resume or sync GitHub to start building your knowledge graph.</p>
        </Card>
      )}
    </div>
  )
}
