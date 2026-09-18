import {BeastTypes as T} from './BeastTypes';
import {BeastSpecies} from './BeastSpecies';
const integer=(v:unknown,min:number,max:number,fallback:number)=>typeof v==='number'&&Number.isFinite(v)?Math.max(min,Math.min(max,Math.floor(v))):fallback;
const text=(v:unknown,n:number,fallback='')=>typeof v==='string'?v.trim().slice(0,n)||fallback:fallback;
const TEMPERAMENTS:T.Temperament[]=['Vigilante','Sereno','Curioso','Altivo','Tenaz'];
function hash(s:string){let n=2166136261;for(let i=0;i<s.length;i++){n^=s.charCodeAt(i);n=Math.imul(n,16777619);}return n>>>0;}
function random(seed:string){let a=hash(seed);return()=>{a|=0;a=a+0x6D2B79F5|0;let t=a;t=Math.imul(t^t>>>15,t|1);t^=t+Math.imul(t^t>>>7,t|61);return((t^t>>>14)>>>0)/4294967296;};}
/** Pure collection operations. Unknown future species are preserved, never silently removed. */
export class BeastEngine {
 static readonly capacity=128;
 static createEmpty():T.Model{return {collection:[],discoveredSpecies:[]};}
 static species(id:string){return BeastSpecies.find(s=>s.id===id);}
 static sanctuary(model:T.Model):T.Sanctuary {return model.sanctuary||{starterClaimed:model.collection.length>0,companionId:null,training:null};}
 static generate(species:string,seed:string,now:number):T.Individual {
  const s=this.species(species);if(!s)throw new Error('Espécie não catalogada.');
  const r=random(seed+'|'+species),primordial=Math.floor(r()*25),potential=55+Math.floor(r()*41);
  return {id:`beast-${hash(seed+'|'+species).toString(36)}`,species,name:s.name,level:1,xp:0,affinity:10,potential,bloodline:{base:100-primordial,primordial},mastery:0,evolution:0,bonded:true,capturedAt:integer(now,0,Number.MAX_SAFE_INTEGER,0),seed,temperament:TEMPERAMENTS[Math.floor(r()*TEMPERAMENTS.length)],careReadyAt:integer(now,0,Number.MAX_SAFE_INTEGER,0),origin:'sanctuary'};
 }
 static validate(value:unknown):T.Model {
  if(!value||typeof value!=='object'||Array.isArray(value))return this.createEmpty();
  const v=value as Partial<T.Model>,seen=new Set<string>();
  const collection=(Array.isArray(v.collection)?v.collection:[]).flatMap(raw=>{
   if(!raw||typeof raw!=='object'||Array.isArray(raw))return[];
   const b=raw as Partial<T.Individual>,id=text(b.id,120),species=text(b.species,80);
   if(!id||!species||seen.has(id))return[];seen.add(id);
   const primordial=integer(b.bloodline?.primordial,0,100,0);
   const out:T.Individual={id,species,name:text(b.name,60,this.species(species)?.name||species),level:integer(b.level,1,999,1),xp:integer(b.xp,0,999999999,0),affinity:integer(b.affinity,0,100,0),potential:integer(b.potential,0,100,50),bloodline:{base:100-primordial,primordial},mastery:integer(b.mastery,0,5,0),evolution:integer(b.evolution,0,99,0),bonded:b.bonded!==false,capturedAt:integer(b.capturedAt,0,Number.MAX_SAFE_INTEGER,0)};
   if(typeof b.seed==='string')out.seed=text(b.seed,240);
   if(b.temperament&&TEMPERAMENTS.includes(b.temperament))out.temperament=b.temperament;
   if(b.careReadyAt!==undefined)out.careReadyAt=integer(b.careReadyAt,out.capturedAt,Number.MAX_SAFE_INTEGER,out.capturedAt);
   if(b.origin==='sanctuary'||b.origin==='wild'||b.origin==='legacy')out.origin=b.origin;
   return [out];
  });
  const discoveredSpecies=Array.from(new Set([...(Array.isArray(v.discoveredSpecies)?v.discoveredSpecies.map(x=>text(x,80)).filter(Boolean):[]),...collection.map(x=>x.species)]));
  const result:T.Model={collection,discoveredSpecies};
  if(v.sanctuary&&typeof v.sanctuary==='object'){
   const state=v.sanctuary,t=state.training,known=new Set(collection.map(x=>x.id));let training:T.Training|null=null;
   if(t&&known.has(t.beastId)&&typeof t.startedAt==='number'&&Number.isFinite(t.startedAt)&&typeof t.endsAt==='number'&&Number.isFinite(t.endsAt)&&t.endsAt>=t.startedAt&&t.endsAt-t.startedAt<=30000){
    training={beastId:t.beastId,startedAt:integer(t.startedAt,0,Number.MAX_SAFE_INTEGER,0),endsAt:integer(t.endsAt,0,Number.MAX_SAFE_INTEGER,0),xp:integer(t.xp,0,500,0),affinity:integer(t.affinity,0,3,0)};
   }
   result.sanctuary={starterClaimed:state.starterClaimed===true||collection.length>0,companionId:typeof state.companionId==='string'&&known.has(state.companionId)?state.companionId:null,training};
  }
  return result;
 }
 static add(model:T.Model,individual:T.Individual):T.Model {
  if(model.collection.some(x=>x.id===individual.id))return model;
  if(model.collection.length>=this.capacity)throw new Error('Santuário completo (128 indivíduos).');
  return this.validate({...model,collection:[...model.collection,individual],discoveredSpecies:[...model.discoveredSpecies,individual.species]});
 }
 static xpRequired(level:number){return 60+Math.max(0,level-1)*25;}
 static gainXp(beast:T.Individual,xp:number):T.Individual {
  if(beast.level>=50)return beast;
  let level=beast.level,total=beast.xp+integer(xp,0,500,0);
  while(level<50&&total>=this.xpRequired(level)){total-=this.xpRequired(level);level++;}
  return {...beast,level,xp:level>=50?0:total};
 }
}
