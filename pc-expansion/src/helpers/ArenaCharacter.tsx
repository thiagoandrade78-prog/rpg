import {ArenaTypes as T} from './ArenaTypes';
import {ArenaData as D} from './ArenaData';
import {ArenaEngine} from './ArenaEngine';
const INK='#2d2019';
const lerp=(a:number,b:number,t:number)=>a+(b-a)*t;
const clamp=(n:number,a:number,b:number)=>Math.max(a,Math.min(b,n));
const shade=(hex:string,delta:number)=>{const h=hex.replace('#','');return '#'+[0,2,4].map(i=>clamp(parseInt(h.slice(i,i+2),16)+delta,0,255).toString(16).padStart(2,'0')).join('');};
/** Original illustrated v4 character: rendering and collision share the animated rig. */
export class ArenaCharacter {
 constructor(public c:CanvasRenderingContext2D){}
 private shape(points:number[][],fill:string|CanvasGradient,stroke=INK,width=2.6){const c=this.c;c.beginPath();points.forEach(([x,y],i)=>i?c.lineTo(x,y):c.moveTo(x,y));c.closePath();c.fillStyle=fill;c.fill();if(stroke){c.strokeStyle=stroke;c.lineWidth=width;c.lineJoin='round';c.stroke();}}
 private oval(x:number,y:number,rx:number,ry:number,color:string|CanvasGradient,stroke='',width=2){const c=this.c;c.beginPath();c.ellipse(x,y,rx,ry,0,0,Math.PI*2);c.fillStyle=color;c.fill();if(stroke){c.strokeStyle=stroke;c.lineWidth=width;c.stroke();}}
 private line(x:number,y:number,xx:number,yy:number,color:string,width=2){const c=this.c;c.beginPath();c.moveTo(x,y);c.lineTo(xx,yy);c.strokeStyle=color;c.lineWidth=width;c.lineCap='round';c.stroke();}
 private metal(color:string,x:number,y:number,w:number){const g=this.c.createLinearGradient(x,y,x+w,y+5);g.addColorStop(0,shade(color,-35));g.addColorStop(.23,color);g.addColorStop(.43,shade(color,46));g.addColorStop(.53,shade(color,15));g.addColorStop(1,shade(color,-30));return g;}
 private limb(a:T.Point,b:T.Point,wide:number,narrow:number,color:string,rear=false){
  const c=this.c,dx=b.x-a.x,dy=b.y-a.y,len=Math.hypot(dx,dy)||1,nx=-dy/len,ny=dx/len,wa=wide*.5,wb=narrow*.5;
  c.beginPath();c.moveTo(a.x+nx*wa,a.y+ny*wa);c.quadraticCurveTo(a.x+dx*.45+nx*(wa+3),a.y+dy*.45+ny*(wa+3),b.x+nx*wb,b.y+ny*wb);c.quadraticCurveTo(b.x+dx*.08,b.y+dy*.08,b.x-nx*wb,b.y-ny*wb);c.quadraticCurveTo(a.x+dx*.5-nx*wa,a.y+dy*.5-ny*wa,a.x-nx*wa,a.y-ny*wa);c.quadraticCurveTo(a.x-dx*.15,a.y-dy*.15,a.x+nx*wa,a.y+ny*wa);c.closePath();c.fillStyle=rear?shade(color,-24):color;c.fill();c.lineWidth=2.8;c.strokeStyle=INK;c.stroke();
  this.line(a.x-nx*wa*.5,a.y-ny*wa*.5,a.x+dx*.6-nx*wb*.5,a.y+dy*.6-ny*wb*.5,rear?shade(color,-2):shade(color,37),Math.max(2,wide*.20));
  this.line(a.x+dx*.42+nx*wa*.55,a.y+dy*.42+ny*wa*.55,b.x+nx*wb*.5,b.y+ny*wb*.5,shade(color,-37),Math.max(2,wide*.14));
 }
 private rivet(x:number,y:number,r=1.6){this.oval(x,y,r,r,'#f4cf80',INK,.7);this.oval(x-.4,y-.5,r*.35,r*.35,'#fff5c6');}
 private foot(p:T.Point,armor:T.Item){
  const x=p.x,y=p.y;this.shape([[x-8,y-13],[x+6,y-11],[x+11,y-4],[x+24,y-2],[x+26,y+4],[x-10,y+4]],armor.tier>=2?armor.color:'#a5754f',INK,2.5);
  this.line(x-10,y+4,x+26,y+4,'#342018',4);this.line(x-8,y+1,x+23,y+1,'#d5b678',1.2);
  if(armor.tier<2){for(let k=0;k<3;k++)this.line(x-5+k*7,y-8+k*2,x-3+k*7,y,'#493323',3);}
  else{this.shape([[x-7,y-13],[x+6,y-12],[x+10,y-4],[x+22,y-2],[x+20,y+1],[x-7,y-1]],this.metal(armor.color,x-10,y,30),INK,1);this.line(x-4,y-9,x+8,y-7,'#faf1c2',1.2);}
 }
 weapon(item:T.Item,x:number,y:number,angle:number,scale=1){
  const c=this.c,l=item.reach,metal=item.color,gold=item.tier===3?'#edbb50':'#c99b50';c.save();c.translate(x,y);c.rotate(angle);c.scale(scale,scale);
  if(item.kind==='spear'){
   this.line(-27,0,l-22,0,INK,8);this.line(-27,0,l-22,0,'#946337',5);this.line(-23,-1.5,l-24,-1.5,'#d5a95d',1.3);
   const wide=item.tier===3?10:7;this.shape([[l-29,-wide],[l,0],[l-29,wide],[l-39,0]],this.metal(metal,l-38,-8,37));this.shape([[l-36,0],[l-28,-wide+2],[l-2,0]],'#f8f0c9','');
   for(let k=0;k<5;k++)this.line(l-43+k*2,-3,l-43+k*2,3,'#d0b786',1);
   if(item.tier>=2){this.shape([[l-40,4],[l-47,17],[l-41,14],[l-38,23],[l-35,5]],item.tier===3?'#bb3528':'#257e86',INK,1);this.line(l-37,-7,l-37,7,gold,3);}
  }else if(item.kind==='axe'){
   this.line(-13,0,l-10,0,INK,10);this.line(-13,0,l-10,0,'#845838',6);this.line(-11,-1,l-15,-1,'#c09b5b',1.4);
   const broad=item.tier===3?34:item.tier===2?31:25;
   this.shape([[l-31,-8],[l-24,-broad],[l-8,-broad-2],[l+1,-broad+4],[l+5,-14],[l+5,15],[l-7,broad+3],[l-25,broad],[l-31,8]],this.metal(metal,l-32,-broad,35),INK,3);
   this.shape([[l-5,-broad+1],[l+1,-broad+5],[l+5,-14],[l+5,15],[l-7,broad+3],[l-15,broad-2],[l-5,12],[l-5,-11],[l-11,-broad+2]],'#e3ebe1',INK,1);
   this.line(l-24,-18,l-24,18,gold,3);this.rivet(l-24,0,4);if(item.tier>=2){this.line(l-19,-12,l-12,-8,INK,1.5);this.line(l-19,12,l-12,8,INK,1.5);}
  }else if(item.kind==='hammer'){
   this.line(-12,0,l-14,0,INK,11);this.line(-12,0,l-14,0,'#82593c',6);
   this.shape([[l-33,-24],[l-2,-24],[l+2,-17],[l+2,21],[l-31,24]],this.metal(metal,l-35,-25,40),INK,3);
   this.shape([[l-33,-24],[l-25,-31],[l+5,-30],[l-2,-24]],shade(metal,40),INK,1.5);this.shape([[l-2,-24],[l+5,-30],[l+7,15],[l+2,21]],shade(metal,-34),INK,1.5);
   this.line(l-24,-21,l-23,20,gold,4);this.line(l-12,-21,l-11,20,gold,3);this.rivet(l-17,0,4);
   if(item.tier===3){this.shape([[l-33,-13],[l-41,-10],[l-33,-7]],gold);this.shape([[l-32,7],[l-40,11],[l-32,14]],gold);}
  }else{
   const dagger=item.kind==='dagger',width=dagger?8:8+(item.tier-1)*1.2;
   this.shape([[7,-width],[l-18,-width+1],[l,0],[l-18,width-1],[7,width]],this.metal(metal,5,-width,l-5),INK,2.4);
   this.shape([[10,-width+2],[l-18,-width+2],[l-3,0],[10,0]],'#f2f0d3','');this.line(13,0,l-13,0,shade(metal,-48),1.4);
   if(item.tier===3){this.shape([[17,-3],[23,-5],[29,-3],[23,0]],'#cb8341','');this.line(31,-3,l-22,-3,'#fff7c3',1);}
   this.shape([[2,-15],[8,-14],[10,-5],[10,5],[8,14],[2,15],[3,4],[3,-4]],gold,INK,2);
   this.line(-14,0,3,0,INK,11);this.line(-14,0,3,0,'#614332',7);for(let k=0;k<4;k++)this.line(-12+k*4,-3,-14+k*4,3,'#b8945c',1.4);this.oval(-17,0,5,6,gold,INK,1.8);
   if(item.tier>=2)this.oval(5,0,3,4,item.tier===3?'#267f8b':'#994533',INK,1);
  }
  if(item.kind==='hammer'||item.kind==='axe'){for(let k=0;k<5;k++)this.line(-8+k*3,-3,-10+k*3,3,'#bd9863',1.3);this.oval(-13,0,4,5,gold,INK,1);}
  c.restore();
 }
 shield(item:T.Item,x:number,y:number,blocking:boolean,posture:number,max:number){
  const c=this.c,wood=item.id==='shield-1',rect=item.id==='shield-3',sun=item.id==='shield-4';c.save();c.translate(x,y);c.rotate(blocking?0:-.14);
  if(rect){
   this.shape([[-23,-35],[22,-35],[26,29],[17,37],[-20,35],[-26,25]],this.metal(item.color,-24,-30,49),INK,3.2);
   this.shape([[-18,-29],[17,-29],[20,26],[14,30],[-16,29],[-20,22]],'#35666b','#edc477',2);
   for(const s of [-1,1])this.shape([[s*4,-18],[s*16,-24],[s*11,-5],[s*18,2],[s*6,17],[s*8,3]],'#e1bc76',INK,1);
  }else{
   this.oval(0,0,wood?26:29,34,wood?'#b79055':item.color,INK,3.2);
   this.oval(0,0,wood?22:24,29,wood?'#91603e':sun?'#a32d2a':'#386d71','#f5d087',2.5);
   if(wood){for(let i=-16;i<=16;i+=8){this.line(i,-Math.sqrt(1-(i/23)**2)*27,i,Math.sqrt(1-(i/23)**2)*27,'#593d29',1.5);this.line(i+2,-18,i+2,18,'#ba8a51',1);}this.line(-17,-10,17,-10,'#725039',5);this.line(-17,12,17,12,'#725039',5);}
   else if(sun){for(let k=0;k<12;k++){const a=k*Math.PI/6;this.shape([[Math.cos(a)*12,Math.sin(a)*15],[Math.cos(a+.12)*21,Math.sin(a+.12)*26],[Math.cos(a+.28)*14,Math.sin(a+.28)*17]],'#edc266',INK,.7);}}
   else{for(const s of [-1,1])this.shape([[s*4,-19],[s*19,-8],[s*15,4],[s*20,13],[s*7,20],[s*10,5],[s*4,-2]],'#e5c578',INK,1);}
   for(let k=0;k<10;k++){const a=k*Math.PI/5;this.rivet(Math.cos(a)*(wood?24:27),Math.sin(a)*31,1.4);}
  }
  this.oval(0,0,9,11,'#c59c5a',INK,2);this.oval(-2,-2,6,7,'#eccf92');this.oval(-3,-4,2.8,3.6,'#fff6cc');
  if(posture/Math.max(1,max)<.45){this.line(-9,-29,1,-14,INK,2.5);this.line(1,-14,-4,-3,INK,2);this.line(1,-14,10,-9,INK,1.7);}
  c.restore();
 }
 private head(f:T.Fighter,p:T.Pose,skin:string,cloth:string){
  const c=this.c,x=p.head.x,y=p.head.y,metal=f.helmet.color;
  const index=Array.from(f.name).reduce((a,v)=>a+v.charCodeAt(0),0),hurt=f.state==='hit'||f.state==='stagger',shout=['light','heavy','special','victory'].includes(f.state);
  this.shape([[x-15,y-18],[x+9,y-20],[x+19,y-10],[x+18,y-2],[x+26,y+4],[x+19,y+8],[x+18,y+18],[x+8,y+24],[x-10,y+21],[x-17,y+7]],skin,INK,2.9);
  this.shape([[x-15,y-10],[x-6,y-7],[x-5,y+12],[x+6,y+20],[x+15,y+19],[x+8,y+24],[x-10,y+21],[x-17,y+7]],shade(skin,-24),'');
  this.oval(x-12,y+3,5,7,skin,INK,1.5);this.line(x-13,y+1,x-10,y+5,shade(skin,-45),1.2);
  this.shape([[x+1,y-8],[x+13,y-7],[x+18,y-1],[x+15,y+4],[x+3,y+3]],'#fff1cd',INK,1.1);
  if(hurt){this.line(x+5,y-1,x+16,y+2,INK,2.5);}else{this.oval(x+13,y,2.8,3.8,'#344d3b');this.oval(x+14,y-.4,1.2,2.5,'#151c19');this.oval(x+13.5,y-1.8,.6,.7,'#fffced');}
  this.line(x+1,y-10,x+17,y-5,INK,3.6);this.line(x+19,y+5,x+23,y+5,shade(skin,44),1.5);
  if(shout){this.shape([[x+2,y+12],[x+17,y+11],[x+15,y+20],[x+4,y+20]],'#54251f',INK,1.5);this.shape([[x+3,y+12],[x+16,y+12],[x+15,y+15],[x+4,y+15]],'#fff4da','');}
  else {this.line(x+4,y+15,x+16,y+14,INK,1.8);this.line(x+7,y+18,x+13,y+18,shade(skin,32),1.2);}
  if(index%3===0&&f.helmet.id!=='helmet-4'){this.shape([[x-4,y+14],[x+2,y+18],[x+15,y+17],[x+13,y+24],[x+1,y+27],[x-8,y+21]],'#50372d',INK,1.4);}
  if(index%4===1){this.line(x+6,y+4,x+3,y+11,'#944637',1.4);this.line(x+1,y+7,x+6,y+9,shade(skin,45),1);}
  if(f.helmet.id==='helmet-1'){
   this.shape([[x-18,y+1],[x-21,y-12],[x-17,y-22],[x-21,y-27],[x-6,y-26],[x+1,y-31],[x+9,y-24],[x+20,y-19],[x+20,y-10],[x+6,y-14],[x-9,y-8],[x-11,y+6]],index%2?'#402d25':'#69462c',INK,2.3);
   this.line(x-13,y-20,x-3,y-24,'#b58a52',1.5);this.line(x-8,y-15,x+12,y-19,'#aa7b44',1.2);
   this.shape([[x-19,y-8],[x+20,y-11],[x+21,y-5],[x-18,y-2]],cloth,INK,1.8);this.rivet(x+1,y-6,2.2);
   this.shape([[x-18,y-4],[x-30,y+7],[x-24,y+9],[x-34,y+16],[x-21,y+12],[x-14,y]],cloth,INK,1.3);
  }else{
   if(f.helmet.tier>=2){const sway=Math.sin(f.walk*1.8)*2;
    this.shape([[x-18,y-20],[x-27+sway,y-28],[x-28+sway,y-44],[x-18,y-54],[x-3,y-56],[x+15,y-50],[x+24,y-36],[x+20,y-25],[x+8,y-28]],cloth,INK,3);
    this.shape([[x-27+sway,y-44],[x-18,y-54],[x-3,y-56],[x+15,y-50],[x+21,y-40],[x+9,y-42],[x-8,y-46]],shade(cloth,35),'');
    for(let n=0;n<8;n++){const xx=x-22+n*5;this.line(xx,y-31,xx-5,y-45-Math.sin(n*.46)*7,shade(cloth,-29),1.4);}
    this.shape([[x-18,y-24],[x+13,y-30],[x+18,y-23],[x-13,y-15]],'#b78e46',INK,1.8);
   }
   c.beginPath();c.moveTo(x-20,y+1);c.lineTo(x-22,y-12);c.quadraticCurveTo(x-19,y-30,x+1,y-29);c.quadraticCurveTo(x+24,y-27,x+23,y-7);c.lineTo(x+17,y-4);c.lineTo(x-11,y-2);c.closePath();c.fillStyle=this.metal(metal,x-22,y-20,47);c.fill();c.strokeStyle=INK;c.lineWidth=2.8;c.stroke();
   this.line(x-19,y-5,x+22,y-8,'#f3d98e',3);this.line(x-18,y-2,x+23,y-5,INK,1.7);
   this.shape([[x-18,y-3],[x-5,y-2],[x-3,y+20],[x-12,y+21],[x-18,y+12]],this.metal(metal,x-18,y,17),INK,2);
   this.rivet(x-13,y+1,2);this.line(x-13,y+7,x-9,y+14,'#ece5b9',1.4);
   if(f.helmet.tier>=2)this.shape([[x+18,y-6],[x+23,y-7],[x+26,y+9],[x+21,y+12],[x+18,y+5]],metal,INK,1.5);
   if(f.helmet.tier===3){this.shape([[x+2,y+7],[x+20,y+6],[x+20,y+18],[x+8,y+26],[x-1,y+20]],this.metal(metal,x,y,21),INK,2);for(let k=0;k<3;k++)this.line(x+6+k*4,y+12,x+6+k*4,y+17,INK,1.3);this.oval(x+1,y-16,5,6,'#238b90',INK,1.6);this.oval(x,y-18,2,2,'#abf1d1');}
  }
 }
 draw(f:T.Fighter,x:number,y:number,scale:number,clock:number,showShadow=true,reduced=false){
  const c=this.c,p=ArenaEngine.pose(f),skin=D.skins[f.skin]||D.skins[1],cloth=D.banners[f.banner]||D.banners[0],armor=f.armor;
  if(showShadow){const h=Math.abs(f.y)*scale;this.oval(x+8*scale,y-f.y*scale+3,Math.max(17,46*scale-h*.1),7*scale,`rgba(45,28,19,${Math.max(.1,.32-h*.001)})`);this.oval(x,y-f.y*scale+2,27*scale,4*scale,'#34221920');}
  c.save();c.translate(x,y);c.scale(scale*f.face,scale);
  if(f.state==='dead'){const z=clamp(f.elapsed/.8,0,1);c.translate(0,-7);c.rotate(-Math.PI*.47*z*z*(3-2*z));}
  if(f.state==='dodge'){c.translate(0,-31);c.rotate(-Math.PI*2*clamp(f.elapsed/Math.max(.01,f.duration),0,1));c.translate(0,31);}
  if(f.flash>0&&!reduced){c.shadowColor='#fff0b4';c.shadowBlur=8;}
  const cx=p.chest.x,cy=p.chest.y,hx=p.hip.x,hy=p.hip.y,b=f.build===1?1.15:1;
  if(armor.tier===3){const flow=Math.sin(clock*3)*5+Math.abs(f.move)*8;this.shape([[cx-23,cy-6],[cx+6,cy-6],[hx-3,hy+19],[hx-9-flow,hy+53],[hx-44-flow,hy+46],[cx-32,cy+24]],cloth,INK,2.8);this.shape([[cx-20,cy],[hx-26-flow,hy+41],[hx-9-flow,hy+47],[hx-3,hy+16]],shade(cloth,-30),'');this.line(cx-26,cy+9,hx-37-flow,hy+43,'#ebc778',2);}
  this.limb({x:hx-10,y:hy},p.leftKnee,25,19,skin,true);this.limb(p.leftKnee,p.leftFoot,19,12,skin,true);this.foot(p.leftFoot,armor);
  this.limb({x:cx-17,y:cy+8},p.rearElbow,23,18,skin,true);this.limb(p.rearElbow,p.shieldHand,18,13,skin,true);
  this.limb({x:hx+10,y:hy},p.rightKnee,28,20,skin);this.limb(p.rightKnee,p.rightFoot,21,13,skin);
  if(armor.tier>=2){for(const [k,ft] of [[p.leftKnee,p.leftFoot],[p.rightKnee,p.rightFoot]]){this.limb({x:k.x,y:k.y+4},{x:ft.x,y:ft.y-9},17,14,armor.color);this.oval(k.x,k.y,11,9,this.metal(armor.color,k.x-11,k.y,22),INK,2);this.rivet(k.x,k.y-2,2);}}
  this.foot(p.rightFoot,armor);
  this.shape([[cx-25*b,cy],[cx-14,cy-4],[cx+15,cy-4],[cx+29*b,cy+4],[cx+31*b,cy+16],[hx+19,hy+2],[hx-20,hy+2],[cx-29*b,cy+19]],skin,INK,3.1);
  this.shape([[cx-25*b,cy+6],[cx-15,cy+5],[cx-10,cy+20],[hx-7,hy-1],[hx-20,hy+2],[cx-29*b,cy+19]],shade(skin,-24),'');
  this.oval(cx-8,cy+12,13,10,shade(skin,27));this.oval(cx+16,cy+13,12,10,shade(skin,22));
  this.line(cx+4,cy+2,cx+5,cy+23,shade(skin,-36),1.8);this.line(cx-17,cy+22,cx-2,cy+24,shade(skin,-43),1.8);this.line(cx+9,cy+24,cx+24,cy+21,shade(skin,-43),1.8);
  for(let n=0;n<2;n++){this.line(hx-7,hy-19+n*9,hx+7,hy-19+n*9,shade(skin,-38),1.6);this.line(hx,hy-24+n*9,hx+1,hy-20+n*9,shade(skin,-25),1.4);}
  if(armor.id==='armor-1'){this.shape([[cx-21,cy-3],[cx-12,cy-3],[hx+16,hy-2],[hx+5,hy]],'#795236',INK,2);this.line(cx-16,cy+4,hx+11,hy-5,'#bc9558',1.5);this.shape([[cx-9,cy+14],[cx,cy+11],[cx+6,cy+23],[cx-3,cy+26]],'#c59950',INK,1.4);this.oval(cx-1,cy+19,2.2,2.2,'#56402b');}
  else{
   this.shape([[cx-22,cy-1],[cx-13,cy-6],[cx-1,cy+3],[cx+11,cy-5],[cx+25,cy],[cx+27,cy+19],[hx+19,hy],[hx-20,hy],[cx-26,cy+17]],this.metal(armor.color,cx-28,cy,57),INK,2.8);
   if(armor.id==='armor-3'){for(let n=0;n<5;n++){const y1=cy+6+n*8;this.shape([[cx-24+n*.8,y1],[cx+24-n*.8,y1],[cx+22-n*.8,y1+7],[cx,y1+9],[cx-23+n*.8,y1+7]],this.metal(armor.color,cx-22,y1,45),INK,1.4);this.line(cx-18,y1+2,cx+17,y1+2,'#d6e1cf',1.2);this.rivet(cx-16,y1+4,1);}}
   else{this.line(cx+1,cy+6,hx,hy-4,shade(armor.color,-38),2);this.shape([[cx-18,cy+8],[cx-2,cy+7],[cx-3,cy+20],[cx-16,cy+18]],shade(armor.color,26),'');this.shape([[cx+5,cy+7],[cx+21,cy+8],[cx+20,cy+18],[cx+5,cy+20]],shade(armor.color,22),'');
    for(let n=0;n<3;n++){this.line(cx-14,cy+24+n*7,cx-4,cy+25+n*7,shade(armor.color,-27),1.5);this.line(cx+5,cy+25+n*7,cx+15,cy+24+n*7,shade(armor.color,-27),1.5);}
    if(armor.tier===3){this.oval(cx+1,cy+21,11,13,'#9d692f',INK,1.5);for(let k=0;k<8;k++){const a=k*Math.PI/4;this.line(cx+1+Math.cos(a)*6,cy+21+Math.sin(a)*7,cx+1+Math.cos(a)*12,cy+21+Math.sin(a)*14,'#f1cd76',2);}this.oval(cx+1,cy+21,6,7,'#f5d184',INK,1);}
   }
   this.shape([[cx-32,cy+1],[cx-21,cy-8],[cx-10,cy-4],[cx-5,cy+8],[cx-11,cy+15],[cx-32,cy+13]],this.metal(armor.color,cx-32,cy,29),INK,2.5);this.line(cx-28,cy+9,cx-12,cy+10,'#e9d094',1.3);this.rivet(cx-22,cy,2);
  }
  this.shape([[hx-22,hy-6],[hx+21,hy-6],[hx+23,hy+3],[hx-23,hy+3]],'#513728',INK,2.2);this.line(hx-20,hy-4,hx+20,hy-4,'#c79b53',1.5);
  for(let k=0;k<5;k++){const xx=hx-21+k*9,sw=reduced?0:Math.sin(f.walk+k*.8)*2.8;this.shape([[xx,hy+3],[xx+8,hy+3],[xx+10+sw,hy+23],[xx+5+sw,hy+28],[xx-1+sw,hy+24]],k%2?shade(cloth,-15):cloth,INK,1.8);this.line(xx+2,hy+7,xx+3+sw,hy+20,shade(cloth,36),1.3);this.rivet(xx+4+sw,hy+22,1.3);}
  this.oval(hx+1,hy-1,7,8,'#c09248',INK,1.6);this.oval(hx+1,hy-2,3.6,4.6,'#edc875');
  this.limb({x:cx,y:cy+1},{x:p.head.x-1,y:p.head.y+17},17,15,skin);this.head(f,p,skin,cloth);
  this.limb(p.shoulder,p.elbow,25,18,skin);this.oval(p.elbow.x,p.elbow.y,8,8,skin);this.limb(p.elbow,p.hand,21,13,skin);
  const br={x:lerp(p.elbow.x,p.hand.x,.47),y:lerp(p.elbow.y,p.hand.y,.47)},wr={x:lerp(p.elbow.x,p.hand.x,.86),y:lerp(p.elbow.y,p.hand.y,.86)};
  this.limb(br,wr,21,17,armor.tier>=2?armor.color:'#795136');for(let k=0;k<2;k++){const v=.56+k*.16;this.rivet(lerp(p.elbow.x,p.hand.x,v),lerp(p.elbow.y,p.hand.y,v)-3,1.2);}
  if(armor.id!=='armor-1'){this.oval(p.shoulder.x,p.shoulder.y,18,14,armor.color,INK,2.8);this.line(p.shoulder.x-12,p.shoulder.y-4,p.shoulder.x+11,p.shoulder.y-5,'#e8d49f',2);this.rivet(p.shoulder.x+1,p.shoulder.y+5,2);}
  this.weapon(f.weapon,p.hand.x,p.hand.y,p.weaponAngle);
  this.oval(p.hand.x-1,p.hand.y,8,8.5,skin,INK,2);for(let k=0;k<3;k++)this.line(p.hand.x-3+k*3,p.hand.y-4,p.hand.x-3+k*3,p.hand.y+1,shade(skin,-35),1.2);
  this.shield(f.shield,p.shieldHand.x,p.shieldHand.y,f.state==='block',f.posture,f.maxPosture);
  if(f.state==='block'&&f.blockAge<.2&&!reduced){c.strokeStyle='#b7f4e9';c.lineWidth=3;c.beginPath();c.arc(p.shieldHand.x,p.shieldHand.y,41,-1.25,1.25);c.stroke();}
  c.restore();
 }
}
