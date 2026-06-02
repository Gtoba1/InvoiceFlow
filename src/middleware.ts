/**
 * Next.js middleware — runs on every non-static request.
 *
 * Route access rules:
 *   /                  → public landing page (always accessible)
 *   /sign-in           → public, redirect to /app if already logged in
 *   /sign-up           → public, redirect to /app if already logged in
 *   /forgot-password   → public
 *   /reset-password    → public (needs active session from email link)
 *   /auth/callback     → public (email verification handler)
 *   /app               → protected, redirect to /sign-in if not logged in
 *   /invoices          → protected
 *   /admin             → protected + admin only
 */
import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

// Routes that anyone can visit without being logged in
const PUBLIC_PATHS = ['/', '/sign-in', '/sign-up', '/forgot-password', '/reset-password', '/auth/callback'];

// Routes that logged-in users should be redirected AWAY from (→ /app)
const AUTH_REDIRECT_PATHS = ['/sign-in', '/sign-up', '/forgot-password'];

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });
  const path = request.nextUrl.pathname;

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return request.cookies.getAll(); },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  // Refresh session — do NOT remove this line
  const { data: { user } } = await supabase.auth.getUser();

  const isPublic = PUBLIC_PATHS.some((p) => path === p || path.startsWith(p + '/'));
  const isAuthPage = AUTH_REDIRECT_PATHS.includes(path);

  // Unauthenticated user trying to reach a protected page → sign-in
  if (!user && !isPublic) {
    const url = request.nextUrl.clone();
    url.pathname = '/sign-in';
    return NextResponse.redirect(url);
  }

  // Authenticated user visiting sign-in/sign-up → send to app
  if (user && isAuthPage) {
    const url = request.nextUrl.clone();
    url.pathname = '/app';
    return NextResponse.redirect(url);
  }

  // Authenticated user on the landing page → send to the editor
  if (user && path === '/') {
    const url = request.nextUrl.clone();
    url.pathname = '/app';
    return NextResponse.redirect(url);
  }

  // Admin-only guard for /admin routes
  if (user && path.startsWith('/admin')) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('is_admin')
      .eq('id', user.id)
      .single();

    if (!profile?.is_admin) {
      const url = request.nextUrl.clone();
      url.pathname = '/app';
      return NextResponse.redirect(url);
    }
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
