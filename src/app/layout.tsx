import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { ThemeProvider } from '@/components/layout/ThemeProvider';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-sans',
});

export const metadata: Metadata = {
  title: 'Aetheris — Intelligence for Every Career Decision',
  description:
    'Aetheris helps professionals turn verified skills and experience into better career opportunities through AI-powered career intelligence.',
  keywords: [
    'Aetheris',
    'career intelligence',
    'AI career operating system',
    'ATS optimization',
    'job application',
  ],
  authors: [{ name: 'Aetheris' }],
  openGraph: {
    title: 'Aetheris — Intelligence for Every Career Decision',
    description:
      'Aetheris is an AI-powered Career Operating System that transforms verified professional data into personalized resumes, opportunity matching, career intelligence, and application optimization.',
    type: 'website',
    siteName: 'Aetheris',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Aetheris — Intelligence for Every Career Decision',
    description:
      'Aetheris helps professionals turn verified skills and experience into better career opportunities.',
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={inter.variable} data-theme="dark" suppressHydrationWarning>
      <head>
        {/* Inline script for instant theme detection to prevent FOUC */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var theme = localStorage.getItem('theme') || 'dark';
                  document.documentElement.setAttribute('data-theme', theme);
                } catch(e) {}
              })();
            `,
          }}
        />
      </head>
      <body>
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
