import {WildRegion} from './WildWorld';
import {WildCombatEngine} from './WildCombatEngine';
import {ArenaCharacter} from './ArenaCharacter';
import {ArenaEngine} from './ArenaEngine';
import {WildRig} from './WildRig';
const INK='#302a22';
const hash=(n:number)=>{const a=Math.sin(n*93.71+18.7)*14378.391;return a-Math.floor(a);};
/** Painted-style procedural layers. All geometry is embedded; no network or sprite fetch. */
export class WildScenery {
 c:CanvasRenderingContext2D;character:ArenaCharacter;w=1;h=1;dpr=1;zoom=1;camera=640;
 constructor(public canvas:HTMLCanvasElement){const c=canvas.getContext('2d',{alpha:false});if(!c)throw Error('Canvas indisponível.');this.c=c;this.character=new ArenaCharacter(c);}
 resize(w:number,h:number){this.w=Math.max(1,w);this.h=Math.max(1,h);this.dpr=Math.min(window.devicePixelRatio||1,2);this.canvas.width=Math.round(w*this.dpr);this.canvas.height=Math.round(h*this.dpr);this.c.setTransform(this.dpr,0,0,this.dpr,0,0);}
 private poly(points:number[][],fill:string,stroke=INK,line=2){const c=this.c;c.beginPath();points.forEach(([x,y],i)=>i?c.lineTo(x,y):c.moveTo(x,y));c.closePath();c.fillStyle=fill;c.fill();if(stroke){c.lineWidth=line;c.strokeStyle=stroke;c.lineJoin='round';c.stroke();}}
 private oval(x:number,y:number,rx:number,ry:number,fill:string){const c=this.c;c.beginPath();c.ellipse(x,y,Math.max(.1,rx),Math.max(.1,ry),0,0,Math.PI*2);c.fillStyle=fill;c.fill();}
 private line(x:number,y:number,x2:number,y2:number,color:string,width=2){const c=this.c;c.beginPath();c.moveTo(x,y);c.lineTo(x2,y2);c.strokeStyle=color;c.lineWidth=width;c.lineCap='round';c.stroke();}
 private gradient(colors:string[]){const g=this.c.createLinearGradient(0,0,0,this.h);colors.forEach((x,i)=>g.addColorStop(i/(colors.length-1),x));return g;}
 scenery(region:WildRegion,time:number,reduced=false){
  const c=this.c,w=this.w,h=this.h,land=region.landscape,par=(this.camera-640)*.035;
  const palette={forest:['#86b6af','#d6dcc0','#718668'],volcano:['#826474','#e2a97a','#976c43'],peaks:['#546b91','#a8c6d4','#7e9b9d'],ruins:['#29354e','#62728b','#637971']}[land];
  c.setTransform(this.dpr,0,0,this.dpr,0,0);c.fillStyle=this.gradient(palette);c.fillRect(0,0,w,h);
  this.oval(w*.78-par,h*.18,h*.072,h*.072,land==='ruins'?'#e7e2be':land==='volcano'?'#ffd082':'#f5ecc3');
  for(let layer=0;layer<3;layer++){
   const pts:number[][]=[[0,h]];for(let x=-130;x<w+180;x+=110){const k=Math.round(x/110),y=h*(.35+layer*.13)-hash(k+layer*4)*h*.14;pts.push([x-par*(layer+1)*.3,y]);}pts.push([w,h]);
   this.poly(pts,land==='volcano'?['#786279','#916862','#9d7656'][layer]:land==='ruins'?['#45536a','#52687a','#687f7b'][layer]:['#729095','#69958c','#70976e'][layer],'');
  }
  if(land==='forest'){
   // Branch silhouettes, foliage clusters, a stream and roots provide readable depth.
   c.fillStyle='#a3c6b033';for(let i=0;i<5;i++){c.beginPath();c.moveTo(w*(.1+i*.17),0);c.lineTo(w*(.2+i*.17),0);c.lineTo(w*(.02+i*.17),h*.77);c.lineTo(w*(-.1+i*.17),h*.77);c.fill();}
   // An irregular, multi-plane canopy: silhouettes in the mist and inked
   // trunks near the borders leave the playable silhouettes unobstructed.
   for(let i=0;i<10;i++){
    const x=i*w/9-par*.55,base=h*(.68+hash(i+6)*.03),top=h*(.07+hash(i+23)*.15),wide=12+hash(i+5)*19;
    c.fillStyle=i%2?'#577e6c':'#628674';c.beginPath();c.moveTo(x-wide,base);c.bezierCurveTo(x-8,base*.72,x-12,top+h*.2,x-9,top);c.lineTo(x+11,top);c.bezierCurveTo(x+8,top+h*.25,x+wide*.35,base*.68,x+wide,base);c.closePath();c.fill();
    this.line(x,top+h*.21,x-38-hash(i)*28,top+h*.095,'#5b7b63',8);this.line(x,top+h*.28,x+41,top+h*.1,'#6b896e',7);
    for(let j=0;j<12;j++){const theta=j*2.4,rx=40+hash(i*23+j)*39,xx=x+Math.cos(theta)*(30+hash(j+7)*37),yy=top+Math.sin(theta)*h*.08;
     this.oval(xx,yy,rx,rx*.53,['#446f5d','#59876a','#72986f','#93ad7d'][Math.floor(hash(i+j*11)*4)]);}
   }
   this.poly([[w*.55,h*.57],[w*.66,h*.57],[w*.4,h*.72],[w*.59,h*.82],[w*.3,h*.86],[w*.2,h*.7]],'#a3cebc','#648a73',1.5);
   for(let i=0;i<20;i++){const yy=h*(.60+hash(i+9)*.11),xx=w*(.39+hash(i)*.12);this.line(xx,yy,xx+10+hash(i+3)*40,yy,'#e4ead071',1.5);}
   for(let side of [-1,1]){
    const x=side<0?w*.025:w*.974,trunk=26+Math.min(15,w*.012);
    this.poly([[x-trunk*1.8,h*.754],[x-trunk*.8,h*.70],[x-trunk*.61,h*.28],[x-trunk*.44,-20],[x+trunk*.58,-20],[x+trunk*.72,h*.28],[x+trunk*.7,h*.69],[x+trunk*2,h*.75],[x+trunk*.7,h*.735],[x,h*.75]],'#635940','#394b36',2.6);
    this.poly([[x-trunk*.4,-10],[x-trunk*.18,h*.5],[x-trunk*.7,h*.71],[x-trunk*.05,h*.68],[x+trunk*.19,h*.36],[x+trunk*.15,-10]],'#a39763','');
    this.line(x,h*.42,x+side*73,h*.18,'#43593d',21);this.line(x,h*.40,x+side*70,h*.19,'#7c8150',9);
    for(let j=0;j<7;j++){const xx=x-trunk*.5+j*trunk*.15;this.line(xx,h*(.22+hash(j)*.16),xx+3,h*(.57+hash(j+8)*.10),'#3e4c3366',1.4);}
    c.strokeStyle='#45683d';c.lineWidth=3;c.beginPath();c.moveTo(x-side*13,0);c.bezierCurveTo(x-side*43,h*.16,x+side*25,h*.19,x-side*19,h*.42);c.stroke();
    for(let j=0;j<5;j++){const yy=h*(.08+j*.05),xx=x-side*(15+Math.sin(j)*15);this.oval(xx,yy,8,3.5,j%2?'#789251':'#a5b774');}
    for(let j=0;j<5;j++)this.oval(x+(j-2)*22,h*.732+hash(j)*8,23,9,'#728455');
   }
  }else if(land==='volcano'){
   const x=w*.5-par;this.poly([[x-w*.25,h*.6],[x-w*.065,h*.22],[x+w*.035,h*.23],[x+w*.24,h*.6]],'#66585a','#554244',2);
   this.poly([[x-w*.064,h*.25],[x-w*.027,h*.31],[x+w*.016,h*.235],[x+w*.055,h*.29],[x+w*.041,h*.355],[x+w*.02,h*.27],[x-w*.006,h*.38],[x-w*.03,h*.34]],'#e7975d','');
   for(let i=0;i<5;i++){const dx=(!reduced?Math.sin(time*.16+i):0)*15;this.oval(x+dx+i*9,h*(.15-i*.019),h*(.042+i*.007),h*.03,'#68596740');}
   for(let i=0;i<9;i++){const xx=hash(i)*w,yy=h*.68;this.poly([[xx-25,yy],[xx-20,yy-h*.19],[xx+3,yy-h*.23],[xx+20,yy-h*.14],[xx+27,yy]],'#735c4d','#514231',2);this.line(xx-15,yy-h*.15,xx-8,yy-h*.04,'#b49063',2);}
  }else if(land==='peaks'){
   for(let i=0;i<5;i++){const x=w*i/4-par;this.poly([[x-190,h*.58],[x,h*(.15+(i%2)*.05)],[x+210,h*.61]],'#8caaaf','#5f7b8b',2);this.poly([[x-49,h*.29],[x,h*(.15+(i%2)*.05)],[x+51,h*.30],[x+12,h*.27],[x-4,h*.33],[x-17,h*.27]],'#e4e9da','');}
   for(let i=0;i<8;i++){const x=w*hash(i+16)-par*.2;this.oval(x,h*(.25+(i%3)*.08),w*.15,h*.032,'#e6e9df35');}
   this.poly([[w*.1,h*.65],[w*.27,h*.51],[w*.45,h*.7]],'#728b80');
   if(!reduced&&Math.sin(time*.32)> .98){this.line(w*.75,h*.23,w*.72,h*.33,'#ebe9a780',2);this.line(w*.72,h*.33,w*.76,h*.31,'#ebe9a780',2);this.line(w*.76,h*.31,w*.735,h*.4,'#ebe9a780',2);}
  }else{
   this.oval(w*.49,h*.69,w*.46,h*.11,'#839f9c');
   for(let i=0;i<7;i++){const x=w*(.06+i*.145)-par*.5,y=h*.65,top=h*(i%2?.31:.24);this.poly([[x-17,y],[x-20,top+4],[x-9,top],[x+1,top+12],[x+10,top+3],[x+22,y]],'#87988f','#495e60',2);this.line(x-6,top+20,x-2,y-10,'#c1c5a9',3);this.poly([[x-27,y],[x+29,y],[x+32,y+10],[x-30,y+10]],'#a1ad99');if(i%2===0)this.poly([[x-23,top+5],[x-26,top-7],[x+29,top-7],[x+30,top+7]],'#b4b79e');}
   for(let i=0;i<25;i++){const x=hash(i+14)*w,y=hash(i+45)*h*.45;this.oval(x,y,1.1,1.1,'#f2e7bb66');}
  }
  const ground=land==='forest'?'#c3b381':land==='volcano'?'#bb9167':land==='peaks'?'#bbc3af':'#a8b293';
  this.poly([[0,h*.735],[w*.25,h*.715],[w*.53,h*.745],[w*.76,h*.721],[w,h*.736],[w,h],[0,h]],ground,'#6b70533c',2);
  for(let i=0;i<72;i++){const x=hash(i+56)*w,y=h*(.75+hash(i+89)*.25);this.line(x,y,x+3+hash(i)*12,y-1,'#5e69462c',1);}
  for(let i=0;i<20;i++){const x=hash(i+36)*w,y=h*(.91+hash(i+8)*.08);this.line(x,y,x-3,y-7,'#68714e',2);this.line(x,y,x+4,y-9,'#768454',2);}
  for(let side of [-1,1]){const x=side<0?w*.08:w*.91,y=h*.87;
   this.poly([[x-29,y+8],[x-20,y-4],[x-6,y-10],[x+15,y-5],[x+27,y+8]],land==='volcano'?'#806753':'#929579','#5f6a50',1.3);
   this.poly([[x-20,y-4],[x-6,y-10],[x+15,y-5],[x+8,y],[x-9,y+1]],land==='volcano'?'#c29a68':'#c5c59b','');
   if(land==='forest')for(let j=0;j<4;j++){const xx=x-40+j*13,yy=y+18+hash(j)*9;this.line(xx,yy,xx-2,yy-10,'#5c7650',1.5);this.oval(xx-2,yy-11,3,2.4,'#e6cc8c');}
  }
  if(!reduced)for(let i=0;i<13;i++){const x=(hash(i+36)*w+time*(4+hash(i)*7))%(w+20)-10,y=h*(.22+hash(i+63)*.65)+Math.sin(time+i)*5;this.oval(x,y,land==='volcano'?1.8:1.2,1.5,land==='volcano'?'#ffd49299':'#eff0bc66');}
  const grad=c.createRadialGradient(w*.5,h*.45,h*.18,w*.5,h*.5,w*.76);grad.addColorStop(0,'#1b2e2000');grad.addColorStop(1,'#152d2938');c.fillStyle=grad;c.fillRect(0,0,w,h);
 }
 render(e:WildCombatEngine,region:WildRegion,dt:number,reduced=false){
  const c=this.c,w=this.w,h=this.h,a=e.actor,p=e.player,dist=Math.abs(p.x-a.x);
  const target=Math.min(Math.max(.52,Math.min(1.6,w/(dist+330))),h/295),smooth=1-Math.exp(-dt*6);
  this.zoom+=(target-this.zoom)*smooth;this.camera+=((p.x+a.x)*.5-this.camera)*smooth;
  this.scenery(region,e.clock,reduced);const floor=h*.81,project=(x:number)=>w*.5+(x-this.camera)*this.zoom;
  if(e.phase==='combat'&&a.state==='windup'){
   const x=project(a.x),reach=WildRig.config(a.species).pattern==='breath'?250:160;
   c.fillStyle='#aa4f2630';c.fillRect(Math.min(x,x+a.face*reach*this.zoom),floor-5,reach*this.zoom,9);
   this.line(x,floor+3,x+a.face*reach*this.zoom,floor+3,'#a54b37',2);
  }
  if(['light','heavy','special'].includes(p.state)&&!reduced){const tm=ArenaEngine.timing(p),phase=p.elapsed/p.duration;if(phase>tm.start&&phase<tm.end+.08){c.beginPath();for(let i=0;i<8;i++){const r=ArenaEngine.pose(p,Math.max(0,p.elapsed-i*.012)),x=project(p.x+r.tip.x*p.face),y=floor+(p.y+r.tip.y)*this.zoom;i?c.lineTo(x,y):c.moveTo(x,y);}c.strokeStyle='#fff2bd';c.lineWidth=p.state==='heavy'?4:2;c.stroke();}}
  this.character.draw(p,project(p.x),floor+p.y*this.zoom,this.zoom,e.clock,true,reduced);
  for(const f of e.martial.particles){c.globalAlpha=Math.max(0,f.life/f.maxLife);this.oval(project(f.x),floor+f.y*this.zoom,f.size*this.zoom,f.size*this.zoom,f.color);}c.globalAlpha=1;
  for(const f of e.martial.floats){c.globalAlpha=Math.min(1,f.life*2);c.font='bold 22px Georgia';c.textAlign='center';c.strokeStyle='#453027';c.lineWidth=3;c.strokeText(f.text,project(f.x),floor+f.y*this.zoom);c.fillStyle=f.color;c.fillText(f.text,project(f.x),floor+f.y*this.zoom);}c.globalAlpha=1;
  for(const shot of e.projectiles){const x=project(shot.x),y=floor+shot.y*this.zoom;this.oval(x,y,shot.radius*this.zoom,shot.radius*this.zoom,'#bfdfe3bd');this.oval(x-4,y-4,shot.radius*this.zoom*.55,shot.radius*this.zoom*.6,'#f8ffe3b0');}
  if(e.willFocus>0){const x=project(p.x);c.strokeStyle='#73bca5';c.lineWidth=2;c.beginPath();c.arc(x,floor-87*this.zoom,72*this.zoom,-Math.PI*.5,-Math.PI*.5+(1-e.willFocus/1.1)*Math.PI*2);c.stroke();}
  return {x:project(a.x),y:floor+a.y*this.zoom,zoom:this.zoom};
 }
}
