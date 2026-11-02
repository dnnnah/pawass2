'use server';
import { revalidatePath } from 'next/cache';
import { socialSession } from '@/features/pawgram-profiles/server';
import type { SocialState } from '@/features/pawgram-profiles/actions';
export async function moderate(_state: SocialState, form: FormData): Promise<SocialState> {
  try {
    const { db } = await socialSession();
    const { data: admin } = await db.rpc('pawgram_is_admin');
    if (!admin) return { ok: false, message: 'Necesitas un rol administrativo autorizado.' };
    const restoring = form.get('restore') === 'true';
    const reason = String(form.get('reason') || '').trim();
    if (!restoring && (!reason || reason.length > 1000)) return { ok: false, message: 'Indica un motivo de hasta 1.000 caracteres.' };
    const { error } = await db.rpc('pawgram_moderate', { p_kind: String(form.get('kind') || ''), p_id: String(form.get('targetId') || ''), p_reason: restoring ? null : reason });
    if (error) return { ok: false, message: 'No pudimos aplicar la decisión administrativa.' };
    revalidatePath('/pawgram', 'layout'); revalidatePath('/mascotas', 'layout');
    return { ok: true, message: restoring ? 'Restricción retirada. Se respetan la elección del tutor y las demás restricciones.' : 'Contenido restringido. El tutor podrá consultar el motivo.' };
  } catch { return { ok: false, message: 'No se pudo guardar. Comprueba tu sesión.' }; }
}
