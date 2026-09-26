import Link from 'next/link';

/* ── inline SVG icons ────────────────────────────────────────────────────── */
function IconLeaf() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-6 h-6">
      <path strokeLinecap="round" strokeLinejoin="round"
        d="M12 3C7 3 3 7 3 12c0 4.5 3.5 8.25 8 8.94V21m1-18c5 0 9 4 9 9 0 4.5-3.5 8.25-8 8.94" />
    </svg>
  );
}
function IconBrain() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-6 h-6">
      <path strokeLinecap="round" strokeLinejoin="round"
        d="M9.75 3.75A6 6 0 0 1 21 9v.75a6.75 6.75 0 0 1-6.75 6.75H12m-2.25 3.75H12V21m-3-3.75A6.75 6.75 0 0 1 3 9.75V9a6 6 0 0 1 6.75-5.955" />
    </svg>
  );
}
function IconDatabase() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-6 h-6">
      <path strokeLinecap="round" strokeLinejoin="round"
        d="M20.25 6.375c0 2.278-3.694 4.125-8.25 4.125S3.75 8.653 3.75 6.375m16.5 0c0-2.278-3.694-4.125-8.25-4.125S3.75 4.097 3.75 6.375m16.5 0v11.25c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125V6.375m16.5 5.625c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125" />
    </svg>
  );
}
function IconChart() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-6 h-6">
      <path strokeLinecap="round" strokeLinejoin="round"
        d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 0 1 3 19.875v-6.75ZM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V8.625ZM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V4.125Z" />
    </svg>
  );
}
function IconArrow() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-4 h-4">
      <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
    </svg>
  );
}

/* ── stat card ───────────────────────────────────────────────────────────── */
function StatCard({ value, label }: { value: string; label: string }) {
  return (
    <div className="glass-card rounded-2xl px-6 py-6 text-center">
      <p className="text-3xl font-bold text-gray-900 tracking-tight">{value}</p>
      <p className="text-sm text-[var(--fg-secondary)] mt-1.5 leading-snug">{label}</p>
    </div>
  );
}

