// Regels voor accounts, gedeeld door browser en server.
import {SHOP} from './shop';

// Wachtwoord: een pincode van 4 of 6 cijfers, makkelijk te onthouden voor kinderen.
export const validPin=p=>typeof p==='string'&&/^(\d{4}|\d{6})$/.test(p);
// Veelgebruikte codes (o.a. uit onderzoek naar gelekte pincodes) en patronen op het toetsenblok.
const COMMON=new Set(['1212','1004','2000','6969','1122','1313','4321','2001','1010','2580','0852','1470','0741','3690','0963','1590','7410','1357','2468','1379','7531','1236','1243','2323','1221','1001','0001','0007','1984','2020','2468',
  '121212','112233','111222','123123','123321','654321','696969','159753','147258','147852','258369','789456','456789','102030','101010','111000','000111','112211','123654','246810','135790','147369','753159','999888','121314']);
export function pinError(p){
  if(!validPin(p))return 'Je pincode moet 4 of 6 cijfers hebben.';
  const d=p.split('').map(Number);
  const same=d.every(x=>x===d[0]);                                        // 0000, 111111
  const up=d.every((x,i)=>!i||x===(d[i-1]+1)%10),down=d.every((x,i)=>!i||x===(d[i-1]+9)%10); // 1234, 7890, 4321
  const twice=p.length===4?p.slice(0,2)===p.slice(2):p.slice(0,3)===p.slice(3);  // 1212, 123123
  const pairs=p.length===4&&d[0]===d[1]&&d[2]===d[3];                     // 1122, 7700
  const abab=p.length===6&&p.slice(0,2)===p.slice(2,4)&&p.slice(2,4)===p.slice(4); // 121212
  if(same||up||down||twice||pairs||abab||COMMON.has(p))return 'Die pincode is te makkelijk te raden. Kies een andere!';
  return '';
}

// Jouw eigen Gloop: een kleur en een gezichtje, opgeslagen als "#RRGGBB|gezicht".
export const AVATAR_COLORS=[['#6BE38A','Slijmgroen'],['#8B6CFF','Druif'],['#FF7AC6','Bubblegum'],['#FFD84A','Zon'],['#5CC8FF','Lucht'],['#FF9F5A','Mandarijn'],['#B8F25A','Limoen'],['#B9A8FF','Lavendel']];
export const AVATAR_FACES=[['happy','Blij'],['grin','Lachend'],['wink','Knipoog'],['surprised','Verrast'],['cool','Cool'],['love','Verliefd'],['tongue','Ondeugend'],['sleepy','Slaperig']];
export const DEFAULT_AVATAR='#6BE38A|happy';
const ACC_IDS=['none','pet','strik','feest','koptelefoon','bloem','kroon','tovenaar','helm','heks','mijter','kerstmuts'];
// "kleur|gezicht" of "kleur|gezicht|spulletje"
// Ook dingen uit de Gloop-winkel tellen mee (of je ze echt hebt gekocht, controleert de server).
const shopVals=t=>SHOP.filter(s=>s.type===t).map(s=>s.value);
export const validAvatar=a=>{if(typeof a!=='string')return false;const [c,f,x]=a.split('|');return (AVATAR_COLORS.some(y=>y[0]===c)||shopVals('color').includes(c))&&(AVATAR_FACES.some(y=>y[0]===f)||shopVals('face').includes(f))&&(x===undefined||ACC_IDS.includes(x)||shopVals('acc').includes(x));};
export function parseAvatar(a){const [color,face,acc]=(validAvatar(a)?a:DEFAULT_AVATAR).split('|');return {color,face,acc:acc||'none'};}
export function randomAvatar(){return AVATAR_COLORS[Math.floor(Math.random()*AVATAR_COLORS.length)][0]+'|'+AVATAR_FACES[Math.floor(Math.random()*AVATAR_FACES.length)][0];}

