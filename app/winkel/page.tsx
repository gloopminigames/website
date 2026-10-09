import type { Metadata } from 'next';
import ShopClient from '@/components/ShopClient';
export const metadata: Metadata = {
  title: 'Gloop-winkel',
  description: 'Verdien Gloopmunten door te spelen en koop nieuwe kleuren, gezichtjes en spulletjes voor je Gloop. Nooit met echt geld.',
  alternates: { canonical: '/winkel' },
};
export default function Page() { return <ShopClient />; }
