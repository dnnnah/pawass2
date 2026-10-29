'use client';

import { useState } from 'react';

export function WhatsAppActions({ name, code, whatsapp }: { name: string; code: string; whatsapp: string }) {
  const [message, setMessage] = useState('');
  const text = encodeURIComponent(`Hola, encontré a ${name} (${code}). ¿Puedes ayudarme a reunirle contigo?`);
  const number = whatsapp.replace(/\D/g, '');
  const href = `https://wa.me/${number}?text=${text}`;

  function includeLocation() {
    setMessage('Solicitando permiso de ubicación…');
    if (!navigator.geolocation) {
      setMessage('Este navegador no permite compartir ubicación. Puedes escribirla en WhatsApp.');
      return;
    }
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        const map = `https://maps.google.com/?q=${coords.latitude},${coords.longitude}`;
        const locationText = encodeURIComponent(`Hola, encontré a ${name} (${code}). Estoy aquí: ${map}`);
        window.location.assign(`https://wa.me/${number}?text=${locationText}`);
      },
      () => setMessage('No se compartió la ubicación. Puedes abrir WhatsApp sin ella.'),
      { enableHighAccuracy: false, timeout: 10000, maximumAge: 60000 },
    );
  }

  return (
    <div className="whatsapp-actions">
      <a className="button button--whatsapp" href={href} target="_blank" rel="noopener noreferrer">Abrir WhatsApp</a>
      <button className="button button--outline" type="button" onClick={includeLocation}>Incluir mi ubicación actual</button>
      {message && <p className="form-message" role="status" aria-live="polite">{message}</p>}
    </div>
  );
}
