'use client';

import { useEffect, useState } from 'react';
import type { FinanceEntryResponse, FinanceEntryType } from '@/types';

/* ── Icons ────────────────────────────────────────────────────────────────── */
function IconWallet() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="w-5 h-5">
      <path strokeLinecap="round" strokeLinejoin="round"
        d="M21 12a2.25 2.25 0 0 0-2.25-2.25H15a3 3 0 1 1-6 0H5.25A2.25 2.25 0 0 0 3 12m18 0v6a2.25 2.25 0 0 1-2.25 2.25H5.25A2.25 2.25 0 0 1 3 18v-6m18 0V9M3 12V9m18 0a2.25 2.25 0 0 0-2.25-2.25H5.25A2.25 2.25 0 0 0 3 9m18 0V6a2.25 2.25 0 0 0-2.25-2.25H5.25A2.25 2.25 0 0 0 3 6v3" />
    </svg>
  );
}
function IconArrowUp() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-4 h-4">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 19.5V4.5m0 0L5.25 11.25M12 4.5l6.75 6.75" />
    </svg>
  );
}
function IconArrowDown() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-4 h-4">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m0 0-6.75-6.75M12 19.5l6.75-6.75" />
    </svg>
  );
}
function IconScale() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="w-5 h-5">
      <path strokeLinecap="round" strokeLinejoin="round"
        d="M12 3v18m0-18L6 6.5m6-3.5 6 3.5M4.5 9l-1.5 4.5a3 3 0 0 0 6 0L7.5 9m9 0-1.5 4.5a3 3 0 0 0 6 0L19.5 9M4.5 9h6m3 0h6" />
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

/* ── Highlight summary card ──────────────────────────────────────────────── */
function SummaryCard({
  label, amount, icon, tone,
}: {
  label: string;
  amount: number;
  icon: React.ReactNode;
  tone: 'income' | 'expense' | 'balance';
}) {
  const styles: Record<typeof tone, { bg: string; text: string; iconBg: string }> = {
    income:  { bg: 'bg-emerald-50 border-emerald-100', text: 'text-emerald-700', iconBg: 'bg-emerald-100 text-emerald-700' },
    expense: { bg: 'bg-red-50 border-red-100',         text: 'text-red-600',    iconBg: 'bg-red-100 text-red-600' },
    balance: { bg: 'bg-gray-900 border-gray-900',      text: 'text-white',      iconBg: 'bg-white/15 text-white' },
  };
  const s = styles[tone];
  return (
    <div className={`rounded-2xl border px-6 py-5 flex items-start gap-4 ${s.bg}`}>
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${s.iconBg}`}>
        {icon}
      </div>
      <div className="min-w-0">
        <p className={`text-[11px] font-semibold uppercase tracking-widest mb-1 ${tone === 'balance' ? 'text-white/70' : 'text-[var(--fg-tertiary)]'}`}>
          {label}
        </p>
        <p className={`text-xl font-bold tabular-nums tracking-tight ${s.text}`}>
          Rp {amount.toLocaleString('id-ID')}
        </p>
      </div>
    </div>
  );
}

/* ── Entry row ────────────────────────────────────────────────────────────── */
function EntryRow({ entry }: { entry: FinanceEntryResponse }) {
  const isIncome = entry.type === 'income';
  return (
    <tr className="hover:bg-gray-50/60 transition-colors duration-150">
      <td className="py-3 pr-4 text-xs text-[var(--fg-tertiary)] whitespace-nowrap">
        {new Date(entry.timestamp).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })}
      </td>
      <td className="py-3 pr-4">
        <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-semibold
          ${isIncome ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-600'}`}>
          {isIncome ? <IconArrowUp /> : <IconArrowDown />}
          {isIncome ? 'Pemasukan' : 'Pengeluaran'}
        </span>
      </td>
      <td className="py-3 pr-4 font-medium text-gray-900 max-w-[220px] truncate">{entry.item_name}</td>
      <td className={`py-3 text-right font-semibold tabular-nums ${isIncome ? 'text-emerald-700' : 'text-red-600'}`}>
        {isIncome ? '+' : '-'} Rp {entry.amount.toLocaleString('id-ID')}
      </td>
    </tr>
  );
}

