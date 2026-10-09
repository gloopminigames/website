// Accounts: naam + pincode. Alleen op de server gebruiken.
import {randomBytes,scrypt as _scrypt,timingSafeEqual,createHash} from 'node:crypto';
import {promisify} from 'node:util';
import {db} from './db';
import {cleanName,validAvatar,randomAvatar,parseAvatar,makeAvatar} from '../accountRules';
import {ACCESSORIES,accUnlocked} from '../stickers';
import {shopByValue,owns} from '../shop';
import {sanitize,scoreRows,LOWER_BETTER} from '../merge';
import {baseId} from '../levels';

const scrypt=promisify(_scrypt);
export const COOKIE='gloop_sessie';
export const SESSION_DAYS=60;

const nameKey=name=>cleanName(name).toLowerCase();
const hashToken=t=>createHash('sha256').update(t).digest('hex');
async function hashPin(pin,salt){return (await scrypt(pin,salt,32)).toString('hex');}

export const getUser=name=>db().getPlayerByKey(nameKey(name));

export async function createUser(name,pin,data,avatar){
  const salt=randomBytes(16).toString('hex');
  const u=await db().insertPlayer({name:cleanName(name),name_key:nameKey(name),salt,hash:await hashPin(pin,salt),data:sanitize(data),avatar:allowedAvatar(validAvatar(avatar)?avatar:randomAvatar(),sanitize(data))});
  if(u)await saveScores(u);
  return u;
}
export async function checkPin(u,pin){
  const a=Buffer.from(await hashPin(pin,u.salt),'hex'),b=Buffer.from(u.hash,'hex');
  return a.length===b.length&&timingSafeEqual(a,b);
}
export async function saveData(u,data){
  u.data=dropCleared(sanitize(data),u.cleared);
  await db().updatePlayer(u.id,{data:u.data,last_seen:new Date().toISOString()});
  await saveScores(u);
}
// Door beheer weggehaalde scores komen niet terug via een ander apparaat:
// een record dat even goed of beter is dan de weggehaalde score wordt niet bewaard.
export function dropCleared(d,cleared){
  if(!cleared||typeof cleared!=='object')return d;
  for(const [k,lim] of Object.entries(cleared)){
    const r=d.records[k];if(r===undefined)continue;
    const v=baseId(k)==='memo'?r.moves:r;
    if(LOWER_BETTER.includes(baseId(k))?v<=lim:v>=lim)delete d.records[k];
  }
  return d;
}
// De ranglijst mag nooit het bewaren van records blokkeren (bijv. als de scores-tabel nog niet bestaat).
export async function saveScores(u){
  try{await db().upsertScores(u.id,scoreRows(u.data.records));}
  catch(e){console.error('[gloop ranglijst] scores niet opgeslagen:',e.message);}
}
export async function setAvatar(u,a){a=allowedAvatar(a,u.data);u.avatar=a;await db().updatePlayer(u.id,{avatar:a});}
export async function setOnBoard(u,on){u.on_board=on;await db().updatePlayer(u.id,{on_board:on});}
export const board=(game,n,me)=>db().board(game,n,me);
export const deleteUser=u=>db().deletePlayer(u.id);

// Sessies: de cookie bevat een willekeurige sleutel; in de database staat alleen de hash ervan.
export async function createSession(u){
  const token=randomBytes(32).toString('base64url');
  await db().insertSession({token_hash:hashToken(token),player_id:u.id,expires_at:new Date(Date.now()+SESSION_DAYS*864e5).toISOString()});
  await db().updatePlayer(u.id,{last_seen:new Date().toISOString()});
  return token;
}
export async function sessionUser(token){
  if(!token||typeof token!=='string'||token.length>100)return null;
  return db().getSessionPlayer(hashToken(token));
}
export async function endSession(token){if(token)await db().deleteSession(hashToken(token));}

// Tellers tegen raden en spam.
export const hit=(key,windowSec)=>db().hit(key,windowSec);
export const count=key=>db().count(key);
export const reset=key=>db().reset(key);

// Een spulletje mag alleen als je genoeg stickers hebt; anders zonder spulletje.
// Uit de winkel: alleen als je het echt hebt gekocht; anders het gewone groen / blije gezicht / geen spulletje.
export function allowedAvatar(a,d){
  const p=parseAvatar(a),bought=(t,v)=>{const it=shopByValue(t,v);return !it||owns(d,it.id);};
  const face=bought('face',p.face)?p.face:'happy';
  const shopAcc=shopByValue('acc',p.acc),acc=ACCESSORIES.find(x=>x.id===p.acc);
  const accOk=shopAcc?owns(d,shopAcc.id):acc&&acc.id!=='none'&&accUnlocked(acc,d);
  const bg=p.bg&&bought('bg',p.bg)?p.bg:'';
  return makeAvatar(p.color,face,accOk?p.acc:'none',bg);
}
