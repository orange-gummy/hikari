'use strict';
/* =====================================================================
   RENDER ― 背景・加速や停止の演出（実座標）
   ===================================================================== */
function aurBand(i,o,a,rv){if(a<=0.01||rv<=0.01)return;const t=T*0.012+i*1.7,edge=-30+rv*(CW+90),sy=CH/610,base=o.ay*CH;
  for(let x=0;x<=CW;x+=3){const fade=cl((edge-x)/50);if(fade<=0)break;const y=base+(Math.sin(x*0.018+t)*22+Math.sin(x*0.007-t*0.6)*30)*sy,cur=0.55+0.45*Math.sin(x*0.09+T*0.02+i)*Math.sin(x*0.031-T*0.013),h=(40+18*Math.sin(x*0.02+t*1.3))*sy,al=0.16*a*fade*cur;
   const g=cx.createLinearGradient(0,y-h,0,y+h*0.35);g.addColorStop(0,rgb(o.rgb,0));g.addColorStop(0.55,rgb(o.rgb,al*0.55));g.addColorStop(0.85,rgb(o.rgb,al));g.addColorStop(1,rgb(o.rgb,0));cx.fillStyle=g;cx.fillRect(x,y-h,3.2,h*1.35);}}
let devGlow=0;
/* ③の航海：窓を横切る地平線の光の帯（自分たちの銀河を外から見る）。光の点を一度だけ描いておき、毎フレーム重ねる */
let BAND=null;
function bandCanvas(w,h){if(BAND&&BAND.w===w&&BAND.h===h)return BAND.c;const c=document.createElement('canvas');c.width=Math.ceil(w*DPR);c.height=Math.ceil(h*DPR);const x=c.getContext('2d');x.scale(DPR,DPR);
  let seed=11;const rnd=()=>{seed=(seed*16807)%2147483647;return seed/2147483647;};
  const dot=(px,py,r,col,a)=>{const g=x.createRadialGradient(px,py,0,px,py,r*3);g.addColorStop(0,'rgba('+col+','+a+')');g.addColorStop(1,'rgba('+col+',0)');x.fillStyle=g;x.beginPath();x.arc(px,py,r*3,0,6.283);x.fill();};
  const y0=h*0.36,n=Math.round(1600*w/420);
  for(let i=0;i<n;i++){const u=rnd(),xx=u*w,wd=Math.exp(-Math.pow((u-0.62)*3.2,2)),yy=y0+(rnd()-0.5)*(10+38*wd)-(u-0.5)*22,k=Math.abs(rnd()-0.5);dot(xx,yy,0.35+rnd()*0.6,k<0.2?'255,236,215':'200,180,255',(0.15+0.55*wd)*rnd());}
  const g=x.createRadialGradient(w*0.62,y0-3,0,w*0.62,y0-3,60);g.addColorStop(0,'rgba(255,236,220,.22)');g.addColorStop(1,'rgba(255,236,220,0)');x.fillStyle=g;x.fillRect(0,0,w,h);
  BAND={c,w,h};return c;}
function drawBand(){if(!S.voy||LANDED||HOMEA||FR.w<=0)return;const c=bandCanvas(FR.w,FR.h);cx.save();cx.globalAlpha=0.85;cx.drawImage(c,FR.x,FR.y+Math.sin(T*0.002)*2,FR.w,FR.h);cx.restore();}
let FRK=1,FRT=0;   // 1フレーム（60fps）を1とした経過時間。流れ星は画面の書き換えの速さによらず、実際の時間で動かす
function frame(){requestAnimationFrame(frame);if(FREEZE)return;{const n=performance.now();FRK=FRT?Math.max(0.2,Math.min(3,(n-FRT)/16.667)):1;FRT=n;}const f0=FR;if(LANDED||HOMEA)FR={x:0,y:0,w:CW,h:CH};try{frameInner();drawShower();drawFold();drawLightMark();drawLightEnd();}finally{FR=f0;}}
/* ④ 宇宙を畳む：星がすべて中心へ流れ込み（4秒）→ 光の点ひとつ（2秒）→ 点がほどけて新しい色合いの空が広がる */
let FOLD=null;
function startFold(){if(!canFold()||FOLD)return;FOLD={t:0};SND.play('fold');document.getElementById('block').style.display='block';const p=document.getElementById('panel');p.style.transition='opacity 1.5s';p.style.opacity='0.12';paintGoal();}
function drawFold(){const f=FOLD;if(!f)return;f.t++;const t=f.t,X=RC.x||CW/2,Y=RC.y||CH/2;let dark=0,pt=0;
  if(t<=240){CONV=ei(t/240);SPDF=1+4*t/240;stk=Math.max(stk,30);dark=cl((t-170)/70);pt=t/240;}
  else if(t<380){dark=1;pt=1;if(t===300){fold();CONV=0;SPDF=1;stk=0;BAND=null;applyLoadedVisuals();curTab='uni';uniPast=-1;renderPanel(true);save();}}
  else if(t<560){const k=(t-380)/180;dark=1-ei(k);pt=1-k;if(t===400)logLine(UNI_LINES[Math.min(S.uni,UNI_LINES.length-1)],-1);}
  else{FOLD=null;document.getElementById('block').style.display='none';document.getElementById('panel').style.opacity='1';paintGoal();return;}
  if(dark>0){cx.fillStyle='rgba(4,5,12,'+dark.toFixed(3)+')';cx.fillRect(0,0,CW,CH);}
  if(pt>0){blob(X,Y,(t<380?16+70*pt:16+260*(1-pt)),[230,235,255],0.5*pt);blob(X,Y,6,[255,255,255],pt);}
  if(t>=380){const a=Math.sin(Math.PI*cl((t-380)/180));cx.save();cx.font='400 17px "Shippori Mincho B1",serif';cx.textAlign='center';cx.fillStyle='rgba(236,238,242,'+(0.85*a).toFixed(3)+')';cx.fillText('宇宙 '+roman(S.uni+1),X,Y+125*RCS);cx.restore();}}
