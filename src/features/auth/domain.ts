export function validatePasswordConfirmation(password: string, confirmation: string):
  | { ok: true }
  | { ok: false; error: string } {
  return password === confirmation
    ? { ok: true }
    : { ok: false, error: 'Las contraseñas no coinciden.' };
}
