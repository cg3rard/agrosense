'use client';

import { useEffect, useState, useSyncExternalStore } from 'react';

/* Returns true only on the client after hydration — avoids setState-in-effect */
function useIsHydrated() {
  return useSyncExternalStore(
    (cb) => { window.addEventListener('agrosense:noop', cb); return () => window.removeEventListener('agrosense:noop', cb); },
    () => true,   // client snapshot  → true
    () => false,  // server snapshot  → false
  );
}
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAgroSense } from '../context/agrosense';
import type { TransactionResponse } from '@/types';

/* ── Icons ────────────────────────────────────────────────────────────────── */
function IconHome() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="w-4 h-4">
      <path strokeLinecap="round" strokeLinejoin="round"
        d="m2.25 12 8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
    </svg>
  );
}
function IconRefresh() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="w-4 h-4">
      <path strokeLinecap="round" strokeLinejoin="round"
        d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99" />
    </svg>
  );
}
function IconCheck() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} className="w-4 h-4">
      <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
    </svg>
  );
}
function IconWallet() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="w-5 h-5">
      <path strokeLinecap="round" strokeLinejoin="round"
        d="M21 12a2.25 2.25 0 0 0-2.25-2.25H15a3 3 0 1 1-6 0H5.25A2.25 2.25 0 0 0 3 12m18 0v6a2.25 2.25 0 0 1-2.25 2.25H5.25A2.25 2.25 0 0 1 3 18v-6m18 0V9M3 12V9m18 0a2.25 2.25 0 0 0-2.25-2.25H5.25A2.25 2.25 0 0 0 3 9m18 0V6a2.25 2.25 0 0 0-2.25-2.25H5.25A2.25 2.25 0 0 0 3 6v3" />
    </svg>
  );
}
function IconLeaf() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="w-5 h-5">
      <path strokeLinecap="round" strokeLinejoin="round"
        d="M12 3C7 3 3 7 3 12c0 4.5 3.5 8.25 8 8.94V21m1-18c5 0 9 4 9 9 0 4.5-3.5 8.25-8 8.94" />
    </svg>
  );
}
function IconTrend({ up }: { up: boolean }) {
  return up ? (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-4 h-4">
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18 9 11.25l4.306 4.306a11.95 11.95 0 0 1 5.814-5.518l2.74-1.22m0 0-5.94-2.281m5.94 2.28-2.28 5.941" />
    </svg>
  ) : (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-4 h-4">
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6 9 12.75l4.286-4.286a11.948 11.948 0 0 1 4.306 6.43l.776 2.898m0 0 3.182-5.511m-3.182 5.51-5.511-3.181" />
    </svg>
  );
}
function Spinner() {
  return (
    <svg className="animate-spin w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
    </svg>
  );
}