/* 新しい宇宙の色合い：窓の中心に、その宇宙の色をうっすら重ねる（宇宙 I の白は重ねない） */
function drawTint(){if(!S.uTint||LANDED||HOMEA||FR.w<=0)return;const c=UNI_TINT[S.uTint%UNI_TINT.length],X=FR.x+FR.w/2,Y=FR.y+FR.h*0.45,r=Math.max(FR.w,FR.h)*0.75;const g=cx.createRadialGradient(X,Y,0,X,Y,r);g.addColorStop(0,rgb(c.a,0.13));g.addColorStop(0.55,rgb(c.b,0.05));g.addColorStop(1,rgb(c.a,0));cx.fillStyle=g;cx.fillRect(FR.x,FR.y,FR.w,FR.h);}
function frameInner(){
  if(!STILL)T++;for(let i=0;i<7;i++){A[i]+=(TG[i]-A[i])*(TG[i]?0.03:0.022);if(TG[i])RV[i]=Math.min(1,RV[i]+0.012);POP[i]*=0.93;}BB*=0.993;
  const BV=[0,0,0,0.01,0.02,0.03,0.05,0.1,0.18,0.3,0.4,0.5,0.7,0.82,0.9,0.94,0.96,0.97,0.975,0.98,0.983,0.985,0.987];const bvT=BV[Math.min(22,S.stage)];if(BVC<0)BVC=bvT;if(!(ACC&&ACC.t<CH_T)&&!BRK)BVC+=(bvT-BVC)*0.03;const aw=A[5],ag=A[6],bv=BVC*(1-CONV)+CONV*0.995,sc=Math.max(CW,CH)/600;
  cx.clearRect(0,0,CW,CH);drawTint();drawBand();
  if(!LANDED)for(let i=0;i<5;i++){const o=COLORS[i];if(o.nx==null)continue;const a=A[i],c=mix(o.rgb,G,1-a);for(let j=0;j<3;j++){const bx=o.nx*CW+Math.sin(T*0.004+j*2.1+i)*40,by=o.ny*CH+Math.cos(T*0.0033+j*1.7+i)*34;blob(bx,by,o.nr*sc*(0.7+0.2*j),c,0.12*(0.08+0.92*a));}}
  for(let i=0;i<5;i++){const o=COLORS[i];if(o.ay!=null)aurBand(i,o,A[i],RV[i]);}
  // stars
  const tw=0.25*aw,CXs=RC.x||CW/2,CYs=RC.y||CH/2,rs=420*sc*(1-CONV*0.92)*ZOOM;
  if(!LANDED&&!(HOMEA&&HOMEA.t>45)&&!(HEARD&&HEARD.t>100))for(const s of STARS){s.t+=s.v*0.75*SPDF*(1+CONV*4);if(s.t>3.1){s.t=0.02+Math.random()*0.2;s.p=Math.random()*6.283;}else if(s.t<0.02&&SPDF<0){s.t=2.95+Math.random()*0.14;s.p=Math.random()*6.283;}
    const c=Math.cos(s.t),ca=(c+bv)/(1+bv*c),ta=Math.acos(Math.max(-1,Math.min(1,ca))),r=0.5*rs*Math.tan(Math.min(ta,3.0)/2),x=CXs+r*Math.cos(s.p),y=CYs+r*Math.sin(s.p);if(x<-8||x>CW+8||y<-8||y>CH+8)continue;
    const col=mix(COLORS[s.k].rgb,G,1-A[s.k]),f=1-2*ta/Math.PI;let al=cl((0.35+0.5*s.w+f*0.3)*(0.55+0.45*aw)+Math.sin(T*0.05+s.ph)*tw+CONV*0.4);if(al<0.06)al=0.06;
    if(stk>0&&(s.big||s.q<0.5)){const k=Math.min(1,stk/46),SL=Math.min(0.6,0.28+0.015*(ACC?ACC.lvl:0)),rr=r*(1-SL*k),sc2=f>0?mix(col,[150,190,255],0.55*A[4]):mix(col,[255,140,120],0.55*A[0]);cx.beginPath();cx.moveTo(CXs+rr*Math.cos(s.p),CYs+rr*Math.sin(s.p));cx.lineTo(x,y);cx.strokeStyle=rgb(sc2,Math.min(1,al*k*1.3));cx.lineWidth=s.s*(0.45+0.3*k);cx.stroke();}
    if(s.big&&al>0.4)blob(x,y,7*(0.6+0.4*aw),col,al*0.32);
    cx.beginPath();cx.arc(x,y,s.s*(0.7+0.3*aw),0,6.283);cx.fillStyle=rgb(col,al);cx.fill();}
  if(stk>0)stk--;
  if(!LANDED&&!(HOMEA&&HOMEA.t>45)&&!(HEARD&&HEARD.t>100))for(const m of FLY){const a=A[m.k];if(!STILL){m.x+=(m.vx+Math.sin(T*0.01+m.ph)*0.2)*0.4/CW;m.y+=m.vy*0.4/CH;}if(SPDF>1){const f2=(SPDF-1)*0.012;m.x+=(m.x*CW-CXs)*f2/CW;m.y+=(m.y*CH-CYs)*f2/CH;}if(m.y>1.04||m.y<-0.02||m.x<-0.02||m.x>1.02){if(SPDF>1.05){const an=Math.random()*6.283,rr=R(0.03,0.2)*Math.min(CW,CH);m.x=(CXs+Math.cos(an)*rr)/CW;m.y=(CYs+Math.sin(an)*rr)/CH;}else if(m.y<-0.02){m.y=1.02;m.x=Math.random();}else{m.x=Math.random();m.y=Math.random();}}
    const px=m.x*CW,py=m.y*CH;if(Math.abs(px-CXs)<52&&Math.abs(py-CYs)<34)continue;const pu=0.5+0.5*Math.sin(T*0.04+m.ph),cc=mix(COLORS[m.k].rgb,G,1-a),al=(0.25+0.6*pu)*(0.4+0.6*a);blob(px,py,m.r*6,cc,al*0.3);cx.beginPath();cx.arc(px,py,m.r,0,6.283);cx.fillStyle=rgb(cc,al);cx.fill();}
  // scenes inside the window
  if(HEARD&&!LANDED){HEARD.t++;cx.fillStyle='rgba(19,21,30,'+ei(cl(HEARD.t/100)).toFixed(3)+')';cx.fillRect(0,0,CW,CH);}
  if(LANDED){cx.save();cx.beginPath();if(cx.roundRect)cx.roundRect(FR.x,FR.y,FR.w,FR.h,18);else cx.rect(FR.x,FR.y,FR.w,FR.h);cx.clip();cx.fillStyle='rgb(19,21,30)';cx.fillRect(FR.x,FR.y,FR.w,FR.h);const mn=Math.min(A[0],A[1],A[2],A[3],A[4],A[5],A[6]),sa=0.45*ei(cl((mn-0.5)/0.5)),sk=cx.createLinearGradient(0,FR.y,0,FR.y+FR.h);sk.addColorStop(0,rgb(mix([127,177,234],[60,64,74],1-A[4]),sa));sk.addColorStop(0.6,rgb(mix([184,212,241],[60,64,74],1-A[5]),sa*0.8));sk.addColorStop(1,rgb(mix([242,170,120],[60,64,74],1-A[0]),sa));cx.fillStyle=sk;cx.fillRect(FR.x,FR.y,FR.w,FR.h);cx.restore();}
  if(FX.length||SP.length||GLOWB.length){const s=LANDED?Math.max(FR.w/276,FR.h/380):Math.min(FR.w/276,FR.h/200);cx.save();cx.beginPath();if(cx.roundRect)cx.roundRect(FR.x,FR.y,FR.w,FR.h,18);else cx.rect(FR.x,FR.y,FR.w,FR.h);cx.clip();
    cx.translate(FR.x+(FR.w-276*s)/2-12*s,FR.y+FR.h-378*s);cx.scale(s,s);
    let gA=0;FX.forEach(e=>{e.t++;if(e.i===4&&e.m==='in')skyBack(e);});
    FX.forEach(e=>{if(e.i===4){const k=e.m==='in'?ramp(e.t,0,10,140,210):ramp(e.t,0,6,150,170);if(k>0)curtain(k*(e.m==='in'?1.2:1),e.m,e.t);else e.done=true;}});
    FX.forEach(e=>{if(e.i===0)sunScene(e);if(e.i===3)townScene(e);if(e.g!=null)gA=Math.max(gA,e.g);});
    GA+=(gA-GA)*0.15;if(GA>0.01){glp(ridgePath,[200,210,235],0.5*GA,0.9);for(let x=3;x<PW;x+=9)gdot(x,ry(x),0.6,[200,210,235],0.5*GA*(0.5+0.5*Math.sin(T*0.07+x*0.7)));}
    FX.forEach(e=>{if(e.i===1)(e.m==='in'?vineScene:treeScene)(e);if(e.i===2)flowerScene(e);if(e.i===5)snowScene(e);if(e.i===6)rainScene(e);});
    for(let i=SP.length-1;i>=0;i--){const p=SP[i];p.x+=p.vx;p.y+=p.vy;p.l-=p.dr;if(p.l<=0){SP.splice(i,1);continue;}gdot(p.x,p.y,p.r,p.c,p.l*0.9);}
    for(let i=GLOWB.length-1;i>=0;i--){const g=GLOWB[i];g.t++;const p=g.t/110;if(p>=1){GLOWB.splice(i,1);continue;}const c=COLORS[g.i].rgb,a=Math.sin(Math.PI*Math.min(1,p*1.4))*(1-p*0.4);blob(g.x,g.y,14+eo(p)*210,c,0.32*a);blob(g.x,g.y,8+eo(p)*70,mix(c,[255,255,255],0.4),0.45*a);}
    cx.restore();for(let i=FX.length-1;i>=0;i--)if(FX[i].done||FX[i].t>(FX[i].i===0&&FX[i].m==='in'?330:260))FX.splice(i,1);}
  if(BLOOM){BLOOM.t++;const p=BLOOM.t/150;if(p>=1)BLOOM=null;else{const k=Math.sin(Math.PI*Math.min(1,p*1.3));blob(RC.x,RC.y,40+eo(p)*Math.max(CW,CH)*0.55,[255,246,232],0.32*k);blob(RC.x,RC.y,20+30*eo(p),[255,255,255],0.5*k);}}
  if(HOMEA)drawHome();
  // dark behind the speed number
  if(!LANDED&&!HOMEA){const dg=cx.createRadialGradient(CXs,CYs,0,CXs,CYs,74);dg.addColorStop(0,'rgba(4,5,12,0.62)');dg.addColorStop(0.6,'rgba(4,5,12,0.4)');dg.addColorStop(1,'rgba(4,5,12,0)');cx.fillStyle=dg;cx.fillRect(CXs-74,CYs-74,148,148);}
  for(let i=RIP.length-1;i>=0;i--){const q=RIP[i];q.t++;if(q.m==='in'){const p=q.t/70;if(p>=1){RIP.splice(i,1);continue;}const rr=6+eo(p)*Math.max(CW,CH)*0.9;cx.beginPath();cx.arc(q.x,q.y,rr,0,6.283);cx.strokeStyle=rgb(q.c,0.25*(1-p));cx.lineWidth=1+2*(1-p);cx.stroke();blob(q.x,q.y,24*(1-p)+6,q.c,0.7*(1-p));}
    else{const p=q.t/36;if(p>=1){RIP.splice(i,1);continue;}const rr=30*(1-eo(p));cx.beginPath();cx.arc(q.x,q.y,rr,0,6.283);cx.strokeStyle=rgb(mix(q.c,G,p),0.5*(1-p*0.5));cx.lineWidth=0.8;cx.stroke();}}
  for(let i=TRIP.length-1;i>=0;i--){const q=TRIP[i];q.t++;const p=q.t/45;if(p>=1){TRIP.splice(i,1);continue;}cx.beginPath();cx.arc(q.x,q.y,12+eo(p)*60,0,6.283);cx.strokeStyle=rgb(q.c,0.7*(1-p));cx.lineWidth=1.2*(1-p)+0.3;cx.stroke();}
  for(let i=P.length-1;i>=0;i--){const p=P[i];p.x+=p.vx;p.y+=p.vy;p.vx*=0.975;p.vy*=0.975;p.l-=p.dr;if(p.l<=0){P.splice(i,1);continue;}const gk=p.gr?cl((1-p.l)*3):0,cc=mix(p.c,G,gk);if(i%2===0)blob(p.x,p.y,p.r*5,cc,p.l*0.18);cx.beginPath();cx.arc(p.x,p.y,p.r,0,6.283);cx.fillStyle=rgb(cc,p.l*0.95);cx.fill();}
  cx.font='300 15px Jura, sans-serif';cx.textAlign='center';
  for(let i=POPS.length-1;i>=0;i--){const q=POPS[i];q.t++;const p=q.t/55;if(p>=1){POPS.splice(i,1);continue;}cx.fillStyle='rgba(246,247,251,'+(1-p)+')';cx.fillText(q.s,q.x,q.y-eo(p)*44);}
  if(ACC)drawAcc();
  drawMeteor();
  if(BRK)drawBrk();
  if(RST)drawRst();
  if(CRACK)drawCrack();
  const dk=(1-ag)*0.5;if(dk>0.005){const vg=cx.createRadialGradient(CW/2,CH/2,Math.min(CW,CH)*0.2,CW/2,CH/2,Math.max(CW,CH)*0.7);vg.addColorStop(0,'rgba(0,0,0,0)');vg.addColorStop(1,'rgba(0,0,0,'+(dk*0.9)+')');cx.fillStyle=vg;cx.fillRect(0,0,CW,CH);}
  if(S.over>0){const k=Math.min(1,S.over/6)*(0.6+0.4*Math.sin(T*0.15)),g=cx.createRadialGradient(CW/2,CH/2,Math.min(CW,CH)*0.25,CW/2,CH/2,Math.max(CW,CH)*0.75);g.addColorStop(0,'rgba(0,0,0,0)');g.addColorStop(1,rgb(mix([255,180,90],G,1-A[3]),0.2*k));cx.fillStyle=g;cx.fillRect(0,0,CW,CH);}
  if(fla>0){cx.fillStyle='rgba(240,242,250,'+fla+')';cx.fillRect(0,0,CW,CH);fla*=0.9;if(fla<0.005)fla=0;}
  if(T%3===0)paintColorUI(ag);
}
let GA=0;
function drawCrack(){const c=CRACK;c.t++;const p=cl(c.t/90);cx.save();cx.strokeStyle='rgba(240,244,255,'+(0.9)+')';cx.lineWidth=1;cx.shadowColor='rgba(220,230,255,.8)';cx.shadowBlur=6;
  c.br.forEach(b=>{const n=Math.floor(b.length*p);if(n<2)return;cx.beginPath();cx.moveTo(b[0][0],b[0][1]);for(let k=1;k<n;k++)cx.lineTo(b[k][0],b[k][1]);cx.stroke();});cx.restore();if(c.t>110)CRACK=null;}
