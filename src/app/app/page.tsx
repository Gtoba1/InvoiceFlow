'use client';

/**
 * Invoice editor page — /app
 * Desktop: side-by-side editor + live preview.
 * Mobile: tabbed editor / preview.
 *
 * Profile setup dialog appears once on first login (when full_name is empty).
 * After saving, it never shows again — the check is against the DB, not a flag.
 */
import { useState } from 'react';
import { Header } from '@/components/layout/Header';
import { InvoiceEditor } from '@/components/invoice/InvoiceEditor';
import { InvoicePreview } from '@/components/preview/InvoicePreview';
import { ProfileSetupDialog } from '@/components/dialogs/ProfileSetupDialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { AppProvider, useApp } from '@/contexts/AppContext';
import { PenLine, Eye } from 'lucide-react';

/** Inner shell — lives inside AppProvider so it can call useApp(). */
function AppShell() {
  // Pull needsSetup and saveInitialProfile from AppContext so both the dialog
  // and the invoice preview share the same profile state instance.
  const { needsSetup, isProfileLoading, saveInitialProfile, profile } = useApp();
  const [mobileTab, setMobileTab] = useState('editor');

  if (isProfileLoading) {
    return (
      <div className="h-screen flex items-center justify-center text-muted-foreground text-sm">
        Loading…
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-background">
      <Header />

      {/* First-login setup — only shown when full_name is empty in the DB.
          After saving, needsSetup becomes false and never triggers again. */}
      <ProfileSetupDialog
        open={needsSetup}
        userEmail={profile.email}
        onSave={saveInitialProfile}
      />

      {/* ── Desktop: two-panel layout ─────────────────────── */}
      <div className="hidden md:flex flex-1 overflow-hidden">
        <div className="w-[420px] lg:w-[460px] xl:w-[520px] flex-shrink-0 border-r flex flex-col overflow-hidden">
          <ScrollArea className="flex-1">
            <InvoiceEditor />
          </ScrollArea>
        </div>
        <div className="flex-1 overflow-hidden flex flex-col">
          <InvoicePreview />
        </div>
      </div>

      {/* ── Mobile: tabbed layout ─────────────────────────── */}
      <div className="flex md:hidden flex-1 overflow-hidden flex-col">
        <Tabs value={mobileTab} onValueChange={setMobileTab} className="flex flex-col flex-1 overflow-hidden">
          <div className="border-b px-4 py-2 bg-muted/30 flex-shrink-0">
            <TabsList className="w-full">
              <TabsTrigger value="editor" className="flex-1 gap-1.5 text-xs">
                <PenLine className="w-3.5 h-3.5" /> Editor
              </TabsTrigger>
              <TabsTrigger value="preview" className="flex-1 gap-1.5 text-xs">
                <Eye className="w-3.5 h-3.5" /> Preview
              </TabsTrigger>
            </TabsList>
          </div>
          <TabsContent value="editor" className="flex-1 overflow-hidden mt-0">
            <ScrollArea className="h-full"><InvoiceEditor /></ScrollArea>
          </TabsContent>
          <TabsContent value="preview" className="flex-1 overflow-hidden mt-0">
            <InvoicePreview />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

export default function AppPage() {
  return (
    <AppProvider>
      <AppShell />
    </AppProvider>
  );
}
