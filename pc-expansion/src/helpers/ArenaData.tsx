import {ArenaTypes as T} from './ArenaTypes';
const item=(id:string,name:string,slot:T.Slot,tier:number,price:number,damage:number,defense:number,reach:number,speed:number,color:string,description:string,kind?:T.WeaponKind):T.Item=>({id,name,slot,tier,price,damage,defense,reach,speed,color,description,kind});
const items:T.Item[]=[
item('sword-1','Gládio de recruta','weapon',1,0,14,0,64,1,'#bec4c1','Equilibrado. O terceiro corte do combo empurra o adversário.','sword'),
item('dagger-1','Dente de chacal','weapon',1,110,11,0,43,1.25,'#c6c8be','Curta e rápida. Golpes pesados provocam sangramento.','dagger'),
item('axe-1','Machado de campanha','weapon',1,155,20,0,63,.83,'#a4afb0','Golpes amplos. Causa dano adicional à postura.','axe'),
item('spear-1','Lança de cinzas','weapon',1,180,16,0,100,.90,'#c3c9c0','Estocadas longas. Menos eficiente quando o rival está colado.','spear'),
item('hammer-1','Martelo do pedreiro','weapon',1,200,23,0,65,.72,'#8e9799','Muito lento. O golpe pesado destrói a guarda.','hammer'),
item('sword-2','Lâmina de Velaria','weapon',2,340,20,0,70,1.04,'#d7dddc','Aço temperado; velocidade e alcance equilibrados.','sword'),
item('dagger-2','Presa da lua','weapon',2,290,16,0,48,1.32,'#d4e6df','Críticos ágeis e sangramento. Exige aproximação.','dagger'),
item('axe-2','Fende-muralhas','weapon',2,410,28,0,68,.84,'#b1bdb9','A lâmina larga pressiona escudos e postura.','axe'),
item('spear-2','Haste do vigia','weapon',2,390,23,0,110,.93,'#d7d8cb','Domina a distância com estocadas precisas.','spear'),
item('hammer-2','Peso do exílio','weapon',2,450,32,0,71,.75,'#a1aaa6','A lentidão exige leitura das aberturas do oponente.','hammer'),
item('sword-3','Juramento do sol','weapon',3,760,29,0,77,1.09,'#f6d181','Arma cerimonial do campeão imperial.','sword'),
item('spear-3','Estrela do deserto','weapon',3,720,31,0,116,.97,'#f0d095','Grande alcance; não deixe o rival encurtar a distância.','spear'),
item('axe-3','Último veredito','weapon',3,790,37,0,74,.89,'#ecc88b','O machado reservado aos campeões da forja.','axe'),
item('hammer-3','Sino do julgamento','weapon',3,830,41,0,78,.80,'#cbb987','Martelo de guerra imperial. Uma abertura basta.','hammer'),
item('helmet-1','Faixa de couro','helmet',1,0,0,1,0,1,'#765139','Proteção simples; rosto visível.'),
item('helmet-2','Elmo de bronze','helmet',1,130,0,4,0,1,'#ae844a','Calota de bronze e protetores laterais.'),
item('helmet-3','Elmo do centurião','helmet',2,270,0,7,0,1,'#a3b4b1','Crista alta e proteção facial de ferro.'),
item('helmet-4','Coroa do invicto','helmet',3,530,0,10,0,1,'#d7b064','Elmo fechado com crista e adornos solares.'),
item('armor-1','Arnês do recruta','armor',1,0,0,2,0,1,'#765037','Tiras de couro; torso parcialmente exposto.'),
item('armor-2','Couro do batedor','armor',1,165,0,6,0,1,'#95654a','Proteção leve com ombreira e grevas.'),
item('armor-3','Lorica de ferro','armor',2,350,0,11,0,1,'#859d9b','Placas segmentadas sobre couro escuro.'),
item('armor-4','Couraça solar','armor',3,610,0,16,0,1,'#bc964e','Bronze dourado, ombreiras e grevas completas.'),
item('shield-1','Broquel de madeira','shield',1,0,0,2,0,1,'#987047','Pequeno escudo circular. Permite aparar.'),
item('shield-2','Escudo de bronze','shield',1,140,0,5,0,1,'#af8349','Redondo, reforçado e mais resistente.'),
item('shield-3','Escudo da guarnição','shield',2,310,0,9,0,1,'#739693','Retangular; reforça a reserva de postura.'),
item('shield-4','Égide do amanhecer','shield',3,540,0,12,0,1,'#e0b66a','Proteção dourada com emblema solar.')];
const arenas=[
{name:'Areias de Velaria',tag:'I · O PRIMEIRO SANGUE',description:'Pedra quente, arquibancadas inquietas e a primeira chance de conquistar seu nome.',sky:['#829eac','#e9c397'],stone:'#b88e62',sand:'#cba370',banner:'#944f42',accent:'#efbe72'},
{name:'Forja dos Exilados',tag:'II · SOB AS BRASAS',description:'Uma fortaleza vulcânica. Seus campeões vencem pela pressão e pelo peso do ferro.',sky:['#232737','#8c6057'],stone:'#595258',sand:'#82706a',banner:'#b45135',accent:'#f89b54'},
{name:'Anfiteatro Solar',tag:'III · A ÚLTIMA COROA',description:'Mármore, ciprestes e estandartes imperiais. Aqui se decide quem será lembrado.',sky:['#415d80','#b2b3c3'],stone:'#c1c8c4',sand:'#d2c9ac',banner:'#575b94',accent:'#e9cf8e'}];
const encounters:T.Encounter[]=[
{id:0,name:'Nero',epithet:'O recruta',arena:0,style:'balanced',weapon:'sword-1',helmet:'helmet-1',armor:'armor-1',shield:'shield-1',hp:105,damage:0,boss:false,reward:85,xp:55,skin:1,banner:1},
{id:1,name:'Sira',epithet:'Dente de chacal',arena:0,style:'duelist',weapon:'dagger-1',helmet:'helmet-1',armor:'armor-2',shield:'shield-1',hp:116,damage:1,boss:false,reward:100,xp:60,skin:2,banner:2},
{id:2,name:'Taren',epithet:'O sentinela',arena:0,style:'lancer',weapon:'spear-1',helmet:'helmet-2',armor:'armor-1',shield:'shield-2',hp:128,damage:2,boss:false,reward:115,xp:70,skin:0,banner:3},
{id:3,name:'Draven',epithet:'Campeão das areias',arena:0,style:'guardian',weapon:'axe-1',helmet:'helmet-2',armor:'armor-2',shield:'shield-2',hp:178,damage:3,boss:true,reward:230,xp:120,skin:1,banner:1},
{id:4,name:'Varka',epithet:'A brasa',arena:1,style:'aggressive',weapon:'axe-1',helmet:'helmet-2',armor:'armor-2',shield:'shield-1',hp:154,damage:3,boss:false,reward:140,xp:85,skin:3,banner:4},
{id:5,name:'Merek',epithet:'Muralha de ferro',arena:1,style:'brute',weapon:'hammer-1',helmet:'helmet-3',armor:'armor-3',shield:'shield-2',hp:183,damage:4,boss:false,reward:155,xp:95,skin:0,banner:0},
{id:6,name:'Nyra',epithet:'A lâmina cinzenta',arena:1,style:'duelist',weapon:'dagger-2',helmet:'helmet-2',armor:'armor-2',shield:'shield-3',hp:166,damage:4,boss:false,reward:175,xp:105,skin:2,banner:3},
{id:7,name:'Kharon',epithet:'O rei da forja',arena:1,style:'brute',weapon:'hammer-2',helmet:'helmet-3',armor:'armor-3',shield:'shield-3',hp:255,damage:5,boss:true,reward:340,xp:170,skin:3,banner:4},
{id:8,name:'Lys',epithet:'Guardiã do portão',arena:2,style:'lancer',weapon:'spear-2',helmet:'helmet-3',armor:'armor-3',shield:'shield-3',hp:207,damage:5,boss:false,reward:200,xp:120,skin:0,banner:5},
{id:9,name:'Oris',epithet:'O pretor',arena:2,style:'guardian',weapon:'sword-2',helmet:'helmet-3',armor:'armor-4',shield:'shield-4',hp:220,damage:6,boss:false,reward:225,xp:130,skin:1,banner:5},
{id:10,name:'Zael',epithet:'O espelho',arena:2,style:'duelist',weapon:'sword-3',helmet:'helmet-4',armor:'armor-3',shield:'shield-3',hp:235,damage:7,boss:false,reward:240,xp:140,skin:2,banner:2},
{id:11,name:'Aurex',epithet:'O último invicto',arena:2,style:'aggressive',weapon:'sword-3',helmet:'helmet-4',armor:'armor-4',shield:'shield-4',hp:310,damage:8,boss:true,reward:600,xp:240,skin:0,banner:5}];
const skins=['#d6a17a','#b97952','#825135','#593b31'];const banners=['#418d8a','#a84238','#637f46','#7c578d','#bd7435','#475991'];
const getItem=(id:string):T.Item=>items.find(i=>i.id===id)||items[0];
const fresh=():T.Save=>({version:3,name:'Caius',skin:1,banner:0,build:0,level:1,xp:0,gold:150,points:3,cleared:[],wins:0,losses:0,owned:['sword-1','helmet-1','armor-1','shield-1'],equipped:{weapon:'sword-1',helmet:'helmet-1',armor:'armor-1',shield:'shield-1'},stats:{power:0,vitality:0,endurance:0,agility:0},talents:{guard:0,fury:0,precision:0},sound:false,reducedMotion:false});
const integer=(v:unknown,min:number,max:number,fallback=0)=>typeof v==='number'&&Number.isFinite(v)?Math.min(max,Math.max(min,Math.floor(v))):fallback;
function validate(v:unknown):T.Save {
 if(!v||typeof v!=='object'||(v as T.Save).version!==3)throw new Error('Este código não é um salvamento ARENA v3.');
 const o=v as Partial<T.Save>,s=fresh();
 s.name=typeof o.name==='string'&&o.name.trim()?o.name.trim().slice(0,18):'Caius';s.skin=integer(o.skin,0,3,1);s.banner=integer(o.banner,0,5);s.build=integer(o.build,0,1);
 s.level=integer(o.level,1,99,1);s.xp=integer(o.xp,0,99999);s.gold=integer(o.gold,0,9999999,150);s.points=integer(o.points,0,9999,3);s.wins=integer(o.wins,0,999999);s.losses=integer(o.losses,0,999999);
 s.cleared=Array.isArray(o.cleared)?Array.from(new Set(o.cleared.filter(n=>Number.isInteger(n)&&n>=0&&n<encounters.length))):[];
 s.owned=Array.from(new Set([...s.owned,...(Array.isArray(o.owned)?o.owned.filter(id=>typeof id==='string'&&items.some(i=>i.id===id)):[])]));
 for(const slot of ['weapon','helmet','armor','shield'] as T.Slot[]){const id=o.equipped?.[slot];if(id&&s.owned.includes(id)&&getItem(id).slot===slot)s.equipped[slot]=id;}
 for(const key of ['power','vitality','endurance','agility'] as const)s.stats[key]=integer(o.stats?.[key],0,30);
 for(const key of ['guard','fury','precision'] as const)s.talents[key]=integer(o.talents?.[key],0,3);
 s.sound=o.sound===true;s.reducedMotion=o.reducedMotion===true;return s;
}
const clone=(s:T.Save):T.Save=>JSON.parse(JSON.stringify(s));
function load():{save:T.Save;warning:string}{
 try{const raw=localStorage.getItem('arena-save-v3');if(raw){try{return{save:validate(JSON.parse(raw)),warning:''};}catch{localStorage.setItem('arena-save-v3-recovery',raw);return{save:fresh(),warning:'O salvamento estava inválido e foi preservado em uma cópia de recuperação local. Uma nova jornada foi iniciada.'};}}
 const legacy=localStorage.getItem('arena-save-v1');if(legacy){const old=JSON.parse(legacy);const s=fresh();s.gold=integer(old.gold,0,999999,150);s.level=integer(old.level,1,99,1);s.xp=integer(old.xp,0,99999);s.points=3+(s.level-1)*2;return{save:s,warning:'Ouro e nível antigos recuperados. A nova campanha começa em Velaria.'};}return{save:fresh(),warning:''};
 }catch{return{save:fresh(),warning:'Não foi possível ler o progresso local. O arquivo anterior não foi apagado. Exporte um backup antes de fechar.'};}
}
function reward(s:T.Save,result:T.Result){const out=clone(s),e=encounters[result.encounter]||encounters[0];let gold=0,xp=0,loot='';
 if(!result.practice){if(result.win){const first=!out.cleared.includes(e.id);gold=first?e.reward:Math.round(e.reward*.4);xp=first?e.xp:Math.round(e.xp*.45);out.wins++;if(first)out.cleared.push(e.id);if(first&&e.boss){loot=['helmet-3','armor-4','sword-3'][e.arena];if(!out.owned.includes(loot))out.owned.push(loot);}}
 else{out.losses++;gold=15;xp=12;}out.gold+=gold;out.xp+=xp;while(out.xp>=out.level*90&&out.level<99){out.xp-=out.level*90;out.level++;out.points+=2;}}
 return{save:out,gold,xp,loot,levels:out.level-s.level};
}
function purchase(s:T.Save,id:string):T.Save|null{const i=items.find(x=>x.id===id);if(!i||s.owned.includes(id)||s.gold<i.price||i.tier>1+Math.floor(s.cleared.length/4))return null;const out=clone(s);out.gold-=i.price;out.owned.push(id);return out;}
function equip(s:T.Save,id:string):T.Save{const out=clone(s);const i=items.find(x=>x.id===id);if(i&&out.owned.includes(id))out.equipped[i.slot]=id;return out;}
function stats(s:T.Save){const w=getItem(s.equipped.weapon);return{hp:160+s.stats.vitality*14+(s.level-1)*5,stamina:110+s.stats.endurance*9,power:w.damage+s.stats.power*2+(s.level-1),defense:getItem(s.equipped.helmet).defense+getItem(s.equipped.armor).defense+getItem(s.equipped.shield).defense,crit:8+s.stats.agility*1.5+s.talents.precision*4};}
function encode(s:T.Save){return 'ARENA3:'+btoa(Array.from(new TextEncoder().encode(JSON.stringify(s)),b=>String.fromCharCode(b)).join(''));}
function decode(code:string){if(!code.trim().startsWith('ARENA3:'))throw new Error('Use um código de backup começando por ARENA3:.');const raw=atob(code.trim().slice(7));return validate(JSON.parse(new TextDecoder().decode(Uint8Array.from(raw,c=>c.charCodeAt(0)))));}
export const ArenaData={items,arenas,encounters,skins,banners,getItem,fresh,clone,validate,load,reward,purchase,equip,stats,encode,decode,version:'4.0.0'};