function drawMeteor(){if(LANDED||HOMEA||SHOWER){MET=null;return;}if(!MET){const rate=(S.flags.bat?1/(60*20):0)*(has('e2')?1.5:1)+(has('cS')?1/(60*20):0);if(rate>0&&!BRK&&!RST&&!STILL&&FR.w>0&&Math.random()<rate*FRK){const L=Math.random()<0.5,sx=L?FR.x-20:FR.x+FR.w+20,sy=FR.y+R(10,FR.h*0.45),tx=L?FR.x+FR.w+40:FR.x-40,ty=sy+R(FR.h*0.35,FR.h*0.7),d=R(150,190);MET={x:sx,y:sy,vx:(tx-sx)/d,vy:(ty-sy)/d,t:0,d};}return;}
  const m=MET;m.t+=FRK;m.x+=m.vx*FRK;m.y+=m.vy*FRK;if(m.t>m.d){MET=null;return;}const tl=Math.hypot(m.vx,m.vy)*14,ux=m.vx/Math.hypot(m.vx,m.vy),uy=m.vy/Math.hypot(m.vx,m.vy),c=mix([255,236,200],G,1-A[3]*0.6);
  const g=cx.createLinearGradient(m.x,m.y,m.x-ux*tl,m.y-uy*tl);g.addColorStop(0,rgb(c,0.95));g.addColorStop(1,rgb(c,0));cx.strokeStyle=g;cx.lineWidth=2;cx.beginPath();cx.moveTo(m.x,m.y);cx.lineTo(m.x-ux*tl,m.y-uy*tl);cx.stroke();blob(m.x,m.y,18,c,0.55);cx.beginPath();cx.arc(m.x,m.y,2.2,0,6.283);cx.fillStyle='#fffaf0';cx.fill();}
