'use strict';
/* =====================================================================
   RENDER ― 星空と記憶の情景（canvas）
   ===================================================================== */
const cv=document.getElementById('cv'),cx=cv.getContext('2d');
let CW=0,CH=0,DPR=1,FR={x:0,y:0,w:0,h:0},RC={x:0,y:0};
const PW=300,HY=318;   // 情景の座標系（幅300、窓の下端=378）
const G=[196,198,204];
const A=COLORS.map(()=>1),TG=COLORS.map(()=>1),RV=COLORS.map(()=>1),POP=COLORS.map(()=>0);
let T=0,fla=0,stk=0,BB=0,CONV=0,FREEZE=false,CRACK=null,HOMEA=null,ACC=null,RCS=1,ZOOM=1,SPDF=1,ROT=0,ROTV=0,BVC=-1,BRK=null,RST=null,NEWSK=[],STILL=false,TRIP=[],MET=null,BLOOM=null,LANDED=false,HEARD=null;
const P=[],SP=[],STARS=[],FLY=[],FX=[],RIP=[],POPS=[],GLOWB=[];
function resize(){DPR=Math.min(2,window.devicePixelRatio||1);CW=innerWidth;CH=innerHeight;cv.width=CW*DPR;cv.height=CH*DPR;cx.setTransform(DPR,0,0,DPR,0,0);measure();}
function measure(){const r=frameEl.getBoundingClientRect();FR={x:r.left,y:r.top,w:r.width,h:r.height};const q=ringEl.getBoundingClientRect();RC={x:q.left+q.width/2,y:q.top+q.height/2};RCS=q.width/176||1;}
const cl=x=>Math.max(0,Math.min(1,x)),eo=x=>{x=cl(x);return 1-Math.pow(1-x,3);},ei=x=>{x=cl(x);return x*x*(3-2*x);};
const mix=(c,g,k)=>[c[0]+(g[0]-c[0])*k,c[1]+(g[1]-c[1])*k,c[2]+(g[2]-c[2])*k];
const rgb=(c,a)=>'rgba('+(c[0]|0)+','+(c[1]|0)+','+(c[2]|0)+','+Math.max(0,a)+')';
const R=(a,b)=>a+Math.random()*(b-a);
const ramp=(t,a,b,c,d)=>t<a?0:t<b?(t-a)/(b-a):t<c?1:t<d?1-(t-c)/(d-c):0;
function ry(x){return HY-6-9*Math.sin(x*0.021+0.5)-5*Math.sin(x*0.047+1.3);}
function blob(x,y,rr,c,a){if(a<=0.002||rr<=0)return;const g=cx.createRadialGradient(x,y,0,x,y,rr);g.addColorStop(0,rgb(c,a));g.addColorStop(0.45,rgb(c,a*0.45));g.addColorStop(1,rgb(c,0));cx.fillStyle=g;cx.fillRect(x-rr,y-rr,rr*2,rr*2);}
function glp(fn,c,a,w){if(a<=0.003)return;w=w||1;cx.lineCap='round';cx.lineJoin='round';fn();const m=cx.getTransform().a;cx.shadowColor=rgb(c,Math.min(1,a*0.9));cx.shadowBlur=w*5*m;cx.strokeStyle=rgb(c,a);cx.lineWidth=w*1.1;cx.stroke();cx.shadowBlur=0;cx.shadowColor='transparent';}
function gdot(x,y,r,c,a){if(a<=0.003)return;blob(x,y,r*4.5,c,a*0.35);cx.beginPath();cx.arc(x,y,r,0,6.283);cx.fillStyle=rgb(c,a);cx.fill();}
function ridgePath(){cx.beginPath();for(let x=-5;x<=PW+5;x+=5)x<0?cx.moveTo(x,ry(x)):cx.lineTo(x,ry(x));}
function initScene(){
  const cls=[4,5,5,3,3,0,2,1,4,5];
  for(let i=0;i<460;i++){const L=i<290?0:i<410?1:2;STARS.push({t:Math.acos(1-2*Math.random()),p:Math.random()*6.283,s:[0.6,1.0,1.7][L],v:[0.0012,0.0026,0.005][L],w:Math.random(),ph:Math.random()*6.283,k:cls[i%10],q:Math.random(),big:L===2});}
  const fk=[0,1,2,3,4,0,1,2,3,4,3,4];for(let i=0;i<50;i++)FLY.push({x:Math.random(),y:Math.random(),vx:(Math.random()-0.5)*0.25,vy:-0.1-Math.random()*0.25,k:fk[i%12],ph:Math.random()*6.283,r:0.9+Math.random()*1.4,q:Math.random()});
}
/* ---- 形 ---- */
function leafL(x,y,s,rot,c,a,fy){if(a<=0.01)return;cx.save();cx.translate(x,y);cx.rotate(rot);cx.scale(1,fy==null?1:fy);glp(()=>{cx.beginPath();cx.moveTo(-s*2.6,0);cx.quadraticCurveTo(0,-s*1.5,s*2.6,0);cx.quadraticCurveTo(0,s*1.5,-s*2.6,0);},c,a,0.7);cx.fillStyle=rgb(c,a*0.14);cx.fill();glp(()=>{cx.beginPath();cx.moveTo(-s*2.3,0);cx.lineTo(s*2.3,0);for(let v=-1;v<=1;v++){cx.moveTo(v*s*0.8,0);cx.lineTo(v*s*0.8+s*0.6,-s*0.75);cx.moveTo(v*s*0.8,0);cx.lineTo(v*s*0.8+s*0.6,s*0.75);}},c,a*0.6,0.45);cx.restore();}
function petalP(s){cx.beginPath();cx.moveTo(0,0);cx.quadraticCurveTo(-s*1.25,-s*1.1,-s*0.55,-s*2.3);cx.lineTo(0,-s*1.92);cx.lineTo(s*0.55,-s*2.3);cx.quadraticCurveTo(s*1.25,-s*1.1,0,0);}
function petalD(x,y,s,rot,c,a){if(a<=0.01)return;cx.save();cx.translate(x,y);cx.rotate(rot);glp(()=>petalP(s),c,a,0.6);cx.fillStyle=rgb(c,a*0.2);cx.fill();cx.restore();}
function flower(x,y,s,b,off,c,a){if(b<=0.01)return;for(let j=0;j<5;j++){cx.save();cx.translate(x,y);cx.rotate(j*1.2566+off);cx.scale(b,b);glp(()=>petalP(s),c,a,0.6);cx.fillStyle=rgb(c,a*0.2);cx.fill();cx.restore();}gdot(x,y,1.3*b,[255,225,170],a);}
function crys(x,y,s,rot,c,a){if(a<=0.01||s<=0.2)return;cx.save();cx.translate(x,y);cx.rotate(rot);glp(()=>{cx.beginPath();for(let k=0;k<6;k++){const an=k*1.0472,ca=Math.cos(an),sa=Math.sin(an);cx.moveTo(0,0);cx.lineTo(ca*s,sa*s);const bx=ca*s*0.55,by=sa*s*0.55;for(let q=-1;q<=1;q+=2){const a2=an+q*0.95;cx.moveTo(bx,by);cx.lineTo(bx+Math.cos(a2)*s*0.36,by+Math.sin(a2)*s*0.36);}}},c,a,0.55);cx.restore();}
/* ---- 情景の材料 ---- */
let BL=[],LP=[];
function mkTown(){BL=[];LP=[];let x=16;while(x<280){const g=Math.random()<0.6,w=R(16,28),h=g?R(14,22):R(24,40),base=ry(x+w/2)+3,ws=[];const cols=Math.max(1,Math.floor((w-4)/8)),rows=Math.max(1,Math.floor((h-6)/10));for(let a=0;a<cols;a++)for(let b=0;b<rows;b++)ws.push({x:x+4+a*8,y:base-h+4+b*10,d:R(25,105),o:R(15,95)});BL.push({x,w,h,base,g,rf:R(8,13),ch:g&&Math.random()<0.5,ws});x+=w+R(4,10);if(Math.random()<0.35&&x<270)LP.push({x:x-2,base:ry(x-2)+3});}}
function mkVines(){const vs=[],n=9;for(let v=0;v<n;v++){const x0=24+v*(252/(n-1))+R(-10,10),y0=ry(x0),len=Math.floor(R(9,30)),m=[],dir=Math.random()<0.5?1:-1,lean=R(-0.35,0.35),wob=R(6,12);for(let k=0;k<len;k++)m.push([x0+Math.sin(k*0.22+v)*wob*(k/len)+lean*k*1.4,y0-k*5]);const br=[];if(len>18){const b=Math.floor(len*0.45),bx=m[b][0],by=m[b][1],q=[],bl=Math.floor(R(8,13));for(let j=0;j<bl;j++)q.push([bx+dir*j*2,by-j*1.8+j*j*0.04]);const e=q[bl-1];for(let a=0;a<10;a++){const an=a*0.6,rr=5*(1-a/11);q.push([e[0]+dir*Math.sin(an)*rr,e[1]-rr+Math.cos(an)*rr]);}br.push({at:b,p:q});}const lv=[];for(let k=4;k<len;k+=Math.floor(R(4,6)))lv.push({k,s:Math.random()<0.5?1:-1,sz:R(1.7,2.4)});vs.push({m,br,lv,del:Math.floor(R(0,30))});}return vs;}
function mkTrees(){return [70,155,235].map(x=>{const b=ry(x),top=[x+R(-6,6),b-58],brs=[[top[0],top[1]],[x-18,b-40],[x+20,b-44],[x-10,b-28],[x+12,b-24]],lv=[];brs.forEach((q,bi)=>{for(let j=0;j<(bi===0?3:2);j++)lv.push({x:q[0]+R(-7,7),y:q[1]+R(-6,4),r:R(-1.2,1.2),s:R(1.6,2.2),dt:R(45,125),vx:R(0.1,0.7),vy:0,vr:R(-0.06,0.06),fl:R(0,6.28)});});return{x,b,top,brs,lv};});}
function mkBranch(){const m=[];for(let k=0;k<=30;k++){const t=k/30;m.push([-10+t*175,262-t*56+Math.sin(t*5)*5]);}const tw=[],fl=[];[8,14,20,26].forEach((k,i)=>{const b=m[k],d=i%2?1:-1,e=[b[0]+R(10,22),b[1]+d*R(10,16)];tw.push({k,a:b,b:e});fl.push({x:e[0],y:e[1],s:R(4.2,5.6),off:R(0,1.2),d:30+i*16});});[[5,-1],[11,1],[17,-1],[23,1],[29,0]].forEach((q,i)=>{const b=m[q[0]];fl.push({x:b[0]+q[1]*4,y:b[1]+q[1]*6-4,s:R(3.6,5),off:R(0,1.2),d:38+i*14});});const pe=[];fl.forEach((f,fi)=>{for(let j=0;j<5;j++)pe.push({fi,j,dt:R(20,100),x:0,y:0,r:0,vx:R(1.3,3.2),vy:R(-0.5,0.3),vr:R(-0.12,0.12),l:1,ph:R(0,6.28),on:false});});return{m,tw,fl,pe};}
/* ---- 情景の開始 ---- */
function inFX(i){TG[i]=1;RV[i]=0;const e={i,m:'in',t:0};if(i===6){e.d=[];e.rp=[];}if(i===5){e.d=[];e.cap=0;}if(i===4)BB=1;if(i===3)mkTown();if(i===1)e.v=mkVines();if(i===2)e.b=mkBranch();FX.push(e);}
function outFX(i){const e={i,m:'out',t:0};if(i===6){e.d=[];e.rp=[];}if(i===5){e.d=Array.from({length:42},()=>({x:R(10,PW-10),y:R(110,HY-14),v:R(0.2,0.5),ph:R(0,6.28),s:R(3,5.5),r:R(0,6.28)}));e.dr=[];}if(i===3)mkTown();if(i===1)e.tr=mkTrees();if(i===2)e.b=mkBranch();FX.push(e);}
function consStar(i){const r=consEl.getBoundingClientRect();return [r.left+CONS_PTS[i][0]*r.width/130,r.top+CONS_PTS[i][1]*r.height/46];}
function visualLose(i){TG[i]=memFloor();POP[i]=1;const p=consStar(i);RIP.push({x:p[0],y:p[1],t:0,c:COLORS[i].rgb,m:'out'});outFX(i);logLine(COLORS[i].lose,i);if(!S.flags.why){setTimeout(()=>story('why',LINES.why),4600);}}
function visualBack(i){POP[i]=1;const gp=[[150,170],[150,HY-28],[70,205],[150,HY-24],[150,110],[150,HY-8],[150,HY-40]][i];GLOWB.push({i,x:gp[0],y:gp[1],t:0});setTimeout(()=>inFX(i),180);logLine(COLORS[i].back,i);}
const VQ=[];let vqTimer=null;let GAP=3700;
function queueVisual(f){VQ.push(f);runVQ();}
let accEndAt=0;
function runVQ(){if(vqTimer||!VQ.length)return;if(!climax&&(ACC||Date.now()-accEndAt<2000)){vqTimer=setTimeout(()=>{vqTimer=null;runVQ();},400);return;}const f=VQ.shift();f();vqTimer=setTimeout(()=>{vqTimer=null;runVQ();},GAP);}
/* ---- 情景の描画（PW座標系）---- */
function ay(o,x,t){return o.ayp+Math.sin(x*0.018+t)*22+Math.sin(x*0.007-t*0.6)*30;}
function curtain(k,mode,t){const c=[120,170,255],tp=[175,150,255];for(let x=2;x<PW;x+=3){const by=150+Math.sin(x*0.02+T*0.01)*18+Math.sin(x*0.009-T*0.006)*22,L=72+38*Math.sin(x*0.05+T*0.02),I=0.55+0.45*Math.sin(x*0.13+T*0.04)*Math.sin(x*0.03-T*0.02);let u=0,rev=1;
  if(mode==='in')rev=cl((t*5-x)/40);else u=ei((t-12-x*0.18)/60);if(rev<=0)continue;const bot=by-u*L,len=L*(1-u);if(len<2)continue;const cc=mix(c,G,u),a=k*I*rev*(1-u*0.6);
  const g=cx.createLinearGradient(0,bot,0,bot-len);g.addColorStop(0,rgb(cc,0.85*a));g.addColorStop(0.25,rgb(cc,0.5*a));g.addColorStop(1,rgb(mix(tp,G,u),0));cx.fillStyle=g;cx.globalAlpha=0.55;cx.fillRect(x-1.6,bot-len,3.2,len);cx.globalAlpha=1;
  if(mode==='out'&&u>0.05&&u<0.95&&Math.random()<0.03)SP.push({x,y:bot,vx:R(-0.1,0.1),vy:-R(0.4,1),l:0.8,c:cc,r:0.8,dr:0.02});}}
