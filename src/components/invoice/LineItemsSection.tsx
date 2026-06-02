'use client';

import { useApp } from '@/contexts/AppContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { getCurrencySymbol } from '@/lib/formatters';
import { Plus, Trash2, Copy } from 'lucide-react';
import { InvoiceItem } from '@/types';

export function LineItemsSection() {
  const { invoice, services, addItem, updateItem, removeItem, duplicateItem, setServiceForItem } = useApp();
  const sym = getCurrencySymbol(invoice.currency);

  const handleServiceChange = (itemId: string, serviceId: string) => {
    if (serviceId === '__custom__') {
      updateItem(itemId, { serviceId: undefined, service: '', description: '' });
      return;
    }
    const service = services.find((s) => s.id === serviceId);
    if (service) setServiceForItem(itemId, service);
  };

  return (
    <div className="space-y-3">
      <div className="space-y-3">
        {invoice.items.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground text-sm border-2 border-dashed border-border rounded-lg">
            No line items yet. Click &ldquo;Add Item&rdquo; to get started.
          </div>
        ) : (
          invoice.items.map((item: InvoiceItem) => (
            <div key={item.id} className="border rounded-lg p-3 space-y-2 bg-muted/10">
              {/* Service selector + actions */}
              <div className="flex gap-2 items-center">
                <Select
                  value={item.serviceId || '__custom__'}
                  onValueChange={(v) => handleServiceChange(item.id, v)}
                >
                  <SelectTrigger className="h-8 text-xs flex-1">
                    <SelectValue placeholder="Select service..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="__custom__">Custom</SelectItem>
                    {services.map((s) => (
                      <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button
                  variant="ghost" size="icon"
                  className="h-8 w-8 shrink-0 text-muted-foreground hover:text-foreground"
                  onClick={() => duplicateItem(item.id)}
                  title="Duplicate"
                >
                  <Copy className="w-3.5 h-3.5" />
                </Button>
                <Button
                  variant="ghost" size="icon"
                  className="h-8 w-8 shrink-0 text-muted-foreground hover:text-destructive"
                  onClick={() => removeItem(item.id)}
                  title="Remove"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </Button>
              </div>

              {/* Description — shown for custom items as the service label, always shown for details */}
              {!item.serviceId && (
                <Input
                  value={item.service}
                  onChange={(e) => updateItem(item.id, { service: e.target.value })}
                  placeholder="Description"
                  className="h-8 text-xs"
                />
              )}

              {/* Details / longer description */}
              <Input
                value={item.description}
                onChange={(e) => updateItem(item.id, { description: e.target.value })}
                placeholder={item.serviceId ? 'Additional details (optional)' : 'More details (optional)'}
                className="h-8 text-xs"
              />

              {/* Qty · Rate · Amount */}
              <div className="grid grid-cols-3 gap-2 items-center">
                <div className="space-y-0.5">
                  <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">Qty</p>
                  <Input
                    type="number" min="1" step="1"
                    value={item.quantity || ''}
                    onChange={(e) => {
                      const val = parseFloat(e.target.value);
                      if (!isNaN(val) && val >= 0) updateItem(item.id, { quantity: val });
                    }}
                    onBlur={() => {
                      if (!item.quantity || item.quantity <= 0) {
                        updateItem(item.id, { quantity: 1 });
                      }
                    }}
                    className={`h-8 text-xs text-center ${!item.quantity ? 'border-orange-400 focus-visible:ring-orange-400' : ''}`}
                  />
                </div>
                <div className="space-y-0.5">
                  <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">Rate ({sym})</p>
                  <Input
                    type="number" min="0"
                    value={item.rate || ''}
                    onChange={(e) => {
                      const val = parseFloat(e.target.value);
                      updateItem(item.id, { rate: isNaN(val) ? 0 : val });
                    }}
                    placeholder="0"
                    className="h-8 text-xs text-right"
                  />
                </div>
                <div className="space-y-0.5">
                  <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">Amount</p>
                  <div className="h-8 flex items-center justify-end text-xs font-semibold bg-muted rounded-md px-2 border border-transparent">
                    {sym}{item.amount.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 })}
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      <Button
        variant="outline" size="sm" onClick={addItem}
        className="w-full gap-2 text-xs h-8 border-dashed"
      >
        <Plus className="w-3.5 h-3.5" /> Add Item
      </Button>
    </div>
  );
}
