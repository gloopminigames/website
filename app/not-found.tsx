import Link from 'next/link';
import Html from '@/components/Html';
import { blob } from '@/lib/blob';

export default function NotFound() {
  return (
    <section className="page" style={{ textAlign: 'center' }}>
      <Html html={blob('#8B6CFF', 'sad', 'profile-blob')} />
      <h1>Oeps!</h1>
      <p className="lead">Deze pagina bestaat (nog) niet. Misschien is Gloopie hem kwijtgeraakt.</p>
      <Link className="btn btn-primary" href="/games">Naar alle games</Link>
    </section>
  );
}
