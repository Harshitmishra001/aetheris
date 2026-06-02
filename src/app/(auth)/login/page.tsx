'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { Card } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const supabase = createClient()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })
      
      if (error) throw error
      
      router.push('/dashboard')
      router.refresh()
    } catch (err: any) {
      setError(err.message || 'Failed to log in')
    } finally {
      setLoading(false)
    }
  }

  const handleGithubLogin = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'github',
        options: {
          redirectTo: `${window.location.origin}/api/auth/callback`
        }
      })
      if (error) throw error
    } catch (err: any) {
      setError(err.message || 'Failed to log in with GitHub')
    }
  }

  return (
    <Card variant="glass" className="p-8">
      <div className="mb-8 text-center">
        <h1 className="text-2xl font-bold mb-2">Welcome Back</h1>
        <p style={{ color: 'var(--text-muted)' }}>Log in to access your resumes</p>
      </div>

      {error && (
        <div className="mb-4 p-3 rounded text-sm" style={{ backgroundColor: 'var(--error)', color: 'white' }}>
          {error}
        </div>
      )}

      <form onSubmit={handleLogin} className="space-y-4">
        <Input 
          label="Email" 
          type="email" 
          value={email} 
          onChange={(e) => setEmail(e.target.value)} 
          required 
        />
        <Input 
          label="Password" 
          type="password" 
          value={password} 
          onChange={(e) => setPassword(e.target.value)} 
          required 
        />
        
        <div className="flex justify-end">
          <Link href="/forgot-password" style={{ color: 'var(--accent)', fontSize: '0.875rem' }}>
            Forgot password?
          </Link>
        </div>

        <Button type="submit" variant="primary" className="w-full" loading={loading}>
          Log In
        </Button>
      </form>

      <div className="mt-6">
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t" style={{ borderColor: 'var(--border)' }}></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2" style={{ backgroundColor: 'var(--bg-elevated)', color: 'var(--text-muted)' }}>
              Or continue with
            </span>
          </div>
        </div>

        <div className="mt-6">
          <Button variant="secondary" className="w-full" onClick={handleGithubLogin}>
            GitHub
          </Button>
        </div>
      </div>

      <div className="mt-6 text-center text-sm" style={{ color: 'var(--text-muted)' }}>
        Don't have an account?{' '}
        <Link href="/signup" style={{ color: 'var(--accent)' }} className="font-semibold">
          Sign up
        </Link>
      </div>
    </Card>
  )
}