/* ── ROI Badge ────────────────────────────────────────────────────────────── */
function RoiBadge({ status, large }: { status: string; large?: boolean }) {
  const map: Record<string, { bg: string; text: string; ring: string; label: string }> = {
    Positive: { bg: 'bg-emerald-50', text: 'text-emerald-700', ring: 'ring-1 ring-emerald-200', label: 'Menguntungkan' },
    Negative: { bg: 'bg-red-50',     text: 'text-red-600',     ring: 'ring-1 ring-red-200',     label: 'Tidak Menguntungkan' },
    Neutral:  { bg: 'bg-gray-100',   text: 'text-gray-500',    ring: 'ring-1 ring-gray-200',    label: 'Netral' },
  };
  const s = map[status] ?? map.Neutral;
  const up = status === 'Positive';
  const neutral = status === 'Neutral';
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full font-semibold
      ${large ? 'px-4 py-2 text-sm' : 'px-2.5 py-1 text-xs'}
      ${s.bg} ${s.text} ${s.ring}`}
    >
      {!neutral && <span className="shrink-0"><IconTrend up={up} /></span>}
      {neutral ? '— ' : ''}{large ? s.label : status}
    </span>
  );
}

/* ── Action Step Row ──────────────────────────────────────────────────────── */
function ActionStep({ n, text }: { n: number; text: string }) {
  return (
    <div className="flex items-start gap-3.5">
      <div className="w-6 h-6 rounded-full bg-[var(--brand-light)] text-[var(--brand)] text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
        {n}
      </div>
      <p className="text-sm text-[var(--fg-secondary)] leading-relaxed">{text}</p>
    </div>
  );
}

/* ── Metric Block ─────────────────────────────────────────────────────────── */
function MetricBlock({
  label, icon, children, accent,
}: {
  label: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  accent?: string;
}) {
  return (
    <div className={`rounded-2xl border px-6 py-5 flex items-start gap-4 ${accent ?? 'bg-white border-gray-100'}`}>
      <div className="w-10 h-10 rounded-xl bg-[var(--brand-light)] text-[var(--brand)] flex items-center justify-center shrink-0">
        {icon}
      </div>
      <div className="min-w-0">
        <p className="text-[11px] font-semibold text-[var(--fg-tertiary)] uppercase tracking-widest mb-1">{label}</p>
        {children}
      </div>
    </div>
  );
}

/* ── Expense Table ────────────────────────────────────────────────────────── */
function ExpenseTable({ expenses }: { expenses: TransactionResponse[] }) {
  const total = expenses.reduce((s, e) => s + e.cost, 0);
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-sm">
        <thead>
          <tr className="border-b border-gray-100">
            {(['Tanggal', 'Item / Tindakan', 'Nominal'] as const).map(h => (
              <th key={h}
                className={`pb-3 text-[10px] font-semibold text-[var(--fg-tertiary)] uppercase tracking-widest
                  ${h === 'Nominal' ? 'text-right' : 'pr-4'}`}
              >{h}</th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-50">
          {expenses.map(e => (
            <tr key={e.id} className="hover:bg-gray-50/60 transition-colors duration-150">
              <td className="py-3 pr-4 text-xs text-[var(--fg-tertiary)] whitespace-nowrap">
                {new Date(e.timestamp).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })}
              </td>
              <td className="py-3 pr-4 font-medium text-gray-900 max-w-[180px] truncate">{e.item_name}</td>
              <td className="py-3 text-right font-semibold text-gray-800 tabular-nums">
                Rp {e.cost.toLocaleString('id-ID')}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {/* total bar */}
      <div className="mt-4 rounded-2xl bg-gray-900 px-5 py-4 flex items-center justify-between">
        <p className="text-xs font-medium text-gray-400 uppercase tracking-widest">Total Pengeluaran</p>
        <p className="text-base font-bold text-white tabular-nums">Rp {total.toLocaleString('id-ID')}</p>
      </div>
    </div>
  );
}

/* ── Page inner ───────────────────────────────────────────────────────────── */
function ResultInner() {
  const router = useRouter();
  const { latestResult } = useAgroSense();

  const [expenses, setExpenses]     = useState<TransactionResponse[]>([]);
  const [loadingExp, setLoadingExp] = useState(true);
  const [logLoading, setLogLoading] = useState(false);
  const [logged, setLogged]         = useState(false);
  const [error, setError]           = useState<string | null>(null);
  // true only after client hydration — sessionStorage lazy init has already run
  const hydrated = useIsHydrated();

  /* redirect only after hydration confirms there is genuinely no result */
  useEffect(() => {
    if (hydrated && !latestResult) router.replace('/diagnosis');
  }, [hydrated, latestResult, router]);

  /* load transaction history */
  useEffect(() => {
    fetch('/api/transaction')
      .then(r => r.json())
      .then((d: TransactionResponse[]) => setExpenses(Array.isArray(d) ? d : []))
      .catch(() => setExpenses([]))
      .finally(() => setLoadingExp(false));
  }, []);

  /* log expense to DB */
  const handleLog = async () => {
    if (!latestResult || logged) return;
    setLogLoading(true); setError(null);
    try {
      const res = await fetch('/api/transaction', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          item_name: latestResult.recommended_action.slice(0, 80),
          cost: latestResult.cost_estimate,
          timestamp: new Date().toISOString(),
        }),
      });
      if (!res.ok) {
        const d = await res.json().catch(() => ({ detail: res.statusText }));
        throw new Error(d?.detail ?? `Error ${res.status}`);
      }
      const saved: TransactionResponse = await res.json();
      setExpenses(p => [saved, ...p]);
      setLogged(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal mencatat pengeluaran.');
    } finally {
      setLogLoading(false);
    }
  };

  /* Show a loading pulse while waiting for sessionStorage hydration */
  if (!hydrated || !latestResult) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--bg-page)]">
        <div className="flex flex-col items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-bounce" style={{ animationDelay: '0ms' }} />
            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-bounce" style={{ animationDelay: '150ms' }} />
            <div className="w-2 h-2 rounded-full bg-emerald-300 animate-bounce" style={{ animationDelay: '300ms' }} />
          </div>
          <p className="text-sm text-[var(--fg-tertiary)]">Memuat hasil analisis…</p>
        </div>
      </div>
    );
  }

  /* ── derived visual tokens from ROI ── */
  const isPositive = latestResult.roi_status === 'Positive';
  const isNegative = latestResult.roi_status === 'Negative';

  const roiAccent = isPositive
    ? 'bg-emerald-50 border-emerald-100'
    : isNegative
    ? 'bg-red-50 border-red-100'
    : 'bg-gray-50 border-gray-100';

  const headerAccent = isPositive
    ? 'from-emerald-50/70 via-white to-white'
    : isNegative
    ? 'from-red-50/60 via-white to-white'
    : 'from-gray-50/60 via-white to-white';

  const roiDesc = isPositive
    ? 'Tindakan ini diperkirakan menghasilkan keuntungan finansial melebihi biaya yang dikeluarkan.'
    : isNegative
    ? 'Biaya tindakan kemungkinan melebihi manfaat panen yang diharapkan. Pertimbangkan alternatif yang lebih hemat.'
    : 'Dampak finansial dari tindakan ini bersifat seimbang antara biaya dan manfaat.';

  /* split recommended_action into numbered steps for better readability */
  const actionSteps = latestResult.recommended_action
    .split(/(?:\.\s+|\n+)/)
    .map(s => s.trim())
    .filter(Boolean);

  return (
    <div className="min-h-screen flex flex-col bg-[var(--bg-page)]">
      <main className="flex-1 pt-[52px]">

        {/* ── Page header ───────────────────────────────────────────────── */}
        <div className="bg-white border-b border-gray-100/80">
          <div className="max-w-5xl mx-auto px-6 py-10">
            <p className="text-[11px] font-semibold text-emerald-600 uppercase tracking-widest mb-2 animate-fade-in">
              Module 01 &amp; 02 — Hasil Lengkap
            </p>
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-gray-900 mb-3 animate-fade-up">
              Hasil Analisis &amp; Rekomendasi
            </h1>
            <p className="text-base text-[var(--fg-secondary)] max-w-xl animate-fade-up" style={{ animationDelay: '60ms' }}>
              Berikut diagnosis AI, langkah tindakan yang direkomendasikan, estimasi
              biaya, dan status ROI untuk kondisi tanaman Anda.
            </p>
          </div>
        </div>

        <div className="max-w-5xl mx-auto px-6 py-10 space-y-6">

          {/* error banner */}
          {error && (
            <div className="rounded-2xl bg-red-50 border border-red-100 px-5 py-4 text-sm text-red-700 flex items-start gap-3 animate-fade-in">
              <svg className="w-4 h-4 shrink-0 mt-0.5 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
              </svg>
              <span>{error}</span>
            </div>
          )}

          {/* ══ RESULT CARD ══════════════════════════════════════════════ */}
          <div
            className={`bg-gradient-to-b ${headerAccent} rounded-3xl shadow-xl border border-gray-100 overflow-hidden animate-fade-up`}
            style={{ animationDelay: '60ms' }}
          >

            {/* ── Card header: diagnosis title + ROI badge ── */}
            <div className="px-8 pt-8 pb-6 border-b border-gray-100/70 flex items-start justify-between gap-6">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-8 h-8 rounded-xl bg-[var(--brand-light)] text-[var(--brand)] flex items-center justify-center shrink-0">
                    <IconLeaf />
                  </div>
                  <p className="text-[11px] font-semibold text-[var(--brand)] uppercase tracking-widest">
                    Diagnosis AI
                  </p>
                </div>
                <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-gray-900 leading-snug">
                  {latestResult.diagnosis}
                </h2>
              </div>
              <div className="shrink-0 pt-1">
                <RoiBadge status={latestResult.roi_status} large />
              </div>
            </div>

            <div className="px-8 py-8 space-y-8">

              {/* ── Rekomendasi Tindakan ── */}
              <div>
                <p className="text-[11px] font-semibold text-[var(--fg-tertiary)] uppercase tracking-widest mb-4">
                  Rekomendasi Tindakan
                </p>
                <div className="bg-white/80 border border-gray-100 rounded-2xl p-6 space-y-3.5">
                  {actionSteps.length > 1 ? (
                    actionSteps.map((step, i) => (
                      <ActionStep key={i} n={i + 1} text={step} />
                    ))
                  ) : (
                    <p className="text-sm text-[var(--fg-secondary)] leading-relaxed">
                      {latestResult.recommended_action}
                    </p>
                  )}
                </div>
              </div>

              {/* ── Item / Produk ── */}
              <div>
                <p className="text-[11px] font-semibold text-[var(--fg-tertiary)] uppercase tracking-widest mb-3">
                  Item / Produk yang Diperlukan
                </p>
                <div className="flex items-center gap-4 bg-white/80 border border-gray-100 rounded-2xl px-6 py-4">
                  <div className="w-9 h-9 rounded-xl bg-[var(--brand-light)] text-[var(--brand)] flex items-center justify-center shrink-0">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="w-4.5 h-4.5 w-[18px] h-[18px]">
                      <path strokeLinecap="round" strokeLinejoin="round"
                        d="M9.75 3.104v5.714a2.25 2.25 0 0 1-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 0 1 4.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15.3M14.25 3.104c.251.023.501.05.75.082M19.8 15.3l-1.57.393A9.065 9.065 0 0 1 12 15a9.065 9.065 0 0 1-6.23-.693L5 14.5m14.8.8 1.402 1.402c1 1 .03 2.798-1.442 2.798H4.24c-1.47 0-2.441-1.798-1.442-2.798L4.2 15.3" />
                    </svg>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-[var(--fg-tertiary)] mb-0.5">Nama item / tindakan</p>
                    <p className="text-sm font-semibold text-gray-900 leading-snug">
                      {latestResult.recommended_action.split(/[.,]/)[0].trim()}
                    </p>
                  </div>
                  <p className="text-sm font-bold text-gray-900 tabular-nums shrink-0">
                    Rp {latestResult.cost_estimate.toLocaleString('id-ID')}
                  </p>
                </div>
              </div>

              {/* ── Finansial & ROI ── */}
              <div>
                <p className="text-[11px] font-semibold text-[var(--fg-tertiary)] uppercase tracking-widest mb-3">
                  Finansial &amp; ROI
                </p>
                <div className="grid sm:grid-cols-2 gap-4">

                  {/* Estimasi Biaya */}
                  <MetricBlock label="Estimasi Biaya" icon={<IconWallet />}>
                    <p className="text-2xl font-bold text-gray-900 tabular-nums tracking-tight">
                      Rp {latestResult.cost_estimate.toLocaleString('id-ID')}
                    </p>
                    <p className="text-xs text-[var(--fg-tertiary)] mt-1 leading-snug">
                      Perkiraan total biaya tindakan yang direkomendasikan
                    </p>
                  </MetricBlock>

                  {/* ROI Status */}
                  <div className={`rounded-2xl border px-6 py-5 flex items-start gap-4 ${roiAccent}`}>
                    <div className="w-10 h-10 rounded-xl bg-white/80 flex items-center justify-center shrink-0">
                      <RoiBadge status={latestResult.roi_status} />
                    </div>
                    <div className="min-w-0">
                      <p className="text-[11px] font-semibold text-[var(--fg-tertiary)] uppercase tracking-widest mb-1.5">
                        Status ROI
                      </p>
                      <RoiBadge status={latestResult.roi_status} large />
                      <p className="text-xs text-[var(--fg-secondary)] mt-2 leading-relaxed">{roiDesc}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* ── Log expense button ── */}
              <div className="pt-1">
                <button
                  onClick={handleLog}
                  disabled={logLoading || logged}
                  className="w-full flex items-center justify-center gap-2 bg-gray-900 hover:bg-gray-700 disabled:bg-gray-200 disabled:text-gray-400 text-white font-semibold rounded-2xl py-3.5 text-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md active:scale-95 disabled:cursor-not-allowed disabled:translate-y-0 disabled:shadow-none"
                >
                  {logLoading
                    ? <><Spinner /> Mencatat pengeluaran…</>
                    : logged
                    ? <><IconCheck /> Pengeluaran Tercatat di Buku Kas</>
                    : '💳  Beli & Catat Pengeluaran'}
                </button>
              </div>
            </div>
          </div>

          {/* ══ FINANCIAL LEDGER ════════════════════════════════════════ */}
          <div
            className="bg-white border border-gray-100 rounded-3xl shadow-[var(--shadow-card)] overflow-hidden animate-fade-up"
            style={{ animationDelay: '120ms' }}
          >
            <div className="px-8 pt-7 pb-5 border-b border-gray-100/60 flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-[var(--brand-light)] text-[var(--brand)] flex items-center justify-center shrink-0">
                <IconWallet />
              </div>
              <div>
                <p className="text-[11px] font-semibold text-[var(--brand)] uppercase tracking-widest">Module 02</p>
                <h2 className="text-sm font-semibold text-gray-900 tracking-tight">Buku Kas Operasional</h2>
              </div>
            </div>

            <div className="px-8 py-6">
              {loadingExp ? (
                <div className="space-y-3">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="h-11 rounded-xl bg-gray-100 animate-skeleton" />
                  ))}
                </div>
              ) : expenses.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-14 gap-3 text-center">
                  <div className="w-12 h-12 rounded-2xl bg-gray-50 border border-gray-100 flex items-center justify-center">
                    <svg className="w-5 h-5 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-3-3v6M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-700">Belum ada transaksi</p>
                    <p className="text-xs text-[var(--fg-tertiary)] mt-1 max-w-xs leading-relaxed">
                      Catat pengeluaran dari hasil diagnosis di atas untuk mulai melacak keuangan kebun Anda.
                    </p>
                  </div>
                </div>
              ) : (
                <ExpenseTable expenses={expenses} />
              )}
            </div>
          </div>

          {/* ══ BOTTOM NAVIGATION ═══════════════════════════════════════ */}
          <div
            className="grid sm:grid-cols-2 gap-3 animate-fade-up"
            style={{ animationDelay: '180ms' }}
          >
            <button
              onClick={() => router.push('/diagnosis')}
              className="flex items-center justify-center gap-2.5 bg-white border border-gray-200 text-gray-700 font-semibold rounded-2xl py-4 text-sm shadow-sm hover:border-gray-300 hover:-translate-y-0.5 hover:shadow-md active:scale-95 transition-all duration-200"
            >
              <IconRefresh />
              Diagnosis Ulang
            </button>
            <Link
              href="/"
              className="flex items-center justify-center gap-2.5 bg-[var(--brand)] hover:bg-[var(--brand-mid)] text-white font-semibold rounded-2xl py-4 text-sm shadow-sm hover:-translate-y-0.5 hover:shadow-md active:scale-95 transition-all duration-200"
            >
              <IconHome />
              Kembali ke Beranda
            </Link>
          </div>

        </div>
      </main>

      {/* ── Footer ──────────────────────────────────────────────────────── */}
      <footer className="py-8 border-t border-gray-100/80 bg-white mt-4">
        <div className="max-w-5xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded-lg bg-[var(--brand)] flex items-center justify-center">
              <span className="text-white text-[9px] font-bold">A</span>
            </div>
            <span className="text-xs font-semibold text-gray-600">AgroSense</span>
          </div>
          <p className="text-xs text-[var(--fg-tertiary)]">
            &copy; {new Date().getFullYear()} AgroSense &mdash; Powered by FastAPI &amp; Astra DB
          </p>
        </div>
      </footer>
    </div>
  );
}

export default function ResultPage() {
  return <ResultInner />;
}
