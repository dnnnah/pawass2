export type Cursor = { id: string; created_at: string };
export type FeedPost = Cursor & { pet_id: string; name: string; body: string; alt: string; photo_id: string; paw_count: number; has_paw: boolean; is_own: boolean };
export function nextCursor(row: Cursor): string { return Buffer.from(JSON.stringify({ id: row.id, created_at: row.created_at })).toString('base64url'); }
export function parseCursor(value?: string): Cursor | null {
  if (!value || value.length > 300) return null;
  try {
    const row = JSON.parse(Buffer.from(value, 'base64url').toString());
    if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(row.id) || !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{1,6})?(Z|[+-]\d{2}:\d{2})$/.test(row.created_at) || Number.isNaN(Date.parse(row.created_at))) return null;
    return { id: row.id, created_at: row.created_at };
  } catch { return null; }
}
