// Regels voor accounts, gedeeld door browser en server.

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

// Spelersnamen: 3-16 tekens, letters, cijfers, spatie, - en _
export function cleanName(s){return String(s||'').trim().replace(/\s+/g,' ');}
const BAD=['kut','lul','hoer','kanker','tering','tyfus','fuck','shit','bitch','nazi','hitler','sex','seks','porn','neuk','pik','slet','homo','admin','gloop','moderator'];
export function nameError(s){
  const n=cleanName(s);
  if(n.length<3)return 'Je naam moet minstens 3 tekens hebben.';
  if(n.length>16)return 'Je naam mag maximaal 16 tekens hebben.';
  if(!/^[\p{L}\p{N} _-]+$/u.test(n))return 'Gebruik alleen letters, cijfers, spaties, - en _.';
  // Lange woorden tellen overal in de naam mee, korte alleen als los woord (anders valt bijv. 'Lulu' af).
  const low=n.toLowerCase(),flat=low.replace(/[^\p{L}]/gu,''),words=low.split(/[^\p{L}]+/u);
  if(BAD.some(w=>w.length>=5?flat.includes(w):words.includes(w)))return 'Kies een andere naam.';
  return '';
}
// Grappige voorbeeldnamen, zodat kinderen geen echte naam hoeven te gebruiken.
const A=['Snelle','Blije','Coole','Gekke','Slimme','Stoere','Vrolijke','Wiebelige','Sterke','Dappere'];
const B=['Kikker','Raket','Slijmbal','Draak','Bubbel','Panda','Vos','Ninja','Gloopie','Tijger'];
export function randomName(){return A[Math.floor(Math.random()*A.length)]+B[Math.floor(Math.random()*B.length)]+Math.floor(10+Math.random()*90);}
