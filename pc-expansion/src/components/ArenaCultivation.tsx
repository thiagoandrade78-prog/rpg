import React,{useEffect,useId,useRef,useState} from 'react';
import {ArrowLeft,ArrowRight,Check,ChevronRight,Compass,Flame,Lock,Shield,Sparkles,Wind,Zap,Droplets,Sun,Moon,Mountain,Leaf,BookOpen,Hourglass,Play,Pause,TrendingUp,Clock,CheckCircle2} from 'lucide-react';
import {Button} from './Button';
import {ArenaArt as Art} from '../helpers/ArenaArt';
import {ArenaEngine} from '../helpers/ArenaEngine';
import {ArenaCharacter} from '../helpers/ArenaCharacter';
import {ArenaTypes as Legacy} from '../helpers/ArenaTypes';
import {CultivationTypes as T} from '../helpers/CultivationTypes';
import {CultivationEngine as C} from '../helpers/CultivationEngine';
import {CultivationFlow as Flow, CultivationCommand, FlowReceipt} from '../helpers/CultivationFlow';
import {ExpansionRoadmap} from '../helpers/ExpansionRoadmap';
import styles from './ArenaCultivation.module.css';

const NATURES:Record<T.Nature,{color:string;Icon:typeof Flame;description:string}>={
 Fogo:{color:'#d15f35',Icon:Flame,description:'Impulso, combustão e poder concentrado.'},
 Água:{color:'#3293a4',Icon:Droplets,description:'Continuidade, adaptação e correntes profundas.'},
 Terra:{color:'#b58742',Icon:Mountain,description:'Estabilidade, resistência e força ancestral.'},
 Vento:{color:'#70b4a8',Icon:Wind,description:'Liberdade, fluidez e deslocamento.'},
 Raio:{color:'#d7b653',Icon:Zap,description:'Velocidade, descarga e precisão.'},
 Solar:{color:'#dfac47',Icon:Sun,description:'Vitalidade, presença e luz expansiva.'},
 Umbral:{color:'#a48bd1',Icon:Moon,description:'Discrição, percepção e energia velada.'},
 Natureza:{color:'#73a261',Icon:Leaf,description:'Renovação, vínculo e crescimento.'}
};
const ARCHETYPES:Record<T.Archetype,string>={Predador:'Vocação ofensiva e aproximação.',Guardião:'Vocação protetora e estabilidade.',Duelista:'Vocação para precisão e mobilidade.',Colosso:'Vocação para força e impacto.',Arcano:'Vocação para técnicas espirituais.',Espírito:'Vocação para vínculo e controle de energia.'};
const MERIDIANS=['Coroa','Visão','Garganta','Coração','Braço esquerdo','Braço direito','Centro','Ventre','Perna esquerda','Perna direita','Raiz esquerda','Raiz direita'];
const POSITIONS=[[150,30],[150,66],[150,95],[150,124],[100,145],[200,145],[150,171],[150,203],[123,240],[177,240],[109,286],[191,286]];
const EDGES=[[0,1],[1,2],[2,3],[3,4],[3,5],[3,6],[6,7],[7,8],[7,9],[8,10],[9,11]];

type Props={save:Legacy.Save;model:T.Model;onAwaken:()=>void;onBack:()=>void;onBackup:()=>void;storageWarning:string;onCommand:(action:CultivationCommand)=>void;offlineReport:FlowReceipt|null;onDismissReport:()=>void;clockWarning:boolean};