function catchMeteor(){const m=MET;MET=null;const g=prodRate()*(has('cS')?300:60);S.E+=g;S.Erun+=g;let s='流れ星 +'+fmt(g);if(S.flags.bat){vesAdd(1);S.deposited=true;s='器 +1　'+s;if(curTab==='battery')renderPanel(true);}SND.play('catch',4);POPS.push({x:m.x,y:m.y-14,t:0,s});for(let k=0;k<50;k++){const a=Math.random()*6.283,v=R(0.8,4);P.push({x:m.x,y:m.y,vx:Math.cos(a)*v,vy:Math.sin(a)*v,l:1,c:k%3?[255,236,200]:mix(COLORS[k%6].rgb,G,1-A[k%6]),r:R(0.8,2.2),dr:0.016});}}
function startRestart(rs,quiet){RST={t:0,rs:!!rs,quiet:!!quiet};if(!quiet)SND.play('resail');if(!quiet){curTab='drive';document.getElementById('app').classList.add('rstDim');}renderPanel(true);document.getElementById('block').style.display='block';}   // quiet＝航海中の自動の停止：見ているタブはそのまま、画面も暗くしない
function drawRst(){const r=RST;r.t++;const t=r.t;
  if(t<30){SPDF=0;}
  if(t>=30&&t<90){ROTV=2*(t-30)/60;}   /* 中心が白く光る演出はなくした（2026-11-06） */
  if(t===60){const ln=r.rs&&RESTART_LINES[S.restarts];if(ln)story('rs'+S.restarts,ln);else subtitle('もう一度、帆を張る。');}
  if(t===80&&r.rs){for(let i=0;i<7;i++)TG[i]=memTarget(i);paintGoal();}
  if(t===80){['hud','route','panel'].forEach((id,i)=>{document.getElementById(id).style.transitionDelay=(i*0.25)+'s';});document.getElementById('app').classList.remove('rstDim');setTimeout(()=>{['hud','route','panel'].forEach(id=>document.getElementById(id).style.transitionDelay='');},1500);}
  if(t>=80){const p=cl((t-80)/70);SPDF=ei(p);ROTV=2*(1-p);}
  ROT+=ROTV;TKG.setAttribute('transform','rotate('+ROT.toFixed(2)+' 88 88)');
  if(t>=150){SPDF=1;ROTV=0;ROT=Math.round(ROT/5)*5;TKG.setAttribute('transform','rotate('+ROT+' 88 88)');NEWSK=[];document.getElementById('block').style.display='none';RST=null;}}