function clearSky(k,t){const c=[100,155,255],w=[235,242,255];const g=cx.createLinearGradient(0,-40,0,HY-60);g.addColorStop(0,rgb(c,0.38*k));g.addColorStop(1,rgb(c,0));cx.fillStyle=g;cx.fillRect(-400,-1200,PW+800,HY-60+1200);
  for(let j=0;j<5;j++){const y=30+j*34+Math.sin(j*1.9)*8,off=((t*(0.25+j*0.05)+j*70)%(PW+160))-80,len=90+j*18,a=0.32*k*(1-j*0.12);cx.beginPath();cx.moveTo(off-len/2,y+4);cx.quadraticCurveTo(off,y-6,off+len/2,y+2);cx.strokeStyle=rgb(w,a);cx.lineWidth=1.4;cx.lineCap='round';cx.stroke();blob(off,y,len*0.35,w,a*0.25);}}
function skyBack(e){const k=ramp(e.t,0,30,130,210)*(LANDED?0.35:1);if(k<=0)return;const g=cx.createLinearGradient(0,-60,0,280);g.addColorStop(0,'rgba(36,66,170,'+(0.5*k)+')');g.addColorStop(0.6,'rgba(36,66,170,'+(0.16*k)+')');g.addColorStop(1,'rgba(36,66,170,0)');cx.fillStyle=g;cx.fillRect(-400,-1200,PW+800,1480);}
function sunScene(e){const t=e.t;let k,sy,ph,glow;if(e.m==='out'){k=ramp(t,0,18,170,200);sy=HY-62+100*ei((t-20)/110);ph=cl((t-30)/120);glow=1-cl((t-120)/55);}else{k=ramp(t,0,15,260,320);sy=HY+38-210*ei((t-25)/150);ph=1-cl((t-15)/120);glow=cl(t/40);}
  e.g=k;if(k<=0)return;const pal=[[255,150,72],[230,90,110],[150,80,175],[45,55,120]],pi=ph*3,i0=Math.min(2,Math.floor(pi)),sk=mix(pal[i0],pal[i0+1],pi-i0),sun=mix([255,215,150],[255,120,80],ph);
  const g=cx.createLinearGradient(0,HY-240,0,HY);g.addColorStop(0,rgb(sk,0));g.addColorStop(0.6,rgb(sk,0.16*k));g.addColorStop(1,rgb(sk,0.4*k*(0.5+0.5*glow)));
  cx.save();cx.beginPath();cx.moveTo(-45,-200);cx.lineTo(PW+45,-200);for(let x=PW+45;x>=-45;x-=5)cx.lineTo(x,ry(x));cx.closePath();cx.clip();cx.fillStyle=g;cx.fillRect(-40,HY-240,PW+80,290);
  blob(150,sy,130,sk,0.45*k);const near=cl(1-(ry(150)-sy)/24),rx=24,rY=24*(1-0.2*near);
  for(let j=0;j<14;j++){const an=j/14*6.283+T*0.003,r1=31,r2=r1+6+3*Math.sin(T*0.05+j);glp(()=>{cx.beginPath();cx.moveTo(150+Math.cos(an)*r1,sy+Math.sin(an)*r1*(rY/rx));cx.lineTo(150+Math.cos(an)*r2,sy+Math.sin(an)*r2*(rY/rx));},sun,0.45*k,0.6);}
  glp(()=>{cx.beginPath();cx.ellipse(150,sy,rx,rY,0,0,6.283);},sun,0.95*k,1.4);cx.fillStyle=rgb(sun,0.2*k);cx.fill();glp(()=>{cx.beginPath();cx.ellipse(150,sy,rx*0.62,rY*0.62,0,0,6.283);},sun,0.35*k,0.6);
  for(let j=0;j<3;j++){const yy=HY-70-j*34,xx=40+j*95+Math.sin(T*0.004+j)*10;glp(()=>{cx.beginPath();cx.moveTo(xx-40,yy);cx.quadraticCurveTo(xx,yy-6,xx+44,yy+1);},mix(sun,sk,0.3),0.5*k*(1-ph*0.7),0.7);}
  cx.restore();const aw=e.m==='out'?120*(1-cl((t-110)/55)):120*cl((t-5)/35);if(aw>1)glp(()=>{cx.beginPath();for(let x=150-aw;x<=150+aw;x+=4)x===150-aw?cx.moveTo(x,ry(x)):cx.lineTo(x,ry(x));},mix([255,170,110],sk,0.4),0.9*k,1.6);}
