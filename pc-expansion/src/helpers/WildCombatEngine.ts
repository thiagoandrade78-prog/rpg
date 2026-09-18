import {ArenaEngine} from './ArenaEngine';
import {ArenaTypes as A} from './ArenaTypes';
import {ArenaSaveTypes as R} from './ArenaSaveTypes';
import {ArenaCharacterAdapter as Adapter} from './ArenaCharacterAdapter';
import {BeastEngine as B} from './BeastEngine';
import {CultivationEngine as C} from './CultivationEngine';
import {WildActor,WildRig} from './WildRig';
import {WildCheckpoint,WildOutcome,WildPhase,WildResolution,WildTicket} from './WildTypes';
import {wildHash,WildWorld} from './WildWorld';
const clamp=(n:number,a:number,b:number)=>Math.max(a,Math.min(b,n));
const attack=(s:string)=>['light','heavy','special'].includes(s);
function distance(p:{x:number;y:number},a:{x:number;y:number},b:{x:number;y:number}){const x=b.x-a.x,y=b.y-a.y,t=clamp(((p.x-a.x)*x+(p.y-a.y)*y)/(x*x+y*y||1),0,1);return Math.hypot(p.x-a.x-x*t,p.y-a.y-y*t);}
export interface WildProjectile {x:number;y:number;vx:number;vy:number;life:number;radius:number;}
/** Uses the unchanged martial simulator for the human's controls and rig. The invisible
 * target is invulnerable; animal hurtboxes, AI, projectiles and outcomes belong here. */
