import styles from './pet-status.module.css';

export function PetStatusBadge({ status, className }: { status: 'home' | 'lost'; className?: string }) {
  const lost = status === 'lost';
  const classes = [styles.status, lost && styles.lost, className].filter(Boolean).join(' ');

  return <span className={classes}><span className={styles.dot} aria-hidden="true" />{lost ? 'Perdida' : 'En casa'}</span>;
}
