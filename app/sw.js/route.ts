import { PLAYABLE } from '@/lib/games';
import { PAGE_SLUGS } from '@/lib/content';

// Service worker: zorgt dat Gloop als app werkt, ook zonder internet (games die je al eens hebt geopend).
// Wordt bij elke build opnieuw gemaakt, zodat een nieuwe versie de oude cache vervangt.
export const dynamic = 'force-static';
const VERSION = (process.env.VERCEL_GIT_COMMIT_SHA || String(Date.now())).slice(0, 12);
const PAGES = ['/', '/games', '/ranglijst', '/profiel', '/inloggen', '/nieuw', ...PLAYABLE.map((g: { id: string }) => '/games/' + g.id), ...PAGE_SLUGS.map((s: string) => '/' + s)];

const SW = `
const CACHE='gloop-${VERSION}';
const PAGES=${JSON.stringify(PAGES)};
self.addEventListener('install',e=>{
  // Pagina's alvast bewaren; mislukt er één, dan gaat de installatie gewoon door.
  e.waitUntil(caches.open(CACHE).then(c=>Promise.all(PAGES.map(u=>c.add(new Request(u,{cache:'reload'})).catch(()=>{})))).then(()=>self.skipWaiting()));
});
self.addEventListener('activate',e=>{
  e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k.startsWith('gloop-')&&k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()));
});
self.addEventListener('fetch',e=>{
  const r=e.request,u=new URL(r.url);
  if(r.method!=='GET'||u.origin!==location.origin||u.pathname.startsWith('/api/')||u.pathname==='/sw.js')return;
  // Bestanden met een vaste naam (scripts, stijlen, lettertypen, icoontjes): eerst uit de cache.
  if(u.pathname.startsWith('/_next/static/')||u.pathname.startsWith('/icons/')){
    e.respondWith(caches.match(r).then(hit=>hit||fetch(r).then(res=>{if(res.ok){const cp=res.clone();caches.open(CACHE).then(c=>c.put(r,cp));}return res;})));
    return;
  }
  // Pagina's en de rest: eerst via internet (altijd de nieuwste versie), anders uit de cache.
  e.respondWith(fetch(r).then(res=>{if(res.ok&&res.type==='basic'){const cp=res.clone();caches.open(CACHE).then(c=>c.put(r,cp));}return res;})
    .catch(()=>caches.match(r,{ignoreSearch:r.mode==='navigate'}).then(hit=>hit||(r.mode==='navigate'?caches.match('/games'):undefined)).then(hit=>hit||new Response('Je bent offline.',{status:503,headers:{'Content-Type':'text/plain; charset=utf-8'}}))));
});
`;

export function GET() {
  return new Response(SW, { headers: { 'Content-Type': 'application/javascript; charset=utf-8', 'Cache-Control': 'no-cache' } });
}
