import {CultivationTypes as T} from './CultivationTypes';
import {CultivationEngine as C} from './CultivationEngine';

export type CultivationCommand =
 | {type:'meditate'} | {type:'stop'}
 | {type:'open';id:number} | {type:'refine';id:number}
 | {type:'advance';expected:string};
export interface FlowReceipt {
 elapsedMs:number;creditedMs:number;activeMs:number;essence:number;discardedMs:number;
 clockBackwards:boolean;initialized:boolean;sessionFinished:boolean;
}
export interface FlowResult {model:T.Model;receipt:FlowReceipt;message?:string;}
export interface Advancement {
 key:string;cost:number;nextRealm:T.Realm;nextStar:number;breakthrough:boolean;
 requiredOpen:number;requiredRefined:number;reasons:string[];max:boolean;
}
const LIMIT=999999999;
const time=(n:number,fallback:number)=>Number.isFinite(n)&&n>=0?Math.min(Number.MAX_SAFE_INTEGER,Math.floor(n)):fallback;
const emptyReceipt=():FlowReceipt=>({elapsedMs:0,creditedMs:0,activeMs:0,essence:0,discardedMs:0,clockBackwards:false,initialized:false,sessionFinished:false});

/** Pure, timestamp-based cultivation. No DOM/timers/storage. Every rate change first settles the old rate. */
export class CultivationFlow {
 static readonly version=2;
 static readonly offlineCapMs=12*60*60*1000;
 static readonly sessionMs=30000;
 static readonly meditationMultiplier=6;
 static readonly basePerMinute=12;
 static readonly essenceLimit=LIMIT;
 static rate(model:T.Model){
  if(!C.isAwakened(model))return 0;
  const r=Math.max(0,C.realms.indexOf(model.realm));
  const quality=(model.core.qualityRank-1)*.07;
  const opened=model.meridians.filter(m=>m.open).length*.04;
  const refined=model.meridians.filter(m=>m.refined).length*.06;
  const realm=r*.12,stars=Math.max(0,model.star-1)*.02;
  const factor=1+quality+opened+refined+realm+stars;
  return Number((this.basePerMinute*factor).toFixed(8));
 }
 static breakdown(model:T.Model){
  const r=Math.max(0,C.realms.indexOf(model.realm));
  return {base:this.basePerMinute,quality:(model.core.qualityRank-1)*7,opened:model.meridians.filter(m=>m.open).length*4,
   refined:model.meridians.filter(m=>m.refined).length*6,realm:r*12,stars:Math.max(0,model.star-1)*2,perMinute:this.rate(model)};
 }
 /** Old stage-1 saves begin earning NOW, not retrospectively since their creation. */
 static initialize(model:T.Model,now=Date.now()):FlowResult {
  const receipt=emptyReceipt();
  if(model.flow?.version===2)return {model,receipt};
  const at=Math.max(model.timestamps.createdAt,model.timestamps.lastActiveAt,model.timestamps.offlineAccrualCursor,time(now,model.timestamps.createdAt));
  receipt.initialized=true;
  return {model:{...model,flow:{version:2,enabledAt:at,fraction:0,meditation:null,sessionsCompleted:0},
   timestamps:{...model.timestamps,lastActiveAt:at,offlineAccrualCursor:at}},receipt};
 }
 static settle(model:T.Model,now=Date.now()):FlowResult {
  if(!model.flow)return this.initialize(model,now);
  const at=time(now,model.timestamps.offlineAccrualCursor),cursor=model.timestamps.offlineAccrualCursor;
  const receipt=emptyReceipt();
  if(at<cursor){receipt.clockBackwards=true;return {model,receipt};}
  if(at===cursor)return {model,receipt};
  const elapsed=at-cursor,credited=Math.min(elapsed,this.offlineCapMs),from=at-credited;
  const session=model.flow.meditation;
  const active=session?Math.max(0,Math.min(at,session.endsAt)-Math.max(from,session.startedAt)):0;
  const finished=!!session&&at>=session.endsAt;
  const exact=model.flow.fraction+(credited+active*(this.meditationMultiplier-1))*this.rate(model)/60000;
  const whole=Math.floor(exact+1e-9),gain=Math.min(LIMIT-model.essence,whole);
  const fraction=model.essence+gain>=LIMIT?0:Math.max(0,Math.min(.999999999,exact-whole));
  return {model:{...model,essence:model.essence+gain,totalCultivated:Math.min(LIMIT,model.totalCultivated+gain),
   flow:{...model.flow,fraction,meditation:finished?null:session,sessionsCompleted:Math.min(LIMIT,model.flow.sessionsCompleted+(finished?1:0))},
   timestamps:{...model.timestamps,lastActiveAt:Math.max(model.timestamps.lastActiveAt,at),lastCultivatedAt:gain>0?Math.max(model.timestamps.lastCultivatedAt,at):model.timestamps.lastCultivatedAt,offlineAccrualCursor:at}},
   receipt:{...receipt,elapsedMs:elapsed,creditedMs:credited,activeMs:active,essence:gain,discardedMs:elapsed-credited,sessionFinished:finished}};
 }
 static meridianCost(id:number,refine=false){
  if(!Number.isInteger(id)||id<0||id>11)throw new Error('Meridiano inválido.');
  return refine?110+id*18:60+id*12;
 }
 static advancement(model:T.Model):Advancement {
  const r=Math.max(0,C.realms.indexOf(model.realm)),breakthrough=model.star===5,max=r===6&&model.star===5;
  const key=`${model.realm}:${model.star}`;
  const cost=max?0:Math.round([90,140,200,280,480][Math.max(0,model.star-1)]*Math.pow(2.2,r));
  const requiredOpen=breakthrough&&!max?[4,6,8,10,12,12][r]:0;
  const requiredRefined=breakthrough&&!max?[0,1,3,5,8,12][r]:0;
  const nextRealm=breakthrough&&!max?C.realms[r+1]:model.realm,nextStar=breakthrough&&!max?1:Math.min(5,model.star+1);
  const reasons:string[]=[];
  if(!C.isAwakened(model))reasons.push('Desperte seu núcleo.');
  if(max)reasons.push('Limite de cultivo desta expansão alcançado.');
  if(model.essence<cost)reasons.push(`Faltam ${cost-model.essence} de essência.`);
  const opened=model.meridians.filter(m=>m.open).length,refined=model.meridians.filter(m=>m.refined).length;
  if(opened<requiredOpen)reasons.push(`Abra ${requiredOpen} meridianos (${opened}/${requiredOpen}).`);
  if(refined<requiredRefined)reasons.push(`Refine ${requiredRefined} meridianos (${refined}/${requiredRefined}).`);
  return {key,cost,nextRealm,nextStar,breakthrough,requiredOpen,requiredRefined,reasons,max};
 }
 /** Rejections never spend essence. Consumers may settle time independently before issuing a command. */
 static command(input:T.Model,action:CultivationCommand,now=Date.now()):FlowResult {
  const settled=this.settle(input,now),model=settled.model,flow=model.flow!;
  if(settled.receipt.clockBackwards)throw new Error('O relógio voltou para uma data anterior. Corrija a hora do dispositivo para cultivar.');
  if(!C.isAwakened(model))throw new Error('Desperte seu núcleo primeiro.');
  const at=model.timestamps.offlineAccrualCursor;
  if(action.type==='meditate'){
   if(flow.meditation)return {...settled,message:'A sessão de meditação já está em andamento.'};
   if(model.essence>=LIMIT)throw new Error('Reserva de essência no limite. Invista antes de meditar.');
   return {...settled,model:{...model,flow:{...flow,meditation:{startedAt:at,endsAt:Math.min(Number.MAX_SAFE_INTEGER,at+this.sessionMs)}}},message:'Meditação iniciada: 30 segundos de fluxo amplificado.'};
  }
  if(action.type==='stop')return {...settled,model:flow.meditation?{...model,flow:{...flow,meditation:null}}:model,message:'Sessão encerrada. Toda essência produzida foi preservada.'};
  if(action.type==='open'||action.type==='refine'){
   const refine=action.type==='refine',cost=this.meridianCost(action.id,refine),m=model.meridians[action.id];
   if((!refine&&m.open)||(refine&&m.refined))return {...settled,message:'Este meridiano já está neste estado. Nenhum custo cobrado.'};
   if(refine&&!m.open)throw new Error('Abra o meridiano antes de refiná-lo.');
   if(model.essence<cost)throw new Error(`Essência insuficiente. Custo: ${cost}.`);
   return {...settled,model:{...model,essence:model.essence-cost,meridians:model.meridians.map(x=>x.id===action.id?{...x,open:true,refined:refine}:x)},message:`Meridiano ${action.id+1} ${refine?'refinado':'aberto'}. −${cost} de essência.`};
  }
  const q=this.advancement(model);
  if(action.expected!==q.key)throw new Error('O estágio mudou. Revise o próximo avanço antes de confirmar.');
  if(q.reasons.length)throw new Error(q.reasons.join(' '));
  return {...settled,model:{...model,realm:q.nextRealm,star:q.nextStar,essence:model.essence-q.cost},message:q.breakthrough?`Ruptura concluída: ${q.nextRealm} ★.`:`Essência condensada: ${q.nextRealm} ${'★'.repeat(q.nextStar)}.`};
 }
}
