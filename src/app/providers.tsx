'use client';

import { ThemeProvider } from 'next-themes';
import { AppProvider } from '@/contexts/AppContext';
import { Toaster } from '@/components/ui/sonner';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
      <AppProvider>
        {children}
        <Toaster position="bottom-right" richColors />
      </AppProvider>
    </ThemeProvider>
  );
}
