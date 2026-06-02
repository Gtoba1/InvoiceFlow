'use client';

import { useState } from 'react';
import { useApp } from '@/contexts/AppContext';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { fileToBase64 } from '@/lib/export';
import { Upload, X } from 'lucide-react';
import { FreelancerProfile } from '@/types';

interface ProfileDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ProfileDialog({ open, onOpenChange }: ProfileDialogProps) {
  const { profile, setProfile } = useApp();
  const [form, setForm] = useState<FreelancerProfile>({ ...profile });

  const set = (key: keyof FreelancerProfile, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleImageUpload = async (key: 'logo' | 'signature', file: File) => {
    try {
      const b64 = await fileToBase64(file);
      setForm((prev) => ({ ...prev, [key]: b64 }));
    } catch {
      toast.error('Failed to upload image');
    }
  };

  const handleSave = () => {
    setProfile(form);
    toast.success('Profile saved!');
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Freelancer Profile</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* Basic Info */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Full Name *</Label>
              <Input value={form.fullName} onChange={(e) => set('fullName', e.target.value)} placeholder="John Doe" />
            </div>
            <div className="space-y-1.5">
              <Label>Business Name</Label>
              <Input value={form.businessName} onChange={(e) => set('businessName', e.target.value)} placeholder="Your Business" />
            </div>
            <div className="space-y-1.5">
              <Label>Email</Label>
              <Input type="email" value={form.email} onChange={(e) => set('email', e.target.value)} placeholder="you@email.com" />
            </div>
            <div className="space-y-1.5">
              <Label>Phone</Label>
              <Input value={form.phone} onChange={(e) => set('phone', e.target.value)} placeholder="+234 800 000 0000" />
            </div>
            <div className="space-y-1.5 col-span-2">
              <Label>Address</Label>
              <Input value={form.address} onChange={(e) => set('address', e.target.value)} placeholder="Lagos, Nigeria" />
            </div>
            <div className="space-y-1.5 col-span-2">
              <Label>Website</Label>
              <Input value={form.website} onChange={(e) => set('website', e.target.value)} placeholder="https://yourwebsite.com" />
            </div>
          </div>

          <Separator />

          {/* Bank Details */}
          <div>
            <h3 className="text-sm font-semibold mb-3">Bank Details</h3>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Bank Name</Label>
                <Input value={form.bankName} onChange={(e) => set('bankName', e.target.value)} placeholder="First Bank" />
              </div>
              <div className="space-y-1.5">
                <Label>Account Number</Label>
                <Input value={form.accountNumber} onChange={(e) => set('accountNumber', e.target.value)} placeholder="1234567890" />
              </div>
              <div className="space-y-1.5 col-span-2">
                <Label>Account Name</Label>
                <Input value={form.accountName} onChange={(e) => set('accountName', e.target.value)} placeholder="John Doe" />
              </div>
            </div>
          </div>

          <Separator />

          {/* Branding */}
          <div>
            <h3 className="text-sm font-semibold mb-3">Branding</h3>
            <div className="grid grid-cols-2 gap-4">
              {/* Logo */}
              <div className="space-y-2">
                <Label>Logo</Label>
                {form.logo ? (
                  <div className="relative inline-block">
                    <img src={form.logo} alt="Logo" className="h-16 w-auto max-w-full object-contain border rounded p-1 bg-gray-50" />
                    <button
                      onClick={() => setForm((p) => ({ ...p, logo: '' }))}
                      className="absolute -top-2 -right-2 bg-destructive text-white rounded-full w-5 h-5 flex items-center justify-center"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ) : (
                  <label className="flex flex-col items-center justify-center h-20 border-2 border-dashed border-border rounded-lg cursor-pointer hover:bg-muted/30 transition-colors">
                    <Upload className="w-5 h-5 text-muted-foreground mb-1" />
                    <span className="text-xs text-muted-foreground">Upload logo</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => e.target.files?.[0] && handleImageUpload('logo', e.target.files[0])}
                    />
                  </label>
                )}
              </div>

              {/* Signature */}
              <div className="space-y-2">
                <Label>Digital Signature</Label>
                {form.signature ? (
                  <div className="relative inline-block">
                    <img src={form.signature} alt="Signature" className="h-16 w-auto max-w-full object-contain border rounded p-1 bg-gray-50" />
                    <button
                      onClick={() => setForm((p) => ({ ...p, signature: '' }))}
                      className="absolute -top-2 -right-2 bg-destructive text-white rounded-full w-5 h-5 flex items-center justify-center"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ) : (
                  <label className="flex flex-col items-center justify-center h-20 border-2 border-dashed border-border rounded-lg cursor-pointer hover:bg-muted/30 transition-colors">
                    <Upload className="w-5 h-5 text-muted-foreground mb-1" />
                    <span className="text-xs text-muted-foreground">Upload signature</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => e.target.files?.[0] && handleImageUpload('signature', e.target.files[0])}
                    />
                  </label>
                )}
              </div>

              {/* Accent Color */}
              <div className="space-y-1.5 col-span-2">
                <Label>Accent Color</Label>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={form.accentColor}
                    onChange={(e) => set('accentColor', e.target.value)}
                    className="h-9 w-16 rounded border border-input cursor-pointer"
                  />
                  <Input
                    value={form.accentColor}
                    onChange={(e) => set('accentColor', e.target.value)}
                    className="font-mono text-sm w-32"
                    placeholder="#3b82f6"
                  />
                  <div className="flex gap-2">
                    {['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#1e3a8a'].map((c) => (
                      <button
                        key={c}
                        onClick={() => setForm((p) => ({ ...p, accentColor: c }))}
                        className="w-6 h-6 rounded-full border-2 transition-transform hover:scale-110"
                        style={{ backgroundColor: c, borderColor: form.accentColor === c ? 'currentColor' : 'transparent' }}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleSave}>Save Profile</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
