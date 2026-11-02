import { describe, expect, it } from 'vitest';
import robots from '../src/app/robots';

describe('robots.txt', () => {
  it('permite que los buscadores lean el noindex de las áreas privadas', () => {
    const policy = robots();
    const rules = Array.isArray(policy.rules) ? policy.rules : [policy.rules];
    const disallowed = rules.flatMap((rule) => rule.disallow || []);

    expect(disallowed).not.toContain('/cuenta');
    expect(disallowed).not.toContain('/mascotas');
    expect(disallowed).not.toContain('/auth/');
  });

  it('deja rastreables las fichas QR para que los buscadores procesen su noindex', () => {
    const policy = robots();
    const rules = Array.isArray(policy.rules) ? policy.rules : [policy.rules];
    const disallowed = rules.flatMap((rule) => rule.disallow || []);

    expect(disallowed).not.toContain('/p');
  });
});
