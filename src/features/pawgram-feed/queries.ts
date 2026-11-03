import { createClient } from '@/lib/supabase/server';
import { parseCursor, type FeedPost } from './domain';
export async function readFeed({ petId, postId, before }: { petId?: string; postId?: string; before?: string } = {}) {
  const db = await createClient();
  if (!db) return { posts: [], more: false, signedIn: false, unavailable: true };
  const cursor = parseCursor(before);
  const [{ data, error }, { data: identity }] = await Promise.all([
    db.rpc('pawgram_feed', { p_pet: petId || null, p_post: postId || null, p_before: cursor?.created_at || null, p_before_id: cursor?.id || null, p_limit: 13 }),
    db.auth.getClaims(),
  ]);
  const posts = (data || []) as FeedPost[];
  return { posts: posts.slice(0, 12), more: posts.length > 12, signedIn: Boolean(identity?.claims?.sub), unavailable: Boolean(error) };
}
