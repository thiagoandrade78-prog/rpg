export namespace BeastTypes {
 export type SpeciesId='pyrofang'|'stormhawk'|'stoneback'|'tideclaw'|'thornstag'|'nightlynx'|'sunmane'|'mistwyrm'|string;
 export interface Individual {id:string;species:SpeciesId;name:string;level:number;xp:number;affinity:number;potential:number;bloodline:{base:number;primordial:number};mastery:number;evolution:number;bonded:boolean;capturedAt:number;}
 export interface Model {collection:Individual[];discoveredSpecies:SpeciesId[];}
}
