'use client';

import { useState } from 'react';
import { useApp } from '@/contexts/AppContext';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { Client, ClientInfo } from '@/types';
import { COUNTRIES, getDialCode } from '@/lib/countries';
import { Plus, Pencil, Trash2, UserCheck } from 'lucide-react';

interface ClientDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const emptyForm = (): Omit<Client, 'id' | 'createdAt'> => ({
  name: '', company: '', email: '', phone: '', address: '', country: '', countryCode: '',
});

export function ClientDialog({ open, onOpenChange }: ClientDialogProps) {
  const { clients, addClient, updateClient, deleteClient, setClientFromSaved } = useApp();
  const [view, setView] = useState<'list' | 'create' | 'edit'>('list');
  const [form, setForm] = useState(emptyForm());
  const [editId, setEditId] = useState<string | null>(null);

  const set = <K extends keyof typeof form>(k: K, v: (typeof form)[K]) =>
    setForm((p) => ({ ...p, [k]: v }));

  const handleCountryChange = (countryCode: string) => {
    const country = COUNTRIES.find((c) => c.code === countryCode);
    if (!country) return;
    const dialCode = country.dialCode;
    const localNumber = form.phone.replace(/^\+\d[\d\s\-()]*\s*/, '').trim();
    setForm((p) => ({
      ...p,
      country: country.name,
      countryCode: country.code,
      phone: localNumber ? `${dialCode} ${localNumber}` : dialCode,
    }));
  };

  const dialCode = getDialCode(form.countryCode);
  const localPhone = dialCode ? form.phone.replace(dialCode, '').trim() : form.phone;

  const handleCreate = () => {
    if (!form.name.trim()) { toast.error('Client name is required'); return; }
    addClient(form);
    toast.success('Client saved!');
    setView('list');
    setForm(emptyForm());
  };

  const handleEdit = (client: Client) => {
    setEditId(client.id);
    setForm({
      name: client.name, company: client.company, email: client.email,
      phone: client.phone, address: client.address,
      country: client.country ?? '', countryCode: client.countryCode ?? '',
    });
    setView('edit');
  };

  const handleUpdate = () => {
    if (!editId || !form.name.trim()) { toast.error('Client name is required'); return; }
    updateClient(editId, form);
    toast.success('Client updated!');
    setView('list');
    setEditId(null);
    setForm(emptyForm());
  };

  const handleSelect = (client: Client) => {
    const info: ClientInfo = {
      name: client.name, company: client.company, email: client.email,
      phone: client.phone, address: client.address,
      country: client.country ?? '', countryCode: client.countryCode ?? '',
    };
    setClientFromSaved(client.id, info);
    toast.success(`${client.name} selected`);
    onOpenChange(false);
  };

  const FormView = ({ onSave }: { onSave: () => void }) => (
    <div className="space-y-3">
      <div className="space-y-1.5">
        <Label>Name *</Label>
        <Input value={form.name} onChange={(e) => set('name', e.target.value)} placeholder="John Doe" autoFocus />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label>Company</Label>
          <Input value={form.company} onChange={(e) => set('company', e.target.value)} placeholder="Acme Corp" />
        </div>
        <div className="space-y-1.5">
          <Label>Email</Label>
          <Input type="email" value={form.email} onChange={(e) => set('email', e.target.value)} placeholder="client@email.com" />
        </div>

        {/* Country */}
        <div className="space-y-1.5">
          <Label>Country</Label>
          <Select value={form.countryCode} onValueChange={handleCountryChange}>
            <SelectTrigger className="text-sm">
              <SelectValue placeholder="Select country..." />
            </SelectTrigger>
            <SelectContent className="max-h-60">
              {COUNTRIES.map((c) => (
                <SelectItem key={c.code} value={c.code}>{c.name} ({c.dialCode})</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Phone */}
        <div className="space-y-1.5">
          <Label>Phone</Label>
          {dialCode ? (
            <div className="flex gap-1.5">
              <div className="flex items-center px-2.5 h-9 bg-muted border border-input rounded-md text-sm text-muted-foreground whitespace-nowrap shrink-0">
                {dialCode}
              </div>
              <Input
                value={localPhone}
                onChange={(e) => set('phone', `${dialCode} ${e.target.value}`)}
                placeholder="800 123 4567"
                className="text-sm"
              />
            </div>
          ) : (
            <Input value={form.phone} onChange={(e) => set('phone', e.target.value)} placeholder="+234 800 000 0000" />
          )}
        </div>

        <div className="space-y-1.5 col-span-2">
          <Label>Address</Label>
          <Input value={form.address} onChange={(e) => set('address', e.target.value)} placeholder="City, Country" />
        </div>
      </div>
      <div className="flex gap-2 pt-1">
        <Button variant="outline" onClick={() => { setView('list'); setForm(emptyForm()); }} className="flex-1">Cancel</Button>
        <Button onClick={onSave} className="flex-1">Save Client</Button>
      </div>
    </div>
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {view === 'list' ? 'Saved Clients' : view === 'create' ? 'New Client' : 'Edit Client'}
          </DialogTitle>
        </DialogHeader>

        {view === 'list' && (
          <div className="space-y-3">
            <Button onClick={() => setView('create')} className="w-full gap-2" variant="outline">
              <Plus className="w-4 h-4" /> New Client
            </Button>
            {clients.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground text-sm">
                No saved clients yet. Create one above.
              </div>
            ) : (
              <div className="space-y-2 max-h-80 overflow-y-auto">
                {clients.map((client) => (
                  <div key={client.id} className="flex items-center gap-2 p-3 border rounded-lg hover:bg-muted/30">
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-sm truncate">{client.name}</div>
                      {(client.company || client.country) && (
                        <div className="text-xs text-muted-foreground truncate">
                          {[client.company, client.country].filter(Boolean).join(' · ')}
                        </div>
                      )}
                    </div>
                    <Button size="sm" variant="ghost" onClick={() => handleSelect(client)} className="shrink-0 gap-1.5 text-xs">
                      <UserCheck className="w-3.5 h-3.5" /> Use
                    </Button>
                    <Button size="icon" variant="ghost" className="h-7 w-7 shrink-0" onClick={() => handleEdit(client)}>
                      <Pencil className="w-3 h-3" />
                    </Button>
                    <Button size="icon" variant="ghost" className="h-7 w-7 shrink-0 text-destructive hover:text-destructive" onClick={() => { deleteClient(client.id); toast.success('Client deleted'); }}>
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
        {view === 'create' && <FormView onSave={handleCreate} />}
        {view === 'edit' && <FormView onSave={handleUpdate} />}
      </DialogContent>
    </Dialog>
  );
}
