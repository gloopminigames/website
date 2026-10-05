'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
// Oude deellinks zoals /#/game/memo sturen we door naar /games/memo.
export default function HashRedirect() {
  const router = useRouter();
  useEffect(() => {
    const h = window.location.hash;
    if (!h.startsWith('#/')) return;
    const path = h.slice(1).replace(/^\/game\//, '/games/');
    router.replace(path || '/');
  }, [router]);
  return null;
}
