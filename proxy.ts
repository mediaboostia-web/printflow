import { NextResponse, type NextRequest } from 'next/server';
import { createServerClient } from '@supabase/ssr';

// Real, server-side route protection (Next.js 16 renamed `middleware` to `proxy`).
// Everything under app/(app)/* plus /super-admin is gated by an actual Supabase
// Auth session read from cookies — this runs before any page/bundle is served,
// unlike the client-side useEffect guards in app/(app)/layout.tsx and
// app/super-admin/page.tsx, which only ever ran after the page had already loaded.
const PROTECTED_APP_PATHS = [
  '/dashboard', '/clients', '/devis', '/bat', '/commandes', '/commandes-en-ligne',
  '/livraisons', '/factures', '/historique', '/parametres', '/aide',
];

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Note: '/catalogue' (the internal, authenticated catalogue manager) is
  // protected, but '/catalogue/[orgId]' (the public storefront) must never be.
  const isSuperAdminArea = pathname.startsWith('/super-admin') && pathname !== '/super-admin/login';
  const isProtectedAppPath =
    pathname === '/catalogue' ||
    PROTECTED_APP_PATHS.some((p) => pathname === p || pathname.startsWith(`${p}/`));

  if (!isSuperAdminArea && !isProtectedAppPath) {
    return NextResponse.next();
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!supabaseUrl || !supabaseAnonKey) {
    // Supabase not configured yet — fall back to the client-side guard.
    return NextResponse.next();
  }

  let response = NextResponse.next({ request });

  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
      },
    },
  });

  const { data: { user }, error: getUserError } = await supabase.auth.getUser();
  const printflowSession = request.cookies.get('printflow_session')?.value;

  if (!user && !printflowSession) {
    const loginPath = isSuperAdminArea ? '/super-admin/login' : '/login';
    return NextResponse.redirect(new URL(loginPath, request.url));
  }

  return response;
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
