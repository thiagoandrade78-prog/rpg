import {ArenaTypes as T} from './ArenaTypes';
import {ArenaData as D} from './ArenaData';
const clamp=(v:number,a:number,b:number)=>Math.max(a,Math.min(b,v));
const lerp=(a:number,b:number,t:number)=>a+(b-a)*t;
const ease=(t:number)=>t*t*(3-2*t);
const attackState=(s:T.State)=>s==='light'||s==='heavy'||s==='special';
const point=(x:number,y:number):T.Point=>({x,y});
const end=(a:T.Point,angle:number,length:number)=>point(a.x+Math.cos(angle)*length,a.y+Math.sin(angle)*length);
function segmentDistance(p:T.Point,a:T.Point,b:T.Point){const dx=b.x-a.x,dy=b.y-a.y;const t=clamp(((p.x-a.x)*dx+(p.y-a.y)*dy)/(dx*dx+dy*dy||1),0,1);return Math.hypot(p.x-a.x-dx*t,p.y-a.y-dy*t);}
/** Original Floot combat simulation: drawing and collision share the same rig. */
export class ArenaEngine{
 static readonly WORLD=1280;
 player:T.Fighter;enemy:T.Fighter;encounter:T.Encounter;input:T.Input={move:0,block:false};
 particles:T.Particle[]=[];floats:T.Float[]=[];events:T.Event[]=[];result:T.Result|null=null;paused=false;practice=false;aiEnabled=true;
 elapsed=0;clock=0;intro=1.2;freeze=0;shake=0;announcement='OS PORTÕES SE FECHAM';announceTime=1.5;hits=0;damage=0;parries=0;maxCombo=0;streak=0;
 private accumulator=0;private finishIn=-1;private queued:T.Action|null=null;private queueTime=0;private rng:()=>number;
 constructor(save:T.Save,encounterId=0,practice=false,rng:()=>number=Math.random){this.rng=rng;this.practice=practice;this.encounter=D.encounters[encounterId]||D.encounters[0];this.player=this.makePlayer(save);this.enemy=this.makeEnemy(this.encounter);this.player.x=485;this.enemy.x=795;this.player.face=1;this.enemy.face=-1;}
 private makeBase(id:'player'|'enemy'):T.Fighter{return{id,name:'',x:0,y:0,vy:0,vx:0,face:1,hp:160,maxHp:160,stamina:110,maxStamina:110,posture:100,maxPosture:100,rage:0,state:'idle',elapsed:0,duration:0,combo:0,comboWindow:0,landed:false,invuln:0,flash:0,walk:0,move:0,blockAge:0,regenDelay:0,dodgeCooldown:0,specialCooldown:0,bleed:0,bleedTick:0,aiClock:0,aiMove:0,aiBlock:false,enrage:false,weapon:D.getItem('sword-1'),helmet:D.getItem('helmet-1'),armor:D.getItem('armor-1'),shield:D.getItem('shield-1'),skin:1,banner:0,build:0,power:14,defense:5,speed:168,crit:.08,guardSkill:0,furySkill:0,precisionSkill:0,style:'balanced'};}
 private makePlayer(s:T.Save){const f=this.makeBase('player'),st=D.stats(s);f.name=s.name;f.hp=f.maxHp=st.hp;f.stamina=f.maxStamina=st.stamina;f.power=st.power;f.defense=st.defense;f.crit=st.crit/100;f.speed=170+s.stats.agility*4;f.skin=s.skin;f.banner=s.banner;f.build=s.build;for(const slot of ['weapon','helmet','armor','shield'] as const)f[slot]=D.getItem(s.equipped[slot]);f.maxPosture=90+f.shield.defense*3+s.talents.guard*12;f.posture=f.maxPosture;f.guardSkill=s.talents.guard;f.furySkill=s.talents.fury;f.precisionSkill=s.talents.precision;return f;}
 private makeEnemy(e:T.Encounter){const f=this.makeBase('enemy');f.name=e.name;f.hp=f.maxHp=e.hp;f.style=e.style;f.skin=e.skin;f.banner=e.banner;f.build=e.style==='brute'?1:0;for(const slot of ['weapon','helmet','armor','shield'] as const)f[slot]=D.getItem(e[slot]);f.power=f.weapon.damage*.72+e.damage;f.defense=f.armor.defense+f.helmet.defense+f.shield.defense;f.speed=e.style==='duelist'?165:e.style==='brute'?113:142;f.maxPosture=e.boss?125:90;f.posture=f.maxPosture;f.maxStamina=f.stamina=e.boss?125:100;f.aiClock=.8;return f;}
 clearInput(){this.input.move=0;this.input.block=false;this.queued=null;this.queueTime=0;}
 setPaused(value:boolean){this.paused=value;this.clearInput();this.accumulator=0;}
 announce(text:string,seconds=1.35){this.announcement=text;this.announceTime=seconds;}
 private setState(f:T.Fighter,state:T.State,duration=0){f.state=state;f.elapsed=0;f.duration=duration;}
 private free(f:T.Fighter){return f.hp>0&&(f.state==='idle'||f.state==='walk'||f.state==='block');}
 private emit(type:T.Event['type'],power=1){if(this.events.length<24)this.events.push({type,power});}
 drainEvents(){const e=this.events;this.events=[];return e;}
 command(action:T.Action):boolean{if(this.paused||this.result||this.finishIn>=0||this.intro>0)return false;if(action==='light'&&attackState(this.player.state)&&this.player.elapsed/this.player.duration>.40){this.queued='light';this.queueTime=.42;return true;}return this.act(this.player,action,this.input.move);}
 act(f:T.Fighter,action:T.Action,direction=0):boolean{
 if(!this.free(f)||f.hp<=0)return false;
 if(action==='jump'){if(f.y<-.1||f.stamina<12)return false;f.vy=-465;f.stamina-=12;this.setState(f,'idle');this.dust(f.x,0,6);return true;}
 if(action==='dodge'){if(f.dodgeCooldown>0||f.stamina<22||f.y<-.1)return false;f.stamina-=22;f.dodgeCooldown=Math.max(.8,1.4-f.precisionSkill*.12);f.regenDelay=.65;this.setState(f,'dodge',.48);f.vx=(direction||-f.face)*385;f.invuln=.35;this.dust(f.x,0,9);this.emit('dodge');return true;}
 if(action==='special'&&(f.rage<100||f.specialCooldown>0)){if(f===this.player)this.announce('ACUMULE 100 DE FÚRIA');return false;}
 const cost=action==='light'?14:action==='heavy'?30:12;if(f.stamina<cost){if(f===this.player)this.announce('SEM VIGOR — RECUE E RECUPERE');return false;}
 const opponent=f===this.player?this.enemy:this.player;f.face=opponent.x>=f.x?1:-1;f.stamina-=cost;f.regenDelay=.7;f.landed=false;
 if(action==='light'){f.combo=f.comboWindow>0?(f.combo+1)%3:0;this.setState(f,'light',(f.combo===2?.67:.54)/f.weapon.speed);}
 if(action==='heavy'){f.combo=0;this.setState(f,'heavy',1.02/f.weapon.speed);}
 if(action==='special'){f.rage=0;f.specialCooldown=6;f.invuln=.25;this.setState(f,'special',.94/f.weapon.speed);this.announce(f===this.player?'FÚRIA DO GLADIADOR':'FÚRIA DO CAMPEÃO');this.emit('special');}
 f.comboWindow=0;return true;
 }
 static timing(f:T.Fighter){return f.state==='heavy'?{start:.42,end:.69}:f.state==='special'?{start:.25,end:.65}:{start:.30,end:.66};}
 static pose(f:T.Fighter,at=f.elapsed):T.Pose{
 const gait=f.state==='walk'?Math.sin(f.walk):0;let lean=f.state==='walk'?f.move*4:0,bob=f.state==='walk'?Math.abs(Math.sin(f.walk))*3:Math.sin(f.walk*.6)*1.1;let upper=1.03,fore=-.16,angle=-1.18;
 if(attackState(f.state)){const p=clamp(at/f.duration,0,1),tm=ArenaEngine.timing(f),sp=f.weapon.kind==='spear';let ready:number[],strike:number[];
 if(sp){ready=[2.65,-.25,0,-10];strike=[-.13,-.02,-.06,13];}
 else if(f.state==='heavy'||(f.state==='light'&&f.combo===2)){ready=[-2.1,-1.6,-1.3,-9];strike=[.60,.28,.72,14];}
 else if(f.state==='special'){ready=[-2.5,-2.2,-2.4,-13];strike=[.18,.05,.42,20];}
 else if(f.combo===1){ready=[1.25,.1,1.36,-5];strike=[-.55,-.45,-.85,10];}
 else{ready=[-1.65,-.8,-1.8,-7];strike=[.24,.20,.45,11];}
 let a=[upper,fore,angle,0],b=ready,t=ease(p/tm.start);if(p>=tm.start&&p<=tm.end){a=ready;b=strike;t=ease((p-tm.start)/(tm.end-tm.start));}else if(p>tm.end){a=strike;b=[1.03,-.16,-1.18,0];t=ease((p-tm.end)/(1-tm.end));}[upper,fore,angle,lean]=a.map((v,i)=>lerp(v,b[i],clamp(t,0,1)));}
 if(f.state==='hit')lean=-14*Math.sin(Math.min(1,at/f.duration)*Math.PI);
 if(f.state==='stagger'){lean=-13;upper=1.6;fore=.8;angle=1.1;bob=8;}if(f.state==='block'){upper=.85;fore=-.6;angle=-1.3;lean=-4;}if(f.state==='victory'){upper=-1.65;fore=-1.4;angle=-1.55;}if(f.state==='dodge'){bob=25;lean=-16;upper=1.3;fore=-.2;angle=-.3;}
 const hip=point(lean*.25,-67+bob),chest=point(lean,-113+bob),head=point(lean*1.12,-147+bob);const shoulder=point(chest.x+9,chest.y+8),elbow=end(shoulder,upper,31),hand=end(elbow,fore,30),tip=end(hand,angle,f.weapon.reach);const shieldHand=f.state==='block'?point(chest.x+42,chest.y+17):point(chest.x-18,chest.y+35);const rearElbow=point(chest.x-25,chest.y+25);
 let lf=point(-21+gait*20,0),rf=point(22-gait*20,0);if(f.state==='walk'){lf.y=-Math.max(0,Math.cos(f.walk))*12;rf.y=-Math.max(0,-Math.cos(f.walk))*12;}if(f.y<0){lf=point(-21,-9);rf=point(30,-24);}if(f.state==='dodge'){lf=point(-27,0);rf=point(39,-5);}
 return{hip,chest,head,shoulder,elbow,hand,tip,rearElbow,shieldHand,leftKnee:point(hip.x-15+gait*8,-32+bob*.4),leftFoot:lf,rightKnee:point(hip.x+19-gait*8,-30+bob*.4),rightFoot:rf,weaponAngle:angle,lean};
 }
 private world(f:T.Fighter,p:T.Point){return point(f.x+p.x*f.face,f.y+p.y);}
 private collide(a:T.Fighter,b:T.Fighter,from:number,to:number){if(a.landed||b.hp<=0||b.invuln>0)return;const tm=ArenaEngine.timing(a),lo=Math.max(from,a.duration*tm.start),hi=Math.min(to,a.duration*tm.end);if(hi<lo)return;const pose=ArenaEngine.pose(b),zones=[{p:pose.chest,r:28,m:1},{p:pose.head,r:20,m:1.15},{p:point(pose.hip.x,-35),r:23,m:.88}];for(let n=0;n<=5;n++){const rig=ArenaEngine.pose(a,lerp(lo,hi,n/5)),h=this.world(a,rig.hand),tip=this.world(a,rig.tip);for(const z of zones){const target=this.world(b,z.p);if(segmentDistance(target,h,tip)<=z.r+5){this.resolveHit(a,b,target,z.m);return;}}}}
 private resolveHit(a:T.Fighter,b:T.Fighter,contact:T.Point,zone:number){
 a.landed=true;const heavy=a.state==='heavy',special=a.state==='special';let multiplier=special?2.05+a.furySkill*.13:heavy?1.7:a.combo===2?1.23:1;if(a.weapon.kind==='spear'&&Math.abs(a.x-b.x)<83)multiplier*=.68;
 const critical=this.rng()<a.crit;let damage=a.power*multiplier*(.93+this.rng()*.14)*(critical?1.45:1)*zone;const facing=(a.x-b.x)*b.face>0;
 if(b.state==='block'&&facing){if(b.blockAge<.17+b.guardSkill*.025){this.setState(a,'stagger',.72);a.vx=-a.face*75;b.stamina=clamp(b.stamina+9,0,b.maxStamina);b.rage=clamp(b.rage+20,0,100);this.freeze=.075;this.shake=3;this.burst(contact.x,contact.y,'#c9f1e6',15);this.text(contact.x,contact.y-35,'APARADO!','#c2efe5',20);this.emit('parry');if(b===this.player)this.parries++;return;}
 const postureDamage=damage*(a.weapon.kind==='hammer'?1.75:a.weapon.kind==='axe'?1.40:1)*(heavy?1.28:1);b.posture-=postureDamage;b.stamina=Math.max(0,b.stamina-damage*.34);b.regenDelay=.9;b.rage=clamp(b.rage+8,0,100);this.burst(contact.x,contact.y,'#f0ce8d',10);this.emit('block');this.freeze=.035;
 if(b.posture<=0||b.stamina<=0){b.posture=0;this.setState(b,'stagger',1.25);b.vx=a.face*100;this.announce('GUARDA QUEBRADA');this.text(contact.x,contact.y-25,'QUEBROU!','#ffb176',22);this.emit('break');damage*=.52;}else{damage=Math.max(1,damage*.10);b.vx=a.face*(heavy?38:15);this.text(contact.x,contact.y-22,'BLOQUEIO','#ead6a1',13);}
 }else{damage*=1-Math.min(.46,b.defense*.009);this.setState(b,'hit',heavy||special?.38:.21);b.vx=a.face*(special?210:heavy?155:70);this.freeze=heavy||special?.065:.035;this.shake=heavy||special?7:3.5;this.burst(contact.x,contact.y,critical?'#fff0bb':'#e6c79a',heavy?14:8);if(heavy&&a.weapon.kind==='dagger'){b.bleed=3.2;b.bleedTick=.7;this.text(contact.x,contact.y-46,'SANGRANDO','#ec9389',13);}this.emit('hit',heavy?1.5:1);if(a===this.player){this.streak++;this.maxCombo=Math.max(this.maxCombo,this.streak);}else this.streak=0;}
 damage=Math.max(1,Math.round(damage));b.hp=Math.max(0,b.hp-damage);b.flash=.12;b.rage=clamp(b.rage+5,0,100);a.rage=clamp(a.rage+13+a.furySkill*3,0,100);this.text(contact.x,contact.y-8,(critical?'CRÍTICO ':'')+damage,critical?'#ffe3a0':a===this.player?'#fff1cb':'#ff9a84',critical?22:19);if(a===this.player){this.hits++;this.damage+=damage;}if(b.hp<=0)this.kill(b);
 }
 private kill(f:T.Fighter){if(f.state==='dead'||this.finishIn>=0)return;f.hp=0;this.setState(f,'dead',1.2);f.vx=0;this.finishIn=1.6;this.clearInput();this.freeze=.08;const other=f===this.player?this.enemy:this.player;this.setState(other,'victory');this.announce(f===this.enemy?'VITÓRIA':'DERROTA',2);this.emit(f===this.enemy?'win':'lose');}
 private tickFighter(f:T.Fighter,dt:number,move:number,block:boolean){
 const old=f.elapsed;f.elapsed+=dt;f.flash=Math.max(0,f.flash-dt);f.invuln=Math.max(0,f.invuln-dt);f.regenDelay=Math.max(0,f.regenDelay-dt);f.dodgeCooldown=Math.max(0,f.dodgeCooldown-dt);f.specialCooldown=Math.max(0,f.specialCooldown-dt);f.comboWindow=Math.max(0,f.comboWindow-dt);if(f.hp<=0)return old;
 if(f.bleed>0){f.bleed-=dt;f.bleedTick-=dt;if(f.bleedTick<=0){f.bleedTick=.8;f.hp=Math.max(0,f.hp-3);this.text(f.x,f.y-166,'3','#d9968c',14);if(f.hp<=0){this.kill(f);return old;}}}
 if(f.state==='hit'||f.state==='stagger'||f.state==='dodge'||attackState(f.state)){if(f.elapsed>=f.duration){const previous=f.state;this.setState(f,'idle');if(previous==='light')f.comboWindow=.52;if(previous==='stagger')f.posture=f.maxPosture*.65;}}
 if(f.state==='block'&&!block)this.setState(f,'idle');if(this.free(f)){const target=f===this.player?this.enemy:this.player;f.face=target.x>=f.x?1:-1;if(block&&f.y>=0&&f.stamina>1){if(f.state!=='block'){this.setState(f,'block');f.blockAge=0;}f.blockAge+=dt;move*=.28;f.stamina=Math.max(0,f.stamina-dt*2.5);}else{if(f.state==='block')this.setState(f,'idle');f.state=Math.abs(move)>.05?'walk':'idle';}f.move=move*f.face;f.x+=move*f.speed*dt;}else f.move=0;
 if(f.state==='dodge'){f.x+=f.vx*dt;f.vx*=Math.pow(.20,dt);}else{f.x+=f.vx*dt;f.vx*=Math.pow(.0003,dt);}
 if(f.y<0||f.vy<0){f.y+=f.vy*dt;f.vy+=1400*dt;if(f.y>=0){f.y=0;f.vy=0;this.dust(f.x,0,7);}}f.x=clamp(f.x,65,ArenaEngine.WORLD-65);f.walk+=dt*(f.state==='walk'?9:2.3);
 if(f.regenDelay<=0&&!attackState(f.state)&&f.state!=='block')f.stamina=clamp(f.stamina+dt*(23+(f.maxStamina-110)*.09),0,f.maxStamina);if(f.state!=='block'&&f.state!=='stagger'&&f.regenDelay<=0)f.posture=clamp(f.posture+dt*23,0,f.maxPosture);return old;
 }
 private think(dt:number){const e=this.enemy,p=this.player;if(!this.aiEnabled){e.aiMove=0;e.aiBlock=false;return;}if(!this.free(e)){e.aiMove=0;e.aiBlock=false;return;}e.aiClock-=dt;if(e.aiClock>0)return;e.aiClock=.16+this.rng()*.17;const distance=Math.abs(e.x-p.x),dir=p.x>=e.x?1:-1;const desired=e.weapon.kind==='spear'?136:e.weapon.kind==='dagger'?87:107;e.aiBlock=false;
 if(e.stamina<22){e.aiMove=-dir;if(distance<115&&this.rng()<.35)e.aiBlock=true;return;}
 const telegraph=attackState(p.state)&&p.elapsed>.10&&p.elapsed<p.duration*.62&&distance<185;
 if(telegraph){const defend=e.style==='guardian'?.83:e.style==='duelist'?.64:.40;if(this.rng()<defend){e.aiMove=0;if(e.style==='duelist'&&this.rng()<.42)this.act(e,'dodge',-dir);else e.aiBlock=true;return;}}
 if(distance>desired+13){e.aiMove=dir;return;}if(e.style==='lancer'&&distance<100){e.aiMove=-dir;if(this.rng()<.30)this.act(e,'light');return;}e.aiMove=0;
 if(this.rng()<(e.enrage?.84:.64)){const action:T.Action=e.rage>=100&&e.specialCooldown<=0?'special':this.rng()<(e.style==='brute'?.6:.22)?'heavy':'light';this.act(e,action);e.aiClock=e.style==='aggressive'?.18:e.style==='brute'?.55:.36;}else if(e.style==='guardian')e.aiBlock=true;else e.aiMove=this.rng()<.6?-dir:0;
 }
 step(delta:number){if(this.paused||this.result)return;this.accumulator+=clamp(delta,0,.06);while(this.accumulator>=1/120){this.tick(1/120);this.accumulator-=1/120;if(this.result)break;}}
 private tick(dt:number){
 this.clock+=dt;this.effects(dt);this.announceTime=Math.max(0,this.announceTime-dt);this.shake=Math.max(0,this.shake-dt*32);if(this.freeze>0){this.freeze-=dt;return;}
 if(this.finishIn>=0){this.player.elapsed+=dt;this.enemy.elapsed+=dt;this.finishIn-=dt;if(this.finishIn<=0){this.result={win:this.enemy.hp<=0,encounter:this.encounter.id,time:this.elapsed,damage:this.damage,hits:this.hits,parries:this.parries,maxCombo:this.maxCombo,practice:this.practice};}return;}
 if(this.intro>0){this.intro-=dt;this.player.walk+=dt*2;this.enemy.walk+=dt*2;return;}
 this.elapsed+=dt;this.think(dt);const ps=this.player.state,es=this.enemy.state;const pt=this.tickFighter(this.player,dt,this.input.move,this.input.block),et=this.tickFighter(this.enemy,dt,this.enemy.aiMove,this.enemy.aiBlock);if(this.finishIn>=0)return;
 const a=this.player,b=this.enemy;const distance=Math.abs(a.x-b.x);if(distance<47&&a.state!=='dodge'&&b.state!=='dodge'&&Math.abs(a.y-b.y)<100){const dir=a.x<=b.x?1:-1;const correction=(47-distance)*.5;a.x=clamp(a.x-correction*dir,65,1215);b.x=clamp(b.x+correction*dir,65,1215);}
 if(attackState(a.state)&&a.state===ps)this.collide(a,b,pt,a.elapsed);if(this.finishIn<0&&attackState(b.state)&&b.state===es)this.collide(b,a,et,b.elapsed);
 for(const f of[a,b]){if(attackState(f.state)){const t=ArenaEngine.timing(f).start*f.duration;if(f.elapsed>=t&&f.elapsed-dt<t)this.emit('swing',f.state==='heavy'?1.4:1);}}
 if(this.queued){this.queueTime-=dt;if(this.queueTime<=0)this.queued=null;else if(this.free(a)){const command=this.queued;this.queued=null;this.act(a,command,this.input.move);}}
 if(this.encounter.boss&&b.hp<b.maxHp*.45&&!b.enrage&&b.hp>0){b.enrage=true;b.power*=1.15;b.rage=100;this.announce('O CAMPEÃO DESPERTOU',1.8);this.burst(b.x,b.y-90,'#ed9b54',20);}
 }
 private text(x:number,y:number,text:string,color:string,size=18){if(this.floats.length>=24)this.floats.shift();this.floats.push({x,y,text,color,life:1.1,size});}
 private burst(x:number,y:number,color:string,n:number){for(let i=0;i<n&&this.particles.length<120;i++){const a=this.rng()*Math.PI*2,s=40+this.rng()*165;this.particles.push({x,y,vx:Math.cos(a)*s,vy:Math.sin(a)*s,life:.25+this.rng()*.35,maxLife:.6,size:1+this.rng()*3,color,type:'spark'});}}
 private dust(x:number,y:number,n:number){for(let i=0;i<n&&this.particles.length<120;i++)this.particles.push({x:x+(this.rng()-.5)*36,y,vx:(this.rng()-.5)*65,vy:-this.rng()*35,life:.4+this.rng()*.3,maxLife:.7,size:4+this.rng()*7,color:'#c2a579',type:'dust'});}
 private effects(dt:number){for(const p of this.particles){p.life-=dt;p.x+=p.vx*dt;p.y+=p.vy*dt;if(p.type==='spark')p.vy+=300*dt;}this.particles=this.particles.filter(p=>p.life>0);for(const f of this.floats){f.life-=dt;f.y-=dt*32;}this.floats=this.floats.filter(f=>f.life>0);}
 snapshot(){return{player:{hp:Math.ceil(this.player.hp),stamina:Math.round(this.player.stamina),posture:Math.round(this.player.posture),rage:Math.floor(this.player.rage),state:this.player.state,x:Math.round(this.player.x)},enemy:{hp:Math.ceil(this.enemy.hp),state:this.enemy.state,x:Math.round(this.enemy.x)},hits:this.hits,time:this.elapsed,result:this.result};}
}
