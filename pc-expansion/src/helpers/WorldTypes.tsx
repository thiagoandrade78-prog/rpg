import type {WildProgress} from './WildTypes';
export namespace WorldTypes {
 export interface Model {clearedArenaEncounters:number[];unlockedRegions:string[];flags:Record<string,boolean>;campaignChapter:number;exploration?:WildProgress;}
}
