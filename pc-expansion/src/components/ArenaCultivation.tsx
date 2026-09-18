import React,{useEffect,useId,useRef,useState} from 'react';
import {ArrowLeft,ArrowRight,Check,ChevronRight,Compass,Flame,Lock,Shield,Sparkles,Wind,Zap,Droplets,Sun,Moon,Mountain,Leaf,BookOpen} from 'lucide-react';
import {Button} from './Button';
import {ArenaArt as Art} from '../helpers/ArenaArt';
import {ArenaEngine} from '../helpers/ArenaEngine';
import {ArenaCharacter} from '../helpers/ArenaCharacter';
import {ArenaTypes as Legacy} from '../helpers/ArenaTypes';
import {CultivationTypes as T} from '../helpers/CultivationTypes';
import {CultivationEngine as C} from '../helpers/CultivationEngine';
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

type Props={save:Legacy.Save;model:T.Model;onAwaken:()=>void;onBack:()=>void;onBackup:()=>void;storageWarning:string};

/** A dedicated stage which draws the SAME articulated character used by the existing arena. */
function SanctuaryStage({save,model,revealing}:{save:Legacy.Save;model:T.Model;revealing:boolean}){
 const canvasRef=useRef<HTMLCanvasElement>(null);
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
   ctx.setTransform(dpr,0,0,dpr,0,0);ctx.clearRect(0,0,width,height);
   const image=Art.image(Art.trainer);
   if(image){const scale=Math.max(width/image.naturalWidth,height/image.naturalHeight);ctx.drawImage(image,(width-image.naturalWidth*scale)/2,(height-image.naturalHeight*scale)*.4,image.naturalWidth*scale,image.naturalHeight*scale);}
   else {ctx.fillStyle='#334244';ctx.fillRect(0,0,width,height);}
   ctx.fillStyle='rgba(15,30,31,.82)';ctx.fillRect(0,0,width,height);
   const light=ctx.createRadialGradient(width*.5,height*.40,4,width*.5,height*.48,width*.72);light.addColorStop(0,color+'65');light.addColorStop(1,'#15282b00');ctx.fillStyle=light;ctx.fillRect(0,0,width,height);
   const cx=width*.5,cy=height*.43,radius=Math.min(width*.36,height*.34);
   ctx.save();ctx.translate(cx,cy);ctx.rotate(save.reducedMotion?0:time*.07);
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
    for(let i=0;i<12;i++){const a=i*Math.PI/6-Math.PI/2,n=model.meridians[i];const nx=cx+Math.cos(a)*radius,ny=cy+Math.sin(a)*radius;
     ellipse(nx,ny,n.open?4:2.5,n.open?4:2.5,n.open?'#ffe9af':'#738a7d',color);}
   }
  };
  const loop=(t:number)=>{if(disposed)return;frame=requestAnimationFrame(loop);if(t-last<1000/30||document.hidden)return;time+=Math.min(.06,(t-last)/1000||0);last=t;draw();};
  frame=requestAnimationFrame(loop);
  return()=>{disposed=true;cancelAnimationFrame(frame);observer.disconnect();};
 },[save,model,color,isAwake]);
 return <div className={`${styles.stage} ${revealing&&!save.reducedMotion?styles.revealing:''}`} style={{'--core-color':color} as React.CSSProperties}>
  <canvas ref={canvasRef} aria-label={`Gladiador articulado no santuário, núcleo ${isAwake?'desperto':'adormecido'}`}/>
  <div className={styles.stageTop}><span>SANTUÁRIO INTERIOR</span><b>{isAwake?'A essência reconheceu você.':'Toda lenda começa por dentro.'}</b></div>
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

