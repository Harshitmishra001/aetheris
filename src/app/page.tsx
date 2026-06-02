import React from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Navbar } from '@/components/layout/Navbar'

export default function Home() {
  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--bg-primary)' }}>
      <Navbar />
      
      {/* Hero Section */}
      <section className="relative pt-32 pb-20 overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] opacity-30 blur-[100px] pointer-events-none rounded-full bg-gradient-to-r from-[var(--accent)] to-[var(--success)]" style={{ zIndex: 0 }}></div>
        
        <div className="container relative z-10 mx-auto px-4 text-center max-w-4xl">
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-6 bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">
            Intelligence for Every Career Decision
          </h1>
          
          <p className="text-xl md:text-2xl mb-10 text-[var(--text-secondary)]">
            Aetheris is an AI-powered Career Operating System that transforms verified professional data into personalized resumes, opportunity matching, and application optimization — <span className="text-[var(--accent)] font-semibold">for free</span>.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link href="/signup">
              <Button variant="primary" size="lg" className="w-full sm:w-auto text-lg px-8 py-4 shadow-lg shadow-[var(--accent)]/30">
                Get Started Free
              </Button>
            </Link>
            <Link href="#how-it-works">
              <Button variant="ghost" size="lg" className="w-full sm:w-auto text-lg px-8 py-4">
                See How It Works
              </Button>
            </Link>
          </div>

          <div className="mt-16 flex flex-col md:flex-row justify-center gap-6">
            <Card variant="glass" className="p-4 flex-1 animate-slide-up border-[var(--accent)]/30">
              <div className="text-sm text-[var(--text-muted)] font-medium mb-1">ATS Score</div>
              <div className="text-3xl font-bold text-[var(--success)]">94%</div>
            </Card>
            <Card variant="glass" className="p-4 flex-1 animate-slide-up animation-delay-100 border-[var(--accent)]/30">
              <div className="text-sm text-[var(--text-muted)] font-medium mb-1">Skills Verified</div>
              <div className="text-3xl font-bold text-[var(--accent)]">14/14</div>
            </Card>
            <Card variant="glass" className="p-4 flex-1 animate-slide-up animation-delay-200 border-[var(--accent)]/30">
              <div className="text-sm text-[var(--text-muted)] font-medium mb-1">Generated</div>
              <div className="text-3xl font-bold text-white">&lt; 3s</div>
            </Card>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-[var(--bg-secondary)] relative">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold mb-4">Why ResumeAI?</h2>
            <p className="text-xl text-[var(--text-muted)]">Everything you need to land your next developer role.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="p-8 hover:-translate-y-2 transition-transform duration-300">
              <div className="text-4xl mb-4">🧠</div>
              <h3 className="text-xl font-bold mb-2">ATS Intelligence</h3>
              <p className="text-[var(--text-secondary)]">Our AI analyzes job descriptions and optimizes your resume for Applicant Tracking Systems.</p>
            </Card>
            
            <Card className="p-8 hover:-translate-y-2 transition-transform duration-300">
              <div className="text-4xl mb-4">🛡️</div>
              <h3 className="text-xl font-bold mb-2">Skills Verification</h3>
              <p className="text-[var(--text-secondary)]">Connect GitHub to verify your technical skills. No fake claims, no hallucinations.</p>
            </Card>

            <Card className="p-8 hover:-translate-y-2 transition-transform duration-300">
              <div className="text-4xl mb-4">📄</div>
              <h3 className="text-xl font-bold mb-2">One-Click PDF</h3>
              <p className="text-[var(--text-secondary)]">Generate beautifully formatted, machine-readable PDFs tailored to each job instantly.</p>
            </Card>

            <Card className="p-8 hover:-translate-y-2 transition-transform duration-300">
              <div className="text-4xl mb-4">🔍</div>
              <h3 className="text-xl font-bold mb-2">Resume Diffing</h3>
              <p className="text-[var(--text-secondary)]">See exactly what changed between your resume versions with visual diffs.</p>
            </Card>

            <Card className="p-8 hover:-translate-y-2 transition-transform duration-300">
              <div className="text-4xl mb-4">🕸️</div>
              <h3 className="text-xl font-bold mb-2">Knowledge Graph</h3>
              <p className="text-[var(--text-secondary)]">Every skill on your resume is backed by verifiable evidence from your projects.</p>
            </Card>

            <Card className="p-8 hover:-translate-y-2 transition-transform duration-300">
              <div className="text-4xl mb-4">📈</div>
              <h3 className="text-xl font-bold mb-2">Career Intelligence</h3>
              <p className="text-[var(--text-secondary)]">Track applications, interviews, and offers to optimize your job search workflow.</p>
            </Card>
          </div>
        </div>
      </section>

      {/* How it Works Section */}
      <section id="how-it-works" className="py-20 relative">
        <div className="container mx-auto px-4 max-w-5xl text-center">
          <h2 className="text-3xl md:text-5xl font-bold mb-16">How It Works</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 relative">
            <div className="hidden md:block absolute top-12 left-1/8 right-1/8 h-1 bg-[var(--border)] -z-10 w-[75%] mx-auto"></div>
            
            <div className="flex flex-col items-center">
              <div className="w-24 h-24 rounded-full bg-[var(--bg-secondary)] border border-[var(--border)] flex items-center justify-center text-3xl mb-6 shadow-lg z-10">
                1️⃣
              </div>
              <h4 className="text-lg font-bold mb-2">Upload Profile</h4>
              <p className="text-[var(--text-muted)] text-sm">Upload your base resume and connect your GitHub account.</p>
            </div>
            
            <div className="flex flex-col items-center">
              <div className="w-24 h-24 rounded-full bg-[var(--bg-secondary)] border border-[var(--border)] flex items-center justify-center text-3xl mb-6 shadow-lg z-10">
                2️⃣
              </div>
              <h4 className="text-lg font-bold mb-2">Paste Job</h4>
              <p className="text-[var(--text-muted)] text-sm">Paste the description of the job you want to apply for.</p>
            </div>

            <div className="flex flex-col items-center">
              <div className="w-24 h-24 rounded-full bg-[var(--bg-secondary)] border border-[var(--accent)] flex items-center justify-center text-3xl mb-6 shadow-lg shadow-[var(--accent)]/20 z-10">
                3️⃣
              </div>
              <h4 className="text-lg font-bold mb-2">AI Generates</h4>
              <p className="text-[var(--text-muted)] text-sm">Our AI tailors your resume content strictly using verified skills.</p>
            </div>

            <div className="flex flex-col items-center">
              <div className="w-24 h-24 rounded-full bg-[var(--bg-secondary)] border border-[var(--success)] flex items-center justify-center text-3xl mb-6 shadow-lg shadow-[var(--success)]/20 z-10">
                4️⃣
              </div>
              <h4 className="text-lg font-bold mb-2">Download PDF</h4>
              <p className="text-[var(--text-muted)] text-sm">Get an ATS-optimized PDF ready for your application.</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-[var(--bg-primary)] to-[var(--bg-secondary)]"></div>
        <div className="container relative z-10 mx-auto px-4 max-w-4xl text-center">
          <Card variant="glass" className="p-12 border-[var(--accent)]/50 shadow-2xl shadow-[var(--accent)]/10">
            <h2 className="text-3xl md:text-5xl font-bold mb-6">Start Building Better Resumes</h2>
            <p className="text-xl text-[var(--text-muted)] mb-8">Free forever. No credit card required.</p>
            <Link href="/signup">
              <Button variant="primary" size="lg" className="text-lg px-12 py-4">
                Create Free Account
              </Button>
            </Link>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[var(--border)] py-8 mt-12 bg-[var(--bg-primary)] text-center text-[var(--text-muted)]">
        <div className="container mx-auto px-4">
          <p>© {new Date().getFullYear()} ResumeAI. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}
