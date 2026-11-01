import 'server-only';
import type { SupabaseClient } from '@supabase/supabase-js';

export type OwnedReport = { petId: string; reportId: string };
// This uses the visitor's session and owner RLS, never the administrative client.
export async function getOwnedReports(client: SupabaseClient, ownerId: string): Promise<Map<string, OwnedReport>> {
  const { data: pets } = await client.from('pets').select('id').eq('owner_id', ownerId);
  const ids = (pets || []).map(p => p.id);
  if (!ids.length) return new Map();
  const [{ data: reports }, { data: codes }] = await Promise.all([
    client.from('lost_pet_reports').select('id,pet_id').in('pet_id', ids).eq('status', 'active'),
    client.from('public_code_reservations').select('code,pet_id').in('pet_id', ids),
  ]);
  const reportByPet = new Map((reports || []).map(r => [r.pet_id, r.id]));
  return new Map((codes || []).flatMap(c => reportByPet.has(c.pet_id) ? [[c.code, { petId: c.pet_id, reportId: reportByPet.get(c.pet_id)! }]] : []));
}
