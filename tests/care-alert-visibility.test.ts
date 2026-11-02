import { beforeEach, describe, expect, it, vi } from 'vitest';
const { createClient, revalidatePath } = vi.hoisted(() => ({ createClient: vi.fn(), revalidatePath: vi.fn() }));
vi.mock('@/lib/supabase/server', () => ({ createClient }));
vi.mock('next/cache', () => ({ revalidatePath }));
import { setCareAlertVisibility } from '../src/features/care-alerts/actions';

const petId = '00000000-0000-4000-8000-000000000001';
const alertId = '00000000-0000-4000-8000-000000000002';
function payload(visibility = 'public') {
  const data = new FormData();
  data.set('petId', petId); data.set('alertId', alertId); data.set('visibility', visibility);
  return data;
}
function clientFor({ authenticated = true, ownsPet = true } = {}) {
  const filters: [string, string, unknown][] = [];
  const update = vi.fn();
  const from = vi.fn((table: string) => {
    const builder = {
      select: vi.fn(() => builder),
      eq: vi.fn((key: string, value: unknown) => { filters.push([table, key, value]); return builder; }),
      update: vi.fn((value: unknown) => { update(value); return builder; }),
      maybeSingle: vi.fn(async () => ({ data: table === 'pets' ? (ownsPet ? { id: petId } : null) : table === 'care_alerts' ? { id: alertId } : { code: 'PC-AB2345' }, error: null })),
    };
    return builder;
  });
  return { from, filters, update, auth: { getUser: async () => ({ data: { user: authenticated ? { id: 'owner' } : null } }) } };
}
beforeEach(() => { vi.clearAllMocks(); });
describe('care alert visibility authorization', () => {
  it('rejects an invalid visibility before accessing data', async () => {
    expect((await setCareAlertVisibility({ ok: false, message: '' }, payload('invalid'))).ok).toBe(false);
    expect(createClient).not.toHaveBeenCalled();
  });
  it('does not mutate alerts without an authenticated owner', async () => {
    const client = clientFor({ authenticated: false }); createClient.mockResolvedValue(client);
    expect((await setCareAlertVisibility({ ok: false, message: '' }, payload())).ok).toBe(false);
    expect(client.from).not.toHaveBeenCalled();
  });
  it('rejects a pet belonging to someone else before mutating an alert', async () => {
    const client = clientFor({ ownsPet: false }); createClient.mockResolvedValue(client);
    expect((await setCareAlertVisibility({ ok: false, message: '' }, payload())).ok).toBe(false);
    expect(client.update).not.toHaveBeenCalled();
    expect(client.filters).toContainEqual(['pets', 'owner_id', 'owner']);
  });
  it.each([['public', true], ['private', false]])('sets %s only on the owned pet and refreshes public views', async (visibility, expected) => {
    const client = clientFor(); createClient.mockResolvedValue(client);
    expect((await setCareAlertVisibility({ ok: false, message: '' }, payload(String(visibility)))).ok).toBe(true);
    expect(client.update).toHaveBeenCalledWith(expect.objectContaining({ qr_visible: expected }));
    expect(client.filters).toContainEqual(['care_alerts', 'id', alertId]);
    expect(client.filters).toContainEqual(['care_alerts', 'pet_id', petId]);
    expect(revalidatePath).toHaveBeenCalledWith('/p/PC-AB2345');
    expect(revalidatePath).toHaveBeenCalledWith('/perdidas/PC-AB2345');
  });
});
