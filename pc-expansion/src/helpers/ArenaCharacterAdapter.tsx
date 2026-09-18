import {ArenaTypes as Legacy} from './ArenaTypes';
import {ArenaSaveTypes as V5} from './ArenaSaveTypes';
import {CharacterTypes} from './CharacterTypes';
export class ArenaCharacterAdapter {
 static characterFromLegacy(s:Legacy.Save,id:string):CharacterTypes.Model{return {id,name:s.name,skin:s.skin,banner:s.banner,build:s.build,level:s.level,xp:s.xp,gold:s.gold,points:s.points,wins:s.wins,losses:s.losses,owned:[...s.owned],equipped:{...s.equipped},stats:{...s.stats},talents:{...s.talents}};}
 static toLegacy(save:V5.SaveV5):Legacy.Save{const c=save.character;return {version:3,name:c.name,skin:c.skin,banner:c.banner,build:c.build,level:c.level,xp:c.xp,gold:c.gold,points:c.points,cleared:[...save.world.clearedArenaEncounters],wins:c.wins,losses:c.losses,owned:[...c.owned],equipped:{...c.equipped},stats:{...c.stats},talents:{...c.talents},sound:save.settings.sound,reducedMotion:save.settings.reducedMotion};}
 static mergeLegacy(save:V5.SaveV5,legacy:Legacy.Save):V5.SaveV5{return {...save,character:this.characterFromLegacy(legacy,save.character.id),settings:{sound:legacy.sound,reducedMotion:legacy.reducedMotion},world:{...save.world,clearedArenaEncounters:[...legacy.cleared]},meta:{...save.meta,updatedAt:Date.now()}};}
}