function vineScene(e){const t=e.t,fd=ramp(t,0,10,150,195);e.g=fd;if(fd<=0)return;const gc=[150,240,190];e.v.forEach(v=>{const tt=t-v.del;if(tt<=0)return;const n=Math.min(v.m.length,Math.floor(tt*0.7));if(n<2)return;
  glp(()=>{cx.beginPath();cx.moveTo(v.m[0][0],v.m[0][1]);for(let k=1;k<n;k++)cx.lineTo(v.m[k][0],v.m[k][1]);},gc,0.85*fd,1);
  v.br.forEach(b=>{if(n<=b.at)return;const bn=Math.min(b.p.length,Math.floor((n-b.at)*1.3));if(bn<2)return;glp(()=>{cx.beginPath();cx.moveTo(b.p[0][0],b.p[0][1]);for(let k=1;k<bn;k++)cx.lineTo(b.p[k][0],b.p[k][1]);},gc,0.7*fd,0.7);});
  v.lv.forEach(l=>{const s=cl((n-l.k)/6);if(s<=0)return;const q=v.m[l.k];leafL(q[0]+l.s*6*s,q[1]-3,l.sz*s,l.s*0.6-0.25,[120,235,165],0.9*fd);});gdot(v.m[n-1][0],v.m[n-1][1],1.3,[180,255,210],fd);});}
