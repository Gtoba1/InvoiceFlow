'use client';

/**
 * ProfileSetupDialog — shown on first login.
 * Forces the user to fill in at minimum their full name before using the app.
 * Supports brand colour selection via hex input, RGB inputs, or preset swatches.
 * Logo upload is optional but shown prominently.
 */
import { useState, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { fileToBase64 } from '@/lib/export';
import { Upload, X, Loader2, Zap } from 'lucide-react';

// Preset accent colours shown as swatches
const PRESET_COLORS = [
  '#3b82f6', // blue (default)
  '#10b981', // emerald
  '#f59e0b', // amber
  '#ef4444', // red
  '#8b5cf6', // violet
  '#06b6d4', // cyan
  '#1e3a8a', // navy
  '#064e3b', // dark green
  '#7c2d12', // brown
  '#1f2937', // dark grey
];

/** Parse a hex string (#rrggbb) into {r, g, b} integers. */
function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? { r: parseInt(result[1], 16), g: parseInt(result[2], 16), b: parseInt(result[3], 16) }
    : null;
}

/** Convert r,g,b integers back to a hex string. */
function rgbToHex(r: number, g: number, b: number): string {
  return '#' + [r, g, b].map((n) => Math.max(0, Math.min(255, n)).toString(16).padStart(2, '0')).join('');
}

interface Props {
  open: boolean;
  userEmail: string;
  onSave: (profile: Record<string, string>) => Promise<void>;
}

