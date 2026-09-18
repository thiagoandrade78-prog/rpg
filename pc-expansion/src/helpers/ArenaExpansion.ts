import {ArenaSaveTypes as T} from './ArenaSaveTypes';
import {CultivationEngine} from './CultivationEngine';

/** Atomic domain transition; does not perform I/O or modify the martial character. */
export class ArenaExpansion {
 static readonly version='5.0.0-alpha.1';
 static readonly stage=1;
 static awaken(save:T.SaveV5,now=Date.now()):T.SaveV5 {
  if(CultivationEngine.isAwakened(save.cultivation))return save;
  const cultivation=CultivationEngine.awaken(save.cultivation,now);
  return {...save,cultivation,world:{...save.world,flags:{...save.world.flags,cultivationAwakened:true}},meta:{...save.meta,updatedAt:Math.max(save.meta.updatedAt,cultivation.timestamps.lastActiveAt)}};
 }
}
