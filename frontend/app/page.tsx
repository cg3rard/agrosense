import Link from "next/link";
import Image from "next/image";
import Reveal from "@/components/Reveal";
import ScrollToTop from "@/components/ScrollToTop";


function IconLeaf() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      className="w-6 h-6"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M12 3C7 3 3 7 3 12c0 4.5 3.5 8.25 8 8.94V21m1-18c5 0 9 4 9 9 0 4.5-3.5 8.25-8 8.94"
      />
    </svg>
  );
}
function IconBrain() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      className="w-6 h-6"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M9.75 3.75A6 6 0 0 1 21 9v.75a6.75 6.75 0 0 1-6.75 6.75H12m-2.25 3.75H12V21m-3-3.75A6.75 6.75 0 0 1 3 9.75V9a6 6 0 0 1 6.75-5.955"
      />
    </svg>
  );
}
function IconDatabase() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      className="w-6 h-6"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M20.25 6.375c0 2.278-3.694 4.125-8.25 4.125S3.75 8.653 3.75 6.375m16.5 0c0-2.278-3.694-4.125-8.25-4.125S3.75 4.097 3.75 6.375m16.5 0v11.25c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125V6.375m16.5 5.625c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125"
      />
    </svg>
  );
}
function IconChart() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      className="w-6 h-6"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 0 1 3 19.875v-6.75ZM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V8.625ZM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V4.125Z"
      />
    </svg>
  );
}
function IconArrow() {
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
        d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3"
      />
    </svg>
  );
}
function IconSync() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      className="w-6 h-6"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99"
      />
    </svg>
  );
}


function StatCard({
  value,
  label,
  source,
}: {
  value: string;
  label: string;
  source: { name: string; href?: string };
}) {
  return (
    <div className="card-elevated card-hover rounded-2xl px-6 py-7 text-center flex flex-col">
      <p className="text-3xl font-bold text-gray-900 tracking-tight">{value}</p>
      <p className="text-sm text-[var(--fg-secondary)] mt-2 leading-snug flex-1">
        {label}
      </p>
      {source.href ? (
        <a
          href={source.href}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-4 text-[11px] font-medium text-[var(--fg-tertiary)] hover:text-[var(--brand)] transition-colors underline decoration-dotted underline-offset-2"
        >
          Sumber: {source.name}
        </a>
      ) : (
        <p className="mt-4 text-[11px] font-medium text-[var(--fg-tertiary)]">
          {source.name}
        </p>
      )}
    </div>
  );
}


