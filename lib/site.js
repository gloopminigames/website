// ============================================================
// VUL DIT IN VOOR PUBLICATIE
// Lege velden verschijnen op de site als gele [PLACEHOLDER].
// ============================================================
export const SITE={
  name:'Gloop',
  owner:'NDR Creatives',
  email:'gloop.mini.games@gmail.com', // tijdelijk, tot er een eigen adres is
  city:'Heemstede',
  kvk:'',              // KvK-nummer; leeg laten als je (nog) niet ingeschreven bent
  hosting:'Vercel',
  selfHostedFonts:true, // lettertypen worden via @fontsource zelf gehost
  url:'',              // live adres, bijv. "https://gloop.gg" (voor delen, sitemap en Google)
  updated:'5 oktober 2026',
  year:2026
};
export function esc(s){return String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}
export function v(val,label){return val?esc(val):`<span class="ph">[${label}]</span>`}
export function mail(){return SITE.email?`<a href="mailto:${esc(SITE.email)}">${esc(SITE.email)}</a>`:v('','E-MAILADRES')}
// Zonder ingevulde url valt de site op Vercel terug op het productiedomein van het project.
const vercelUrl=typeof process!=='undefined'&&process.env.VERCEL_PROJECT_PRODUCTION_URL?'https://'+process.env.VERCEL_PROJECT_PRODUCTION_URL:'';
export const siteUrl=()=>(SITE.url||vercelUrl||'http://localhost:3000').replace(/\/$/,'');
