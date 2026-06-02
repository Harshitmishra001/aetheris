'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ThemeToggle } from '@/components/layout/ThemeToggle';

export function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      <nav className="navbar" id="main-navbar">
        <div className="navbar-inner">
          <Link href="/" className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-[var(--accent)] to-[var(--success)]">
            Aetheris
          </Link>

          <ul className="navbar-links" id="navbar-links">
            <li>
              <Link href="/#features" className="navbar-link" id="nav-features">
                Features
              </Link>
            </li>
            <li>
              <Link href="/#how-it-works" className="navbar-link" id="nav-how-it-works">
                How It Works
              </Link>
            </li>
            <li>
              <Link href="/dashboard" className="navbar-link" id="nav-dashboard">
                Dashboard
              </Link>
            </li>
          </ul>

          <div className="navbar-actions" id="navbar-actions">
            <ThemeToggle />
            <Link href="/login" className="btn btn-ghost btn-sm" id="nav-login-btn">
              Log In
            </Link>
            <Link href="/signup" className="btn btn-primary btn-sm" id="nav-signup-btn">
              Sign Up
            </Link>
            <button
              className="navbar-mobile-toggle"
              id="mobile-menu-toggle"
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label="Toggle mobile menu"
            >
              {mobileOpen ? (
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              ) : (
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="3" y1="6" x2="21" y2="6" />
                  <line x1="3" y1="12" x2="21" y2="12" />
                  <line x1="3" y1="18" x2="21" y2="18" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Navigation */}
      <div className={`mobile-nav ${mobileOpen ? 'open' : ''}`} id="mobile-nav">
        <Link
          href="/#features"
          className="mobile-nav-link"
          onClick={() => setMobileOpen(false)}
        >
          Features
        </Link>
        <Link
          href="/#how-it-works"
          className="mobile-nav-link"
          onClick={() => setMobileOpen(false)}
        >
          How It Works
        </Link>
        <Link
          href="/dashboard"
          className="mobile-nav-link"
          onClick={() => setMobileOpen(false)}
        >
          Dashboard
        </Link>
        <hr className="divider" />
        <Link
          href="/login"
          className="mobile-nav-link"
          onClick={() => setMobileOpen(false)}
        >
          Log In
        </Link>
        <Link
          href="/signup"
          className="mobile-nav-link"
          onClick={() => setMobileOpen(false)}
        >
          Sign Up Free
        </Link>
      </div>
    </>
  );
}
