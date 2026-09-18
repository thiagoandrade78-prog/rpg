import {AssimilationTypes as T} from './AssimilationTypes';
const integer=(v:unknown,min:number,max:number,fallback:number)=>typeof v==='number'&&Number.isFinite(v)?Math.max(min,Math.min(max,Math.floor(v))):fallback;
export class AssimilationEngine {
 static createEmpty():T.Model{return {activeBeastId:null,resonance:[],slots:1};}
 static validate(value:unknown,knownBeastIds:string[]=[]):T.Model{
  if(!value||typeof value!=='object')return this.createEmpty();const v=value as Partial<T.Model>,known=new Set(knownBeastIds),seen=new Set<string>();
  const resonance=(Array.isArray(v.resonance)?v.resonance:[]).flatMap(raw=>{if(!raw||typeof raw!=='object')return[];const r=raw as Partial<T.ResonanceRecord>;if(typeof r.beastId!=='string'||!r.beastId||seen.has(r.beastId)||!known.has(r.beastId))return[];seen.add(r.beastId);const first=integer(r.firstLinkedAt,0,Number.MAX_SAFE_INTEGER,0),last=integer(r.lastLinkedAt,first,Number.MAX_SAFE_INTEGER,first);return [{beastId:r.beastId,bestScore:integer(r.bestScore,0,120,0),firstLinkedAt:first,lastLinkedAt:last}];});
  const active=typeof v.activeBeastId==='string'&&known.has(v.activeBeastId)?v.activeBeastId:null;
  return {activeBeastId:active,resonance,slots:integer(v.slots,1,4,1)};
 }
 static activate(model:T.Model,beastId:string,knownBeastIds:string[],score:number,now=Date.now()):T.Model{
  if(!knownBeastIds.includes(beastId))throw new Error('A fera precisa pertencer ao personagem antes da assimilação.');
  const previous=model.resonance.find(x=>x.beastId===beastId),record:T.ResonanceRecord={beastId,bestScore:Math.max(previous?.bestScore||0,Math.max(0,Math.min(120,Math.round(score)))),firstLinkedAt:previous?.firstLinkedAt||now,lastLinkedAt:now};
  return this.validate({...model,activeBeastId:beastId,resonance:[...model.resonance.filter(x=>x.beastId!==beastId),record]},knownBeastIds);
 }
}
