import type { ComponentProps } from 'react';
import './forms.css';

type DivProps = ComponentProps<'div'>;

/** Responsive fields: preserve DOM order and collapse to one column on mobile. */
export function FormGrid({ columns = 1, className, ...props }: DivProps & { columns?: 1 | 2 | 3 }) {
  const classes = ['form-grid', columns === 2 && 'form-grid--two', columns === 3 && 'form-grid--three', className].filter(Boolean).join(' ');
  return <div {...props} className={classes} />;
}

/** Native layout only; each button retains its own submission and pending state. */
export function FormActions({ className, ...props }: DivProps) {
  return <div {...props} className={['form-actions', className].filter(Boolean).join(' ')} />;
}
