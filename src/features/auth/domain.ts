export function validatePasswordConfirmation(password: string, confirmation: string):
  | { ok: true }
  | { ok: false; error: string } {
  return password === confirmation
    ? { ok: true }
    : { ok: false, error: 'Las contraseñas no coinciden.' };
}

export const REGISTRATION_PASSWORD_MIN_LENGTH = 8;
export const REGISTRATION_PASSWORD_MAX_LENGTH = 72;
export function getRegistrationPasswordChecks(password: string) {
  return [
    { id: 'length', label: 'Mínimo 8 caracteres', met: password.length >= REGISTRATION_PASSWORD_MIN_LENGTH },
    { id: 'uppercase', label: 'Una letra mayúscula', met: /\p{Lu}/u.test(password) },
    { id: 'number', label: 'Un número', met: /[0-9]/.test(password) },
    { id: 'symbol', label: 'Un carácter especial (por ejemplo: !, @ o #)', met: /[^\p{L}\p{N}\s]/u.test(password) },
  ];
}
export function validateRegistrationPassword(password: string, confirmation: string): { ok: true } | { ok: false; error: string } {
  if (password.length < REGISTRATION_PASSWORD_MIN_LENGTH || password.length > REGISTRATION_PASSWORD_MAX_LENGTH) {
    return { ok: false, error: 'La contraseña debe tener entre 8 y 72 caracteres.' };
  }
  if (!getRegistrationPasswordChecks(password).every(check => check.met)) {
    return { ok: false, error: 'Incluye al menos una mayúscula, un número y un carácter especial.' };
  }
  return validatePasswordConfirmation(password, confirmation);
}
