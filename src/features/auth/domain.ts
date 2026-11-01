export function validatePasswordConfirmation(password: string, confirmation: string):
  | { ok: true }
  | { ok: false; error: string } {
  return password === confirmation
    ? { ok: true }
    : { ok: false, error: 'Las contraseñas no coinciden.' };
}

export const REGISTRATION_PASSWORD_MIN_LENGTH = 8;
export const REGISTRATION_PASSWORD_MAX_LENGTH = 72;
export function validateRegistrationPassword(password: string, confirmation: string): { ok: true } | { ok: false; error: string } {
  if (password.length < REGISTRATION_PASSWORD_MIN_LENGTH || password.length > REGISTRATION_PASSWORD_MAX_LENGTH) {
    return { ok: false, error: 'La contraseña debe tener entre 8 y 72 caracteres.' };
  }
  return validatePasswordConfirmation(password, confirmation);
}
