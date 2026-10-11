'use client';
import Link from 'next/link';
import { useAccount } from '@/lib/useAccount';

// Onder de spelknop: is je voortgang gekoppeld aan je Gloop-account?
export default function PlusAccount({ back }: { back: string }) {
  const acc = useAccount();
  if (acc.loading || acc.available === false) return null;
  if (acc.user) return <p className="plus-acc">✅ Ingelogd als <b>{acc.user.name}</b>. Je eiland gaat mee in je account.</p>;
  return (
    <p className="plus-acc">
      Wil je op meer apparaten spelen? <Link href={`/inloggen?terug=${encodeURIComponent(back)}`}>Log in of maak een account</Link>, dan gaat je eiland mee.
    </p>
  );
}
