import {BeastEngine as B} from './BeastEngine';
import {BeastAnatomy} from './BeastSpecies';
export type WildState='idle'|'walk'|'windup'|'strike'|'recover'|'stagger'|'guard'|'calm'|'dead';
export interface WildActor {species:string;x:number;y:number;face:number;hp:number;maxHp:number;will:number;state:WildState;elapsed:number;duration:number;walk:number;flash:number;scale:number;}
export interface WildZone {x:number;y:number;r:number;multiplier:number;}
const anatomy=(a:WildActor)=>B.species(a.species)!.anatomy;
const configs:Record<BeastAnatomy,{torso:[number,number,number];head:[number,number,number];scale:number;speed:number;windup:number;recovery:number;damage:number;pattern:'pounce'|'charge'|'dive'|'breath'|'swipe'}>={
 wolf:{torso:[-8,-67,37],head:[78,-84,24],scale:1.15,speed:160,windup:.72,recovery:1.05,damage:15,pattern:'pounce'},
 raptor:{torso:[14,-87,27],head:[47,-130,19],scale:1.18,speed:190,windup:.9,recovery:1.1,damage:16,pattern:'dive'},
 tortoise:{torso:[-6,-68,54],head:[96,-44,21],scale:1.12,speed:88,windup:1.0,recovery:1.65,damage:22,pattern:'charge'},
 salamander:{torso:[0,-39,28],head:[100,-41,26],scale:1.12,speed:172,windup:.75,recovery:1.25,damage:13,pattern:'pounce'},
 stag:{torso:[-7,-66,37],head:[81,-130,23],scale:1.07,speed:152,windup:1.05,recovery:1.55,damage:19,pattern:'charge'},
 lynx:{torso:[-8,-67,36],head:[78,-84,24],scale:1.12,speed:208,windup:.62,recovery:.92,damage:14,pattern:'pounce'},
 lion:{torso:[-8,-67,38],head:[65,-86,30],scale:1.4,speed:110,windup:1.0,recovery:1.6,damage:26,pattern:'swipe'},
 wyrm:{torso:[-2,-71,34],head:[99,-86,24],scale:1.18,speed:122,windup:1.15,recovery:1.65,damage:18,pattern:'breath'}
};
/** Shared actor-space geometry. Rendering and weapon hurtboxes share this root transform. */
export class WildRig {
 static config(species:string){const s=B.species(species);if(!s)throw new Error('Anatomia desconhecida.');return configs[s.anatomy];}
 static root(a:WildActor){
  const attack=a.state==='strike',windup=a.state==='windup',p=Math.min(1,a.elapsed/Math.max(.01,a.duration));
  let x=0,y=a.state==='walk'?Math.sin(a.walk*2)*1.8:Math.sin(a.walk)*.8,angle=0;
  if(windup){x=-Math.sin(p*Math.PI*.5)*9;angle=anatomy(a)==='stag'?p*.14:0;}
  if(attack){x=Math.sin(p*Math.PI)*16;angle=anatomy(a)==='stag'?.15:anatomy(a)==='raptor'?.22:0;}
  if(a.state==='stagger'){x=-8;angle=-.07;}
  if(a.state==='dead'){angle=-Math.min(1,p)*1.18;y=12;}
  return {x,y,angle};
 }
 static local(a:WildActor,x:number,y:number){const root=this.root(a),s=a.scale*.84,cos=Math.cos(root.angle),sin=Math.sin(root.angle);return{x:a.x+(root.x+x*cos-y*sin)*s*a.face,y:a.y+(root.y+x*sin+y*cos)*s};}
 static zones(a:WildActor):WildZone[]{const cfg=this.config(a.species),z=[{v:cfg.torso,multiplier:1},{v:cfg.head,multiplier:1.16}];return z.map(({v,multiplier})=>({...this.local(a,v[0],v[1]),r:v[2]*a.scale*.84,multiplier}));}
 static contact(a:WildActor){const cfg=this.config(a.species),h=cfg.head,low=anatomy(a)==='raptor'?90:anatomy(a)==='stag'?60:0;return {...this.local(a,h[0]+(anatomy(a)==='salamander'?-10:24),h[1]+low),r:24*a.scale};}
 static scale(species:string){return this.config(species).scale;}
}
