/**
 * Root layout — wraps every page in the app.
 * Provides the ThemeProvider (dark/light mode) and the Sonner toast container.
 * No auth provider needed here; Supabase auth is handled via middleware + server client.
 */
import type { Metadata } from 'next';
import './globals.css';
import { ThemeProvider } from 'next-themes';
import { Toaster } from '@/components/ui/sonner';

export const metadata: Metadata = {
  title: 'InvoiceFlow — Professional Invoice Generator',
  description: 'Create, manage, and export professional invoices as PDF, PNG, or JPEG.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="antialiased">
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
          {children}
          <Toaster position="bottom-right" richColors />
        </ThemeProvider>
      </body>
    </html>
  );
}
