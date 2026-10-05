// Beheer (admin): alleen voor accounts met is_admin = true in Supabase, én met het beheerwachtwoord uit ADMIN_PASSWORD.
// Een pincode van een kinderaccount is te makkelijk te raden, daarom is dat wachtwoord een tweede slot.
import {createHmac,createHash,timingSafeEqual} from 'node:crypto';
import {db} from './db';
import {currentUser,isDevAdmin} from './http';
import {cleanName,nameError} from '../accountRules';
import {sanitize,LOWER_BETTER} from '../merge';
import {baseId,ALL_KEYS} from '../levels';

export const ADMIN_COOKIE='gloop_beheer';
const HOURS=2;
const PASS=process.env.ADMIN_PASSWORD||'';
export const adminConfigured=()=>PASS.length>=12;

export const isAdminUser=u=>Boolean(u&&(u.is_admin===true||isDevAdmin(u)));

const key=()=>createHash('sha256').update('gloop-beheer|'+PASS+'|'+(process.env.SUPABASE_SERVICE_ROLE_KEY||'')).digest();
const sign=s=>createHmac('sha256',key()).update(s).digest('base64url');
export function adminToken(u){const s=u.id+'.'+(Date.now()+HOURS*36e5);return s+'.'+sign(s);}
function validToken(t,u){
  if(typeof t!=='string'||t.length>200)return false;
  const i=t.lastIndexOf('.'),s=t.slice(0,i),sig=Buffer.from(t.slice(i+1)),want=Buffer.from(sign(s));
  const [id,exp]=s.split('.');
  return sig.length===want.length&&timingSafeEqual(sig,want)&&id===u.id&&Number(exp)>Date.now();
}
export function checkPassword(p){
  if(!adminConfigured()||typeof p!=='string')return false;
  const a=createHash('sha256').update(p).digest(),b=createHash('sha256').update(PASS).digest();
  return timingSafeEqual(a,b);
}
export const cookieOpts={httpOnly:true,secure:process.env.NODE_ENV==='production'&&process.env.GLOOP_INSECURE_COOKIE!=='1',sameSite:'strict',path:'/',maxAge:HOURS*3600};

// Status: 'login' (niet ingelogd), 'forbidden' (geen beheerder), 'setup' (ADMIN_PASSWORD ontbreekt), 'password' (wachtwoord nodig), 'ok'.
export async function adminState(req){
  const u=await currentUser(req);
  if(!u)return {state:'login'};
  if(!isAdminUser(u))return {state:'forbidden'};
  if(!adminConfigured())return {state:'setup',user:u};
  if(!validToken(req.cookies.get(ADMIN_COOKIE)?.value,u))return {state:'password',user:u};
  return {state:'ok',user:u};
}

export const log=(admin,what)=>console.log('[gloop beheer]',admin.name+':',what);

const playerView=p=>({
  id:p.id,name:p.name,avatar:p.avatar,created:p.created_at,lastSeen:p.last_seen,hidden:!!p.hidden,onBoard:p.on_board!==false,admin:isAdminUser(p),
  played:Object.values(p.data?.played||{}).reduce((a,b)=>a+b,0),records:Object.keys(p.data?.records||{}).length
});
export async function findPlayers(q){
  q=cleanName(q).toLowerCase().slice(0,20);
  return (await db().searchPlayers(q,50)).map(playerView);
}

// Score weghalen: uit de ranglijst én uit de records van de speler, en onthouden zodat hij niet terugkomt.
const ID=/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/;
const getPlayer=id=>ID.test(id)?db().getPlayer(id):null;

async function clearRecords(p,keys){
  const data=sanitize(p.data),cleared={...(p.cleared||{})};
  for(const k of keys){
    const r=data.records[k];if(r===undefined)continue;
    const v=baseId(k)==='memo'?r.moves:r,old=cleared[k];
    cleared[k]=old===undefined?v:(LOWER_BETTER.includes(baseId(k))?Math.max(old,v):Math.min(old,v));
    delete data.records[k];
  }
  await db().updatePlayer(p.id,{data,cleared});
}

export async function playerAction(admin,id,action,name){
  const p=await getPlayer(id);
  if(!p)return 'Speler niet gevonden.';
  if(p.id===admin.id&&(action==='delete'||action==='hide'))return 'Dat kun je niet bij je eigen account doen.';
  if(action==='hide'||action==='unhide'){await db().updatePlayer(p.id,{hidden:action==='hide'});log(admin,`${action} ${p.name}`);return null;}
  if(action==='rename'){
    const n=cleanName(name),err=nameError(n);
    if(err)return err;
    if(!(await db().renamePlayer(p.id,n,n.toLowerCase())))return 'Die naam is al bezet.';
    log(admin,`naam ${p.name} → ${n}`);return null;
  }
  if(action==='reset'){
    await clearRecords(p,Object.keys(p.data?.records||{}));
    await db().deleteScores(p.id);
    log(admin,`scores gewist van ${p.name}`);return null;
  }
  if(action==='delete'){await db().deletePlayer(p.id);log(admin,`account verwijderd: ${p.name}`);return null;}
  return 'Onbekende actie.';
}

export async function listScores(game){
  if(!ALL_KEYS.includes(game))return null;
  return (await db().listScores(game,50)).map((s,i)=>({rank:i+1,id:s.player_id,name:s.name,avatar:s.avatar,score:s.score,extra:s.extra,hidden:s.hidden,onBoard:s.on_board,updated:s.updated_at}));
}
export async function removeScore(admin,id,game){
  if(!ALL_KEYS.includes(game))return 'Onbekend spel.';
  const p=await getPlayer(id);
  if(!p)return 'Speler niet gevonden.';
  await clearRecords(p,[game]);
  await db().deleteScores(p.id,game);
  log(admin,`score ${game} weggehaald bij ${p.name}`);
  return null;
}
