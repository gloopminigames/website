// Interactieve uitleg per game, voor kinderen die (nog) niet goed lezen.
// Elke stap: `say` wordt groot getoond, `scene` is een bewegend voorbeeldje met een wijzend handje.
//   action 'tap'  : tik op .tut-target (tik op .tut-wrong geeft `wrong`)
//   action 'taps' : tik `taps` keer op .tut-target
//   action 'drag' : sleep .tut-target minstens een stukje weg
//   action 'seq'  : tik de knoppen met data-seq="1", "2", … in die volgorde
//   action 'next' : alleen kijken, dan op Verder
//   armAfter      : pas na zoveel ms telt een tik; eerder tikken geeft `early`
// Na een goede actie krijgt de scène de klasse .tut-done (voor het "gelukt"-plaatje).
import {blob} from './blob';

const B=(c,f,cls='',crown=false)=>blob(c,f,cls,crown);
const hand=(x,y,extra='',e='👆')=>`<span class="tut-hand ${extra}" style="left:${x}%;top:${y}%" aria-hidden="true">${e}</span>`;
const target=(label,html,cls,style)=>`<button type="button" class="tut-target ${cls||''}" style="${style||''}" aria-label="${label}">${html}</button>`;
const wrong=(label,html,cls,style)=>`<button type="button" class="tut-wrong ${cls||''}" style="${style||''}" aria-label="${label}">${html}</button>`;

