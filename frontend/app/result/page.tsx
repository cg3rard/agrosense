"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { useMemo, useState } from "react";
import type { DiagnosisHistory } from "@/types";
import { useAgroSense } from "../context/agrosense";

/* ── Icons ────────────────────────────────────────────────────────────────── */
function IconHome() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      className="w-4 h-4"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="m2.25 12 8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25"
      />
    </svg>
  );
}
function IconRefresh() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      className="w-4 h-4"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99"
      />
    </svg>
  );
}
function IconWallet() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      className="w-5 h-5"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M21 12a2.25 2.25 0 0 0-2.25-2.25H15a3 3 0 1 1-6 0H5.25A2.25 2.25 0 0 0 3 12m18 0v6a2.25 2.25 0 0 1-2.25 2.25H5.25A2.25 2.25 0 0 1 3 18v-6m18 0V9M3 12V9m18 0a2.25 2.25 0 0 0-2.25-2.25H5.25A2.25 2.25 0 0 0 3 9m18 0V6a2.25 2.25 0 0 0-2.25-2.25H5.25A2.25 2.25 0 0 0 3 6v3"
      />
    </svg>
  );
}
function IconLeaf() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      className="w-5 h-5"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M12 3C7 3 3 7 3 12c0 4.5 3.5 8.25 8 8.94V21m1-18c5 0 9 4 9 9 0 4.5-3.5 8.25-8 8.94"
      />
    </svg>
  );
}
function IconTrendUp() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      className="w-4 h-4"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M2.25 18 9 11.25l4.306 4.306a11.95 11.95 0 0 1 5.814-5.518l2.74-1.22m0 0-5.94-2.281m5.94 2.28-2.28 5.941"
      />
    </svg>
  );
}
function IconTrendDown() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      className="w-4 h-4"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M2.25 6 9 12.75l4.286-4.286a11.948 11.948 0 0 1 4.306 6.43l.776 2.898m0 0 3.182-5.511m-3.182 5.51-5.511-3.181"
      />
    </svg>
  );
}
function IconMinus() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      className="w-4 h-4"
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14" />
    </svg>
  );
}
function IconClock() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      className="w-5 h-5 text-[var(--brand)]"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
      />
    </svg>
  );
}
function IconTrash() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      className="w-3.5 h-3.5"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0"
      />
    </svg>
  );
}
function IconArrowRight() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      className="w-4 h-4 text-gray-300 group-hover:text-[var(--brand)] group-hover:translate-x-0.5 transition-all duration-300 shrink-0"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3"
      />
    </svg>
  );
}

/* ── ROI status normalisation ────────────────────────────────────────────── */
type RoiKind = "Positive" | "Negative" | "Neutral";

/** Backend/LLM may return varying casings or synonyms — normalise to a known kind. */
function normalizeRoiStatus(raw: string): RoiKind {
  const v = raw.trim().toLowerCase();
  if (v.includes("positive") || v.includes("untung") || v.includes("baik"))
    return "Positive";
  if (v.includes("negative") || v.includes("rugi") || v.includes("buruk"))
    return "Negative";
  return "Neutral";
}

const ROI_META: Record<
  RoiKind,
  {
    bg: string;
    text: string;
    ring: string;
    label: string;
    icon: React.ReactNode;
    desc: string;
  }
> = {
  Positive: {
    bg: "bg-emerald-50",
    text: "text-emerald-700",
    ring: "ring-1 ring-emerald-200",
    label: "Menguntungkan",
    icon: <IconTrendUp />,
    desc: "Tindakan ini diperkirakan menghasilkan keuntungan finansial melebihi biaya yang dikeluarkan.",
  },
  Negative: {
    bg: "bg-red-50",
    text: "text-red-600",
    ring: "ring-1 ring-red-200",
    label: "Tidak Menguntungkan",
    icon: <IconTrendDown />,
    desc: "Biaya tindakan kemungkinan melebihi manfaat panen yang diharapkan. Pertimbangkan alternatif yang lebih hemat.",
  },
  Neutral: {
    bg: "bg-gray-100",
    text: "text-gray-500",
    ring: "ring-1 ring-gray-200",
    label: "Netral",
    icon: <IconMinus />,
    desc: "Dampak finansial dari tindakan ini bersifat seimbang antara biaya dan manfaat.",
  },
};

