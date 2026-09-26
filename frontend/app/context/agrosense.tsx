'use client';

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from 'react';
import type { AnalyzeResponse, DiagnosisHistory } from '@/types';

const RESULT_KEY  = 'agrosense_latest_result';
const HISTORY_KEY = 'agrosense_history';

function readSession<T>(key: string): T | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = sessionStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
}

interface AgroSenseState {
  latestResult: AnalyzeResponse | null;
  setLatestResult: (r: AnalyzeResponse | null) => void;
  history: DiagnosisHistory[];
  addHistory: (entry: DiagnosisHistory) => void;
  clearHistory: () => void;
  /** true once the initial client-side sessionStorage read has completed */
  resultHydrated: boolean;
}

const AgroSenseContext = createContext<AgroSenseState | null>(null);

export function AgroSenseProvider({ children }: { children: ReactNode }) {
  // Initialise from sessionStorage so state survives Next.js client-side navigation.
  // On the very first render (server / pre-hydration) this is always null because
  // `window` is unavailable — we re-sync it for real in the effect below.
  const [latestResult, _setLatestResult] = useState<AnalyzeResponse | null>(
    () => readSession<AnalyzeResponse>(RESULT_KEY),
  );
  const [resultHydrated, setResultHydrated] = useState(false);

  // Re-read sessionStorage once the component has mounted on the client.
  // This closes the race where the lazy useState initializer ran during SSR
  // (window undefined → null) and never got a chance to re-read afterwards,
  // which could make pages think "no result exists" right after navigation.
  useEffect(() => {
    const stored = readSession<AnalyzeResponse>(RESULT_KEY);
    if (stored) _setLatestResult(stored);
    setResultHydrated(true);
  }, []);

  const setLatestResult = useCallback((r: AnalyzeResponse | null) => {
    _setLatestResult(r);
    if (typeof window !== 'undefined') {
      if (r) sessionStorage.setItem(RESULT_KEY, JSON.stringify(r));
      else    sessionStorage.removeItem(RESULT_KEY);
    }
  }, []);

  const [history, setHistory] = useState<DiagnosisHistory[]>(() => {
    if (typeof window === 'undefined') return [];
    try {
      return JSON.parse(localStorage.getItem(HISTORY_KEY) ?? '[]');
    } catch {
      return [];
    }
  });

  const addHistory = useCallback((entry: DiagnosisHistory) => {
    setHistory(prev => {
      const next = [entry, ...prev].slice(0, 20);
      localStorage.setItem(HISTORY_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  const clearHistory = useCallback(() => {
    setHistory([]);
    localStorage.removeItem(HISTORY_KEY);
  }, []);

  return (
    <AgroSenseContext.Provider
      value={{ latestResult, setLatestResult, history, addHistory, clearHistory, resultHydrated }}
    >
      {children}
    </AgroSenseContext.Provider>
  );
}

export function useAgroSense(): AgroSenseState {
  const ctx = useContext(AgroSenseContext);
  if (!ctx) throw new Error('useAgroSense must be used inside <AgroSenseProvider>');
  return ctx;
}
