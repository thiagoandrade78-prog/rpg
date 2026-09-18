import {CharacterTypes} from './CharacterTypes';
import {CultivationTypes} from './CultivationTypes';
import {BeastTypes} from './BeastTypes';
import {AssimilationTypes} from './AssimilationTypes';
import {WorldTypes} from './WorldTypes';
export namespace ArenaSaveTypes {
 export interface Meta {saveId:string;createdAt:number;updatedAt:number;migratedFromVersion:number|null;}
 export interface SaveV5 {version:5;meta:Meta;character:CharacterTypes.Model;settings:CharacterTypes.Settings;cultivation:CultivationTypes.Model;beasts:BeastTypes.Model;assimilation:AssimilationTypes.Model;world:WorldTypes.Model;}
}
