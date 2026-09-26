import type { Metadata } from 'next';
import { Geist } from 'next/font/google';
import './globals.css';
import Providers from './providers';

const geist = Geist({ subsets: ['latin'], variable: '--font-geist-sans' });

export const metadata: Metadata = {
  title: 'AgroSense — AI Agronomist & Financial OS',
  description:
    'Diagnosa kondisi tanaman dengan AI dan kelola pengeluaran operasional kebun Anda.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id" className={`${geist.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-[#f5f5f7] text-[#1d1d1f]">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
