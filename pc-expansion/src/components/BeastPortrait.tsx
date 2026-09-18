import React,{useId} from 'react';
import {BeastEngine} from '../helpers/BeastEngine';
import styles from './BeastPortrait.module.css';

type Props={species:string;mode?:'idle'|'move';reduced?:boolean;silhouette?:boolean;scene?:boolean;className?:string};
const INK='#302a22';
/** Layered SVG rigs: moving joints, tails, gills and wings. No emoji or external sprite. */
export const BeastPortrait=({species,mode='idle',reduced=false,silhouette=false,scene=false,className=''}:Props)=>{
 const uid=useId().replace(/:/g,''),s=BeastEngine.species(species);
 if(!s)return <svg className={`${styles.portrait} ${className}`} viewBox="0 0 320 220" role="img" aria-label="Espécie de um registro anterior, preservada"><path d="M160 45L230 110L160 180L90 110Z" fill="#786652" stroke={INK} strokeWidth="3"/><text x="160" y="125" textAnchor="middle" fontSize="42" fill="#f2dab0">?</text></svg>;
 const c=s.color,a=s.accent,l=s.light,an=s.anatomy;
 const leg=(x:number,y:number,rear:boolean,n:number,kind='paw')=><g key={n} className={rear?styles.rearLeg:styles.frontLeg} style={{transformOrigin:`${x}px ${y}px`,animationDelay:`${n*.32}s`}}>
  <path d={kind==='hoof'?`M${x-6} ${y} Q${x-14} ${y+25} ${x-4} ${y+38} L${x-2} -5 L${x+8} -5 L${x+7} ${y+33} L${x+10} ${y+5}Z`:`M${x-11} ${y} Q${x-18} ${y+27} ${x-5} ${y+35} L${x-5} -9 Q${x+19} -12 ${x+20} 0 L${x-14} 0 Q${x-17} -6 ${x-11} -12 L${x-14} ${y+23} Q${x-23} ${y+2} ${x-11} ${y}Z`} fill={rear?c:l} stroke={INK} strokeWidth="2.3"/>
  <path d={kind==='hoof'?`M${x-3} -12 L${x+9} -12 L${x+11} 0 L${x-5} 0Z`:`M${x-10} -8 Q${x+2} -13 ${x+15} -4 M${x+4} -6 L${x+5} -1 M${x+12} -5 L${x+13} -1`} fill={kind==='hoof'?'#483c2c':'none'} stroke={INK} strokeWidth="1.8"/>
 </g>;
 const eye=(x:number,y:number)=><g><path d={`M${x-6} ${y-3} Q${x} ${y-6} ${x+7} ${y-2} L${x+4} ${y+3} L${x-5} ${y+2}Z`} fill="#fff1c5" stroke={INK} strokeWidth="1.6"/><ellipse cx={x+2} cy={y} rx="2.1" ry="3" fill="#203c3c"/><circle cx={x+3} cy={y-1} r=".8" fill="white"/><path d={`M${x-8} ${y-6}L${x+8} ${y-5}`} stroke={INK} strokeWidth="2.5"/></g>;
 const crest=(x:number,y:number)=><g className={styles.crest} style={{transformOrigin:`${x}px ${y+20}px`}}><path d={`M${x-12} ${y+25} Q${x-23} ${y+3} ${x-10} ${y-6} L${x-6} ${y+6} Q${x+7} ${y-18} ${x+12} ${y-21} Q${x+6} ${y} ${x+22} ${y-4} Q${x+35} ${y+15} ${x+12} ${y+30}Z`} fill={a} stroke={INK} strokeWidth="2"/><path d={`M${x-3} ${y+24} Q${x-10} ${y+8} ${x+6} ${y+3} Q${x+5} ${y+18} ${x+15} ${y+12} L${x+10} ${y+27}Z`} fill="#ffedac"/></g>;
 const mammal=an==='wolf'||an==='lynx'||an==='lion'||an==='stag';
 const manePoints=Array.from({length:28},(_,i)=>{const theta=i*Math.PI/14,r=i%2?40:47;return `${52+Math.cos(theta)*r},${-86+Math.sin(theta)*r}`;}).join(' ');
 return <svg className={`${styles.portrait} ${mode==='move'?styles.moving:styles.idle} ${reduced?styles.still:''} ${className}`} viewBox="0 0 320 220" role="img" aria-label={silhouette?`Silhueta do registro ${s.number}`:`${s.name}, ${mode==='move'?'deslocamento animado':'respiração e postura animadas'}`} data-species-art={s.id} data-anatomy={an}>
 <defs><linearGradient id={'sky'+uid} x2="0" y2="1"><stop stopColor="#aac7b6"/><stop offset="1" stopColor="#f2ddb0"/></linearGradient><radialGradient id={'glow'+uid}><stop stopColor={a} stopOpacity=".25"/><stop offset="1" stopColor={a} stopOpacity="0"/></radialGradient></defs>
 {scene&&<g aria-hidden="true"><rect width="320" height="220" fill={'url(#sky'+uid+')'}/><circle cx="260" cy="45" r="24" fill="#ffe7a3"/>
 <path d="M0 110L46 59L83 91L135 38L201 100L253 61L320 103V175H0Z" fill="#758f80"/><path d="M0 132Q72 102 139 120Q238 87 320 136V220H0Z" fill="#6d8d62"/>
 <path d="M0 163Q137 128 320 168V220H0Z" fill="#d5bd86"/>
 {['Umbral','Terra','Solar'].includes(s.nature)&&<g fill="#b2a079" stroke="#685c48" strokeWidth="2"><path d="M17 53H42V165H17Z M12 48H47V61H12Z M277 65H300V163H277Z M273 60H304V73H273Z"/><path d="M27 58V160 M287 72V159" fill="none"/></g>}
 {['Natureza','Fogo','Água'].includes(s.nature)&&<g fill="#386754" stroke="#284a3c" strokeWidth="2"><path d="M1 143L29 39L53 143Z M275 139L301 41L329 139Z"/><path d="M27 128L31 166 M297 123L299 165" stroke="#7b6241" strokeWidth="6"/></g>}
 <path d="M0 211Q115 171 320 209" fill="none" stroke="#a99168" strokeWidth="2"/>
 </g>}
 <ellipse cx="160" cy="155" rx="121" ry="74" fill={'url(#glow'+uid+')'}/><ellipse cx="164" cy="186" rx={an==='raptor'?49:98} ry="10" fill="#443d2b" opacity=".18"/>
 <g className={`${styles.actor} ${silhouette?styles.silhouette:''}`} transform="translate(151 178) scale(.84)" strokeLinejoin="round" strokeLinecap="round">
 {mammal&&<>
 <g className={styles.tail} style={{transformOrigin:'-57px -63px'}}>
 {an==='wolf'?<><path d="M-54-65Q-83-119-112-95L-122-104L-119-82L-135-79Q-113-47-79-42L-56-44Z" fill={c} stroke={INK} strokeWidth="3"/><path d="M-86-70L-120-102L-119-82L-132-78Q-112-64-94-49Z" fill={a}/></>:an==='lynx'?<path d="M-66-60Q-98-53-90-33Q-72-32-69-49" fill={c} stroke={INK} strokeWidth="10"/>:an==='lion'?<><path d="M-61-52Q-117-17-117-68" fill="none" stroke={INK} strokeWidth="10"/><path d="M-61-52Q-117-17-117-68" fill="none" stroke={l} strokeWidth="6"/><path d="M-120-65Q-132-83-117-92Q-102-80-113-66" fill="#825031" stroke={INK} strokeWidth="2"/></>:<path d="M-63-61L-94-74L-80-45L-67-40" fill={l} stroke={INK} strokeWidth="2"/>}
 </g>
 {leg(-47,-47,true,1,an==='stag'?'hoof':'paw')}{leg(42,-55,true,2,an==='stag'?'hoof':'paw')}
 <g className={styles.torso}>
 <path d={an==='stag'?'M-72-68Q-69-97-13-91L33-103L50-131L70-127L73-80Q53-47 25-43L-44-43Q-72-41-72-68Z':'M-75-59Q-77-91-36-95Q11-107 51-86L71-59L46-35Q3-53-36-37Q-72-32-75-59Z'} fill={c} stroke={INK} strokeWidth="3"/>
 <path d={an==='stag'?'M-65-79Q-20-91 13-77L36-69Q16-48-21-55L-54-52Z':'M-68-79Q-21-101 25-83L45-61Q1-70-33-51L-58-53Z'} fill={l}/>
 <path d="M-43-88Q-22-93 0-89 M-62-63L-45-60 M-25-52L-8-55" fill="none" stroke={a} strokeWidth="2" opacity=".8"/>
 {an==='lynx'&&[-50,-24,0,24].map((v,i)=><g key={v} fill="#302c46"><ellipse cx={v} cy={-76+(i%2)*11} rx="5" ry="3"/><ellipse cx={v+12} cy={-60} rx="3" ry="5"/></g>)}
 {an==='wolf'&&<><path d="M16-87L29-121L39-109L53-129L58-101L76-97L51-77Z" fill={a} stroke={INK} strokeWidth="2.5"/>{crest(36,-103)}</>}
 {an==='lion'&&<polygon points={manePoints} fill="#976136" stroke={INK} strokeWidth="3"/>}
 {an==='stag'?<g className={styles.head} style={{transformOrigin:'57px -117px'}}><path d="M50-125L38-150L57-139L74-151L79-141L103-134L100-118L76-108L62-114Z" fill={l} stroke={INK} strokeWidth="2.5"/><path d="M84-133L108-131L105-119L92-120Z" fill={c}/>{eye(83,-132)}<path d="M103-128L108-129L107-124Z" fill={INK}/><g className={styles.antlers} stroke="#e5d29c" strokeWidth="5" fill="none"><path d="M57-146L43-169L49-196M45-169L30-184L31-197M48-187L64-195M68-146L73-171L67-197M72-172L87-185L89-199M71-184L52-203"/></g><g fill={a} stroke={INK} strokeWidth="1"><path d="M33-180Q14-188 17-173Q24-166 33-180Z M82-180Q107-187 99-169Q88-169 82-180Z M53-187Q36-207 35-193Q41-183 53-187Z"/></g><path d="M64-109L74-97L57-88L55-99Z" fill={a} stroke={INK} strokeWidth="2"/></g>:
 <g className={styles.head} style={{transformOrigin:'52px -78px'}}>
 <path d={an==='lion'?'M31-109L52-121L77-114L87-96L98-88L95-68L77-57L47-64L34-81Z':'M32-89L36-128L52-108L69-126L79-103L78-88L106-78L100-63L75-54L47-64Z'} fill={l} stroke={INK} strokeWidth="2.8"/>
 {an==='lynx'&&<path d="M36-121L26-141L39-135 M70-121L72-143L82-126" fill="#514368" stroke={INK} strokeWidth="3"/>}
 {an==='lion'?<><path d="M32-109Q23-122 34-125Q44-127 45-115 M69-117Q81-132 86-118L81-105" fill={l} stroke={INK} strokeWidth="2"/><path d="M49-74Q64-69 81-77L88-67L77-59L56-65Z" fill="#f3d5a1"/>{eye(70,-96)}</>:<><path d="M39-119L47-105L39-104 M69-117L73-103L64-104" fill={c}/>{eye(75,-88)}<path d="M60-82L66-71L90-67L77-59L60-64L54-79Z" fill="#ead3a8"/></>}
 <path d={an==='lion'?'M82-89L94-86L89-77L81-79Z':'M97-78L107-76L104-68L97-69Z'} fill={INK}/><path d={an==='lion'?'M89-76L87-69L76-70':'M73-65L95-63L103-68'} stroke={INK} strokeWidth="2" fill="none"/>
 {an==='wolf'&&<path d="M85-65L87-58L90-64 M96-64L97-59L100-66" fill="#fff0ca" stroke={INK} strokeWidth="1"/>}
 <path d="M53-75L45-70 M52-70L43-65" stroke={c} strokeWidth="1.5"/>
 </g>}
 </g>{leg(-50,-44,false,0,an==='stag'?'hoof':'paw')}{leg(41,-45,false,3,an==='stag'?'hoof':'paw')}
 {an==='lion'&&<path d="M39-68L27-49L46-36L55-54L68-50L64-69Z" fill="#996037" stroke={INK} strokeWidth="2"/>}
 </>}
 {an==='tortoise'&&<>
 <path d="M-66-33L-104-19L-79-15L-58-23Z" fill={c} stroke={INK} strokeWidth="2"/>
 {[-49,42].map((x,i)=><g key={x} className={styles.rearLeg} style={{transformOrigin:`${x}px -36px`,animationDelay:`${i*.5}s`}}><path d={`M${x-14}-44L${x+12}-34L${x+19}-6L${x-15}-6Z`} fill={c} stroke={INK} strokeWidth="2"/></g>)}
 <g className={styles.torso}><path d="M-80-36Q-94-96-48-112Q4-140 54-107Q90-85 79-30Z" fill={c} stroke={INK} strokeWidth="3.5"/><path d="M-78-41Q-65-113-13-117Q53-122 74-43Z" fill={l} stroke={INK} strokeWidth="2"/>
 <g fill="#82966e" stroke="#465139" strokeWidth="3"><path d="M-19-114L17-115L35-91L15-66L-24-69L-44-91Z M-73-62L-44-91L-24-69L-28-44L-72-40Z M35-91L61-82L73-49L42-44L15-66Z"/><path d="M-24-69L15-66L42-44L-28-44Z" fill="#b4b982"/></g>
 <g stroke={a} strokeWidth="2"><path d="M-6-112L7-94L-6-83L1-69M-62-63L-49-57L-44-43M48-75L47-64L59-51" fill="none"/></g><path d="M-87-43Q-7-27 82-43L84-29Q0-8-87-28Z" fill={a} stroke={INK} strokeWidth="3"/>
 </g><g className={styles.head} style={{transformOrigin:'66px -35px'}}><path d="M62-49L82-66L108-62L119-47L114-32L87-24L66-29Z" fill={l} stroke={INK} strokeWidth="3"/>{eye(101,-51)}<path d="M105-32L116-38M109-59L114-57" stroke={INK} strokeWidth="2"/></g>
 {[-54,41].map((x,i)=><g key={x} className={styles.frontLeg} style={{transformOrigin:`${x}px -34px`,animationDelay:`${i*.45}s`}}><path d={`M${x-12}-36L${x+12}-33L${x+17}-7L${x+21} 1L${x-20} 1L${x-15}-11Z`} fill={l} stroke={INK} strokeWidth="3"/>{[0,1,2].map(v=><path key={v} d={`M${x-12+v*11}-4L${x-10+v*11} 2L${x-4+v*11} 2L${x-5+v*11}-4Z`} fill={a} stroke={INK} strokeWidth="1"/>)}</g>)}
 </>}
 {an==='salamander'&&<>
 <g className={styles.tail} style={{transformOrigin:'-42px -35px'}}><path d="M-47-42Q-82-88-127-39L-141-17Q-105-48-65-13L-35-12Z" fill={c} stroke={INK} strokeWidth="3"/><path d="M-57-43Q-84-80-127-38Q-96-54-68-28Z" fill={a} stroke={INK} strokeWidth="1"/></g>
 {[-36,49].map((x,i)=><g key={x} className={styles.rearLeg} style={{transformOrigin:`${x}px -33px`,animationDelay:`${i*.4}s`}}><path d={`M${x}-42L${x+21}-29L${x+36}-39L${x+26}-9L${x-6}-21Z`} fill={c} stroke={INK} strokeWidth="2"/></g>)}
 <g className={styles.torso}><path d="M-66-39Q-44-72 28-63L84-47L90-18L23-10L-37-13Q-67-15-66-39Z" fill={c} stroke={INK} strokeWidth="3"/><path d="M-46-49Q-10-69 43-48L70-34Q18-46-41-28Z" fill={l}/><path d="M-35-64L-15-84L-4-62L13-79L21-59L35-72L45-52" fill={a} stroke={INK} strokeWidth="2"/>
 <g fill={a}>{[-36,-15,5,27].map((x,i)=><ellipse key={x} cx={x} cy={-35+i%2*4} rx="4" ry="3"/>)}</g></g>
 <g className={styles.head} style={{transformOrigin:'58px -35px'}}><g className={styles.gills} style={{transformOrigin:'62px -40px'}}><path d="M68-50L48-79L39-71L55-56L34-62L31-50L55-44L37-43L38-31L60-30Z M77-55L77-85L88-86L87-58L97-78L107-70L90-50" fill={a} stroke={INK} strokeWidth="2"/></g><path d="M58-52Q89-77 123-51Q143-33 117-19L69-17L54-31Z" fill={l} stroke={INK} strokeWidth="3"/>{eye(100,-48)}<path d="M101-24Q119-20 130-33" stroke={INK} strokeWidth="2" fill="none"/><ellipse cx="126" cy="-41" rx="2" ry="1.8" fill={INK}/></g>
 {[-38,49].map((x,i)=><g key={x} className={styles.frontLeg} style={{transformOrigin:`${x}px -26px`,animationDelay:`${i*.45}s`}}><path d={`M${x}-33L${x+12}-23L${x+7}-7L${x+29} 0L${x+11} 4L${x+3} 0L${x-11} 4L${x-8}-4L${x-18}-18Z`} fill={l} stroke={INK} strokeWidth="2.5"/><path d={`M${x+9}-5L${x+11} 2M${x+1}-5L${x+3} 0`} stroke={INK} strokeWidth="1.4"/></g>)}
 </>}
 {an==='raptor'&&<g className={styles.floating}>
 <g className={styles.tail} style={{transformOrigin:'-12px -58px'}}><path d="M-15-65L-59-7L-45-15L-46 0L-23-18L-17-4L6-59Z" fill={c} stroke={INK} strokeWidth="3"/><path d="M-35-34L-43-15M-21-38L-28-17M-7-40L-15-16" stroke={a} strokeWidth="3"/></g>
 <g className={styles.wingBack} style={{transformOrigin:'11px -88px'}}><path d="M12-79Q4-121 66-176L51-138L75-149L60-118L81-127L57-96L75-101L42-72Z" fill={c} stroke={INK} strokeWidth="3"/></g>
 <path d="M-13-76Q-26-111 18-126Q45-133 50-94L39-61L11-44Z" fill={c} stroke={INK} strokeWidth="3"/><path d="M12-114Q41-104 35-64L11-54L1-73Z" fill={l}/>
 <g className={styles.head} style={{transformOrigin:'30px -114px'}}><path d="M15-116L14-140L1-148L26-149L30-158L50-141L61-128L48-108Z" fill={l} stroke={INK} strokeWidth="3"/><path d="M26-148L22-166L40-154L44-164L54-141Z" fill={a} stroke={INK} strokeWidth="2"/>{eye(45,-132)}<path d="M56-135Q80-136 76-117L70-105L66-122L54-122Z" fill={a} stroke={INK} strokeWidth="2.5"/></g>
 <g className={styles.wingFront} style={{transformOrigin:'6px -92px'}}><path d="M13-102Q-18-157-89-173L-64-144L-93-154L-66-124L-89-129L-57-101L-82-105Q-35-66 12-76Z" fill={c} stroke={INK} strokeWidth="3"/>{[0,1,2,3].map(i=><path key={i} d={`M${-10-i*11} ${-99-i*5}L${-40-i*13} ${-114-i*16}`} stroke={a} strokeWidth="4"/>)}<path d="M9-97Q-21-132-52-145Q-31-106-7-85" fill={l} stroke={INK} strokeWidth="1.5"/></g>
 <g fill="none" stroke={a} strokeWidth="5"><path d="M8-55L13-35L0-25M27-57L36-38L26-25"/></g><g stroke={INK} strokeWidth="2" fill="none"><path d="M1-26L-5-19M7-27L7-18M14-29L20-21M27-26L21-19M34-28L34-18M39-32L45-26"/></g>
 </g>}
 {an==='wyrm'&&<g className={styles.floating}>
 <g className={styles.serpent}><path d="M-117-25C-72 15-32-6-51-37C-82-89-3-138 26-93C57-46-25-27 23-21C65-11 68-46 83-75" fill="none" stroke={INK} strokeWidth="37"/><path d="M-117-25C-72 15-32-6-51-37C-82-89-3-138 26-93C57-46-25-27 23-21C65-11 68-46 83-75" fill="none" stroke={c} strokeWidth="31"/><path d="M-117-25C-72 15-32-6-51-37C-82-89-3-138 26-93C57-46-25-27 23-21C65-11 68-46 83-75" fill="none" stroke={l} strokeWidth="11" strokeDasharray="2 9"/><path d="M-109-22L-141-42L-134-14L-114-11 M-49-74L-64-109L-36-100 M3-104L-4-145L21-124 M53-30L62-3L75-32" fill={a} stroke={INK} strokeWidth="2"/></g>
 <g className={styles.head} style={{transformOrigin:'78px -71px'}}><path d="M63-67L62-97L74-119L102-113L112-100L137-91L129-70L102-65L91-51Z" fill={l} stroke={INK} strokeWidth="3"/>
 <path d="M70-111L53-141L60-153L75-127M91-113L98-151L111-157L108-129" fill={a} stroke={INK} strokeWidth="2.5"/><path d="M65-91L45-100L52-78L42-69L62-60" fill={c} stroke={INK} strokeWidth="2"/>{eye(103,-100)}<path d="M120-90L135-91L132-83Z" fill={c}/><path d="M111-78Q119-72 133-78 M125-71L120-61L117-72" stroke={INK} strokeWidth="1.8" fill="#f9e2b2"/><g className={styles.whiskers} stroke={a} strokeWidth="2" fill="none"><path d="M122-81Q165-114 148-141M119-77Q153-76 142-50"/></g></g>
 </g>}
 </g>
 {silhouette&&<g><circle cx="160" cy="103" r="23" fill="#e4cca0" stroke="#665338" strokeWidth="2"/><text x="160" y="114" fill="#51432c" fontSize="30" textAnchor="middle" fontFamily="Georgia">?</text></g>}
 </svg>;
};
