'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useState } from 'react';

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

function IconClose() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-5 h-5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
    </svg>
  );
}

export default function AppNavbar() {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const [lastPathname, setLastPathname] = useState(pathname);


  const isActive = (href: string) =>
    href === '/' ? pathname === '/' : pathname.startsWith(href);



  if (pathname !== lastPathname) {
    setLastPathname(pathname);
    if (menuOpen) setMenuOpen(false);
  }

  return (
    <nav
      className="fixed top-0 inset-x-0 z-40
        bg-white/70 backdrop-blur-xl backdrop-saturate-150
        border-b border-black/5
        transition-[background,border-color] duration-300"
      style={{ transitionTimingFunction: 'var(--ease-smooth)' }}
    >
      <div className="max-w-6xl mx-auto w-full px-6 h-[52px] flex items-center justify-between gap-4">


        <Link
          href="/"
          className="flex items-center gap-2 shrink-0 group"
        >
          <div
            className="w-7 h-7 rounded-xl overflow-hidden shrink-0
              shadow-[var(--shadow-brand)] transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:scale-105"
            style={{ transitionTimingFunction: 'var(--ease-spring)' }}
          >
            <Image src="/favicon.jpg" alt="AgroSense" width={28} height={28} className="w-full h-full object-cover" priority />
          </div>
          <span className="text-sm font-semibold text-gray-900 tracking-tight">AgroSense</span>
        </Link>


        <div className="hidden md:flex items-center gap-1">
          {NAV_LINKS.map(({ href, label }) => {
            const active = isActive(href);
            return (
              <Link
                key={href}
                href={href}
                className={[
                  'relative px-3.5 py-1.5 rounded-xl text-xs font-medium',
                  'transition-[background,color] duration-300',
                  active
                    ? 'bg-[var(--brand-light)] text-[var(--brand)]'
                    : 'text-[var(--fg-secondary)] hover:text-gray-900 hover:bg-gray-100/70',
                ].join(' ')}
                style={{ transitionTimingFunction: 'var(--ease-smooth)' }}
              >
                {label}
                <span
                  className={[
                    'absolute bottom-0 left-1/2 -translate-x-1/2 h-0.5 rounded-full bg-[var(--brand)]',
                    'transition-[width,opacity] duration-300',
                    active ? 'w-4 opacity-100' : 'w-0 opacity-0',
                  ].join(' ')}
                  style={{ transitionTimingFunction: 'var(--ease-spring)' }}
                />
              </Link>
            );
          })}
        </div>


        <div className="flex items-center gap-2">
          <Link
            href="/diagnosis"
            className="hidden sm:inline-flex items-center gap-1.5 bg-[var(--brand)] hover:bg-[var(--brand-mid)]
              text-white text-xs font-semibold rounded-full px-4 py-1.5 shadow-[var(--shadow-brand)]
              transition-[background,transform,box-shadow] duration-300 hover:-translate-y-0.5 hover:shadow-[var(--shadow-elevated)] active:scale-95"
            style={{ transitionTimingFunction: 'var(--ease-spring)' }}
          >
            Mulai Diagnosis <IconArrow />
          </Link>


          <button
            type="button"
            onClick={() => setMenuOpen((v) => !v)}
            className="md:hidden p-1.5 rounded-xl text-[var(--fg-secondary)] hover:text-gray-900 hover:bg-gray-100
              transition-colors duration-200"
            aria-label={menuOpen ? 'Tutup menu' : 'Buka menu'}
            aria-expanded={menuOpen}
          >
            {menuOpen ? <IconClose /> : <IconMenu />}
          </button>
        </div>

      </div>


      {menuOpen && (
        <div
          className="md:hidden border-t border-black/5
            bg-white/80 backdrop-blur-xl backdrop-saturate-150
            animate-fade-down"
        >
          <div className="max-w-6xl mx-auto w-full px-6 py-3 flex flex-col gap-1">
            {NAV_LINKS.map(({ href, label }) => {
              const active = isActive(href);
              return (
                <Link
                  key={href}
                  href={href}
                  onClick={() => setMenuOpen(false)}
                  className={[
                    'flex items-center px-4 py-2.5 rounded-xl text-sm font-medium',
                    'transition-[background,color] duration-300',
                    active
                      ? 'bg-[var(--brand-light)] text-[var(--brand)]'
                      : 'text-[var(--fg-secondary)] hover:text-gray-900 hover:bg-gray-100/70',
                  ].join(' ')}
                  style={{ transitionTimingFunction: 'var(--ease-smooth)' }}
                >
                  {label}
                </Link>
              );
            })}

            <Link
              href="/diagnosis"
              onClick={() => setMenuOpen(false)}
              className="mt-2 inline-flex items-center justify-center gap-1.5 bg-[var(--brand)] hover:bg-[var(--brand-mid)]
                text-white text-sm font-semibold rounded-full px-4 py-2.5 shadow-[var(--shadow-brand)]
                transition-[background,transform,box-shadow] duration-300 hover:-translate-y-0.5 hover:shadow-[var(--shadow-elevated)] active:scale-95"
              style={{ transitionTimingFunction: 'var(--ease-spring)' }}
            >
              Mulai Diagnosis <IconArrow />
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}
