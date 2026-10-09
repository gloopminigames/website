// Hulpjes voor de account-API.
import {NextResponse} from 'next/server';
import {COOKIE,SESSION_DAYS,sessionUser,isDevAdmin} from './auth';
import {dbReady} from './db';

export {isDevAdmin};

export const json=(body,status=200)=>NextResponse.json(body,{status,headers:{'Cache-Control':'no-store'}});
export const fail=(error,status=400)=>json({error},status);
export const notReady=()=>dbReady()?null:fail('Inloggen is nog niet beschikbaar. Probeer het later nog eens.',503);

export function clientIp(req){return (req.headers.get('x-forwarded-for')||'').split(',')[0].trim()||'onbekend';}

// Alleen JSON-verzoeken van onze eigen site accepteren (tegen CSRF).
export async function readJson(req,max=8000){
  const origin=req.headers.get('origin');
  if(origin&&new URL(origin).host!==req.headers.get('host'))return null;
  if(!(req.headers.get('content-type')||'').includes('application/json'))return null;
  const text=await req.text();
  if(text.length>max)return null;
  try{return JSON.parse(text);}catch(e){return null;}
}

export function withSession(res,token){
  res.cookies.set(COOKIE,token,{httpOnly:true,secure:process.env.NODE_ENV==='production'&&process.env.GLOOP_INSECURE_COOKIE!=='1',sameSite:'lax',path:'/',maxAge:SESSION_DAYS*86400});
  return res;
}
export function clearSession(res){res.cookies.set(COOKIE,'',{httpOnly:true,path:'/',maxAge:0});return res;}
export const currentUser=req=>sessionUser(req.cookies.get(COOKIE)?.value);
export const publicUser=u=>({name:u.name,data:u.data,onBoard:u.on_board!==false,avatar:u.avatar||'#6BE38A|happy',...(u.is_admin===true||isDevAdmin(u)?{admin:true}:{})});

// Vangt onverwachte fouten op, zodat de speler een nette melding krijgt en de fout in de Vercel-logs staat.
export function safe(handler){
  return async(req)=>{
    try{return await handler(req);}
    catch(e){console.error('[gloop account]',e);return fail('De server heeft even een probleem. Probeer het later nog eens.',500);}
  };
}
