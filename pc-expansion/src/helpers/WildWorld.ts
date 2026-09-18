import {ArenaSaveTypes as R} from './ArenaSaveTypes';
import {BeastEngine as B} from './BeastEngine';
import {CultivationEngine as C} from './CultivationEngine';
import {WildCheckpoint,WildOutcome,WildProgress,WildResolution,WildTicket} from './WildTypes';
export interface WildRegion {id:string;name:string;tag:string;description:string;landscape:'forest'|'volcano'|'peaks'|'ruins';color:string;minimum:number;arenaUnlock:number;danger:number;levels:[number,number];species:{id:string;weight:number}[];}
export const WildRegions:readonly WildRegion[]=[
 {id:'bosque',name:'Bosque Viridiano',tag:'I · ALÉM DOS PORTÕES',description:'Raízes antigas e riachos de Nácar. Siga os rastros até uma clareira; o vínculo precisa ser conquistado.',landscape:'forest',color:'#4f8a61',minimum:0,arenaUnlock:-1,danger:1,levels:[1,3],species:[{id:'thornstag',weight:35},{id:'tideclaw',weight:40},{id:'pyrofang',weight:25}]},
 {id:'rubras',name:'Terras Rubras',tag:'II · BRASA E PEDRA',description:'A caldeira encontra a Planície Dourada. Entre rochas quentes, carapaças e jubas guardam o caminho.',landscape:'volcano',color:'#bd633c',minimum:2,arenaUnlock:3,danger:2,levels:[3,5],species:[{id:'pyrofang',weight:45},{id:'stoneback',weight:40},{id:'sunmane',weight:15}]},
 {id:'picos',name:'Picos da Tormenta',tag:'III · O CÉU TROVEJA',description:'Uma trilha de altitude sobre o Lago Nebuloso. Aves cortam as nuvens; ecos dracônicos se aproximam.',landscape:'peaks',color:'#5e8fba',minimum:4,arenaUnlock:7,danger:3,levels:[5,7],species:[{id:'stormhawk',weight:50},{id:'stoneback',weight:30},{id:'mistwyrm',weight:20}]},
 {id:'eclipse',name:'Ruínas do Eclipse',tag:'IV · A ÚLTIMA VIGÍLIA',description:'Pilares partidos cercam um lago imóvel. Os predadores da noite percebem cada movimento seu.',landscape:'ruins',color:'#9376bb',minimum:6,arenaUnlock:11,danger:4,levels:[7,9],species:[{id:'nightlynx',weight:55},{id:'mistwyrm',weight:30},{id:'sunmane',weight:15}]}
];
const outcomes:WildOutcome[]=['captured','defeated','escaped','retreated','lost'];
const int=(v:unknown,min:number,max:number,f=0)=>typeof v==='number'&&Number.isFinite(v)?Math.max(min,Math.min(max,Math.floor(v))):f;
const num=(v:unknown,min:number,max:number,f=0)=>typeof v==='number'&&Number.isFinite(v)?Math.max(min,Math.min(max,v)):f;
const object=(v:unknown):Record<string,any>=>v&&typeof v==='object'&&!Array.isArray(v)?v as Record<string,any>:{};
export function wildHash(s:string){let h=2166136261;for(let i=0;i<s.length;i++){h^=s.charCodeAt(i);h=Math.imul(h,16777619);}return h>>>0;}
export function wildRandom(seed:number){let a=seed>>>0;return()=>{a=(Math.imul(a,1664525)+1013904223)>>>0;return a/4294967296;};}
/** Owns expedition tickets and once-only rewards. Simulation never writes storage. */
export class WildWorld {
 static readonly version=1;
 static region(id:string){return WildRegions.find(r=>r.id===id);}
 static empty():WildProgress{return {version:1,serial:0,successes:0,captures:0,defeats:0,pending:null,history:[]};}
 static state(save:R.SaveV5){return save.world.exploration||this.empty();}
 static available(save:R.SaveV5,region:string){const r=this.region(region);return !!r&&C.isAwakened(save.cultivation)&&(this.state(save).successes>=r.minimum||(r.arenaUnlock>=0&&save.world.clearedArenaEncounters.includes(r.arenaUnlock)));}
 static requirement(save:R.SaveV5,region:string){const r=this.region(region);if(!r)return 'Região desconhecida.';if(!C.isAwakened(save.cultivation))return 'Desperte seu núcleo no Santuário Interior.';if(this.available(save,region))return 'Rota disponível';return `${r.minimum} expedições vencidas (${this.state(save).successes}/${r.minimum}) ou campeão da arena ${Math.floor(r.arenaUnlock/4)+1}.`;}
 static maxHp(ticket:WildTicket){return 75+ticket.level*14+(B.species(ticket.species)?.archetype==='Guardião'?25:0);}
 static rewards(ticket:WildTicket,outcome:WildOutcome){const d=this.region(ticket.region)!.danger,success=outcome==='captured'||outcome==='defeated';return {gold:success?18+d*8:0,essence:success?12+d*6:0};}
 static checkpoint(raw:unknown,ticket:WildTicket):WildCheckpoint|null {
  const v=object(raw);if(!Object.keys(v).length)return null;const p=object(v.player),b=object(v.beast);
  const outcome=outcomes.includes(v.outcome)?v.outcome:null;
  const phase=v.phase==='resolved'&&outcome?'resolved':v.phase==='duel'?'duel':'combat';
  return {player:{hp:num(p.hp,0,5000,160),stamina:num(p.stamina,0,1000,110),posture:num(p.posture,0,1000,96),rage:num(p.rage,0,100,0),x:num(p.x,65,1215,400)},beast:{hp:num(b.hp,0,this.maxHp(ticket),this.maxHp(ticket)),will:num(b.will,0,100,100),x:num(b.x,100,1180,800)},elapsed:num(v.elapsed,0,1800,0),rejections:int(v.rejections,0,3),phase,seals:Array.isArray(v.seals)?v.seals.slice(0,3).map((x:unknown)=>num(x,0,100)):[],needleTime:num(v.needleTime,0,10),rngState:int(v.rngState,0,4294967295,wildHash(ticket.id)),outcome};
 }
 static validate(raw:unknown):WildProgress {
  const v=object(raw),out=this.empty();out.serial=int(v.serial,0,1000000000);out.successes=int(v.successes,0,out.serial);out.captures=int(v.captures,0,out.successes);out.defeats=int(v.defeats,0,out.successes);
  const t=object(v.pending),r=this.region(t.region),individual=B.validate({collection:[t.individual]}).collection[0];
  if(r&&typeof t.id==='string'&&t.id.length<=150&&t.id&&typeof t.species==='string'&&r.species.some(s=>s.id===t.species)&&individual&&individual.species===t.species&&Number.isSafeInteger(t.serial)&&t.serial>=1&&t.serial<=out.serial){
   const ticket:WildTicket={id:t.id,serial:t.serial,region:r.id,species:t.species,individual:{...individual,origin:'wild',bonded:false},level:int(t.level,r.levels[0],r.levels[1],r.levels[0]),openedAt:int(t.openedAt,0,Number.MAX_SAFE_INTEGER),checkpoint:null};
   ticket.individual.level=ticket.level;ticket.checkpoint=this.checkpoint(t.checkpoint,ticket);out.pending=ticket;
  }
  const seen=new Set<string>();out.history=(Array.isArray(v.history)?v.history:[]).slice(-16).flatMap((e:any)=>{if(!e||typeof e.id!=='string'||seen.has(e.id)||!this.region(e.region)||!B.species(e.species)||!outcomes.includes(e.outcome))return[];seen.add(e.id);return [{id:e.id.slice(0,150),region:e.region,species:e.species,outcome:e.outcome,at:int(e.at,0,Number.MAX_SAFE_INTEGER),name:typeof e.name==='string'?e.name.slice(0,60):B.species(e.species)!.name}];});
  return out;
 }
 static open(save:R.SaveV5,region:string,now=Date.now()):{save:R.SaveV5;ticket:WildTicket}{
  if(!Number.isSafeInteger(now)||now<0)throw new Error('Relógio inválido.');
  const state=this.state(save);if(state.pending)throw new Error('Retome ou encerre a expedição pendente antes de iniciar outra.');
  if(!this.available(save,region))throw new Error(this.requirement(save,region));
  if(save.beasts.collection.length>=B.capacity)throw new Error('Santuário completo (128 indivíduos). Nenhuma expedição iniciada.');
  if(state.serial>=1000000000)throw new Error('Limite de expedições atingido.');
  const r=this.region(region)!,serial=state.serial+1,seed=`${save.meta.saveId}|${save.character.id}|wild|${serial}|${region}`,random=wildRandom(wildHash(seed));
  let roll=random()*r.species.reduce((n,x)=>n+x.weight,0),species=r.species[r.species.length-1].id;
  for(const entry of r.species){roll-=entry.weight;if(roll<0){species=entry.id;break;}}
  const level=r.levels[0]+Math.floor(random()*(r.levels[1]-r.levels[0]+1));
  const individual={...B.generate(species,seed,now),id:`wild-${save.meta.saveId}-${serial}`,level,affinity:8,origin:'wild' as const,bonded:false};
  const ticket:WildTicket={id:`expedition-${save.meta.saveId}-${serial}`,serial,region,species,individual,level,openedAt:now,checkpoint:null};
  const beasts={...save.beasts,discoveredSpecies:Array.from(new Set([...save.beasts.discoveredSpecies,species]))};
  return {ticket,save:{...save,beasts,world:{...save.world,exploration:{...state,serial,pending:ticket}},meta:{...save.meta,updatedAt:Math.max(save.meta.updatedAt,now)}}};
 }
 static update(save:R.SaveV5,id:string,checkpoint:WildCheckpoint):R.SaveV5{
  const state=this.state(save),ticket=state.pending;if(!ticket||ticket.id!==id)throw new Error('Expedição expirada ou já encerrada.');
  const next=this.checkpoint(checkpoint,ticket);if(!next)throw new Error('Registro de combate inválido.');
  return {...save,world:{...save.world,exploration:{...state,pending:{...ticket,checkpoint:next}}}};
 }
 static finish(save:R.SaveV5,result:WildResolution,now=Date.now()):{save:R.SaveV5;gold:number;essence:number;captured:string|null}{
  const state=this.state(save),t=state.pending;if(!t||result.ticketId!==t.id)throw new Error('Esta expedição já foi encerrada ou não pertence ao save.');
  if(!Number.isSafeInteger(now)||now<0||!outcomes.includes(result.outcome))throw new Error('Resultado inválido.');
  const cp=this.checkpoint(result.checkpoint,t);if(!cp||cp.phase!=='resolved'||cp.outcome!==result.outcome)throw new Error('O combate não possui um resultado terminal válido.');
  if(result.outcome==='captured'){
   const core=save.cultivation.core,species=B.species(t.species)!,realm=Math.max(0,C.realms.indexOf(save.cultivation.realm));
   const bonus=(core.nature===species.nature?8:0)+(core.archetype===species.archetype?5:0)+Math.min(12,realm*3)+(1-cp.beast.hp/this.maxHp(t))*10;
   const score=cp.seals.reduce((a,b)=>a+b,0)/3+bonus;
   if(!C.isAwakened(save.cultivation)||cp.player.hp<=0||cp.beast.hp<=0||cp.beast.hp>this.maxHp(t)*.4||cp.beast.will>60||cp.seals.length!==3||score<60||cp.rejections>=3)throw new Error('O pacto não foi concluído.');
  }
  if(result.outcome==='defeated'&&cp.beast.hp>0)throw new Error('A fera ainda está de pé.');
  if(result.outcome==='lost'&&cp.player.hp>0)throw new Error('O gladiador ainda está de pé.');
  let beasts=save.beasts;let captured:string|null=null;
  if(result.outcome==='captured'){
   if(beasts.collection.some(b=>b.id===t.individual.id))throw new Error('Este indivíduo já pertence ao santuário.');
   const b={...t.individual,bonded:true,capturedAt:Math.max(now,t.openedAt),careReadyAt:Math.max(now,t.openedAt),origin:'wild' as const};
   beasts=B.add(beasts,b);captured=b.id;
  }
  const rewards=this.rewards(t,result.outcome),success=result.outcome==='captured'||result.outcome==='defeated';
  const history=[...state.history,{id:t.id,region:t.region,species:t.species,name:t.individual.name,outcome:result.outcome,at:Math.max(now,t.openedAt)}].slice(-16);
  const exploration:WildProgress={...state,pending:null,successes:state.successes+(success?1:0),captures:state.captures+(captured?1:0),defeats:state.defeats+(result.outcome==='defeated'?1:0),history};
  return {...rewards,captured,save:{...save,beasts,character:{...save.character,gold:Math.min(9999999,save.character.gold+rewards.gold)},cultivation:{...save.cultivation,essence:Math.min(999999999,save.cultivation.essence+rewards.essence)},world:{...save.world,exploration},meta:{...save.meta,updatedAt:Math.max(save.meta.updatedAt,now)}}};
 }
}
