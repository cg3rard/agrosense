'use client';

import { useState, useRef, useCallback, DragEvent } from 'react';
import type { AnalyzeResponse, TransactionResponse } from '@/types';

/* ─────────────────────────────────────────────
   Sub-components
───────────────────────────────────────────── */
function Spinner({ size = 4 }: { size?: number }) {
  return (
    <svg
      style={{ width: `${size * 4}px`, height: `${size * 4}px` }}
      className="animate-spin text-current shrink-0"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
    </svg>
  );
}

function SkeletonBlock({ className = '' }: { className?: string }) {
  return (
    <div
      className={`rounded-lg bg-gray-200/70 [animation:skeleton_1.4s_ease-in-out_infinite] ${className}`}
    />
  );
}

function ResultSkeleton() {
  return (
    <div className="mx-7 mb-7 rounded-2xl bg-gray-50/80 border border-gray-100 overflow-hidden [animation:fade-in_0.3s_ease-out_forwards]">
      <div className="px-5 py-4 space-y-5">
        <div className="space-y-1.5">
          <SkeletonBlock className="h-2.5 w-16" />
          <SkeletonBlock className="h-4 w-3/4" />
        </div>
        <div className="space-y-1.5">
          <SkeletonBlock className="h-2.5 w-20" />
          <SkeletonBlock className="h-4 w-full" />
          <SkeletonBlock className="h-4 w-5/6" />
        </div>
        <div className="flex items-center justify-between pt-3 border-t border-gray-200/80">
          <div className="space-y-1.5">
            <SkeletonBlock className="h-2.5 w-20" />
            <SkeletonBlock className="h-6 w-28" />
          </div>
          <SkeletonBlock className="h-7 w-20 rounded-full" />
        </div>
      </div>
      <div className="px-5 pb-5">
        <SkeletonBlock className="h-10 w-full rounded-xl" />
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   Main page
───────────────────────────────────────────── */
export default function AgroSenseDashboard() {
  const [textInput, setTextInput]     = useState('');
  const [imageFile, setImageFile]     = useState<File | null>(null);
  const [imageUrl, setImageUrl]       = useState('');
  const [isDragging, setIsDragging]   = useState(false);
  const [loading, setLoading]         = useState(false);
  const [error, setError]             = useState<string | null>(null);
  const [aiResult, setAiResult]       = useState<AnalyzeResponse | null>(null);
  const [expenses, setExpenses]       = useState<TransactionResponse[]>([]);
  const [logLoading, setLogLoading]   = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  /* ── drag-and-drop handlers ── */
  const onDragOver = useCallback((e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);
  const onDragLeave = useCallback(() => setIsDragging(false), []);
  const onDrop = useCallback((e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith('image/')) {
      setImageFile(file);
      setImageUrl('');
    }
  }, []);

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    setImageFile(file);
    if (file) setImageUrl('');
  }, []);

  const handleImageUrlChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setImageUrl(e.target.value);
    if (e.target.value) setImageFile(null);
  }, []);

  /* ── analyze ── */
  const handleAnalyze = async (e: React.SyntheticEvent) => {
    e.preventDefault();
    if (!textInput && !imageFile && !imageUrl) return;

    setLoading(true);
    setAiResult(null);
    setError(null);

    try {
      // image_url is optional — only include it when the user provided a real public URL.
      // Local file drag-drop is for preview only; upload-to-CDN can be added later.
      const payload: Record<string, unknown> = { text: textInput };
      if (imageUrl) payload.image_url = imageUrl;

      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const detail = await res.json().catch(() => ({ detail: res.statusText }));
        throw new Error(detail?.detail ?? `Server error ${res.status}`);
      }

      const data: AnalyzeResponse = await res.json();
      setAiResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Terjadi kesalahan.');
    } finally {
      setLoading(false);
    }
  };

  /* ── log expense ── */
  const handleLogExpense = async () => {
    if (!aiResult) return;
    setLogLoading(true);
    setError(null);

    try {
      const payload = {
        item_name: aiResult.recommended_action.slice(0, 80),
        cost: aiResult.cost_estimate,
        timestamp: new Date().toISOString(),
      };

      const res = await fetch('/api/transaction', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const detail = await res.json().catch(() => ({ detail: res.statusText }));
        throw new Error(detail?.detail ?? `Server error ${res.status}`);
      }

      const saved: TransactionResponse = await res.json();
      setExpenses(prev => [saved, ...prev]);
      setAiResult(null);
      setTextInput('');
      setImageFile(null);
      setImageUrl('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal mencatat pengeluaran.');
    } finally {
      setLogLoading(false);
    }
  };

  const totalExpenses = expenses.reduce((acc, e) => acc + e.cost, 0);
  const canSubmit     = !loading && (!!textInput || !!imageFile || !!imageUrl);

  /* ── upload zone classes ── */
  const dropZoneBase =
    'relative flex flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed ' +
    'cursor-pointer py-8 px-4 transition-all duration-300 ease-in-out select-none';
  const dropZoneIdle   = 'border-gray-200 bg-gray-50/60 hover:border-emerald-300 hover:bg-emerald-50/40 hover:shadow-sm';
  const dropZoneActive = 'border-emerald-400 bg-emerald-50/60 scale-[0.99] shadow-inner';

  return (
    <div className="min-h-screen bg-[#f5f5f7] font-sans antialiased">

      {/* ── Navbar ─────────────────────────────────────────────────────── */}
      <nav className="sticky top-0 z-20 bg-white/80 backdrop-blur-xl border-b border-gray-100/80 transition-shadow duration-300">
        <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-emerald-600 flex items-center justify-center shadow-sm transition-transform duration-200 hover:scale-110">
              <span className="text-white text-xs font-bold select-none">A</span>
            </div>
            <span className="text-sm font-semibold text-gray-900 tracking-tight">AgroSense</span>
          </div>

          <span className="hidden sm:block text-xs text-gray-400 tracking-wide">
            AI Agronomist &amp; Financial OS
          </span>

          <span
            className={`text-xs font-medium rounded-full px-3 py-1 border transition-all duration-500 ${
              expenses.length > 0
                ? 'opacity-100 bg-emerald-50 text-emerald-700 border-emerald-100'
                : 'opacity-0 pointer-events-none bg-transparent text-transparent border-transparent'
            }`}
          >
            {expenses.length} {expenses.length === 1 ? 'expense' : 'expenses'} logged
          </span>
        </div>
      </nav>

      {/* ── Main ───────────────────────────────────────────────────────── */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-12">

        {/* Heading */}
        <div className="mb-10 [animation:fade-up_0.45s_cubic-bezier(0.16,1,0.3,1)_forwards]">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">Dashboard</h1>
          <p className="mt-1 text-sm text-gray-500">Diagnose crop conditions and track operational expenses.</p>
        </div>

        {/* Error banner */}
        {error && (
          <div className="mb-6 rounded-2xl bg-red-50 border border-red-200 px-5 py-3 text-sm text-red-700 [animation:fade-in_0.3s_ease-out_forwards]">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">

          {/* ══ Diagnosis card ══════════════════════════════════════════ */}
          <div className="bg-white/70 backdrop-blur-md border border-gray-100 rounded-3xl shadow-sm shadow-gray-200/60 overflow-hidden transition-shadow duration-300 hover:shadow-md [animation:fade-up_0.45s_0.05s_cubic-bezier(0.16,1,0.3,1)_both]">

            {/* Card header */}
            <div className="px-7 pt-7 pb-5 border-b border-gray-100/80">
              <p className="text-[11px] font-semibold text-emerald-600 uppercase tracking-widest mb-0.5">Module 01</p>
              <h2 className="text-lg font-semibold text-gray-900 tracking-tight">Diagnosis Tanaman</h2>
            </div>

            <form onSubmit={handleAnalyze} className="px-7 py-6 space-y-5">

              {/* Upload zone */}
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-2 tracking-wide uppercase">
                  Foto Tanaman
                </label>
                <div
                  onClick={() => fileInputRef.current?.click()}
                  onDragOver={onDragOver}
                  onDragLeave={onDragLeave}
                  onDrop={onDrop}
                  className={`${dropZoneBase} ${isDragging ? dropZoneActive : dropZoneIdle}`}
                >
                  {/* Icon tile */}
                  <div className={`w-10 h-10 rounded-xl bg-white border flex items-center justify-center shadow-sm transition-all duration-300 ${isDragging ? 'border-emerald-300 scale-110' : 'border-gray-100'}`}>
                    {isDragging ? (
                      <svg className="w-5 h-5 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 16v-8m0 0l-3 3m3-3l3 3M4.5 19.5h15" />
                      </svg>
                    ) : (
                      <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
                      </svg>
                    )}
                  </div>

                  {imageFile ? (
                    <div className="text-center [animation:fade-in_0.3s_ease-out_forwards]">
                      <p className="text-sm font-medium text-gray-800">{imageFile.name}</p>
                      <p className="text-xs text-emerald-600 mt-0.5">✓ Siap dianalisis</p>
                    </div>
                  ) : isDragging ? (
                    <p className="text-sm font-medium text-emerald-600">Drop to upload</p>
                  ) : (
                    <div className="text-center">
                      <p className="text-sm text-gray-500">Click or drag &amp; drop</p>
                      <p className="text-xs text-gray-400 mt-0.5">PNG, JPG, WEBP · max 10 MB</p>
                    </div>
                  )}
                  <input ref={fileInputRef} type="file" accept="image/*" className="hidden"
                    onChange={handleFileChange} />
                </div>

                {/* Image URL input (alternative to file upload) */}
                <div className="mt-2">
                  <input
                    type="url"
                    value={imageUrl}
                    onChange={handleImageUrlChange}
                    placeholder="…atau tempel URL gambar publik"
                    className="w-full rounded-xl border border-gray-200 bg-gray-50/60 px-3 py-2 text-xs text-gray-700 placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-emerald-400/30 focus:border-emerald-300 transition-all duration-200"
                  />
                </div>
              </div>

              {/* Text input */}
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-2 tracking-wide uppercase">
                  Keluhan / Gejala
                </label>
                <textarea
                  value={textInput}
                  onChange={(e) => setTextInput(e.target.value)}
                  rows={3}
                  placeholder="Contoh: Daun menguning sejak 3 hari lalu, ada bercak coklat…"
                  className="w-full rounded-2xl border border-gray-200 bg-gray-50/60 px-4 py-3 text-sm text-gray-800 placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-emerald-400/30 focus:border-emerald-300 transition-all duration-200 resize-none hover:border-gray-300"
                />
              </div>

              {/* Analyse CTA */}
              <button
                type="submit"
                disabled={!canSubmit}
                className="w-full flex items-center justify-center gap-2 rounded-2xl bg-emerald-600 py-3 text-sm font-semibold text-white shadow-sm transition-all duration-200 ease-in-out hover:bg-emerald-500 hover:-translate-y-0.5 hover:shadow-md active:scale-95 active:bg-emerald-700 active:translate-y-0 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:shadow-sm"
              >
                {loading ? <><Spinner size={4} /> Menganalisis…</> : 'Analisis dengan AI'}
              </button>
            </form>

            {/* Skeleton while loading */}
            {loading && <ResultSkeleton />}

            {/* AI result */}
            {!loading && aiResult && (
              <div className="mx-7 mb-7 rounded-2xl bg-gray-50/80 border border-gray-100 overflow-hidden [animation:fade-up_0.45s_cubic-bezier(0.16,1,0.3,1)_forwards]">
                <div className="px-5 py-4 space-y-4">

                  <div>
                    <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest mb-0.5">Diagnosis</p>
                    <p className="text-sm font-medium text-gray-900">{aiResult.diagnosis}</p>
                  </div>

                  <div>
                    <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest mb-0.5">Rekomendasi</p>
                    <p className="text-sm text-gray-700 leading-relaxed">{aiResult.recommended_action}</p>
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-gray-200/80">
                    <div>
                      <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest mb-0.5">Estimasi Biaya</p>
                      <p className="text-base font-bold text-gray-900 tabular-nums">
                        Rp {aiResult.cost_estimate.toLocaleString('id-ID')}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest mb-1">ROI Status</p>
                      <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold transition-colors duration-200 ${
                        aiResult.roi_status === 'Positive'
                          ? 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200'
                          : aiResult.roi_status === 'Negative'
                          ? 'bg-red-50 text-red-600 ring-1 ring-red-200'
                          : 'bg-gray-100 text-gray-500 ring-1 ring-gray-200'
                      }`}>
                        {aiResult.roi_status}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Log expense button */}
                <div className="px-5 pb-5">
                  <button
                    onClick={handleLogExpense}
                    disabled={logLoading}
                    className="w-full flex items-center justify-center gap-2 rounded-xl bg-gray-900 py-2.5 text-sm font-semibold text-white transition-all duration-200 ease-in-out hover:bg-gray-700 hover:-translate-y-0.5 hover:shadow-md active:scale-95 active:bg-black active:translate-y-0 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:shadow-none"
                  >
                    {logLoading ? <><Spinner size={4} /> Mencatat…</> : 'Beli & Catat Pengeluaran'}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* ══ Finance card ════════════════════════════════════════════ */}
          <div className="bg-white/70 backdrop-blur-md border border-gray-100 rounded-3xl shadow-sm shadow-gray-200/60 overflow-hidden transition-shadow duration-300 hover:shadow-md [animation:fade-up_0.45s_0.1s_cubic-bezier(0.16,1,0.3,1)_both]">

            {/* Card header */}
            <div className="px-7 pt-7 pb-5 border-b border-gray-100/80 flex items-start justify-between">
              <div>
                <p className="text-[11px] font-semibold text-emerald-600 uppercase tracking-widest mb-0.5">Module 02</p>
                <h2 className="text-lg font-semibold text-gray-900 tracking-tight">Buku Kas Operasional</h2>
              </div>
              <div className={`text-right transition-all duration-500 ${expenses.length > 0 ? 'opacity-100' : 'opacity-0'}`}>
                <p className="text-[10px] text-gray-400 uppercase tracking-widest font-semibold mb-0.5">Total</p>
                <p className="text-base font-bold text-gray-900 tabular-nums">
                  Rp {totalExpenses.toLocaleString('id-ID')}
                </p>
              </div>
            </div>

            {/* Body */}
            <div className="px-7 py-6">
              {expenses.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-14 gap-3 [animation:fade-in_0.35s_ease-out_forwards]">
                  <div className="w-12 h-12 rounded-2xl bg-gray-50 border border-gray-100 flex items-center justify-center">
                    <svg className="w-5 h-5 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-3-3v6M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <p className="text-sm text-gray-400">Belum ada transaksi tercatat.</p>
                  <p className="text-xs text-gray-300 text-center max-w-[180px]">
                    Jalankan analisis dan catat rekomendasi sebagai pengeluaran.
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto -mx-1">
                  <table className="w-full text-left text-sm">
                    <thead>
                      <tr>
                        <th className="pb-3 pr-4 text-[10px] font-semibold text-gray-400 uppercase tracking-widest">Tanggal</th>
                        <th className="pb-3 pr-4 text-[10px] font-semibold text-gray-400 uppercase tracking-widest">Item</th>
                        <th className="pb-3 text-[10px] font-semibold text-gray-400 uppercase tracking-widest text-right">Nominal</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100/80">
                      {expenses.map((expense, i) => (
                        <tr
                          key={expense.id}
                          style={{ animationDelay: `${i * 40}ms` }}
                          className="[animation:fade-up_0.4s_cubic-bezier(0.16,1,0.3,1)_both] transition-colors duration-150 hover:bg-gray-50/60"
                        >
                          <td className="py-3 pr-4 text-xs text-gray-400 whitespace-nowrap">
                            {new Date(expense.timestamp).toLocaleDateString('id-ID', {
                              day: '2-digit', month: 'short', year: 'numeric',
                            })}
                          </td>
                          <td className="py-3 pr-4 font-medium text-gray-800 max-w-[140px] truncate">
                            {expense.item_name}
                          </td>
                          <td className="py-3 text-right font-semibold text-gray-700 tabular-nums">
                            Rp {expense.cost.toLocaleString('id-ID')}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Total bar */}
            {expenses.length > 0 && (
              <div className="mx-7 mb-7 rounded-2xl bg-gray-900 px-5 py-4 flex items-center justify-between [animation:fade-up_0.45s_cubic-bezier(0.16,1,0.3,1)_forwards]">
                <p className="text-xs font-medium text-gray-400">Total Pengeluaran</p>
                <p className="text-base font-bold text-white tabular-nums">
                  Rp {totalExpenses.toLocaleString('id-ID')}
                </p>
              </div>
            )}
          </div>

        </div>

        <p className="mt-14 text-center text-[11px] text-gray-300 tracking-wide">
          AgroSense &copy; {new Date().getFullYear()} &mdash; Powered by FastAPI &amp; Astra DB
        </p>
      </main>
    </div>
  );
}
