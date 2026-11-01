import type { Metadata } from 'next';
import { Fraunces, Inter } from 'next/font/google';
import Link from 'next/link';
import { Sparkles, CalendarDays } from 'lucide-react';
import { ToastProvider } from '@/components/ui/Toast';
import './globals.css';

const fraunces = Fraunces({
  subsets: ['latin'],
  variable: '--font-fraunces',
  display: 'swap',
});

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Jashn — Plan the celebration, not the stress',
  description: 'AI-assisted, deterministic event planning for weddings, birthdays, and community celebrations in India.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${fraunces.variable} ${inter.variable}`}>
      <body className="min-h-screen flex flex-col bg-bg text-ink selection:bg-accent-soft selection:text-ink">
        {/* Skip to main content link for keyboard & screen reader accessibility */}
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-50 focus:px-4 focus:py-2 focus:bg-primary focus:text-primary-ink focus:rounded-md focus:shadow-lg focus:outline-none focus:ring-2 focus:ring-accent font-medium text-sm"
        >
          Skip to main content
        </a>

        <ToastProvider>
          {/* Header Landmark */}
          <header className="sticky top-0 z-40 bg-surface/90 backdrop-blur-md border-b border-border">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
              <Link
                href="/"
                className="flex items-center gap-2.5 rounded-lg p-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
              >
                <div className="w-9 h-9 rounded-lg bg-primary text-primary-ink flex items-center justify-center font-heading font-black text-xl shadow-sm">
                  J
                </div>
                <div>
                  <span className="font-heading font-black text-xl tracking-tight text-primary block leading-none">
                    Jashn
                  </span>
                  <span className="text-[10px] uppercase tracking-wider text-ink-muted font-semibold">
                    Celebration Planner
                  </span>
                </div>
              </Link>

              <nav aria-label="Main" className="flex items-center gap-3">
                <Link
                  href="/"
                  className="px-3 py-1.5 text-sm font-medium text-ink hover:text-primary rounded-md hover:bg-surface-2 transition-colors min-h-[44px] flex items-center gap-1.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                >
                  <CalendarDays className="w-4 h-4 text-ink-muted" aria-hidden="true" />
                  <span>My Events</span>
                </Link>
                <Link
                  href="/new"
                  className="px-4 py-2 text-sm font-medium bg-primary text-primary-ink rounded-lg hover:opacity-95 transition-opacity min-h-[44px] flex items-center gap-1.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent shadow-sm"
                >
                  <Sparkles className="w-4 h-4" aria-hidden="true" />
                  <span>Plan Event</span>
                </Link>
              </nav>
            </div>
            {/* Signature hairline gradient under header */}
            <div className="header-hairline w-full" aria-hidden="true" />
          </header>

          {/* Main Landmark */}
          <main id="main-content" className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-6 md:py-8 focus:outline-none">
            {children}
          </main>

          {/* Footer Landmark with persistent disclaimer */}
          <footer className="border-t border-border bg-surface py-6 mt-auto">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-ink-muted text-center md:text-left">
              <p className="flex items-center gap-1.5 justify-center md:justify-start">
                <span className="font-heading font-semibold text-ink">Jashn</span>
                <span>— Plan the celebration, not the stress.</span>
              </p>
              <p className="max-w-md">
                Jashn gives planning guidance. Costs are estimates; confirm with vendors and local authorities.
              </p>
            </div>
          </footer>
        </ToastProvider>
      </body>
    </html>
  );
}
