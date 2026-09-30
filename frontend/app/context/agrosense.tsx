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

  resultHydrated: boolean;

  historyHydrated: boolean;
}

const AgroSenseContext = createContext<AgroSenseState | null>(null);

export function AgroSenseProvider({ children }: { children: ReactNode }) {



  const [latestResult, _setLatestResult] = useState<AnalyzeResponse | null>(
    () => readSession<AnalyzeResponse>(RESULT_KEY),
  );
  const [resultHydrated, setResultHydrated] = useState(false);





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

  const [history, setHistory] = useState<DiagnosisHistory[]>([]);
  const [historyHydrated, setHistoryHydrated] = useState(false);





  useEffect(() => {
    try {
      const stored = JSON.parse(localStorage.getItem(HISTORY_KEY) ?? '[]');
      if (Array.isArray(stored) && stored.length > 0) setHistory(stored);
    } catch {

    } finally {
      setHistoryHydrated(true);
    }
  }, []);

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
      value={{ latestResult, setLatestResult, history, addHistory, clearHistory, resultHydrated, historyHydrated }}
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
