import { expect, it } from 'vitest';
import { parseCursor, nextCursor } from './domain';
it('conserva microsegundos y rechaza cursores manipulados', () => {
  const row = { id: '40000000-0000-4000-8000-000000000001', created_at: '2026-11-02T20:01:02.123456+00:00' };
  expect(parseCursor(nextCursor(row))).toEqual(row);
  expect(parseCursor('basura')).toBeNull();
  expect(parseCursor(Buffer.from(JSON.stringify({ ...row, id: 'x),or(secret)' })).toString('base64url'))).toBeNull();
});
