export namespace BeastTypes {
 export type SpeciesId='pyrofang'|'stormhawk'|'stoneback'|'tideclaw'|'thornstag'|'nightlynx'|'sunmane'|'mistwyrm'|string;
 export type Temperament='Vigilante'|'Sereno'|'Curioso'|'Altivo'|'Tenaz';
 export interface Individual {id:string;species:SpeciesId;name:string;level:number;xp:number;affinity:number;potential:number;bloodline:{base:number;primordial:number};mastery:number;evolution:number;bonded:boolean;capturedAt:number;seed?:string;temperament?:Temperament;careReadyAt?:number;origin?:'sanctuary'|'legacy'|'wild';}
 export interface Training {beastId:string;startedAt:number;endsAt:number;xp:number;affinity:number;}
 export interface Sanctuary {starterClaimed:boolean;companionId:string|null;training:Training|null;}
 export interface Model {collection:Individual[];discoveredSpecies:SpeciesId[];sanctuary?:Sanctuary;}
}
