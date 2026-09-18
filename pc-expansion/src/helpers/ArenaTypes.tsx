export namespace ArenaTypes {
 export type WeaponKind='sword'|'axe'|'spear'|'dagger'|'hammer';
 export type Slot='weapon'|'helmet'|'armor'|'shield';
 export type Action='light'|'heavy'|'dodge'|'jump'|'special';
 export type State='idle'|'walk'|'light'|'heavy'|'special'|'block'|'dodge'|'hit'|'stagger'|'dead'|'victory';
 export type Style='balanced'|'aggressive'|'guardian'|'duelist'|'brute'|'lancer';
 export interface Item{id:string;name:string;slot:Slot;kind?:WeaponKind;tier:number;price:number;damage:number;defense:number;reach:number;speed:number;color:string;description:string;}
 export interface Save{version:3;name:string;skin:number;banner:number;build:number;level:number;xp:number;gold:number;points:number;cleared:number[];wins:number;losses:number;owned:string[];equipped:Record<Slot,string>;stats:{power:number;vitality:number;endurance:number;agility:number};talents:{guard:number;fury:number;precision:number};sound:boolean;reducedMotion:boolean;}
 export interface Encounter{id:number;name:string;epithet:string;arena:number;style:Style;weapon:string;helmet:string;armor:string;shield:string;hp:number;damage:number;boss:boolean;reward:number;xp:number;skin:number;banner:number;}
 export interface Fighter{
 id:'player'|'enemy';name:string;x:number;y:number;vy:number;vx:number;face:number;hp:number;maxHp:number;stamina:number;maxStamina:number;posture:number;maxPosture:number;rage:number;
 state:State;elapsed:number;duration:number;combo:number;comboWindow:number;landed:boolean;invuln:number;flash:number;walk:number;move:number;blockAge:number;regenDelay:number;dodgeCooldown:number;specialCooldown:number;bleed:number;bleedTick:number;aiClock:number;aiMove:number;aiBlock:boolean;enrage:boolean;
 weapon:Item;helmet:Item;armor:Item;shield:Item;skin:number;banner:number;build:number;power:number;defense:number;speed:number;crit:number;guardSkill:number;furySkill:number;precisionSkill:number;style:Style;
 }
 export interface Point{x:number;y:number;}
 export interface Pose{hip:Point;chest:Point;head:Point;shoulder:Point;elbow:Point;hand:Point;tip:Point;rearElbow:Point;shieldHand:Point;leftKnee:Point;leftFoot:Point;rightKnee:Point;rightFoot:Point;weaponAngle:number;lean:number;}
 export interface Particle{x:number;y:number;vx:number;vy:number;life:number;maxLife:number;size:number;color:string;type:'spark'|'dust'|'blood'|'ring';}
 export interface Float{x:number;y:number;text:string;color:string;life:number;size:number;}
 export interface Event{type:'swing'|'hit'|'block'|'parry'|'break'|'dodge'|'win'|'lose'|'special';power:number;}
 export interface Input{move:number;block:boolean;}
 export interface Result{win:boolean;encounter:number;time:number;damage:number;hits:number;parries:number;maxCombo:number;practice:boolean;}
}
