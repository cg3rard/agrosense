'use client';

import { useEffect, useRef, useState, type ReactNode } from 'react';

interface RevealProps {
  children: ReactNode;
  /** Extra classes merged onto the wrapper (e.g. grid/flex layout classes). */
  className?: string;
  /** Delay in ms before the reveal animation starts, once in view. */
  delayMs?: number;
  /** Distance (px) the element slides up from. Defaults to 24px. */
  offset?: number;
}

/**
 * Slide-up + fade-in reveal, triggered once when the element scrolls into
 * the viewport (IntersectionObserver). Mirrors the Apple.com pattern of
 * sections animating in as the user scrolls down the page.
 */
export default function Reveal({ children, className = '', delayMs = 0, offset = 24 }: RevealProps) {
  const ref = useRef<HTMLDivElement>(null);
  // Respect users who prefer reduced motion — start already visible so no
  // animation is scheduled at all (checked once, lazily, not inside an effect).
  const [visible, setVisible] = useState(() => {
    if (typeof window === 'undefined') return false;
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  });

  useEffect(() => {
    if (visible) return; // already shown (reduced motion) — nothing to observe
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.15, rootMargin: '0px 0px -60px 0px' },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [visible]);

  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : `translateY(${offset}px)`,
        transition: `opacity 0.7s var(--ease-smooth) ${delayMs}ms, transform 0.7s var(--ease-smooth) ${delayMs}ms`,
        willChange: 'opacity, transform',
      }}
    >
      {children}
    </div>
  );
}