function treeScene(e){const t=e.t,ta=ramp(t,0,18,140,185);e.g=ramp(t,0,18,170,200);const tc=[200,210,235];
  e.tr.forEach(tr=>{if(ta>0)glp(()=>{cx.beginPath();cx.moveTo(tr.x,tr.b);cx.lineTo(tr.top[0],tr.top[1]);for(let j=1;j<tr.brs.length;j++){const q=tr.brs[j],my=tr.b-(tr.b-q[1])*0.55;cx.moveTo(tr.x+(tr.top[0]-tr.x)*0.4,my+6);cx.lineTo(q[0],q[1]);}},tc,0.55*ta,0.8);
  tr.lv.forEach(l=>{const ph=cl((t-25)/40);let cc=ph<0.5?mix([120,235,165],[245,210,90],ph*2):mix([245,210,90],[185,120,60],(ph-0.5)*2),a=0.9*ramp(t,0,18,999,1000),fy=1;
   if(t>l.dt){const ft=t-l.dt;l.vy=Math.min(1.1,0.25+ft*0.02);l.x+=l.vx+Math.sin(T*0.06+l.fl)*0.6;l.y+=l.vy;l.r+=l.vr;fy=Math.cos(T*0.09+l.fl);cc=mix(cc,[140,142,152],cl(ft/70));a=0.9*(1-cl((ft-40)/50));}
   leafL(l.x,l.y,l.s,l.r,cc,a,fy);});});}
