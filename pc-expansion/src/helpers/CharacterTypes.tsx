import {ArenaTypes as Legacy} from './ArenaTypes';
export namespace CharacterTypes {
 export interface Model {id:string;name:string;skin:number;banner:number;build:number;level:number;xp:number;gold:number;points:number;wins:number;losses:number;owned:string[];equipped:Record<Legacy.Slot,string>;stats:{power:number;vitality:number;endurance:number;agility:number};talents:{guard:number;fury:number;precision:number};}
 export interface Settings {sound:boolean;reducedMotion:boolean;}
}
