let t;
export function toast(msg){const el=typeof document!=='undefined'&&document.getElementById('toast');if(!el)return;el.textContent=msg;el.classList.add('show');clearTimeout(t);t=setTimeout(()=>el.classList.remove('show'),2400);}
