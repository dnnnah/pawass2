import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';
import { getAuthRedirectPath } from './auth-routing';
import { shouldDisableResponseCaching } from './cache-policy';

export async function updateSession(request: NextRequest) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  const disableCaching = shouldDisableResponseCaching(request.nextUrl.pathname);
  const setRouteCacheHeaders = (response: NextResponse) => {
    if (disableCaching) response.headers.set('Cache-Control', 'private, no-store, max-age=0');
    return response;
  };
  if (!url || !key) return setRouteCacheHeaders(NextResponse.next({ request }));

  let response = setRouteCacheHeaders(NextResponse.next({ request }));
  const supabase = createServerClient(url, key, {
    cookies: {
      getAll: () => request.cookies.getAll(),
      setAll(cookiesToSet, cacheHeaders) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        response = setRouteCacheHeaders(NextResponse.next({ request }));
        cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
        Object.entries(cacheHeaders || {}).forEach(([name, value]) => response.headers.set(name, value));
        response = setRouteCacheHeaders(response);
      },
    },
  });
  const { data } = await supabase.auth.getClaims();
  const redirectPath = getAuthRedirectPath(request.nextUrl.pathname, Boolean(data?.claims?.sub));
  if (redirectPath) {
    const redirectResponse = NextResponse.redirect(new URL(redirectPath, request.url));
    response.cookies.getAll().forEach((cookie) => redirectResponse.cookies.set(cookie));
    response.headers.forEach((value, name) => {
      if (name.toLowerCase() === 'cache-control' || name.toLowerCase() === 'expires' || name.toLowerCase() === 'pragma') {
        redirectResponse.headers.set(name, value);
      }
    });
    return setRouteCacheHeaders(redirectResponse);
  }
  return response;
}
