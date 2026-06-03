'use client';

/**
 * Email verification callback — /auth/callback
 *
 * Supabase sends users here after they click the verification link.
 * We handle it client-side so the browser Supabase client can access
 * the PKCE code verifier it stored in localStorage during sign-up.
 *
 * A server-side Route Handler can't reliably access that verifier,
 * which caused "verification_failed" errors for all users.
 */
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Loader2, CheckCircle, XCircle } from 'lucide-react';
import Link from 'next/link';

export default function AuthCallbackPage() {
  const router = useRouter();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');

  useEffect(() => {
    const supabase = createClient();

    const run = async () => {
      const params = new URLSearchParams(window.location.search);
      const code  = params.get('code');
      const next  = params.get('next') ?? '/app';

      // If Supabase returned an error directly in the URL
      if (params.get('error')) {
        setStatus('error');
        return;
      }

      if (code) {
        // Exchange the auth code for a session using the browser client.
        // The browser has the PKCE code verifier in localStorage — this is
        // why this must run client-side, not in a server Route Handler.
        const { error } = await supabase.auth.exchangeCodeForSession(code);

        if (error) {
          console.error('[AuthCallback] code exchange failed:', error.message);
          setStatus('error');
          return;
        }
      }

      // Confirm we have a valid session before redirecting
      const { data: { session } } = await supabase.auth.getSession();

      if (session) {
        setStatus('success');
        // Brief pause so the user sees the success state, then redirect
        setTimeout(() => router.push(next), 800);
      } else {
        setStatus('error');
      }
    };

    run();
  }, [router]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-background px-4">
      {status === 'loading' && (
        <>
          <Loader2 className="w-10 h-10 animate-spin text-primary" />
          <p className="text-muted-foreground text-sm">Verifying your email…</p>
        </>
      )}

      {status === 'success' && (
        <>
          <CheckCircle className="w-10 h-10 text-emerald-500" />
          <p className="font-semibold">Email verified!</p>
          <p className="text-muted-foreground text-sm">Redirecting you to the app…</p>
        </>
      )}

      {status === 'error' && (
        <>
          <XCircle className="w-10 h-10 text-destructive" />
          <p className="font-semibold">Verification failed</p>
          <p className="text-muted-foreground text-sm text-center max-w-xs">
            The link may have expired or already been used.
            Try signing in — if your account is verified you&apos;ll get straight through.
          </p>
          <Link
            href="/sign-in"
            className="mt-2 text-sm text-primary font-medium hover:underline"
          >
            Go to Sign In
          </Link>
        </>
      )}
    </div>
  );
}