/* ── page ────────────────────────────────────────────────────────────────── */
export default function LandingPage() {
  return (
      <div className="min-h-screen flex flex-col">
        <main className="flex-1">

          {/* ══ HERO ════════════════════════════════════════════════════ */}
          <section className="relative overflow-hidden bg-white pt-[52px]">
            {/* ambient radial glow */}
            <div aria-hidden className="pointer-events-none absolute inset-0"
              style={{ background: 'radial-gradient(ellipse 100% 60% at 50% 0%, rgba(45,106,79,0.07) 0%, transparent 65%)' }} />
            {/* faint grid pattern */}
            <div aria-hidden className="pointer-events-none absolute inset-0 opacity-[0.025]"
              style={{ backgroundImage: 'linear-gradient(var(--fg-primary) 1px,transparent 1px),linear-gradient(90deg,var(--fg-primary) 1px,transparent 1px)', backgroundSize: '60px 60px' }} />

            <div className="relative max-w-4xl mx-auto px-6 pt-24 pb-32 text-center">
              {/* badge */}
              <div className="inline-flex items-center gap-2 bg-[var(--brand-light)] text-[var(--brand)] text-xs font-semibold rounded-full px-4 py-1.5 mb-10 tracking-wide animate-fade-in">
                <span className="w-1.5 h-1.5 rounded-full bg-[var(--brand)] animate-pulse" />
                Powered by AI &amp; Astra DB RAG
              </div>

              {/* heading */}
              <h1
                className="text-4xl md:text-6xl font-bold tracking-tight text-gray-900 leading-[1.06] mb-7 animate-fade-up"
                style={{ animationDelay: '60ms' }}
              >
                Masa Depan Pertanian Cerdas
                <br className="hidden sm:block" />
                <span className="text-[var(--brand)]"> Berbasis AI</span> &amp;{' '}
                <span className="text-[var(--brand)]">Financial Advisor</span>
              </h1>

              {/* subtitle */}
              <p
                className="text-lg sm:text-xl text-[var(--fg-secondary)] max-w-2xl mx-auto leading-relaxed mb-12 animate-fade-up"
                style={{ animationDelay: '120ms' }}
              >
                Diagnosa penyakit &amp; hama tanaman secara instan menggunakan foto,
                dapatkan rekomendasi tindakan berbasis AI, dan kelola pengeluaran
                operasional kebun Anda lengkap dengan analisis ROI—semuanya dalam
                satu platform.
              </p>

              {/* CTAs — primary rounded-full, secondary pill outline */}
              <div
                className="flex flex-col sm:flex-row items-center justify-center gap-3 animate-fade-up"
                style={{ animationDelay: '180ms' }}
              >
                <Link
                  href="/diagnosis"
                  className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-full px-8 py-4 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md active:scale-95"
                >
                  Mulai Diagnosis Sekarang <IconArrow />
                </Link>
                <a
                  href="#fitur"
                  className="inline-flex items-center gap-2 bg-white border border-gray-200 text-gray-700 font-semibold rounded-full px-7 py-4 shadow-sm transition-all duration-200 hover:border-gray-300 hover:-translate-y-0.5 hover:shadow-md active:scale-95"
                >
                  Pelajari Fitur
                </a>
              </div>

              {/* social proof pills */}
              <div
                className="mt-14 flex flex-wrap items-center justify-center gap-2.5 text-xs text-[var(--fg-tertiary)] animate-fade-up"
                style={{ animationDelay: '240ms' }}
              >
                {['🌾 Padi & Palawija', '🌶 Sayuran & Cabai', '🌿 Perkebunan', '📊 ROI Estimator'].map(t => (
                  <span key={t} className="bg-gray-50 border border-gray-100 rounded-full px-3.5 py-1">{t}</span>
                ))}
              </div>
            </div>
          </section>

          {/* ══ PROBLEM STATEMENT ═══════════════════════════════════════ */}
          <section id="masalah" className="bg-[var(--bg-page)] py-28">
            <div className="max-w-6xl mx-auto px-6">
              <div className="max-w-2xl mb-16">
                <p className="text-caption text-[var(--brand)] mb-3">Latar Belakang &amp; Masalah</p>
                <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-gray-900 mb-5">
                  Petani Indonesia Masih{' '}
                  <span className="text-red-500">Berjuang Sendiri</span>
                </h2>
                <p className="text-base text-[var(--fg-secondary)] leading-relaxed">
                  Mayoritas petani kecil tidak memiliki akses ke agronomis profesional
                  saat tanaman mereka terserang hama atau penyakit. Keterlambatan
                  diagnosis berarti kerugian panen yang besar—dan tanpa pencatatan
                  keuangan yang baik, analisis ROI tindakan hampir mustahil dilakukan.
                </p>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-16">
                <StatCard value="70%"    label="Petani tidak punya akses agronomis terdekat" />
                <StatCard value="40%"    label="Kehilangan hasil panen akibat salah diagnosis" />
                <StatCard value="Rp2,3T" label="Estimasi kerugian petani per tahun dari hama" />
                <StatCard value="3 hari" label="Rata-rata waktu tunggu konsultasi konvensional" />
              </div>

              <div className="grid sm:grid-cols-3 gap-5">
                {[
                  { emoji: '🔍', title: 'Diagnosis yang Lambat & Mahal',   body: 'Mengundang penyuluh lapangan membutuhkan biaya dan waktu. Petani sering menebak-nebak dan membeli pestisida yang keliru.' },
                  { emoji: '📒', title: 'Pencatatan Keuangan Manual',       body: 'Pengeluaran operasional dicatat di buku tulis atau hanya di ingatan, sehingga analisis ROI hampir tidak mungkin dilakukan.' },
                  { emoji: '📡', title: 'Minimnya Akses Informasi',         body: 'Informasi terkini tentang serangan hama regional atau rekomendasi tindakan tidak sampai ke petani tepat waktu.' },
                ].map(c => (
                  <div key={c.title} className="card-hover glass-card rounded-3xl p-7">
                    <div className="text-3xl mb-5">{c.emoji}</div>
                    <h3 className="text-sm font-semibold text-gray-900 mb-2">{c.title}</h3>
                    <p className="text-sm text-[var(--fg-secondary)] leading-relaxed">{c.body}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* ══ FEATURES ════════════════════════════════════════════════ */}
          <section id="fitur" className="bg-white py-28">
            <div className="max-w-6xl mx-auto px-6">
              <div className="text-center max-w-2xl mx-auto mb-16">
                <p className="text-caption text-[var(--brand)] mb-3">Solusi &amp; Fitur Utama</p>
                <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-gray-900 mb-5">
                  Teknologi Terbaik untuk Ladang Anda
                </h2>
                <p className="text-base text-[var(--fg-secondary)] leading-relaxed">
                  AgroSense menggabungkan kecerdasan buatan, database vektor, dan
                  analisis keuangan dalam satu alur kerja yang sederhana.
                </p>
              </div>

              {/* feature cards — exactly as spec: border border-gray-100 bg-white/80 backdrop-blur rounded-3xl p-8 shadow-sm */}
              <div className="grid sm:grid-cols-3 gap-6">
                {[
                  {
                    icon: <IconBrain />, label: 'Module 01',
                    title: 'AI Crop Diagnosis',
                    body: 'Unggah foto tanaman atau deskripsikan gejalanya. Model AI mengidentifikasi penyakit, hama, dan defisiensi nutrisi secara instan, 24/7.',
                  },
                  {
                    icon: <IconDatabase />, label: 'Module 02',
                    title: 'Astra DB RAG',
                    body: 'Respons AI diperkaya dengan basis pengetahuan pertanian terkurasi di Astra DB—memastikan rekomendasi akurat berbasis data, bukan tebakan.',
                  },
                  {
                    icon: <IconChart />, label: 'Module 03',
                    title: 'Financial & ROI Estimator',
                    body: 'Setiap diagnosis dilengkapi estimasi biaya tindakan dan kalkulasi ROI otomatis. Catat pengeluaran dan pantau kesehatan keuangan kebun Anda.',
                  },
                ].map(f => (
                  <div
                    key={f.title}
                    className="group border border-gray-100 bg-white/80 backdrop-blur rounded-3xl p-8 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md hover:border-gray-200"
                  >
                    <div className="w-11 h-11 rounded-2xl bg-[var(--brand-light)] text-[var(--brand)] flex items-center justify-center mb-6 group-hover:scale-105 transition-transform duration-300">
                      {f.icon}
                    </div>
                    <p className="text-caption text-[var(--brand)] mb-2">{f.label}</p>
                    <h3 className="text-base font-semibold text-gray-900 mb-2.5">{f.title}</h3>
                    <p className="text-sm text-[var(--fg-secondary)] leading-relaxed">{f.body}</p>
                  </div>
                ))}
              </div>

              {/* how it works */}
              <div id="cara-kerja" className="mt-20 bg-[var(--bg-page)] rounded-3xl p-10 sm:p-14">
                <p className="text-caption text-center mb-10">Cara Kerja — 3 Langkah</p>
                <div className="grid sm:grid-cols-3 gap-10 relative">
                  {[
                    { n: '01', title: 'Ceritakan Gejalanya',  body: 'Tulis keluhan atau unggah foto tanaman langsung dari kamera Anda.' },
                    { n: '02', title: 'AI Menganalisis',       body: 'Model AI memproses input dan mencocokkan dengan basis data penyakit tanaman.' },
                    { n: '03', title: 'Terima Rekomendasi',    body: 'Dapatkan diagnosis, tindakan, estimasi biaya, dan status ROI dalam detik.' },
                  ].map((s, i) => (
                    <div key={s.n} className="flex flex-col items-center text-center relative">
                      {i < 2 && <div className="hidden sm:block absolute top-5 left-[calc(50%+2.5rem)] w-[calc(100%-5rem)] h-px bg-gray-200" />}
                      <div className="w-10 h-10 rounded-full bg-white border-2 border-[var(--brand-light)] text-[var(--brand)] text-sm font-bold flex items-center justify-center mb-5 relative z-10 shadow-sm">
                        {s.n}
                      </div>
                      <p className="text-sm font-semibold text-gray-900 mb-1.5">{s.title}</p>
                      <p className="text-xs text-[var(--fg-secondary)] leading-relaxed">{s.body}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* ══ FINAL CTA ═══════════════════════════════════════════════ */}
          <section className="py-28" style={{ background: 'linear-gradient(150deg, #1b4332 0%, var(--brand) 60%, #52b788 100%)' }}>
            <div className="max-w-3xl mx-auto px-6 text-center">
              <div className="w-14 h-14 rounded-2xl bg-white/10 text-white flex items-center justify-center mx-auto mb-7 ring-1 ring-white/20">
                <IconLeaf />
              </div>
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-white mb-5">
                Siap Mendiagnosa Tanaman Anda?
              </h2>
              <p className="text-emerald-100/90 text-base leading-relaxed mb-10 max-w-xl mx-auto">
                Mulai sekarang — gratis, tanpa registrasi. Cukup ceritakan gejala
                atau unggah foto, dan biarkan AI yang bekerja untuk Anda.
              </p>
              <Link
                href="/diagnosis"
                className="inline-flex items-center gap-2 bg-white text-[var(--brand)] text-sm font-semibold rounded-full px-8 py-4 shadow-sm hover:-translate-y-1 hover:shadow-xl active:scale-95 transition-all duration-300"
              >
                Mulai Diagnosis Sekarang <IconArrow />
              </Link>
            </div>
          </section>
        </main>

        <footer className="bg-white border-t border-gray-100/80 py-10">
          <div className="max-w-6xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
            {/* brand */}
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-lg bg-[var(--brand)] flex items-center justify-center">
                <span className="text-white text-[10px] font-bold">A</span>
              </div>
              <span className="text-xs font-semibold text-gray-700 tracking-tight">AgroSense</span>
            </div>
            {/* links */}
            <div className="flex items-center gap-5 text-xs text-[var(--fg-tertiary)]">
              <a href="#masalah"   className="hover:text-gray-700 transition-colors">Masalah</a>
              <a href="#fitur"     className="hover:text-gray-700 transition-colors">Fitur</a>
              <a href="#cara-kerja" className="hover:text-gray-700 transition-colors">Cara Kerja</a>
              <Link href="/diagnosis" className="hover:text-gray-700 transition-colors">Diagnosis</Link>
            </div>
            {/* copyright */}
            <p className="text-xs text-[var(--fg-tertiary)] tracking-wide">
              &copy; {new Date().getFullYear()} AgroSense
            </p>
          </div>
        </footer>
      </div>
  );
}
