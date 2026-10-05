import type { Metadata } from 'next';
import RankClient from '@/components/RankClient';
export const metadata: Metadata = { title: 'Ranglijst' };
export default function Page() { return <RankClient />; }