function startBrake(g,auto){NEWSK=[];BRK={t:0,g,lit:nines(S.stage),auto:!!auto};SND.play(auto?'milestone':'brake');document.getElementById('block').style.display='block';}
function drawBrk(){const b=BRK;b.t++;const t=b.t,low=fxLow,amp=low?0.4:1,B0=30,B1=180,S1=215,S2=335;
  if(b.t===1){b.st=S.stage;b.bv0=BVC;b.sp0=3+b.lit*0.25;}
  const red=t<B1?(t<B0?0.5+0.5*Math.sin(t*0.5):1-(t-B0)/(B1-B0)):0;
  if(red>0){const g=cx.createRadialGradient(RC.x,RC.y,Math.min(CW,CH)*0.2,RC.x,RC.y,Math.max(CW,CH)*0.75);g.addColorStop(0,'rgba(0,0,0,0)');g.addColorStop(1,'rgba(230,40,30,'+(0.42*red*amp)+')');cx.fillStyle=g;cx.fillRect(0,0,CW,CH);}
  if(t<B1)for(let i=0;i<12;i++){let op='';if(i<b.lit){if(t<B0)op=(Math.floor(t/4)%2?'0.2':'1');else op=(i<b.lit*Math.pow(1-(t-B0)/(B1-B0),1.5)?'1':'0.12');}SEG[i].style.opacity=op;}
  if(t===1&&!low)frameEl.classList.add('shakeL');
  if(t>=B0&&t<B1){const p=(t-B0)/(B1-B0),k=Math.pow(1-p,3);BVC=b.bv0*k;SPDF=b.sp0*k*(0.5+0.5*amp);stk=Math.round(46*Math.pow(1-p,2)*amp);ROTV=6*k;
    if(t===B0){frameEl.classList.remove('shakeL');fla=low?0.03:0.08;if(!low){frameEl.style.setProperty('--sh','7px');frameEl.classList.remove('shake');void frameEl.offsetWidth;frameEl.classList.add('shake');const ap=document.getElementById('app');ap.classList.remove('lurch');void ap.offsetWidth;ap.classList.add('lurch');}}
    if(!low&&t%40===10&&p<0.7){frameEl.style.setProperty('--sh',(5*(1-p)).toFixed(1)+'px');frameEl.classList.remove('shake');void frameEl.offsetWidth;frameEl.classList.add('shake');}
    const fr=stageBeta(b.st)*Math.pow(1-p,2.2),h=document.getElementById('hV');h.textContent=fr>=0.01?(fr*100).toFixed(fr>0.9?2:1)+'% c':Math.round(fr*C_KMS).toLocaleString('ja-JP')+' km/s';}
  if(t===B1){stk=0;BVC=0;for(const sg of SEG)sg.style.opacity='';if(b.rs)rebirth();else if(b.vr)redraw();else prestige(false);paintSpeed();renderPanel(true);fla=low?0.06:0.14;
    if(!low){frameEl.style.setProperty('--sh','3px');frameEl.classList.remove('shake');void frameEl.offsetWidth;frameEl.classList.add('shake');}}
  if(t>=B1&&t<S1){const q=(t-B1)/(S1-B1);SPDF=-0.5*Math.sin(Math.PI*q)*Math.exp(-2*q)*amp;ROTV=-1.2*Math.sin(Math.PI*q)*Math.exp(-2*q);}
  if(t===S1){SPDF=0;ROTV=0;STILL=true;if(!b.auto)document.getElementById('app').classList.add('rstDim');}
  if(t>S1)SPDF=0;
  if(t<S1){ROT+=ROTV;TKG.setAttribute('transform','rotate('+ROT.toFixed(2)+' 88 88)');}
  if(t>=S2){SPDF=0;STILL=false;frameEl.classList.remove('shakeL');document.getElementById('block').style.display='none';BRK=null;if(b.rs)openGlow(()=>startRestart(true));else if(b.vr&&b.auto){glowAutoSpend();startRestart();}else if(b.vr)openGlow(()=>startRestart());else if(b.auto)startRestart(false,true);else openSkill(true,b.g);}}
