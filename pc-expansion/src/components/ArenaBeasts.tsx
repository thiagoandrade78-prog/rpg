import React,{useEffect,useRef,useState} from 'react';
import {PawPrint,BookOpen,ArrowLeft,ArrowRight,Lock,Check,Heart,Sparkles,Shield,Clock,Leaf,Search,Feather,Flame} from 'lucide-react';
import {Button} from './Button';
import {Input} from './Input';
import {BeastPortrait} from './BeastPortrait';
import {BeastEngine as B} from '../helpers/BeastEngine';
import {BeastSpecies as SPECIES,BeastSpeciesEntry as Species} from '../helpers/BeastSpecies';
import {BeastSanctuary as Sanctuary,BeastCommand} from '../helpers/BeastSanctuary';
import {ArenaSaveTypes as R} from '../helpers/ArenaSaveTypes';
import {CultivationEngine} from '../helpers/CultivationEngine';
import styles from './ArenaBeasts.module.css';

type Props={root:R.SaveV5;onBack:()=>void;onCultivation:()=>void;onExplore?:()=>void;onCommand:(action:BeastCommand)=>boolean;storageWarning:string;};
export const ArenaBeasts=({root,onBack,onCultivation,onExplore,onCommand,storageWarning}:Props)=>{
 const model=root.beasts,state=B.sanctuary(model),reduced=root.settings.reducedMotion;
 const [tab,setTab]=useState<'sanctuary'|'dex'>('sanctuary');
 const [selected,setSelected]=useState(state.companionId||model.collection[0]?.id||'');
 const [speciesId,setSpeciesId]=useState('pyrofang'),[moving,setMoving]=useState(false);
 const [query,setQuery]=useState(''),[filter,setFilter]=useState<'all'|'studied'|'owned'>('all');
 const [pending,setPending]=useState<BeastCommand|null>(null),[name,setName]=useState(''),[editing,setEditing]=useState(false);
 const confirmRef=useRef<HTMLButtonElement>(null),lastTrigger=useRef<HTMLElement|null>(null);
 useEffect(()=>{if(pending)confirmRef.current?.focus({preventScroll:true});},[pending]);
 useEffect(()=>{if(selected&&!model.collection.some(b=>b.id===selected))setSelected(model.collection[0]?.id||'');if(!selected&&model.collection.length)setSelected(model.collection[0].id);},[model.collection,selected]);
 const beast=model.collection.find(b=>b.id===selected),sp=beast?B.species(beast.species):undefined;
 const chosen=SPECIES.find(s=>s.id===speciesId)||SPECIES[0],studied=model.discoveredSpecies.includes(chosen.id);
 const adopted=state.starterClaimed||model.collection.length>0,awake=CultivationEngine.isAwakened(root.cultivation);
 const time=Date.now(),training=state.training,remaining=training?Math.max(0,Math.ceil((training.endsAt-time)/1000)):0;
 const request=(command:BeastCommand)=>{lastTrigger.current=document.activeElement as HTMLElement;setPending(command);};
 const cancel=()=>{setPending(null);lastTrigger.current?.focus({preventScroll:true});};
 const accept=()=>{if(!pending)return;const action=pending;setPending(null);if(onCommand(action)&&action.type==='adopt')setSelected(Sanctuary.starter(root,action.species).id);lastTrigger.current?.focus({preventScroll:true});};
 const choose=(id:string)=>{setSelected(id);setMoving(false);setEditing(false);setPending(null);};
 const roman=(n:number)=>String(n).padStart(2,'0');
 const badge=(s:Species)=><span className={styles.rarity} data-rarity={s.rarity}>{s.rarity.toUpperCase()}</span>;
 const notes=(s:Species)=><div className={styles.catalogNotes}><div><span>FAMÍLIA</span><b>{s.family}</b></div><div><span>HABITAT</span><b>{s.habitat}</b></div><div><span>NATUREZA</span><b>{s.nature}</b></div><div><span>ARQUÉTIPO</span><b>{s.archetype}</b></div></div>;
 const preview=(id:string,label:string,unknown=false)=><div className={styles.creatureStage}><BeastPortrait species={id} mode={moving?'move':'idle'} reduced={reduced} silhouette={unknown} scene/><span className={styles.stageLabel}>{label}</span>{!unknown&&<div className={styles.motionSwitch}><Button variant="ghost" aria-pressed={!moving} onClick={()=>setMoving(false)}>OBSERVAR</Button><Button variant="ghost" aria-pressed={moving} onClick={()=>setMoving(true)}>MOVIMENTAR</Button></div>}</div>;
 const future=(s:Species)=><div className={styles.future}><h3><Lock size={16}/> Técnicas registradas</h3><p>Descrição de espécie, ainda sem efeito na arena. Habilidades herdadas entram nas etapas 5–6; transformações na 7.</p><div>{[s.passive,...s.techniques,s.ultimate].map((a,i)=><article key={a.name}><span>{['PASSIVA','TÉCNICA I','TÉCNICA II','SUPREMA'][i]}</span><b>{a.name}</b><small>{a.description}</small></article>)}</div><p><b>Rotas evolutivas documentadas:</b> {s.evolutions.join(' / ')}. Evolução jogável na etapa 9.</p></div>;
 const confirmation=pending&&<div className={styles.confirm} role="group" aria-label="Confirmar ação do santuário" onKeyDown={e=>{if(e.key==='Escape')cancel();}}><span>CONFIRMAÇÃO</span><h3>{pending.type==='adopt'?`Acolher ${B.species(pending.species)?.name}?`:pending.type==='care'?'Cuidar desta fera?':'Iniciar o treino?'}</h3><p>{pending.type==='adopt'?'Escolha única desta jornada, sem custo. Nome e linhagem do indivíduo são preservados no backup. As outras espécies poderão ser capturadas na Etapa 4.':pending.type==='care'?'Custo: 15 de ouro. +6 afinidade, limitado a 100. Novo cuidado após 60 segundos.':`Custo: ${beast?Sanctuary.trainingCost(beast):0} essência. Duração: 30 segundos. Ao concluir: +60 XP e +3 afinidade. Não aumenta o domínio de assimilação.`}</p><div><Button ref={confirmRef} className={styles.goldButton} onClick={accept}>CONFIRMAR {pending.type==='adopt'?'ACOLHIMENTO':'CUIDADO OU TREINO'}</Button><Button variant="ghost" onClick={cancel}>Cancelar</Button></div></div>;
 const candidates=SPECIES.filter(s=>s.starter);
 const dexList=SPECIES.filter(s=>{const known=model.discoveredSpecies.includes(s.id),owned=model.collection.some(b=>b.species===s.id);return(filter==='all'||filter==='studied'&&known||filter==='owned'&&owned)&&(!query||[s.name,s.nature,s.habitat,s.family].join(' ').toLocaleLowerCase('pt-BR').includes(query.toLocaleLowerCase('pt-BR')));});
 return <section className={styles.root} data-beast-stage="3" data-reduced-motion={reduced?'true':'false'}>
  <div className={styles.heading}><Button variant="ghost" onClick={onBack} aria-label="Voltar ao ludus"><ArrowLeft size={20}/></Button><div><span>EXPANSÃO 5.0 · ETAPA 3/10</span><h1>Santuário das Feras</h1></div><PawPrint className={styles.seal} size={35}/></div>
  <div className={styles.intro}><span className={styles.naturalist}><Leaf size={23}/></span><div><b>LYRA · NATURALISTA DE VELARIA</b><p>“Não procure apenas a fera mais rara. Aprenda a reconhecer o indivíduo que caminha ao seu lado.”</p></div></div>
  <div className={styles.ledger}><span><PawPrint size={16}/> <b>{model.collection.length}</b> {model.collection.length===1?'fera acolhida':'feras acolhidas'}</span><span><BookOpen size={16}/> <b>{SPECIES.filter(s=>model.discoveredSpecies.includes(s.id)).length}/8</b> registros estudados</span><span><Shield size={16}/> Nenhum bônus de combate nesta etapa</span></div>
  <div className={styles.tabs} role="tablist" aria-label="Áreas do santuário">{([['sanctuary','Minhas feras'],['dex','Compêndio']] as const).map(([id,label])=><Button role="tab" key={id} id={'beast-tab-'+id} aria-selected={tab===id} aria-controls={'beast-panel-'+id} variant="ghost" onClick={()=>{setTab(id);setPending(null);setMoving(false);}} className={tab===id?styles.activeTab:''}>{id==='sanctuary'?<PawPrint size={18}/>:<BookOpen size={18}/>} {label}</Button>)}</div>
  {tab==='sanctuary'&&<div role="tabpanel" id="beast-panel-sanctuary" aria-labelledby="beast-tab-sanctuary">
   {!adopted&&<>
    <div className={styles.welcome}><div><span>I · UM NOVO COMPANHEIRO</span><h2>Além do aço,<br/>um vínculo.</h2><p>Lyra cuida de três feras resgatadas. Após despertar seu núcleo, você pode acolher <b>uma delas, gratuitamente e uma única vez</b>. Cada candidata já tem seu potencial e sua linhagem definidos.</p><small>Não é captura selvagem nem assimilação. Visite Explorar para conquistar outros indivíduos. A assimilação virá na Etapa 5.</small>{!awake&&<Button className={styles.goldButton} onClick={onCultivation}><Sparkles size={17}/> DESPERTAR PARA ACOLHER</Button>}</div><BeastPortrait species="pyrofang" reduced={reduced}/></div>
    {confirmation}
    <div className={styles.candidates}>{candidates.map(s=>{const b=Sanctuary.starter(root,s.id,time);return <article className={styles.candidate} key={s.id}>{badge(s)}<div className={styles.candidateArt}><BeastPortrait species={s.id} reduced={reduced}/></div><span>{s.nature} · {s.archetype}</span><h3>{s.name}</h3><p>{s.description}</p><div className={styles.specimen}><span>Potencial <b>{b.potential}/100</b></span><span>Primordial <b>{b.bloodline.primordial}%</b></span><span>Temperamento <b>{b.temperament}</b></span></div><Button className={styles.goldButton} disabled={!awake} onClick={()=>request({type:'adopt',species:s.id})}>ACOLHER {s.name.toUpperCase()}</Button></article>;})}</div>
   </>}
   {adopted&&!model.collection.length&&<div className={styles.empty}><PawPrint size={32}/><h2>O pátio está vazio.</h2><p>Seu acolhimento já foi utilizado. Importar um backup anterior recupera as feras que ele contém; esta tela nunca sorteia outro indivíduo.</p></div>}
   {!!model.collection.length&&<div className={styles.collectionGrid}>
    <aside className={styles.roster}><h2>Meus vínculos</h2><p>{model.collection.length}/{B.capacity} espaços</p>{model.collection.map(b=>{const species=B.species(b.species);return <Button variant="ghost" key={b.id} aria-pressed={selected===b.id} onClick={()=>choose(b.id)} className={`${styles.rosterItem} ${selected===b.id?styles.rosterActive:''}`}><span className={styles.thumb}><BeastPortrait species={b.species} reduced/></span><span><b>{b.name}</b><small>{species?.nature||'Legado'} · Nível {b.level}</small><em>{state.companionId===b.id?'NO PÁTIO':'RECOLHIDA'}</em></span></Button>;})}</aside>
    {beast&&<div className={styles.detail} data-testid="beast-detail">
     {preview(beast.species,sp?`${sp.family.toUpperCase()} · ESPÉCIME ${roman(sp.number)}`:'ESPÉCIE LEGADA')}
     <article className={styles.dossier}><div className={styles.speciesLine}>{sp&&badge(sp)}<span>{beast.temperament||'Temperamento não registrado'} · {beast.origin==='sanctuary'?'Acolhimento de Lyra':beast.origin==='wild'?'Capturada em expedição':'Registro preservado'}</span></div><h2>{beast.name}</h2><p>{sp?.description||'Este indivíduo pertence a uma versão anterior ou futura do catálogo. Seus dados foram preservados.'}</p>
      <div className={styles.statGrid}><div><span>NÍVEL</span><strong>{beast.level}</strong><small>{beast.xp}/{B.xpRequired(beast.level)} XP</small></div><div><span>POTENCIAL</span><strong>{beast.potential}<em>/100</em></strong><small>Valor individual inato</small></div><div><span>AFINIDADE</span><strong>{beast.affinity}<em>%</em></strong><small>Desenvolvida por cuidados</small></div></div>
      <div className={styles.xpTrack} role="progressbar" aria-label="Experiência da fera" aria-valuenow={beast.xp} aria-valuemin={0} aria-valuemax={B.xpRequired(beast.level)}><i style={{width:`${Math.min(100,beast.xp/B.xpRequired(beast.level)*100)}%`}}/></div>
      <div className={styles.bloodline}><h3><Flame size={18}/> Linhagem espiritual</h3><div className={styles.bloodTrack} aria-label={`Linhagem base ${beast.bloodline.base}%, primordial ${beast.bloodline.primordial}%`}><i style={{width:`${beast.bloodline.base}%`}}/><i style={{width:`${beast.bloodline.primordial}%`}}/></div><div><span>{sp?.family||'Base'} <b>{beast.bloodline.base}%</b></span><span>Primordial <b>{beast.bloodline.primordial}%</b></span></div><p>As duas parcelas somam 100%. Não mudam ao renomear, reabrir o jogo ou treinar. Rotas evolutivas chegam na etapa 9.</p></div>
      {sp&&notes(sp)}
      <div className={styles.actions}>
       <Button variant="outline" disabled={beast.affinity>=100||time<Math.max(beast.careReadyAt||0,beast.capturedAt)||root.character.gold<Sanctuary.careCost} onClick={()=>request({type:'care',id:beast.id})}><Heart size={17}/> CUIDAR · 15 OURO</Button>
       <Button variant="outline" disabled={!!training||!awake||beast.level>=50||root.cultivation.essence<Sanctuary.trainingCost(beast)} onClick={()=>request({type:'train',id:beast.id})}><Sparkles size={17}/> TREINAR · {Sanctuary.trainingCost(beast)} ESSÊNCIA</Button>
       <Button variant="outline" onClick={()=>onCommand({type:'companion',id:state.companionId===beast.id?null:beast.id})}><PawPrint size={17}/>{state.companionId===beast.id?'RECOLHER DO PÁTIO':'ACOMPANHAR NO PÁTIO'}</Button>
       <Button variant="ghost" onClick={()=>{setEditing(!editing);setName(beast.name);}}>RENOMEAR</Button>
      </div>
      <p className={styles.careNote}>{time<(beast.careReadyAt||0)?`Próximo cuidado em ${Math.ceil(((beast.careReadyAt||0)-time)/1000)} s. `:''}Cuidar: +6 afinidade. Treino de 30 s: +60 XP e +3 afinidade. Custos e recompensas são mostrados antes de confirmar.</p>
      {editing&&<div className={styles.rename}><label>Nome da fera<Input aria-label="Nome da fera" value={name} maxLength={32} onChange={e=>setName(e.target.value)}/></label><Button onClick={()=>{if(onCommand({type:'rename',id:beast.id,name}))setEditing(false);}}>SALVAR NOME</Button></div>}
      {confirmation}
      {training&&<div className={styles.training} role="status" aria-label="Treino de vínculo"><Clock size={22}/><div><b>{remaining>0?'TREINO EM ANDAMENTO':'TREINO CONCLUÍDO'}</b><p>{model.collection.find(b=>b.id===training.beastId)?.name} · {remaining>0?`${remaining} s restantes`:'+60 XP e +3 afinidade disponíveis'}</p><small>O prazo é salvo. Fechar o jogo não perde o treino. A recompensa é aplicada ao concluir, uma única vez.</small></div><Button className={styles.goldButton} disabled={remaining>0} onClick={()=>onCommand({type:'collect-training'})}>CONCLUIR TREINO</Button></div>}
     </article>{sp&&future(sp)}
    </div>}
   </div>}
  </div>}
  {tab==='dex'&&<div role="tabpanel" id="beast-panel-dex" aria-labelledby="beast-tab-dex">
   <div className={styles.search}><label><Search size={18}/><Input aria-label="Pesquisar bestiário" value={query} onChange={e=>setQuery(e.target.value)} placeholder="Espécie, natureza ou habitat"/></label><div>{([['all','Todos'],['studied','Estudados'],['owned','Acolhidos']] as const).map(([id,name])=><Button variant="ghost" key={id} aria-pressed={filter===id} onClick={()=>setFilter(id)}>{name}</Button>)}</div></div>
   <div className={styles.dexGrid}><aside className={styles.index}><span className={styles.overline}>COMPÊNDIO DE LYRA · I</span><div className={styles.dexList}>{dexList.map(s=>{const known=model.discoveredSpecies.includes(s.id),owned=model.collection.some(b=>b.species===s.id);return <Button variant="ghost" key={s.id} aria-pressed={chosen.id===s.id} aria-label={`Abrir registro ${roman(s.number)}`} onClick={()=>{setSpeciesId(s.id);setMoving(false);}}><span className={styles.miniArt}><BeastPortrait species={s.id} reduced silhouette={!known}/></span><span><b>{known?s.name:`Registro ${roman(s.number)}`}</b><small>{known?s.nature:s.habitat}</small><em>{owned?'ACOLHIDA':known?'ESTUDADA':'NÃO ESTUDADA'}</em></span>{known?<Check size={14}/>:<Lock size={14}/>}</Button>;})}</div>{!dexList.length&&<p className={styles.emptyResult}>Nenhum registro corresponde ao filtro.</p>}</aside>
    <div className={styles.detail}>{preview(chosen.id,`REGISTRO ${roman(chosen.number)} · ${studied?'ESTUDADO':'AINDA VELADO'}`,!studied)}<article className={styles.dossier}>
     {!studied?<><span className={styles.overline}>II · OBSERVAR ANTES DE JULGAR</span><h2>Uma nova silhueta.</h2><p>O caderno de Lyra contém anotações de <b>{chosen.habitat}</b>. Consulte o registro para conhecer a aparência, a família e a vocação desta espécie.</p><Button className={styles.goldButton} onClick={()=>onCommand({type:'study',species:chosen.id})}><BookOpen size={18}/> ESTUDAR REGISTRO</Button><p className={styles.careNote}>Consulta gratuita. Revela a ficha, mas não adiciona uma fera à sua coleção. Capturas selvagens estão disponíveis em Explorar.</p></>:<>{badge(chosen)}<h2>{chosen.name}</h2><p>{chosen.description}</p>{notes(chosen)}<div className={styles.observation}><Feather size={21}/><p>{chosen.observation}</p></div><p className={styles.careNote}>{model.collection.some(b=>b.species===chosen.id)?'Você já possui um indivíduo desta espécie.':'Espécie estudada, mas ainda não acolhida. Estudar não equivale a capturar.'}</p></>}
    </article>{studied&&future(chosen)}</div>
   </div>
  </div>}
  {onExplore&&<Button className={styles.goldButton} onClick={onExplore}><PawPrint size={18}/> EXPLORAR HABITATS SELVAGENS</Button>}
  <div className={styles.boundary}><Lock size={16}/><p><b>Limites desta entrega:</b> coleção, cuidados, treino e bestiário funcionam aqui. Captura em combate está disponível em Explorar. Assimilação (5), poderes herdados (6), transformações (7) e evolução (9) permanecem em desenvolvimento.</p></div>
  {storageWarning&&<p className={styles.warning} role="alert">{storageWarning}</p>}
 </section>;
};
