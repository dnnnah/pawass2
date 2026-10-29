import { NextResponse, type NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getSiteUrl } from '@/lib/supabase/env';
import { safeRedirectPath } from '@/lib/domain';

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get('code');
  const next = request.nextUrl.searchParams.get('next') || '/cuenta';
  const safeNext = safeRedirectPath(next, getSiteUrl());
  const supabase = await createClient();

  if (code && supabase) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) return NextResponse.redirect(new URL(safeNext, getSiteUrl()));
  }
  return NextResponse.redirect(new URL('/?auth=error', getSiteUrl()));
}