// Spelersnamen: 3-16 tekens, letters, cijfers, spatie, - en _
export function cleanName(s){return String(s||'').trim().replace(/\s+/g,' ');}
// ---- Filter op ongepaste namen ----
// Namen worden eerst "platgeslagen": hoofdletters weg, accenten weg, cijfers/tekens als letters
// (n4zi, m00rd, h1tl3r, $ex), en herhaalde letters samengevoegd (kuuut).
// Lange woorden tellen overal in de naam mee; korte woorden alleen als los woord,
// anders vallen gewone namen af (Pikachu, Skill, Bob).
const ANYWHERE=[
  // schelden en ziektes
  'kanker','tering','tyfus','klootzak','mongool','debiel','idioot','sukkel','loser','hufter','etterbak','kakker',
  // seks en lichaam
  'hoertje','hoeren','neuken','geneukt','neukt','pijpen','pijper','tieten','tietjes','borsten','boobs','titties','porno','seks','sexy','penis','vagina','pussy','bitch','whore','slut','hooker','dildo','orgasm','masturb','sperma','condoom','clitor','erotiek','erotic','horny','verkracht','pedofiel','kinderporno','naakt','bloot','stripper','hentai','onlyfans',
  // geweld en dood
  'moord','vermoord','doodmaken','zelfmoord','suicide','murder','killer','terror','bomaanslag','neerschieten','abuse','mishandel','slachten','martelen',
  // haat en discriminatie
  'nazi','hitler','holocaust','heilhitler','siegheil','jodenhaat','jodenhater','racist','racisme','neger','nikker','nigger','nigga','negro','kaffer','spleetoog','chingchong','zandneger','geitenneuker','kutmarokkaan','whitepower','witmacht','ariër','arier','swastika','hakenkruis','flikker','faggot','retard','kkk','isis','taliban','apartheid','genocide','slavernij',
  // drugs en alcohol
  'cocaine','heroine','drugs','dealer','xtc','wodka','dronken',
  // Engelse scheldwoorden
  'fuck','shit','cunt','asshole','bastard','dickhead','motherf','wanker','twat',
  // doen alsof je de beheerder bent
  'admin','moderator','beheerder','official','officieel'
];
const AS_WORD=['fck','fuk','fuq','kut','lul','pik','hoer','slet','neuk','geil','tiet','tits','kont','sex','xxx','porn','cum','dick','cock','fag','homo','lesbo','pedo','kill','dood','bom','wiet','coke','wtf','stfu','anal','anus','rape','nsfw','gloop','mod','staff'];
// Getallencodes: 1488 (nazi), 69 en 420 (seks/drugs) als los getal in de naam.
const BAD_NUMBERS=['69','420','1488'];

const LEET1={'0':'o','1':'i','2':'z','3':'e','4':'a','5':'s','6':'g','7':'t','8':'b','9':'g','@':'a','$':'s','!':'i','€':'e','+':'t','|':'l','(':'c'};
const LEET2={...LEET1,'1':'l','!':'l','6':'b','9':'q'};   // tweede lezing voor twijfelgevallen
const squash=t=>t.replace(/(.)\1+/g,'$1');
const plain=t=>t.normalize('NFD').replace(/[̀-ͯ]/g,'').toLowerCase();
// Splits op spaties/tekens én op hoofdletters (SnelleKut -> snelle, kut).
const splitWords=raw=>raw.replace(/([a-z])([A-Z])/g,'$1 $2').split(/[^\p{L}\p{N}@$!€+|(]+/u).filter(Boolean);

function variants(raw){
  const out=new Set();
  for(const map of [LEET1,LEET2]){
    const conv=t=>plain(t).replace(/./g,c=>map[c]??c).replace(/[^a-z]/g,'');
    const strip=t=>plain(t).replace(/[^a-z]/g,'');     // ook: cijfers gewoon weglaten (kut123)
    for(const f of [conv,strip]){
      const whole=f(raw),words=splitWords(raw).map(f).filter(Boolean);
      out.add({whole,words});
    }
  }
  return [...out];
}
export function isBadName(raw){
  if((raw.match(/\d+/g)||[]).some(n=>BAD_NUMBERS.includes(n)))return true;
  for(const {whole,words} of variants(raw)){
    const wholes=[whole,squash(whole)];
    // samengevoegde vorm alleen vergelijken als die lang genoeg blijft (anders wordt 'kkk' gewoon 'k')
    if(ANYWHERE.some(w=>wholes.some(x=>x.includes(w)||(squash(w).length>=4&&squash(x).includes(squash(w))))))return true;
    if(words.some(t=>AS_WORD.includes(t)||AS_WORD.includes(squash(t))))return true;
    // ook als het korte woord de hele naam is, of de naam ermee begint/eindigt met alleen cijfers ernaast (kut123, 123kut)
    if(AS_WORD.includes(squash(whole)))return true;
  }
  return false;
}
export function nameError(s){
  const n=cleanName(s);
  if(n.length<3)return 'Je naam moet minstens 3 tekens hebben.';
  if(n.length>16)return 'Je naam mag maximaal 16 tekens hebben.';
  if(!/^[\p{L}\p{N} _-]+$/u.test(n))return 'Gebruik alleen letters, cijfers, spaties, - en _.';
  if(isBadName(n))return 'Die naam mag niet. Kies een andere, leuke naam!';
  return '';
}
// Grappige voorbeeldnamen, zodat kinderen geen echte naam hoeven te gebruiken.
const A=['Snelle','Blije','Coole','Gekke','Slimme','Stoere','Vrolijke','Wiebelige','Sterke','Dappere'];
const B=['Kikker','Raket','Slijmbal','Draak','Bubbel','Panda','Vos','Ninja','Gloopie','Tijger'];
const pick=l=>l[Math.floor(Math.random()*l.length)];
export function randomName(){
  for(;;){const n=pick(A)+pick(B)+Math.floor(10+Math.random()*90);if(!nameError(n))return n;}  // max. 16 tekens en altijd toegestaan
}
