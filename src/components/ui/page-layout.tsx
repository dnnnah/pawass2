import { useId, type ComponentProps, type ReactNode } from 'react';
import styles from './page-layout.module.css';

type ClassNameProps = { className?: string };

function classes(...values: Array<string | undefined>) {
  return values.filter(Boolean).join(' ');
}

export function PageFrame({
  children,
  className,
  label = 'Contenido principal',
  ...props
}: ComponentProps<'main'> & { label?: string }) {
  return <main {...props} aria-label={label} className={classes('min-w-0', className)}>{children}</main>;
}

export function PageContent({ children, className, ...props }: ComponentProps<'div'> & ClassNameProps) {
  return <div {...props} className={classes(styles.content, className)}>{children}</div>;
}

export function PageHeading({
  eyebrow,
  title,
  headingId,
  description,
  aside,
  className,
}: {
  eyebrow?: ReactNode;
  title: ReactNode;
  headingId?: string;
  description?: ReactNode;
  aside?: ReactNode;
} & ClassNameProps) {
  return (
    <header className={classes(styles.pageHeading, className)}>
      <div className={styles.pageHeadingCopy}>
        {eyebrow && <p className={styles.eyebrow}>{eyebrow}</p>}
        <h1 id={headingId}>{title}</h1>
        {description && <p className={styles.description}>{description}</p>}
      </div>
      {aside && <div className={styles.pageHeadingAside}>{aside}</div>}
    </header>
  );
}

export function SectionHeading({
  eyebrow,
  title,
  headingId,
  description,
  aside,
  className,
}: {
  eyebrow?: ReactNode;
  title: ReactNode;
  headingId?: string;
  description?: ReactNode;
  aside?: ReactNode;
} & ClassNameProps) {
  return (
    <header className={classes(styles.sectionHeading, className)}>
      <div className={styles.sectionHeadingCopy}>
        {eyebrow && <p className={styles.eyebrow}>{eyebrow}</p>}
        <h2 id={headingId}>{title}</h2>
        {description && <p className={styles.description}>{description}</p>}
      </div>
      {aside && <div className={styles.sectionHeadingAside}>{aside}</div>}
    </header>
  );
}

export function EmptyState({
  title,
  description,
  action,
  headingLevel = 2,
  className,
}: {
  title: ReactNode;
  headingId?: string;
  description?: ReactNode;
  action?: ReactNode;
  headingLevel?: 2 | 3;
} & ClassNameProps) {
  const headingId = useId();
  const Heading = headingLevel === 3 ? 'h3' : 'h2';
  return (
    <section className={classes(styles.emptyState, className)} aria-labelledby={headingId}>
      <Heading id={headingId}>{title}</Heading>
      {description && <p>{description}</p>}
      {action && <div className={styles.emptyStateAction}>{action}</div>}
    </section>
  );
}

export function PawPlaceholder({ className }: ClassNameProps) {
  return (
    <svg className={classes(styles.pawPlaceholder, className)} viewBox="0 0 100 100" aria-hidden="true">
      <ellipse cx="22" cy="24" rx="8" ry="12" transform="rotate(-22 22 24)" />
      <ellipse cx="42" cy="16" rx="8" ry="12" />
      <ellipse cx="63" cy="20" rx="8" ry="12" transform="rotate(18 63 20)" />
      <ellipse cx="79" cy="36" rx="7" ry="10" transform="rotate(32 79 36)" />
      <path d="M49 39c-14 0-34 22-28 36 4 10 18 2 28 2s24 8 28-2c6-14-14-36-28-36Z" />
    </svg>
  );
}
