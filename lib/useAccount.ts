'use client';
import { useEffect, useState } from 'react';
import { getAccount, loadAccount, subscribe } from './account';

export type AccountState = { user: { name: string; onBoard?: boolean; avatar?: string; admin?: boolean } | null; available: boolean | null; loading: boolean };

export function useAccount(): AccountState {
  const [s, setS] = useState<AccountState>({ user: null, available: null, loading: true });
  useEffect(() => { setS(getAccount()); loadAccount(); return subscribe(setS); }, []);
  return s;
}
