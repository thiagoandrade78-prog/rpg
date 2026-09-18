import {ArenaSaveTypes as R} from './ArenaSaveTypes';
import {BeastTypes as T} from './BeastTypes';
import {BeastEngine as B} from './BeastEngine';
import {CultivationEngine} from './CultivationEngine';
export type BeastCommand={type:'study';species:string}|{type:'adopt';species:string}|{type:'companion';id:string|null}|{type:'rename';id:string;name:string}|{type:'care';id:string}|{type:'train';id:string}|{type:'collect-training'};
/** Root-level transactions: costs, rewards and collection changes commit together. */
export class BeastSanctuary {
 static readonly careCost=15;static readonly careCooldownMs=60000;static readonly trainingMs=30000;
 static trainingCost(beast:T.Individual){return 20+Math.min(50,beast.level)*8;}
 static starter(save:R.SaveV5,species:string,now=Date.now()){return B.generate(species,`${save.meta.saveId}|${save.character.id}|sanctuary-first`,now);}
 static canAdopt(save:R.SaveV5){return CultivationEngine.isAwakened(save.cultivation)&&!B.sanctuary(save.beasts).starterClaimed&&save.beasts.collection.length===0;}
 static command(save:R.SaveV5,action:BeastCommand,now=Date.now()):{save:R.SaveV5;message:string}{
  if(!Number.isSafeInteger(now)||now<0)throw new Error('Relógio inválido.');
  let beasts=save.beasts,state=B.sanctuary(beasts),character=save.character,cultivation=save.cultivation,message='';
  const individual=(id:string)=>{const b=beasts.collection.find(x=>x.id===id);if(!b)throw new Error('A fera não pertence a este santuário.');return b;};
  const replace=(b:T.Individual)=>{beasts={...beasts,collection:beasts.collection.map(x=>x.id===b.id?b:x)};};
  if(action.type==='study'){
   const species=B.species(action.species);if(!species)throw new Error('Registro desconhecido.');
   if(beasts.discoveredSpecies.includes(species.id))return{save,message:'Registro já estudado.'};
   beasts={...beasts,discoveredSpecies:[...beasts.discoveredSpecies,species.id]};message=`Registro de ${species.name} estudado. Nenhuma fera foi capturada.`;
  }else if(action.type==='adopt'){
   if(!this.canAdopt(save))throw new Error('Desperte o núcleo. Apenas uma fera de acolhimento pode ser recebida por jornada.');
   if(!B.species(action.species)?.starter)throw new Error('Esta espécie não está disponível para acolhimento.');
   const beast=this.starter(save,action.species,now);beasts=B.add(beasts,beast);state={...state,starterClaimed:true,companionId:beast.id};message=`${beast.name} foi acolhido. O indivíduo e sua linhagem são permanentes.`;
  }else if(action.type==='companion'){
   if(action.id!==null)individual(action.id);state={...state,companionId:action.id};message=action.id?'Companheiro selecionado para o pátio. Sem bônus de combate.':'Companheiro recolhido.';
  }else if(action.type==='rename'){
   const b=individual(action.id),name=action.name.trim().replace(/[\u0000-\u001f\u007f]/g,'').slice(0,32);
   if(!name)throw new Error('Informe um nome entre 1 e 32 caracteres.');
   if(name===b.name)return{save,message:'Nome mantido.'};replace({...b,name});message='Nome atualizado. Identidade e linhagem preservadas.';
  }else if(action.type==='care'){
   const b=individual(action.id);if(b.affinity>=100)throw new Error('Afinidade já está no máximo.');
   if(now<Math.max(b.careReadyAt||0,b.capturedAt))throw new Error('Aguarde o próximo cuidado; o intervalo é de 60 segundos.');
   if(character.gold<this.careCost)throw new Error('São necessários 15 de ouro.');
   character={...character,gold:character.gold-this.careCost};replace({...b,affinity:Math.min(100,b.affinity+6),careReadyAt:now+this.careCooldownMs});message='Cuidado concluído: +6 de afinidade (máximo 100).';
  }else if(action.type==='train'){
   const b=individual(action.id);if(!CultivationEngine.isAwakened(cultivation))throw new Error('Desperte o núcleo antes de treinar.');
   if(state.training)throw new Error('Conclua o treino atual antes de iniciar outro.');
   if(b.level>=50)throw new Error('Nível máximo de treino nesta etapa (50).');
   if(now<b.capturedAt)throw new Error('O relógio está anterior ao acolhimento.');
   const cost=this.trainingCost(b);if(cultivation.essence<cost)throw new Error(`São necessárias ${cost} unidades de essência.`);
   cultivation={...cultivation,essence:cultivation.essence-cost};state={...state,training:{beastId:b.id,startedAt:now,endsAt:now+this.trainingMs,xp:60,affinity:3}};message='Treino iniciado. Retorne em 30 segundos para concluir (+60 XP e +3 afinidade).';
  }else if(action.type==='collect-training'){
   const t=state.training;if(!t)throw new Error('Nenhum treino pendente.');
   if(now<t.endsAt)throw new Error('O treino ainda está em andamento.');
   const b=individual(t.beastId);replace({...B.gainXp(b,t.xp),affinity:Math.min(100,b.affinity+t.affinity)});state={...state,training:null};message='Treino concluído. Experiência e afinidade adicionadas uma única vez.';
  }else throw new Error('Comando de santuário inválido.');
  beasts={...beasts,sanctuary:state};
  return{save:{...save,beasts,character,cultivation,meta:{...save.meta,updatedAt:Math.max(save.meta.updatedAt,now)}},message};
 }
}
