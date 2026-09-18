import React,{useEffect,useRef,useState} from 'react';
import {Button} from './Button';
import {ArrowLeft,ArrowRight,Shield,Sword,Swords,Flame,ChevronsLeft,ArrowUp,Pause,Play,Volume2,VolumeX,Flag} from 'lucide-react';
import {ArenaTypes as T} from '../helpers/ArenaTypes';
import {ArenaEngine} from '../helpers/ArenaEngine';
import {ArenaRenderer} from '../helpers/ArenaRenderer';
import {ArenaAudio} from '../helpers/ArenaAudio';
import {ArenaData as D} from '../helpers/ArenaData';
import {ArenaItemIcon} from './ArenaItemIcon';
import {ArenaSigil} from './ArenaSigil';
import styles from './ArenaBattle.module.css';
type Control='left'|'right'|'block'|T.Action;
type Props={save:T.Save;encounterId:number;practice:boolean;onFinish:(result:T.Result)=>void;onExit:()=>void;onSound:(value:boolean)=>void};
const controls:{key:Control;label:string;sub:string;Icon:typeof Sword}[]=[
 {key:'block',label:'ESCUDO',sub:'Segure · apare',Icon:Shield},
 {key:'light',label:'LEVE',sub:'14 vigor · combo',Icon:Sword},
 {key:'heavy',label:'PESADO',sub:'30 vigor',Icon:Swords},
 {key:'dodge',label:'ESQUIVA',sub:'22 vigor',Icon:ChevronsLeft},
 {key:'jump',label:'PULAR',sub:'12 vigor',Icon:ArrowUp},
 {key:'special',label:'FÚRIA',sub:'100 de fúria',Icon:Flame}
];
export const ArenaBattle=({save,encounterId,practice,onFinish,onExit,onSound}:Props)=>{
 const [engine]=useState(()=>new ArenaEngine(save,encounterId,practice));
 const [snapshot,setSnapshot]=useState(()=>engine.snapshot());
 const [paused,setPaused]=useState(false),[sound,setSound]=useState(save.sound),[held,setHeld]=useState<string[]>([]),[error,setError]=useState('');
 const canvasRef=useRef<HTMLCanvasElement>(null),audioRef=useRef<ArenaAudio|null>(null),pointerRef=useRef(new Map<number,Control>()),keysRef=useRef(new Set<string>());
 const doneRef=useRef(onFinish);doneRef.current=onFinish;
 const clear=()=>{pointerRef.current.clear();keysRef.current.clear();engine.clearInput();setHeld([]);};
 const pause=(value:boolean)=>{clear();engine.setPaused(value);setPaused(value);};
 const sync=()=>{
   const values=Array.from(pointerRef.current.values());const keys=keysRef.current;
   engine.input.move=Number(values.includes('right')||keys.has('ArrowRight')||keys.has('KeyD'))-Number(values.includes('left')||keys.has('ArrowLeft')||keys.has('KeyA'));
   engine.input.block=values.includes('block')||keys.has('KeyL')||keys.has('ShiftLeft')||keys.has('ShiftRight');setHeld(values);
 };
 const down=(key:Control)=>(e:React.PointerEvent<HTMLButtonElement>)=>{
   e.preventDefault();if(engine.paused)return;
   try{e.currentTarget.setPointerCapture(e.pointerId);}catch{}
   pointerRef.current.set(e.pointerId,key);sync();
   if(!['left','right','block'].includes(key))engine.command(key as T.Action);
   if(sound&&audioRef.current&&(!audioRef.current.context||audioRef.current.context.state==='suspended'))void audioRef.current.enable(true);
 };
 const up=(e:React.PointerEvent<HTMLButtonElement>)=>{pointerRef.current.delete(e.pointerId);sync();};
 useEffect(()=>{
   const canvas=canvasRef.current;if(!canvas)return;
   let renderer:ArenaRenderer;
   try{renderer=new ArenaRenderer(canvas);}catch(err){setError(String(err));return;}
   renderer.reduced=save.reducedMotion;
   const audio=new ArenaAudio();audio.enabled=save.sound;audioRef.current=audio;
   let raf=0,last=0,ui=0,done=false;
   const resize=()=>{const r=canvas.getBoundingClientRect();renderer.resize(r.width,r.height);};
   const observer=new ResizeObserver(resize);observer.observe(canvas);resize();
   const loop=(time:number)=>{
     const dt=Math.min(.05,(time-last)/1000||0);last=time;
     if(!document.hidden){engine.step(dt);renderer.render(engine,dt);}
     for(const event of engine.drainEvents())audio.play(event);
     ui+=dt;if(ui>.09){ui=0;setSnapshot(engine.snapshot());}
     if(engine.result&&!done){done=true;doneRef.current(engine.result);return;}
     raf=requestAnimationFrame(loop);
   };
   const loseFocus=()=>{engine.setPaused(true);pointerRef.current.clear();keysRef.current.clear();setHeld([]);setPaused(true);};
   const visibility=()=>{if(document.hidden)loseFocus();last=performance.now();};
   const actionMap:Record<string,T.Action>={KeyJ:'light',KeyK:'heavy',Space:'dodge',KeyW:'jump',ArrowUp:'jump',KeyE:'special'};
   const keydown=(e:KeyboardEvent)=>{
     if(e.code==='Escape'){e.preventDefault();const next=!engine.paused;engine.setPaused(next);setPaused(next);pointerRef.current.clear();keysRef.current.clear();setHeld([]);return;}
     if(['ArrowLeft','ArrowRight','KeyA','KeyD','KeyL','ShiftLeft','ShiftRight',...Object.keys(actionMap)].includes(e.code)){
       e.preventDefault();if(engine.paused)return;keysRef.current.add(e.code);sync();if(!e.repeat&&actionMap[e.code])engine.command(actionMap[e.code]);
       if(audio.enabled&&(!audio.context||audio.context.state==='suspended'))void audio.enable(true);
     }
   };
   const keyup=(e:KeyboardEvent)=>{keysRef.current.delete(e.code);sync();};
   window.addEventListener('blur',loseFocus);document.addEventListener('visibilitychange',visibility);window.addEventListener('keydown',keydown);window.addEventListener('keyup',keyup);
   raf=requestAnimationFrame(loop);
   return()=>{done=true;cancelAnimationFrame(raf);observer.disconnect();window.removeEventListener('blur',loseFocus);document.removeEventListener('visibilitychange',visibility);window.removeEventListener('keydown',keydown);window.removeEventListener('keyup',keyup);engine.clearInput();audio.dispose();audioRef.current=null;};
 },[engine]);
 const toggleSound=async()=>{const next=!sound;setSound(next);onSound(next);await audioRef.current?.enable(next);};
 const bar=(value:number,max:number,type:string,label:string)=><div className={`${styles.meter} ${styles[type]}`} role="progressbar" aria-label={label} aria-valuenow={Math.round(value)} aria-valuemax={max} aria-valuemin={0}><span style={{width:`${Math.max(0,value/max*100)}%`}}/></div>;
 const f=engine.player,e=engine.enemy;
 return <section className={styles.shell} aria-label="Combate de gladiadores" data-build="arena-3">
   <header className={styles.header}>
     <div className={styles.fighterHud}><div className={styles.hudIdentity}><ArenaItemIcon item={f.helmet} size={40} framed={false}/><div><strong>{f.name}</strong><span>{snapshot.player.hp} / {f.maxHp} PV</span></div></div>{bar(f.hp,f.maxHp,'life','Sua vida')}{bar(f.stamina,f.maxStamina,'stamina','Seu vigor')}{bar(f.posture,f.maxPosture,'posture','Sua postura')}</div>
     <div className={styles.middle}><span>{practice?'TREINO':`DUELO ${encounterId+1}`}</span><b>{String(Math.floor(snapshot.time/60)).padStart(2,'0')}:{String(Math.floor(snapshot.time%60)).padStart(2,'0')}</b><Button className={styles.pauseButton} variant="ghost" onClick={()=>pause(true)} aria-label="Pausar combate"><Pause size={18}/></Button></div>
     <div className={`${styles.fighterHud} ${styles.enemyHud}`}><div className={styles.hudIdentity}><ArenaItemIcon item={e.helmet} size={40} framed={false}/><div><strong>{e.name}</strong><span>{snapshot.enemy.hp} / {e.maxHp} PV</span></div></div>{bar(e.hp,e.maxHp,'enemyLife','Vida do rival')}{bar(e.stamina,e.maxStamina,'stamina','Vigor do rival')}{bar(e.posture,e.maxPosture,'posture','Postura do rival')}</div>
   </header>
   <div className={styles.stage}>
     <canvas ref={canvasRef} className={styles.canvas} aria-label="Arena com personagens articulados em movimento"/>
     <div className={styles.arenaLabel}>{D.arenas[engine.encounter.arena].name}<span>{engine.encounter.epithet}</span></div>
     {engine.announceTime>0&&engine.intro<=0&&<div className={styles.announcement}>{engine.announcement}</div>}
     {snapshot.hits>0&&<div className={styles.hitCount}>{snapshot.hits}<small>ACERTOS</small></div>}
     {engine.enemy.bleed>0&&<div className={styles.status}>Rival sangrando</div>}
     {engine.intro<=0&&snapshot.time<12&&snapshot.hits===0&&<p className={styles.tutorial}>A/D ou setas: aproxime-se.<br/>J: golpe leve · K: pesado · Esc: pausa.</p>}
     {error&&<div className={styles.announcement}>{error}</div>}
   </div>
   <div className={styles.furyLine}><Flame size={13}/>{bar(f.rage,100,'rage','Sua fúria')}<span>{snapshot.player.rage}%</span><small>LEVE × 3 = COMBO</small></div>
   <div className={styles.controls}>
     <div className={styles.movement}>
       <span>MOVIMENTO</span><div>{[{key:'left' as const,Icon:ArrowLeft,label:'Mover para a esquerda'},{key:'right' as const,Icon:ArrowRight,label:'Mover para a direita'}].map(({key,Icon,label})=><Button key={key} className={`${styles.moveButton} ${held.includes(key)?styles.pressed:''}`} onPointerDown={down(key)} onPointerUp={up} onPointerCancel={()=>pause(true)} onLostPointerCapture={up} aria-label={label}><Icon size={27}/></Button>)}</div>
       <Button variant="ghost" className={styles.soundButton} onClick={toggleSound} aria-label={sound?'Desligar som':'Ligar som'}>{sound?<Volume2 size={16}/>:<VolumeX size={16}/>}<span>{sound?'SOM LIGADO':'SEM SOM'}</span></Button>
     </div>
     <div className={styles.actionGrid}>{controls.map(({key,label,sub,Icon})=>{
       const ready=key==='special'?f.rage>=100:key==='dodge'?f.dodgeCooldown<=0:true;
       return <Button key={key} data-action={key} className={`${styles.action} ${key==='light'?styles.mainAction:''} ${held.includes(key)?styles.pressed:''} ${!ready?styles.charging:''} ${key==='special'&&ready?styles.furyReady:''}`} aria-label={label} onPointerDown={down(key)} onPointerUp={up} onPointerCancel={()=>pause(true)} onLostPointerCapture={up}><span className={styles.actionEmblem}>{key==='light'||key==='heavy'?<ArenaItemIcon item={f.weapon} size={33} framed={false}/>:key==='block'?<ArenaItemIcon item={f.shield} size={33} framed={false}/>:<Icon size={24}/>}</span><b>{label}</b><small>{key==='dodge'&&f.dodgeCooldown>0?`${f.dodgeCooldown.toFixed(1)}s`:sub}</small></Button>;
     })}</div>
   </div>
   {paused&&<div className={styles.pauseScreen}><div className={styles.pauseCard}><ArenaSigil size={88}/><span>O TEMPO ESTÁ PARADO</span><h2>Combate pausado</h2><p>Apare erguendo o escudo pouco antes do impacto. Ataques pesados quebram a postura; recuar recupera vigor.</p><Button className={styles.resume} onClick={()=>pause(false)}><Play size={19}/> CONTINUAR</Button><Button variant="outline" onClick={onExit}><Flag size={17}/> ABANDONAR DUELO</Button><small>A/D ou setas: mover · J: leve · K: pesado<br/>L: escudo · espaço: esquiva · W: salto · E: fúria</small></div></div>}
 </section>;
};
