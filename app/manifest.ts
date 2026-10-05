import type { MetadataRoute } from 'next';

// Maakt Gloop installeerbaar als app (telefoon, tablet en computer).
export default function manifest(): MetadataRoute.Manifest {
  return {
    id: '/',
    name: 'Gloop – mini games',
    short_name: 'Gloop',
    description: 'Gratis mini games voor tussendoor. Zonder advertenties en zonder tracking.',
    lang: 'nl',
    start_url: '/?bron=app',
    scope: '/',
    display: 'standalone',
    orientation: 'any',
    background_color: '#F4F2FF',
    theme_color: '#6A4BEB',
    categories: ['games', 'kids', 'entertainment'],
    icons: [
      { src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
      { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
      { src: '/icons/maskable-192.png', sizes: '192x192', type: 'image/png', purpose: 'maskable' },
      { src: '/icons/maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
    ],
    shortcuts: [
      { name: 'Alle games', url: '/games', icons: [{ src: '/icons/icon-192.png', sizes: '192x192' }] },
      { name: 'Ranglijst', url: '/ranglijst', icons: [{ src: '/icons/icon-192.png', sizes: '192x192' }] },
    ],
  };
}
