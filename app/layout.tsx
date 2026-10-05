import type { Metadata, Viewport } from 'next';
import '@fontsource/fredoka/500.css';
import '@fontsource/fredoka/600.css';
import '@fontsource/fredoka/700.css';
import '@fontsource/nunito/400.css';
import '@fontsource/nunito/600.css';
import '@fontsource/nunito/700.css';
import '@fontsource/nunito/800.css';
import './globals.css';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Tabbar from '@/components/Tabbar';
import HashRedirect from '@/components/HashRedirect';
import { SITE, siteUrl } from '@/lib/site';

const DESC = 'Gloop: gratis mini games voor tussendoor. Direct spelen in je browser, zonder download, zonder account en zonder tracking.';

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl()),
  title: { default: 'Gloop – Even een potje?', template: '%s – Gloop' },
  description: DESC,
  applicationName: 'Gloop',
  appleWebApp: { title: 'Gloop' },
  openGraph: { type: 'website', siteName: 'Gloop', locale: 'nl_NL', title: 'Gloop – Even een potje?', description: 'Gratis mini games voor tussendoor, direct in je browser.' },
  twitter: { card: 'summary' },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = { width: 'device-width', initialScale: 1, viewportFit: 'cover', themeColor: '#6BE38A' };

const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    { '@type': 'WebSite', name: 'Gloop', inLanguage: 'nl-NL', description: 'Gratis mini games voor tussendoor, direct in je browser.', ...(SITE.url ? { url: SITE.url } : {}) },
    { '@type': 'Organization', name: SITE.owner, email: SITE.email, address: { '@type': 'PostalAddress', addressLocality: SITE.city, addressCountry: 'NL' } },
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="nl">
      <body>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
        <HashRedirect />
        <Header />
        <main className="wrap" id="app">{children}</main>
        <Footer />
        <noscript><p style={{ textAlign: 'center', padding: 24, fontWeight: 700 }}>Gloop heeft JavaScript nodig om de games te laten werken. Zet JavaScript aan in je browser.</p></noscript>
        <Tabbar />
        <div className="toast" id="toast" role="status" aria-live="polite" />
      </body>
    </html>
  );
}
