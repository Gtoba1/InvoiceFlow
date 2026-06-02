'use client';

import { useState } from 'react';
import { useApp } from '@/contexts/AppContext';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from '@/components/ui/tooltip';
import { ProfileDialog } from '@/components/dialogs/ProfileDialog';
import { ServicesDialog } from '@/components/dialogs/ServicesDialog';
import { useTheme } from 'next-themes';
import { toast } from 'sonner';
import {
  User, Briefcase, Plus, Moon, Sun, Save, RotateCcw,
  Zap
} from 'lucide-react';

export function Header() {
  const { resetInvoice, saveInvoice, invoice } = useApp();
  const { theme, setTheme } = useTheme();
  const [profileOpen, setProfileOpen] = useState(false);
  const [servicesOpen, setServicesOpen] = useState(false);

  const handleSave = () => {
    saveInvoice();
    toast.success('Invoice saved!');
  };

  const handleNew = () => {
    if (invoice.items.length > 0 || invoice.client.name) {
      if (!confirm('Start a new invoice? Current invoice will be saved.')) return;
      saveInvoice();
    }
    resetInvoice();
    toast.success('New invoice created!');
  };

  return (
    <TooltipProvider>
      <header className="flex items-center justify-between px-4 py-3 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-40">
        {/* Logo */}
        <div className="flex items-center gap-2.5">
          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary text-primary-foreground">
            <Zap className="w-4 h-4" />
          </div>
          <div>
            <span className="font-bold text-sm">Invoice</span>
            <span className="font-bold text-sm text-primary">Flow</span>
          </div>
          <div className="h-4 w-px bg-border mx-1" />
          <span className="text-xs text-muted-foreground font-mono">{invoice.invoiceNumber}</span>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1.5">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="sm" onClick={() => setProfileOpen(true)} className="gap-1.5 text-xs h-8">
                <User className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Profile</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>Edit your profile & branding</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="sm" onClick={() => setServicesOpen(true)} className="gap-1.5 text-xs h-8">
                <Briefcase className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Services</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>Manage service catalogue</TooltipContent>
          </Tooltip>

          <div className="h-4 w-px bg-border mx-1" />

          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}>
                {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              </Button>
            </TooltipTrigger>
            <TooltipContent>Toggle theme</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="outline" size="sm" onClick={handleSave} className="gap-1.5 text-xs h-8">
                <Save className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Save</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>Save invoice</TooltipContent>
          </Tooltip>

          <Button size="sm" onClick={handleNew} className="gap-1.5 text-xs h-8">
            <Plus className="w-3.5 h-3.5" />
            New Invoice
          </Button>
        </div>
      </header>

      <ProfileDialog open={profileOpen} onOpenChange={setProfileOpen} />
      <ServicesDialog open={servicesOpen} onOpenChange={setServicesOpen} />
    </TooltipProvider>
  );
}
