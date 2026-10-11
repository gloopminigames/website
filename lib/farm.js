// Gloop Eiland: alle spelregels (gewassen, dieren, recepten, land, versiering) en het opschonen van de opslag.
// Wordt gebruikt door de game (browser) én de server (lib/merge.js), dus hier alleen gewone data en functies.
//
// Iets toevoegen? Zet een regel in de lijst. Een id nooit meer veranderen (dan raken spelers het kwijt).
// Tijden in seconden; prijzen in Oogstmunten (🌾), dat is iets anders dan Gloopmunten.

export const CROPS=[
  {id:'wortel',e:'🥕',n:'Slijmwortel',lvl:1,cost:2,grow:15,sell:5,xp:2},
  {id:'bes',e:'🫐',n:'Bubbelbes',lvl:1,cost:4,grow:30,sell:10,xp:3},
  {id:'graan',e:'🌾',n:'Gloopgraan',lvl:2,cost:3,grow:20,sell:6,xp:2},
  {id:'klaver',e:'🍀',n:'Klaver',lvl:3,cost:4,grow:25,sell:7,xp:3},
  {id:'aardbei',e:'🍓',n:'Wiebelbes',lvl:4,cost:8,grow:60,sell:20,xp:6},
  {id:'mais',e:'🌽',n:'Plopmaïs',lvl:5,cost:10,grow:75,sell:25,xp:7},
  {id:'pompoen',e:'🎃',n:'Sterrenpompoen',lvl:6,cost:14,grow:100,sell:38,xp:9},
  {id:'zonnebloem',e:'🌻',n:'Zonnebloem',lvl:7,cost:16,grow:120,sell:45,xp:11},
  {id:'paddenstoel',e:'🍄',n:'Stippelzwam',lvl:9,cost:25,grow:160,sell:75,xp:16}
];
// Dieren eten iets uit je schuur en maken dan iets.
export const ANIMALS=[
  {id:'kip',e:'🐔',n:'Gloopkip',lvl:2,price:50,eats:'graan',makes:'ei',time:30},
  {id:'koe',e:'🐄',n:'Gloopkoe',lvl:4,price:150,eats:'klaver',makes:'melk',time:60},
  {id:'schaap',e:'🐑',n:'Gloopschaap',lvl:6,price:260,eats:'mais',makes:'wol',time:90}
];
export const PRODUCTS=[
  {id:'ei',e:'🥚',n:'Ei',sell:15,xp:4},
  {id:'melk',e:'🥛',n:'Melk',sell:30,xp:6},
  {id:'wol',e:'🧶',n:'Wol',sell:45,xp:8}
];
// Werkplaats: van oogst iets maken dat meer oplevert.
export const RECIPES=[
  {id:'taart',e:'🥧',n:'Bessentaart',lvl:3,needs:{bes:3,ei:1},time:45,sell:70,xp:12},
  {id:'cake',e:'🍰',n:'Wortelcake',lvl:5,needs:{wortel:4,ei:2,melk:1},time:80,sell:130,xp:22},
  {id:'kaas',e:'🧀',n:'Kaas',lvl:5,needs:{melk:2},time:60,sell:90,xp:15},
  {id:'popcorn',e:'🍿',n:'Popcorn',lvl:6,needs:{mais:3},time:40,sell:100,xp:14},
  {id:'sjaal',e:'🧣',n:'Sjaal',lvl:7,needs:{wol:2},time:90,sell:140,xp:20},
  {id:'soep',e:'🥣',n:'Pompoensoep',lvl:8,needs:{pompoen:2,melk:1},time:70,sell:150,xp:22}
];
export const DECO=[
  {id:'bloemen',e:'🌷',n:'Bloemen',price:30,lvl:1},
  {id:'hek',e:'🪵',n:'Hekje',price:50,lvl:2},
  {id:'boom',e:'🌳',n:'Boom',price:90,lvl:3},
  {id:'vogelhuis',e:'🐦',n:'Vogelhuisje',price:140,lvl:4},
  {id:'vijver',e:'🦆',n:'Eendenvijver',price:220,lvl:5},
  {id:'molen',e:'🌬️',n:'Molentje',price:320,lvl:6},
  {id:'fontein',e:'⛲',n:'Fontein',price:450,lvl:8},
  {id:'beeld',e:'🗿',n:'Gloop-standbeeld',price:800,lvl:10}
];
export const START_LAND=6,MAX_LAND=12,MAX_ANIMALS=6,START_COINS=30;
// Prijs van het volgende stukje land (veld 7, 8, ...)
export const landPrice=land=>[60,100,160,250,400,600][land-START_LAND]??null;

const BY={};for(const l of [CROPS,ANIMALS,PRODUCTS,RECIPES,DECO])for(const x of l)BY[x.id]=x;
export const item=id=>BY[id];
export const ITEM_IDS=[...CROPS,...PRODUCTS,...RECIPES].map(x=>x.id);  // wat in je schuur kan liggen

// Levels: level L begint bij 25·L·(L-1) ervaringspunten (2 → 50, 3 → 150, 5 → 500, 10 → 2250).
export const xpFor=L=>25*L*(L-1);
export function levelOf(xp){let L=1;while(L<99&&xp>=xpFor(L+1))L++;return L;}

export function newFarm(now=Date.now()){
  return {v:1,coins:START_COINS,xp:0,land:START_LAND,plots:Array.from({length:START_LAND},()=>({c:'',t:0,w:false})),animals:[],inv:{},work:null,deco:[],made:now};
}

// Opschonen (ook op de server): alleen bekende dingen, getallen binnen de grenzen.
const int=(x,max)=>{x=typeof x==='number'&&isFinite(x)?Math.round(x):-1;return x>=0&&x<=max?x:0;};
const TMAX=4e12;
export function cleanFarm(f){
  if(!f||typeof f!=='object')return null;
  const land=Math.min(MAX_LAND,Math.max(START_LAND,int(f.land,MAX_LAND)||START_LAND));
  const out={v:1,coins:int(f.coins,1e9),xp:int(f.xp,1e8),land,plots:[],animals:[],inv:{},work:null,deco:[],made:int(f.made,TMAX)};
  for(let i=0;i<land;i++){const p=Array.isArray(f.plots)?f.plots[i]:null;const c=p&&CROPS.some(x=>x.id===p.c)?p.c:'';out.plots.push({c,t:c?int(p.t,TMAX):0,w:Boolean(c&&p.w)});}
  if(Array.isArray(f.animals))for(const a of f.animals.slice(0,MAX_ANIMALS))if(a&&ANIMALS.some(x=>x.id===a.k))out.animals.push({k:a.k,t:int(a.t,TMAX),fed:Boolean(a.fed)});
  if(f.inv&&typeof f.inv==='object')for(const id of ITEM_IDS){const n=int(f.inv[id],99999);if(n)out.inv[id]=n;}
  if(f.work&&RECIPES.some(r=>r.id===f.work.r))out.work={r:f.work.r,t:int(f.work.t,TMAX)};
  if(Array.isArray(f.deco))out.deco=[...new Set(f.deco.filter(id=>DECO.some(d=>d.id===id)))];
  return out;
}
// Twee apparaten: de boerderij met de meeste voortgang wint (niet half samenvoegen).
export function pickFarm(a,b){
  a=cleanFarm(a);b=cleanFarm(b);
  if(!a)return b;if(!b)return a;
  return b.xp>a.xp||(b.xp===a.xp&&b.coins>a.coins)?b:a;
}
