'use client';

/**
 * Sign-up / registration form component.
 * Creates a new Supabase account and triggers the email verification flow.
 * After sign-up, shows a "check your inbox" confirmation instead of redirecting.
 */
import { useState } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Zap, Loader2, Eye, EyeOff, MailCheck } from 'lucide-react';

export function SignUpForm() {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false); // show success state after sign-up

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Basic client-side password confirmation check
    if (password !== confirm) {
      setError('Passwords do not match.');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    setLoading(true);
    const supabase = createClient();

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        // Pass the full name so the DB trigger can store it in profiles
        data: { full_name: fullName },
        // After clicking the verification link, send user to our callback handler
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    // Success — tell user to check email
    setDone(true);
    setLoading(false);
  };

  // ── Post-signup confirmation screen ──────────────────────
  if (done) {
    return (
      <div className="w-full max-w-sm text-center space-y-4">
        <div className="flex justify-center">
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
            <MailCheck className="w-8 h-8 text-primary" />
          </div>
        </div>
        <h2 className="text-xl font-bold">Check your inbox</h2>
        <p className="text-muted-foreground text-sm">
          We sent a verification link to <strong>{email}</strong>.
          Click it to activate your account, then come back and sign in.
        </p>
        <Link href="/sign-in">
          <Button variant="outline" className="w-full">Back to Sign In</Button>
        </Link>
      </div>
    );
  }

  // ── Registration form ────────────────────────────────────
  return (
    <div className="w-full max-w-sm">
      {/* Brand header */}
      <div className="flex flex-col items-center mb-8">
        <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-primary text-primary-foreground mb-3 shadow-lg">
          <Zap className="w-6 h-6" />
        </div>
        <h1 className="text-2xl font-bold">
          Invoice<span className="text-primary">Flow</span>
        </h1>
        <p className="text-sm text-muted-foreground mt-1">Create your free account</p>
      </div>

      <form onSubmit={handleSignUp} className="space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="fullName">Full Name</Label>
          <Input
            id="fullName"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder="Gabriel Toba"
            required
            autoFocus
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="email">Email address</Label>
          <Input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            required
            autoComplete="email"
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="password">Password</Label>
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Min. 6 characters"
              required
              className="pr-10"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              tabIndex={-1}
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="confirm">Confirm Password</Label>
          <Input
            id="confirm"
            type="password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            placeholder="Re-enter your password"
            required
          />
        </div>

        {error && (
          <div className="text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-md px-3 py-2">
            {error}
          </div>
        )}

        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Creating account…</> : 'Create Account'}
        </Button>
      </form>

      <p className="text-center text-sm text-muted-foreground mt-6">
        Already have an account?{' '}
        <Link href="/sign-in" className="text-primary font-medium hover:underline">
          Sign in
        </Link>
      </p>
    </div>
  );
}
