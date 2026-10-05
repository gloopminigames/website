// Installeren als app: onthoudt de installatie-vraag van de browser en weet op welk soort apparaat we zitten.
let deferred=null,updateReady=false;const listeners=new Set();
export const hasUpdate=()=>updateReady;
const emit=()=>listeners.forEach(f=>f());
export function subscribeInstall(fn){listeners.add(fn);return()=>{listeners.delete(fn);};}
export function initPwa(){
  if(typeof window==='undefined'||window.__gloopPwa)return;window.__gloopPwa=true;
  window.addEventListener('beforeinstallprompt',e=>{e.preventDefault();deferred=e;emit();});
  window.addEventListener('appinstalled',()=>{deferred=null;emit();});
  if('serviceWorker' in navigator&&(location.protocol==='https:'||location.hostname==='localhost')){
    const hadController=Boolean(navigator.serviceWorker.controller);
    navigator.serviceWorker.register('/sw.js').then(reg=>{
      // Een geïnstalleerde app (zeker op iPad/iPhone) blijft vaak dagen open op de achtergrond.
      // Daarom zoeken we naar een nieuwe versie zodra je terugkomt in de app, en elk half uur.
      const check=()=>reg.update().catch(()=>{});
      document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='visible')check();});
      setInterval(check,30*60*1000);
    }).catch(()=>{});
    // Nieuwe service worker actief = er staat een nieuwe versie van Gloop klaar.
    navigator.serviceWorker.addEventListener('controllerchange',()=>{if(hadController){updateReady=true;emit();}});
  }
}
export const isStandalone=()=>typeof window!=='undefined'&&(window.matchMedia('(display-mode: standalone)').matches||navigator.standalone===true);
// Welke manier van installeren past bij dit apparaat?
export function installMode(){
  if(typeof window==='undefined'||isStandalone())return null;
  if(deferred)return 'prompt';                       // Chrome, Edge, Android, Samsung
  const ua=navigator.userAgent;
  const ios=/iphone|ipad|ipod/i.test(ua)||(navigator.platform==='MacIntel'&&navigator.maxTouchPoints>1);
  if(ios)return 'ios';
  if(/Macintosh/.test(ua)&&/Safari/.test(ua)&&!/Chrome|Chromium|Edg|Firefox/.test(ua))return 'mac';
  return null;                                       // bijv. Firefox op de computer: installeren kan daar niet
}
export async function promptInstall(){
  if(!deferred)return false;
  deferred.prompt();const r=await deferred.userChoice.catch(()=>null);deferred=null;emit();
  return r&&r.outcome==='accepted';
}