export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <ScrollToTop />
      <main className="flex-1">

        <section className="relative overflow-hidden pt-[52px]">

          <div
            aria-hidden
            className="absolute inset-0 bg-cover bg-center scale-105 animate-[heroZoom_20s_ease-in-out_infinite_alternate]"
            style={{
              backgroundImage:
                "url('https://images.unsplash.com/photo-1500937386664-56d1dfef3854?q=80&w=2069&auto=format&fit=crop')",
            }}
          />

          <div
            aria-hidden
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(180deg, rgba(10,20,15,0.55) 0%, rgba(10,20,15,0.35) 45%, rgba(10,20,15,0.75) 100%)",
            }}
          />

          <div
            aria-hidden
            className="pointer-events-none absolute inset-0"
            style={{
              background:
                "radial-gradient(ellipse 90% 55% at 50% 0%, rgba(82,183,136,0.25) 0%, transparent 65%)",
            }}
          />

          <div className="relative min-h-[640px] sm:min-h-[720px] flex items-center justify-center">
            <div className="max-w-4xl mx-auto px-6 py-10 text-center">

              <div
                className="glass-panel-dark rounded-[2.5rem] px-6 sm:px-14 py-8 sm:py-11 animate-fade-up"
                style={{ animationDelay: "60ms" }}
              >
                <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-white leading-[1.06] mb-7">
                  Masa Depan Pertanian Cerdas
                  <br className="hidden sm:block" />
                  <span className="text-emerald-300">
                    {" "}
                    Berbasis AI
                  </span> &amp;{" "}
                  <span className="text-emerald-300">Financial Advisor</span>
                </h1>

                <p className="text-lg sm:text-xl text-white/85 max-w-2xl mx-auto leading-relaxed">
                  Diagnosa penyakit &amp; hama tanaman secara instan menggunakan
                  foto, dapatkan rekomendasi tindakan berbasis AI, dan kelola
                  pengeluaran operasional kebun Anda lengkap dengan analisis
                  ROI—semuanya dalam satu platform.
                </p>


                <div
                  className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-3 animate-fade-up"
                  style={{ animationDelay: "120ms" }}
                >
                  <Link
                    href="/diagnosis"
                    className="inline-flex items-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-white font-semibold rounded-full px-8 py-4 shadow-[var(--shadow-float)] transition-all duration-300 ease-[var(--ease-spring)] hover:-translate-y-0.5 active:scale-95"
                  >
                    Mulai Diagnosis Sekarang <IconArrow />
                  </Link>
                  <a
                    href="#fitur"
                    className="glass-pill-dark inline-flex items-center gap-2 text-white font-semibold rounded-full px-7 py-4 transition-all duration-300 ease-[var(--ease-spring)] hover:bg-white/20 hover:-translate-y-0.5 active:scale-95"
                  >
                    Pelajari Fitur
                  </a>
                </div>
              </div>
            </div>
          </div>
        </section>


        <section id="masalah" className="bg-[var(--bg-page)] py-28">
          <div className="max-w-6xl mx-auto px-6">
            <Reveal className="max-w-2xl mb-16">
              <p className="text-caption text-[var(--brand)] mb-3">
                Latar Belakang &amp; Masalah
              </p>
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-gray-900 mb-5">
                Petani Indonesia Masih{" "}
                <span className="text-red-500">Berjuang Sendiri</span>
              </h2>
              <p className="text-base text-[var(--fg-secondary)] leading-relaxed">
                Mayoritas petani kecil tidak memiliki akses ke agronomis
                profesional saat tanaman mereka terserang hama atau penyakit.
                Keterlambatan diagnosis berarti kerugian panen yang besar—dan
                tanpa pencatatan keuangan yang baik, analisis ROI tindakan
                hampir mustahil dilakukan.
              </p>
            </Reveal>

            <Reveal
              delayMs={100}
              className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6"
            >
              <StatCard
                value="20–40%"
                label="Kehilangan hasil panen global akibat hama & penyakit tanaman setiap tahun"
                source={{
                  name: "FAO — Plant Production & Protection",
                  href: "https://www.fao.org/plant-production-protection/about/en",
                }}
              />
              <StatCard
                value="US$220 M"
                label="Kerugian ekonomi global per tahun akibat penyakit tanaman"
                source={{
                  name: "FAO Newsroom",
                  href: "https://www.fao.org/newsroom/detail/New-standards-to-curb-the-global-spread-of-plant-pests-and-diseases/en",
                }}
              />
              <StatCard
                value="US$70 M"
                label="Kerugian tambahan akibat serangga invasif setiap tahun"
                source={{
                  name: "FAO Newsroom",
                  href: "https://www.fao.org/newsroom/detail/New-standards-to-curb-the-global-spread-of-plant-pests-and-diseases/en",
                }}
              />
              <StatCard
                value="2-3 hari"
                label="Estimasi rata-rata waktu tunggu konsultasi penyuluh konvensional"
                source={{
                  name: "Jangka Waktu Penyelesaian",
                  href: "https://dinpertanpangan.demakkab.go.id/?page_id=688",
                }}
              />
            </Reveal>

            <div className="grid sm:grid-cols-3 gap-5">
              {[
                {
                  emoji: "🔍",
                  title: "Diagnosis yang Lambat & Mahal",
                  body: "Mengundang penyuluh lapangan membutuhkan biaya dan waktu. Petani sering menebak-nebak dan membeli pestisida yang keliru.",
                },
                {
                  emoji: "📒",
                  title: "Pencatatan Keuangan Manual",
                  body: "Pengeluaran operasional dicatat di buku tulis atau hanya di ingatan, sehingga analisis ROI hampir tidak mungkin dilakukan.",
                },
                {
                  emoji: "📡",
                  title: "Minimnya Akses Informasi",
                  body: "Informasi terkini tentang serangan hama regional atau rekomendasi tindakan tidak sampai ke petani tepat waktu.",
                },
              ].map((c, i) => (
                <Reveal key={c.title} delayMs={i * 90}>
                  <div className="card-elevated card-hover rounded-3xl p-7 h-full">
                    <div className="text-3xl mb-5">{c.emoji}</div>
                    <h3 className="text-sm font-semibold text-gray-900 mb-2">
                      {c.title}
                    </h3>
                    <p className="text-sm text-[var(--fg-secondary)] leading-relaxed">
                      {c.body}
                    </p>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>


        <section id="fitur" className="bg-white py-28">
          <div className="max-w-6xl mx-auto px-6">
            <Reveal className="text-center max-w-2xl mx-auto mb-16">
              <p className="text-caption text-[var(--brand)] mb-3">
                Solusi &amp; Fitur Utama
              </p>
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-gray-900 mb-5">
                Teknologi Terbaik untuk Ladang Anda
              </h2>
              <p className="text-base text-[var(--fg-secondary)] leading-relaxed">
                AgroSense menggabungkan kecerdasan buatan, database vektor, dan
                analisis keuangan dalam satu alur kerja yang sederhana.
              </p>
            </Reveal>


            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                {
                  icon: <IconBrain />,
                  label: "Module 01",
                  title: "AI Crop Diagnosis",
                  body: "Unggah foto tanaman atau deskripsikan gejalanya. Model AI mengidentifikasi penyakit, hama, dan defisiensi nutrisi secara instan, 24/7.",
                },
                {
                  icon: <IconDatabase />,
                  label: "Module 02",
                  title: "Astra DB RAG",
                  body: "Respons AI diperkaya dengan basis pengetahuan pertanian terkurasi di Astra DB—memastikan rekomendasi akurat berbasis data, bukan tebakan.",
                },
                {
                  icon: <IconChart />,
                  label: "Module 03",
                  title: "Financial & ROI Estimator",
                  body: "Setiap diagnosis dilengkapi estimasi biaya tindakan dan kalkulasi ROI otomatis. Catat pengeluaran dan pantau kesehatan keuangan kebun Anda.",
                },
                {
                  icon: <IconSync />,
                  label: "Module 04",
                  title: "Sinkronisasi Aplikasi",
                  body: "Riwayat diagnosis dan catatan keuangan tersinkronisasi otomatis lintas perangkat, sehingga data Anda selalu konsisten di aplikasi mana pun Anda gunakan.",
                },
              ].map((f, i) => (
                <Reveal key={f.title} delayMs={i * 90}>
                  <div className="group card-elevated rounded-3xl p-8 h-full transition-all duration-500 ease-[var(--ease-spring)] hover:-translate-y-1.5">
                    <div className="icon-tile w-11 h-11 mb-6 group-hover:scale-110">
                      {f.icon}
                    </div>
                    <p className="text-caption text-[var(--brand)] mb-2">
                      {f.label}
                    </p>
                    <h3 className="text-base font-semibold text-gray-900 mb-2.5">
                      {f.title}
                    </h3>
                    <p className="text-sm text-[var(--fg-secondary)] leading-relaxed">
                      {f.body}
                    </p>
                  </div>
                </Reveal>
              ))}
            </div>


            <Reveal className="mt-20 bg-[var(--bg-page)] rounded-3xl p-10 sm:p-14">
              <div id="cara-kerja">
                <p className="text-caption text-center mb-10">
                  Cara Kerja — 3 Langkah
                </p>
                <div className="grid sm:grid-cols-3 gap-10 relative">
                  {[
                    {
                      n: "01",
                      title: "Ceritakan Gejalanya",
                      body: "Tulis keluhan atau unggah foto tanaman langsung dari kamera Anda.",
                    },
                    {
                      n: "02",
                      title: "AI Menganalisis",
                      body: "Model AI memproses input dan mencocokkan dengan basis data penyakit tanaman.",
                    },
                    {
                      n: "03",
                      title: "Terima Rekomendasi",
                      body: "Dapatkan diagnosis, tindakan, estimasi biaya, dan status ROI dalam detik.",
                    },
                  ].map((s, i) => (
                    <div
                      key={s.n}
                      className="group flex flex-col items-center text-center relative"
                    >
                      {i < 2 && (
                        <div className="hidden sm:block absolute top-5 left-[calc(50%+2.5rem)] w-[calc(100%-5rem)] h-px bg-gradient-to-r from-[var(--brand-light)] via-[var(--brand-mid)]/40 to-[var(--brand-light)]" />
                      )}
                      <div className="icon-tile w-10 h-10 !rounded-full !bg-white border border-[var(--brand-light)] text-[var(--brand)] text-sm font-bold mb-5 relative z-10 shadow-[var(--shadow-card)] transition-transform duration-300 group-hover:scale-105">
                        {s.n}
                      </div>
                      <p className="text-sm font-semibold text-gray-900 mb-1.5">
                        {s.title}
                      </p>
                      <p className="text-xs text-[var(--fg-secondary)] leading-relaxed">
                        {s.body}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </Reveal>
          </div>
        </section>


        <section
          className="py-28"
          style={{
            background:
              "linear-gradient(150deg, #1b4332 0%, var(--brand) 60%, #52b788 100%)",
          }}
        >
          <div className="max-w-3xl mx-auto px-6 text-center">
            <Reveal>
              <div className="w-14 h-14 rounded-2xl bg-white/10 text-white flex items-center justify-center mx-auto mb-7 ring-1 ring-white/20">
                <IconLeaf />
              </div>
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-white mb-5">
                Siap Mendiagnosa Tanaman Anda?
              </h2>
              <p className="text-emerald-100/90 text-base leading-relaxed mb-10 max-w-xl mx-auto">
                Mulai sekarang — gratis, tanpa registrasi. Cukup ceritakan
                gejala atau unggah foto, dan biarkan AI yang bekerja untuk Anda.
              </p>
              <Link
                href="/diagnosis"
                className="inline-flex items-center gap-2 bg-white text-[var(--brand)] text-sm font-semibold rounded-full px-8 py-4 shadow-[var(--shadow-elevated)] hover:-translate-y-1 hover:shadow-[var(--shadow-float)] active:scale-95 transition-all duration-300 ease-[var(--ease-spring)]"
              >
                Mulai Diagnosis Sekarang <IconArrow />
              </Link>
            </Reveal>
          </div>
        </section>
      </main>

      <footer className="bg-white border-t border-[var(--border-subtle)] py-12">
        <div className="max-w-6xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4">

          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg overflow-hidden shrink-0">
              <Image
                src="/favicon.jpg"
                alt="AgroSense"
                width={24}
                height={24}
                className="w-full h-full object-cover"
              />
            </div>
            <span className="text-xs font-semibold text-gray-700 tracking-tight">
              AgroSense
            </span>
          </div>

          <div className="flex items-center gap-5 text-xs text-[var(--fg-tertiary)]">
            <a
              href="#masalah"
              className="hover:text-gray-700 transition-colors"
            >
              Masalah
            </a>
            <a href="#fitur" className="hover:text-gray-700 transition-colors">
              Fitur
            </a>
            <a
              href="#cara-kerja"
              className="hover:text-gray-700 transition-colors"
            >
              Cara Kerja
            </a>
            <Link
              href="/diagnosis"
              className="hover:text-gray-700 transition-colors"
            >
              Diagnosis
            </Link>
          </div>

          <p className="text-xs text-[var(--fg-tertiary)] tracking-wide">
            &copy; {new Date().getFullYear()} AgroSense
          </p>
        </div>
      </footer>
    </div>
  );
}
