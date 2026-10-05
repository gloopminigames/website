import type { Metadata } from 'next';
import BeheerClient from '@/components/BeheerClient';
export const metadata: Metadata = { title: 'Beheer', robots: { index: false, follow: false } };
export default function Page() { return <BeheerClient />; }
