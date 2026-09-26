'use client';

import { useState, useRef, useCallback, DragEvent } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { useAgroSense } from '../context/agrosense';
import type { AnalyzeResponse, DiagnosisHistory } from '@/types';

/* ── icons ───────────────────────────────────────────────────────────────── */
function IconUpload({ dragging }: { dragging: boolean }) {
  return dragging ? (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-7 h-7 text-emerald-600">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 16v-8m0 0-3 3m3-3 3 3M4.5 19.5h15" />
    </svg>
  ) : (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-7 h-7 text-gray-400">
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5m-13.5-9L12 3m0 0 4.5 4.5M12 3v13.5" />
    </svg>
  );
}
function IconCamera() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-4 h-4">
      <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 0 1 5.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 0 0 2.25 2.25h15A2.25 2.25 0 0 0 21.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 0 0-1.134-.175 2.31 2.31 0 0 1-1.64-1.055l-.822-1.316a2.192 2.192 0 0 0-1.736-1.039 48.774 48.774 0 0 0-5.232 0 2.192 2.192 0 0 0-1.736 1.039l-.821 1.316Z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 1 1-9 0 4.5 4.5 0 0 1 9 0ZM18.75 10.5h.008v.008h-.008V10.5Z" />
    </svg>
  );
}
function IconTrash() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-3.5 h-3.5">
      <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
    </svg>
  );
}
function IconArrowRight() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-3.5 h-3.5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
    </svg>
  );
}
function IconClock() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-4 h-4">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
    </svg>
  );
}
function Spinner() {
  return (
    <svg className="animate-spin w-[18px] h-[18px] shrink-0" fill="none" viewBox="0 0 24 24">
      <circle className="opacity-20" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
      <path className="opacity-90" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
    </svg>
  );
}

