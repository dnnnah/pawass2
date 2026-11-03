import { expect, it } from 'vitest';
import { validatePost } from './domain';
it('exige descripción y limita los dos textos', () => {
  expect(() => validatePost('', '  ')).toThrow();
  expect(() => validatePost('a'.repeat(1001), 'Luna jugando')).toThrow();
  expect(() => validatePost('', 'a'.repeat(501))).toThrow();
  expect(validatePost(' Hola ', ' Luna juega ')).toEqual({ body: 'Hola', alt: 'Luna juega' });
});