/* ── ROI Badge ────────────────────────────────────────────────────────────── */
function RoiBadge({ status, large }: { status: string; large?: boolean }) {
  const kind = normalizeRoiStatus(status);
  const m = ROI_META[kind];
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full font-semibold
      ${large ? "px-4 py-2 text-sm" : "px-2.5 py-1 text-xs"}
      ${m.bg} ${m.text} ${m.ring}`}
    >
      <span className="shrink-0">{m.icon}</span>
      {m.label}
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
      <p className="text-sm text-[var(--fg-secondary)] leading-relaxed">
        {text}
      </p>
    </div>
  );
}

/* ── Metric Block ─────────────────────────────────────────────────────────── */
function MetricBlock({
  label,
  icon,
  children,
}: {
  label: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div
      className="rounded-2xl border px-6 py-5 flex items-start gap-4 bg-white border-gray-100 shadow-[var(--shadow-card)] transition-shadow duration-300"
      style={{ transitionTimingFunction: "var(--ease-out)" }}
    >
      <div className="icon-tile w-10 h-10 shrink-0">{icon}</div>
      <div className="min-w-0">
        <p className="text-[11px] font-semibold text-[var(--fg-tertiary)] uppercase tracking-widest mb-1">
          {label}
        </p>
        {children}
      </div>
    </div>
  );
}

/* ── Riwayat: satu baris hasil diagnosis sebelumnya ──────────────────────── */
function formatHistoryDate(iso: string) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "-";
  return d.toLocaleString("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function HistoryRow({
  entry,
  active,
  onSelect,
}: {
  entry: DiagnosisHistory;
  active: boolean;
  onSelect: (e: DiagnosisHistory) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onSelect(entry)}
      style={{ transitionTimingFunction: "var(--ease-out)" }}
      className={`w-full text-left flex items-start gap-4 px-5 sm:px-8 py-4 group transition-colors duration-300 ${
        active ? "bg-[var(--brand-light)]/50" : "hover:bg-gray-50/80"
      }`}
    >
      {/* thumbnail / fallback */}
      <div className="icon-tile w-10 h-10 shrink-0 overflow-hidden transition-transform duration-300 group-hover:scale-105">
        {entry.imageName ? (
          <span className="text-[10px] font-bold text-[var(--brand)] uppercase">
            {entry.imageName.slice(0, 3)}
          </span>
        ) : (
          <IconLeaf />
        )}
      </div>

      {/* info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <p className="text-sm font-semibold text-gray-900 truncate max-w-full">
            {entry.result.diagnosis}
          </p>
          {active && (
            <span className="text-[10px] font-semibold uppercase tracking-wider text-[var(--brand)] bg-[var(--brand-light)] rounded-full px-2 py-0.5 shrink-0">
              Ditampilkan
            </span>
          )}
        </div>
        <p className="text-xs text-[var(--fg-tertiary)] mt-0.5 line-clamp-1">
          {entry.symptomText?.trim()
            ? entry.symptomText.trim()
            : "Tidak ada deskripsi gejala"}
        </p>
        <div className="flex items-center gap-3 mt-1.5 flex-wrap">
          <span className="text-[11px] text-[var(--fg-tertiary)] tabular-nums">
            {formatHistoryDate(entry.timestamp)}
          </span>
          <span className="text-[11px] font-semibold text-gray-700 tabular-nums">
            Rp {entry.result.cost_estimate.toLocaleString("id-ID")}
          </span>
        </div>
      </div>

      {/* meta */}
      <div className="flex items-center gap-3 shrink-0 self-center">
        <RoiBadge status={entry.result.roi_status} />
        <IconArrowRight />
      </div>
    </button>
  );
}

/* ── Riwayat Diagnosis (list hasil sebelumnya) ───────────────────────────── */
function HistorySection({
  history,
  hydrated,
  activeId,
  onSelect,
  onClear,
}: {
  history: DiagnosisHistory[];
  hydrated: boolean;
  activeId: string | null;
  onSelect: (e: DiagnosisHistory) => void;
  onClear: () => void;
}) {
  return (
    <div
      className="bg-white rounded-3xl border border-gray-100 shadow-[var(--shadow-card)] overflow-hidden animate-fade-up"
      style={{ animationDelay: "100ms" }}
    >
      {/* header */}
      <div className="px-5 sm:px-8 py-6 border-b border-gray-100/70 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="icon-tile w-9 h-9 shrink-0">
            <IconClock />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-gray-900 tracking-tight">
              Riwayat Hasil Diagnosis
            </h2>
            <p className="text-xs text-[var(--fg-tertiary)] mt-0.5">
              {hydrated && history.length > 0
                ? `${history.length} hasil tersimpan — klik untuk melihat rangkumannya`
                : "Tersimpan di browser ini — privat & tidak dikirim ke server"}
            </p>
          </div>
        </div>
        {hydrated && history.length > 0 && (
          <button
            type="button"
            onClick={onClear}
            className="hidden sm:flex items-center gap-1.5 text-xs text-[var(--fg-tertiary)] hover:text-red-500 border border-gray-200 hover:border-red-200 rounded-full px-3 py-1.5 transition-colors duration-200 shrink-0"
          >
            <IconTrash /> Hapus Semua
          </button>
        )}
      </div>

      {/* body */}
      {!hydrated ? (
        <div className="divide-y divide-gray-100/80">
          {[0, 1, 2].map((i) => (
            <div key={i} className="px-5 sm:px-8 py-4 flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-gray-100 animate-pulse shrink-0" />
              <div className="flex-1 space-y-2">
                <div className="h-3 w-1/3 rounded bg-gray-100 animate-pulse" />
                <div className="h-2.5 w-2/3 rounded bg-gray-100 animate-pulse" />
              </div>
            </div>
          ))}
        </div>
      ) : history.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-4 px-8 py-14 text-center">
          <div className="w-14 h-14 rounded-2xl bg-gray-50 border border-gray-100 flex items-center justify-center">
            <IconClock />
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-700">
              Belum ada riwayat diagnosis
            </p>
            <p className="text-xs text-[var(--fg-tertiary)] mt-1 max-w-xs leading-relaxed">
              Setiap diagnosis yang Anda lakukan akan tersimpan di sini sebagai
              referensi cepat.
            </p>
          </div>
        </div>
      ) : (
        <>
          <div className="divide-y divide-gray-100/80">
            {history.map((entry) => (
              <HistoryRow
                key={entry.id}
                entry={entry}
                active={entry.id === activeId}
                onSelect={onSelect}
              />
            ))}
          </div>
          <div className="px-5 sm:px-8 py-4 border-t border-gray-100/70 bg-gray-50/40 flex items-center justify-between gap-4">
            <p className="text-[11px] text-[var(--fg-tertiary)]">
              Maksimal 20 hasil terakhir. Data hilang jika cache browser
              dihapus.
            </p>
            <button
              type="button"
              onClick={onClear}
              className="sm:hidden flex items-center gap-1.5 text-xs text-[var(--fg-tertiary)] hover:text-red-500 shrink-0"
            >
              <IconTrash /> Hapus
            </button>
          </div>
        </>
      )}
    </div>
  );
}

/* ── Page inner ───────────────────────────────────────────────────────────── */
function ResultInner() {
  const router = useRouter();
  const {
    latestResult,
    resultHydrated,
    setLatestResult,
    history,
    historyHydrated,
    clearHistory,
  } = useAgroSense();

  /* id riwayat yang sedang ditampilkan — diklik manual, atau dicocokkan
     dengan hasil terakhir yang tersimpan di sesi ini */
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const activeId = useMemo(() => {
    if (selectedId) return selectedId;
    if (!latestResult) return null;
    const match = history.find(
      (h) => JSON.stringify(h.result) === JSON.stringify(latestResult),
    );
    return match?.id ?? null;
  }, [selectedId, latestResult, history]);

  const handleSelectHistory = (entry: DiagnosisHistory) => {
    setSelectedId(entry.id);
    setLatestResult(entry.result);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const historySection = (
    <HistorySection
      history={history}
      hydrated={historyHydrated}
      activeId={activeId}
      onSelect={handleSelectHistory}
      onClear={() => {
        setSelectedId(null);
        clearHistory();
      }}
    />
  );

  /* Show a loading pulse while the context re-syncs with sessionStorage on mount */
  if (!resultHydrated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--bg-page)]">
        <div className="flex flex-col items-center gap-4">
          <div className="flex items-center gap-2">
            <div
              className="w-2 h-2 rounded-full bg-emerald-500 animate-bounce"
              style={{ animationDelay: "0ms" }}
            />
            <div
              className="w-2 h-2 rounded-full bg-emerald-400 animate-bounce"
              style={{ animationDelay: "150ms" }}
            />
            <div
              className="w-2 h-2 rounded-full bg-emerald-300 animate-bounce"
              style={{ animationDelay: "300ms" }}
            />
          </div>
          <p className="text-sm text-[var(--fg-tertiary)]">
            Memuat hasil analisis…
          </p>
        </div>
      </div>
    );
  }

  /* No result stored for this session — show an empty state instead of redirecting */
  if (!latestResult) {
    return (
      <div className="min-h-screen flex flex-col bg-[var(--bg-page)]">
        <main className="flex-1 pt-[52px]">
          <div className="max-w-5xl mx-auto px-6 py-10 space-y-6">
            <div className="bg-white rounded-3xl border border-gray-100 shadow-[var(--shadow-card)] flex flex-col items-center gap-4 text-center px-6 py-16 animate-fade-up">
              <div className="icon-tile w-14 h-14">
                <IconLeaf />
              </div>
              <div>
                <p className="text-lg font-semibold text-gray-900">
                  Belum ada hasil
                </p>
                <p className="text-sm text-[var(--fg-tertiary)] mt-1 max-w-sm leading-relaxed">
                  Anda belum melakukan diagnosis tanaman pada sesi ini. Pilih
                  salah satu riwayat di bawah, atau mulai diagnosis baru.
                </p>
              </div>
              <button
                onClick={() => router.push("/diagnosis")}
                style={{ transitionTimingFunction: "var(--ease-out)" }}
                className="mt-2 inline-flex items-center gap-2 bg-[var(--brand)] hover:bg-[var(--brand-mid)] text-white font-semibold rounded-2xl px-6 py-3 text-sm shadow-[var(--shadow-brand)] hover:-translate-y-0.5 hover:shadow-[var(--shadow-elevated)] active:scale-95 transition-all duration-300"
              >
                Mulai Diagnosis
              </button>
            </div>

            {/* ══ RIWAYAT HASIL SEBELUMNYA ═══════════════════════════════ */}
            {historySection}
          </div>
        </main>
      </div>
    );
  }

  /* ── derived visual tokens from ROI ── */
  const roiKind = normalizeRoiStatus(latestResult.roi_status);
  const roiMeta = ROI_META[roiKind];

  const headerAccent =
    roiKind === "Positive"
      ? "from-emerald-50/70 via-white to-white"
      : roiKind === "Negative"
        ? "from-red-50/60 via-white to-white"
        : "from-gray-50/60 via-white to-white";

  const roiAccent =
    roiKind === "Positive"
      ? "bg-emerald-50 border-emerald-100"
      : roiKind === "Negative"
        ? "bg-red-50 border-red-100"
        : "bg-gray-50 border-gray-100";

  /* split recommended_action into numbered steps for better readability */
  const actionSteps = latestResult.recommended_action
    .split(/(?:\.\s+|\n+)/)
    .map((s) => s.trim())
    .filter(Boolean);

  return (
    <div className="min-h-screen flex flex-col bg-[var(--bg-page)]">
      <main className="flex-1 pt-[52px]">
        {/* ── Page header ───────────────────────────────────────────────── */}
        <div className="bg-white border-b border-gray-100/80">
          <div className="max-w-5xl mx-auto px-6 py-10">
            <p className="text-[11px] font-semibold text-emerald-600 uppercase tracking-widest mb-2 animate-fade-in">
              Hasil Diagnosis AI
            </p>
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-gray-900 mb-3 animate-fade-up">
              Hasil Analisis &amp; Rekomendasi
            </h1>
            <p
              className="text-base text-[var(--fg-secondary)] max-w-xl animate-fade-up"
              style={{ animationDelay: "60ms" }}
            >
              Berikut diagnosis AI, langkah tindakan yang direkomendasikan,
              estimasi biaya, dan status ROI untuk kondisi tanaman Anda.
            </p>
          </div>
        </div>

        <div className="max-w-5xl mx-auto px-6 py-10 space-y-6">
          {/* ══ RESULT CARD ══════════════════════════════════════════════ */}
          <div
            className={`bg-gradient-to-b ${headerAccent} rounded-3xl shadow-[var(--shadow-float)] border border-gray-100 overflow-hidden animate-fade-up`}
            style={{ animationDelay: "60ms" }}
          >
            {/* ── Card header: diagnosis title + ROI badge ── */}
            <div className="px-5 sm:px-8 pt-8 pb-6 border-b border-gray-100/70 flex flex-col gap-4">
              <div className="flex items-center gap-2">
                <div className="icon-tile w-8 h-8 shrink-0">
                  <IconLeaf />
                </div>
                <p className="text-[11px] font-semibold text-[var(--brand)] uppercase tracking-widest">
                  Diagnosis AI
                </p>
              </div>
              <div className="flex flex-wrap items-start justify-between gap-3">
                <h2 className="text-xl sm:text-2xl md:text-3xl font-bold tracking-tight text-gray-900 leading-snug break-words [overflow-wrap:anywhere] flex-1 min-w-[60%]">
                  {latestResult.diagnosis}
                </h2>
                <div className="shrink-0">
                  <RoiBadge status={latestResult.roi_status} large />
                </div>
              </div>
            </div>

            <div className="px-5 sm:px-8 py-8 space-y-8">
              {/* ── Rekomendasi Tindakan ── */}
              <div>
                <p className="text-[11px] font-semibold text-[var(--fg-tertiary)] uppercase tracking-widest mb-4">
                  Rekomendasi Tindakan
                </p>
                <div className="bg-white/80 border border-gray-100 rounded-2xl p-6 space-y-3.5 shadow-[var(--shadow-xs)]">
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
                <div className="flex flex-col sm:flex-row sm:items-center gap-4 bg-white/80 border border-gray-100 rounded-2xl px-6 py-4 shadow-[var(--shadow-xs)]">
                  <div className="flex items-start gap-4">
                    <div className="icon-tile w-9 h-9 shrink-0">
                      <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth={1.8}
                        className="w-4.5 h-4.5 w-[18px] h-[18px]"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M9.75 3.104v5.714a2.25 2.25 0 0 1-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 0 1 4.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15.3M14.25 3.104c.251.023.501.05.75.082M19.8 15.3l-1.57.393A9.065 9.065 0 0 1 12 15a9.065 9.065 0 0 1-6.23-.693L5 14.5m14.8.8 1.402 1.402c1 1 .03 2.798-1.442 2.798H4.24c-1.47 0-2.441-1.798-1.442-2.798L4.2 15.3"
                        />
                      </svg>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-[var(--fg-tertiary)] mb-0.5">
                        Nama item / tindakan
                      </p>
                      <p className="text-sm font-semibold text-gray-900 leading-snug">
                        {latestResult.recommended_action
                          .split(/[.,]/)[0]
                          .trim()}
                      </p>
                    </div>
                  </div>
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
                      Rp {latestResult.cost_estimate.toLocaleString("id-ID")}
                    </p>
                    <p className="text-xs text-[var(--fg-tertiary)] mt-1 leading-snug">
                      Perkiraan total biaya tindakan yang direkomendasikan
                    </p>
                  </MetricBlock>

                  {/* ROI Status */}
                  <div
                    className={`rounded-2xl border px-6 py-5 flex items-start gap-4 shadow-[var(--shadow-card)] transition-shadow duration-300 ${roiAccent}`}
                    style={{ transitionTimingFunction: "var(--ease-out)" }}
                  >
                    <div
                      className={`w-10 h-10 rounded-xl bg-white/80 flex items-center justify-center shrink-0 ${roiMeta.text}`}
                    >
                      {roiMeta.icon}
                    </div>
                    <div className="min-w-0">
                      <p className="text-[11px] font-semibold text-[var(--fg-tertiary)] uppercase tracking-widest mb-1.5">
                        Status ROI
                      </p>
                      <RoiBadge status={latestResult.roi_status} large />
                      <p className="text-xs text-[var(--fg-secondary)] mt-2 leading-relaxed">
                        {roiMeta.desc}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ══ RIWAYAT HASIL SEBELUMNYA ═══════════════════════════════ */}
          {historySection}

          {/* ══ BOTTOM NAVIGATION ═══════════════════════════════════════ */}
          <div
            className="grid sm:grid-cols-2 gap-3 animate-fade-up"
            style={{ animationDelay: "120ms" }}
          >
            <button
              onClick={() => router.push("/diagnosis")}
              style={{ transitionTimingFunction: "var(--ease-out)" }}
              className="flex items-center justify-center gap-2.5 bg-white border border-gray-200 text-gray-700 font-semibold rounded-2xl py-4 text-sm shadow-[var(--shadow-card)] hover:border-gray-300 hover:-translate-y-0.5 hover:shadow-[var(--shadow-elevated)] active:scale-95 transition-all duration-300"
            >
              <IconRefresh />
              Diagnosis Ulang
            </button>
            <Link
              href="/"
              style={{ transitionTimingFunction: "var(--ease-out)" }}
              className="flex items-center justify-center gap-2.5 bg-[var(--brand)] hover:bg-[var(--brand-mid)] text-white font-semibold rounded-2xl py-4 text-sm shadow-[var(--shadow-brand)] hover:-translate-y-0.5 hover:shadow-[var(--shadow-elevated)] active:scale-95 transition-all duration-300"
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
            <div className="w-5 h-5 rounded-lg overflow-hidden shrink-0">
              <Image src="/favicon.jpg" alt="AgroSense" width={20} height={20} className="w-full h-full object-cover" />
            </div>
            <span className="text-xs font-semibold text-gray-600">
              AgroSense
            </span>
          </div>
          <p className="text-xs text-[var(--fg-tertiary)]">
            &copy; {new Date().getFullYear()} AgroSense &mdash; Powered by
            FastAPI &amp; Astra DB
          </p>
        </div>
      </footer>
    </div>
  );
}

export default function ResultPage() {
  return <ResultInner />;
}