/* ── ROI badge ───────────────────────────────────────────────────────────── */
function RoiBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    Positive: 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200',
    Negative: 'bg-red-50 text-red-600 ring-1 ring-red-200',
    Neutral:  'bg-gray-100 text-gray-500 ring-1 ring-gray-200',
  };
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${map[status] ?? map.Neutral}`}>
      {status}
    </span>
  );
}

/* ── result skeleton ─────────────────────────────────────────────────────── */
function Skel({ className = '' }: { className?: string }) {
  return <div className={`rounded-xl bg-gray-100 animate-skeleton ${className}`} />;
}
function ResultSkeleton() {
  return (
    <div className="rounded-2xl border border-gray-100 bg-gray-50/60 p-6 space-y-5">
      <div className="space-y-2"><Skel className="h-2.5 w-16" /><Skel className="h-5 w-3/4" /></div>
      <div className="space-y-2">
        <Skel className="h-2.5 w-24" />
        <Skel className="h-4 w-full" /><Skel className="h-4 w-10/12" /><Skel className="h-4 w-2/3" />
      </div>
      <div className="flex items-center justify-between pt-4 border-t border-gray-100">
        <div className="space-y-2"><Skel className="h-2.5 w-20" /><Skel className="h-7 w-32" /></div>
        <Skel className="h-7 w-24 rounded-full" />
      </div>
      <div className="grid grid-cols-2 gap-2">
        <Skel className="h-11 rounded-2xl" /><Skel className="h-11 rounded-2xl" />
      </div>
    </div>
  );
}

/* ── history row ─────────────────────────────────────────────────────────── */
function HistoryRow({ entry, onView }: { entry: DiagnosisHistory; onView: (e: DiagnosisHistory) => void }) {
  return (
    <button
      onClick={() => onView(entry)}
      className="w-full text-left flex items-center gap-4 px-5 py-4 hover:bg-gray-50 transition-colors duration-150 group"
    >
      {/* thumbnail or fallback */}
      <div className="w-10 h-10 rounded-xl bg-[var(--brand-light)] flex items-center justify-center shrink-0 overflow-hidden">
        {entry.imageName ? (
          <span className="text-[10px] font-bold text-[var(--brand)] uppercase">{entry.imageName.slice(0, 3)}</span>
        ) : (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-5 h-5 text-[var(--brand)]">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 3a9 9 0 1 1 0 18A9 9 0 0 1 12 3Zm0 0v9m0 0 3.5-3.5M12 12l-3.5-3.5" />
          </svg>
        )}
      </div>

      {/* info */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-gray-900 truncate">{entry.result.diagnosis}</p>
        <p className="text-xs text-[var(--fg-tertiary)] truncate mt-0.5">
          {entry.symptomText ? entry.symptomText.slice(0, 60) + (entry.symptomText.length > 60 ? '…' : '') : 'Tidak ada deskripsi gejala'}
        </p>
      </div>

      {/* meta */}
      <div className="flex flex-col items-end gap-1 shrink-0">
        <RoiBadge status={entry.result.roi_status} />
        <span className="text-[10px] text-gray-300">
          {new Date(entry.timestamp).toLocaleDateString('id-ID', { day: '2-digit', month: 'short' })}
        </span>
      </div>

      <IconArrowRight />
    </button>
  );
}

/* ── main inner component ────────────────────────────────────────────────── */
function DiagnosisInner() {
  const router = useRouter();
  const { setLatestResult, history, addHistory, clearHistory } = useAgroSense();

  const [textInput, setTextInput]         = useState('');
  const [imageFile, setImageFile]         = useState<File | null>(null);
  const [imagePreview, setImagePreview]   = useState<string | null>(null);
  const [imageUrl, setImageUrl]           = useState('');
  const [isDragging, setIsDragging]       = useState(false);
  const [loading, setLoading]             = useState(false);
  const [error, setError]                 = useState<string | null>(null);
  const [logLoading, setLogLoading]       = useState(false);
  const [pendingResult, setPendingResult] = useState<AnalyzeResponse | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraRef    = useRef<HTMLInputElement>(null);

  /* drag-and-drop */
  const onDragOver  = useCallback((e: DragEvent<HTMLDivElement>) => { e.preventDefault(); setIsDragging(true); }, []);
  const onDragLeave = useCallback((e: DragEvent<HTMLDivElement>) => {
    if (!e.currentTarget.contains(e.relatedTarget as Node)) setIsDragging(false);
  }, []);
  const onDrop = useCallback((e: DragEvent<HTMLDivElement>) => {
    e.preventDefault(); setIsDragging(false);
    const f = e.dataTransfer.files?.[0];
    if (f?.type.startsWith('image/')) {
      setImageFile(f);
      setImageUrl('');
      setImagePreview(URL.createObjectURL(f));
    }
  }, []);
  const pickFile = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0] ?? null;
    if (f) {
      setImageFile(f);
      setImageUrl('');
      setImagePreview(URL.createObjectURL(f));
    }
  }, []);

  const clearImage = useCallback(() => {
    setImageFile(null);
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
    if (cameraRef.current) cameraRef.current.value = '';
  }, []);

  /* analyze */
  const handleAnalyze = async (e: React.SyntheticEvent) => {
    e.preventDefault();
    if (!textInput && !imageFile && !imageUrl) return;
    setLoading(true); setError(null); setPendingResult(null);
    try {
      const fd = new FormData();
      fd.append('text', textInput || ' ');
      if (imageFile)     fd.append('image', imageFile);
      else if (imageUrl) fd.append('image_url', imageUrl);

      const res = await fetch('/api/analyze', { method: 'POST', body: fd });
      if (!res.ok) {
        const d = await res.json().catch(() => ({ detail: res.statusText }));
        throw new Error(d?.detail ?? `Server error ${res.status}`);
      }
      const data: AnalyzeResponse = await res.json();
      setPendingResult(data); setLatestResult(data);
      addHistory({
        id: crypto.randomUUID(),
        timestamp: new Date().toISOString(),
        symptomText: textInput,
        imageName: imageFile?.name,
        result: data,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Terjadi kesalahan tak terduga.');
    } finally {
      setLoading(false);
    }
  };

  /* log & navigate to result */
  const handleLogAndNavigate = async () => {
    if (!pendingResult) return;
    setLogLoading(true); setError(null);
    try {
      const res = await fetch('/api/transaction', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          item_name: pendingResult.recommended_action.slice(0, 80),
          cost: pendingResult.cost_estimate,
          timestamp: new Date().toISOString(),
        }),
      });
      if (!res.ok) { const d = await res.json().catch(() => ({ detail: res.statusText })); throw new Error(d?.detail); }
      router.push('/result');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal mencatat pengeluaran.');
    } finally { setLogLoading(false); }
  };

  const canSubmit = !loading && (!!textInput.trim() || !!imageFile || !!imageUrl);

  return (
    <div className="min-h-screen flex flex-col bg-[var(--bg-page)]">
      <main className="flex-1 pt-[52px]">

        {/* page header */}
        <div className="bg-white border-b border-gray-100/80">
          <div className="max-w-5xl mx-auto px-6 py-10">
            <p className="text-[11px] font-semibold text-emerald-600 uppercase tracking-widest mb-2 animate-fade-in">
              Module 01 — AI Diagnosis
            </p>
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-gray-900 mb-3 animate-fade-up">
              Diagnosis Tanaman
            </h1>
            <p className="text-base text-[var(--fg-secondary)] max-w-xl animate-fade-up" style={{ animationDelay: '60ms' }}>
              Ceritakan gejala atau unggah foto tanaman Anda. AI kami akan
              mendiagnosis kondisi tanaman dan memberikan rekomendasi tindakan
              beserta estimasi biaya.
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

          {/* ══ INPUT FORM ════════════════════════════════════════════════ */}
          <div className="bg-white border border-gray-100 rounded-3xl shadow-[var(--shadow-card)] overflow-hidden animate-fade-up">

            <div className="px-8 pt-8 pb-6 border-b border-gray-100/60">
              <h2 className="text-base font-semibold text-gray-900 tracking-tight">Input Data Tanaman</h2>
              <p className="text-xs text-[var(--fg-tertiary)] mt-1">Isi minimal satu input — foto atau deskripsi gejala</p>
            </div>

            <form onSubmit={handleAnalyze} className="px-8 py-8 space-y-8">

              {/* ── Upload foto ── */}
              <div className="space-y-3">
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-widest">
                  Foto Tanaman
                </label>

                {/* drag-drop zone with live preview */}
                {imagePreview ? (
                  /* preview state */
                  <div className="relative rounded-2xl overflow-hidden border border-gray-200 bg-gray-50">
                    <Image
                      src={imagePreview}
                      alt="Preview tanaman"
                      width={800}
                      height={320}
                      className="w-full h-56 object-cover"
                      unoptimized
                    />
                    {/* overlay bar */}
                    <div className="absolute bottom-0 inset-x-0 bg-white/90 backdrop-blur-sm border-t border-gray-100 px-4 py-2.5 flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2 min-w-0">
                        <div className="w-5 h-5 rounded-lg bg-emerald-100 flex items-center justify-center shrink-0">
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-3 h-3 text-emerald-600">
                            <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                          </svg>
                        </div>
                        <span className="text-xs font-medium text-gray-800 truncate">{imageFile?.name}</span>
                      </div>
                      <button
                        type="button"
                        onClick={clearImage}
                        className="flex items-center gap-1 text-xs text-red-500 hover:text-red-700 transition-colors duration-150 shrink-0"
                      >
                        <IconTrash /> Ganti foto
                      </button>
                    </div>
                  </div>
                ) : (
                  /* drop zone */
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    onDragOver={onDragOver}
                    onDragLeave={onDragLeave}
                    onDrop={onDrop}
                    className={[
                      'relative flex flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed',
                      'cursor-pointer py-12 px-6 select-none transition-all duration-300',
                      isDragging
                        ? 'border-emerald-500 bg-emerald-50/60 scale-[0.99]'
                        : 'border-gray-200 bg-gray-50/40 hover:border-emerald-300 hover:bg-emerald-50/20',
                    ].join(' ')}
                  >
                    <div className={[
                      'w-14 h-14 rounded-2xl bg-white border flex items-center justify-center shadow-sm transition-all duration-300',
                      isDragging ? 'border-emerald-300 scale-110 shadow-md' : 'border-gray-100',
                    ].join(' ')}>
                      <IconUpload dragging={isDragging} />
                    </div>

                    {isDragging ? (
                      <p className="text-base font-semibold text-emerald-600">Lepas untuk mengunggah</p>
                    ) : (
                      <div className="text-center space-y-1">
                        <p className="text-sm font-medium text-gray-700">
                          Klik untuk memilih atau <span className="text-emerald-600">seret foto ke sini</span>
                        </p>
                        <p className="text-xs text-[var(--fg-tertiary)]">PNG, JPG, WEBP · maks. 10 MB</p>
                      </div>
                    )}
                    <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={pickFile} />
                  </div>
                )}

                {/* action pills */}
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => cameraRef.current?.click()}
                    className="inline-flex items-center gap-1.5 text-xs text-[var(--fg-secondary)] bg-white border border-gray-200 rounded-full px-3.5 py-1.5 hover:border-emerald-300 hover:text-emerald-700 transition-all duration-200 shadow-sm"
                  >
                    <IconCamera /> Kamera
                  </button>
                  {imageFile && (
                    <button
                      type="button"
                      onClick={clearImage}
                      className="inline-flex items-center gap-1.5 text-xs text-red-500 bg-red-50 border border-red-100 rounded-full px-3.5 py-1.5 hover:border-red-300 transition-all duration-200"
                    >
                      <IconTrash /> Hapus Foto
                    </button>
                  )}
                </div>
                <input ref={cameraRef} type="file" accept="image/*" capture="environment" className="hidden" onChange={pickFile} />

                {/* URL fallback */}
                <div className="flex items-center gap-3">
                  <div className="flex-1 h-px bg-gray-100" />
                  <span className="text-[11px] text-[var(--fg-tertiary)] font-medium">atau gunakan URL</span>
                  <div className="flex-1 h-px bg-gray-100" />
                </div>
                <input
                  type="url"
                  value={imageUrl}
                  onChange={e => { setImageUrl(e.target.value); if (e.target.value) clearImage(); }}
                  placeholder="https://contoh.com/foto-tanaman.jpg"
                  className="w-full rounded-2xl border border-gray-200 bg-gray-50/60 px-4 py-3 text-sm text-gray-800 placeholder-[var(--fg-tertiary)] focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all duration-200"
                />
              </div>

              {/* ── Gejala textarea ── */}
              <div className="space-y-3">
                <label htmlFor="symptom" className="block text-xs font-semibold text-gray-500 uppercase tracking-widest">
                  Keluhan / Gejala Tanaman
                </label>
                <textarea
                  id="symptom"
                  value={textInput}
                  onChange={e => setTextInput(e.target.value)}
                  rows={5}
                  placeholder="Contoh: Daun cabai saya menguning dan layu sejak 3 hari lalu. Ada bercak coklat di pinggir daun, batang terasa agak lunak ketika dipegang, dan tanaman kelihatan kerdil…"
                  className="w-full rounded-2xl border border-gray-200 bg-gray-50/60 px-4 py-4 text-sm text-gray-900 placeholder-[var(--fg-tertiary)] focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all duration-200 resize-none hover:border-gray-300 leading-relaxed"
                />
                <div className="flex items-center justify-between">
                  <p className="text-xs text-[var(--fg-tertiary)]">Semakin detail deskripsi Anda, semakin akurat diagnosis AI.</p>
                  <span className={`text-xs tabular-nums transition-colors duration-200 ${textInput.length > 400 ? 'text-amber-500' : 'text-[var(--fg-tertiary)]'}`}>
                    {textInput.length} / 500
                  </span>
                </div>
              </div>

              {/* ── submit ── */}
              <button
                type="submit"
                disabled={!canSubmit}
                className="w-full flex items-center justify-center gap-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-100 disabled:text-gray-400 text-white font-semibold rounded-2xl py-4 text-sm shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md active:scale-95 disabled:cursor-not-allowed disabled:translate-y-0 disabled:shadow-none"
              >
                {loading ? (
                  <><Spinner /> <span>Menganalisis… mohon tunggu</span></>
                ) : (
                  <>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-4 h-4">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09Z" />
                    </svg>
                    Analisis Tanaman Sekarang
                  </>
                )}
              </button>
            </form>

            {/* loading skeleton */}
            {loading && (
              <div className="px-8 pb-8 animate-fade-in">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-2 h-2 rounded-full bg-emerald-500 animate-bounce" style={{ animationDelay: '0ms' }} />
                  <div className="w-2 h-2 rounded-full bg-emerald-400 animate-bounce" style={{ animationDelay: '150ms' }} />
                  <div className="w-2 h-2 rounded-full bg-emerald-300 animate-bounce" style={{ animationDelay: '300ms' }} />
                  <span className="text-xs text-[var(--fg-tertiary)]">AI sedang menganalisis…</span>
                </div>
                <ResultSkeleton />
              </div>
            )}

            {/* inline result preview */}
            {!loading && pendingResult && (
              <div className="px-8 pb-8 animate-fade-up">
                <div className="rounded-2xl border border-gray-100 bg-gray-50/60 overflow-hidden">
                  {/* result header */}
                  <div className="bg-emerald-50 border-b border-emerald-100/60 px-5 py-3 flex items-center gap-2">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-4 h-4 text-emerald-600 shrink-0">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                    </svg>
                    <span className="text-xs font-semibold text-emerald-700">Analisis selesai</span>
                  </div>

                  <div className="px-5 py-5 space-y-4">
                    <div>
                      <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest mb-1">Diagnosis</p>
                      <p className="text-sm font-semibold text-gray-900 leading-snug">{pendingResult.diagnosis}</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest mb-1">Rekomendasi Tindakan</p>
                      <p className="text-sm text-[var(--fg-secondary)] leading-relaxed">{pendingResult.recommended_action}</p>
                    </div>
                    <div className="flex items-end justify-between pt-4 border-t border-gray-100">
                      <div>
                        <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest mb-1">Estimasi Biaya</p>
                        <p className="text-xl font-bold text-gray-900 tabular-nums">
                          Rp {pendingResult.cost_estimate.toLocaleString('id-ID')}
                        </p>
                      </div>
                      <RoiBadge status={pendingResult.roi_status} />
                    </div>
                  </div>

                  <div className="px-5 pb-5 grid grid-cols-2 gap-2.5">
                    <button
                      onClick={() => router.push('/result')}
                      className="rounded-2xl border border-gray-200 bg-white text-gray-700 py-3 text-sm font-medium hover:border-gray-300 hover:bg-gray-50 transition-all duration-200 active:scale-95"
                    >
                      Lihat Detail Lengkap
                    </button>
                    <button
                      onClick={handleLogAndNavigate}
                      disabled={logLoading}
                      className="inline-flex items-center justify-center gap-2 rounded-2xl bg-gray-900 text-white py-3 text-sm font-semibold hover:bg-gray-700 hover:-translate-y-0.5 hover:shadow-md active:scale-95 disabled:opacity-40 transition-all duration-200"
                    >
                      {logLoading ? <><Spinner /> Mencatat…</> : 'Beli & Catat'}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* ══ LOCAL HISTORY ═════════════════════════════════════════════ */}
          <div className="bg-white border border-gray-100 rounded-3xl shadow-[var(--shadow-card)] overflow-hidden animate-fade-up" style={{ animationDelay: '80ms' }}>

            {/* section header */}
            <div className="px-8 py-6 border-b border-gray-100/60 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-[var(--brand-light)] text-[var(--brand)] flex items-center justify-center">
                  <IconClock />
                </div>
                <div>
                  <h2 className="text-sm font-semibold text-gray-900 tracking-tight">Riwayat Diagnosis Lokal</h2>
                  <p className="text-xs text-[var(--fg-tertiary)] mt-0.5">
                    {history.length > 0
                      ? `${history.length} pemeriksaan tersimpan di browser ini`
                      : 'Tersimpan di memori browser — privat & tidak dikirim ke server'}
                  </p>
                </div>
              </div>
              {history.length > 0 && (
                <button
                  onClick={clearHistory}
                  className="flex items-center gap-1.5 text-xs text-[var(--fg-tertiary)] hover:text-red-500 transition-colors duration-200 border border-gray-200 rounded-full px-3 py-1.5 hover:border-red-200"
                >
                  <IconTrash /> Hapus Semua
                </button>
              )}
            </div>

            {/* list */}
            {history.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 gap-4 px-8">
                <div className="w-14 h-14 rounded-2xl bg-gray-50 border border-gray-100 flex items-center justify-center">
                  <IconClock />
                </div>
                <div className="text-center">
                  <p className="text-sm font-medium text-gray-700">Belum ada riwayat diagnosis</p>
                  <p className="text-xs text-[var(--fg-tertiary)] mt-1 max-w-xs leading-relaxed">
                    Setelah Anda melakukan diagnosis, hasilnya akan muncul di sini
                    sebagai referensi cepat.
                  </p>
                </div>
              </div>
            ) : (
              <div className="divide-y divide-gray-100/80">
                {history.map(entry => (
                  <HistoryRow
                    key={entry.id}
                    entry={entry}
                    onView={e => { setLatestResult(e.result); router.push('/result'); }}
                  />
                ))}
              </div>
            )}

            {/* footer note */}
            {history.length > 0 && (
              <div className="px-8 py-4 border-t border-gray-100/60 bg-gray-50/40">
                <p className="text-[11px] text-[var(--fg-tertiary)]">
                  Data riwayat hanya tersimpan di browser ini dan akan hilang jika cache dihapus.
                </p>
              </div>
            )}
          </div>

        </div>
      </main>

      {/* footer */}
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

export default function DiagnosisPage() {
  return <DiagnosisInner />;
}
