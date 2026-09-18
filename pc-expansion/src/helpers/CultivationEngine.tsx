import {CultivationTypes as T} from './CultivationTypes';

const NATURES:T.Nature[]=['Fogo','Água','Terra','Vento','Raio','Solar','Umbral','Natureza'];
const ARCHETYPES:T.Archetype[]=['Predador','Guardião','Duelista','Colosso','Arcano','Espírito'];
const ASPECTS:T.Aspect[]=['Voraz','Sereno','Primordial','Tempestuoso','Lunar','Solar','Abissal','Ancestral','Indomável','Harmônico'];
const QUALITIES:T.Quality[]=['Comum','Refinado','Raro','Épico','Lendário','Mítico'];
const INNATES=['Fluxo Duplo','Coração Feroz','Muralha Interior','Passo Etéreo','Eco Ancestral','Convergência','Sangue Desperto','Olho Espiritual','Reservatório Profundo','Ressonância Nata'];
const REALMS:T.Realm[]=['dormant','Desperto','Condensado','Espiritual','Ascendente','Celestial','Soberano','Transcendente'];
const integer=(v:unknown,min:number,max:number,fallback:number)=>typeof v==='number'&&Number.isFinite(v)?Math.max(min,Math.min(max,Math.floor(v))):fallback;
function hash(seed:string){let h=2166136261>>>0;for(let i=0;i<seed.length;i++){h^=seed.charCodeAt(i);h=Math.imul(h,16777619)>>>0;}return h>>>0;}
function random(seed:string){let a=hash(seed)||1;return()=>{a|=0;a=a+0x6D2B79F5|0;let t=a;t=Math.imul(t^t>>>15,t|1);t^=t+Math.imul(t^t>>>7,t|61);return((t^t>>>14)>>>0)/4294967296;};}

/** Pure cultivation domain. No timers, storage, rendering or combat dependencies. */
export class CultivationEngine {
 static readonly natures=NATURES;
 static readonly archetypes=ARCHETYPES;
 static readonly qualities=QUALITIES;
 static readonly realms=REALMS.slice(1);
 static generateCore(seed:string):T.Core {
  const r=random(seed),pick=<V,>(values:V[])=>values[Math.floor(r()*values.length)];
  const z=r(),qualityRank=z<.45?1:z<.72?2:z<.88?3:z<.96?4:z<.992?5:6;
  const nature=pick(NATURES),aspect=pick(ASPECTS);
  return {id:`core-${hash(seed).toString(36)}`,name:`Núcleo ${aspect} de ${nature}`,nature,archetype:pick(ARCHETYPES),aspect,quality:QUALITIES[qualityRank-1],qualityRank,innate:pick(INNATES),channels:6+Math.floor(r()*7),seed,awakenedAt:null};
 }
 static create(seed:string,now=Date.now()):T.Model {
  const time=integer(now,0,Number.MAX_SAFE_INTEGER,0);
  return {core:this.generateCore(seed),realm:'dormant',star:0,essence:0,meridians:Array.from({length:12},(_,id)=>({id,open:false,refined:false})),totalCultivated:0,timestamps:{createdAt:time,lastActiveAt:time,lastCultivatedAt:time,offlineAccrualCursor:time}};
 }
 static isAwakened(model:T.Model){return model.core.awakenedAt!==null||model.realm!=='dormant';}
 /** Reveal the already-generated core. NEVER reroll using the current date or player name. */
 static awaken(model:T.Model,now=Date.now()):T.Model {
  if(this.isAwakened(model))return model;
  const time=Math.max(model.timestamps.createdAt,model.timestamps.lastActiveAt,integer(now,0,Number.MAX_SAFE_INTEGER,model.timestamps.createdAt));
  const initiallyOpen=Math.max(1,Math.min(7,model.core.channels-5));
  return {...model,core:{...model.core,awakenedAt:time},realm:'Desperto',star:1,
   meridians:model.meridians.map(m=>({...m,open:m.open||m.id<initiallyOpen})),
   timestamps:{...model.timestamps,lastActiveAt:time,lastCultivatedAt:Math.max(model.timestamps.lastCultivatedAt,time),offlineAccrualCursor:Math.max(model.timestamps.offlineAccrualCursor,time)}};
 }
 static validate(value:unknown,seed:string,now=Date.now()):T.Model {
  const base=this.create(seed,now);if(!value||typeof value!=='object')return base;
  const v=value as Partial<T.Model>,c=v.core&&typeof v.core==='object'?v.core as Partial<T.Core>:base.core;
  const nature=NATURES.includes(c.nature as T.Nature)?c.nature as T.Nature:base.core.nature;
  const archetype=ARCHETYPES.includes(c.archetype as T.Archetype)?c.archetype as T.Archetype:base.core.archetype;
  const aspect=ASPECTS.includes(c.aspect as T.Aspect)?c.aspect as T.Aspect:base.core.aspect;
  const quality=QUALITIES.includes(c.quality as T.Quality)?c.quality as T.Quality:base.core.quality;
  let realm=REALMS.includes(v.realm as T.Realm)?v.realm as T.Realm:'dormant';
  const rawMer=Array.isArray(v.meridians)?v.meridians:[];
  const meridians=Array.from({length:12},(_,id)=>{const m=rawMer.find(x=>x&&typeof x==='object'&&x.id===id);return {id,open:m?.open===true,refined:m?.open===true&&m?.refined===true};});
  const ts=v.timestamps&&typeof v.timestamps==='object'?v.timestamps as Partial<T.Timestamps>:{};
  const createdAt=integer(ts.createdAt,0,Number.MAX_SAFE_INTEGER,base.timestamps.createdAt);
  const lastActiveAt=integer(ts.lastActiveAt,createdAt,Number.MAX_SAFE_INTEGER,createdAt);
  const lastCultivatedAt=integer(ts.lastCultivatedAt,createdAt,Number.MAX_SAFE_INTEGER,createdAt);
  const offlineAccrualCursor=integer(ts.offlineAccrualCursor,createdAt,Number.MAX_SAFE_INTEGER,lastCultivatedAt);
  let awakenedAt=c.awakenedAt===null||c.awakenedAt===undefined?null:integer(c.awakenedAt,createdAt,Number.MAX_SAFE_INTEGER,createdAt);
  if(realm!=='dormant'&&awakenedAt===null)awakenedAt=createdAt;
  if(awakenedAt!==null&&realm==='dormant')realm='Desperto';
  return {core:{id:typeof c.id==='string'&&c.id?c.id.slice(0,120):base.core.id,name:typeof c.name==='string'&&c.name?c.name.slice(0,80):`Núcleo ${aspect} de ${nature}`,nature,archetype,aspect,quality,qualityRank:QUALITIES.indexOf(quality)+1,innate:typeof c.innate==='string'&&c.innate?c.innate.slice(0,80):base.core.innate,channels:integer(c.channels,1,12,base.core.channels),seed:typeof c.seed==='string'&&c.seed?c.seed.slice(0,240):seed,awakenedAt},realm,star:realm==='dormant'?0:integer(v.star,1,5,1),essence:integer(v.essence,0,999999999,0),meridians,totalCultivated:integer(v.totalCultivated,0,999999999,0),timestamps:{createdAt,lastActiveAt,lastCultivatedAt,offlineAccrualCursor}};
 }
 static touch(model:T.Model,now=Date.now()):T.Model {return {...model,timestamps:{...model.timestamps,lastActiveAt:Math.max(model.timestamps.createdAt,model.timestamps.lastActiveAt,integer(now,0,Number.MAX_SAFE_INTEGER,model.timestamps.lastActiveAt))}};}
}
