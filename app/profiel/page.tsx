import type { Metadata } from 'next';
import ProfileClient from '@/components/ProfileClient';
export const metadata: Metadata = { title: 'Profiel', robots: { index: false } };
export default function Page() { return <ProfileClient />; }
