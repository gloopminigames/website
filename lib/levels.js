// Moeilijkheidsniveaus. "normaal" is het oude spel; records van normaal houden hun oude sleutel.
import {PLAYABLE} from './games';
export const LEVELS=[
  // De id's blijven 'rustig'/'snel' zodat bestaande records en ranglijsten blijven werken; alleen de namen zijn anders.
  {id:'rustig',label:'Makkelijk',icon:'🌱',speed:.72},
  {id:'normaal',label:'Normaal',icon:'⭐',speed:1},
  {id:'snel',label:'Moeilijk',icon:'🔥',speed:1.3}
];
export const GAME_LEVELS={
  mepdeblob:['rustig','normaal','snel'],stapelslijm:['rustig','normaal','snel'],klikkerklok:['rustig','normaal','snel'],
  blubberblast:['rustig','normaal','snel'],bubbelbots:['rustig','normaal','snel'],memo:['rustig','normaal'],
  gloopiezegt:['rustig','normaal','snel']
};
export const levelInfo=id=>LEVELS.find(l=>l.id===id)||LEVELS[1];
export const recKey=(id,level)=>!level||level==='normaal'?id:id+'@'+level;
export const baseId=k=>String(k).split('@')[0];
export const levelOf=k=>String(k).split('@')[1]||'normaal';
// Alle geldige record-sleutels, bijv. "memo", "memo@rustig", "mepdeblob@snel".
export const ALL_KEYS=PLAYABLE.flatMap(g=>(GAME_LEVELS[g.id]||['normaal']).map(l=>recKey(g.id,l)));
