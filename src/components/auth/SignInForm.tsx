'use client';

/**
 * Sign-in form component.
 * Handles email/password login via Supabase Auth.
 * Shows inline error messages and a loading state during submission.
 */
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Zap, Loader2, Eye, EyeOff } from 'lucide-react';

export function SignInForm() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      // Map Supabase error messages to friendlier ones
      if (error.message.includes('Invalid login')) {
        setError('Incorrect email or password. Please try again.');
      } else if (error.message.includes('Email not confirmed')) {
        setError('Please verify your email before signing in. Check your inbox.');
      } else {
        setError(error.message);
      }
      setLoading(false);
      return;
    }

    // Refresh the page so the middleware can pick up the new session
    router.push('/');
    router.refresh();
  };

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
        <p className="text-sm text-muted-foreground mt-1">Sign in to your account</p>
      </div>

      {/* Sign-in form */}
      <form onSubmit={handleSignIn} className="space-y-4">
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
            autoFocus
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
              placeholder="••••••••"
              required
              autoComplete="current-password"
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

        {/* Error message */}
        {error && (
          <div className="text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-md px-3 py-2">
            {error}
          </div>
        )}

        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Signing in…</> : 'Sign In'}
        </Button>
      </form>

      {/* Forgot password */}
      <div className="text-center mt-3">
        <Link href="/forgot-password" className="text-sm text-muted-foreground hover:text-foreground hover:underline">
          Forgot password?
        </Link>
      </div>

      {/* Sign-up link */}
      <p className="text-center text-sm text-muted-foreground mt-4">
        Don&apos;t have an account?{' '}
        <Link href="/sign-up" className="text-primary font-medium hover:underline">
          Create account
        </Link>
      </p>
    </div>
  );
}
