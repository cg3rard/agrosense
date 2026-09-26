'use client';

import { useState, useEffect } from 'react';
import type { TransactionResponse, TransactionRequest, ExpenseCategory } from '@/types';

/* ── Constants ────────────────────────────────────────────────────────────── */
const CATEGORIES: ExpenseCategory[] = ['Pupuk', 'Pestisida', 'Bibit', 'Alat', 'Lainnya'];

const CATEGORY_COLORS: Record<ExpenseCategory, { bg: string; text: string; dot: string }> = {
  Pupuk:     { bg: 'bg-emerald-50', text: 'text-emerald-700', dot: 'bg-emerald-400' },
  Pestisida: { bg: 'bg-amber-50',   text: 'text-amber-700',   dot: 'bg-amber-400'   },
  Bibit:     { bg: 'bg-sky-50',     text: 'text-sky-700',     dot: 'bg-sky-400'     },
  Alat:      { bg: 'bg-violet-50',  text: 'text-violet-700',  dot: 'bg-violet-400'  },
  Lainnya:   { bg: 'bg-gray-100',   text: 'text-gray-600',    dot: 'bg-gray-400'    },
};

/* ── Icons ────────────────────────────────────────────────────────────────── */
function IconPlus() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} className="w-4 h-4">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
    </svg>
  );
}
function IconTrash() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="w-4 h-4">
      <path strokeLinecap="round" strokeLinejoin="round"
        d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
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
function IconChart() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="w-5 h-5">
      <path strokeLinecap="round" strokeLinejoin="round"
        d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 0 1 3 19.875v-6.75ZM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V8.625ZM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V4.125Z" />
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