const CH_T=65;
function drawAcc(){const a=ACC;a.t++;const low=fxLow,lv=a.lvl,n=nines(lv),t=a.t,dur=162,amp=low?0.45:1;
  if(n>0){const i=(n-1)%12,an=-1.5708+(i+0.5)/12*6.283,ax=RC.x+Math.cos(an)*74*RCS,ay=RC.y+Math.sin(an)*74*RCS,c=mix(COLORS[i%6].rgb,G,1-A[i%6]),g=t<CH_T?t/CH_T:Math.max(0,1-(t-CH_T)/70);blob(ax,ay,(16+lv)*(0.5+g),c,0.8*g);SEG[i].setAttribute('stroke-width',(2.2+3*g).toFixed(2));}
  let e=0;
  if(t<CH_T){const c=t/CH_T,f=0.35+0.65*Math.sin(Math.PI*Math.min(1,c*1.1));if(!a.inS)a.inS=[];for(let k=0;k<(low?3:8);k++){const an=Math.random()*6.283,d=Math.hypot(CW,CH)*R(0.5,0.6),ci=(k+t)%6;a.inS.push({x:RC.x+Math.cos(an)*d,y:RC.y+Math.sin(an)*d,an,sp:R(5,11),l:0,s:R(0.7,1.5),c:mix(COLORS[ci].rgb,G,1-A[ci])});}
    for(let k=a.inS.length-1;k>=0;k--){const q=a.inS[k];q.x-=Math.cos(q.an)*q.sp*f;q.y-=Math.sin(q.an)*q.sp*f;q.l=Math.min(1,q.l+0.08);const dd=Math.hypot(q.x-RC.x,q.y-RC.y);if(dd<50){a.inS.splice(k,1);continue;}const al=q.l*Math.min(1,dd/160),tl=q.sp*f*2.2;cx.beginPath();cx.moveTo(q.x,q.y);cx.lineTo(q.x+Math.cos(q.an)*tl,q.y+Math.sin(q.an)*tl);cx.strokeStyle=rgb(q.c,al*0.7);cx.lineWidth=q.s*0.7;cx.stroke();cx.beginPath();cx.arc(q.x,q.y,q.s,0,6.283);cx.fillStyle=rgb(q.c,al);cx.fill();}}
  if(t===CH_T&&a.inS){for(const q of a.inS){const v=R(7,13);P.push({x:q.x,y:q.y,vx:Math.cos(q.an)*v,vy:Math.sin(q.an)*v,l:0.9,c:q.c,r:q.s,dr:0.03});}a.inS=null;}
  if(t<CH_T){const c=ei(t/CH_T);ZOOM=1-0.05*c*amp;SPDF=1-c-0.9*Math.sin(Math.PI*c)*amp;ROTV=-0.5*c*amp;stk=0;}
  else{e=Math.pow(1-cl((t-CH_T)/dur),2);ZOOM=1+(0.22+0.01*lv)*e*amp;SPDF=1+(13+lv*0.7)*e*amp;ROTV=(9+lv*0.8)*e*amp;stk=Math.round(46*e);}
  if(t===CH_T){fla=low?0.03:0.08;for(let k=0;k<(low?10:22+lv*2);k++){const an=Math.random()*6.283,v=R(2,5+lv*0.3);P.push({x:RC.x,y:RC.y,vx:Math.cos(an)*v,vy:Math.sin(an)*v,l:1,c:mix(COLORS[k%6].rgb,G,1-A[k%6]),r:R(0.8,1.8),dr:0.015});}
    if(!low){frameEl.style.setProperty('--sh',Math.min(5,1.2+lv*0.25)+'px');frameEl.classList.remove('shake');void frameEl.offsetWidth;frameEl.classList.add('shake');}}
  if(t>=CH_T&&e>0.01){const k=e*(low?0.45:1),g=cx.createRadialGradient(RC.x,RC.y,Math.min(CW,CH)*0.1,RC.x,RC.y,Math.max(CW,CH)*0.75);
    const bc=mix([140,185,255],G,1-A[4]),rc2=mix([170,40,30],[90,90,96],1-A[0]);g.addColorStop(0,rgb(bc,0.12*k));g.addColorStop(0.35,'rgba(0,0,0,0)');g.addColorStop(0.72,rgb(rc2,0.16*k));g.addColorStop(1,'rgba(0,0,0,'+(0.7*k)+')');cx.fillStyle=g;cx.fillRect(0,0,CW,CH);}
  ROT+=ROTV;TKG.setAttribute('transform','rotate('+ROT.toFixed(2)+' 88 88)');
  if(t>CH_T+dur+6){ZOOM=1;SPDF=1;ROTV=0;stk=0;ROT=Math.round(ROT/5)*5;TKG.setAttribute('transform','rotate('+ROT+' 88 88)');if(n>0)SEG[(n-1)%12].setAttribute('stroke-width','2.2');ACC=null;accEndAt=Date.now();}}