export class WildCombatEngine {
 readonly martial:ArenaEngine;readonly actor:WildActor;readonly ticket:WildTicket;
 phase:WildPhase='combat';outcome:WildOutcome|null=null;paused=false;elapsed=0;clock=0;
 willFocus=0;focusCooldown=0;rejections=0;seals:number[]=[];needleTime=0;
 message='Aproxime-se. Leia o ataque antes de avançar.';messageTime=4;
 projectiles:WildProjectile[]=[];hits=0;damage=0;parries=0;duelBonus=0;aiEnabled=true;
 private accumulator=0;private rngState:number;private aiTimer=1;private strikeHit=false;private lastPlayerSwing=-1;private resolvedAt=0;
 private rootSave:R.SaveV5;
 constructor(save:R.SaveV5,ticket:WildTicket){
  this.rootSave=save;this.ticket=ticket;this.rngState=wildHash(ticket.id);
  this.martial=new ArenaEngine(Adapter.toLegacy(save),0,true,()=>this.random());
  this.martial.aiEnabled=false;this.martial.player.x=420;this.martial.enemy.x=810;
  const species=B.species(ticket.species)!;
  this.actor={species:species.id,x:810,y:0,face:-1,hp:WildWorld.maxHp(ticket),maxHp:WildWorld.maxHp(ticket),will:100,state:'idle',elapsed:0,duration:0,walk:0,flash:0,scale:WildRig.scale(species.id)};
  this.martial.intro=1.1;this.syncTarget();
  if(ticket.checkpoint)this.restore(ticket.checkpoint);
 }
 get player(){return this.martial.player;}
 get input(){return this.martial.input;}
 get readyToCapture(){return this.phase==='combat'&&C.isAwakened(this.rootSave.cultivation)&&this.player.hp>0&&this.actor.hp>0&&this.actor.hp<=this.actor.maxHp*.4&&this.actor.will<=60&&Math.abs(this.player.x-this.actor.x)<285&&this.martial.intro<=0;}
 get needle(){return 50+46*Math.sin(this.needleTime*(3.4+this.ticket.level*.06));}
 get captureBonus(){const c=this.rootSave.cultivation.core,s=B.species(this.actor.species)!,realm=Math.max(0,C.realms.indexOf(this.rootSave.cultivation.realm));return (c.nature===s.nature?8:0)+(c.archetype===s.archetype?5:0)+Math.min(12,realm*3)+(1-this.actor.hp/this.actor.maxHp)*10;}
 get duelScore(){return this.seals.length?this.seals.reduce((a,b)=>a+b,0)/this.seals.length+this.duelBonus:0;}
 private random(){this.rngState=(Math.imul(this.rngState,1664525)+1013904223)>>>0;return this.rngState/4294967296;}
 private say(text:string,seconds=3){this.message=text;this.messageTime=seconds;}
 private state(state:WildActor['state'],duration=0){this.actor.state=state;this.actor.elapsed=0;this.actor.duration=duration;}
 private syncTarget(){const e=this.martial.enemy;e.x=this.actor.x;e.y=this.actor.y;e.hp=e.maxHp=1000000;e.invuln=1000000;e.state='dodge';e.duration=1000000;e.vx=0;e.aiMove=0;e.aiBlock=false;}
 setPaused(value:boolean){this.paused=value;this.martial.clearInput();this.willFocus=0;this.accumulator=0;}
 command(action:A.Action|'focus'|'subdue'){
  if(this.paused||this.phase!=='combat'||this.martial.intro>0||this.player.hp<=0)return false;
  if(action==='subdue')return this.subdue();
  if(action==='focus'){
   if(this.focusCooldown>0||this.player.stamina<18||Math.abs(this.player.x-this.actor.x)>285||!['idle','walk','block'].includes(this.player.state)){this.say('Foco: aproxime-se, recupere 18 de vigor e espere uma abertura.');return false;}
   this.player.stamina-=18;this.player.state='idle';this.player.regenDelay=1.4;this.willFocus=1.1;this.focusCooldown=3;this.martial.clearInput();this.say('CANALIZANDO · evite ser atingido',1.1);return true;
  }
  this.willFocus=0;return this.martial.command(action);
 }
 private subdue(){
  if(!this.readyToCapture){this.say('Subjugar: vida até 40%, vontade até 60% e distância curta.');return false;}
  this.phase='duel';this.seals=[];this.needleTime=0;this.duelBonus=this.captureBonus;this.willFocus=0;this.projectiles=[];this.martial.clearInput();this.say('Três pulsos. Sele quando a agulha passar pelo centro.',30);return true;
 }
 seal(){
  if(this.paused||this.phase!=='duel'||this.seals.length>=3)return false;
  const score=clamp(100-Math.abs(this.needle-50)*2.2,0,100);this.seals.push(score);this.needleTime=.12+this.seals.length*.08;
  this.martial.events.push({type:'parry',power:.6});
  if(this.seals.length===3)this.endDuel();return true;
 }
 private endDuel(){
  if(this.duelScore>=60){this.resolve('captured');return;}
  this.rejections++;
  if(this.rejections>=3){this.resolve('escaped');return;}
  this.phase='combat';this.actor.will=Math.min(100,this.actor.will+22);this.state('recover',1.3);this.projectiles=[];this.player.invuln=1;this.aiTimer=.5;
  this.say(`SELO REJEITADO · ${this.rejections}/3. Reduza a vontade e tente novamente.`,5);
 }
 retreat(){if(this.phase==='resolved')return;this.resolve('retreated');}
 private resolve(outcome:WildOutcome){if(this.phase==='resolved')return;this.outcome=outcome;this.phase='resolved';this.resolvedAt=this.clock;this.martial.clearInput();this.willFocus=0;this.projectiles=[];this.player.state=outcome==='lost'?'dead':outcome==='retreated'?'idle':'victory';this.player.elapsed=0;this.player.duration=1.2;this.state(outcome==='defeated'?'dead':'calm',1.2);this.say({captured:'PACTO ESTABELECIDO',defeated:'FERA DERROTADA · não capturada',escaped:'A FERA ESCAPOU',retreated:'RETORNO AO LUDUS',lost:'RECUO FORÇADO · sem perda de ouro'}[outcome],60);this.martial.events.push({type:outcome==='captured'||outcome==='defeated'?'win':'lose',power:.6});}
 get canCollect(){return this.phase==='resolved'&&this.clock-this.resolvedAt>=.55;}
 checkpoint():WildCheckpoint{return {player:{hp:this.player.hp,stamina:this.player.stamina,posture:this.player.posture,rage:this.player.rage,x:this.player.x},beast:{hp:this.actor.hp,will:this.actor.will,x:this.actor.x},elapsed:this.elapsed,rejections:this.rejections,phase:this.phase,seals:[...this.seals],needleTime:this.needleTime,rngState:this.rngState,outcome:this.outcome};}
 resolution():WildResolution|null{return this.outcome?{ticketId:this.ticket.id,outcome:this.outcome,checkpoint:this.checkpoint()}:null;}
 private restore(cp:WildCheckpoint){
  Object.assign(this.player,{hp:clamp(cp.player.hp,0,this.player.maxHp),stamina:clamp(cp.player.stamina,0,this.player.maxStamina),posture:clamp(cp.player.posture,0,this.player.maxPosture),rage:cp.player.rage,x:cp.player.x,invuln:1});
  this.actor.hp=cp.beast.hp;this.actor.will=cp.beast.will;this.actor.x=cp.beast.x;this.elapsed=cp.elapsed;this.rejections=cp.rejections;this.seals=[...cp.seals];this.needleTime=cp.needleTime;this.rngState=cp.rngState;
  this.martial.intro=.6;this.phase=cp.phase;this.duelBonus=this.captureBonus;
  if(cp.phase==='resolved'&&cp.outcome){this.phase='combat';this.resolve(cp.outcome);this.resolvedAt=-1;}
  else if(this.player.hp<=0)this.resolve('lost');else if(this.actor.hp<=0)this.resolve('defeated');
  else {this.state('recover',1.2);this.say('Expedição retomada. O indivíduo e os danos foram preservados.',4);}
 }
 step(delta:number){if(this.paused)return;this.accumulator+=clamp(delta,0,.06);while(this.accumulator>=1/120){this.tick(1/120);this.accumulator-=1/120;}}
 private tick(dt:number){
  this.clock+=dt;this.messageTime=Math.max(0,this.messageTime-dt);
  if(this.phase==='resolved'){this.actor.elapsed+=dt;this.actor.walk+=dt;this.player.elapsed+=dt;return;}
  if(this.phase==='duel'){
   this.needleTime+=dt;if(this.needleTime>=10){this.seals.push(0);this.needleTime=.12;if(this.seals.length===3)this.endDuel();}return;
  }
  const p=this.player,a=this.actor;this.syncTarget();const old=p.elapsed,prev=p.state,freeze=this.martial.freeze>0;
  if(this.willFocus>0)this.martial.input.move=0;
  this.martial.step(dt);if(this.martial.intro>0||freeze)return;
  this.elapsed+=dt;a.elapsed+=dt;a.walk+=dt*(a.state==='walk'||a.state==='strike'?9:2);a.flash=Math.max(0,a.flash-dt);this.focusCooldown=Math.max(0,this.focusCooldown-dt);
  if(attack(p.state)&&p.state===prev)this.playerHit(old,p.elapsed);
  if(this.phase!=='combat')return;
  if(this.willFocus>0){this.willFocus-=dt;if(this.willFocus<=0){if(Math.abs(p.x-a.x)<285){a.will=Math.max(0,a.will-23);this.state('recover',.6);this.say('FOCO ESPIRITUAL · −23 vontade');this.burst(a.x,a.y-75,'#9edbd3',10);}else this.say('A fera saiu do alcance do foco.');}}
  this.ai(dt);this.tickProjectiles(dt);
  if(a.hp>0&&p.hp>0&&Math.abs(a.x-p.x)<69&&p.state!=='dodge'&&Math.abs(a.y-p.y)<80){const dir=p.x<a.x?1:-1,shift=(69-Math.abs(a.x-p.x))*.5;p.x=clamp(p.x-dir*shift,65,1215);a.x=clamp(a.x+dir*shift,100,1180);}
  if(this.elapsed>=600)this.resolve('escaped');
 }
 private playerHit(from:number,to:number){
  const p=this.player,a=this.actor;if(p.landed||a.hp<=0)return;
  const timing=ArenaEngine.timing(p),lo=Math.max(from,p.duration*timing.start),hi=Math.min(to,p.duration*timing.end);if(hi<lo)return;
  for(let n=0;n<=6;n++){
   const pose=ArenaEngine.pose(p,lo+(hi-lo)*n/6),h={x:p.x+pose.hand.x*p.face,y:p.y+pose.hand.y},tip={x:p.x+pose.tip.x*p.face,y:p.y+pose.tip.y};
   for(const zone of WildRig.zones(a))if(distance(zone,h,tip)<=zone.r+4){
    p.landed=true;const heavy=p.state==='heavy',special=p.state==='special';let mult=heavy?1.7:special?2.05:p.combo===2?1.23:1;
    if(p.weapon.kind==='spear'&&Math.abs(p.x-a.x)<83)mult*=.68;
    if(a.state==='guard'&&!heavy&&!special)mult*=.38;
    const damage=Math.max(1,Math.round(p.power*mult*zone.multiplier*(.94+this.random()*.12)));
    a.hp=Math.max(0,a.hp-damage);a.will=Math.max(0,a.will-(heavy?17:special?25:10));a.flash=.16;
    this.hits++;this.damage+=damage;p.rage=clamp(p.rage+13+p.furySkill*3,0,100);
    const vulnerable=a.state!=='windup'&&a.state!=='strike'||heavy||special;
    if(vulnerable){this.state('stagger',heavy?.5:.25);a.x=clamp(a.x+p.face*(heavy?19:8),100,1180);}
    this.martial.freeze=heavy?.055:.025;this.martial.shake=heavy?5:2;this.martial.events.push({type:'hit',power:heavy?1.2:.8});
    this.burst(zone.x,zone.y,B.species(a.species)!.accent,12);this.text(zone.x,zone.y-20,String(damage),'#fff3c3');
    if(a.hp<=0)this.resolve('defeated');else if(this.readyToCapture)this.say('PRONTO PARA PACTO · pare de atacar e pressione B!',4);
    return;
   }
  }
 }
 private ai(dt:number){
  const a=this.actor,p=this.player,cfg=WildRig.config(a.species),dist=Math.abs(a.x-p.x);if(!this.aiEnabled)return;
  if(['stagger','recover','guard'].includes(a.state)){
   if(a.elapsed>=a.duration){this.state('idle');this.aiTimer=.35+this.random()*.3;}return;
  }
  if(a.state==='windup'){
   if(a.elapsed>=a.duration){this.state('strike',cfg.pattern==='breath'?.6:.48);this.strikeHit=false;
    if(cfg.pattern==='breath'){const origin=WildRig.contact(a),dy=p.y-92-origin.y,dx=p.x-origin.x,len=Math.hypot(dx,dy)||1;this.projectiles.push({x:origin.x,y:origin.y,vx:dx/len*280,vy:dy/len*280,life:3,radius:17});}
   }return;
  }
  if(a.state==='strike'){
   if(cfg.pattern!=='breath'){a.x=clamp(a.x+a.face*(cfg.pattern==='swipe'?70:cfg.pattern==='dive'?350:290)*dt,100,1180);a.y=cfg.pattern==='pounce'?-Math.sin(Math.min(1,a.elapsed/a.duration)*Math.PI)*36:cfg.pattern==='dive'?-Math.sin(a.elapsed/a.duration*Math.PI)*22:0;
    if(!this.strikeHit&&p.invuln<=0){const contact=WildRig.contact(a),pose=ArenaEngine.pose(p);for(const z of [{x:pose.chest.x,y:pose.chest.y,r:29},{x:pose.hip.x,y:pose.hip.y,r:27},{x:0,y:-26,r:23}]){if(Math.hypot(contact.x-p.x-z.x*p.face,contact.y-p.y-z.y)<=contact.r+z.r){this.strikeHit=true;this.hurtPlayer(cfg.damage+this.ticket.level*1.4,a.x);break;}}}
   }
   if(a.elapsed>=a.duration){a.y=0;this.state(B.species(a.species)!.anatomy==='tortoise'?'guard':'recover',cfg.recovery);}
   return;
  }
  a.face=p.x>=a.x?1:-1;
  this.aiTimer-=dt;
  const reach=cfg.pattern==='breath'?430:cfg.pattern==='dive'?250:195;
  if(dist>reach){this.state('walk');a.x=clamp(a.x+a.face*cfg.speed*dt,100,1180);}
  else{if(a.state==='walk')this.state('idle');if(this.aiTimer<=0){this.state('windup',cfg.windup);this.say(`${B.species(a.species)!.name.toUpperCase()} PREPARA ${cfg.pattern==='breath'?'UM SOPRO':'UM ATAQUE'} · bloqueie ou esquive`,cfg.windup);}}
 }
 private hurtPlayer(base:number,sourceX:number){
  const p=this.player;if(p.hp<=0||p.invuln>0)return;
  let damage=base*(1-Math.min(.46,p.defense*.009));const facing=(sourceX-p.x)*p.face>0;
  if(p.state==='block'&&facing){
   if(p.blockAge<.17+p.guardSkill*.025){this.parries++;this.state('stagger',.85);this.actor.will=Math.max(0,this.actor.will-20);p.rage=clamp(p.rage+20,0,100);this.say('APARADO · −20 vontade');this.martial.events.push({type:'parry',power:1});this.burst(p.x+25*p.face,p.y-93,'#9ee4dd',12);return;}
   p.posture-=base*1.2;p.stamina=Math.max(0,p.stamina-base*.3);damage*=.12;
   if(p.posture<=0||p.stamina<=0){p.state='stagger';p.elapsed=0;p.duration=1.15;p.posture=0;damage=base*.5;this.say('GUARDA QUEBRADA');}else this.say('BLOQUEIO');
   this.martial.events.push({type:'block',power:.8});
  }else{p.state='hit';p.elapsed=0;p.duration=.3;p.vx=(p.x>=sourceX?1:-1)*110;this.martial.events.push({type:'hit',power:.75});}
  this.willFocus=0;p.hp=Math.max(0,p.hp-Math.max(1,Math.round(damage)));p.flash=.14;p.regenDelay=.7;p.rage=clamp(p.rage+7,0,100);this.martial.shake=3;
  this.text(p.x,p.y-125,String(Math.max(1,Math.round(damage))),'#f49e88');
  if(p.hp<=0)this.resolve('lost');
 }
 private tickProjectiles(dt:number){for(const p of this.projectiles){p.life-=dt;p.x+=p.vx*dt;p.y+=p.vy*dt;const target=this.player,pose=ArenaEngine.pose(target);if(p.life>0&&target.invuln<=0&&Math.hypot(target.x+pose.chest.x*target.face-p.x,target.y+pose.chest.y-p.y)<p.radius+30){this.hurtPlayer(WildRig.config(this.actor.species).damage+this.ticket.level*1.4,p.x);p.life=0;}}this.projectiles=this.projectiles.filter(p=>p.life>0);}
 private text(x:number,y:number,text:string,color:string){this.martial.floats.push({x,y,text,color,life:1,size:19});}
 private burst(x:number,y:number,color:string,n:number){for(let i=0;i<n;i++)this.martial.particles.push({x,y,vx:(this.random()-.5)*170,vy:-this.random()*120,life:.4,maxLife:.4,size:2+this.random()*3,color,type:'spark'});}
}
