'use client';

import { useEffect, useRef, useState, type ReactNode } from 'react';

interface RevealProps {
  children: ReactNode;

  className?: string;

  delayMs?: number;

  offset?: number;
}






export default function Reveal({ children, className = '', delayMs = 0, offset = 24 }: RevealProps) {
  const ref = useRef<HTMLDivElement>(null);


  const [visible, setVisible] = useState(() => {
    if (typeof window === 'undefined') return false;
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  });

  useEffect(() => {
    if (visible) return;
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
