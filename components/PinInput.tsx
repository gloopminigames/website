'use client';

// Groot cijferveld voor de pincode. Op telefoons verschijnt een cijfertoetsenbord.
export default function PinInput({ id, value, onChange, show, autoComplete }: { id: string; value: string; onChange: (v: string) => void; show: boolean; autoComplete: string }) {
  return (
    <input className="field pin-field" id={id} type={show ? 'text' : 'password'} inputMode="numeric" pattern="[0-9]*" maxLength={6}
      autoComplete={autoComplete} placeholder="••••" value={value}
      onChange={(e) => onChange(e.target.value.replace(/\D/g, '').slice(0, 6))} />
  );
}
