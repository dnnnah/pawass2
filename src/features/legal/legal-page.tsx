import Link from 'next/link';
import type { ReactNode } from 'react';
import { BrandMark } from '@/features/auth/brand-mark';
import styles from './legal.module.css';

export function LegalPage({ title, summary, children }: { title: string; summary: string; children: ReactNode }) {
  return (
    <main className={styles.main}>
      <div className={styles.top}><BrandMark /><Link href="/">Volver a PawPass</Link></div>
      <article>
        <header className={styles.heading}>
          <h1>{title}</h1>
          <p>{summary}</p>
        </header>
        <aside className={styles.notice}>
          <strong>Borrador informativo</strong>
          <p>El titular legal y sus datos de contacto todavía no están definidos en el proyecto. Esta información debe completarse y revisarse antes de habilitar el acceso público o solicitar verificación de Google.</p>
        </aside>
        <div className={styles.body}>{children}</div>
      </article>
    </main>
  );
}
