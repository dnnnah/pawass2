export function hasSupabaseEnvironment(): boolean {
  return Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY);
}

function normalizeOrigin(value: string | undefined, protocol = 'https:'): string | null {
  if (!value) return null;
  try {
    const url = new URL(value.includes('://') ? value : `${protocol}//${value}`);
    if (url.protocol !== 'http:' && url.protocol !== 'https:') return null;
    return url.origin;
  } catch {
    return null;
  }
}

export function getSiteUrl(environment: NodeJS.ProcessEnv = process.env): string {
  return normalizeOrigin(environment.NEXT_PUBLIC_SITE_URL)
    || normalizeOrigin(environment.VERCEL_PROJECT_PRODUCTION_URL)
    || normalizeOrigin(environment.VERCEL_URL)
    || 'http://localhost:3000';
}

export function getAuthCallbackOrigin(requestOrigin: string, environment: NodeJS.ProcessEnv = process.env): string {
  const requestedOrigin = normalizeOrigin(requestOrigin);
  const allowedOrigins = [
    getSiteUrl(environment),
    normalizeOrigin(environment.VERCEL_URL),
    normalizeOrigin(environment.VERCEL_BRANCH_URL),
  ].filter((origin): origin is string => origin !== null);

  return requestedOrigin && allowedOrigins.includes(requestedOrigin) ? requestedOrigin : getSiteUrl(environment);
}

export function isLocalTestLoginEnabled(): boolean {
  if (process.env.NODE_ENV !== 'development') return false;
  try {
    const host = new URL(process.env.NEXT_PUBLIC_SUPABASE_URL || '').hostname;
    return host === 'localhost' || host === '127.0.0.1' || host === '::1';
  } catch {
    return false;
  }
}
