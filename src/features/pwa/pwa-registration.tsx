'use client';

import { useEffect } from 'react';

export function PwaRegistration() {
  useEffect(() => {
    if (!('serviceWorker' in navigator)) return;
    if (process.env.NODE_ENV !== 'production') {
      void navigator.serviceWorker.getRegistrations().then((registrations) => Promise.all(
        registrations.filter((registration) => registration.active?.scriptURL === new URL('/service-worker.js', window.location.origin).href).map((registration) => registration.unregister()),
      ));
      if ('caches' in window) void caches.keys().then((keys) => Promise.all(keys.filter((key) => key.startsWith('pawpass-')).map((key) => caches.delete(key))));
      return;
    }
    void navigator.serviceWorker.register('/service-worker.js', { scope: '/' }).catch(() => undefined);
  }, []);

  return null;
}
