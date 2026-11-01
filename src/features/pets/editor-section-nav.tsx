'use client';
import { useEffect, useState } from 'react';
import { EditorIcon } from './editor-icon';
const sections = [
  { id: 'identidad', label: 'Información', icon: 'info' },
  { id: 'fotografia', label: 'Foto', icon: 'photo' },
  { id: 'cuidados', label: 'Cuidados', icon: 'care' },
  { id: 'salud', label: 'Salud', icon: 'health' },
  { id: 'documentos', label: 'Documentos', icon: 'document' },
  { id: 'contactos', label: 'Contactos', icon: 'contact' },
] as const;
export function EditorSectionNav() {
  const [active, setActive] = useState<string>('identidad');
  useEffect(() => {
    if (!('IntersectionObserver' in window)) return;
    const observer = new IntersectionObserver(entries => {
      const visible = entries.find(entry => entry.isIntersecting);
      if (visible) setActive(visible.target.id);
    }, { rootMargin: '-140px 0px -50% 0px' });
    sections.forEach(({ id }) => { const element = document.getElementById(id); if (element) observer.observe(element); });
    return () => observer.disconnect();
  }, []);
  return <nav className="pet-editor-navbar" aria-label="Secciones del editor">{sections.map(section => <a key={section.id} href={`#${section.id}`} aria-current={active === section.id ? 'location' : undefined} onClick={() => setActive(section.id)}><EditorIcon kind={section.icon} />{section.label}</a>)}</nav>;
}
