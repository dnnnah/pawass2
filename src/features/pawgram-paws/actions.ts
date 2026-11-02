'use server';
import { revalidatePath } from 'next/cache';
import { socialSession } from '@/features/pawgram-profiles/server';
import type { SocialState } from '@/features/pawgram-profiles/actions';
export async function setPaw(_state: SocialState, form: FormData): Promise<SocialState> {
  try {
    const { db } = await socialSession();
    const present = form.get('present') === 'true';
    const { error } = await db.rpc('pawgram_set_paw', { p_post: String(form.get('postId') || ''), p_present: present });
    if (error) return { ok: false, message: 'No se pudo cambiar la patita. La publicación debe estar visible y pertenecer a otro tutor.' };
    revalidatePath('/pawgram', 'layout');
    return { ok: true, message: present ? 'Diste una patita.' : 'Retiraste tu patita.' };
  } catch { return { ok: false, message: 'Inicia sesión para dar una patita.' }; }
}
