import type { ReactNode } from 'react';

type FormMessageProps = {
  children?: ReactNode;
  success?: boolean;
  role?: 'status' | 'alert';
};

/** Shared feedback; urgent errors retain the native alert announcement. */
export function FormMessage({ children, success = false, role = 'status' }: FormMessageProps) {
  if (!children) return null;
  return <p className={`form-message${success ? ' form-message--success' : ''}`} role={role} aria-live={role === 'status' ? 'polite' : undefined}>{children}</p>;
}
