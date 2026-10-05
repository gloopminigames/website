// ============================================================
// NIEUWTJES ("Wat is er nieuw?") – zet hier alleen dingen in die leuk zijn voor spelers.
// Technische verbeteringen (sneller laden, bugfixes, privacytekst) horen hier NIET in.
//
// Nieuw nieuwtje? Zet het BOVENAAN de lijst:
//   id     : unieke naam, bijv. '2026-11-02-slijmslang'
//   date   : 'JJJJ-MM-DD'
//   popup  : true  -> spelers krijgen één keer een pop-up "Nieuw in Gloop!"
//            false -> alleen op de pagina /nieuw
//   items  : de leuke dingen, elk met emoji, titel, korte tekst en (optioneel) een link
// ============================================================
export const UPDATES=[
  {id:'2026-10-05-gloopie-zegt',date:'2026-10-05',popup:true,emoji:'🎶',title:'Nieuwe game: Gloopie Zegt!',
   items:[
     {emoji:'🎶',title:'Gloopie Zegt',text:'Gloopies lichten op en zingen een toontje. Doe het na! Elke ronde komt er één bij.',href:'/games/gloopiezegt'},
     {emoji:'👫',title:'Ook met z\'n tweeën',text:'Om de beurt de rij nadoen en er één aan toevoegen. Wie onthoudt het langst?',href:'/games/gloopiezegt'},
     {emoji:'🎵',title:'Nieuwe sticker',text:'Onthoud een rij van 10 en verdien de sticker Geheugenheld.',href:'/profiel#stickers'}
   ]},
  {id:'2026-10-05-grote-update',date:'2026-10-05',popup:true,emoji:'🎉',title:'De grote Gloop-update!',
   items:[
     {emoji:'🏅',title:'Stickerboek',text:'Verdien stickers door te spelen. Hoeveel kun jij er verzamelen?',href:'/profiel#stickers'},
     {emoji:'🎩',title:'Spullen voor je Gloop',text:'Speel een petje, strik, kroon of tovenaarshoed vrij met je stickers.',href:'/profiel'},
     {emoji:'🔥',title:'Makkelijk, Normaal of Moeilijk',text:'Kies zelf hoe moeilijk een game is. Elk niveau heeft eigen records.',href:'/games'},
     {emoji:'🏆',title:'Gloop Kampioenen',text:'Wie is de allerbeste? Kijk wie bovenaan staat bij elke game.',href:'/ranglijst'},
     {emoji:'🫧',title:'Je eigen Gloop',text:'Maak een account met een bijnaam en pincode, en kies je eigen kleur en gezichtje.',href:'/inloggen'},
     {emoji:'👆',title:'Uitleg bij elke game',text:'Met plaatjes en een wijzend handje, zodat iedereen meteen kan meespelen.',href:'/games'},
     {emoji:'🔊',title:'Geluid en confetti',text:'Plop, boing en een feestje bij elk nieuw record!',href:'/games'},
     {emoji:'📲',title:'Gloop als app',text:'Zet Gloop op je telefoon, tablet of computer.',href:'/faq'}
   ]},
  {id:'2026-10-05-start',date:'2026-10-05',popup:false,emoji:'🫧',title:'Gloop is er!',
   items:[
     {emoji:'🎮',title:'8 games om te spelen',text:'Mep de Blob, Reactie Rush, Memo Mania, Bubbel Bots, Stapelslijm, Klikkerklok, Blubber Blast en Gloopie Golf.',href:'/games'},
     {emoji:'🎯',title:'Dagelijkse uitdaging',text:'Elke dag een nieuwe uitdaging. Lukt het jou?',href:'/'}
   ]}
];
export const latestPopup=()=>UPDATES.find(u=>u.popup)||null;
export function fmtDate(d){const [y,m,day]=d.split('-').map(Number);return `${day} ${['januari','februari','maart','april','mei','juni','juli','augustus','september','oktober','november','december'][m-1]} ${y}`;}
