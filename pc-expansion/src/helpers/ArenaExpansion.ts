import {ArenaSaveTypes as T} from './ArenaSaveTypes';
import {CultivationEngine} from './CultivationEngine';
import {CultivationFlow, CultivationCommand} from './CultivationFlow';

/** Atomic domain transition; does not perform I/O or modify the martial character. */
export class ArenaExpansion {
 static readonly version='5.0.0-alpha.3';
 static readonly stage=3;
 static settle(save:T.SaveV5,now=Date.now()){
  const result=CultivationFlow.settle(save.cultivation,now);
  return {...result,save:result.model===save.cultivation?save:{...save,cultivation:result.model,meta:{...save.meta,updatedAt:Math.max(save.meta.updatedAt,result.model.timestamps.lastActiveAt)}}};
 }
 static command(save:T.SaveV5,action:CultivationCommand,now=Date.now()){
  const result=CultivationFlow.command(save.cultivation,action,now);
  return {...result,save:{...save,cultivation:result.model,meta:{...save.meta,updatedAt:Math.max(save.meta.updatedAt,result.model.timestamps.lastActiveAt)}}};
 }
 static awaken(save:T.SaveV5,now=Date.now()):T.SaveV5 {
  if(CultivationEngine.isAwakened(save.cultivation))return save;
  const cultivation=CultivationEngine.awaken(save.cultivation,now);
  return {...save,cultivation,world:{...save.world,flags:{...save.world.flags,cultivationAwakened:true}},meta:{...save.meta,updatedAt:Math.max(save.meta.updatedAt,cultivation.timestamps.lastActiveAt)}};
 }
}
