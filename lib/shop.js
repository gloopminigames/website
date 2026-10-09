// Gloopmunten en de Gloop-winkel. Munten verdien je alleen door te spelen; je kunt ze nooit kopen met echt geld.
// Opslag in de spelersdata: coins = alle munten die je ooit hebt verdiend, owned = gekochte dingen.
// Je saldo is coins min de prijs van wat je hebt gekocht (zo werkt samenvoegen tussen apparaten altijd goed).
//
// Nieuw in de winkel? Voeg een regel toe. Een kleur/gezicht/spulletje moet ook getekend kunnen worden (lib/blob.js).
// Een id nooit meer veranderen (dan raken spelers hun aankoop kwijt).
export const SHOP=[
  {id:'c_mint',type:'color',value:'#7DF2D0',name:'Mint',price:40},
  {id:'c_koraal',type:'color',value:'#FF7B6B',name:'Koraal',price:40},
  {id:'c_zilver',type:'color',value:'#D3D7E2',name:'Zilver',price:120},
  {id:'c_goud',type:'color',value:'#F7C531',name:'Goud',price:250},
  {id:'f_kus',type:'face',value:'kiss',name:'Kusje',price:60},
  {id:'f_gek',type:'face',value:'silly',name:'Gekkie',price:70},
  {id:'f_ster',type:'face',value:'starry',name:'Sterrenogen',price:90},
  {id:'a_kat',type:'acc',value:'kat',name:'Kattenoortjes',price:100},
  {id:'a_eenhoorn',type:'acc',value:'eenhoorn',name:'Eenhoornhoorn',price:150},
  {id:'a_piraat',type:'acc',value:'piraat',name:'Piratenhoed',price:200}
];
export const SHOP_IDS=SHOP.map(s=>s.id);
export const shopItem=id=>SHOP.find(s=>s.id===id);
export const shopByValue=(type,value)=>SHOP.find(s=>s.type===type&&s.value===value);
export const spent=d=>(d?.owned||[]).reduce((a,id)=>a+(shopItem(id)?.price||0),0);
export const balance=d=>Math.max(0,(d?.coins||0)-spent(d));
export const owns=(d,id)=>(d?.owned||[]).includes(id);

// Munten voor een potje: altijd iets, en extra voor knappe dingen.
export function coinsFor({level,isRecord,challenge,stickers}){
  return (level==='snel'?7:5)+(isRecord?10:0)+(challenge?20:0)+(stickers||0)*10;
}
