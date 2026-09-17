/* ARENA ULTIMATE — Etapa 4/10: PoketPets. Carregado pelo arena-ultimate.html. */
(()=>{
const $=id=>document.getElementById(id), S=window.AU_SAVE;
if(!S)return;
const SPECIES=[
{id:'pyrofang',name:'Pyrofang',icon:'🐺',nature:'Fogo',arch:'Predador',rarity:'Raro',habitat:'Terras Rubras',passive:'Sangue Incandescente',skills:['Presa Ardente','Passo de Cinzas'],ultimate:'Caçada Solar',evolutions:['Fenrir Solar','Lobo do Eclipse']},
{id:'stormhawk',name:'Stormhawk',icon:'🦅',nature:'Raio',arch:'Duelista',rarity:'Raro',habitat:'Picos da Tormenta',passive:'Olhos da Tempestade',skills:['Garra Voltaica','Mergulho Celeste'],ultimate:'Julgamento do Céu',evolutions:['Roc Trovejante','Águia Celestial']},
{id:'stoneback',name:'Stoneback',icon:'🐢',nature:'Terra',arch:'Guardião',rarity:'Comum',habitat:'Desfiladeiro Antigo',passive:'Carapaça Ancestral',skills:['Investida Rochosa','Bastião'],ultimate:'Queda Continental',evolutions:['Titã de Granito']},
{id:'tideclaw',name:'Tideclaw',icon:'🦎',nature:'Água',arch:'Predador',rarity:'Comum',habitat:'Costa de Nácar',passive:'Sangue das Marés',skills:['Garra de Maré','Fluxo Rápido'],ultimate:'Dilúvio Predatório',evolutions:['Leviatã Menor']},
{id:'thornstag',name:'Thornstag',icon:'🦌',nature:'Natureza',arch:'Guardião',rarity:'Raro',habitat:'Bosque Viridiano',passive:'Coração Verde',skills:['Galhada Espinhosa','Raízes Vivas'],ultimate:'Floresta Desperta',evolutions:['Cervo Ancestral']},
{id:'nightlynx',name:'Nightlynx',icon:'🐈‍⬛',nature:'Umbral',arch:'Duelista',rarity:'Épico',habitat:'Ruínas do Eclipse',passive:'Passo Silencioso',skills:['Garra Sombria','Salto Noturno'],ultimate:'Caçada do Eclipse',evolutions:['Lince do Vazio']},
{id:'sunmane',name:'Sunmane',icon:'🦁',nature:'Solar',arch:'Colosso',rarity:'Épico',habitat:'Planície Dourada',passive:'Majestade Solar',skills:['Rugido Radiante','Pata Solar'],ultimate:'Coroa do Meio-Dia',evolutions:['Leão Celestial']},
{id:'mistwyrm',name:'Mistwyrm',icon:'🐉',nature:'Água',arch:'Espírito',rarity:'Lendário',habitat:'Lago Nebuloso',passive:'Corpo de Névoa',skills:['Sopro Nebuloso','Espiral Etérea'],ultimate:'Mar Sem Forma',evolutions:['Wyrm Abissal','Dragão das Nuvens']}
];
window.AU_SPECIES=SPECIES;
S.beasts??=[];S.world??={unlocked:['velaria']};S.world.bestiary??=[];
function save(){localStorage.setItem('AU5',JSON.stringify(S))}
function compatibility(sp){let c=S.cultivation?.core;if(!c)return 0;let n=c.nature===sp.nature?45:8,a=c.archetype===sp.arch?30:8,aspect=(c.aspect==='Solar'&&sp.nature==='Solar')?15:5;return Math.min(100,n+a+aspect+10)}
function makeIndividual(sp){let potential=55+Math.floor(Math.random()*41),primordial=Math.floor(Math.random()*22),main=100-primordial;return{id:sp.id+'-'+Date.now(),species:sp.id,name:sp.name,level:1,xp:0,affinity:10,potential,bloodline:{base:main,primordial},mastery:0,evolution:0,bonded:true}}
function render(){let list=$('beastList'),dex=$('dexList');if(!list||!dex)return;list.innerHTML=S.beasts.length?S.beasts.map(b=>{let sp=SPECIES.find(x=>x.id===b.species);return `<button class="beastTile" data-beast="${b.id}"><b>${sp.icon} ${b.name}</b><span>${sp.nature} · ${sp.arch}</span><small>NV ${b.level} · Afinidade ${b.affinity}% · Potencial ${b.potential}</small></button>`}).join(''):'<div class="beastEmpty">Nenhuma fera pactuada.<br><small>Na Etapa 5 você irá encontrá-las e subjugá-las no mundo.</small></div>';
dex.innerHTML=SPECIES.map((sp,i)=>{let seen=S.world.bestiary.includes(sp.id)||S.beasts.some(b=>b.species===sp.id);return `<button class="dexTile ${seen?'':'unknown'}" data-species="${sp.id}"><strong>${seen?sp.icon:'?'}</strong><span>${seen?sp.name:'???'}</span><small>${seen?sp.nature+' · '+sp.rarity:'Não descoberta'}</small></button>`}).join('');
list.querySelectorAll('[data-beast]').forEach(b=>b.onclick=()=>detailBeast(b.dataset.beast));dex.querySelectorAll('[data-species]').forEach(b=>b.onclick=()=>detailSpecies(b.dataset.species));}
function detailSpecies(id){let sp=SPECIES.find(x=>x.id===id),seen=S.world.bestiary.includes(id)||S.beasts.some(b=>b.species===id);if(!seen)return window.AU_MODAL?.('POKETDEX','Esta espécie ainda não foi descoberta.');window.AU_MODAL?.(sp.icon+' '+sp.name,`${sp.rarity} · ${sp.nature}/${sp.arch}<br>Habitat: ${sp.habitat}<br><br><b>${sp.passive}</b><br>${sp.skills.join(' · ')}<br>Ultimate: ${sp.ultimate}<br><br>Sinergia atual com seu Núcleo: <b>${compatibility(sp)}%</b>`)}
function detailBeast(id){let b=S.beasts.find(x=>x.id===id),sp=SPECIES.find(x=>x.id===b.species);window.AU_MODAL?.(sp.icon+' '+b.name,`${sp.nature}/${sp.arch} · ${sp.rarity}<br>Nível ${b.level} · Afinidade ${b.affinity}%<br>Potencial ${b.potential}/100<br><br>Linhagem ${sp.name}: ${b.bloodline.base}%<br>Primordial: ${b.bloodline.primordial}%<br><br>Sinergia com seu Núcleo: <b>${compatibility(sp)}%</b><br>Domínio de assimilação: ${b.mastery}/5`)}
window.AU_OPEN_BEASTS=()=>{document.querySelectorAll('.s').forEach(x=>x.classList.add('x'));$('beasts').classList.remove('x');render()};
window.AU_SEED_BEAST=()=>{if(S.beasts.length)return;let sp=SPECIES[0];S.beasts.push(makeIndividual(sp));if(!S.world.bestiary.includes(sp.id))S.world.bestiary.push(sp.id);save();render();window.AU_MODAL?.('PRIMEIRO PACTO',`${sp.icon} ${sp.name} foi adicionado como fera de demonstração da Etapa 4.<br><br>Captura real chega na Etapa 5.`)};
window.AU_RENDER_BEASTS=render;
})();