function flowerScene(e){const t=e.t,b=e.b,ba=e.m==='in'?ramp(t,0,10,170,210):ramp(t,0,12,125,170);e.g=0;if(ba<=0&&e.m==='in'){e.done=t>20;return;}const bc=[220,200,215],pk=[255,175,215];
  const bn=e.m==='in'?Math.min(b.m.length,Math.floor(t)):b.m.length;if(ba>0&&bn>1)glp(()=>{cx.beginPath();cx.moveTo(b.m[0][0],b.m[0][1]);for(let k=1;k<bn;k++)cx.lineTo(b.m[k][0],b.m[k][1]);b.tw.forEach(w=>{if(w.k<bn){cx.moveTo(w.a[0],w.a[1]);cx.lineTo(w.b[0],w.b[1]);}});},bc,0.55*ba,0.9);
  if(e.m==='in'){b.fl.forEach(f=>flower(f.x,f.y,f.s,eo((t-f.d)/26),f.off,pk,0.9*ba));return;}
  let alive=ba>0;b.pe.forEach(p=>{const f=b.fl[p.fi];if(t<p.dt){const a=0.9*ramp(t,0,12,999,1000);cx.save();cx.translate(f.x,f.y);cx.rotate(p.j*1.2566+f.off);glp(()=>petalP(f.s),pk,a,0.6);cx.fillStyle=rgb(pk,a*0.2);cx.fill();cx.restore();return;}
   if(!p.on){p.on=true;const an=p.j*1.2566+f.off;p.x=f.x+Math.sin(an)*f.s;p.y=f.y-Math.cos(an)*f.s;p.r=an;}if(p.l<=0)return;alive=true;p.x+=p.vx;p.y+=p.vy+Math.sin(T*0.07+p.ph)*0.7;p.r+=p.vr;p.l-=0.012;petalD(p.x,p.y,f.s*0.9,p.r,mix(pk,[150,150,160],cl((1-p.l)*1.5)),p.l*0.9);});
  b.fl.forEach(f=>gdot(f.x,f.y,1.2,[255,225,170],0.8*ba));if(!alive&&t>140)e.done=true;}
