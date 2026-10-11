// API voor Gloop XL (aparte site, ander domein). Inloggen met je Gloop-account; de XL-site bewaart
// een sessiecode (Bearer-token) en stuurt die mee. Alleen sites in de lijst hieronder mogen deze API gebruiken.
import {NextResponse} from 'next/server';
import {SITE} from '../site';

const PROD=process.env.NODE_ENV==='production'&&process.env.GLOOP_MEMORY_DB!=='1';
// Extra adressen (eigen domein, testversie) via de omgevingsvariabele GLOOP_XL_ORIGINS, gescheiden door komma's.
const ORIGINS=[SITE.xlUrl,...(process.env.GLOOP_XL_ORIGINS||'').split(',')].map(s=>s.trim().replace(/\/$/,'')).filter(Boolean);
export function allowedOrigin(origin,host){
  if(!origin)return '';
  // XL op Gloop zelf (/xl/): zelfde site.
  try{if(host&&new URL(origin).host===host)return origin;}catch(e){return '';}
  if(ORIGINS.includes(origin))return origin;
  if(!PROD&&/^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin))return origin;
  return '';
}
function cors(res,origin){
  if(origin){res.headers.set('Access-Control-Allow-Origin',origin);res.headers.set('Vary','Origin');}
  res.headers.set('Access-Control-Allow-Methods','GET, POST, OPTIONS');
  res.headers.set('Access-Control-Allow-Headers','Content-Type, Authorization');
  res.headers.set('Access-Control-Max-Age','600');
  res.headers.set('Cache-Control','no-store');
  return res;
}
export const xlJson=(origin,body,status=200)=>cors(NextResponse.json(body,{status}),origin);
export const xlFail=(origin,error,status=400)=>xlJson(origin,{error},status);
export const xlPreflight=origin=>cors(new NextResponse(null,{status:origin?204:403}),origin);
export function bearer(req){const h=req.headers.get('authorization')||'';return h.startsWith('Bearer ')?h.slice(7).trim():'';}
export async function readXlJson(req,max){
  if(!(req.headers.get('content-type')||'').includes('application/json'))return null;
  const text=await req.text();
  if(text.length>max)return null;
  try{return JSON.parse(text);}catch(e){return null;}
}
// Alleen wat XL nodig heeft; geen records of andere Gloop-gegevens.
export const xlUser=(u,via='token')=>({name:u.name,avatar:u.avatar||'#6BE38A|happy',lfi:u.data&&u.data.lfi||null,via});
