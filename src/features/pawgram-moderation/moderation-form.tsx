'use client';
import { SocialForm } from '@/features/pawgram-profiles/action-form';
import { moderate } from './actions';
export function ModerationForm({ kind, id }: { kind: 'profile' | 'post'; id: string }) {
  return <SocialForm action={moderate} label="Aplicar decisión" secondary><input type="hidden" name="kind" value={kind} /><input type="hidden" name="targetId" value={id} /><label>Decisión<select name="restore"><option value="false">Ocultar por administración</option><option value="true">Retirar restricción administrativa</option></select></label><label>Motivo visible para el tutor<textarea name="reason" maxLength={1000} rows={3} /><small>Obligatorio para ocultar. Hasta 1.000 caracteres. Al restaurar se retira el motivo vigente.</small></label></SocialForm>;
}
