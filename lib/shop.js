// Gloopmunten en de Gloop-winkel. Munten verdien je alleen door te spelen; je kunt ze nooit kopen met echt geld.
// Opslag in de spelersdata: coins = alle munten die je ooit hebt verdiend, owned = gekochte dingen.
// Je saldo is coins min de prijs van wat je hebt gekocht (zo werkt samenvoegen tussen apparaten altijd goed).
//
// Alleen exclusieve dingen die je niet in een spel kunt verdienen. Kleuren zijn gratis (bij Profiel).
// Nieuw in de winkel? Voeg een regel toe (type face, acc of bg). Het moet ook getekend kunnen worden (lib/blob.js).
// Een id nooit meer veranderen (dan raken spelers hun aankoop kwijt).
export const SHOP=[
  {id:'b_snoep',type:'bg',value:'snoep',name:'Snoepjes',price:60},
  {id:'b_zee',type:'bg',value:'zee',name:'Onder de zee',price:80},
  {id:'b_jungle',type:'bg',value:'jungle',name:'Jungle',price:100},
  {id:'b_regenboog',type:'bg',value:'regenboog',name:'Regenboog',price:120},
  {id:'b_sterren',type:'bg',value:'sterren',name:'Sterrenhemel',price:120},
  {id:'b_goud',type:'bg',value:'goud',name:'Goudschat',price:250},
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
