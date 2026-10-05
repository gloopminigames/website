import type { Metadata } from 'next';
import LoginClient from '@/components/LoginClient';

export const metadata: Metadata = { title: 'Inloggen', robots: { index: false }, alternates: { canonical: '/inloggen' } };

export default function Page() { return <LoginClient />; }
