/**
 * Supabase Auth callback handler.
 * Supabase redirects here after a user clicks their email verification link.
 * We exchange the one-time code for a session, then redirect to the app.
 */
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { NextResponse, type NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const next = searchParams.get('next') ?? '/'; // where to go after verification

  if (code) {
    const cookieStore = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() { return cookieStore.getAll(); },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options),
            );
          },
        },
      },
    );

    // Exchange the auth code for an active session
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      // Verification successful — send the user into the app
      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  // Something went wrong — redirect back to sign-in with an error hint
  return NextResponse.redirect(`${origin}/sign-in?error=verification_failed`);
}