function townScene(e){const t=e.t,k=e.m==='in'?ramp(t,0,25,175,215):ramp(t,0,12,110,150);e.g=k;if(k<=0)return;const oc=[190,198,225],wc=[255,214,140];
  BL.forEach(b=>{glp(()=>{cx.beginPath();cx.moveTo(b.x,b.base);cx.lineTo(b.x,b.base-b.h);if(b.g)cx.lineTo(b.x+b.w/2,b.base-b.h-b.rf);cx.lineTo(b.x+b.w,b.base-b.h);cx.lineTo(b.x+b.w,b.base);if(b.ch){const chx=b.x+b.w*0.72;cx.moveTo(chx,b.base-b.h-b.rf*0.45);cx.lineTo(chx,b.base-b.h-b.rf-3);cx.lineTo(chx+3,b.base-b.h-b.rf-3);cx.lineTo(chx+3,b.base-b.h-b.rf*0.3);}},oc,0.5*k,0.7);
   b.ws.forEach(w=>{const lit=e.m==='in'?cl((t-w.d)/6):1-cl((t-w.o)/6);if(lit>0.02){blob(w.x+2,w.y+2.5,9,wc,0.45*lit*k);cx.fillStyle=rgb(wc,0.9*lit*k);cx.fillRect(w.x,w.y,4,5);cx.fillStyle='rgba(30,26,20,'+(0.7*lit*k)+')';cx.fillRect(w.x+1.8,w.y,0.5,5);cx.fillRect(w.x,w.y+2.3,4,0.5);}else{cx.strokeStyle=rgb(oc,0.25*k);cx.lineWidth=0.5;cx.strokeRect(w.x,w.y,4,5);}});});
  LP.forEach((l,li)=>{const lit=e.m==='in'?cl((t-100-li*4)/8):1-cl((t-95-li*4)/8);glp(()=>{cx.beginPath();cx.moveTo(l.x,l.base);cx.lineTo(l.x,l.base-24);cx.lineTo(l.x+5,l.base-24);},oc,0.5*k,0.6);if(lit>0)gdot(l.x+5,l.base-22,1.4,wc,lit*k);});
  if(e.m==='in'&&t===112)devGlow=1;}