export function ProfileSetupDialog({ open, userEmail, onSave }: Props) {
  const [fullName, setFullName] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [accentColor, setAccentColor] = useState('#3b82f6');
  const [logo, setLogo] = useState('');
  const [hexInput, setHexInput] = useState('#3b82f6');
  const [rgb, setRgb] = useState({ r: 59, g: 130, b: 246 });
  const [saving, setSaving] = useState(false);
  const logoInputRef = useRef<HTMLInputElement>(null);

  /** Apply a new colour from any source and sync all three inputs. */
  const applyColor = (hex: string) => {
    const parsed = hexToRgb(hex);
    if (!parsed) return;
    setAccentColor(hex);
    setHexInput(hex);
    setRgb(parsed);
  };

  const handleHexChange = (value: string) => {
    setHexInput(value);
    if (/^#[0-9a-fA-F]{6}$/.test(value)) applyColor(value);
  };

  const handleRgbChange = (channel: 'r' | 'g' | 'b', value: string) => {
    const num = Math.max(0, Math.min(255, parseInt(value) || 0));
    const newRgb = { ...rgb, [channel]: num };
    setRgb(newRgb);
    applyColor(rgbToHex(newRgb.r, newRgb.g, newRgb.b));
  };

  const handleLogoUpload = async (file: File) => {
    try {
      const b64 = await fileToBase64(file);
      setLogo(b64);
    } catch {
      toast.error('Failed to upload logo');
    }
  };

  const handleSave = async () => {
    if (!fullName.trim()) {
      toast.error('Please enter your full name to continue.');
      return;
    }
    setSaving(true);
    try {
      await onSave({
        full_name: fullName,
        business_name: businessName,
        email: userEmail,
        accent_color: accentColor,
        logo,
      });
      toast.success('Profile saved! Welcome to InvoiceFlow.');
    } catch {
      toast.error('Failed to save profile. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    /* Dialog cannot be dismissed — user must fill in their name first */
    <Dialog open={open} onOpenChange={() => {}}>
      <DialogContent
        className="max-w-lg max-h-[90vh] overflow-y-auto sm:max-w-lg w-[95vw]"
        // Remove the default close button
        onInteractOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
      >
        <DialogHeader className="text-center">
          <div className="flex justify-center mb-3">
            <div className="w-12 h-12 rounded-xl bg-primary text-primary-foreground flex items-center justify-center shadow-lg">
              <Zap className="w-6 h-6" />
            </div>
          </div>
          <DialogTitle className="text-xl">Welcome to InvoiceFlow!</DialogTitle>
          <DialogDescription>
            Let&apos;s set up your profile. This appears on every invoice you create.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 pt-2">
          {/* Name fields */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Full Name <span className="text-destructive">*</span></Label>
              <Input
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Gabriel Toba"
                autoFocus
              />
            </div>
            <div className="space-y-1.5">
              <Label>Business Name <span className="text-muted-foreground text-xs">(optional)</span></Label>
              <Input
                value={businessName}
                onChange={(e) => setBusinessName(e.target.value)}
                placeholder="Data Solutions Ltd"
              />
            </div>
          </div>

          <Separator />

          {/* Brand colour picker */}
          <div className="space-y-3">
            <Label className="text-sm font-semibold">Brand Colour</Label>

            {/* Live preview */}
            <div className="flex items-center gap-3">
              <div
                className="w-10 h-10 rounded-lg border shadow-sm flex-shrink-0"
                style={{ backgroundColor: accentColor }}
              />
              <span className="text-sm text-muted-foreground">
                This colour appears in your invoice headers, totals, and accents.
              </span>
            </div>

            {/* Preset swatches */}
            <div className="flex flex-wrap gap-2">
              {PRESET_COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => applyColor(c)}
                  className="w-7 h-7 rounded-full border-2 transition-transform hover:scale-110 focus:outline-none"
                  style={{
                    backgroundColor: c,
                    borderColor: accentColor === c ? 'currentColor' : 'transparent',
                    boxShadow: accentColor === c ? `0 0 0 2px ${c}40` : undefined,
                  }}
                  title={c}
                />
              ))}
            </div>

            {/* Hex + RGB inputs */}
            <div className="grid grid-cols-4 gap-2">
              <div className="col-span-2 space-y-1">
                <Label className="text-xs text-muted-foreground">Hex</Label>
                <Input
                  value={hexInput}
                  onChange={(e) => handleHexChange(e.target.value)}
                  placeholder="#3b82f6"
                  className="font-mono text-sm h-8"
                />
              </div>
              {(['r', 'g', 'b'] as const).map((ch) => (
                <div key={ch} className="space-y-1">
                  <Label className="text-xs text-muted-foreground uppercase">{ch}</Label>
                  <Input
                    type="number"
                    min={0}
                    max={255}
                    value={rgb[ch]}
                    onChange={(e) => handleRgbChange(ch, e.target.value)}
                    className="text-sm h-8 text-center"
                  />
                </div>
              ))}
            </div>
          </div>

          <Separator />

          {/* Logo upload */}
          <div className="space-y-2">
            <Label className="text-sm font-semibold">
              Logo <span className="text-muted-foreground text-xs font-normal">(optional)</span>
            </Label>
            {logo ? (
              <div className="flex items-center gap-3">
                <img src={logo} alt="Logo preview" className="h-14 w-auto max-w-[160px] object-contain border rounded-lg p-1 bg-gray-50" />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setLogo('')}
                  className="gap-1.5 text-destructive hover:text-destructive"
                >
                  <X className="w-3.5 h-3.5" /> Remove
                </Button>
              </div>
            ) : (
              <label className="flex flex-col items-center justify-center h-20 border-2 border-dashed border-border rounded-lg cursor-pointer hover:bg-muted/30 transition-colors">
                <Upload className="w-5 h-5 text-muted-foreground mb-1" />
                <span className="text-xs text-muted-foreground">Click to upload logo (PNG, JPG, SVG)</span>
                <input
                  ref={logoInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => e.target.files?.[0] && handleLogoUpload(e.target.files[0])}
                />
              </label>
            )}
          </div>
        </div>

        <Button
          onClick={handleSave}
          disabled={saving || !fullName.trim()}
          className="w-full mt-2"
          size="lg"
        >
          {saving ? <><Loader2 className="w-4 h-4 animate-spin" /> Saving…</> : 'Get Started →'}
        </Button>
      </DialogContent>
    </Dialog>
  );
}
