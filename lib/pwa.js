// Installeren als app: onthoudt de installatie-vraag van de browser en weet op welk soort apparaat we zitten.
let deferred=null;const listeners=new Set();
const emit=()=>listeners.forEach(f=>f());
export function subscribeInstall(fn){listeners.add(fn);return()=>{listeners.delete(fn);};}
export function initPwa(){
  if(typeof window==='undefined'||window.__gloopPwa)return;window.__gloopPwa=true;
  window.addEventListener('beforeinstallprompt',e=>{e.preventDefault();deferred=e;emit();});
  window.addEventListener('appinstalled',()=>{deferred=null;emit();});
  if('serviceWorker' in navigator&&(location.protocol==='https:'||location.hostname==='localhost')){
    navigator.serviceWorker.register('/sw.js').catch(()=>{});
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
