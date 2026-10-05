import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import GameClient from '@/components/GameClient';
import { PLAYABLE, gameById } from '@/lib/games';

export const dynamicParams = false;
export function generateStaticParams() {
  return PLAYABLE.map((g) => ({ slug: g.id }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const g = gameById(slug);
  if (!g || !g.playable) return {};
  return {
    title: { absolute: `${g.title} – gratis spelen op Gloop` },
    description: `Speel ${g.title} gratis in je browser. ${g.desc} Geen download, geen account.`,
    alternates: { canonical: `/games/${g.id}` },
  };
}

export default async function GamePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const g = gameById(slug);
  if (!g || !g.playable) notFound();
  return <GameClient id={g.id} />;
}
