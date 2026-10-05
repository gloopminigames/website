export const GAMES=[
  {id:'ruimte',title:'Gloop in de Ruimte',cat:'Actie',bg:'#2A1F6B',blob:'#6BE38A',face:'cool',playable:true,added:'2026-10-05',desc:'Vlieg met je raket van planeet naar planeet en ontwijk alles wat op je af komt!'},
  {id:'mepdeblob',title:'Mep de Blob',cat:'Klassiekers',bg:'#FFD84A',blob:'#8B6CFF',face:'surprised',playable:true,desc:'Mep de blobs die opduiken, maar laat Gloopie met rust!'},
  {id:'reactie',title:'Reactie Rush',cat:'Actie',bg:'#8B6CFF',blob:'#6BE38A',face:'surprised',playable:true,desc:'Tik zodra het vlak groen wordt.'},
  {id:'memo',title:'Memo Mania',cat:'Geheugen',bg:'#B9A8FF',blob:'#FF7AC6',face:'happy',playable:true,desc:'Vind alle blob-paartjes in zo min mogelijk zetten.'},
  {id:'slijmsprong',title:'Slijmsprong',cat:'Actie',bg:'#FFD84A',blob:'#6BE38A',face:'grin'},
  {id:'bubbelbots',title:'Bubbel Bots',cat:'Puzzel',bg:'#FF7AC6',blob:'#8B6CFF',face:'cool',playable:true,desc:'Schiet bubbelbots en knal groepjes van drie.'},
  {id:'woordgloop',title:'Woordgloop',cat:'Woorden',bg:'#6BE38A',blob:'#FFD84A',face:'wink'},
  {id:'stapelslijm',title:'Stapelslijm',cat:'Actie',bg:'#FFE89A',blob:'#FF7AC6',face:'tongue',playable:true,desc:'Stapel slijmblokken zo hoog als je kunt.'},
  {id:'klikkerklok',title:'Klikkerklok',cat:'Klassiekers',bg:'#FFB8E0',blob:'#FFD84A',face:'sleepy',playable:true,desc:'Klik precies als de wijzer de bol raakt.'},
  {id:'blubberblast',title:'Blubber Blast',cat:'Multiplayer',bg:'#C7F5D3',blob:'#8B6CFF',face:'love',playable:true,desc:'Tik sneller dan je tegenstander en blaas de blubber naar de overkant.'},
  {id:'slijmslang',title:'Slijmslang',cat:'Klassiekers',bg:'#B8F25A',blob:'#8B6CFF',face:'tongue'},
  {id:'gloopiegolf',title:'Gloopie Golf',cat:'Actie',bg:'#5CC8FF',blob:'#6BE38A',face:'wink',playable:true,desc:'Mik Gloopie in 9 holes met zo min mogelijk slagen.'},
  {id:'kleurmixer',title:'Kleurmixer',cat:'Puzzel',bg:'#FFB8E0',blob:'#FFD84A',face:'surprised'},
  {id:'sterrenvanger',title:'Sterrenvanger',cat:'Actie',bg:'#8B6CFF',blob:'#FFD84A',face:'grin'},
  {id:'gloopquiz',title:'Gloop Quiz',cat:'Multiplayer',bg:'#FFD84A',blob:'#FF7AC6',face:'cool'},
  {id:'blobfusie',title:'Blobfusie',cat:'Puzzel',bg:'#C7F5D3',blob:'#FF7AC6',face:'grin'},
  {id:'gloopierent',title:'Gloopie Rent',cat:'Actie',bg:'#FFD84A',blob:'#6BE38A',face:'surprised'},
  {id:'gloopiezegt',title:'Gloopie Zegt',cat:'Geheugen',bg:'#B9A8FF',blob:'#6BE38A',face:'wink',playable:true,added:'2026-10-05',desc:'Kijk welke Gloopies oplichten en doe het na. Hoe lang kun jij het onthouden?'},
  {id:'slijmhockey',title:'Slijmhockey',cat:'Multiplayer',bg:'#5CC8FF',blob:'#FF9F5A',face:'cool'},
  {id:'letterlab',title:'Letterlab',cat:'Woorden',bg:'#FFE89A',blob:'#8B6CFF',face:'happy'}
];
export const CATS=['Alles','Actie','Puzzel','Woorden','Geheugen','Klassiekers','Multiplayer'];
// Icoontje per categorie (o.a. voor de spelkiezer op de ranglijst).
export const CAT_ICONS={Actie:'⚡',Puzzel:'🧩',Woorden:'🔤',Geheugen:'🧠',Klassiekers:'🕹️',Multiplayer:'👫'};
export const PLAYABLE=GAMES.filter(g=>g.playable);
// "Nieuw!"-sticker: alleen voor games die de afgelopen 30 dagen zijn toegevoegd (veld added: 'JJJJ-MM-DD')
// én die deze speler nog niet heeft gespeeld. De startgames hebben geen added en zijn dus nooit "nieuw".
export const NEW_DAYS=30;
export function isNewFor(g,played){
  if(!g.playable||!g.added||(played&&played[g.id]))return false;
  return (Date.now()-new Date(g.added+'T00:00:00').getTime())/864e5<=NEW_DAYS;
}
export const gameById=id=>GAMES.find(g=>g.id===id);