export const TUTORIALS={
  mepdeblob:[
    {say:'Mep de blobs die uit de potten opduiken!',action:'tap',ok:'Raak! Goed zo!',
     scene:`<div class="tut-holes"><span class="hole"></span>${target('Blob',B('#8B6CFF','surprised'),'hole pop')}<span class="hole"></span></div>${hand(50,2,'','👇')}`},
    {say:'Pas op! Dit is Gloopie, met een hartje. Gloopie mep je niet. Mep de paarse blob!',action:'tap',ok:'Goed! Gloopie is blij.',wrong:'Nee! Niet Gloopie meppen.',
     scene:`<div class="tut-holes">${wrong('Gloopie, niet meppen',`<span class="heart">❤️</span>${B('#6BE38A','happy')}`,'hole')}<span class="hole"></span>${target('Paarse blob',B('#8B6CFF','grin'),'hole pop')}</div>${hand(83,2,'','👇')}`},
    {say:'Mep er zoveel als je kunt voordat de tijd op is!',action:'next',
     scene:`<div class="tut-big">⏱️</div><div class="tut-row">${B('#8B6CFF','surprised','tut-s')}${B('#FF7AC6','grin','tut-s')}${B('#FFD84A','tongue','tut-s')}</div>`}
  ],
  reactie:[
    {say:'Wacht tot het vlak groen wordt. Dan tik je zo snel als je kunt!',action:'tap',armAfter:2600,ok:'Super snel!',early:'Te vroeg! Wacht tot het groen is.',
     scene:`${target('Tik als het groen is','<b class="wait-txt">Wacht…</b><b class="go-txt">TIK!</b>','tut-react')}${hand(50,70,'late')}`},
    {say:'Dat doe je vijf keer. Hoe sneller, hoe beter!',action:'next',
     scene:`<div class="tut-row tut-five">${'<span class="dot-go"></span>'.repeat(5)}</div><div class="tut-big">⚡</div>`}
  ],
  memo:[
    {say:'Tik op een kaartje om het om te draaien.',action:'tap',ok:'Kijk, een roze blob!',
     scene:`<div class="tut-cards">${target('Kaartje',`<span class="back">?</span><span class="front">${B('#FF7AC6','happy')}</span>`,'card')}<span class="card"><span class="back">?</span></span><span class="card"><span class="back">?</span></span><span class="card"><span class="back">?</span></span></div>${hand(20,66)}`},
    {say:'Zoek er nog een die hetzelfde is. Tik op het andere roze kaartje!',action:'tap',ok:'Een paartje!',wrong:'Oeps, dat is een andere. Probeer het roze kaartje.',
     scene:`<div class="tut-cards"><span class="card open"><span class="front">${B('#FF7AC6','happy')}</span></span>${wrong('Kaartje',`<span class="back">?</span>`,'card')}${target('Kaartje',`<span class="back">?</span><span class="front">${B('#FF7AC6','happy')}</span>`,'card')}${wrong('Kaartje',`<span class="back">?</span>`,'card')}</div>${hand(62,66)}`},
    {say:'Vind alle paartjes met zo weinig mogelijk beurten!',action:'next',
     scene:`<div class="tut-row">${B('#FF7AC6','happy','tut-s')}${B('#FF7AC6','happy','tut-s')}<span class="tut-big" style="font-size:44px">=</span><span class="tut-big" style="font-size:44px">⭐</span></div>`}
  ],
  bubbelbots:[
    {say:'Richt op de bots met dezelfde kleur als jouw bot, en laat los. Drie dezelfde knallen weg!',action:'tap',ok:'Knal! Drie roze weg!',wrong:'Probeer de roze bots, net zo een als jouw bot.',
     scene:`<div class="tut-bots">${wrong('Paarse bot',B('#8B6CFF','cool'),'bot',"left:18%;top:10%")}${target('Roze bots',B('#FF7AC6','cool')+B('#FF7AC6','cool'),'bot two',"left:44%;top:10%")}${wrong('Gele bot',B('#FFD84A','cool'),'bot',"left:72%;top:10%")}<span class="shooter">${B('#FF7AC6','cool')}</span></div>${hand(52,30)}`},
    {say:'Knal ze allemaal weg voor heel veel punten!',action:'next',
     scene:`<div class="tut-big">💥</div><div class="tut-row">${B('#FF7AC6','cool','tut-s')}${B('#8B6CFF','cool','tut-s')}${B('#FFD84A','cool','tut-s')}</div>`}
  ],
  stapelslijm:[
    {say:'Het blok schuift heen en weer. Tik om het te laten vallen!',action:'tap',ok:'Mooi gestapeld!',
     scene:`${target('Laat het blok vallen','<span class="slab move"></span><span class="slab base"></span><span class="slab base2"></span>','tut-stack')}${hand(50,78)}`},
    {say:'Tik als het blok precies boven de toren is. Wat uitsteekt, valt eraf!',action:'next',
     scene:`<div class="tut-stack static"><span class="slab over"></span><span class="slab cut"></span><span class="slab base"></span><span class="slab base2"></span></div>`}
  ],
  klikkerklok:[
    {say:'De wijzer draait rond. Tik precies als hij de gele bol raakt!',action:'tap',armAfter:2000,ok:'Precies op tijd!',early:'Nog niet! Wacht tot de wijzer bij de bol is.',
     scene:`${target('Tik als de wijzer bij de bol is','<span class="ball"></span><span class="arm"></span><span class="pivot"></span>','tut-clock')}${hand(50,80,'late')}`},
    {say:'Elke goede tik is een punt. Te vroeg of te laat? Dan is het voorbij!',action:'next',
     scene:`<div class="tut-row"><span class="tut-big">✅</span><span class="tut-big">➕1</span></div>`}
  ],
  blubberblast:[
    {say:'Tik heel snel op jouw kant! Zo blaas je de blubber naar Gloopie.',action:'taps',taps:6,ok:'Wauw, wat snel!',
     scene:`<div class="tut-blast"><span class="opp">${B('#FFD84A','cool')}</span><span class="blubber"></span>${target('Tik hier, heel snel','<b>TIK TIK TIK!</b>','half')}</div>${hand(50,82)}`},
    {say:'Zie je een gouden bel? Tik erop voor extra kracht!',action:'tap',ok:'Extra kracht!',
     scene:`<div class="tut-blast">${target('Gouden bel','🔔','bell')}</div>${hand(56,52)}`},
    {say:'Met z\'n tweeën? Ieder tikt op zijn eigen kant van het scherm.',action:'next',
     scene:`<div class="tut-duo"><span>${B('#FF7AC6','love','tut-s')}<b>👆</b></span><span>${B('#8B6CFF','grin','tut-s')}<b>👆</b></span></div>`}
  ],
  ruimte:[
    {say:'Sleep de raket naar links of rechts om te sturen!',action:'drag',ok:'Goed gestuurd!',
     scene:`<div class="tut-space"><span class="tsp-star s1"></span><span class="tsp-star s2"></span><span class="tsp-star s3"></span>${target('Raket, sleep opzij','<span class="tsp-rocket">🚀</span>','tsp-me')}</div><span class="tut-hand drag sideways" style="left:50%;top:70%" aria-hidden="true">👆</span>`},
    {say:'Pas op voor vogels, vliegtuigen en meteorieten! Pak liever de ster.',action:'tap',ok:'Ster gepakt! +10',wrong:'Au, een meteoriet! Pak de ster.',
     scene:`<div class="tut-space">${wrong('Meteoriet','<span class="tsp-obj">☄️</span>','tsp-o',"left:16%;top:24%")}${wrong('Vliegtuig','<span class="tsp-obj">✈️</span>','tsp-o',"left:68%;top:14%")}${target('Ster','<span class="tsp-obj">⭐</span>','tsp-o tsp-glow',"left:44%;top:40%")}</div>${hand(50,62)}`},
    {say:'Kom je bij een planeet? Dan begint het volgende level vanaf die planeet!',action:'next',
     scene:`<div class="tut-space"><span class="tsp-planet"></span><span class="tsp-rocket big">🚀</span></div>`}
  ],
  gloopiezegt:[
    {say:'Kijk! Een Gloopie licht op. Tik op dezelfde Gloopie!',action:'tap',ok:'Goed onthouden!',wrong:'Kijk goed: de gele Gloopie lichtte op.',
     scene:`<div class="tut-zegt">${wrong('Groene Gloopie',B('#6BE38A','happy'),'zp')}${target('Gele Gloopie',B('#FFD84A','grin'),'zp zt-lit')}${wrong('Roze Gloopie',B('#FF7AC6','love'),'zp')}</div>${hand(50,74,'late')}`},
    {say:'Nu lichten er twee op. Tik ze na: eerst de groene, dan de roze!',action:'seq',ok:'Super! Twee op een rij!',wrong:'Eerst de groene, dan de roze!',
     scene:`<div class="tut-zegt two"><button type="button" class="zp zt-a" data-seq="1" aria-label="Groene Gloopie, eerste">${B('#6BE38A','happy')}</button><button type="button" class="zp" data-seq="0" aria-label="Gele Gloopie">${B('#FFD84A','grin')}</button><button type="button" class="zp zt-b" data-seq="2" aria-label="Roze Gloopie, tweede">${B('#FF7AC6','love')}</button></div>`},
    {say:'Elke ronde komt er één bij. Hoe lang kun jij het onthouden?',action:'next',
     scene:`<div class="tut-row" style="margin-top:60px">${B('#6BE38A','happy','tut-s')}${B('#FF7AC6','love','tut-s')}${B('#FFD84A','grin','tut-s')}<span class="tut-big" style="font-size:44px;margin:0">➕</span></div>`}
  ],
  gloopiegolf:[
    {say:'Sleep Gloopie naar achteren, net als een katapult. Laat dan los!',action:'drag',ok:'Hup, de bal vliegt!',
     scene:`<div class="tut-golf"><span class="flag">⛳</span>${target('Gloopie, sleep naar achteren',B('#6BE38A','wink'),'golf-ball')}</div><span class="tut-hand drag" style="left:50%;top:62%" aria-hidden="true">👆</span>`},
    {say:'Hoe verder je sleept, hoe harder. Pas op voor het water en het zand!',action:'next',
     scene:`<div class="tut-golf"><span class="flag">⛳</span><span class="water">🌊</span><span class="sand">🏖️</span></div>`}
  ]
};
