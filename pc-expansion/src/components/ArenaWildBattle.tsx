import React,{useEffect,useRef,useState} from 'react';
import {Button} from './Button';
import {BeastPortrait} from './BeastPortrait';
import {ArenaSigil} from './ArenaSigil';
import {ArenaItemIcon} from './ArenaItemIcon';
import {WildCombatEngine} from '../helpers/WildCombatEngine';
import {WildWorld} from '../helpers/WildWorld';
import {WildRig} from '../helpers/WildRig';
import {WildScenery} from '../helpers/WildScenery';
import {BeastEngine} from '../helpers/BeastEngine';
import {ArenaSaveTypes as R} from '../helpers/ArenaSaveTypes';
import {ArenaTypes as A} from '../helpers/ArenaTypes';
import {WildCheckpoint,WildResolution,WildTicket} from '../helpers/WildTypes';
import {ArenaAudio} from '../helpers/ArenaAudio';
import {ArrowLeft,ArrowRight,ArrowUp,Shield,Swords,Flame,ChevronsLeft,Pause,Play,Flag,Sparkles,Link,Volume2,VolumeX} from 'lucide-react';
import styles from './ArenaWildBattle.module.css';
type Control='left'|'right'|'block'|A.Action|'focus'|'subdue';
type Props={root:R.SaveV5;ticket:WildTicket;onCheckpoint:(id:string,cp:WildCheckpoint)=>void;onFinish:(r:WildResolution)=>boolean;onBack:()=>void;onSound:(value:boolean)=>void;};
const labels:Record<string,string>={captured:'Pacto estabelecido',defeated:'Fera derrotada',escaped:'A fera escapou',retreated:'Retorno seguro',lost:'Recuo forçado'};
export const ArenaWildBattle=({root,ticket,onCheckpoint,onFinish,onBack,onSound}:Props)=>{
 const [engine]=useState(()=>new WildCombatEngine(root,ticket));
 const [,redraw]=useState(0),[sound,setSound]=useState(root.settings.sound),[settled,setSettled]=useState(false),[error,setError]=useState('');
 const canvasRef=useRef<HTMLCanvasElement>(null),beastRef=useRef<HTMLDivElement>(null),audioRef=useRef<ArenaAudio|null>(null),keys=useRef(new Set<string>()),pointers=useRef(new Map<number,Control>());
 const callbacks=useRef({onCheckpoint,onFinish});callbacks.current={onCheckpoint,onFinish};
 const region=WildWorld.region(ticket.region)!,species=BeastEngine.species(ticket.species)!,p=engine.player,a=engine.actor;
 const changed=()=>redraw(n=>n+1);
 const snapshot=()=>callbacks.current.onCheckpoint(ticket.id,engine.checkpoint());
 const clear=()=>{keys.current.clear();pointers.current.clear();engine.martial.clearInput();};
 const pause=(value:boolean)=>{clear();engine.setPaused(value);snapshot();changed();};
 const sync=()=>{const k=keys.current,v=[...pointers.current.values()];engine.input.move=Number(v.includes('right')||k.has('KeyD')||k.has('ArrowRight'))-Number(v.includes('left')||k.has('KeyA')||k.has('ArrowLeft'));engine.input.block=v.includes('block')||k.has('KeyL')||k.has('ShiftLeft')||k.has('ShiftRight');};
 const act=(action:A.Action|'focus'|'subdue')=>{const before=engine.phase;engine.command(action);if(before!==engine.phase)snapshot();changed();};
 const down=(control:Control)=>(event:React.PointerEvent<HTMLButtonElement>)=>{
  event.preventDefault();if(engine.paused||engine.phase!=='combat')return;
  try{event.currentTarget.setPointerCapture(event.pointerId);}catch{}
  pointers.current.set(event.pointerId,control);sync();if(!['left','right','block'].includes(control))act(control as A.Action|'focus'|'subdue');
  if(sound)void audioRef.current?.enable(true);
 };
 const up=(e:React.PointerEvent<HTMLButtonElement>)=>{pointers.current.delete(e.pointerId);sync();};
 const seal=()=>{if(engine.seal()){snapshot();changed();}};
 useEffect(()=>{
  const canvas=canvasRef.current,svg=beastRef.current?.querySelector('svg');if(!canvas||!svg)return;
  const renderer=new WildScenery(canvas),audio=new ArenaAudio();audioRef.current=audio;audio.enabled=sound;
  const actor=svg.querySelector('[class*="_actor"]') as SVGGElement;
  const groups=(name:string)=>[...svg.querySelectorAll(`[class*="_${name}"]`)] as SVGElement[];
  const front=groups('frontLeg'),rear=groups('rearLeg'),heads=groups('head'),tails=groups('tail'),wings=groups('wingFront'),rearWings=groups('wingBack'),whiskers=groups('whiskers');
  let raf=0,last=0,ui=0,persist=0,lastPhase=engine.phase,disposed=false;
  const resize=()=>{const r=canvas.getBoundingClientRect();renderer.resize(r.width,r.height);};const ro=new ResizeObserver(resize);ro.observe(canvas);resize();
  const frame=(t:number)=>{
   if(disposed)return;const dt=Math.min(.05,(t-last)/1000||0);last=t;
   if(!document.hidden)engine.step(dt);
   const pos=renderer.render(engine,region,dt,root.settings.reducedMotion),rootPose=WildRig.root(engine.actor),m=engine.actor,scale=pos.zoom*m.scale;
   svg.style.transform=`translate(${pos.x-151}px,${pos.y-178}px) scale(${scale*m.face},${scale})`;
   svg.style.transformOrigin='151px 178px';svg.style.width='320px';svg.style.height='220px';
   if(actor)actor.setAttribute('transform',`translate(151 178) scale(.84) translate(${rootPose.x} ${rootPose.y}) rotate(${rootPose.angle*180/Math.PI})`);
   const gait=m.state==='walk'||m.state==='strike'?Math.sin(m.walk)*14:0;
   front.forEach((g,i)=>g.style.transform=`rotate(${gait*(i%2?-1:1)}deg)`);rear.forEach((g,i)=>g.style.transform=`rotate(${-gait*(i%2?-1:1)}deg)`);
   heads.forEach(g=>g.style.transform=`rotate(${m.state==='windup'?8:m.state==='strike'?-8:Math.sin(m.walk*.5)*2}deg)`);
   tails.forEach(g=>g.style.transform=`rotate(${Math.sin(m.walk)*7}deg)`);
   wings.forEach(g=>g.style.transform=`rotate(${Math.sin(m.walk*1.8)*22}deg)`);rearWings.forEach(g=>g.style.transform=`rotate(${-Math.sin(m.walk*1.8)*16}deg)`);
   whiskers.forEach(g=>g.style.transform=`rotate(${Math.sin(m.walk)*4}deg)`);
   svg.style.filter=m.flash>0&&!root.settings.reducedMotion?'brightness(1.4)':'none';
   svg.dataset.state=m.state;svg.dataset.worldX=m.x.toFixed(1);svg.dataset.phase=engine.phase;
   for(const ev of engine.martial.drainEvents())audio.play(ev);
   ui+=dt;persist+=dt;if(ui>=.09){ui=0;changed();}
   if(engine.phase!==lastPhase||persist>=2){persist=0;lastPhase=engine.phase;snapshot();}
   raf=requestAnimationFrame(frame);
  };
  const lost=()=>{clear();engine.setPaused(true);snapshot();changed();};
  const visibility=()=>{if(document.hidden)lost();last=performance.now();};
  const commands:Record<string,A.Action|'focus'|'subdue'>={KeyJ:'light',KeyK:'heavy',Space:'dodge',KeyW:'jump',ArrowUp:'jump',KeyE:'special',KeyR:'focus',KeyB:'subdue'};
  const keydown=(e:KeyboardEvent)=>{
   if(e.code==='Escape'){e.preventDefault();pause(!engine.paused);return;}
   if(e.code==='Enter'&&engine.phase==='duel'){e.preventDefault();if(!e.repeat)seal();return;}
   if(['KeyA','KeyD','ArrowLeft','ArrowRight','KeyL','ShiftLeft','ShiftRight',...Object.keys(commands)].includes(e.code)){
    e.preventDefault();if(engine.paused||engine.phase!=='combat')return;keys.current.add(e.code);sync();if(!e.repeat&&commands[e.code])act(commands[e.code]);
   }
  };
  const keyup=(e:KeyboardEvent)=>{keys.current.delete(e.code);sync();};
  window.addEventListener('keydown',keydown);window.addEventListener('keyup',keyup);window.addEventListener('blur',lost);window.addEventListener('pagehide',lost);document.addEventListener('visibilitychange',visibility);
  raf=requestAnimationFrame(frame);
  return()=>{disposed=true;cancelAnimationFrame(raf);ro.disconnect();clear();audio.dispose();window.removeEventListener('keydown',keydown);window.removeEventListener('keyup',keyup);window.removeEventListener('blur',lost);window.removeEventListener('pagehide',lost);document.removeEventListener('visibilitychange',visibility);};
 },[engine]);
 const commit=()=>{const result=engine.resolution();if(!result)return;if(callbacks.current.onFinish(result)){setSettled(true);setError('');}else setError('Não foi possível concluir a transação. O combate foi preservado. Retome a expedição em uma única aba.');};
 const bar=(label:string,value:number,max:number,kind:string)=><div className={`${styles.meter} ${styles[kind]}`} role="progressbar" aria-label={label} aria-valuenow={Math.round(value)} aria-valuemin={0} aria-valuemax={max}><i style={{width:`${Math.max(0,value/max*100)}%`}}/></div>;
 const controls:{key:Control;label:string;hint:string;icon:React.ReactNode}[]=[{key:'block',label:'ESCUDO',hint:'L / Shift',icon:<Shield/>},{key:'light',label:'LEVE',hint:'J · combo',icon:<ArenaItemIcon item={p.weapon} size={29} framed={false}/>},{key:'heavy',label:'PESADO',hint:'K',icon:<Swords/>},{key:'dodge',label:'ESQUIVA',hint:'Espaço',icon:<ChevronsLeft/>},{key:'jump',label:'SALTAR',hint:'W / ↑',icon:<ArrowUp/>},{key:'special',label:'FÚRIA',hint:'E · 100%',icon:<Flame/>}];
 const rewards=engine.outcome?WildWorld.rewards(ticket,engine.outcome):{gold:0,essence:0};
 return <section className={styles.shell} data-wild-battle={ticket.id} aria-label="Combate contra fera selvagem">
  <header className={styles.header}><div><span>GLADIADOR</span><strong>{p.name}</strong><small>{Math.ceil(p.hp)}/{p.maxHp} PV</small>{bar('Sua vida selvagem',p.hp,p.maxHp,'life')}{bar('Seu vigor selvagem',p.stamina,p.maxStamina,'stamina')}{bar('Sua postura selvagem',p.posture,p.maxPosture,'posture')}</div><div className={styles.middle}><span>EXPEDIÇÃO</span><b>{Math.floor(engine.elapsed/60)}:{String(Math.floor(engine.elapsed%60)).padStart(2,'0')}</b><Button variant="ghost" onClick={()=>pause(true)} aria-label="Pausar expedição"><Pause size={19}/></Button></div><div className={styles.enemy}><span>FERA SELVAGEM · NÍVEL {ticket.level}</span><strong>{species.name}</strong><small>{Math.ceil(a.hp)}/{a.maxHp} PV · vontade {Math.ceil(a.will)}%</small>{bar('Vida da fera',a.hp,a.maxHp,'life')}{bar('Vontade da fera',a.will,100,'will')}<em>Captura: vida ≤40% · vontade ≤60%</em></div></header>
  <div className={styles.stage}><canvas ref={canvasRef} aria-label="Habitat animado e gladiador articulado"/><div ref={beastRef} className={styles.beastLayer}><BeastPortrait species={ticket.species} reduced/></div><div className={styles.location}>{region.name}<span>{species.nature} · {species.archetype}</span></div>{a.state==='windup'&&engine.phase==='combat'&&<div className={styles.telegraph} role="status">ATAQUE EM PREPARAÇÃO · {Math.max(0,a.duration-a.elapsed).toFixed(1)} s</div>}{engine.messageTime>0&&engine.phase==='combat'&&<div className={styles.message}>{engine.message}</div>}</div>
  <div className={styles.resonance}><Flame size={15}/>{bar('Fúria selvagem',p.rage,100,'rage')}<span>{Math.floor(p.rage)}%</span><Button variant="ghost" onClick={()=>{const next=!sound;setSound(next);onSound(next);void audioRef.current?.enable(next);}} aria-label={sound?'Desligar som selvagem':'Ligar som selvagem'}>{sound?<Volume2 size={16}/>:<VolumeX size={16}/>}</Button></div>
  <div className={styles.spiritControls}><Button data-wild-action="focus" onClick={()=>act('focus')} disabled={engine.paused||engine.phase!=='combat'||engine.focusCooldown>0}><Sparkles size={18}/> FOCAR · R<small>{engine.focusCooldown>0?`${engine.focusCooldown.toFixed(1)} s`:'18 vigor · vulnerável por 1,1 s'}</small></Button><Button className={engine.readyToCapture?styles.captureReady:''} data-wild-action="subdue" onClick={()=>act('subdue')} disabled={!engine.readyToCapture||engine.paused}><Link size={18}/> SUBJUGAR · B<small>{engine.readyToCapture?'A fera pode aceitar o pacto':'Reduza vida e vontade'}</small></Button></div>
  <div className={styles.controls}><div className={styles.movement}><small>MOVER · A / D</small><div>{([{key:'left',Icon:ArrowLeft,label:'Mover à esquerda na expedição'},{key:'right',Icon:ArrowRight,label:'Mover à direita na expedição'}] as const).map(({key,Icon,label})=><Button key={key} aria-label={label} onPointerDown={down(key)} onPointerUp={up} onLostPointerCapture={up} onPointerCancel={()=>pause(true)}><Icon size={24}/></Button>)}</div></div><div className={styles.actionGrid}>{controls.map(({key,label,hint,icon})=><Button key={key} data-wild-action={key} className={key==='light'?styles.mainAction:''} aria-label={label+' na expedição'} onPointerDown={down(key)} onPointerUp={up} onLostPointerCapture={up} onPointerCancel={()=>pause(true)}><span>{icon}</span><b>{label}</b><small>{hint}</small></Button>)}</div></div>
  {engine.phase==='duel'&&!engine.paused&&<div className={styles.overlay}><div className={styles.duelCard}><div className={styles.sealEmblem}><Link size={46}/></div><span>CONFRONTO ESPIRITUAL · {species.name.toUpperCase()}</span><h2>Três pulsos. Um vínculo.</h2><p>Sele no centro dourado. São necessários <b>60 pontos de média</b>, incluindo o bônus de compatibilidade.</p><div className={styles.sealScores}>{[0,1,2].map(i=><div key={i} className={i<engine.seals.length?styles.sealed:''}>{i<engine.seals.length?Math.round(engine.seals[i]):i+1}<small>{i<engine.seals.length?'PONTOS':'PULSO'}</small></div>)}</div><div className={styles.track}><div className={styles.target}/><i style={{left:`${engine.needle}%`}}/></div><p className={styles.bonus}>Afinidade com o núcleo + enfraquecimento: <b>+{engine.duelBonus.toFixed(1)}</b> · {Math.ceil(10-engine.needleTime)} s para este pulso.</p><Button className={styles.gold} onClick={seal}>SELAR PULSO · ENTER</Button><small>Falhar devolve a fera ao combate. Após 3 rejeições, ela escapa. A física fica suspensa durante os pulsos.</small><Button variant="ghost" onClick={()=>pause(true)}>PAUSAR</Button></div></div>}
  {engine.phase==='resolved'&&!engine.paused&&<div className={styles.overlay}><div className={styles.resultCard}><div className={styles.resultPortrait}><BeastPortrait species={ticket.species} reduced={root.settings.reducedMotion}/></div><span>EXPEDIÇÃO {ticket.serial} · ENCERRADA</span><h2>{labels[engine.outcome!]}</h2><p>{engine.outcome==='captured'?`${species.name} reconheceu seu núcleo. Este indivíduo será enviado ao Santuário com a mesma linhagem do encontro.`:engine.outcome==='defeated'?'A fera foi derrotada antes do pacto. Não entra na coleção.':'Seu personagem e os companheiros estão seguros. Não há perda de ouro ou equipamento.'}</p><div className={styles.rewards}><b>+{rewards.gold} ouro</b><b>+{rewards.essence} essência</b></div>{engine.outcome==='captured'&&<p>Potencial {ticket.individual.potential}/100 · linhagem primordial {ticket.individual.bloodline.primordial}%</p>}{error&&<p role="alert">{error}</p>}{settled?<><p className={styles.saved}>Resultado registrado. Recompensas aplicadas uma única vez.</p><Button className={styles.gold} onClick={onBack}>VOLTAR ÀS EXPEDIÇÕES</Button></>:<Button className={styles.gold} disabled={!engine.canCollect} onClick={commit}>REGISTRAR RESULTADO</Button>}</div></div>}
  {engine.paused&&<div className={styles.overlay}><div className={styles.pauseCard}><ArenaSigil size={76}/><h2>Expedição pausada</h2><p>Vida e vontade são diferentes. Foco espiritual e aparos reduzem a vontade sem ferir a criatura.</p><Button className={styles.gold} onClick={()=>pause(false)}><Play size={18}/> CONTINUAR EXPEDIÇÃO</Button>{engine.phase!=='resolved'&&<Button variant="outline" onClick={()=>{engine.setPaused(false);engine.retreat();snapshot();changed();}}><Flag size={16}/> RECUAR SEM CAPTURA</Button>}<small>A/D: mover · J/K: atacar · L: guarda · W: salto<br/>Espaço: esquiva · E: fúria · R: foco · B: subjugar</small><p className={styles.saveNote}>O encontro tem um registro automático a cada 2 s. Ao reabrir, use Retomar. O relógio offline não simula batalhas.</p></div></div>}
 </section>;
};