/** A dedicated stage which draws the SAME articulated character used by the existing arena. */
function SanctuaryStage({save,model,revealing}:{save:Legacy.Save;model:T.Model;revealing:boolean}){
 const canvasRef=useRef<HTMLCanvasElement>(null),modelRef=useRef(model);modelRef.current=model;
 const isAwake=C.isAwakened(model),color=isAwake?NATURES[model.core.nature].color:'#a8a084';
 useEffect(()=>{
  const canvas=canvasRef.current;if(!canvas)return;
  const ctx=canvas.getContext('2d');if(!ctx)return;
  const character=new ArenaCharacter(ctx),engine=new ArenaEngine(save,0);
  engine.player.face=1;
  let width=1,height=1,dpr=1,frame=0,last=0,time=0,disposed=false;
  const resize=()=>{const r=canvas.getBoundingClientRect();width=Math.max(1,r.width);height=Math.max(1,r.height);dpr=Math.min(window.devicePixelRatio||1,2);canvas.width=Math.round(width*dpr);canvas.height=Math.round(height*dpr);};
  const observer=new ResizeObserver(resize);observer.observe(canvas);resize();
  const ellipse=(x:number,y:number,rx:number,ry:number,fill:string,stroke?:string)=>{ctx.beginPath();ctx.ellipse(x,y,rx,ry,0,0,Math.PI*2);ctx.fillStyle=fill;ctx.fill();if(stroke){ctx.strokeStyle=stroke;ctx.lineWidth=2;ctx.stroke();}};
  const draw=()=>{
   const current=modelRef.current,meditating=!!current.flow?.meditation;
   ctx.setTransform(dpr,0,0,dpr,0,0);ctx.clearRect(0,0,width,height);
   const image=Art.image(Art.trainer);
   if(image){const scale=Math.max(width/image.naturalWidth,height/image.naturalHeight);ctx.drawImage(image,(width-image.naturalWidth*scale)/2,(height-image.naturalHeight*scale)*.4,image.naturalWidth*scale,image.naturalHeight*scale);}
   else {ctx.fillStyle='#334244';ctx.fillRect(0,0,width,height);}
   ctx.fillStyle='rgba(15,30,31,.82)';ctx.fillRect(0,0,width,height);
   const light=ctx.createRadialGradient(width*.5,height*.40,4,width*.5,height*.48,width*.72);light.addColorStop(0,color+'65');light.addColorStop(1,'#15282b00');ctx.fillStyle=light;ctx.fillRect(0,0,width,height);
   const cx=width*.5,cy=height*.43,radius=Math.min(width*.36,height*.34);
   ctx.save();ctx.translate(cx,cy);ctx.rotate(save.reducedMotion?0:time*(meditating?.23:.07));
   ctx.strokeStyle=color+'80';ctx.lineWidth=1.2;
   for(const factor of [1,.87,.66]){ctx.beginPath();ctx.arc(0,0,radius*factor,0,Math.PI*2);ctx.stroke();}
   for(let i=0;i<24;i++){const a=i*Math.PI/12;ctx.beginPath();ctx.moveTo(Math.cos(a)*radius*.94,Math.sin(a)*radius*.94);ctx.lineTo(Math.cos(a)*radius,Math.sin(a)*radius);ctx.stroke();}
   ctx.restore();
   const sc=Math.min(height/280,width/237),floor=height*.91;
   ellipse(cx,floor+9,width*.37,18,'#182326','#a18b58');
   ellipse(cx,floor+2,width*.37,16,'#46605a','#ceb06f');
   ellipse(cx,floor-3,width*.30,11,'#6c8070','#c6b577');
   engine.player.walk=save.reducedMotion?0:time*1.15;
   character.draw(engine.player,cx-7*sc,floor-7,sc,time,true,save.reducedMotion);
   if(isAwake){
    const pulse=save.reducedMotion?1:1+Math.sin(time*2.1)*.08;
    const x=cx,y=floor-110*sc;
    const g=ctx.createRadialGradient(x,y,1,x,y,24*sc*pulse);g.addColorStop(0,'#fff2c3ad');g.addColorStop(.25,color+'ba');g.addColorStop(1,color+'00');ctx.fillStyle=g;ctx.fillRect(x-35*sc,y-35*sc,70*sc,70*sc);
    for(let i=0;i<12;i++){const a=i*Math.PI/6-Math.PI/2,n=current.meridians[i];const nx=cx+Math.cos(a)*radius,ny=cy+Math.sin(a)*radius;
     ellipse(nx,ny,n.open?4:2.5,n.open?4:2.5,n.refined?'#fff5d6':n.open?'#ffe9af':'#738a7d',color);}
    if(meditating&&!save.reducedMotion){
     for(let i=0;i<20;i++){
      const phase=(time*.32+i/20)%1,a=i*2.399+time*.35;
      const px=cx+Math.cos(a)*radius*(1-phase),py=cy+Math.sin(a)*radius*(1-phase);
      ctx.globalAlpha=Math.sin(phase*Math.PI)*.8;ellipse(px,py,2,2,'#ffeec0');
     }ctx.globalAlpha=1;
    }
   }
  };
  const loop=(t:number)=>{if(disposed)return;frame=requestAnimationFrame(loop);if(t-last<1000/30||document.hidden)return;time+=Math.min(.06,(t-last)/1000||0);last=t;draw();};
  frame=requestAnimationFrame(loop);
  return()=>{disposed=true;cancelAnimationFrame(frame);observer.disconnect();};
 },[save,color,isAwake]);
 return <div className={`${styles.stage} ${revealing&&!save.reducedMotion?styles.revealing:''} ${model.flow?.meditation?styles.meditationStage:''}`} style={{'--core-color':color} as React.CSSProperties}>
  <canvas ref={canvasRef} aria-label={`Gladiador articulado no santuário, núcleo ${isAwake?'desperto':'adormecido'}`}/>
  <div className={styles.stageTop}><span>SANTUÁRIO INTERIOR</span><b>{model.flow?.meditation?'Respire. Conduza. Condense.':isAwake?'A essência reconheceu você.':'Toda lenda começa por dentro.'}</b></div>
  <div className={styles.stageFoot}><span>{save.name}</span><small>{isAwake?`${model.realm} ${'★'.repeat(model.star)}`:'NÚCLEO ADORMECIDO'}</small></div>
 </div>;
}

