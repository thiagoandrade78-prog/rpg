import React,{useId} from 'react';
import {Button} from './Button';
import {BeastPortrait} from './BeastPortrait';
import {ArenaSaveTypes as R} from '../helpers/ArenaSaveTypes';
import {WildWorld as W,WildRegions,WildRegion} from '../helpers/WildWorld';
import {CultivationEngine} from '../helpers/CultivationEngine';
import {BeastEngine as B} from '../helpers/BeastEngine';
import {Compass,ArrowLeft,Lock,Flag,Link,PawPrint,BookOpen,Play,Shield} from 'lucide-react';
import styles from './ArenaExpeditions.module.css';
type Props={root:R.SaveV5;onBack:()=>void;onOpen:(region:string)=>void;onResume:()=>void;onFeras:()=>void;onCultivation:()=>void;storageWarning:string;};
const titles={captured:'PACTO',defeated:'DERROTADA',lost:'RECUO FORÇADO',retreated:'RECUO',escaped:'FUGA'};
function Landscape({region}:{region:WildRegion}){
 const id=useId().replace(/:/g,''),type=region.landscape;
 return <svg viewBox="0 0 640 260" role="img" aria-label={`Paisagem de ${region.name}`} className={styles.landscape}>
  <defs><linearGradient id={id} x2="0" y2="1"><stop stopColor={type==='ruins'?'#27394f':type==='volcano'?'#ac7a69':type==='peaks'?'#6b91b1':'#88b5a4'}/><stop offset="1" stopColor="#e3d4a4"/></linearGradient></defs>
  <rect width="640" height="260" fill={`url(#${id})`}/><circle cx="520" cy="48" r="29" fill={type==='ruins'?'#e0e6cf':'#f9e6a9'}/>
  <path d="M0 152L92 49L141 109L248 32L356 133L422 64L521 133L598 57L640 118V260H0Z" fill={type==='volcano'?'#8d6662':'#72948c'} stroke="#597775" strokeWidth="2"/>
  <path d="M0 163Q157 87 282 167Q422 91 640 151V260H0Z" fill={type==='ruins'?'#657f7e':type==='volcano'?'#a57b5e':'#729a73'}/>
  {type==='forest'&&<>{[0,65,140,510,590].map((x,i)=><g key={x} transform={`translate(${x},0)`}><path d="M16 213L19 32H35L46 211Z" fill="#697250" stroke="#4d5e44" strokeWidth="3"/><path d="M28 101L2 66M33 125L58 86" stroke="#697250" strokeWidth="8"/><ellipse cx="30" cy={46+i%2*14} rx="59" ry="46" fill={i%2?'#3d745a':'#689873'} stroke="#466a4c" strokeWidth="3"/></g>)}<path d="M371 143Q227 179 400 211L327 260H214Q346 221 256 203Q165 169 351 143Z" fill="#a5caca" stroke="#72968b" strokeWidth="2"/></>}
  {type==='volcano'&&<><path d="M114 208L265 35L326 35L489 206Z" fill="#695b5c" stroke="#554743" strokeWidth="3"/><path d="M261 40L281 70L295 52L308 88L324 40L348 70L326 107L303 89L290 127L274 78Z" fill="#e5995a"/><path d="M281 33Q227-18 296-24Q371-18 326 34Z" fill="#66556855"/>{[50,520,588].map(x=><path key={x} d={`M${x} 234L${x+4} 137L${x+34} 129L${x+57} 190L${x+66} 234Z`} fill="#826650" stroke="#5e503e" strokeWidth="3"/>)}</>}
  {type==='peaks'&&<><path d="M70 216L211 23L390 222M273 216L428 16L631 236" fill="#9cb4b6" stroke="#627f8c" strokeWidth="3"/><path d="M173 75L211 23L260 77L233 65L214 87L202 66Z M389 74L428 16L482 76L453 58L432 88L422 58Z" fill="#f3f0d8"/><path d="M48 112Q229 67 453 101M283 163Q450 121 653 155" fill="none" stroke="#f1f1e47a" strokeWidth="23"/></>}
  {type==='ruins'&&<>{[40,124,243,389,493,572].map((x,i)=><g key={x}><path d={`M${x} 218L${x+3} ${71+i%2*28}L${x+17} ${62+i%2*28}L${x+35} ${80+i%2*26}L${x+42} 219Z`} fill="#b1b9a4" stroke="#65796d" strokeWidth="3"/><path d={`M${x+12} 204V${95+i%2*28}`} stroke="#e1dac1" strokeWidth="4"/>{i%2===0&&<path d={`M${x-6} 73V60H${x+50}V73Z`} fill="#c4c5ab" stroke="#65796d" strokeWidth="2"/>}</g>)}<path d="M0 221Q298 172 640 221V260H0Z" fill="#8faaa0"/></>}
  <path d="M0 232Q125 179 292 220Q478 189 640 230V260H0Z" fill="#c5b586" stroke="#807d5c" strokeWidth="2"/>
  <path d="M0 251Q93 230 189 245M485 245Q577 225 640 242" fill="none" stroke="#789365" strokeWidth="9"/>
 </svg>;
}
export const ArenaExpeditions=({root,onBack,onOpen,onResume,onFeras,onCultivation,storageWarning}:Props)=>{
 const progress=W.state(root),pending=progress.pending,awake=CultivationEngine.isAwakened(root.cultivation),full=root.beasts.collection.length>=B.capacity;
 return <section className={styles.page} data-testid="expeditions">
  <div className={styles.heading}><Button variant="ghost" onClick={onBack} aria-label="Voltar ao ludus das expedições"><ArrowLeft size={20}/></Button><div><span>EXPANSÃO 5.0 · ETAPA 4/10</span><h1>Terras Selvagens</h1></div><Compass size={31}/></div>
  <div className={styles.intro}><div><span>O ATLAS DE LYRA · II</span><h2>Não basta encontrar.<br/>É preciso conquistar o vínculo.</h2><p>Saia das arquibancadas. Explore quatro rotas, lute contra criaturas articuladas e aprenda a subjugar sem derrotar.</p><small>O santuário não luta por você. Captura não é assimilação; seus companheiros não dão bônus à arena nesta etapa.</small></div><div className={styles.seal}><Compass size={104}/><span>VELARIA<br/>EXPEDIÇÕES</span></div></div>
  <div className={styles.summary}><span><Flag size={17}/><b>{progress.successes}</b> expedições vencidas</span><span><Link size={17}/><b>{progress.captures}</b> capturas</span><span><PawPrint size={17}/><b>{root.beasts.collection.length}/{B.capacity}</b> no santuário</span></div>
  {pending&&<div className={styles.pending} role="status"><div className={styles.pendingArt}><BeastPortrait species={pending.species} reduced/></div><div><span>UM RASTRO AINDA ABERTO</span><h2>{B.species(pending.species)?.name}</h2><p>{W.region(pending.region)?.name} · Nível {pending.level}</p><small>{pending.checkpoint?.outcome?'Resultado aguardando registro.':'O indivíduo, a linhagem e o registro de combate foram preservados.'} Não há nova rolagem ao retomar.</small></div><Button className={styles.gold} onClick={onResume}><Play size={17}/> RETOMAR EXPEDIÇÃO</Button></div>}
  {!awake&&<div className={styles.notice}><Lock size={25}/><div><h3>Seu núcleo precisa despertar.</h3><p>Leia as rotas livremente. O primeiro pacto exige a identidade espiritual da Etapa 1.</p></div><Button className={styles.gold} onClick={onCultivation}>VISITAR CULTIVO</Button></div>}
  {full&&<p className={styles.warning}>O santuário está cheio. Nenhuma nova expedição pode ser iniciada (128 indivíduos).</p>}
  <div className={styles.regions}>{WildRegions.map(r=>{const allowed=W.available(root,r.id);return <article key={r.id} className={styles.region} style={{'--route':r.color} as React.CSSProperties}>
   <div className={styles.scene}><Landscape region={r}/><span className={styles.chapter}>{r.tag}</span><div className={styles.routeName}><h2>{r.name}</h2><span>NÍVEL {r.levels[0]}–{r.levels[1]} · PERIGO {r.danger}/4</span></div>{!allowed&&<span className={styles.lock}><Lock size={21}/></span>}</div>
   <div className={styles.regionBody}><p>{r.description}</p><div className={styles.species}>{r.species.map(s=><div key={s.id} title={B.species(s.id)!.name}><div><BeastPortrait species={s.id} reduced silhouette={!root.beasts.discoveredSpecies.includes(s.id)}/></div><span>{root.beasts.discoveredSpecies.includes(s.id)?B.species(s.id)!.name:'Rastro desconhecido'}</span></div>)}</div><p className={styles.requirement}>{W.requirement(root,r.id)}</p><Button className={styles.gold} disabled={!allowed||!!pending||full} onClick={()=>onOpen(r.id)} aria-label={`Explorar ${r.name}`}><Compass size={17}/>{pending?'CONCLUA A EXPEDIÇÃO ATUAL':allowed?'SEGUIR OS RASTROS':'ROTA BLOQUEADA'}</Button></div>
  </article>;})}</div>
  <div className={styles.manual}><BookOpen size={30}/><div><h2>A arte de subjugar</h2><p><b>1. Enfraqueça:</b> vida da fera em 40% ou menos; vontade em 60% ou menos. Ataques reduzem ambas. O foco (R) e aparos reduzem vontade sem dano.</p><p><b>2. Interrompa os golpes:</b> chegar a zero de vida derrota a fera e impede a captura. Aproxime-se e pressione B.</p><p><b>3. Sele três pulsos:</b> Enter no centro da faixa. A média dos pulsos + compatibilidade deve atingir 60. Três rejeições fazem a fera escapar.</p><p><b>4. Registre:</b> o indivíduo vai ao Santuário com o potencial, nível e linhagem do encontro. Vitória ou captura contam para novas rotas; treino e arenas continuam independentes.</p></div></div>
  <div className={styles.journal}><div className={styles.journalTitle}><h2>Diário de campo</h2><Button variant="outline" onClick={onFeras}>ABRIR SANTUÁRIO</Button></div>{progress.history.length?<div>{[...progress.history].reverse().map(e=><div className={styles.entry} key={e.id}><span className={e.outcome==='captured'?styles.captured:''}>{titles[e.outcome]}</span><b>{e.name}</b><small>{W.region(e.region)?.name}</small></div>)}</div>:<p>Nenhuma expedição encerrada. O diário guarda os 16 registros mais recentes; os totais permanecem.</p>}</div>
  <div className={styles.boundary}><Shield size={17}/><p>Salvamento automático a cada 2 s e nos pulsos do pacto. Ao fechar, a simulação para. Recuar não consome ouro. Sem servidor de validação: mantenha seu backup ARENA5 e use uma única aba.</p></div>
  {storageWarning&&<p className={styles.warning} role="alert">{storageWarning}</p>}
 </section>;
};
