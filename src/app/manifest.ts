import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    id: '/',
    name: 'PawPass',
    short_name: 'PawPass',
    description: 'Fichas de rescate y salud privada para tus mascotas.',
    start_url: '/',
    scope: '/',
    display: 'standalone',
    background_color: '#f5f9fb',
    theme_color: '#1b5d82',
    icons: [
      { src: '/pawpass-pwa-icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
      { src: '/pawpass-pwa-icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
      { src: '/pawpass-pwa-icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
    ],
  };
}
