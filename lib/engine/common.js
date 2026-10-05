import {data,save,challenge,today,statsHtml} from '../store';
import {blob,ICON} from '../blob';
import {esc,SITE} from '../site';
import {toast} from '../toast';
export function shareText(g,r){
  if(g.id==='reactie')return `Ik haalde gemiddeld ${r.avg} ms in Reactie Rush op Gloop 🫧 Ben jij sneller?`;
  if(g.id==='memo')return `Ik vond alle paartjes in Memo Mania in ${r.moves} zetten op Gloop 🫧 Lukt het jou in minder?`;
  if(g.id==='mepdeblob')return `Ik mepte ${r.score} punten bij elkaar in Mep de Blob op Gloop 🔨🫧 Ben jij sneller?`;
  if(g.id==='gloopiegolf'){const d=r.score-26;return `Ik speelde 9 holes Gloopie Golf in ${r.score} slagen (${d>0?'+'+d:d===0?'par':d}) op Gloop ⛳ Kun jij beter?`;}
  if(g.id==='blubberblast')return r.solo?`Ik won ${r.score} rondes op rij van Gloopie in Blubber Blast 🫧 Kun jij dat ook?`:`Wij speelden Blubber Blast op Gloop 🫧 Durf jij het tegen mij op te nemen?`;
  if(g.id==='klikkerklok')return `Ik haalde ${r.score} klikken in Klikkerklok op Gloop 🫧 Ben jij preciezer?`;
  if(g.id==='bubbelbots')return `Ik haalde ${r.score.toLocaleString('nl-NL')} punten in Bubbel Bots op Gloop 🫧 Knal jij er meer?`;
  if(g.id==='stapelslijm')return `Ik bouwde een slijmtoren van ${r.score} lagen in Stapelslijm op Gloop 🫧 Kom jij hoger?`;
  return `Ik speel ${g.title} op Gloop 🫧`;}
export function shareUrl(id){const base=(SITE.url||location.origin).replace(/\/$/,'');return base+'/games/'+id;}
export async function shareClick(e){const b=e.target.closest('[data-share]');if(!b)return;
  const text=b.dataset.share,url=shareUrl(b.dataset.game);
  try{if(navigator.share){await navigator.share({title:'Gloop',text,url});return;}}catch(err){if(err&&err.name==='AbortError')return;}
  try{await navigator.clipboard.writeText(text+' '+url);toast('Gekopieerd! Plak het in een bericht 💬');}catch(err){toast(text);}}
export function finishCommon(g,resultObj,isRecord,lines,face){
  data.played[g.id]=(data.played[g.id]||0)+1;
  const c=challenge();let chMsg='';
  if(c.game===g.id&&data.challengeDone!==today()&&c.check(resultObj)){data.challengeDone=today();chMsg=`<div class="ch-msg">${ICON.check} Dagelijkse uitdaging gehaald!</div>`}
  save();
  document.getElementById('stats').innerHTML=statsHtml(g.id);
  return `<div class="result" role="status">
    ${blob(g.blob,face,'result-blob')}
    <h2>${isRecord?'Nieuw record!':'Goed gedaan!'}</h2>
    <ul>${lines.map(l=>`<li>${l}</li>`).join('')}</ul>
    ${chMsg}
    <div class="result-btns"><button type="button" class="btn btn-primary" id="again">Opnieuw spelen</button><button type="button" class="btn btn-sun" data-share="${esc(shareText(g,resultObj))}" data-game="${g.id}">${ICON.share} Deel je score</button><a class="btn btn-plain" href="/games">Andere game</a></div>
  </div>`;
}

