'use client';

import { useId, useState } from 'react';

export function PasswordField({
  name,
  label,
  autoComplete,
  required = true,
  minLength,
  maxLength = 72,
  disabled = false,
}: {
  name: string;
  label: string;
  autoComplete: string;
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  disabled?: boolean;
}) {
  const id = useId();
  const [visible, setVisible] = useState(false);
  return (
    <label className="field" htmlFor={id}>
      <span>{label}</span>
      <span className="password-input">
        <input id={id} name={name} type={visible ? 'text' : 'password'} autoComplete={autoComplete} required={required} minLength={minLength} maxLength={maxLength} disabled={disabled} />
        <button
          className="password-toggle"
          type="button"
          aria-label={visible ? 'Ocultar contraseña' : 'Mostrar contraseña'}
          aria-pressed={visible}
          disabled={disabled}
          onClick={() => setVisible((value) => !value)}
        >
          {visible ? <EyeOff /> : <Eye />}
        </button>
      </span>
    </label>
  );
}

function Eye() {
  return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M2.5 12s3.3-6 9.5-6 9.5 6 9.5 6-3.3 6-9.5 6-9.5-6-9.5-6Z"/><circle cx="12" cy="12" r="2.7"/></svg>;
}

function EyeOff() {
  return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="m3 3 18 18M10.6 6.2A10.6 10.6 0 0 1 12 6c6.2 0 9.5 6 9.5 6a17 17 0 0 1-3.2 3.8M6.2 6.9C3.8 8.4 2.5 12 2.5 12s3.3 6 9.5 6c1.1 0 2.1-.2 3-.5"/><path d="M9.9 9.9a3 3 0 0 0 4.2 4.2"/></svg>;
}
