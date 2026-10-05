import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import Html from '@/components/Html';
import { ICON } from '@/lib/blob';
import { SITE } from '@/lib/site';
import { PAGE_SLUGS, getPage } from '@/lib/content';

const TITLES: Record<string, string> = {
  over: 'Over Gloop en Gloopie', faq: 'Veelgestelde vragen', contact: 'Contact', privacy: 'Privacyverklaring', cookies: 'Cookieverklaring',
  voorwaarden: 'Gebruiksvoorwaarden', disclaimer: 'Disclaimer en copyright', toegankelijkheid: 'Toegankelijkheid',
};

export const dynamicParams = false;
export function generateStaticParams() { return PAGE_SLUGS.map((info: string) => ({ info })); }

export async function generateMetadata({ params }: { params: Promise<{ info: string }> }): Promise<Metadata> {
  const { info } = await params;
  return { title: TITLES[info] || 'Gloop', alternates: { canonical: `/${info}` } };
}

export default async function InfoPage({ params }: { params: Promise<{ info: string }> }) {
  const { info } = await params;
  const p = getPage(info);
  if (!p) notFound();
  return (
    <article className="page prose">
      <Link className="back" href="/"><Html html={ICON.back} /> Home</Link>
      <h1>{p.title}</h1>
      {p.showDate ? <span className="updated">Laatst bijgewerkt: {SITE.updated}</span> : <div style={{ height: 18 }} />}
      <div dangerouslySetInnerHTML={{ __html: p.body }} />
    </article>
  );
}
