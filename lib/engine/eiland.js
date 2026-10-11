// Gloop game-module. Wordt alleen geladen als iemand deze game speelt.
import {data,save} from '../store';
import {blob} from '../blob';
import {esc} from '../site';
import {sfx} from '../sfx';
import {toast} from '../toast';
import {confetti} from '../confetti';
import {checkStickers} from '../stickers';
import {CROPS,ANIMALS,PRODUCTS,RECIPES,DECO,MAX_ANIMALS,MAX_LAND,landPrice,item,xpFor,levelOf,newFarm,cleanFarm} from '../farm';
/* ---------- Gloop Eiland ---------- */
// Een rustig boerderij-eiland: zaaien en oogsten, dieren verzorgen, in de werkplaats iets maken,
// verkopen voor Oogstmunten (🌾) en daarmee land, dieren en versiering kopen.
// Alles wordt bewaard (ook bij je account) en groeit gewoon door als je even weg bent.
const COIN='🌾';
const fmtT=s=>s<60?`${Math.ceil(s)} s`:`${Math.floor(s/60)} min${s%60>=1?' '+Math.ceil(s%60)+' s':''}`;

export default function start(stage,g){
  let F=cleanFarm(data.farm)||newFarm();
  data.played[g.id]=(data.played[g.id]||0)+1;  // elk bezoek telt als 'gespeeld'
  let sheet=null,tab='verkopen',plotSel=-1,timer=0,sig='',saveT=0,focusSheet=false;
  const now=()=>Date.now();
  const L=()=>levelOf(F.xp);
  const store=()=>{F=cleanFarm(F);data.farm=F;const lv=L();if(!(data.records[g.id]>=lv))data.records[g.id]=lv;clearTimeout(saveT);saveT=setTimeout(save,400);};
  store();save();

  // ---------- regels ----------
  const left=(t,secs)=>Math.max(0,(t+secs*1000-now())/1000);
  function gainXp(n){
    const before=L();F.xp+=n;const after=L();
    if(after>before){
      data.coins=(data.coins||0)+10*(after-before);
      data.records[g.id]=after;
      const unl=[...CROPS,...ANIMALS,...RECIPES,...DECO].filter(x=>x.lvl===after).map(x=>x.e).join(' ');
      sfx('record');confetti(120);
      toast(`Level ${after}! +${10*(after-before)} Gloopmunten 🪙${unl?' Nieuw: '+unl:''}`);
      const fresh=checkStickers();if(fresh.length)setTimeout(()=>toast(`Nieuwe sticker: ${fresh.map(s=>s.emoji+' '+s.name).join(', ')}!`),2600);
    }
  }
  function plant(i,id){
    const c=item(id),p=F.plots[i];
    if(!p||p.c||!c||c.lvl>L())return;
    if(F.coins<c.cost){toast(`Je hebt ${c.cost} ${COIN} nodig. Verkoop eerst iets op de markt!`);return;}
    F.coins-=c.cost;F.plots[i]={c:id,t:now(),w:false};sfx('tap');close();store();render();
  }
  function plotTap(i){
    const p=F.plots[i];
    if(!p.c){plotSel=i;open('zaad');return;}
    const c=item(p.c),rest=left(p.t,c.grow);
    if(rest<=0){F.inv[c.id]=(F.inv[c.id]||0)+1;F.plots[i]={c:'',t:0,w:false};sfx('pop');gainXp(c.xp);float(`+1 ${c.e}`);store();render();return;}
    if(!p.w){p.w=true;p.t-=Math.round(rest*1000*.3);sfx('good');float('💧 Sneller!');store();render();return;}
    toast(`${c.n} is over ${fmtT(rest)} klaar.`);
  }
  function animalTap(i){
    const a=F.animals[i],d=item(a.k);
    if(!a.fed){
      if(!(F.inv[d.eats]>0)){toast(`${d.n} wil ${item(d.eats).e} ${item(d.eats).n}. Plant dat eerst!`);return;}
      F.inv[d.eats]--;a.fed=true;a.t=now();sfx('tap');float('Mjam!');store();render();return;
    }
    const rest=left(a.t,d.time);
    if(rest<=0){const pr=item(d.makes);F.inv[pr.id]=(F.inv[pr.id]||0)+1;a.fed=false;sfx('pop');gainXp(pr.xp);float(`+1 ${pr.e}`);store();render();return;}
    toast(`${d.n} is over ${fmtT(rest)} klaar.`);
  }
  function buyAnimal(id){
    const d=item(id);
    if(d.lvl>L()||F.animals.length>=MAX_ANIMALS)return;
    if(F.coins<d.price){toast(`Je hebt ${d.price} ${COIN} nodig.`);return;}
    F.coins-=d.price;F.animals.push({k:id,t:0,fed:false});sfx('good');gainXp(5);store();render();toast(`Welkom, ${d.n}! ${d.e}`);
  }
  function buyLand(){
    const pr=landPrice(F.land);if(pr==null)return;
    if(F.coins<pr){toast(`Je hebt ${pr} ${COIN} nodig.`);return;}
    F.coins-=pr;F.land++;F.plots.push({c:'',t:0,w:false});sfx('good');gainXp(8);store();render();toast('Nieuw stukje land! 🟫');
  }
  function buyDeco(id){
    const d=item(id);if(d.lvl>L()||F.deco.includes(id))return;
    if(F.coins<d.price){toast(`Je hebt ${d.price} ${COIN} nodig.`);return;}
    F.coins-=d.price;F.deco.push(id);sfx('good');gainXp(Math.round(d.price/10));store();render();toast(`${d.e} ${d.n} staat op je eiland!`);
  }
  function sell(id,n){
    const it=item(id),have=F.inv[id]||0;n=Math.min(n,have);if(!n)return;
    F.inv[id]=have-n;F.coins+=it.sell*n;sfx('pop');store();render();
  }
  function startWork(id){
    const r=item(id);if(F.work||r.lvl>L())return;
    for(const [k,n] of Object.entries(r.needs))if((F.inv[k]||0)<n){toast(`Je hebt nog niet genoeg ${item(k).e}.`);return;}
    for(const [k,n] of Object.entries(r.needs))F.inv[k]-=n;
    F.work={r:id,t:now()};sfx('good');store();render();
  }
  function collectWork(){
    if(!F.work)return;const r=item(F.work.r);if(left(F.work.t,r.time)>0)return;
    F.inv[r.id]=(F.inv[r.id]||0)+1;F.work=null;sfx('pop');gainXp(r.xp);store();render();toast(`${r.e} ${r.n} is klaar!`);
  }

  // ---------- tekenen ----------
  const prog=(t,secs)=>`<span class="fm-prog"><span data-t="${t}" data-s="${secs}" style="width:${Math.min(100,100-left(t,secs)/secs*100)}%"></span></span>`;
  function hint(){
    if(F.plots.some(p=>p.c&&left(p.t,item(p.c).grow)<=0))return 'Je oogst is klaar! Tik erop. 🧺';
    if(F.animals.some(a=>a.fed&&left(a.t,item(a.k).time)<=0))return 'Je dieren hebben iets voor je! 🥚';
    if(F.work&&left(F.work.t,item(F.work.r).time)<=0)return 'De werkplaats is klaar! 🛠️';
    if(F.animals.some(a=>!a.fed&&F.inv[item(a.k).eats]>0))return 'Je dieren hebben honger. Tik om te voeren!';
    if(F.plots.some(p=>!p.c)&&F.coins>=2)return 'Tik op een leeg veldje om te planten! 🌱';
    if(Object.values(F.inv).some(n=>n>0))return 'Verkoop je oogst op de markt 🏪';
    if(F.plots.some(p=>p.c&&!p.w))return 'Tik op een plantje om water te geven 💧';
    return 'Wat een mooi eiland! ☀️';
  }
  function plotHtml(p,i){
    if(!p.c)return `<button type="button" class="fm-plot open" data-act="plot" data-i="${i}" aria-label="Leeg veldje ${i+1}: tik om te planten"><span aria-hidden="true">＋</span></button>`;
    const c=item(p.c),rest=left(p.t,c.grow),ready=rest<=0;
    return `<button type="button" class="fm-plot${ready?' ready':''}${p.w?' wet':''}" data-act="plot" data-i="${i}" aria-label="${c.n}: ${ready?'klaar, tik om te oogsten':`groeit nog ${fmtT(rest)}${p.w?'':', tik om water te geven'}`}">
      <span class="fm-crop" aria-hidden="true" style="--g:${ready?1:.45+.55*(1-rest/c.grow)}">${rest>c.grow*.6?'🌱':c.e}</span>
      ${ready?'':prog(p.t,c.grow)}${!ready&&!p.w?'<span class="fm-drop" aria-hidden="true">💧</span>':''}</button>`;
  }
  function animalHtml(a,i){
    const d=item(a.k),pr=item(d.makes),rest=a.fed?left(a.t,d.time):0,ready=a.fed&&rest<=0;
    const label=!a.fed?`${d.n} heeft honger: tik om ${item(d.eats).n} te geven`:ready?`${d.n}: ${pr.n} klaar, tik om op te halen`:`${d.n} maakt ${pr.n}, nog ${fmtT(rest)}`;
    return `<button type="button" class="fm-animal${ready?' ready':''}${a.fed?'':' hungry'}" data-act="animal" data-i="${i}" aria-label="${label}">
      <span class="fm-ae" aria-hidden="true">${d.e}</span>
      ${!a.fed?`<span class="fm-want" aria-hidden="true">${item(d.eats).e}?</span>`:ready?`<span class="fm-make" aria-hidden="true">${pr.e}</span>`:prog(a.t,d.time)}</button>`;
  }
  function render(){
    const lv=L(),xp0=xpFor(lv),xp1=xpFor(lv+1),pct=Math.round((F.xp-xp0)/(xp1-xp0)*100);
    const w=F.work&&item(F.work.r),wRest=w?left(F.work.t,w.time):0;
    stage.innerHTML=`<div class="farm">
      <div class="fm-bar">
        <span class="fm-coins" title="Oogstmunten"><span aria-hidden="true">${COIN}</span> <b>${F.coins}</b><span class="sr-only"> Oogstmunten</span></span>
        <span class="fm-level"><b>Level ${lv}</b><span class="fm-xp" role="progressbar" aria-label="Op weg naar level ${lv+1}" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${pct}"><span style="width:${pct}%"></span></span></span>
        <button type="button" class="btn btn-sun btn-sm fm-market" data-act="market"><span aria-hidden="true">🏪</span> Markt</button>
      </div>
      <div class="fm-sea">
        <div class="fm-island">
          <div class="fm-guide">${blob('#6BE38A','happy','fm-gloop',false,'bloem')}<p class="fm-say" aria-live="polite">${hint()}</p></div>
          <div class="fm-plots">${F.plots.map(plotHtml).join('')}${landPrice(F.land)!=null&&F.land<MAX_LAND?`<button type="button" class="fm-plot locked" data-act="tab" data-tab="land" aria-label="Nieuw stukje land kopen voor ${landPrice(F.land)} Oogstmunten"><span aria-hidden="true">🔒</span><small>${landPrice(F.land)} ${COIN}</small></button>`:''}</div>
          <div class="fm-row">
            <div class="fm-pen" aria-label="Dieren">${F.animals.length?F.animals.map(animalHtml).join(''):`<button type="button" class="fm-animal none" data-act="tab" data-tab="dieren"><span aria-hidden="true">🐣</span><small>${lv<2?'Dieren vanaf level 2':'Koop een dier'}</small></button>`}</div>
            <button type="button" class="fm-work${w&&wRest<=0?' ready':''}" data-act="work" aria-label="Werkplaats${w?(wRest<=0?`: ${w.n} klaar, tik om op te halen`:`: maakt ${w.n}, nog ${fmtT(wRest)}`):lv<3?' (vanaf level 3)':''}">
              <span class="fm-we" aria-hidden="true">🛠️</span><small>Werkplaats</small>${w?(wRest<=0?`<span class="fm-make" aria-hidden="true">${w.e}</span>`:prog(F.work.t,w.time)):''}
            </button>
          </div>
          ${F.deco.length?`<div class="fm-deco" aria-label="Versiering">${F.deco.map(id=>`<span title="${esc(item(id).n)}">${item(id).e}</span>`).join('')}</div>`:''}
        </div>
      </div>
      <div class="fm-sheet" ${sheet?'':'hidden'} role="dialog" aria-modal="false" aria-labelledby="fmSheetTitle">${sheet?sheetHtml():''}</div>
    </div>`;
    sig=signature();
    if(sheet&&focusSheet){focusSheet=false;stage.querySelector('.fm-sheet [data-act]')?.focus({preventScroll:true});}
  }
  function sheetHtml(){
    const lv=L();
    const head=(t)=>`<div class="fm-sh-head"><h3 id="fmSheetTitle">${t}</h3><button type="button" class="fm-x" data-act="close" aria-label="Sluiten">✕</button></div>`;
    if(sheet==='zaad'){
      return head('🌱 Wat wil je planten?')+`<div class="fm-list">${CROPS.map(c=>{const lock=c.lvl>lv;return `<button type="button" class="fm-item${lock?' lock':''}" data-act="plant" data-id="${c.id}" ${lock?'disabled':''}>
        <span class="fm-ie" aria-hidden="true">${lock?'🔒':c.e}</span><span class="fm-it"><b>${c.n}</b><small>${lock?`Vanaf level ${c.lvl}`:`${fmtT(c.grow)} · verkoop ${c.sell} ${COIN}`}</small></span><span class="fm-price">${c.cost} ${COIN}</span></button>`;}).join('')}</div>`;
    }
    if(sheet==='work'){
      if(F.work){const r=item(F.work.r),rest=left(F.work.t,r.time);
        return head('🛠️ Werkplaats')+`<div class="fm-busy"><span class="fm-ie big" aria-hidden="true">${r.e}</span><p><b>${r.n}</b><br>${rest<=0?'Klaar!':`Nog ${fmtT(rest)}`}</p>${rest<=0?`<button type="button" class="btn btn-primary btn-sm" data-act="collect">Ophalen</button>`:prog(F.work.t,r.time)}</div>`;}
      return head('🛠️ Wat wil je maken?')+`<div class="fm-list">${RECIPES.map(r=>{const lock=r.lvl>lv,can=!lock&&Object.entries(r.needs).every(([k,n])=>(F.inv[k]||0)>=n);
        return `<button type="button" class="fm-item${lock?' lock':''}" data-act="make" data-id="${r.id}" ${can?'':'disabled'}>
        <span class="fm-ie" aria-hidden="true">${lock?'🔒':r.e}</span><span class="fm-it"><b>${r.n}</b><small>${lock?`Vanaf level ${r.lvl}`:Object.entries(r.needs).map(([k,n])=>`<span class="${(F.inv[k]||0)>=n?'ok':'no'}">${item(k).e} ${F.inv[k]||0}/${n}</span>`).join(' ')+` · ${fmtT(r.time)}`}</small></span><span class="fm-price">${r.sell} ${COIN}</span></button>`;}).join('')}</div>`;
    }
    // Markt
    const tabs=[['verkopen','🧺 Verkopen'],['dieren','🐔 Dieren'],['land','🟫 Land'],['versiering','🌷 Versiering']];
    let body='';
    if(tab==='verkopen'){
      const items=[...CROPS,...PRODUCTS,...RECIPES].filter(x=>F.inv[x.id]>0);
      body=items.length?`<div class="fm-list">${items.map(x=>`<div class="fm-item static"><span class="fm-ie" aria-hidden="true">${x.e}</span><span class="fm-it"><b>${x.n} × ${F.inv[x.id]}</b><small>${x.sell} ${COIN} per stuk</small></span>
        <span class="fm-btns"><button type="button" class="btn btn-plain btn-sm" data-act="sell" data-id="${x.id}" data-n="1" aria-label="Verkoop 1 ${x.n}">1</button><button type="button" class="btn btn-sun btn-sm" data-act="sell" data-id="${x.id}" data-n="99999" aria-label="Verkoop alle ${x.n} voor ${x.sell*F.inv[x.id]} Oogstmunten">Alles · ${x.sell*F.inv[x.id]}</button></span></div>`).join('')}</div>`
        :`<p class="fm-empty">Je schuur is leeg. Oogst eerst iets! 🧺</p>`;
    }else if(tab==='dieren'){
      body=`<p class="fm-note">${F.animals.length}/${MAX_ANIMALS} dieren</p><div class="fm-list">${ANIMALS.map(d=>{const lock=d.lvl>lv,full=F.animals.length>=MAX_ANIMALS;return `<button type="button" class="fm-item${lock?' lock':''}" data-act="animal-buy" data-id="${d.id}" ${lock||full?'disabled':''}>
        <span class="fm-ie" aria-hidden="true">${lock?'🔒':d.e}</span><span class="fm-it"><b>${d.n}</b><small>${lock?`Vanaf level ${d.lvl}`:`Eet ${item(d.eats).e}, maakt ${item(d.makes).e} in ${fmtT(d.time)}`}</small></span><span class="fm-price">${d.price} ${COIN}</span></button>`;}).join('')}</div>`;
    }else if(tab==='land'){
      const pr=landPrice(F.land);
      body=pr==null||F.land>=MAX_LAND?`<p class="fm-empty">Je eiland is helemaal af! 🏝️</p>`:`<div class="fm-list"><button type="button" class="fm-item" data-act="land"><span class="fm-ie" aria-hidden="true">🟫</span><span class="fm-it"><b>Nieuw veldje</b><small>Veldje ${F.land+1} van ${MAX_LAND}</small></span><span class="fm-price">${pr} ${COIN}</span></button></div>`;
    }else{
      body=`<div class="fm-list">${DECO.map(d=>{const have=F.deco.includes(d.id),lock=d.lvl>lv;return `<button type="button" class="fm-item${lock?' lock':''}" data-act="deco" data-id="${d.id}" ${have||lock?'disabled':''}>
        <span class="fm-ie" aria-hidden="true">${lock?'🔒':d.e}</span><span class="fm-it"><b>${d.n}</b><small>${have?'✓ Staat op je eiland':lock?`Vanaf level ${d.lvl}`:'Maakt je eiland mooier'}</small></span><span class="fm-price">${have?'':d.price+' '+COIN}</span></button>`;}).join('')}</div>`;
    }
    return head('🏪 Markt')+`<div class="fm-tabs" role="tablist">${tabs.map(([id,t])=>`<button type="button" role="tab" class="chip" aria-selected="${tab===id}" data-act="tab" data-tab="${id}">${t}</button>`).join('')}</div>`+body;
  }
  function float(txt){const el=document.createElement('span');el.className='fm-float';el.textContent=txt;stage.querySelector('.farm')?.appendChild(el);setTimeout(()=>el.remove(),1100);}
  function open(s){if(sheet!==s)focusSheet=true;sheet=s;render();}
  function close(){sheet=null;plotSel=-1;render();}

  // Klikken (één luisteraar voor alles)
  stage.addEventListener('click',e=>{
    const b=e.target.closest('[data-act]');if(!b||!stage.contains(b))return;
    const a=b.dataset.act,i=+b.dataset.i,id=b.dataset.id;
    if(a==='plot')plotTap(i);
    else if(a==='animal')animalTap(i);
    else if(a==='plant')plant(plotSel,id);
    else if(a==='market'){tab='verkopen';open('market');}
    else if(a==='tab'){tab=b.dataset.tab;open('market');}
    else if(a==='work'){if(F.work&&left(F.work.t,item(F.work.r).time)<=0)collectWork();else if(L()<3)toast('De werkplaats gaat open op level 3!');else open('work');}
    else if(a==='make')startWork(id);
    else if(a==='collect'){collectWork();close();}
    else if(a==='sell')sell(id,+b.dataset.n);
    else if(a==='animal-buy')buyAnimal(id);
    else if(a==='land')buyLand();
    else if(a==='deco')buyDeco(id);
    else if(a==='close')close();
  });
  const onKey=e=>{if(e.key==='Escape'&&sheet){close();}};
  window.addEventListener('keydown',onKey);

  // Elke halve seconde: voortgangsbalkjes bijwerken; verandert er iets (iets is klaar), dan opnieuw tekenen.
  function signature(){return [...F.plots.map(p=>p.c&&left(p.t,item(p.c).grow)<=0?1:0),...F.animals.map(a=>a.fed&&left(a.t,item(a.k).time)<=0?1:0),F.work&&left(F.work.t,item(F.work.r).time)<=0?1:0].join('');}
  function tick(){
    if(signature()!==sig){render();return;}
    stage.querySelectorAll('.fm-prog span').forEach(s=>{const t=+s.dataset.t,secs=+s.dataset.s;s.style.width=Math.min(100,100-left(t,secs)/secs*100)+'%';});
    stage.querySelectorAll('.fm-crop').forEach(el=>{const p=F.plots[+el.parentElement.dataset.i];if(p&&p.c){const c=item(p.c),r=left(p.t,c.grow);el.style.setProperty('--g',.45+.55*(1-r/c.grow));}});
  }
  render();
  timer=setInterval(tick,500);
  return {cleanup:()=>{clearInterval(timer);clearTimeout(saveT);save();window.removeEventListener('keydown',onKey);},
    pause(){clearInterval(timer);timer=0;},
    resume(){if(!timer){render();timer=setInterval(tick,500);}}};
}
