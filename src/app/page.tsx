'use client';

import { useState } from 'react';
import { Header } from '@/components/layout/Header';
import { InvoiceEditor } from '@/components/invoice/InvoiceEditor';
import { InvoicePreview } from '@/components/preview/InvoicePreview';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { PenLine, Eye } from 'lucide-react';

export default function HomePage() {
  const [mobileTab, setMobileTab] = useState('editor');

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-background">
      <Header />

      {/* Desktop layout: two-panel */}
      <div className="hidden md:flex flex-1 overflow-hidden">
        {/* Left: Editor */}
        <div className="w-[420px] lg:w-[460px] xl:w-[520px] flex-shrink-0 border-r flex flex-col overflow-hidden">
          <ScrollArea className="flex-1">
            <InvoiceEditor />
          </ScrollArea>
        </div>
        {/* Right: Preview */}
        <div className="flex-1 overflow-hidden flex flex-col">
          <InvoicePreview />
        </div>
      </div>

      {/* Mobile layout: tabbed */}
      <div className="flex md:hidden flex-1 overflow-hidden flex-col">
        <Tabs value={mobileTab} onValueChange={setMobileTab} className="flex flex-col flex-1 overflow-hidden">
          <div className="border-b px-4 py-2 bg-muted/30">
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
            <ScrollArea className="h-full">
              <InvoiceEditor />
            </ScrollArea>
          </TabsContent>
          <TabsContent value="preview" className="flex-1 overflow-hidden mt-0">
            <InvoicePreview />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
