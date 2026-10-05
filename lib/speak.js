// Voorlezen met de ingebouwde stem van de browser (Web Speech API). Er gaat niets naar onze server.
let voice=null;
function pickVoice(){
  if(typeof speechSynthesis==='undefined')return null;
  const vs=speechSynthesis.getVoices().filter(v=>/^nl/i.test(v.lang));
  return vs.find(v=>v.localService&&/nl-NL/i.test(v.lang))||vs.find(v=>v.localService)||vs[0]||null;
}
export const canSpeak=()=>typeof window!=='undefined'&&'speechSynthesis' in window;
export function speak(text){
  if(!canSpeak())return;
  try{
    speechSynthesis.cancel();
    voice=voice||pickVoice();
    const u=new SpeechSynthesisUtterance(text);
    u.lang='nl-NL';u.rate=.95;u.pitch=1.1;if(voice)u.voice=voice;
    speechSynthesis.speak(u);
  }catch(e){}
}
export function stopSpeaking(){if(canSpeak())try{speechSynthesis.cancel();}catch(e){}}
if(canSpeak())try{speechSynthesis.onvoiceschanged=()=>{voice=pickVoice();};}catch(e){}
