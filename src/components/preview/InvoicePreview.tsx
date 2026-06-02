'use client';

import { useState } from 'react';
import { useApp } from '@/contexts/AppContext';
import { MinimalTemplate } from './templates/MinimalTemplate';
import { ModernTemplate } from './templates/ModernTemplate';
import { CorporateTemplate } from './templates/CorporateTemplate';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { exportInvoice } from '@/lib/export';
import { FileDown, Image, FileImage, Loader2, LayoutTemplate } from 'lucide-react';
import type { InvoiceTemplate, ExportFormat } from '@/types';

const TEMPLATES: { id: InvoiceTemplate; label: string }[] = [
  { id: 'minimal', label: 'Minimal' },
  { id: 'modern', label: 'Modern' },
  { id: 'corporate', label: 'Corporate' },
];

export const PREVIEW_ELEMENT_ID = 'invoice-preview-capture';

export function InvoicePreview() {
  const { invoice, profile, setTemplate } = useApp();
  const [exporting, setExporting] = useState<ExportFormat | null>(null);

  const handleExport = async (format: ExportFormat) => {
    setExporting(format);
    try {
      await exportInvoice({
        elementId: PREVIEW_ELEMENT_ID,
        filename: invoice.invoiceNumber || 'invoice',
        format,
        scale: 2,
      });
      toast.success(`Invoice exported as ${format.toUpperCase()}!`);
    } catch (err) {
      console.error(err);
      toast.error('Export failed. Please try again.');
    } finally {
      setExporting(null);
    }
  };

  const TemplateComponent = {
    minimal: MinimalTemplate,
    modern: ModernTemplate,
    corporate: CorporateTemplate,
  }[invoice.template];

  return (
    <div className="flex flex-col h-full">
      {/* Preview Controls */}
      <div className="flex-shrink-0 border-b bg-background px-4 py-3 space-y-3">
        {/* Template Selector */}
        <div className="flex items-center gap-2">
          <LayoutTemplate className="w-4 h-4 text-muted-foreground shrink-0" />
          <span className="text-xs font-medium text-muted-foreground">Template</span>
          <div className="flex gap-1 ml-1">
            {TEMPLATES.map((t) => (
              <button
                key={t.id}
                onClick={() => setTemplate(t.id)}
                className={`px-3 py-1 text-xs rounded-full font-medium transition-all ${
                  invoice.template === t.id
                    ? 'bg-primary text-primary-foreground shadow-sm'
                    : 'bg-muted text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        {/* Export Buttons */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-muted-foreground">Export</span>
          <Button
            size="sm"
            variant="outline"
            onClick={() => handleExport('pdf')}
            disabled={exporting !== null}
            className="h-7 px-2.5 text-xs gap-1.5"
          >
            {exporting === 'pdf' ? <Loader2 className="w-3 h-3 animate-spin" /> : <FileDown className="w-3 h-3" />}
            PDF
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => handleExport('png')}
            disabled={exporting !== null}
            className="h-7 px-2.5 text-xs gap-1.5"
          >
            {exporting === 'png' ? <Loader2 className="w-3 h-3 animate-spin" /> : <Image className="w-3 h-3" />}
            PNG
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => handleExport('jpeg')}
            disabled={exporting !== null}
            className="h-7 px-2.5 text-xs gap-1.5"
          >
            {exporting === 'jpeg' ? <Loader2 className="w-3 h-3 animate-spin" /> : <FileImage className="w-3 h-3" />}
            JPEG
          </Button>
          <Badge variant="secondary" className="ml-auto text-xs">
            {invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
          </Badge>
        </div>
      </div>

      {/* Preview Area — scrollable, A4 width, scales down on mobile */}
      <div className="flex-1 overflow-auto bg-gray-200 dark:bg-gray-800 p-3 sm:p-6 invoice-preview-container">
        <div
          className="mx-auto origin-top invoice-preview-scale"
          style={{
            width: '794px',
            /* Scale to fit viewport width on mobile while preserving A4 proportions */
            transform: typeof window !== 'undefined' && window.innerWidth < 768
              ? `scale(${(window.innerWidth - 24) / 794})`
              : undefined,
            marginBottom: typeof window !== 'undefined' && window.innerWidth < 768
              ? `-${794 - (window.innerWidth - 24)}px`
              : undefined,
          }}
        >
          <div
            id={PREVIEW_ELEMENT_ID}
            className="invoice-preview shadow-2xl overflow-hidden"
            style={{ width: '794px', minHeight: '1123px', backgroundColor: '#fff' }}
          >
            <TemplateComponent invoice={invoice} profile={profile} />
          </div>
        </div>
      </div>
    </div>
  );
}
