'use client';

import { useEffect } from 'react';

/**
 * Forces the page to start at the top on every load/refresh instead of the
 * browser restoring the last scroll position (default `scrollRestoration:
 * 'auto'`). Mount this once near the root of a page that should always open
 * at the top — typically the homepage.
 */
export default function ScrollToTop() {
  useEffect(() => {
    if ('scrollRestoration' in window.history) {
      window.history.scrollRestoration = 'manual';
    }
    window.scrollTo(0, 0);
  }, []);

  return null;
}
