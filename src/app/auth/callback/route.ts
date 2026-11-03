import { NextResponse, type NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getAuthCallbackOrigin } from '@/lib/supabase/env';
import { safeRedirectPath } from '@/lib/domain';

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get('code');
  const next = request.nextUrl.searchParams.get('next') || '/mascotas';
  const origin = getAuthCallbackOrigin(request.nextUrl.origin);
  const safeNext = safeRedirectPath(next, origin);
  const supabase = await createClient();

  if (code && supabase) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) return NextResponse.redirect(new URL(safeNext, origin));
  }
  return NextResponse.redirect(new URL('/acceso?auth=error', origin));
}
