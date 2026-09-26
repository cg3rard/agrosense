'use client';

import { AgroSenseProvider } from './context/agrosense';

export default function Providers({ children }: { children: React.ReactNode }) {
  return <AgroSenseProvider>{children}</AgroSenseProvider>;
}