function MeridianDiagram({model}:{model:T.Model}){
 const uid=useId().replace(/:/g,'');
 return <svg className={styles.diagram} viewBox="0 0 300 322" role="img" aria-label={`Rede espiritual: ${model.meridians.filter(m=>m.open).length} de 12 meridianos abertos`}>
  <defs><radialGradient id={uid}><stop stopColor="#337a7580"/><stop offset="1" stopColor="#142b2b00"/></radialGradient></defs>
  <circle cx="150" cy="157" r="141" fill={`url(#${uid})`}/>
  <path d="M133 91C120 103 105 100 88 119L71 187L84 194L115 152L122 211L102 288L120 290L150 227L179 290L198 288L177 211L185 152L216 194L229 187L212 119C196 102 182 103 167 91Z" fill="#829c8650" stroke="#cbb98866" strokeWidth="1.5"/>
  <ellipse cx="150" cy="67" rx="24" ry="30" fill="#81998450" stroke="#cbb98866" strokeWidth="1.5"/>
  {EDGES.map(([a,b])=><path key={`${a}-${b}`} d={`M${POSITIONS[a].join(' ')}L${POSITIONS[b].join(' ')}`} stroke={model.meridians[a].open&&model.meridians[b].open?'#dfbb74':'#83947a70'} strokeWidth="2"/>)}
  {model.meridians.map((m,i)=><g key={m.id}><circle cx={POSITIONS[i][0]} cy={POSITIONS[i][1]} r={m.open?9:7} fill={m.open?'#ebca83':'#203b38'} stroke={m.refined?'#fff4bf':m.open?'#e5b85f':'#77866c'} strokeWidth="2"/><text x={POSITIONS[i][0]} y={POSITIONS[i][1]+3} textAnchor="middle" fill={m.open?'#49331d':'#a8b49c'} fontFamily="system-ui" fontSize="8" fontWeight="700">{i+1}</text></g>)}
 </svg>;
}

