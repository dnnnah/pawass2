'use client';

import { useEffect } from 'react';

export function PwaRegistration() {
  useEffect(() => {
    if (!('serviceWorker' in navigator)) return;
    void navigator.serviceWorker.register('/service-worker.js', { scope: '/' }).catch(() => undefined);
  }, []);

  return null;
}
