// Opslag voor accounts: Supabase (Postgres). Tabellen: zie supabase/schema.sql.
// Zonder Supabase-instellingen draait lokaal (npm run dev) een tijdelijke opslag in het geheugen.
import {createClient} from '@supabase/supabase-js';
import {LOWER_BETTER} from '../merge';
import {baseId} from '../levels';

const URL_=process.env.SUPABASE_URL;
const KEY=process.env.SUPABASE_SERVICE_ROLE_KEY;   // geheim: alleen op de server, nooit NEXT_PUBLIC_
const MEMORY_OK=process.env.NODE_ENV!=='production'||process.env.GLOOP_MEMORY_DB==='1';
export const dbReady=()=>Boolean(URL_&&KEY)||MEMORY_OK;

let sb=null;
const client=()=>sb||(sb=createClient(URL_,KEY,{auth:{persistSession:false,autoRefreshToken:false}}));
const must=({data,error})=>{if(error)throw new Error('db: '+error.message);return data;};

const supabase={
  async getPlayerByKey(nameKey){return must(await client().from('players').select('*').eq('name_key',nameKey).maybeSingle());},
  async insertPlayer(p){
    let {data,error}=await client().from('players').insert(p).select('*').single();
    // Kolom 'avatar' nog niet aangemaakt (schema.sql niet opnieuw gedraaid)? Dan zonder eigen Gloop registreren.
    if(error&&/avatar/.test(error.message)&&p.avatar){const {avatar,...rest}=p;({data,error}=await client().from('players').insert(rest).select('*').single());}
    if(error){if(error.code==='23505')return null;throw new Error('db: '+error.message);}
    return data;
  },
  async updatePlayer(id,patch){must(await client().from('players').update(patch).eq('id',id));},
  async deletePlayer(id){must(await client().from('players').delete().eq('id',id));},
  async insertSession(s){must(await client().from('sessions').insert(s));},
  async getSessionPlayer(tokenHash){
    const s=must(await client().from('sessions').select('player_id,expires_at').eq('token_hash',tokenHash).maybeSingle());
    if(!s||new Date(s.expires_at)<new Date())return null;
    return must(await client().from('players').select('*').eq('id',s.player_id).maybeSingle());
  },
  async deleteSession(tokenHash){must(await client().from('sessions').delete().eq('token_hash',tokenHash));},
  async hit(key,windowSec){return must(await client().rpc('gloop_hit',{k:key,window_sec:windowSec}));},
  async upsertScores(playerId,rows){
    if(!rows.length)return;
    const now=new Date().toISOString();
    must(await client().from('scores').upsert(rows.map(r=>({...r,player_id:playerId,updated_at:now})),{onConflict:'player_id,game'}));
  },
  async board(game,n,me){return must(await client().rpc('gloop_board',{g:game,n,me:me||null}));},
  async count(key){
    const r=must(await client().from('rate_limits').select('hits,reset_at').eq('key',key).maybeSingle());
    return r&&new Date(r.reset_at)>new Date()?r.hits:0;
  },
  async reset(key){must(await client().from('rate_limits').delete().eq('key',key));},
  // Beheer
  async getPlayer(id){return must(await client().from('players').select('*').eq('id',id).maybeSingle());},
  async searchPlayers(q,n){
    let r=client().from('players').select('*').order('last_seen',{ascending:false}).limit(n);
    if(q)r=r.ilike('name_key','%'+q.replace(/[\\%_]/g,m=>'\\'+m)+'%');
    return must(await r);
  },
  async renamePlayer(id,name,nameKey){
    const {error}=await client().from('players').update({name,name_key:nameKey}).eq('id',id);
    if(error){if(error.code==='23505')return false;throw new Error('db: '+error.message);}
    return true;
  },
  async deleteScores(playerId,game){let r=client().from('scores').delete().eq('player_id',playerId);if(game)r=r.eq('game',game);must(await r);},
  async listScores(game,n){
    const low=LOWER_BETTER.includes(baseId(game));
    const rows=must(await client().from('scores').select('player_id,game,score,extra,updated_at,players(name,avatar,hidden,on_board)').eq('game',game)
      .order('score',{ascending:low}).order('extra',{ascending:true,nullsFirst:false}).limit(n));
    return rows.map(({players:p,...s})=>({...s,name:p?.name,avatar:p?.avatar,hidden:!!p?.hidden,on_board:p?.on_board!==false}));
  }
};

