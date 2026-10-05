// Account in de browser: inloggen, uitloggen en records automatisch bewaren bij het account.
import {data,save,wipe,onSave} from './store';

let state={user:null,available:null,loading:true};
const listeners=new Set();
let loaded=null,applying=false,timer=null;

export const getAccount=()=>state;
export function subscribe(fn){listeners.add(fn);return()=>{listeners.delete(fn);};}
function set(patch){state={...state,...patch};listeners.forEach(f=>f(state));}

async function api(path,method='GET',body){
  const r=await fetch('/api/account'+path,{method,headers:body?{'Content-Type':'application/json'}:{},body:body?JSON.stringify(body):undefined,credentials:'same-origin',cache:'no-store'});
  let j={};try{j=await r.json();}catch(e){}
  if(!r.ok)throw new Error(j.error||'Er ging iets mis. Probeer het nog eens.');
  return j;
}
const localData=()=>({records:data.records,played:data.played,challengeDone:data.challengeDone,lastGame:data.lastGame});
function apply(d){
  if(!d)return;
  applying=true;
  Object.assign(data,{records:d.records||{},played:d.played||{},challengeDone:d.challengeDone||''});
  if(d.lastGame)data.lastGame=d.lastGame;
  save();applying=false;
}
async function syncNow(){
  if(!state.user)return;
  try{const j=await api('/sync','POST',{data:localData()});apply(j.data);}catch(e){}
}
// Na elk potje (save) even wachten en dan in één keer bewaren bij het account.
onSave(()=>{if(applying||!state.user)return;clearTimeout(timer);timer=setTimeout(syncNow,800);});

export function loadAccount(){
  if(typeof window==='undefined')return Promise.resolve(state);
  if(!loaded)loaded=api('').then(async j=>{
    set({user:j.user,available:j.available!==false,loading:false});
    if(j.user){data.name=j.user.name;apply(j.user.data);await syncNow();set({});}
    return state;
  }).catch(()=>{set({available:false,loading:false});return state;});
  return loaded;
}
async function signedIn(user){
  data.name=user.name;
  set({user,available:true,loading:false});
  apply(user.data);await syncNow();set({});
}
export async function login(name,pin){const j=await api('/login','POST',{name,pin});await signedIn(j.user);}
export async function register(name,pin){const j=await api('/register','POST',{name,pin,data:localData()});await signedIn(j.user);}
// Bij uitloggen wissen we dit apparaat, zodat een volgende speler (bijv. op school) jouw records niet ziet.
export async function logout(){try{await api('/logout','POST',{});}catch(e){}clearTimeout(timer);set({user:null});wipe();}
export async function deleteAccount(){await api('','DELETE',{});clearTimeout(timer);set({user:null});wipe();}
// Meteen tonen, en terugzetten als het opslaan mislukt.
export async function setOnBoard(on){
  const before=state.user;set({user:{...before,onBoard:on}});
  try{const j=await api('/settings','POST',{onBoard:on});set({user:j.user});}catch(e){set({user:before});throw e;}
}
