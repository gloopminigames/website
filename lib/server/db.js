// Opslag voor accounts: Supabase (Postgres). Tabellen: zie supabase/schema.sql.
// Zonder Supabase-instellingen draait lokaal (npm run dev) een tijdelijke opslag in het geheugen.
import {createClient} from '@supabase/supabase-js';

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
    const {data,error}=await client().from('players').insert(p).select('*').single();
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
  async count(key){
    const r=must(await client().from('rate_limits').select('hits,reset_at').eq('key',key).maybeSingle());
    return r&&new Date(r.reset_at)>new Date()?r.hits:0;
  },
  async reset(key){must(await client().from('rate_limits').delete().eq('key',key));}
};

// Geheugenversie met dezelfde functies (alleen voor ontwikkelen; leeg na herstart).
const M=globalThis.__gloopMem||(globalThis.__gloopMem={players:new Map(),sessions:new Map(),limits:new Map()});
const copy=x=>x&&JSON.parse(JSON.stringify(x));
const memory={
  async getPlayerByKey(k){for(const p of M.players.values())if(p.name_key===k)return copy(p);return null;},
  async insertPlayer(p){if(await memory.getPlayerByKey(p.name_key))return null;const row={id:crypto.randomUUID(),created_at:new Date().toISOString(),last_seen:new Date().toISOString(),...p};M.players.set(row.id,row);return copy(row);},
  async updatePlayer(id,patch){const p=M.players.get(id);if(p)Object.assign(p,copy(patch));},
  async deletePlayer(id){M.players.delete(id);for(const [k,s] of M.sessions)if(s.player_id===id)M.sessions.delete(k);},
  async insertSession(s){M.sessions.set(s.token_hash,{...s});},
  async getSessionPlayer(h){const s=M.sessions.get(h);if(!s||new Date(s.expires_at)<new Date())return null;return copy(M.players.get(s.player_id))||null;},
  async deleteSession(h){M.sessions.delete(h);},
  async hit(key,windowSec){const now=Date.now();let r=M.limits.get(key);if(!r||r.reset<now)r={hits:0,reset:now+windowSec*1000};r.hits++;M.limits.set(key,r);return r.hits;},
  async count(key){const r=M.limits.get(key);return r&&r.reset>Date.now()?r.hits:0;},
  async reset(key){M.limits.delete(key);}
};

export const db=()=>(URL_&&KEY?supabase:memory);
