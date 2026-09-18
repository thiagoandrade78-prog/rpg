export namespace CultivationTypes {
 export type Nature='Fogo'|'Água'|'Terra'|'Vento'|'Raio'|'Solar'|'Umbral'|'Natureza';
 export type Archetype='Predador'|'Guardião'|'Duelista'|'Colosso'|'Arcano'|'Espírito';
 export type Aspect='Voraz'|'Sereno'|'Primordial'|'Tempestuoso'|'Lunar'|'Solar'|'Abissal'|'Ancestral'|'Indomável'|'Harmônico';
 export type Quality='Comum'|'Refinado'|'Raro'|'Épico'|'Lendário'|'Mítico';
 export type Realm='dormant'|'Desperto'|'Condensado'|'Espiritual'|'Ascendente'|'Celestial'|'Soberano'|'Transcendente';
 export interface Core {id:string;name:string;nature:Nature;archetype:Archetype;aspect:Aspect;quality:Quality;qualityRank:number;innate:string;channels:number;seed:string;awakenedAt:number|null;}
 export interface Meridian {id:number;open:boolean;refined:boolean;}
 export interface Timestamps {createdAt:number;lastActiveAt:number;lastCultivatedAt:number;offlineAccrualCursor:number;}
 export interface Model {core:Core;realm:Realm;star:number;essence:number;meridians:Meridian[];totalCultivated:number;timestamps:Timestamps;}
}