// Geheugenversie met dezelfde functies (alleen voor ontwikkelen; leeg na herstart).
const M=globalThis.__gloopMem||(globalThis.__gloopMem={players:new Map(),sessions:new Map(),limits:new Map(),scores:new Map()});
const copy=x=>x&&JSON.parse(JSON.stringify(x));
const memory={
  async getPlayerByKey(k){for(const p of M.players.values())if(p.name_key===k)return copy(p);return null;},
  async insertPlayer(p){if(await memory.getPlayerByKey(p.name_key))return null;const row={id:crypto.randomUUID(),created_at:new Date().toISOString(),last_seen:new Date().toISOString(),...p};M.players.set(row.id,row);return copy(row);},
  async updatePlayer(id,patch){const p=M.players.get(id);if(p)Object.assign(p,copy(patch));},
  async deletePlayer(id){M.players.delete(id);await memory.deleteScores(id);for(const [k,s] of M.sessions)if(s.player_id===id)M.sessions.delete(k);},
  async insertSession(s){M.sessions.set(s.token_hash,{...s});},
  async getSessionPlayer(h){const s=M.sessions.get(h);if(!s||new Date(s.expires_at)<new Date())return null;return copy(M.players.get(s.player_id))||null;},
  async deleteSession(h){M.sessions.delete(h);},
  async hit(key,windowSec){const now=Date.now();let r=M.limits.get(key);if(!r||r.reset<now)r={hits:0,reset:now+windowSec*1000};r.hits++;M.limits.set(key,r);return r.hits;},
  async count(key){const r=M.limits.get(key);return r&&r.reset>Date.now()?r.hits:0;},
  async reset(key){M.limits.delete(key);},
  async getPlayer(id){return copy(M.players.get(id))||null;},
  async searchPlayers(q,n){return [...M.players.values()].filter(p=>!q||p.name_key.includes(q)).sort((a,b)=>b.last_seen<a.last_seen?-1:1).slice(0,n).map(copy);},
  async renamePlayer(id,name,nameKey){for(const p of M.players.values())if(p.name_key===nameKey&&p.id!==id)return false;const p=M.players.get(id);if(p)Object.assign(p,{name,name_key:nameKey});return true;},
  async deleteScores(pid,game){for(const [k,s] of M.scores)if(s.player_id===pid&&(!game||s.game===game))M.scores.delete(k);},
  async listScores(game,n){
    const low=LOWER_BETTER.includes(baseId(game));
    return [...M.scores.values()].filter(s=>s.game===game).sort((a,b)=>(low?a.score-b.score:b.score-a.score)||((a.extra??1e9)-(b.extra??1e9))).slice(0,n)
      .map(s=>{const p=M.players.get(s.player_id)||{};return {...s,updated_at:new Date(s.updated_at).toISOString(),name:p.name,avatar:p.avatar,hidden:!!p.hidden,on_board:p.on_board!==false};});
  },
  async upsertScores(pid,rows){for(const r of rows){const k=pid+':'+r.game,old=M.scores.get(k);if(!old||old.score!==r.score||old.extra!==r.extra)M.scores.set(k,{...r,player_id:pid,updated_at:Date.now()});}},
  async board(game,n,me){
    const low=LOWER_BETTER.includes(baseId(game));
    const list=[...M.scores.values()].filter(s=>s.game===game).map(s=>({...s,p:M.players.get(s.player_id)})).filter(s=>s.p&&s.p.on_board!==false&&!s.p.hidden)
      .sort((a,b)=>(low?a.score-b.score:b.score-a.score)||((a.extra??1e9)-(b.extra??1e9))||(a.updated_at-b.updated_at));
    let pos=0;list.forEach((s,i)=>{const prev=list[i-1];if(!prev||prev.score!==s.score||prev.extra!==s.extra)pos=i+1;s.pos=pos;});
    const mine=list.find(s=>s.player_id===me);
    return {top:list.slice(0,n).map(s=>({rank:s.pos,name:s.p.name,avatar:s.p.avatar,score:s.score,extra:s.extra,me:s.player_id===me})),total:list.length,me:mine?{rank:mine.pos,score:mine.score,extra:mine.extra}:null};
  }
};

export const db=()=>(URL_&&KEY?supabase:memory);

// Controle voor /api/account/status: vertelt in gewone taal wat er mis is, zonder geheimen te tonen.
export async function dbCheck(){
  if(!(URL_&&KEY))return {ok:MEMORY_OK,mode:'geheugen',reason:MEMORY_OK?'':'SUPABASE_URL en/of SUPABASE_SERVICE_ROLE_KEY ontbreken in Vercel.'};
  if(!/^https:\/\/[a-z0-9-]+\.supabase\.co\/?$/.test(URL_))return {ok:false,mode:'supabase',reason:'SUPABASE_URL ziet er niet goed uit. Het moet zoiets zijn als https://abcdefgh.supabase.co (zonder /rest/v1 of /dashboard).'};
  try{
    const {error}=await client().from('players').select('id',{head:true,count:'exact'}).limit(1);
    if(error)return {ok:false,mode:'supabase',reason:explain(error)};
    const r=await client().rpc('gloop_hit',{k:'status-check',window_sec:60});
    if(r.error)return {ok:false,mode:'supabase',reason:explain(r.error)};
    const a=await client().from('players').select('avatar',{head:true}).limit(1);
    if(a.error)return {ok:false,mode:'supabase',reason:'Eigen Gloop: '+explain(a.error)};
    const c=await client().from('players').select('is_admin,cleared',{head:true}).limit(1);
    if(c.error)return {ok:false,mode:'supabase',reason:'Beheer: '+explain(c.error)};
    const b=await client().rpc('gloop_board',{g:'reactie',n:1,me:null});
    if(b.error)return {ok:false,mode:'supabase',reason:'Ranglijst: '+explain(b.error)};
    return {ok:true,mode:'supabase',reason:''};
  }catch(e){return {ok:false,mode:'supabase',reason:'Supabase is niet bereikbaar. Controleer SUPABASE_URL. ('+String(e.message||e).slice(0,80)+')'};}
}
function explain(e){
  const m=String(e.message||'')+' '+String(e.code||'');
  if(/fetch failed|ENOTFOUND|ECONNREFUSED|getaddrinfo/i.test(m))return 'Supabase is niet bereikbaar. Controleer of SUPABASE_URL klopt (https://jouwproject.supabase.co).';
  if(/PGRST205|42P01|42703|PGRST202|PGRST204|does not exist|Could not find/i.test(m))return 'De tabellen of functies ontbreken. Draai supabase/schema.sql in de Supabase SQL Editor.';
  if(/api key|apikey|JWT|401|unauthori[sz]ed|permission denied/i.test(m))return 'De sleutel wordt niet geaccepteerd. Controleer SUPABASE_SERVICE_ROLE_KEY (de sb_secret_-sleutel, helemaal gekopieerd).';
  return 'Onbekende databasefout: '+m.slice(0,120);
}
