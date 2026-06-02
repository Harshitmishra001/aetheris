'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ThemeToggle } from '@/components/layout/ThemeToggle'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const navItems = [
    { name: 'Overview', href: '/dashboard', icon: '📊' },
    { name: 'Upload Resume', href: '/dashboard/upload', icon: '📄' },
    { name: 'My Skills', href: '/dashboard/skills', icon: '🛠️' },
    { name: 'Generate Resume', href: '/dashboard/generate', icon: '✨' },
    { name: 'History', href: '/dashboard/history', icon: '🕒' },
  ]

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/')
  }

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: 'var(--bg-primary)' }}>
      {/* Sidebar */}
      <aside className={`w-64 flex-shrink-0 flex flex-col border-r transition-transform duration-300 ease-in-out ${isMobileMenuOpen ? 'translate-x-0 absolute z-50 h-full bg-[var(--bg-elevated)]' : '-translate-x-full md:relative md:translate-x-0'}`} style={{ borderColor: 'var(--border)', backgroundColor: 'var(--bg-elevated)' }}>
        <div className="h-16 flex items-center px-6 border-b" style={{ borderColor: 'var(--border)' }}>
          <Link href="/" className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-[var(--accent)] to-[var(--success)]">
            Aetheris
          </Link>
        </div>

        <nav className="flex-1 overflow-y-auto py-4">
          <ul className="space-y-1 px-3">
            {navItems.map((item) => {
              const isActive = pathname === item.href
              return (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    className={`flex items-center px-3 py-2 rounded-md transition-colors ${
                      isActive 
                        ? 'bg-[var(--accent)] bg-opacity-20 text-[var(--accent)]' 
                        : 'text-[var(--text-secondary)] hover:bg-[var(--bg-secondary)] hover:text-[var(--text-primary)]'
                    }`}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <span className="mr-3">{item.icon}</span>
                    {item.name}
                  </Link>
                </li>
              )
            })}
          </ul>
        </nav>

        <div className="p-4 border-t" style={{ borderColor: 'var(--border)' }}>
          <div className="flex items-center justify-between mb-4">
            <ThemeToggle />
          </div>
          <button 
            onClick={handleSignOut}
            className="w-full text-left px-3 py-2 text-sm text-[var(--error)] rounded-md hover:bg-[var(--bg-secondary)] transition-colors"
          >
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header className="h-16 flex items-center justify-between px-4 border-b md:hidden" style={{ borderColor: 'var(--border)', backgroundColor: 'var(--bg-elevated)' }}>
          <button 
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-2 text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
          >
            ☰
          </button>
          <span className="font-semibold">Dashboard</span>
          <div className="w-8"></div> {/* Placeholder for balance */}
        </header>

        <main className="flex-1 overflow-y-auto p-4 md:p-8">
          <div className="max-w-6xl mx-auto">
            {children}
          </div>
        </main>
      </div>

      {/* Mobile overlay */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        ></div>
      )}
    </div>
  )
}
