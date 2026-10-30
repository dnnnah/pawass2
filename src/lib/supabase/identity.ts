export type VerifiedIdentity = { id: string; email: string | null };

export function getIdentityFromClaims(claims: unknown): VerifiedIdentity | null {
  if (!claims || typeof claims !== 'object') return null;
  const value = claims as { sub?: unknown; email?: unknown };
  if (typeof value.sub !== 'string' || !isUuid(value.sub)) return null;
  return { id: value.sub, email: typeof value.email === 'string' ? value.email : null };
}

function isUuid(value: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
}
