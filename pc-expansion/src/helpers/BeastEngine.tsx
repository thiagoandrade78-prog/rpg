import {BeastTypes as T} from './BeastTypes';
const clamp=(n:number,a:number,b:number)=>Math.max(a,Math.min(b,n));
const integer=(v:unknown,min:number,max:number,fallback:number)=>typeof v==='number'&&Number.isFinite(v)?clamp(Math.floor(v),min,max):fallback;
export class BeastEngine {
 static createEmpty():T.Model{return {collection:[],discoveredSpecies:[]};}
 static validate(value:unknown):T.Model {
  if(!value||typeof value!=='object')return this.createEmpty();const v=value as Partial<T.Model>,seen=new Set<string>();
  const collection=(Array.isArray(v.collection)?v.collection:[]).flatMap(raw=>{if(!raw||typeof raw!=='object')return[];const b=raw as Partial<T.Individual>;if(typeof b.id!=='string'||!b.id||seen.has(b.id)||typeof b.species!=='string'||!b.species)return[];seen.add(b.id);const primordial=integer(b.bloodline?.primordial,0,100,0);return [{id:b.id.slice(0,120),species:b.species.slice(0,80),name:typeof b.name==='string'&&b.name?b.name.slice(0,60):b.species.slice(0,60),level:integer(b.level,1,999,1),xp:integer(b.xp,0,999999999,0),affinity:integer(b.affinity,0,100,0),potential:integer(b.potential,0,100,50),bloodline:{base:integer(b.bloodline?.base,0,100,100-primordial),primordial},mastery:integer(b.mastery,0,5,0),evolution:integer(b.evolution,0,99,0),bonded:b.bonded!==false,capturedAt:integer(b.capturedAt,0,Number.MAX_SAFE_INTEGER,0)} as T.Individual];});
  const discoveredSpecies=Array.from(new Set([...(Array.isArray(v.discoveredSpecies)?v.discoveredSpecies.filter(x=>typeof x==='string'):[]),...collection.map(x=>x.species)]));return {collection,discoveredSpecies};
 }
 static add(model:T.Model,individual:T.Individual):T.Model{if(model.collection.some(x=>x.id===individual.id))return model;return this.validate({collection:[...model.collection,individual],discoveredSpecies:[...model.discoveredSpecies,individual.species]});}
}