function snowScene(e){const t=e.t,wc=[245,247,255];if(e.m==='in'){const k=ramp(t,0,12,175,220);e.g=k;if(k<=0)return;if(t<110&&t%2===0)e.d.push({x:R(5,PW-5),y:R(-30,10),v:R(0.8,1.4),ph:R(0,6.28),s:R(3,5.5),r:R(0,6.28)});
  for(let i=e.d.length-1;i>=0;i--){const d=e.d[i];d.y+=d.v;d.x+=Math.sin(T*0.03+d.ph)*0.4;d.r+=0.01;if(d.y>=ry(d.x)-2){e.d.splice(i,1);e.cap=Math.min(1,e.cap+0.025);SP.push({x:d.x,y:ry(d.x)-1,vx:0,vy:-0.2,l:0.7,c:wc,r:0.7,dr:0.03});continue;}crys(d.x,d.y,d.s,d.r,wc,0.9*k);}
  if(e.cap>0){glp(ridgePath,wc,0.85*e.cap*k,1.6);for(let x=4;x<PW;x+=7)gdot(x,ry(x)-1.5,0.8,wc,0.6*e.cap*k*(0.6+0.4*Math.sin(T*0.1+x)));}return;}
  const k=ramp(t,0,12,140,175);e.g=k;if(k<=0)return;const m=cl((t-30)/55),cap=1-cl((t-40)/90);
  e.d.forEach(d=>{d.v+=m*0.05;d.y+=d.v;d.x+=Math.sin(T*0.03+d.ph)*0.4*(1-m);const c=mix(wc,[150,156,170],m);if(m<0.8)crys(d.x,d.y,d.s*(1-m),d.r,c,0.9*k);if(m>0.2&&d.y<378){cx.beginPath();cx.ellipse(d.x,d.y,1.1,1.1+3*m,0,0,6.283);cx.fillStyle=rgb(c,0.8*k*(1-cl((t-110)/30)));cx.fill();}});
  if(cap>0){glp(ridgePath,mix(wc,[150,156,170],1-cap),0.85*cap*k,1.6);if(t>40&&t<130&&t%3===0){const x=R(5,PW-5);e.dr.push({x,y:ry(x),v:0.5});}}
  e.dr.forEach(d=>{d.v+=0.08;d.y+=d.v;if(d.y<378){cx.beginPath();cx.ellipse(d.x,d.y,1,2.4,0,0,6.283);cx.fillStyle=rgb([170,178,196],0.7*k);cx.fill();}});}
