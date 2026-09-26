'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const NAV_LINKS = [
  { href: '/',          label: 'Home' },
  { href: '/diagnosis', label: 'Analisis Tanaman' },
  { href: '/result',    label: 'Rangkuman Hasil' },
  { href: '/keuangan',  label: 'Catatan Keuangan' },
] as const;

function IconArrow() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-3.5 h-3.5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
    </svg>
  );
}

function IconMenu() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-5 h-5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
    </svg>
  );
}

export default function AppNavbar() {
  const pathname = usePathname();

  /* exact match for '/', prefix match for all others */
  const isActive = (href: string) =>
    href === '/' ? pathname === '/' : pathname.startsWith(href);

  return (
    <nav className="fixed top-0 inset-x-0 z-40 h-[52px]
      bg-white/80 backdrop-blur-md border-b border-gray-100
      flex items-center">
      <div className="max-w-6xl mx-auto w-full px-6 flex items-center justify-between gap-4">

        {/* ── Logo ── */}
        <Link href="/" className="flex items-center gap-2 shrink-0">
          <div className="w-7 h-7 rounded-xl bg-[var(--brand)] flex items-center justify-center shadow-sm">
            <span className="text-white text-xs font-bold select-none">A</span>
          </div>
          <span className="text-sm font-semibold text-gray-900 tracking-tight">AgroSense</span>
        </Link>

        {/* ── Desktop nav links ── */}
        <div className="hidden md:flex items-center gap-1">
          {NAV_LINKS.map(({ href, label }) => {
            const active = isActive(href);
            return (
              <Link
                key={href}
                href={href}
                className={[
                  'relative px-3.5 py-1.5 rounded-xl text-xs font-medium transition-all duration-200',
                  active
                    ? 'bg-[var(--brand-light)] text-[var(--brand)]'
                    : 'text-[var(--fg-secondary)] hover:text-gray-900 hover:bg-gray-100/70',
                ].join(' ')}
              >
                {label}
                {active && (
                  <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-4 h-0.5 rounded-full bg-[var(--brand)]" />
                )}
              </Link>
            );
          })}
        </div>

        {/* ── CTA pill (desktop) + hamburger placeholder (mobile) ── */}
        <div className="flex items-center gap-2">
          <Link
            href="/diagnosis"
            className="hidden sm:inline-flex items-center gap-1.5 bg-[var(--brand)] hover:bg-[var(--brand-mid)]
              text-white text-xs font-semibold rounded-full px-4 py-1.5 shadow-sm
              transition-all duration-200 hover:-translate-y-px active:scale-95"
          >
            Mulai Diagnosis <IconArrow />
          </Link>
          {/* Mobile — show icon only on very small screens */}
          <button className="md:hidden p-1.5 rounded-xl text-[var(--fg-secondary)] hover:bg-gray-100 transition-colors" aria-label="Menu">
            <IconMenu />
          </button>
        </div>

      </div>
    </nav>
  );
}
