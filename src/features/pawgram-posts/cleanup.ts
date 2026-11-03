import type { SupabaseClient } from '@supabase/supabase-js';
type CleanupPort = {
  retireExpired: () => Promise<void>;
  list: () => Promise<{ id: string; path: string }[]>;
  remove: (path: string) => Promise<boolean>;
  acknowledge: (id: string) => Promise<boolean>;
};
export async function drainPhotos(port: CleanupPort): Promise<boolean> {
  try {
    await port.retireExpired();
    for (let batch = 0; batch < 10; batch++) {
      const assets = await port.list();
      for (const asset of assets) {
        if (!await port.remove(asset.path)) return false;
        if (!await port.acknowledge(asset.id)) return false;
      }
      if (assets.length < 100) return true;
    }
    return false;
  } catch { return false; }
}
export function cleanWithClient(admin: SupabaseClient) {
  return drainPhotos({
    async retireExpired() {
      const { error } = await admin.from('pawgram_assets').update({ state: 'retired' }).eq('state', 'pending').lt('created_at', new Date(Date.now() - 60 * 60 * 1000).toISOString());
      if (error) throw error;
    },
    async list() { const { data, error } = await admin.from('pawgram_assets').select('id,path').eq('state', 'retired').limit(100); if (error) throw error; return data || []; },
    async remove(path) { const { error } = await admin.storage.from('pawgram-photos').remove([path]); return !error; },
    async acknowledge(id) { const { error } = await admin.from('pawgram_assets').delete().eq('id', id).eq('state', 'retired'); return !error; },
  });
}