function rainScene(e){const t=e.t,rc=[190,205,230],k=e.m==='in'?ramp(t,0,10,165,200):ramp(t,0,8,110,140);e.g=k;if(k<=0)return;const falling=e.m==='in'?t<130:t<45;
  if(falling)for(let j=0;j<4;j++)e.d.push({x:R(0,PW+50),y:R(-60,40),v:R(8,11),l:R(12,18)});
  for(let i=e.d.length-1;i>=0;i--){const d=e.d[i];if(e.m==='out'&&t>=45){const fz=cl((t-45)/40),fa=1-cl((t-85)/35),c=mix([230,238,255],[150,155,168],cl((t-80)/30));gdot(d.x,d.y,0.9,c,0.9*fa*k*(0.7+0.3*Math.sin(T*0.2+i)));if(fz<1)glp(()=>{cx.beginPath();cx.moveTo(d.x,d.y);cx.lineTo(d.x+d.l*0.2*(1-fz),d.y-d.l*(1-fz));},rc,0.5*(1-fz)*k,0.6);continue;}
   d.y+=d.v;d.x-=d.v*0.2;const gy=ry(d.x);if(d.y>=gy){e.d.splice(i,1);e.rp.push({x:d.x,y:gy,t:0});continue;}glp(()=>{cx.beginPath();cx.moveTo(d.x,d.y);cx.lineTo(d.x+d.l*0.2,d.y-d.l);},rc,0.6*k,0.55);}
  for(let i=e.rp.length-1;i>=0;i--){const r=e.rp[i];r.t++;const p=r.t/26;if(p>=1){e.rp.splice(i,1);continue;}cx.beginPath();cx.ellipse(r.x,r.y,1+10*p,0.6+2.2*p,0,0,6.283);cx.strokeStyle=rgb(rc,0.6*(1-p)*k);cx.lineWidth=0.7;cx.stroke();if(r.t<8){gdot(r.x-2-r.t*0.3,r.y-r.t*0.9+r.t*r.t*0.08,0.6,rc,0.7*k);gdot(r.x+2+r.t*0.3,r.y-r.t*0.9+r.t*r.t*0.08,0.6,rc,0.7*k);}}}