/* ── Category Badge ───────────────────────────────────────────────────────── */
function CategoryBadge({ category }: { category?: string }) {
  const cat = (category ?? 'Lainnya') as ExpenseCategory;
  const c = CATEGORY_COLORS[cat] ?? CATEGORY_COLORS.Lainnya;
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${c.bg} ${c.text}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${c.dot}`} />
      {cat}
    </span>
  );
}

/* ── Summary Metric Card ──────────────────────────────────────────────────── */
function MetricCard({
  icon, label, value, sub, accent,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  sub?: string;
  accent?: string;
}) {
  return (
    <div className={`rounded-3xl border p-6 flex items-start gap-4 ${accent ?? 'bg-white border-gray-100'}`}>
      <div className="w-11 h-11 rounded-2xl bg-[var(--brand-light)] text-[var(--brand)] flex items-center justify-center shrink-0">
        {icon}
      </div>
      <div className="min-w-0">
        <p className="text-[11px] font-semibold text-[var(--fg-tertiary)] uppercase tracking-widest mb-1">{label}</p>
        <p className="text-2xl font-bold text-gray-900 tabular-nums tracking-tight leading-none">{value}</p>
        {sub && <p className="text-xs text-[var(--fg-tertiary)] mt-1.5 leading-snug">{sub}</p>}
      </div>
    </div>
  );
}

/* ── Skeleton row ─────────────────────────────────────────────────────────── */
function SkeletonRow() {
  return (
    <tr>
      {[1, 2, 3, 4, 5].map(i => (
        <td key={i} className="px-5 py-3.5">
          <div className="h-4 rounded-lg bg-gray-100 animate-skeleton" style={{ width: `${[60, 140, 70, 80, 40][i - 1]}px` }} />
        </td>
      ))}
    </tr>
  );
}

/* ── Page ─────────────────────────────────────────────────────────────────── */
export default function ExpensesPage() {
  /* ── form state ── */
  const today = new Date().toISOString().slice(0, 10);
  const [itemName,  setItemName]  = useState('');
  const [category,  setCategory]  = useState<ExpenseCategory>('Pupuk');
  const [cost,      setCost]      = useState('');
  const [date,      setDate]      = useState(today);
  const [submitting, setSubmitting] = useState(false);
  const [formError,  setFormError]  = useState<string | null>(null);

  /* ── list state ── */
  const [expenses,    setExpenses]    = useState<TransactionResponse[]>([]);
  const [loading,     setLoading]     = useState(true);
  const [fetchError,  setFetchError]  = useState<string | null>(null);
  const [filterCat,   setFilterCat]   = useState<ExpenseCategory | 'Semua'>('Semua');

  /* ── fetch existing transactions ── */
  // Refresh key increments when the user hits "Coba lagi" → triggers the effect again
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      setFetchError(null);
      try {
        const res = await fetch('/api/transaction');
        if (!res.ok) throw new Error(`Error ${res.status}`);
        const data: TransactionResponse[] = await res.json();
        if (!cancelled) setExpenses(Array.isArray(data) ? data : []);
      } catch {
        if (!cancelled) setFetchError('Gagal memuat data pengeluaran. Periksa koneksi ke server.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [refreshKey]);

  /* ── submit form ── */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const costNum = parseFloat(cost.replace(/[^0-9.]/g, ''));
    if (!itemName.trim())      { setFormError('Nama barang wajib diisi.'); return; }
    if (isNaN(costNum) || costNum <= 0) { setFormError('Jumlah biaya harus berupa angka positif.'); return; }

    setSubmitting(true); setFormError(null);
    try {
      const body: TransactionRequest = {
        item_name: itemName.trim(),
        cost: costNum,
        category,
        timestamp: new Date(date).toISOString(),
      };
      const res = await fetch('/api/transaction', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        const d = await res.json().catch(() => ({ detail: res.statusText }));
        throw new Error(d?.detail ?? `Error ${res.status}`);
      }
      const saved: TransactionResponse = await res.json();
      setExpenses(prev => [saved, ...prev]);
      /* reset form */
      setItemName(''); setCost(''); setDate(today); setCategory('Pupuk');
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Gagal menyimpan transaksi.');
    } finally {
      setSubmitting(false);
    }
  };

  /* ── derived stats ── */
  const filtered = filterCat === 'Semua'
    ? expenses
    : expenses.filter(e => (e as TransactionResponse & { category?: string }).category === filterCat);

  const total       = expenses.reduce((s, e) => s + e.cost, 0);
  const thisMonth   = expenses.filter(e => {
    const d = new Date(e.timestamp);
    const now = new Date();
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  }).reduce((s, e) => s + e.cost, 0);

  const topCat = CATEGORIES.reduce<{ cat: ExpenseCategory; total: number }>(
    (best, cat) => {
      const t = expenses
        .filter(e => (e as TransactionResponse & { category?: string }).category === cat)
        .reduce((s, e) => s + e.cost, 0);
      return t > best.total ? { cat, total: t } : best;
    },
    { cat: 'Lainnya', total: 0 },
  );

  const formatRp = (n: number) =>
    n >= 1_000_000
      ? `Rp ${(n / 1_000_000).toFixed(1)}jt`
      : `Rp ${n.toLocaleString('id-ID')}`;

  return (
    <div className="min-h-screen flex flex-col bg-[var(--bg-page)]">
      <main className="flex-1 pt-[52px]">

        {/* ── Page header ───────────────────────────────────────────────── */}
        <div className="bg-white border-b border-gray-100/80">
          <div className="max-w-5xl mx-auto px-6 py-10">
            <p className="text-[11px] font-semibold text-emerald-600 uppercase tracking-widest mb-2 animate-fade-in">
              Module 02 — Financial Tracker
            </p>
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-gray-900 mb-3 animate-fade-up">
              Pencatatan Keuangan
            </h1>
            <p className="text-base text-[var(--fg-secondary)] max-w-xl animate-fade-up" style={{ animationDelay: '60ms' }}>
              Catat setiap pengeluaran operasional kebun — pupuk, pestisida, bibit, dan alat —
              dan pantau total biaya secara real-time.
            </p>
          </div>
        </div>

        <div className="max-w-5xl mx-auto px-6 py-10 space-y-8">

          {/* ══ SUMMARY CARDS ═══════════════════════════════════════════ */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 animate-fade-up">
            <MetricCard
              icon={<IconWallet />}
              label="Total Pengeluaran"
              value={`Rp ${total.toLocaleString('id-ID')}`}
              sub={`${expenses.length} transaksi tercatat`}
              accent="bg-white border-gray-100"
            />
            <MetricCard
              icon={<IconChart />}
              label="Bulan Ini"
              value={formatRp(thisMonth)}
              sub={new Date().toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })}
              accent="bg-white border-gray-100"
            />
            <MetricCard
              icon={<IconChart />}
              label="Kategori Terbesar"
              value={topCat.total > 0 ? topCat.cat : '—'}
              sub={topCat.total > 0 ? `Rp ${topCat.total.toLocaleString('id-ID')}` : 'Belum ada data'}
              accent="bg-[var(--brand-light)] border-emerald-200"
            />
          </div>

          {/* ══ FORM ════════════════════════════════════════════════════ */}
          <div
            className="bg-white border border-gray-100 rounded-3xl shadow-[var(--shadow-card)] overflow-hidden animate-fade-up"
            style={{ animationDelay: '60ms' }}
          >
            <div className="px-8 pt-7 pb-5 border-b border-gray-100/60">
              <h2 className="text-base font-semibold text-gray-900 tracking-tight">Catat Pengeluaran Baru</h2>
              <p className="text-xs text-[var(--fg-tertiary)] mt-0.5">Isi semua field lalu tekan Simpan</p>
            </div>

            <form onSubmit={handleSubmit} className="px-8 py-7 space-y-5">
              <div className="grid sm:grid-cols-2 gap-5">

                {/* Nama Barang */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-widest">
                    Nama Barang / Obat / Pupuk
                  </label>
                  <input
                    type="text"
                    value={itemName}
                    onChange={e => setItemName(e.target.value)}
                    placeholder="Contoh: Urea 50kg, Decis 50ml, Bibit Cabai…"
                    className="w-full rounded-2xl border border-gray-200 bg-gray-50/60 px-4 py-3 text-sm text-gray-900
                      placeholder-[var(--fg-tertiary)] focus:outline-none focus:ring-2 focus:ring-emerald-500/20
                      focus:border-emerald-500 transition-all duration-200 hover:border-gray-300"
                  />
                </div>

                {/* Kategori */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-widest">
                    Kategori
                  </label>
                  <select
                    value={category}
                    onChange={e => setCategory(e.target.value as ExpenseCategory)}
                    className="w-full rounded-2xl border border-gray-200 bg-gray-50/60 px-4 py-3 text-sm text-gray-900
                      focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500
                      transition-all duration-200 hover:border-gray-300 appearance-none cursor-pointer"
                  >
                    {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>

                {/* Jumlah Biaya */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-widest">
                    Jumlah Biaya (Rp)
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-medium text-[var(--fg-tertiary)] pointer-events-none select-none">
                      Rp
                    </span>
                    <input
                      type="number"
                      min="1"
                      step="1000"
                      value={cost}
                      onChange={e => setCost(e.target.value)}
                      placeholder="50000"
                      className="w-full rounded-2xl border border-gray-200 bg-gray-50/60 pl-11 pr-4 py-3 text-sm text-gray-900
                        placeholder-[var(--fg-tertiary)] focus:outline-none focus:ring-2 focus:ring-emerald-500/20
                        focus:border-emerald-500 transition-all duration-200 hover:border-gray-300 tabular-nums"
                    />
                  </div>
                </div>

                {/* Tanggal Pembelian */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-widest">
                    Tanggal Pembelian
                  </label>
                  <input
                    type="date"
                    value={date}
                    max={today}
                    onChange={e => setDate(e.target.value)}
                    className="w-full rounded-2xl border border-gray-200 bg-gray-50/60 px-4 py-3 text-sm text-gray-900
                      focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500
                      transition-all duration-200 hover:border-gray-300 cursor-pointer"
                  />
                </div>
              </div>

              {/* Error banner */}
              {formError && (
                <div className="flex items-start gap-3 rounded-2xl bg-red-50 border border-red-100 px-4 py-3 text-sm text-red-700 animate-fade-in">
                  <svg className="w-4 h-4 shrink-0 mt-0.5 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
                  </svg>
                  {formError}
                </div>
              )}

              {/* Submit */}
              <button
                type="submit"
                disabled={submitting}
                className="w-full flex items-center justify-center gap-2 bg-[var(--brand)] hover:bg-[var(--brand-mid)]
                  disabled:bg-gray-100 disabled:text-gray-400 text-white font-semibold rounded-2xl py-3.5 text-sm
                  shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md
                  active:scale-95 disabled:cursor-not-allowed disabled:translate-y-0 disabled:shadow-none"
              >
                {submitting ? <><Spinner /> Menyimpan…</> : <><IconPlus /> Simpan Pengeluaran</>}
              </button>
            </form>
          </div>

          {/* ══ EXPENSE LIST ════════════════════════════════════════════ */}
          <div
            className="bg-white border border-gray-100 rounded-3xl shadow-[var(--shadow-card)] overflow-hidden animate-fade-up"
            style={{ animationDelay: '120ms' }}
          >
            {/* header + filter pills */}
            <div className="px-8 pt-7 pb-5 border-b border-gray-100/60 flex flex-col sm:flex-row sm:items-center gap-4">
              <div className="flex-1">
                <h2 className="text-sm font-semibold text-gray-900 tracking-tight">Riwayat Pengeluaran</h2>
                <p className="text-xs text-[var(--fg-tertiary)] mt-0.5">
                  {expenses.length > 0 ? `${expenses.length} transaksi` : 'Belum ada transaksi'}
                </p>
              </div>
              {/* category filter pills */}
              <div className="flex flex-wrap gap-2">
                {(['Semua', ...CATEGORIES] as (ExpenseCategory | 'Semua')[]).map(cat => (
                  <button
                    key={cat}
                    onClick={() => setFilterCat(cat)}
                    className={[
                      'px-3 py-1 rounded-full text-xs font-medium transition-all duration-200',
                      filterCat === cat
                        ? 'bg-[var(--brand)] text-white shadow-sm'
                        : 'bg-gray-100 text-[var(--fg-secondary)] hover:bg-gray-200',
                    ].join(' ')}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* table */}
            <div className="overflow-x-auto">
              {fetchError ? (
                <div className="px-8 py-10 text-center">
                  <p className="text-sm text-red-600">{fetchError}</p>
                  <button onClick={() => setRefreshKey(k => k + 1)} className="mt-3 text-xs text-[var(--brand)] hover:underline">
                    Coba lagi
                  </button>
                </div>
              ) : (
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-100">
                      {['Tanggal', 'Nama Item', 'Kategori', 'Nominal', ''].map((h, i) => (
                        <th
                          key={i}
                          className={`px-5 py-3 text-[10px] font-semibold text-[var(--fg-tertiary)] uppercase tracking-widest
                            ${i === 3 ? 'text-right' : 'text-left'}`}
                        >
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {loading ? (
                      Array.from({ length: 4 }).map((_, i) => <SkeletonRow key={i} />)
                    ) : filtered.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="px-5 py-16 text-center">
                          <div className="flex flex-col items-center gap-3">
                            <div className="w-12 h-12 rounded-2xl bg-gray-50 border border-gray-100 flex items-center justify-center">
                              <IconWallet />
                            </div>
                            <div>
                              <p className="text-sm font-medium text-gray-700">
                                {filterCat === 'Semua' ? 'Belum ada pengeluaran' : `Tidak ada transaksi kategori ${filterCat}`}
                              </p>
                              <p className="text-xs text-[var(--fg-tertiary)] mt-1">
                                Tambahkan pengeluaran menggunakan form di atas.
                              </p>
                            </div>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      filtered.map(e => {
                        const cat = ((e as TransactionResponse & { category?: string }).category ?? 'Lainnya') as ExpenseCategory;
                        return (
                          <tr key={e.id} className="hover:bg-gray-50/60 transition-colors duration-150 group">
                            <td className="px-5 py-3.5 text-xs text-[var(--fg-tertiary)] whitespace-nowrap">
                              {new Date(e.timestamp).toLocaleDateString('id-ID', {
                                day: '2-digit', month: 'short', year: 'numeric',
                              })}
                            </td>
                            <td className="px-5 py-3.5 font-medium text-gray-900 max-w-[200px]">
                              <span className="truncate block">{e.item_name}</span>
                            </td>
                            <td className="px-5 py-3.5">
                              <CategoryBadge category={cat} />
                            </td>
                            <td className="px-5 py-3.5 text-right font-semibold text-gray-800 tabular-nums whitespace-nowrap">
                              Rp {e.cost.toLocaleString('id-ID')}
                            </td>
                            <td className="px-5 py-3.5 text-right w-10">
                              <button
                                title="Hapus"
                                className="opacity-0 group-hover:opacity-100 text-gray-300 hover:text-red-500 transition-all duration-150"
                                onClick={() => setExpenses(prev => prev.filter(x => x.id !== e.id))}
                              >
                                <IconTrash />
                              </button>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              )}
            </div>

            {/* total footer */}
            {!loading && filtered.length > 0 && (
              <div className="px-8 py-4 border-t border-gray-100/60 flex items-center justify-between bg-gray-900/[0.02]">
                <p className="text-xs text-[var(--fg-tertiary)] uppercase tracking-widest font-semibold">
                  {filterCat === 'Semua' ? 'Total Keseluruhan' : `Total ${filterCat}`}
                </p>
                <p className="text-base font-bold text-gray-900 tabular-nums">
                  Rp {filtered.reduce((s, e) => s + e.cost, 0).toLocaleString('id-ID')}
                </p>
              </div>
            )}
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
