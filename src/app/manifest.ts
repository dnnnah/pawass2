import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    id: '/',
    name: 'PawPass',
    short_name: 'PawPass',
    lang: 'es-MX',
    description: 'Fichas de rescate y salud privada para tus mascotas.',
    start_url: '/',
    scope: '/',
    display: 'standalone',
    background_color: '#f5f9fb',
    theme_color: '#176986',
    icons: [
      { src: '/pawpass-pwa-icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
      { src: '/pawpass-pwa-icon-48.png', sizes: '48x48', type: 'image/png', purpose: 'any' },
      { src: '/pawpass-pwa-icon-32.png', sizes: '32x32', type: 'image/png', purpose: 'any' },
      { src: '/pawpass-pwa-icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
      { src: '/pawpass-pwa-icon-maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
    ],
  };
}
