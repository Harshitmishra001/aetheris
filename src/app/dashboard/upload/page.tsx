'use client'

import React, { useState } from 'react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'

export default function UploadPage() {
  const [file, setFile] = useState<File | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [uploading, setUploading] = useState(false)

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = () => {
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      setFile(e.dataTransfer.files[0])
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0])
    }
  }

  const handleUpload = async () => {
    if (!file) return
    setUploading(true)
    
    // Simulate upload delay for MVP
    setTimeout(() => {
      setUploading(false)
      alert('Resume uploaded successfully! (Mock)')
      setFile(null)
    }, 1500)
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Upload Resume</h1>
      
      <Card className="p-8">
        <div 
          className={`border-2 border-dashed rounded-lg p-12 text-center transition-colors ${isDragging ? 'border-[var(--accent)] bg-[var(--accent)]/10' : 'border-[var(--border)]'}`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <div className="text-5xl mb-4">📄</div>
          <h3 className="text-xl font-semibold mb-2">Drag and drop your resume here</h3>
          <p className="text-[var(--text-muted)] mb-6">Supports PDF and DOCX formats up to 5MB</p>
          
          <input 
            type="file" 
            id="file-upload" 
            className="hidden" 
            accept=".pdf,.docx" 
            onChange={handleFileChange}
          />
          <Button variant="secondary" onClick={() => document.getElementById('file-upload')?.click()}>
            Browse Files
          </Button>
        </div>
      </Card>

      {file && (
        <Card className="p-6 flex items-center justify-between border-[var(--accent)]">
          <div className="flex items-center">
            <div className="text-2xl mr-4">📄</div>
            <div>
              <p className="font-semibold">{file.name}</p>
              <p className="text-sm text-[var(--text-muted)]">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="ghost" onClick={() => setFile(null)}>Cancel</Button>
            <Button variant="primary" onClick={handleUpload} loading={uploading}>Upload & Extract</Button>
          </div>
        </Card>
      )}

      <div className="mt-8">
        <h2 className="text-xl font-semibold mb-4">Uploaded Resumes</h2>
        <Card className="p-6 text-center text-[var(--text-muted)]">
          No resumes uploaded yet.
        </Card>
      </div>
    </div>
  )
}
