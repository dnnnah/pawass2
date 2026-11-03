import { expect, it } from 'vitest';
import { signPreview, verifyPreview } from './preview';
const value = { petId: 'pet', ownerId: 'owner', snapshot: { name: 'Luna' }, photoPath: null, keepPhoto: null };
it('vincula la vista previa al tutor y rechaza manipulación y expiración', () => {
  const token = signPreview(value, 'secret', 1000);
  expect(verifyPreview(token, 'secret', 'owner', 1001)).toEqual(value);
  expect(() => verifyPreview(token, 'secret', 'other', 1001)).toThrow();
  expect(() => verifyPreview(token + 'x', 'secret', 'owner', 1001)).toThrow();
  expect(() => verifyPreview(token, 'secret', 'owner', 1000 + 16 * 60 * 1000)).toThrow();
});