/* ── Page ─────────────────────────────────────────────────────────────────── */
export default function KeuanganPage() {
  const [entries, setEntries] = useState<FinanceEntryResponse[]>([]);
  const [loadingList, setLoadingList] = useState(true);
  const [listError, setListError] = useState<string | null>(null);

  const [type, setType] = useState<FinanceEntryType>('expense');
  const [itemName, setItemName] = useState('');
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const loadEntries = () => {
    setLoadingList(true);
    setListError(null);
    fetch('/api/finance')
      .then(async r => {
        if (!r.ok) {
          const d = await r.json().catch(() => ({ detail: r.statusText }));
          throw new Error(d?.detail ?? `Error ${r.status}`);
        }
        return r.json();
      })
      .then((d: FinanceEntryResponse[]) => setEntries(Array.isArray(d) ? d : []))
      .catch(err => setListError(err instanceof Error ? err.message : 'Gagal memuat data keuangan.'))
      .finally(() => setLoadingList(false));
  };

  useEffect(() => { loadEntries(); }, []);

  const totalIncome = entries.filter(e => e.type === 'income').reduce((s, e) => s + e.amount, 0);
  const totalExpense = entries.filter(e => e.type === 'expense').reduce((s, e) => s + e.amount, 0);
  const balance = totalIncome - totalExpense;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    const parsedAmount = Number(amount);
    if (!itemName.trim()) { setFormError('Nama item / keterangan wajib diisi.'); return; }
    if (!parsedAmount || parsedAmount <= 0) { setFormError('Nominal harus lebih dari 0.'); return; }

    setSubmitting(true);
    try {
      const res = await fetch('/api/finance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type,
          item_name: itemName.trim(),
          amount: parsedAmount,
          note: note.trim() || undefined,
          timestamp: new Date().toISOString(),
        }),
      });
      if (!res.ok) {
        const d = await res.json().catch(() => ({ detail: res.statusText }));
        throw new Error(d?.detail ?? `Error ${res.status}`);
      }
      const saved: FinanceEntryResponse = await res.json();
      setEntries(prev => [saved, ...prev]);
      setItemName(''); setAmount(''); setNote('');
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Gagal mencatat transaksi.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[var(--bg-page)]">
      <main className="flex-1 pt-[52px]">

        {/* ── Page header ── */}
        <div className="bg-white border-b border-gray-100/80">
          <div className="max-w-5xl mx-auto px-6 py-10">
            <p className="text-[11px] font-semibold text-emerald-600 uppercase tracking-widest mb-2">
              Catatan Keuangan
            </p>
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-gray-900 mb-3">
              Pengeluaran &amp; Pemasukan
            </h1>
            <p className="text-base text-[var(--fg-secondary)] max-w-xl">
              Catat setiap pembelian dan hasil penjualan untuk melacak kondisi keuangan kebun Anda.
            </p>
          </div>
        </div>

        <div className="max-w-5xl mx-auto px-6 py-10 space-y-6">

          {/* ══ SUMMARY HIGHLIGHT ══════════════════════════════════════ */}
          <div className="grid sm:grid-cols-3 gap-4">
            <SummaryCard label="Total Pemasukan" amount={totalIncome} icon={<IconArrowUp />} tone="income" />
            <SummaryCard label="Total Pengeluaran" amount={totalExpense} icon={<IconArrowDown />} tone="expense" />
            <SummaryCard label="Saldo" amount={balance} icon={<IconScale />} tone="balance" />
          </div>

          {/* ══ FORM ═══════════════════════════════════════════════════ */}
          <div className="bg-white border border-gray-100 rounded-3xl shadow-[var(--shadow-card)] overflow-hidden">
            <div className="px-8 pt-7 pb-5 border-b border-gray-100/60 flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-[var(--brand-light)] text-[var(--brand)] flex items-center justify-center shrink-0">
                <IconWallet />
              </div>
              <h2 className="text-sm font-semibold text-gray-900 tracking-tight">Catat Transaksi Baru</h2>
            </div>

            <form onSubmit={handleSubmit} className="px-8 py-6 space-y-5">
              {formError && (
                <div className="rounded-2xl bg-red-50 border border-red-100 px-4 py-3 text-sm text-red-700">
                  {formError}
                </div>
              )}

              {/* type toggle */}
              <div className="grid grid-cols-2 gap-2.5">
                <button
                  type="button"
                  onClick={() => setType('expense')}
                  className={`flex items-center justify-center gap-2 rounded-2xl py-3 text-sm font-semibold transition-all duration-200
                    ${type === 'expense' ? 'bg-red-600 text-white shadow-sm' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                >
                  <IconArrowDown /> Pengeluaran
                </button>
                <button
                  type="button"
                  onClick={() => setType('income')}
                  className={`flex items-center justify-center gap-2 rounded-2xl py-3 text-sm font-semibold transition-all duration-200
                    ${type === 'income' ? 'bg-emerald-600 text-white shadow-sm' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                >
                  <IconArrowUp /> Pemasukan
                </button>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="item_name" className="block text-xs font-medium text-gray-600 mb-1.5">
                    Nama Item / Keterangan
                  </label>
                  <input
                    id="item_name"
                    type="text"
                    value={itemName}
                    onChange={e => setItemName(e.target.value)}
                    placeholder={type === 'expense' ? 'Contoh: Pupuk NPK 5kg' : 'Contoh: Jual hasil panen cabai'}
                    className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--brand)] focus:border-transparent"
                    maxLength={200}
                  />
                </div>
                <div>
                  <label htmlFor="amount" className="block text-xs font-medium text-gray-600 mb-1.5">
                    Nominal (Rp)
                  </label>
                  <input
                    id="amount"
                    type="number"
                    inputMode="numeric"
                    min={1}
                    step={1}
                    value={amount}
                    onChange={e => setAmount(e.target.value)}
                    placeholder="150000"
                    className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--brand)] focus:border-transparent"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="note" className="block text-xs font-medium text-gray-600 mb-1.5">
                  Catatan (opsional)
                </label>
                <input
                  id="note"
                  type="text"
                  value={note}
                  onChange={e => setNote(e.target.value)}
                  placeholder="Detail tambahan…"
                  className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--brand)] focus:border-transparent"
                  maxLength={500}
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full flex items-center justify-center gap-2 bg-gray-900 hover:bg-gray-700 disabled:bg-gray-200 disabled:text-gray-400 text-white font-semibold rounded-2xl py-3.5 text-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md active:scale-95 disabled:cursor-not-allowed disabled:translate-y-0 disabled:shadow-none"
              >
                {submitting ? <><Spinner /> Menyimpan…</> : `Simpan ${type === 'expense' ? 'Pengeluaran' : 'Pemasukan'}`}
              </button>
            </form>
          </div>

          {/* ══ RIWAYAT TRANSAKSI ══════════════════════════════════════ */}
          <div className="bg-white border border-gray-100 rounded-3xl shadow-[var(--shadow-card)] overflow-hidden">
            <div className="px-8 pt-7 pb-5 border-b border-gray-100/60 flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-[var(--brand-light)] text-[var(--brand)] flex items-center justify-center shrink-0">
                <IconWallet />
              </div>
              <h2 className="text-sm font-semibold text-gray-900 tracking-tight">Riwayat Transaksi</h2>
            </div>

            <div className="px-8 py-6">
              {listError ? (
                <div className="rounded-2xl bg-red-50 border border-red-100 px-4 py-3 text-sm text-red-700">
                  {listError}
                </div>
              ) : loadingList ? (
                <div className="space-y-3">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="h-11 rounded-xl bg-gray-100 animate-skeleton" />
                  ))}
                </div>
              ) : entries.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-14 gap-3 text-center">
                  <div className="w-12 h-12 rounded-2xl bg-gray-50 border border-gray-100 flex items-center justify-center">
                    <IconWallet />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-700">Belum ada transaksi</p>
                    <p className="text-xs text-[var(--fg-tertiary)] mt-1 max-w-xs leading-relaxed">
                      Catat pengeluaran atau pemasukan pertama Anda menggunakan form di atas.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead>
                      <tr className="border-b border-gray-100">
                        {(['Tanggal', 'Tipe', 'Item / Keterangan', 'Nominal'] as const).map(h => (
                          <th key={h}
                            className={`pb-3 text-[10px] font-semibold text-[var(--fg-tertiary)] uppercase tracking-widest
                              ${h === 'Nominal' ? 'text-right' : 'pr-4'}`}
                          >{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {entries.map(entry => <EntryRow key={entry.id} entry={entry} />)}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>

        </div>
      </main>

      {/* ── Footer ── */}
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
