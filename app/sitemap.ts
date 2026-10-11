import type { MetadataRoute } from 'next';
import { siteUrl } from '@/lib/site';
import { PLAYABLE } from '@/lib/games';
import { PAGE_SLUGS } from '@/lib/content';
export default function sitemap(): MetadataRoute.Sitemap {
  const u = siteUrl();
  return [
    { url: `${u}/`, priority: 1 },
    { url: `${u}/games`, priority: 0.9 },
    ...PLAYABLE.map((g: { id: string }) => ({ url: `${u}/games/${g.id}`, priority: 0.8 })),
    { url: `${u}/ranglijst`, priority: 0.4 },
    { url: `${u}/nieuw`, priority: 0.5 },
    { url: `${u}/winkel`, priority: 0.5 },
    ...PAGE_SLUGS.map((s: string) => ({ url: `${u}/${s}`, priority: 0.3 })),
  ];
}
