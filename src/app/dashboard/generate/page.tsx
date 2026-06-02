'use client'

import React, { useState } from 'react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'

export default function GeneratePage() {
  const [jobDescription, setJobDescription] = useState('')
  const [analyzing, setAnalyzing] = useState(false)
  const [generating, setGenerating] = useState(false)
  const [atsReport, setAtsReport] = useState<any>(null)

  const handleAnalyze = () => {
    if (!jobDescription.trim()) return
    setAnalyzing(true)
    
    // Mock analysis
    setTimeout(() => {
      setAnalyzing(false)
      setAtsReport({
        score: 75,
        matched: ['React', 'TypeScript', 'Node.js'],
        missing: ['GraphQL', 'AWS', 'Docker'],
        recommendations: [
          'Add a project highlighting GraphQL experience if you have it.',
          'Emphasize your backend deployment experience.'
        ]
      })
    }, 2000)
  }

  const handleGenerate = () => {
    setGenerating(true)
    
    // Mock generation
    setTimeout(() => {
      setGenerating(false)
      alert('Resume generated successfully! (Mock)')
    }, 3000)
  }

  return (
    <div className="h-full flex flex-col md:flex-row gap-6">
      {/* Left Panel: Input & Analysis */}
      <div className="w-full md:w-1/2 flex flex-col gap-6">
        <Card className="p-6 flex-1 flex flex-col">
          <h2 className="text-xl font-bold mb-4">Job Description</h2>
          <textarea 
            className="flex-1 w-full p-4 rounded-md border bg-transparent resize-none focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
            style={{ borderColor: 'var(--border)' }}
            placeholder="Paste the job description here..."
            value={jobDescription}
            onChange={(e) => setJobDescription(e.target.value)}
          />
          <div className="mt-4 flex justify-end">
            <Button 
              variant="primary" 
              onClick={handleAnalyze} 
              loading={analyzing}
              disabled={!jobDescription.trim() || analyzing}
            >
              Analyze Requirements
            </Button>
          </div>
        </Card>

        {atsReport && (
          <Card className="p-6 animate-fade-in border-[var(--accent)]">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">ATS Analysis Report</h2>
              <div className="text-2xl font-bold text-[var(--accent)]">{atsReport.score}%</div>
            </div>

            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-semibold text-[var(--success)] mb-2">Matched Keywords</h3>
                <div className="flex flex-wrap gap-2">
                  {atsReport.matched.map((kw: string) => (
                    <Badge key={kw} variant="success">{kw}</Badge>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-sm font-semibold text-[var(--error)] mb-2">Missing Keywords</h3>
                <div className="flex flex-wrap gap-2">
                  {atsReport.missing.map((kw: string) => (
                    <Badge key={kw} variant="error">{kw}</Badge>
                  ))}
                </div>
              </div>

              <div className="pt-4 border-t" style={{ borderColor: 'var(--border)' }}>
                <Button 
                  variant="primary" 
                  className="w-full" 
                  onClick={handleGenerate}
                  loading={generating}
                >
                  Generate Tailored Resume
                </Button>
              </div>
            </div>
          </Card>
        )}
      </div>

      {/* Right Panel: Preview */}
      <div className="w-full md:w-1/2">
        <Card className="h-full min-h-[600px] p-0 overflow-hidden flex flex-col bg-gray-50 dark:bg-gray-900 border-[var(--border)]">
          <div className="p-3 border-b bg-[var(--bg-secondary)] flex justify-between items-center" style={{ borderColor: 'var(--border)' }}>
            <span className="text-sm font-medium">PDF Preview</span>
            <Button variant="ghost" size="sm" disabled={!atsReport}>Download PDF</Button>
          </div>
          
          <div className="flex-1 flex items-center justify-center p-8">
            {!atsReport ? (
              <div className="text-center text-[var(--text-muted)]">
                <div className="text-5xl mb-4">📄</div>
                <p>Analyze a job description to generate a tailored resume</p>
              </div>
            ) : generating ? (
              <div className="text-center">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--accent)] mb-4"></div>
                <p className="text-[var(--text-muted)]">Crafting your perfect resume...</p>
              </div>
            ) : (
              <div className="w-full h-full max-w-md bg-white shadow-xl rounded aspect-[1/1.4] p-8 text-black opacity-90 transition-opacity">
                {/* Mock PDF Content */}
                <div className="border-b-2 border-black pb-2 mb-4">
                  <h1 className="text-2xl font-bold uppercase text-center">John Doe</h1>
                  <p className="text-xs text-center mt-1">john.doe@example.com | github.com/johndoe</p>
                </div>
                
                <div className="mb-4">
                  <h2 className="text-sm font-bold uppercase border-b border-gray-400 mb-2">Summary</h2>
                  <p className="text-xs leading-relaxed">Highly motivated software engineer with experience in React and Node.js. Proven ability to deliver scalable web applications.</p>
                </div>

                <div className="mb-4">
                  <h2 className="text-sm font-bold uppercase border-b border-gray-400 mb-2">Experience</h2>
                  <div className="mb-2">
                    <div className="flex justify-between text-xs font-bold">
                      <span>Frontend Developer</span>
                      <span>2021 - Present</span>
                    </div>
                    <p className="text-xs italic">Tech Corp Inc.</p>
                    <ul className="list-disc list-inside text-xs mt-1 space-y-1">
                      <li>Developed responsive UI using React and TypeScript.</li>
                      <li>Improved page load speed by 30%.</li>
                    </ul>
                  </div>
                </div>
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  )
}
