'use client';
import './lost-poster-disclosure.css';
import { useState, type ReactNode } from 'react';
export function LostPosterDisclosure({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  return <details className="poster-disclosure" onToggle={event => setOpen(event.currentTarget.open)}><summary className="button button--outline">{open ? 'Ocultar cartel PNG' : 'Crear y descargar cartel PNG'}</summary>{open && children}</details>;
}
