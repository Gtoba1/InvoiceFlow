'use client';

import { useState } from 'react';
import { useApp } from '@/contexts/AppContext';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { Service } from '@/types';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { formatCurrency } from '@/lib/formatters';

interface ServicesDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const emptyForm = (): Omit<Service, 'id' | 'createdAt'> => ({
  name: '', description: '', rate: 0, terms: '',
});

export function ServicesDialog({ open, onOpenChange }: ServicesDialogProps) {
  const { services, addService, updateService, deleteService, invoice } = useApp();
  const [view, setView] = useState<'list' | 'create' | 'edit'>('list');
  const [form, setForm] = useState(emptyForm());
  const [editId, setEditId] = useState<string | null>(null);

  const set = <K extends keyof typeof form>(k: K, v: (typeof form)[K]) =>
    setForm((p) => ({ ...p, [k]: v }));

  const handleCreate = () => {
    if (!form.name.trim()) { toast.error('Service name is required'); return; }
    addService(form);
    toast.success('Service added!');
    setView('list');
    setForm(emptyForm());
  };

  const handleEdit = (service: Service) => {
    setEditId(service.id);
    setForm({ name: service.name, description: service.description, rate: service.rate, terms: service.terms ?? '' });
    setView('edit');
  };

  const handleUpdate = () => {
    if (!editId || !form.name.trim()) { toast.error('Service name is required'); return; }
    updateService(editId, form);
    toast.success('Service updated!');
    setView('list');
    setEditId(null);
    setForm(emptyForm());
  };

  const FormView = ({ onSave }: { onSave: () => void }) => (
    <div className="space-y-3">
      <div className="space-y-1.5">
        <Label>Service Name *</Label>
        <Input
          value={form.name}
          onChange={(e) => set('name', e.target.value)}
          placeholder="e.g. Power BI Dashboard"
          autoFocus
        />
      </div>

      <div className="space-y-1.5">
        <Label>Default Description</Label>
        <Textarea
          value={form.description}
          onChange={(e) => set('description', e.target.value)}
          placeholder="Brief description that auto-fills the line item..."
          className="min-h-[60px] resize-none text-sm"
        />
      </div>

      <div className="space-y-1.5">
        <Label>Default Rate</Label>
        <Input
          type="number"
          min="0"
          value={form.rate}
          onChange={(e) => set('rate', parseFloat(e.target.value) || 0)}
          placeholder="0.00"
        />
      </div>

      <Separator />

      <div className="space-y-1.5">
        <Label>Terms &amp; Conditions</Label>
        <p className="text-xs text-muted-foreground -mt-1">
          Auto-fills the invoice terms when this service is selected.
        </p>
        <Textarea
          value={form.terms}
          onChange={(e) => set('terms', e.target.value)}
          placeholder="e.g. Includes up to 2 rounds of revisions. Full ownership transferred on full payment."
          className="min-h-[80px] resize-none text-sm"
        />
      </div>

      <div className="flex gap-2 pt-1">
        <Button
          variant="outline"
          onClick={() => { setView('list'); setForm(emptyForm()); }}
          className="flex-1"
        >
          Cancel
        </Button>
        <Button onClick={onSave} className="flex-1">Save Service</Button>
      </div>
    </div>
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {view === 'list' ? 'Service Catalogue' : view === 'create' ? 'New Service' : 'Edit Service'}
          </DialogTitle>
        </DialogHeader>

        {view === 'list' && (
          <div className="space-y-3">
            <Button onClick={() => setView('create')} className="w-full gap-2" variant="outline">
              <Plus className="w-4 h-4" /> New Service
            </Button>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {services.map((service) => (
                <div key={service.id} className="p-3 border rounded-lg hover:bg-muted/30">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-sm">{service.name}</div>
                      {service.description && (
                        <div className="text-xs text-muted-foreground mt-0.5 line-clamp-1">
                          {service.description}
                        </div>
                      )}
                      <div className="text-xs font-semibold text-primary mt-1">
                        {formatCurrency(service.rate, invoice.currency)}
                      </div>
                      {service.terms && (
                        <div className="text-xs text-muted-foreground mt-1 line-clamp-1 italic">
                          Terms: {service.terms}
                        </div>
                      )}
                    </div>
                    <div className="flex gap-1 shrink-0">
                      <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => handleEdit(service)}>
                        <Pencil className="w-3 h-3" />
                      </Button>
                      <Button
                        size="icon" variant="ghost"
                        className="h-7 w-7 text-destructive hover:text-destructive"
                        onClick={() => { deleteService(service.id); toast.success('Service deleted'); }}
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {view === 'create' && <FormView onSave={handleCreate} />}
        {view === 'edit' && <FormView onSave={handleUpdate} />}
      </DialogContent>
    </Dialog>
  );
}