export const ArenaCultivation=({save,model,onAwaken,onBack,onBackup,storageWarning}:Props)=>{
 const [tab,setTab]=useState<'core'|'meridians'|'roadmap'>('core'),[confirming,setConfirming]=useState(false),[revealing,setRevealing]=useState(false);
 const awakened=C.isAwakened(model),prev=useRef(awakened),confirmRef=useRef<HTMLButtonElement>(null),revealHeading=useRef<HTMLHeadingElement>(null);
 useEffect(()=>{if(confirming)confirmRef.current?.focus();},[confirming]);
 useEffect(()=>{let timer=0;if(awakened&&!prev.current){setConfirming(false);setRevealing(true);revealHeading.current?.focus({preventScroll:true});timer=window.setTimeout(()=>setRevealing(false),2200);}prev.current=awakened;return()=>clearTimeout(timer);},[awakened]);
 const core=model.core,nature=NATURES[core.nature],NatureIcon=nature.Icon;
 return <section className={styles.root} data-expansion-stage="1" data-awakened={awakened?'true':'false'}>
  <div className={styles.heading}><Button variant="ghost" onClick={onBack} aria-label="Voltar ao ludus"><ArrowLeft size={20}/></Button><div><span>EXPANSÃO 5.0 · ETAPA 1/10</span><h1>O Despertar</h1></div><div className={styles.seal}><Compass size={27}/></div></div>
  <div className={styles.intro}><BookOpen size={21}/><p><b>Um sistema de cultivo só seu.</b> A origem espiritual já pertence ao seu gladiador. Despertar revela essa identidade; não troca seu equipamento nem altera os atributos da arena.</p></div>
  <div className={styles.tabs} role="tablist" aria-label="Páginas do santuário">{([['core','Núcleo'],['meridians','Meridianos'],['roadmap','Jornada']] as const).map(([id,label])=><Button key={id} role="tab" id={'cult-tab-'+id} aria-selected={tab===id} aria-controls={'cult-panel-'+id} className={tab===id?styles.activeTab:''} variant="ghost" onClick={()=>{setTab(id);setConfirming(false);}}>{label}</Button>)}</div>
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
     <Button className={styles.goldButton} onClick={()=>setTab('meridians')}>EXAMINAR MERIDIANOS <ChevronRight size={18}/></Button>
     <small className={styles.note}>Cultivo ativo, novos bônus e feras serão integrados nas próximas etapas. O combate atual não foi rebalanceado.</small>
    </>}
   </article>
  </div>}
  {tab==='meridians'&&<div role="tabpanel" id="cult-panel-meridians" aria-labelledby="cult-tab-meridians" className={styles.meridianGrid}>
   <div className={styles.diagramPanel}><span>ATLAS DOS CANAIS INTERIORES</span><MeridianDiagram model={model}/><p>{awakened?`${model.meridians.filter(m=>m.open).length} canais abertos no despertar`:'O fluxo ainda está adormecido'}</p></div>
   <article className={styles.dossier}><span className={styles.eyebrow}>ANATOMIA ESPIRITUAL</span><h2>Doze caminhos.<br/>Uma essência.</h2><p>O despertar abre de um a sete meridianos iniciais, conforme o potencial do núcleo. Nenhuma essência é gasta para examiná-los.</p><div className={styles.meridians}>{model.meridians.map((m,i)=><div key={m.id} data-meridian-id={m.id} className={m.refined?styles.refined:m.open?styles.openMeridian:styles.closedMeridian}><b>{String(i+1).padStart(2,'0')}</b><span>{MERIDIANS[i]}<small>{m.refined?'Refinado':m.open?'Aberto':'Fechado'}</small></span>{m.open?<Check size={14}/>:<Lock size={13}/>}</div>)}</div><div className={styles.promise}><Lock size={16}/><p><b>Próxima etapa:</b> meditar, abrir e refinar meridianos, condensar estrelas e acumular essência offline. Esses comandos ainda não estão ativos.</p></div></article>
  </div>}
  {tab==='roadmap'&&<div role="tabpanel" id="cult-panel-roadmap" aria-labelledby="cult-tab-roadmap" className={styles.roadmap}>
   <div className={styles.roadmapIntro}><span className={styles.eyebrow}>CRÔNICAS DA EXPANSÃO</span><h2>Da centelha ao Avatar.</h2><p>Dez entregas sobre o jogo ilustrado. Só a etapa 1 está disponível nesta versão.</p></div>
   {ExpansionRoadmap.map(stage=><article key={stage.id} className={stage.id===1?styles.currentStage:styles.futureStage}><span>{String(stage.id).padStart(2,'0')}</span><div><h3>{stage.title}</h3><p>{stage.detail}</p></div>{stage.id===1?<Check size={21}/>:<Lock size={17}/>}</article>)}
  </div>}
  <footer className={styles.footer}><div><Shield size={19}/><p><b>Seu progresso vem primeiro.</b> Ouro, armas, vitórias e o núcleo usam o mesmo Save v5. Antes de mudar de arquivo, guarde um código ARENA5.</p></div><Button variant="outline" onClick={onBackup}>BACKUP E AJUDA</Button></footer>
  {storageWarning&&<p role="alert" className={styles.storageWarning}>{storageWarning}</p>}
 </section>;
};
