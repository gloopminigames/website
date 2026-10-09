// Tekent iemands eigen Gloop (kleur, gezicht en spulletje) als SVG-tekst.
import {blob} from './blob';
import {parseAvatar} from './accountRules';
export function avatarSvg(avatar,cls){const a=parseAvatar(avatar);return blob(a.color,a.face,cls,false,a.acc,a.bg);}
