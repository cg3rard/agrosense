'use client';

import { AgroSenseProviper } from './context/agrosense';
import AppNavbar from '@/components/AppNavbar';

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <AgroSenseProvider>
      <AppNavbar />
      {children}
    </AgroSenseProvider>
  );
}
