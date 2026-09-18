import {WildWorld} from './WildWorld';
import {ArenaData} from './ArenaData';
import {ArenaTypes as Legacy} from './ArenaTypes';
import {ArenaSaveTypes as T} from './ArenaSaveTypes';
import {ArenaCharacterAdapter} from './ArenaCharacterAdapter';
import {CultivationEngine} from './CultivationEngine';
import {BeastEngine} from './BeastEngine';
import {AssimilationEngine} from './AssimilationEngine';
const clamp=(n:number,a:number,b:number)=>Math.max(a,Math.min(b,n));
const integer=(v:unknown,min:number,max:number,fallback:number)=>typeof v==='number'&&Number.isFinite(v)?clamp(Math.floor(v),min,max):fallback;
function hash(value:string){let h=2166136261>>>0;for(let i=0;i<value.length;i++){h^=value.charCodeAt(i);h=Math.imul(h,16777619)>>>0;}return h.toString(36);}
function bytesEncode(value:string){return btoa(Array.from(new TextEncoder().encode(value),b=>String.fromCharCode(b)).join(''));}
function bytesDecode(value:string){const raw=atob(value);return new TextDecoder().decode(Uint8Array.from(raw,c=>c.charCodeAt(0)));}
export class ArenaSaveV5 {
 static readonly KEY='arena-save-v5';static readonly LEGACY_KEY='arena-save-v3';static readonly RECOVERY_KEY='arena-save-v5-recovery';
 static readonly STAGE4_BACKUP_KEY='arena-save-v5-before-stage-4';
 static checkpointStage4(){const raw=localStorage.getItem(this.KEY);if(raw&&!localStorage.getItem(this.STAGE4_BACKUP_KEY))localStorage.setItem(this.STAGE4_BACKUP_KEY,raw);}
 static readonly STAGE3_BACKUP_KEY='arena-save-v5-before-stage-3';
 static checkpointStage3(){const raw=localStorage.getItem(this.KEY);if(raw&&!localStorage.getItem(this.STAGE3_BACKUP_KEY))localStorage.setItem(this.STAGE3_BACKUP_KEY,raw);}
 static readonly STAGE2_BACKUP_KEY='arena-save-v5-before-stage-2';
 static checkpointStage2(){const raw=localStorage.getItem(this.KEY);if(raw&&!localStorage.getItem(this.STAGE2_BACKUP_KEY))localStorage.setItem(this.STAGE2_BACKUP_KEY,raw);}
 static readonly STAGE1_BACKUP_KEY='arena-save-v5-before-stage-1';
 /** A one-time byte-for-byte checkpoint of the previous v5 file, never overwritten. */
 static checkpointStage1(){
  const raw=localStorage.getItem(this.KEY);
  if(raw&&!localStorage.getItem(this.STAGE1_BACKUP_KEY))localStorage.setItem(this.STAGE1_BACKUP_KEY,raw);
 }
 static fresh(now=Date.now(),entropy=`${now}:${Math.random()}`):T.SaveV5{
  const legacy=ArenaData.fresh(),saveId=`save-${hash(entropy)}`,characterId=`char-${hash(`${saveId}:${legacy.name}`)}`;
  return {version:5,meta:{saveId,createdAt:now,updatedAt:now,migratedFromVersion:null},character:ArenaCharacterAdapter.characterFromLegacy(legacy,characterId),settings:{sound:legacy.sound,reducedMotion:legacy.reducedMotion},cultivation:CultivationEngine.create(`${saveId}|${characterId}`,now),beasts:BeastEngine.createEmpty(),assimilation:AssimilationEngine.createEmpty(),world:{clearedArenaEncounters:[],unlockedRegions:['velaria'],flags:{},campaignChapter:1}};
 }
 static migrateV3(value:unknown,now=Date.now()):T.SaveV5{
  const legacy=ArenaData.validate(value),canonical=JSON.stringify(legacy),saveId=`v3-${hash(canonical)}`,characterId=`char-${hash(`${saveId}:${legacy.name}:${legacy.skin}:${legacy.banner}:${legacy.build}`)}`;
  const unlocked=['velaria'];if(legacy.cleared.some(id=>id>=3))unlocked.push('forja');if(legacy.cleared.some(id=>id>=7))unlocked.push('imperio');
  return {version:5,meta:{saveId,createdAt:now,updatedAt:now,migratedFromVersion:3},character:ArenaCharacterAdapter.characterFromLegacy(legacy,characterId),settings:{sound:legacy.sound,reducedMotion:legacy.reducedMotion},cultivation:CultivationEngine.create(`${saveId}|${characterId}`,now),beasts:BeastEngine.createEmpty(),assimilation:AssimilationEngine.createEmpty(),world:{clearedArenaEncounters:[...legacy.cleared],unlockedRegions:unlocked,flags:{},campaignChapter:Math.min(3,1+Math.floor(legacy.cleared.length/4))}};
 }
 static validate(value:unknown):T.SaveV5{
  if(!value||typeof value!=='object'||(value as {version?:unknown}).version!==5)throw new Error('Este código não é um salvamento ARENA v5.');
  const v=value as Partial<T.SaveV5>,now=Date.now(),meta=v.meta&&typeof v.meta==='object'?v.meta as Partial<T.Meta>:{};
  if(!v.character||typeof v.character!=='object'||Array.isArray(v.character))throw new Error('O backup v5 não contém dados válidos do personagem.');
  const createdAt=integer(meta.createdAt,0,Number.MAX_SAFE_INTEGER,now),saveId=typeof meta.saveId==='string'&&meta.saveId?meta.saveId.slice(0,120):`save-${hash(JSON.stringify(v.character||{})+createdAt)}`;
  const rawCharacter=v.character&&typeof v.character==='object'?v.character as unknown as Record<string,unknown>:{};
  const rawWorld=v.world&&typeof v.world==='object'?v.world as unknown as Record<string,unknown>:{};
  const rawSettings=v.settings&&typeof v.settings==='object'?v.settings as unknown as Record<string,unknown>:{};
  const legacy=ArenaData.validate({version:3,name:rawCharacter.name,skin:rawCharacter.skin,banner:rawCharacter.banner,build:rawCharacter.build,level:rawCharacter.level,xp:rawCharacter.xp,gold:rawCharacter.gold,points:rawCharacter.points,cleared:rawWorld.clearedArenaEncounters,wins:rawCharacter.wins,losses:rawCharacter.losses,owned:rawCharacter.owned,equipped:rawCharacter.equipped,stats:rawCharacter.stats,talents:rawCharacter.talents,sound:rawSettings.sound,reducedMotion:rawSettings.reducedMotion} as unknown as Legacy.Save);
  const characterId=typeof rawCharacter.id==='string'&&rawCharacter.id?rawCharacter.id.slice(0,120):`char-${hash(`${saveId}:${legacy.name}`)}`;
  const beasts=BeastEngine.validate(v.beasts),known=beasts.collection.map(x=>x.id),assimilation=AssimilationEngine.validate(v.assimilation,known);
  const unlocked=Array.from(new Set((Array.isArray(rawWorld.unlockedRegions)?rawWorld.unlockedRegions:[]).filter(x=>typeof x==='string'&&x).map(x=>String(x).slice(0,80))));if(!unlocked.includes('velaria'))unlocked.unshift('velaria');
  const flags:Record<string,boolean>={};if(rawWorld.flags&&typeof rawWorld.flags==='object')for(const [key,val] of Object.entries(rawWorld.flags as Record<string,unknown>))if(val===true||val===false)flags[key.slice(0,80)]=val;
  return {version:5,meta:{saveId,createdAt,updatedAt:integer(meta.updatedAt,createdAt,Number.MAX_SAFE_INTEGER,createdAt),migratedFromVersion:meta.migratedFromVersion===3?3:null},character:ArenaCharacterAdapter.characterFromLegacy(legacy,characterId),settings:{sound:legacy.sound,reducedMotion:legacy.reducedMotion},cultivation:CultivationEngine.validate(v.cultivation,`${saveId}|${characterId}`,createdAt),beasts,assimilation,world:{clearedArenaEncounters:[...legacy.cleared],unlockedRegions:unlocked,flags,campaignChapter:integer(rawWorld.campaignChapter,1,999,1),...(rawWorld.exploration?{exploration:WildWorld.validate(rawWorld.exploration)}:{})}};
 }
 static persist(value:T.SaveV5,now=Date.now()):T.SaveV5{const valid=this.validate(value),next={...valid,meta:{...valid.meta,updatedAt:Math.max(valid.meta.createdAt,valid.meta.updatedAt,Number.isFinite(now)?now:valid.meta.updatedAt)}};localStorage.setItem(this.KEY,JSON.stringify(next));return next;}
 static load(now=Date.now()):{save:T.SaveV5;warning:string;migrated:boolean}{
  let current:string|null=null,legacyRaw:string|null=null,warning='';
  const warn=()=>{warning='Salvamento local indisponível. O progresso foi mantido na sessão; exporte um backup antes de fechar.';};
  try{current=localStorage.getItem(this.KEY);legacyRaw=localStorage.getItem(this.LEGACY_KEY);}catch{warn();return {save:this.fresh(now),warning,migrated:false};}
  if(current){
   try{
    const save=this.validate(JSON.parse(current));
    try{this.checkpointStage1();this.checkpointStage2();this.checkpointStage3();this.checkpointStage4();}catch{warn();}
    return {save,warning,migrated:false};
   }catch{try{if(!localStorage.getItem(this.RECOVERY_KEY))localStorage.setItem(this.RECOVERY_KEY,current);}catch{warn();}}
  }
  if(legacyRaw){
   try{
    const save=this.migrateV3(JSON.parse(legacyRaw),now);
    try{this.persist(save,now);}catch{warn();}
    return {save,warning:warning||'Progresso ARENA v3 migrado para v5; o original foi preservado.',migrated:true};
   }catch{try{const key=`${this.LEGACY_KEY}-recovery`;if(!localStorage.getItem(key))localStorage.setItem(key,legacyRaw);}catch{warn();}}
  }
  const save=this.fresh(now);
  try{this.persist(save,now);}catch{warn();}
  return {save,warning:warning||(current||legacyRaw?'Save inválido. Os bytes disponíveis foram mantidos em uma cópia local de recuperação.':''),migrated:false};
 }
 static encode(value:T.SaveV5){return `ARENA5:${bytesEncode(JSON.stringify(this.validate(value)))}`;}
 static decode(code:string,now=Date.now()):T.SaveV5{if(code.length>2000000)throw new Error('Backup grande demais. O limite é 2 MB.');const clean=code.trim();if(clean.startsWith('{')){const json=JSON.parse(clean);return json?.version===3?this.migrateV3(json,now):this.validate(json);}if(clean.startsWith('ARENA5:'))return this.validate(JSON.parse(bytesDecode(clean.slice(7))));if(clean.startsWith('ARENA3:'))return this.migrateV3(ArenaData.decode(clean),now);throw new Error('Use um código ARENA5: ou um backup legado ARENA3:.');}
}
