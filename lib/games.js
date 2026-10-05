export const GAMES=[
  {id:'mepdeblob',title:'Mep de Blob',cat:'Klassiekers',bg:'#FFD84A',blob:'#8B6CFF',face:'surprised',playable:true,isNew:true,desc:'Mep de blobs die opduiken, maar laat Gloopie met rust!'},
  {id:'reactie',title:'Reactie Rush',cat:'Actie',bg:'#8B6CFF',blob:'#6BE38A',face:'surprised',playable:true,isNew:true,desc:'Tik zodra het vlak groen wordt.'},
  {id:'memo',title:'Memo Mania',cat:'Geheugen',bg:'#B9A8FF',blob:'#FF7AC6',face:'happy',playable:true,isNew:true,desc:'Vind alle blob-paartjes in zo min mogelijk zetten.'},
  {id:'slijmsprong',title:'Slijmsprong',cat:'Actie',bg:'#FFD84A',blob:'#6BE38A',face:'grin'},
  {id:'bubbelbots',title:'Bubbel Bots',cat:'Puzzel',bg:'#FF7AC6',blob:'#8B6CFF',face:'cool',playable:true,isNew:true,desc:'Schiet bubbelbots en knal groepjes van drie.'},
  {id:'woordgloop',title:'Woordgloop',cat:'Woorden',bg:'#6BE38A',blob:'#FFD84A',face:'wink'},
  {id:'stapelslijm',title:'Stapelslijm',cat:'Actie',bg:'#FFE89A',blob:'#FF7AC6',face:'tongue',playable:true,isNew:true,desc:'Stapel slijmblokken zo hoog als je kunt.'},
  {id:'klikkerklok',title:'Klikkerklok',cat:'Klassiekers',bg:'#FFB8E0',blob:'#FFD84A',face:'sleepy',playable:true,isNew:true,desc:'Klik precies als de wijzer de bol raakt.'},
  {id:'blubberblast',title:'Blubber Blast',cat:'Multiplayer',bg:'#C7F5D3',blob:'#8B6CFF',face:'love',playable:true,isNew:true,desc:'Tik sneller dan je tegenstander en blaas de blubber naar de overkant.'},
  {id:'slijmslang',title:'Slijmslang',cat:'Klassiekers',bg:'#B8F25A',blob:'#8B6CFF',face:'tongue'},
  {id:'gloopiegolf',title:'Gloopie Golf',cat:'Actie',bg:'#5CC8FF',blob:'#6BE38A',face:'wink',playable:true,isNew:true,desc:'Mik Gloopie in 9 holes met zo min mogelijk slagen.'},
  {id:'kleurmixer',title:'Kleurmixer',cat:'Puzzel',bg:'#FFB8E0',blob:'#FFD84A',face:'surprised'},
  {id:'sterrenvanger',title:'Sterrenvanger',cat:'Actie',bg:'#8B6CFF',blob:'#FFD84A',face:'grin'},
  {id:'gloopquiz',title:'Gloop Quiz',cat:'Multiplayer',bg:'#FFD84A',blob:'#FF7AC6',face:'cool'},
  {id:'blobfusie',title:'Blobfusie',cat:'Puzzel',bg:'#C7F5D3',blob:'#FF7AC6',face:'grin'},
  {id:'gloopierent',title:'Gloopie Rent',cat:'Actie',bg:'#FFD84A',blob:'#6BE38A',face:'surprised'},
  {id:'gloopiezegt',title:'Gloopie Zegt',cat:'Geheugen',bg:'#B9A8FF',blob:'#6BE38A',face:'wink'},
  {id:'slijmhockey',title:'Slijmhockey',cat:'Multiplayer',bg:'#5CC8FF',blob:'#FF9F5A',face:'cool'},
  {id:'letterlab',title:'Letterlab',cat:'Woorden',bg:'#FFE89A',blob:'#8B6CFF',face:'happy'}
];
export const CATS=['Alles','Actie','Puzzel','Woorden','Geheugen','Klassiekers','Multiplayer'];
export const PLAYABLE=GAMES.filter(g=>g.playable);
export const gameById=id=>GAMES.find(g=>g.id===id);