function mkCrack(){const br=[];for(let j=0;j<9;j++){let a=j/9*6.283+R(-0.2,0.2),x=RC.x,y=RC.y;const pts=[[x,y]];for(let k=0;k<26;k++){a+=R(-0.35,0.35);x+=Math.cos(a)*R(8,16);y+=Math.sin(a)*R(8,16);pts.push([x,y]);}br.push(pts);}CRACK={t:0,br};}

function drawHome(){const h=HOMEA;h.t++;const D=380;   // 雲を抜けるまで（約6秒）
  if(!h.L){h.L=[];for(let i=0;i<18;i++){const pf=[];for(let k=0;k<14;k++){const a=R(0,6.283),d=Math.sqrt(Math.random())*1.6;pf.push({x:Math.cos(a)*d,y:Math.sin(a)*d*0.7,r:R(0.35,0.9)});}h.L.push({s:i*17+R(-5,5),pf});}}
  const cxp=CW/2,cyp=CH*0.45,base=Math.max(CW,CH)*0.5,gp=cl(h.t/D),col=mix([182,187,198],G,0.3);
  cx.fillStyle='rgba(19,21,30,'+ei(cl(h.t/45)).toFixed(3)+')';cx.fillRect(0,0,CW,CH);
  let fog=0;const vis=h.L.map(L=>{const age=h.t-L.s,dur=140-75*gp;return{L,p:age/dur};}).filter(o=>o.p>0&&o.p<1).sort((a,b)=>a.p-b.p);
  for(const o of vis){const z=1-o.p,sc=0.2/(z+0.04),al=(o.p<0.6?o.p/0.6:1)*(0.6-0.2*gp);if(o.p>0.78)fog=Math.max(fog,Math.sin((o.p-0.78)/0.22*Math.PI)*0.42);
    for(const f of o.L.pf){const x=cxp+f.x*base*sc,y=cyp+f.y*base*sc,r=f.r*base*sc*0.9;if(x+r<0||x-r>CW||y+r<0||y-r>CH)continue;const fa=al*(o.p>0.85?(1-o.p)/0.15:1);blob(x,y,r,col,fa*0.38);blob(x+r*0.35,y-r*0.15,r*0.55,[220,224,232],fa*0.22);}
    if(o.p>0.55){const k=(o.p-0.55)/0.45;for(const f of o.L.pf.slice(0,6)){const dx=f.x,dy=f.y,dl=Math.hypot(dx,dy)||1,r1=base*sc*dl*0.9,r2=r1*1.25;cx.beginPath();cx.moveTo(cxp+dx/dl*r1,cyp+dy/dl*r1);cx.lineTo(cxp+dx/dl*r2,cyp+dy/dl*r2);cx.strokeStyle=rgb([220,224,232],0.12*k*(1-gp*0.5));cx.lineWidth=2;cx.stroke();}}}
  if(fog>0){cx.fillStyle=rgb(mix([150,155,168],[60,64,74],gp),fog);cx.fillRect(0,0,CW,CH);}
  if(h.t>D&&!h.done){h.done=true;homeColors();}}
