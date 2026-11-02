import type { ComponentProps } from 'react';

type ButtonProps = ComponentProps<'button'> & {
  variant?: 'primary' | 'outline' | 'text' | 'danger' | 'urgent-outline' | 'whatsapp';
  fullWidth?: boolean;
};

/** Native button; submitting a form always requires an explicit type="submit". */
export function Button({ variant = 'primary', fullWidth = false, className, type = 'button', ...props }: ButtonProps) {
  const classes = ['button', `button--${variant}`, fullWidth && 'button--wide', className].filter(Boolean).join(' ');
  return <button {...props} type={type} className={classes} />;
}
