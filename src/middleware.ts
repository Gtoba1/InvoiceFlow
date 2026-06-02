/**
 * Next.js middleware — runs on every request before the page renders.
 * Responsibilities:
 *   1. Refresh the Supabase session cookie so it stays alive.
 *   2. Redirect unauthenticated users to /sign-in.
 *   3. Redirect already-authenticated users away from auth pages.
 *   4. Block non-admin users from the /admin route.
 */
import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  // Build a Supabase client that can read/write cookies on this request
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          // Apply cookie changes to both the request and the outgoing response
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  // Refresh the session — IMPORTANT: do not remove this call
  const { data: { user } } = await supabase.auth.getUser();

  const path = request.nextUrl.pathname;

  // Routes that don't require authentication
  const isAuthRoute = path.startsWith('/sign-in') || path.startsWith('/sign-up');
  const isCallbackRoute = path.startsWith('/auth/callback');
  const isPublic = isAuthRoute || isCallbackRoute;

  // Unauthenticated user trying to access a protected page → send to sign-in
  if (!user && !isPublic) {
    const url = request.nextUrl.clone();
    url.pathname = '/sign-in';
    return NextResponse.redirect(url);
  }

  // Authenticated user visiting sign-in/sign-up → send to app
  if (user && isAuthRoute) {
    const url = request.nextUrl.clone();
    url.pathname = '/';
    return NextResponse.redirect(url);
  }

  // Admin route protection — check is_admin flag from profiles table
  if (user && path.startsWith('/admin')) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('is_admin')
      .eq('id', user.id)
      .single();

    if (!profile?.is_admin) {
      const url = request.nextUrl.clone();
      url.pathname = '/';
      return NextResponse.redirect(url);
    }
  }

  return supabaseResponse;
}

export const config = {
  // Run middleware on all routes except Next.js internals and static files
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
