'use client';

/**
 * App header — shown on /app and /invoices pages.
 * User menu only shows Admin Portal link for users with is_admin = true.
 * Regular users never see admin options.
 */
import { useState } from 'react';
import { useApp } from '@/contexts/AppContext';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from '@/components/ui/tooltip';
import { ProfileDialog } from '@/components/dialogs/ProfileDialog';
import { ServicesDialog } from '@/components/dialogs/ServicesDialog';
import { useTheme } from 'next-themes';
import { toast } from 'sonner';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  User, Briefcase, Plus, Moon, Sun, Save,
  Zap, LogOut, Shield, ChevronDown, History,
} from 'lucide-react';

export function Header() {
  const { resetInvoice, saveInvoice, invoice, profile } = useApp();
  const { theme, setTheme } = useTheme();
  const [profileOpen, setProfileOpen] = useState(false);
  const [servicesOpen, setServicesOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const router = useRouter();

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

  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/sign-in');
    router.refresh();
  };

  // First letter of name or email for the avatar badge
  const avatarLetter = (profile.fullName || profile.email || 'U')[0].toUpperCase();

  return (
    <TooltipProvider>
      <header className="flex items-center justify-between px-3 sm:px-4 py-2.5 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-40">

        {/* Brand + invoice number */}
        <div className="flex items-center gap-2">
          <div className="flex items-center justify-center w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-primary text-primary-foreground flex-shrink-0">
            <Zap className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </div>
          <Link href="/app" className="hidden sm:flex items-center">
            <span className="font-bold text-sm">Invoice</span>
            <span className="font-bold text-sm text-primary">Flow</span>
          </Link>
          <div className="h-4 w-px bg-border mx-1 hidden sm:block" />
          <span className="text-xs text-muted-foreground font-mono hidden sm:inline">
            {invoice.invoiceNumber}
          </span>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1">

          {/* Invoice history */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="sm" onClick={() => router.push('/invoices')} className="gap-1.5 h-8 px-2 sm:px-3">
                <History className="w-3.5 h-3.5" />
                <span className="hidden sm:inline text-xs">History</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>Invoice history</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="sm" onClick={() => setProfileOpen(true)} className="gap-1.5 h-8 px-2 sm:px-3">
                <User className="w-3.5 h-3.5" />
                <span className="hidden sm:inline text-xs">Profile</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>Edit profile &amp; branding</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="sm" onClick={() => setServicesOpen(true)} className="gap-1.5 h-8 px-2 sm:px-3">
                <Briefcase className="w-3.5 h-3.5" />
                <span className="hidden sm:inline text-xs">Services</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>Service catalogue</TooltipContent>
          </Tooltip>

          <div className="h-4 w-px bg-border mx-0.5" />

          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8"
                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}>
                {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              </Button>
            </TooltipTrigger>
            <TooltipContent>Toggle theme</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="outline" size="sm" onClick={handleSave} className="gap-1.5 h-8 px-2 sm:px-3">
                <Save className="w-3.5 h-3.5" />
                <span className="hidden sm:inline text-xs">Save</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>Save invoice</TooltipContent>
          </Tooltip>

          <Button size="sm" onClick={handleNew} className="gap-1.5 h-8 px-2 sm:px-3">
            <Plus className="w-3.5 h-3.5" />
            <span className="hidden sm:inline text-xs">New Invoice</span>
          </Button>

          {/* User menu */}
          <div className="relative ml-1">
            <button
              onClick={() => setUserMenuOpen((o) => !o)}
              className="flex items-center gap-1.5 h-8 px-2 rounded-md hover:bg-muted transition-colors"
            >
              <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold flex-shrink-0">
                {avatarLetter}
              </div>
              <ChevronDown className="w-3 h-3 text-muted-foreground hidden sm:block" />
            </button>

            {userMenuOpen && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setUserMenuOpen(false)} />
                <div className="absolute right-0 top-10 z-50 w-52 bg-background border rounded-lg shadow-lg py-1 text-sm">
                  {/* User info */}
                  <div className="px-3 py-2.5 border-b">
                    <div className="font-medium truncate">{profile.fullName || 'My Account'}</div>
                    <div className="text-xs text-muted-foreground truncate">{profile.email}</div>
                  </div>

                  {/* My Account → opens profile dialog */}
                  <button
                    className="w-full flex items-center gap-2 px-3 py-2 hover:bg-muted transition-colors text-left"
                    onClick={() => { setUserMenuOpen(false); setProfileOpen(true); }}
                  >
                    <User className="w-4 h-4 text-muted-foreground" />
                    My Account
                  </button>

                  {/* Invoice history */}
                  <button
                    className="w-full flex items-center gap-2 px-3 py-2 hover:bg-muted transition-colors text-left"
                    onClick={() => { setUserMenuOpen(false); router.push('/invoices'); }}
                  >
                    <History className="w-4 h-4 text-muted-foreground" />
                    Invoice History
                  </button>

                  {/* Admin Portal — only visible to admins */}
                  {profile.isAdmin && (
                    <button
                      className="w-full flex items-center gap-2 px-3 py-2 hover:bg-muted transition-colors text-left"
                      onClick={() => { setUserMenuOpen(false); router.push('/admin'); }}
                    >
                      <Shield className="w-4 h-4 text-amber-500" />
                      Admin Portal
                    </button>
                  )}

                  <div className="border-t my-1" />

                  <button
                    className="w-full flex items-center gap-2 px-3 py-2 hover:bg-muted transition-colors text-left text-destructive"
                    onClick={handleSignOut}
                  >
                    <LogOut className="w-4 h-4" />
                    Sign Out
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </header>

      <ProfileDialog open={profileOpen} onOpenChange={setProfileOpen} />
      <ServicesDialog open={servicesOpen} onOpenChange={setServicesOpen} />
    </TooltipProvider>
  );
}
