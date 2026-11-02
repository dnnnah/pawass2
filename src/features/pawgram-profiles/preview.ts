import { createHmac, timingSafeEqual } from 'node:crypto';
export function signPreview<T>(value: T, secret: string, now = Date.now()): string {
  const payload = Buffer.from(JSON.stringify({ value, expires: now + 15 * 60 * 1000 })).toString('base64url');
  return `${payload}.${createHmac('sha256', secret).update(payload).digest('base64url')}`;
}
export function verifyPreview<T>(token: string, secret: string, ownerId: string, now = Date.now()): T {
  if (token.length > 12000) throw new Error('Vista previa inválida.');
  const [payload, signature, extra] = token.split('.');
  const expected = createHmac('sha256', secret).update(payload || '').digest();
  const actual = Buffer.from(signature || '', 'base64url');
  if (extra || expected.length !== actual.length || !timingSafeEqual(expected, actual)) throw new Error('Vista previa inválida.');
  const data = JSON.parse(Buffer.from(payload, 'base64url').toString());
  if (data.expires < now || data.value.ownerId !== ownerId) throw new Error('Revisa de nuevo la vista previa.');
  return data.value as T;
}