export const ArenaCultivation=({save,model,onAwaken,onBack,onBackup,storageWarning,onCommand,offlineReport,onDismissReport,clockWarning}:Props)=>{
 const [tab,setTab]=useState<'core'|'practice'|'meridians'|'roadmap'>('core'),[confirming,setConfirming]=useState(false),[revealing,setRevealing]=useState(false);
 const awakened=C.isAwakened(model),prev=useRef(awakened),confirmRef=useRef<HTMLButtonElement>(null),revealHeading=useRef<HTMLHeadingElement>(null);
 useEffect(()=>{if(confirming)confirmRef.current?.focus();},[confirming]);
 useEffect(()=>{let timer=0;if(awakened&&!prev.current){setConfirming(false);setRevealing(true);revealHeading.current?.focus({preventScroll:true});timer=window.setTimeout(()=>setRevealing(false),2200);}prev.current=awakened;return()=>clearTimeout(timer);},[awakened]);
 const core=model.core,nature=NATURES[core.nature],NatureIcon=nature.Icon;
 const [pending,setPending]=useState<CultivationCommand|null>(null),confirmation=useRef<HTMLButtonElement>(null);
 useEffect(()=>{if(pending)confirmation.current?.focus({preventScroll:true});},[pending]);
 const quote=Flow.advancement(model),session=model.flow?.meditation,rate=Flow.rate(model),parts=Flow.breakdown(model);
 const remain=session?Math.max(0,session.endsAt-Date.now()):0,progress=session?Math.min(100,(1-remain/Flow.sessionMs)*100):0;
 const phase=session?['Inspire','Estabilize','Expire'][Math.min(2,Math.floor((Flow.sessionMs-remain)/10000))]:'Fluxo passivo';
 const opened=model.meridians.filter(m=>m.open).length,refined=model.meridians.filter(m=>m.refined).length;
 const amount=(value:number)=>value.toLocaleString('pt-BR',{maximumFractionDigits:1});
 const confirmAction=()=>{if(pending){const action=pending;setPending(null);onCommand(action);}};
 const requestAdvance=()=>setPending({type:'advance',expected:quote.key});
 const spendPanel=pending&&<div className={styles.spendConfirm} role="group" aria-label="Confirmar investimento espiritual">
  <span className={styles.eyebrow}>INVESTIMENTO DE ESSÊNCIA</span>
  <h3>{pending.type==='advance'?(quote.breakthrough?`Romper para ${quote.nextRealm}?`:`Condensar a estrela ${quote.nextStar}?`):(pending.type==='open'?'Abrir ':'Refinar ')+MERIDIANS['id' in pending?pending.id:0]+'?'}</h3>
  <p>Custo: <b>{amount(pending.type==='advance'?quote.cost:Flow.meridianCost('id' in pending?pending.id:0,pending.type==='refine'))} essência</b>. Seu núcleo, ouro e equipamentos serão preservados.</p>
  <div><Button ref={confirmation} className={styles.goldButton} onClick={confirmAction}>CONFIRMAR INVESTIMENTO</Button><Button variant="ghost" onClick={()=>setPending(null)}>Cancelar</Button></div>
 </div>;

 return <section className={styles.root} data-expansion-stage="2" data-reduced-motion={save.reducedMotion?'true':'false'} data-awakened={awakened?'true':'false'}>
  <div className={styles.heading}><Button variant="ghost" onClick={onBack} aria-label="Voltar ao ludus"><ArrowLeft size={20}/></Button><div><span>EXPANSÃO 5.0 · ETAPA 2/10</span><h1>O Fluxo Interior</h1></div><div className={styles.seal}><Compass size={27}/></div></div>
  <div className={styles.intro}><BookOpen size={21}/><p><b>Da centelha ao fluxo.</b> Medite, refine seus canais e avance pelos reinos. Seu gladiador continua com a mesma arte, equipamento e combate; esta etapa desenvolve a progressão espiritual.</p></div>
  {offlineReport&&<aside className={styles.offlineReceipt} aria-label="Relatório de cultivo offline" role="status"><Clock size={23}/><div><span>ENQUANTO VOCÊ ESTEVE AUSENTE</span><b>+{amount(offlineReport.essence)} essência</b><p>{amount(offlineReport.creditedMs/60000)} minutos contabilizados{offlineReport.discardedMs>0?' · limite de 12 horas aplicado':''}. Já adicionada ao save; não é preciso coletar.</p></div><Button variant="ghost" onClick={onDismissReport} aria-label="Fechar relatório offline">×</Button></aside>}
  {clockWarning&&<p className={styles.clockWarning} role="alert">O relógio do dispositivo está anterior ao último cultivo. A geração está suspensa para não contar o mesmo tempo duas vezes. Corrija a hora ou aguarde o relógio alcançar o último registro.</p>}
  <div className={styles.tabs} role="tablist" aria-label="Páginas do santuário">{([['core','Núcleo'],['practice','Meditar'],['meridians','Meridianos'],['roadmap','Jornada']] as const).map(([id,label])=><Button key={id} role="tab" id={'cult-tab-'+id} aria-selected={tab===id} aria-controls={'cult-panel-'+id} className={tab===id?styles.activeTab:''} variant="ghost" onClick={()=>{setTab(id);setConfirming(false);setPending(null);}}>{label}</Button>)}</div>
  {tab==='core'&&<div className={styles.coreGrid} role="tabpanel" id="cult-panel-core" aria-labelledby="cult-tab-core">
   <SanctuaryStage save={save} model={model} revealing={revealing}/>
   <article className={styles.dossier}>
    {!awakened?<>
     <span className={styles.eyebrow}>I · A PRIMEIRA CENTELHA</span><h2>O que vive<br/>além do aço?</h2>
     <p>Orun reconheceu um padrão nos seus meridianos. A natureza dessa força, seu aspecto e sua vocação estão prestes a se revelar.</p>
     <div className={styles.mystery}><div><Sparkles size={22}/><span>Natureza</span><b>Velada</b></div><div><Shield size={22}/><span>Arquétipo</span><b>Velado</b></div><div><Sun size={22}/><span>Qualidade</span><b>Velada</b></div></div>
     <div className={styles.promise}><Lock size={16}/><p>Identidade permanente. Não há novo sorteio ao renomear o gladiador, reiniciar o jogo ou importar o mesmo backup.</p></div>
     {confirming?<div className={styles.confirm} role="group" aria-label="Confirmar despertar"><b>Revelar seu núcleo agora?</b><p>Sem custo de ouro ou essência. O progresso marcial será mantido.</p><Button ref={confirmRef} className={styles.goldButton} onClick={onAwaken}>CONFIRMAR DESPERTAR <Sparkles size={17}/></Button><Button variant="ghost" onClick={()=>setConfirming(false)}>Ainda não</Button></div>:<Button className={styles.goldButton} onClick={()=>setConfirming(true)}>DESPERTAR MEU NÚCLEO <ArrowRight size={18}/></Button>}
     <small className={styles.note}>O personagem mantém o núcleo definido no Save v5. Para um save v3, a identidade é estabelecida na migração.</small>
    </>:<>
     <div className={styles.quality}><NatureIcon size={21}/><span>{core.quality.toUpperCase()} · {core.channels} CANAIS POTENCIAIS</span></div>
     <h2 ref={revealHeading} tabIndex={-1} className={styles.coreName}>{core.name}</h2>
     <div className={styles.success} role="status"><Check size={17}/>{revealing?'Despertar concluído.':'Núcleo vinculado permanentemente.'}</div>
     <div className={styles.properties}>
      <div><span>NATUREZA</span><b><NatureIcon size={16}/>{core.nature}</b><small>{nature.description}</small></div>
      <div><span>ARQUÉTIPO</span><b>{core.archetype}</b><small>{ARCHETYPES[core.archetype]}</small></div>
      <div><span>ASPECTO</span><b>{core.aspect}</b><small>A assinatura complementar da sua essência.</small></div>
      <div><span>TRAÇO INATO</span><b>{core.innate}</b><small>Vocação registrada; efeitos nas etapas seguintes.</small></div>
     </div>
     <div className={styles.realm}><div><span>REINO ATUAL</span><b>{model.realm}</b></div><span className={styles.stars} aria-label={`${model.star} de 5 estrelas`}>{'★'.repeat(model.star)}{'☆'.repeat(5-model.star)}</span></div>
     <div className={styles.ledger}><span>Essência preservada <b>{model.essence.toLocaleString('pt-BR')}</b></span><span>Meridianos abertos <b>{model.meridians.filter(m=>m.open).length}/12</b></span></div>
     <Button className={styles.goldButton} onClick={()=>setTab('practice')}>CULTIVAR ESSÊNCIA <ChevronRight size={18}/></Button>
     <small className={styles.note}>Fluxo passivo: {amount(rate)} essência/min. Meditar acelera a produção por 30 segundos. Os bônus de combate e de feras pertencem às próximas etapas.</small>
    </>}
   </article>
  </div>}
  {tab==='practice'&&<div role="tabpanel" id="cult-panel-practice" aria-labelledby="cult-tab-practice" className={`${styles.coreGrid} ${styles.practiceGrid}`}>
   <SanctuaryStage save={save} model={model} revealing={revealing}/>
   <article className={`${styles.dossier} ${styles.practiceDossier}`}>
    <span className={styles.eyebrow}>II · DISCIPLINA DA ESSÊNCIA</span><h2>O fluxo não cessa.</h2>
    {!awakened?<><p>Desperte o núcleo na primeira aba para iniciar o cultivo. Nenhuma essência é gerada enquanto ele dorme.</p><Button className={styles.goldButton} onClick={()=>setTab('core')}>IR AO DESPERTAR</Button></>:<>
     <div className={styles.essenceVault}><Sparkles size={27}/><div><span>RESERVA ESPIRITUAL</span><b data-testid="essence-reserve">{amount(model.essence)}</b></div><small>Produzido ao todo<br/><strong>{amount(model.totalCultivated)}</strong></small></div>
     <div className={`${styles.breathing} ${session?styles.breathingActive:''}`} data-meditating={session?'true':'false'}>
      <div className={styles.breathSeal} aria-hidden="true"><NatureIcon size={27}/></div><div><b>{phase}</b><span>{session?`${Math.ceil(remain/1000)} s restantes · ${amount(rate*Flow.meditationMultiplier)}/min`:`${amount(rate)}/min · meditação a ${Flow.meditationMultiplier}×`}</span></div>
     </div>
     <div className={styles.flowProgress} role="progressbar" aria-label="Sessão de meditação" aria-valuenow={Math.round(progress)} aria-valuemin={0} aria-valuemax={100}><i style={{width:`${progress}%`}}/></div>
     <Button className={styles.goldButton} disabled={clockWarning} onClick={()=>onCommand({type:session?'stop':'meditate'})}>{session?<Pause size={17}/>:<Play size={17}/>} {session?'ENCERRAR SESSÃO':'MEDITAR · 30 SEGUNDOS'}</Button>
     <p className={styles.sessionNote}>Uma sessão produz cerca de <b>{amount(rate*Flow.meditationMultiplier*.5)} essência</b>. Não se acumula com outra sessão. Ao concluir ou encerrar, o fluxo passivo continua.</p>
     <div className={styles.rateLedger}><span>Base <b>{parts.base}/min</b></span><span>Qualidade <b>+{parts.quality}%</b></span><span>Canais abertos <b>+{parts.opened}%</b></span><span>Refinamentos <b>+{parts.refined}%</b></span><span>Reino <b>+{parts.realm}%</b></span><span>Estrelas <b>+{parts.stars}%</b></span></div>
     <div className={styles.ascension}><div className={styles.realm}><div><span>REINO ATUAL</span><b>{model.realm}</b></div><span className={styles.stars}>{'★'.repeat(model.star)}{'☆'.repeat(5-model.star)}</span></div>
      <div className={styles.flowProgress} role="progressbar" aria-label="Essência para avançar" aria-valuenow={Math.min(100,Math.round(model.essence/Math.max(1,quote.cost)*100))} aria-valuemin={0} aria-valuemax={100}><i style={{width:`${quote.max?100:Math.min(100,model.essence/Math.max(1,quote.cost)*100)}%`}}/></div>
      <div className={styles.targetStage}><b>{quote.max?'Transcendência alcançada':`${quote.breakthrough?'Próximo reino':'Próxima estrela'}: ${quote.nextRealm} ${'★'.repeat(quote.nextStar)}`}</b><span>{quote.max?'Nenhum gasto adicional.':`Custo: ${amount(quote.cost)} essência`}</span></div>
      {quote.breakthrough&&!quote.max&&<p className={styles.requirements}>Meridianos: <b>{opened}/{quote.requiredOpen} abertos</b> · <b>{refined}/{quote.requiredRefined} refinados</b>. Com os requisitos completos, a ruptura é garantida.</p>}
      <Button className={styles.ascendButton} disabled={clockWarning||quote.reasons.length>0} onClick={requestAdvance}><TrendingUp size={18}/>{quote.max?'LIMITE ALCANÇADO':quote.breakthrough?'ROMPER REINO':'CONDENSAR ESTRELA'}</Button>
      <small className={styles.note}>{quote.reasons.join(' ')||'Requisitos completos. Revise o custo antes de confirmar.'}</small>
     </div>
     {spendPanel}
     <details className={styles.offlineGuide}><summary>Como funciona o cultivo offline?</summary><p>A essência é calculada pelos timestamps do save, mesmo com o arquivo fechado. Cada retorno considera até 12 horas ausente. Uma meditação em curso termina no limite de 30 segundos; depois disso vale só a taxa passiva. O tempo anterior à instalação da Etapa 2 não gera crédito retroativo. Horas não são gastas nem recebidas duas vezes por reabrir a tela.</p><p>O relógio é local, sem verificação por servidor. Alterações manuais de hora ou restauração de backups podem alterar o resultado. Exporte o progresso antes de trocar de arquivo.</p></details>
    </>}
   </article>
  </div>}
  {tab==='meridians'&&<div role="tabpanel" id="cult-panel-meridians" aria-labelledby="cult-tab-meridians" className={styles.meridianGrid}>
   <div className={styles.diagramPanel}><span>ATLAS DOS CANAIS INTERIORES</span><MeridianDiagram model={model}/><p>{awakened?`${opened}/12 abertos · ${refined}/12 refinados`:'O fluxo ainda está adormecido'}</p></div>
   <article className={styles.dossier}><span className={styles.eyebrow}>ANATOMIA ESPIRITUAL</span><h2>Doze caminhos.<br/>Uma essência.</h2><p>Cada abertura concede +4% à produção; cada refinamento acrescenta +6%. Todos os 12 canais podem ser desenvolvidos. Escolha onde investir sua essência.</p><div className={styles.meridians}>{model.meridians.map((m,i)=><div key={m.id} data-meridian-id={m.id} className={m.refined?styles.refined:m.open?styles.openMeridian:styles.closedMeridian}><b>{String(i+1).padStart(2,'0')}</b><span>{MERIDIANS[i]}<small>{m.refined?'Refinado':m.open?'Aberto':'Fechado'}</small></span><Button variant="outline" disabled={!awakened||m.refined||clockWarning||model.essence<Flow.meridianCost(m.id,m.open)} aria-label={`${m.open?'Refinar':'Abrir'} meridiano ${i+1}`} onClick={()=>setPending({type:m.open?'refine':'open',id:m.id})}>{m.refined?<CheckCircle2 size={18}/>:<>{m.open?'Refinar':'Abrir'}<small>{Flow.meridianCost(m.id,m.open)} ess.</small></>}</Button></div>)}</div>{spendPanel}<div className={styles.promise}><Sparkles size={16}/><p>Reserva disponível: <b>{amount(model.essence)} essência</b>. Canais refinados não podem ser cobrados novamente. Estes bônus afetam somente o cultivo nesta etapa.</p></div></article>
  </div>}
  {tab==='roadmap'&&<div role="tabpanel" id="cult-panel-roadmap" aria-labelledby="cult-tab-roadmap" className={styles.roadmap}>
   <div className={styles.roadmapIntro}><span className={styles.eyebrow}>CRÔNICAS DA EXPANSÃO</span><h2>Da centelha ao Avatar.</h2><p>Dez entregas sobre o jogo ilustrado. As etapas 1, 2 e 3 estão disponíveis nesta versão.</p></div>
   {ExpansionRoadmap.map(stage=><article key={stage.id} className={stage.id<=3?styles.currentStage:styles.futureStage}><span>{String(stage.id).padStart(2,'0')}</span><div><h3>{stage.title}</h3><p>{stage.detail}</p></div>{stage.id<=3?<Check size={21}/>:<Lock size={17}/>}</article>)}
  </div>}
  <footer className={styles.footer}><div><Shield size={19}/><p><b>Seu progresso vem primeiro.</b> Ouro, armas, vitórias e o núcleo usam o mesmo Save v5. Antes de mudar de arquivo, guarde um código ARENA5.</p></div><Button variant="outline" onClick={onBackup}>BACKUP E AJUDA</Button></footer>
  {storageWarning&&<p role="alert" className={styles.storageWarning}>{storageWarning}</p>}
 </section>;
};
