'use strict';
/* =====================================================================
   RENDER ― 背景・加速や停止の演出（実座標）
   ===================================================================== */
/* 7色の記憶のオーロラ（2026-11-16 描き直し）：下の縁がくっきり明るく、上へ細い光の筋がのびて消えていく幕。
   筋の明るさは横へゆっくり流れ、幕が折れて横から見えるところほど明るい。色はその記憶の色のまま、縁は白っぽく、上はわずかに紫へ */
const AUR_TOP=[175,140,255];
function aurBand(X,i,o,a,rv){if(a<=0.01||rv<=0.01)return;const t=T*0.003+i*1.7,edge=-30+rv*(CW+90),sy=CH/610,base=o.ay*CH,tt=T*0.0006;
  const yAt=x=>base+(Math.sin(x*0.018+t)*22+Math.sin(x*0.007-t*0.6)*30+Math.sin(x*0.043-t*0.6+i)*7)*sy;
  const edgeC=mix(o.rgb,[255,255,255],0.35),topC=mix(o.rgb,AUR_TOP,0.3);
  X.save();X.globalCompositeOperation='lighter';
  // 幕のうしろのぼんやりした光（弱く）
  for(let x=0;x<=CW;x+=36){const fade=cl((edge-x)/50);if(fade<=0)break;const y=yAt(x),al=0.015*a*fade;{const rr=70*sy,gg=X.createRadialGradient(x,y-26*sy,0,x,y-26*sy,rr);gg.addColorStop(0,rgb(o.rgb,al));gg.addColorStop(1,rgb(o.rgb,0));X.fillStyle=gg;X.fillRect(x-rr,y-26*sy-rr,rr*2,rr*2);}}
  for(let x=0;x<=CW;x+=3){const fade=cl((edge-x)/50);if(fade<=0)break;const y=yAt(x),sl=Math.min(1,Math.abs(yAt(x+3)-y)/3*1.6);
    const cur=0.5+0.5*Math.sin(x*0.09+T*0.0035+i)*Math.sin(x*0.031-T*0.0025);
    let ray=0.5+0.5*Math.sin(x*0.37+tt*9+i*3)*Math.sin(x*0.113-tt*5);ray=0.35+0.65*ray*ray;
    const fl=0.9+0.1*Math.sin(x*0.9+T*0.008+i);
    const h=(46+30*ray+18*Math.sin(x*0.02+t*1.3))*sy,al=0.12*a*fade*cur*ray*fl*(1+0.9*sl);if(al<0.004)continue;
    const g=X.createLinearGradient(0,y+14*sy,0,y-h);g.addColorStop(0,rgb(o.rgb,0));g.addColorStop(0.1,rgb(o.rgb,al*0.25));g.addColorStop(0.15,rgb(edgeC,al*1.6));g.addColorStop(0.22,rgb(o.rgb,al*0.9));g.addColorStop(0.5,rgb(o.rgb,al*0.32));g.addColorStop(1,rgb(topC,0));
    X.fillStyle=g;X.fillRect(x,y-h,3,h+14*sy);}
  X.restore();}
let devGlow=0,SKYV=0;   // SKYV：晴れた昼の空の濃さ（前のコマの値で、オーロラを弱める）
/* ③の航海：窓を横切る地平線の光の帯（自分たちの銀河を外から見る）。光の点を一度だけ描いておき、毎フレーム重ねる */
let BAND=null;
function bandCanvas(w,h){if(BAND&&BAND.w===w&&BAND.h===h)return BAND.c;const c=document.createElement('canvas');c.width=Math.ceil(w*DPR);c.height=Math.ceil(h*DPR);const x=c.getContext('2d');x.scale(DPR,DPR);
  let seed=11;const rnd=()=>{seed=(seed*16807)%2147483647;return seed/2147483647;};
  // 星は小さな点でくっきり描き、にじみは一部の明るい星だけに（2026-11-17。全部をぼかしの丸で描いていて、銀河がぼやけて見えていた）
  const dot=(px,py,r,col,a)=>{if(a>0.35&&r>0.6){const g=x.createRadialGradient(px,py,0,px,py,r*2.6);g.addColorStop(0,'rgba('+col+','+(a*0.35)+')');g.addColorStop(1,'rgba('+col+',0)');x.fillStyle=g;x.beginPath();x.arc(px,py,r*2.6,0,6.283);x.fill();}x.fillStyle='rgba('+col+','+a+')';x.beginPath();x.arc(px,py,r*0.7,0,6.283);x.fill();};
  const y0=h*0.36,n=Math.round(2600*w/420);
  for(let i=0;i<n;i++){const u=rnd(),xx=u*w,wd=Math.exp(-Math.pow((u-0.62)*3.2,2)),yy=y0+(rnd()-0.5)*(10+38*wd)-(u-0.5)*22,k=Math.abs(rnd()-0.5);dot(xx,yy,0.35+rnd()*0.6,k<0.2?'255,236,215':'200,180,255',Math.min(1,(0.2+0.7*wd)*rnd()));}
  const g=x.createRadialGradient(w*0.62,y0-3,0,w*0.62,y0-3,60);g.addColorStop(0,'rgba(255,236,220,.12)');g.addColorStop(1,'rgba(255,236,220,0)');x.fillStyle=g;x.fillRect(0,0,w,h);
  BAND={c,w,h};return c;}
function drawBand(){if(!S.voy||LANDED||HOMEA||FR.w<=0)return;const c=bandCanvas(FR.w,FR.h);cx.save();cx.globalAlpha=0.85;cx.drawImage(c,FR.x,FR.y,FR.w,FR.h);cx.restore();}
let FRK=1,FRA=0,FRP=0;   // FRK：1コマ（60分の1秒）を1とした経過時間（流れ星が使う）
// 演出の多くは1コマずつ進むので、画面の書き換えの速さで演出の速さが変わっていた。書き換えに関係なく平均60コマ/秒で進める（2026-11-16）：
// 120Hz・144Hz・240Hz ではコマを間引き、30Hz では1回の書き換えで2コマ進める（重い端末では2コマ目を省き、遅れを溜めない）
function frame(){requestAnimationFrame(frame);const n=performance.now();FRA=Math.min(50,FRA+(FRP?n-FRP:16.667));FRP=n;
  let k=0;while(FRA>=14.667&&k<2){FRA-=16.667;k++;if(!FREEZE)frameStep();if(performance.now()-n>8)break;}
  if(FRA>16.667)FRA=16.667;}
/* ③ 光子の帆（2026-11-17 試作）：PHOTON の表示のとき、リングの外に細い光の輪が1本、ゆっくり回る（段が多いほど明るく太い）。光の粒が中心から外へ流れる */
let SAILP=[];
function drawSail(){if(typeof phView!=='function'||!phView()||LANDED||HOMEA||document.getElementById('app').classList.contains('vrOn'))return;   // 引き直しの演出の間は帆の輪を出さない（残って見えていた、2026-11-24）
const n=Math.min(S.sail||0,14),r0=74*RCS+10;
  // 2026-11-19：段の数だけ輪を重ねていたのをやめ、輪は1本。段が増えるほど明るく太くなる（段は文字でも出ている）
  if(n>0){const k=n/14;cx.save();cx.lineCap='round';cx.setLineDash([3,7]);cx.lineDashOffset=T*0.08;cx.beginPath();cx.arc(RC.x,RC.y,r0+4*RCS,0,6.283);cx.strokeStyle='rgba(255,236,200,'+(0.16+0.34*k).toFixed(3)+')';cx.lineWidth=0.7+1.1*k;cx.stroke();cx.restore();}
  cx.save();
  cx.setLineDash([]);cx.restore();
  if(Math.random()<0.25+0.05*n){const an=Math.random()*6.283;SAILP.push({a:an,r:r0*0.5,v:0.6+Math.random()*(0.8+n*0.15),l:1});}
  for(let i=SAILP.length-1;i>=0;i--){const q=SAILP[i];q.r+=q.v;q.l-=0.012;if(q.l<=0){SAILP.splice(i,1);continue;}const x=RC.x+Math.cos(q.a)*q.r,y=RC.y+Math.sin(q.a)*q.r;cx.beginPath();cx.arc(x,y,0.9,0,6.283);cx.fillStyle='rgba(255,240,215,'+(0.7*q.l).toFixed(3)+')';cx.fill();}}
function frameStep(){FRK=1;if(++MEAS_N>=20){MEAS_N=0;measure();}   // リングと窓の位置を、ときどき測り直す
const f0=FR;if(LANDED||HOMEA)FR={x:0,y:0,w:CW,h:CH};try{frameInner();drawSail();frClip(drawShower);drawFold();drawLightMark();drawLightEnd();}finally{FR=f0;}}
/* ④ 宇宙を畳む：星がすべて中心へ流れ込み（4秒）→ 光の点ひとつ（2秒）→ 点がほどけて新しい色合いの空が広がる */
let FOLD=null;
function startFold(){if(!canFold()||FOLD)return;FOLD={t:0,uv:document.getElementById('app').classList.contains('uvOn')};SND.play('fold');document.getElementById('block').style.display='block';const p=document.getElementById('panel');p.style.transition='opacity 1.5s';p.style.opacity='0.12';paintGoal();}
function drawFold(){const f=FOLD;if(!f)return;if((pickOpen||lawOpen)&&f.t>=340)return;f.t++;const t=f.t,X=RC.x||CW/2,Y=RC.y||CH/2;let dark=0,pt=0;   // 2026-11-20：真っ暗になったところで次の宇宙を選び、選び終えてから新しい宇宙が明ける（前は新しい宇宙が明けてから選ぶ画面が出ていた）
  if(t===150)document.getElementById('app').classList.add('foldOn');   // 暗くなる前に上の表示とリングの数字を消す（0に戻るのが見えていた、2026-11-24）
  if(t===430)document.getElementById('app').classList.remove('foldOn');
  if(t<=240){CONV=ei(t/240);SPDF=1+4*t/240;stk=Math.max(stk,30);dark=cl((t-170)/70);pt=t/240;}
  else if(t<380){dark=1;pt=1;if(t===300){fold();CONV=0;SPDF=1;stk=0;BAND=null;applyLoadedVisuals();curTab='uni';uniPast=-1;renderPanel(true);save();}if(t===340&&S.uOffer)openPick();}
  else if(t<560){const k=(t-380)/180;dark=1-ei(k);pt=1-k;if(t===400)logLine(UNI_LINES[Math.min(S.uni,UNI_LINES.length-1)],-1);}
  else{FOLD=null;document.getElementById('app').classList.remove('foldOn');document.getElementById('block').style.display='none';document.getElementById('panel').style.opacity='1';paintGoal();return;}
  if(dark>0){cx.fillStyle='rgba(4,5,12,'+dark.toFixed(3)+')';cx.fillRect(0,0,CW,CH);}
  if(pt>0){blob(X,Y,(t<380?16+70*pt:16+260*(1-pt)),[230,235,255],0.5*pt);blob(X,Y,6,[255,255,255],pt);}
  if(t>=380){const a=Math.sin(Math.PI*cl((t-380)/180));cx.save();cx.font='400 17px "Shippori Mincho B1",serif';cx.textAlign='center';cx.fillStyle='rgba(236,238,242,'+(0.85*a).toFixed(3)+')';cx.fillText('宇宙 '+roman(S.uni+1),X,Y+125*RCS);cx.restore();}}
/* 新しい宇宙の色合い：窓の中心に、その宇宙の色をうっすら重ねる（宇宙 I の白は重ねない） */
function drawTint(){if(!S.uTint||LANDED||HOMEA||FR.w<=0)return;const c=UNI_TINT[S.uTint%UNI_TINT.length],X=FR.x+FR.w/2,Y=FR.y+FR.h*0.45,r=Math.max(FR.w,FR.h)*0.75;const g=cx.createRadialGradient(X,Y,0,X,Y,r);g.addColorStop(0,rgb(c.a,0.13));g.addColorStop(0.55,rgb(c.b,0.05));g.addColorStop(1,rgb(c.a,0));cx.fillStyle=g;cx.fillRect(FR.x,FR.y,FR.w,FR.h);}
/* 背景の奥行き（2026-11-22、案 B）：故郷への周回の間は、窓を斜めに横切る淡い星の帯と暗い塵の筋（いちばん奥の層で、加速してもほとんど動かない）。窓の中心をわずかに明るく、四隅を暗く。航海中は光の帯と銀河がもうあるので、帯は出さず濃淡だけ */
let NEB=null;
function nebCanvas(W,H){const c=document.createElement('canvas'),k=Math.min(2,devicePixelRatio||1);c.width=Math.round(W*k);c.height=Math.round(H*k);const g=c.getContext('2d');g.scale(k,k);let sd=5;const r=()=>{sd=(sd*16807)%2147483647;return sd/2147483647;},s=Math.max(W,H)/360;
  const cloud=(x,y,rx,ry,col,a)=>{const R=Math.max(rx,ry),gr=g.createRadialGradient(0,0,0,0,0,R);gr.addColorStop(0,'rgba('+col+','+a+')');gr.addColorStop(.55,'rgba('+col+','+(a*0.4)+')');gr.addColorStop(1,'rgba('+col+',0)');g.save();g.translate(x,y);g.scale(rx/R,ry/R);g.fillStyle=gr;g.beginPath();g.arc(0,0,R,0,6.283);g.fill();g.restore();};
  const at=t=>[t*W*1.3-W*0.15,H*0.85-t*H*0.75];
  for(let i=0;i<26;i++){const t=r(),[x,y]=at(t);cloud(x,y+(r()-.5)*H*0.18,(60+r()*90)*s,(30+r()*50)*s,['70,80,140','90,70,130','60,90,130'][i%3],0.05+r()*0.05);}
  for(let i=0;i<10;i++){const t=r(),[x,y]=at(t);cloud(x,y+(r()-.5)*H*0.06,(40+r()*50)*s,(10+r()*14)*s,'4,5,12',0.35);}
  const n=Math.round(600*W*H/(358*340));for(let i=0;i<n;i++){const t=r(),[x,y]=at(t);g.fillStyle='rgba(236,238,242,'+(0.05+r()*0.2).toFixed(2)+')';g.fillRect(x,y+(r()+r()+r()-1.5)*H*0.12,0.7,0.7);}
  return c;}
function drawDepth(){if(LANDED||HOMEA||FR.w<=0)return;cx.save();cx.beginPath();cx.roundRect(FR.x,FR.y,FR.w,FR.h,18);cx.clip();
  if(!S.voy){const W=Math.round(FR.w),H=Math.round(FR.h);if(!NEB||NEB.w!==W||NEB.h!==H)NEB={w:W,h:H,c:nebCanvas(W,H)};cx.globalAlpha=1-CONV;cx.drawImage(NEB.c,FR.x+Math.sin(T*0.0006)*6,FR.y+Math.cos(T*0.0005)*4,W,H);cx.globalAlpha=1;}
  const X=RC.x||FR.x+FR.w/2,Y=RC.y||FR.y+FR.h*0.45,m=Math.min(FR.w,FR.h),M=Math.max(FR.w,FR.h);
  let g=cx.createRadialGradient(X,Y,0,X,Y,m*0.6);g.addColorStop(0,'rgba(40,50,90,.16)');g.addColorStop(1,'rgba(40,50,90,0)');cx.fillStyle=g;cx.fillRect(FR.x,FR.y,FR.w,FR.h);
  g=cx.createRadialGradient(X,Y,m*0.25,X,Y,M*0.75);g.addColorStop(0,'rgba(0,0,0,0)');g.addColorStop(0.5,'rgba(0,0,0,0)');g.addColorStop(1,'rgba(0,0,0,.5)');cx.fillStyle=g;cx.fillRect(FR.x,FR.y,FR.w,FR.h);cx.restore();}
let HAZE_A=0.034,HAZE_WIN=true;   // HAZE_WIN：もやを窓（#frame）の四隅に置く
function frameInner(){
  if(!STILL)T++;for(let i=0;i<7;i++){A[i]+=(TG[i]-A[i])*(TG[i]?0.03:0.022);if(TG[i])RV[i]=Math.min(1,RV[i]+0.012);POP[i]*=0.93;}BB*=0.993;
  const BV=[0,0,0,0.01,0.02,0.03,0.05,0.1,0.18,0.3,0.4,0.5,0.7,0.82,0.9,0.94,0.96,0.97,0.975,0.98,0.983,0.985,0.987];const bvT=BV[Math.min(22,S.stage)];if(BVC<0)BVC=bvT;if(!(ACC&&ACC.t<CH_T)&&!BRK)BVC+=(bvT-BVC)*0.03;const aw=A[5],ag=A[6],bv=BVC*(1-CONV)+CONV*0.995,sc=Math.max(CW,CH)/600;
  cx.clearRect(0,0,CW,CH);drawDepth();drawTint();drawBand();
  // 四隅の記憶の色のもや（2026-11-16 にやめ、11-17 に弱く戻した。HAZE_A＝濃さ、もとは 0.045）
  if(!LANDED&&HAZE_A>0){const win=HAZE_WIN&&FR.w>0,hx=win?FR.x:0,hy=win?FR.y:0,hw=win?FR.w:CW,hh=win?FR.h:CH,hs=win?Math.max(hw,hh)/600:sc;
    if(win){cx.save();cx.beginPath();cx.roundRect(hx,hy,hw,hh,18);cx.clip();}
    for(let i=0;i<5;i++){const o=COLORS[i];if(o.nx==null)continue;const a=A[i],c=mix(o.rgb,G,1-a),ox=win?(o.nx<0.5?0.02:0.98):o.nx,oy=win?(o.ny<0.5?0.04:0.96):o.ny;for(let j=0;j<3;j++){const bx=hx+ox*hw+Math.sin(T*0.004+j*2.1+i)*40*hs,by=hy+oy*hh+Math.cos(T*0.0033+j*1.7+i)*34*hs;blob(bx,by,o.nr*hs*(0.45+0.15*j)*(win?1.875:1),c,HAZE_A*(win?1.3:1)*(0.08+0.92*a));}}
    if(win)cx.restore();}
  SKYV=0;   // 背景のオーロラ（aurBand）は 2026-11-16 に外した（宇宙らしく見えないため）。戻すときは for(i<5) で aurBand(cx,i,COLORS[i],A[i]*(1-0.8*SKYV),RV[i])   // 晴れた昼の空が出ている間は、オーロラを弱める
  // stars
  const tw=0.25*aw,CXs=RC.x||CW/2,CYs=RC.y||CH/2,rs=420*sc*(1-CONV*0.92)*ZOOM;
  const uvq=uvShown();   // UNIVERSE の窓では流れる星と漂う色の粒を描かない（窓の外に動く粒だけが見えていた。2026-11-27）
  if(!uvq&&!LANDED&&!(HOMEA&&HOMEA.t>45)&&!(HEARD&&HEARD.t>100))for(const s of STARS){s.t+=s.v*0.75*SPDF*(1+CONV*4);if(s.t>3.1){s.t=0.02+Math.random()*0.2;s.p=Math.random()*6.283;}else if(s.t<0.02&&SPDF<0){s.t=2.95+Math.random()*0.14;s.p=Math.random()*6.283;}
    const c=Math.cos(s.t),ca=(c+bv)/(1+bv*c),ta=Math.acos(Math.max(-1,Math.min(1,ca))),r=0.5*rs*Math.tan(Math.min(ta,3.0)/2),x=CXs+r*Math.cos(s.p),y=CYs+r*Math.sin(s.p);if(x<-8||x>CW+8||y<-8||y>CH+8)continue;
    const col=mix(COLORS[s.k].rgb,G,1-A[s.k]),f=1-2*ta/Math.PI;const ly=s.s<0.8?0.62:s.s<1.2?0.9:1.15;let al=cl((0.35+0.5*s.w+f*0.3)*(0.55+0.45*aw)*ly+Math.sin(T*0.05+s.ph)*tw+CONV*0.4);if(al<0.05)al=0.05;   // 遠い層ほど暗く（2026-11-22、奥行き）
    if(stk>0&&(s.big||s.q<0.5)){const k=Math.min(1,stk/46),SL=Math.min(0.6,0.28+0.015*(ACC?ACC.lvl:0)),rr=r*(1-SL*k),sc2=f>0?mix(col,[150,190,255],0.55*A[4]):mix(col,[255,140,120],0.55*A[0]);cx.beginPath();cx.moveTo(CXs+rr*Math.cos(s.p),CYs+rr*Math.sin(s.p));cx.lineTo(x,y);cx.strokeStyle=rgb(sc2,Math.min(1,al*k*1.3));cx.lineWidth=s.s*(0.45+0.3*k);cx.stroke();}
    if(s.big&&al>0.4)blob(x,y,7*(0.6+0.4*aw),col,al*0.32);
    cx.beginPath();cx.arc(x,y,s.s*(0.7+0.3*aw)*(s.s<0.8?0.85:s.s>1.2?1.12:1),0,6.283);cx.fillStyle=rgb(col,al);cx.fill();}
  if(stk>0)stk--;
  if(!uvq&&!LANDED&&!(HOMEA&&HOMEA.t>45)&&!(HEARD&&HEARD.t>100))for(const m of FLY){const a=A[m.k];if(!STILL){m.x+=(m.vx+Math.sin(T*0.01+m.ph)*0.2)*0.4/CW;m.y+=m.vy*0.4/CH;}if(SPDF>1){const f2=(SPDF-1)*0.012;m.x+=(m.x*CW-CXs)*f2/CW;m.y+=(m.y*CH-CYs)*f2/CH;}if(m.y>1.04||m.y<-0.02||m.x<-0.02||m.x>1.02){if(SPDF>1.05){const an=Math.random()*6.283,rr=R(0.03,0.2)*Math.min(CW,CH);m.x=(CXs+Math.cos(an)*rr)/CW;m.y=(CYs+Math.sin(an)*rr)/CH;}else if(m.y<-0.02){m.y=1.02;m.x=Math.random();}else{m.x=Math.random();m.y=Math.random();}}
    const px=m.x*CW,py=m.y*CH;if(Math.abs(px-CXs)<52&&Math.abs(py-CYs)<34)continue;const pu=0.5+0.5*Math.sin(T*0.04+m.ph),cc=mix(COLORS[m.k].rgb,G,1-a),al=(0.25+0.6*pu)*(0.4+0.6*a);blob(px,py,m.r*6,cc,al*0.3);cx.beginPath();cx.arc(px,py,m.r,0,6.283);cx.fillStyle=rgb(cc,al);cx.fill();}
  // scenes inside the window
  if(HEARD&&!LANDED){HEARD.t++;cx.fillStyle='rgba(19,21,30,'+ei(cl(HEARD.t/100)).toFixed(3)+')';cx.fillRect(0,0,CW,CH);}
  if(LANDED){cx.save();cx.beginPath();if(cx.roundRect)cx.roundRect(FR.x,FR.y,FR.w,FR.h,18);else cx.rect(FR.x,FR.y,FR.w,FR.h);cx.clip();cx.fillStyle='rgb(19,21,30)';cx.fillRect(FR.x,FR.y,FR.w,FR.h);const mn=Math.min(A[0],A[1],A[2],A[3],A[4],A[5],A[6]),sa=0.45*ei(cl((mn-0.5)/0.5)),sk=cx.createLinearGradient(0,FR.y,0,FR.y+FR.h);sk.addColorStop(0,rgb(mix([127,177,234],[60,64,74],1-A[4]),sa));sk.addColorStop(0.6,rgb(mix([184,212,241],[60,64,74],1-A[5]),sa*0.8));sk.addColorStop(1,rgb(mix([242,170,120],[60,64,74],1-A[0]),sa));cx.fillStyle=sk;cx.fillRect(FR.x,FR.y,FR.w,FR.h);cx.restore();}
  if(FX.length||SP.length||GLOWB.length){const s=Math.min(SC_MAX,LANDED?Math.max(FR.w/276,FR.h/380):Math.min(FR.w/276,FR.h/200));cx.save();cx.beginPath();if(cx.roundRect)cx.roundRect(FR.x,FR.y,FR.w,FR.h,18);else cx.rect(FR.x,FR.y,FR.w,FR.h);cx.clip();
    const ox=FR.x+(FR.w-276*s)/2-12*s;cx.translate(ox,FR.y+FR.h-378*s);cx.scale(s,s);SXL=Math.min(-5,(FR.x-ox)/s-5);SXR=Math.max(PW+5,(FR.x+FR.w-ox)/s+5);   // 倍率は SC_MAX まで（PC の広い窓で情景が大きくなりすぎないよう）。SXL・SXR：窓の左右の端（情景の座標）
    let gA=0;FX.forEach(e=>{e.t++;});
    FX.forEach(e=>{if(e.i===4)skyScene(e);});
    FX.forEach(e=>{if(e.i===0)sunScene(e);if(e.i===3)townScene(e);if(e.g!=null)gA=Math.max(gA,e.g);});
    GA+=(gA-GA)*0.15;if(GA>0.01){glp(ridgePath,[200,210,235],0.5*GA,0.9);for(let x=SXL+3;x<SXR;x+=9)gdot(x,ry(x),0.6,[200,210,235],0.5*GA*(0.5+0.5*Math.sin(T*0.07+x*0.7)));}
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
  for(let i=P.length-1;i>=0;i--){const p=P[i];p.x+=p.vx;p.y+=p.vy;p.vx*=0.975;p.vy*=0.975;p.l-=p.dr;if(p.l<=0){P.splice(i,1);continue;}const gk=p.gr?cl((1-p.l)*3):0,cc=mix(p.c,G,gk);if(uvq&&inFR(p))continue;if(i%2===0)blob(p.x,p.y,p.r*5,cc,p.l*0.18);cx.beginPath();cx.arc(p.x,p.y,p.r,0,6.283);cx.fillStyle=rgb(cc,p.l*0.95);cx.fill();}   // UNIVERSE の窓の中の粒は uvFx() が渦の上に描く
  cx.font='300 15px Jura, sans-serif';cx.textAlign='center';
  for(let i=POPS.length-1;i>=0;i--){const q=POPS[i];q.t++;const p=q.t/55;if(p>=1){POPS.splice(i,1);continue;}if(uvq&&inFR(q))continue;cx.fillStyle='rgba(246,247,251,'+(1-p)+')';const hw=cx.measureText(q.s).width/2+6;cx.fillText(q.s,Math.max(hw,Math.min(CW-hw,q.x)),q.y-eo(p)*44);}   // 長い表記が画面の端で切れないように
  if(ACC){if(uvShown())accCut();else drawAcc();}
  frClip(drawMeteor);
  if(BRK)drawBrk();
  if(RST)drawRst();
  if(VMINI)drawVMini();if(VRP.length)drawVrP();
  if(CRACK)drawCrack();
  const dk=(1-ag)*0.5;if(dk>0.005){const vg=cx.createRadialGradient(CW/2,CH/2,Math.min(CW,CH)*0.2,CW/2,CH/2,Math.max(CW,CH)*0.7);vg.addColorStop(0,'rgba(0,0,0,0)');vg.addColorStop(1,'rgba(0,0,0,'+(dk*0.9)+')');cx.fillStyle=vg;cx.fillRect(0,0,CW,CH);}
  if(S.over>0){const k=Math.min(1,S.over/6)*(0.6+0.4*Math.sin(T*0.15)),g=cx.createRadialGradient(CW/2,CH/2,Math.min(CW,CH)*0.25,CW/2,CH/2,Math.max(CW,CH)*0.75);g.addColorStop(0,'rgba(0,0,0,0)');g.addColorStop(1,rgb(mix([255,180,90],G,1-A[3]),0.2*k));cx.fillStyle=g;cx.fillRect(0,0,CW,CH);}
  if(fla>0){cx.fillStyle='rgba(240,242,250,'+fla+')';cx.fillRect(0,0,CW,CH);fla*=0.9;if(fla<0.005)fla=0;}
  if(T%3===0)paintColorUI(ag);
}
let GA=0;
function drawCrack(){const c=CRACK;c.t++;const p=cl(c.t/90);cx.save();cx.strokeStyle='rgba(240,244,255,'+(0.9)+')';cx.lineWidth=1;cx.shadowColor='rgba(220,230,255,.8)';cx.shadowBlur=6;
  c.br.forEach(b=>{const n=Math.floor(b.length*p);if(n<2)return;cx.beginPath();cx.moveTo(b[0][0],b[0][1]);for(let k=1;k<n;k++)cx.lineTo(b[k][0],b[k][1]);cx.stroke();});cx.restore();if(c.t>110)CRACK=null;}
// 流れ星と流星群は窓の中だけに描く（前は窓の外、上の表示やパネルの上にも流れていた。2026-11-27）
// UNIVERSE の窓が出ているか。出ている間は加速の演出を出さず、途中なら打ち切る（2026-11-27）
function inFR(q){return q.x>=FR.x&&q.x<=FR.x+FR.w&&q.y>=FR.y&&q.y<=FR.y+FR.h;}
function uvShown(){return document.getElementById('app').classList.contains('uvOn');}
function accCut(){ZOOM=1;SPDF=1;ROTV=0;stk=0;ROT=Math.round(ROT/5)*5;TKG.setAttribute('transform','rotate('+ROT+' 88 88)');for(const sg of SEG)sg.setAttribute('stroke-width','2.2');ACC=null;HVR=null;accEndAt=Date.now();frameEl.classList.remove('shake');}
function frClip(f){cx.save();cx.beginPath();if(cx.roundRect)cx.roundRect(FR.x,FR.y,FR.w,FR.h,18);else cx.rect(FR.x,FR.y,FR.w,FR.h);cx.clip();try{f();}finally{cx.restore();}}
function drawMeteor(){if(LANDED||HOMEA||SHOWER){MET=null;return;}if(!MET){const rate=(S.flags.bat?1/(60*20):0)*(has('e2')?1.5:1)+(has('cS')?1/(60*20):0);if(rate>0&&!BRK&&!RST&&!STILL&&FR.w>0&&Math.random()<rate*FRK){const L=Math.random()<0.5,sx=L?FR.x-20:FR.x+FR.w+20,sy=FR.y+R(10,FR.h*0.45),tx=L?FR.x+FR.w+40:FR.x-40,ty=sy+R(FR.h*0.35,FR.h*0.7),d=R(150,190);MET={x:sx,y:sy,vx:(tx-sx)/d,vy:(ty-sy)/d,t:0,d};}return;}
  const m=MET;m.t+=FRK;m.x+=m.vx*FRK;m.y+=m.vy*FRK;if(m.t>m.d){MET=null;return;}const tl=Math.hypot(m.vx,m.vy)*14,ux=m.vx/Math.hypot(m.vx,m.vy),uy=m.vy/Math.hypot(m.vx,m.vy),c=mix([255,236,200],G,1-A[3]*0.6);
  const g=cx.createLinearGradient(m.x,m.y,m.x-ux*tl,m.y-uy*tl);g.addColorStop(0,rgb(c,0.95));g.addColorStop(1,rgb(c,0));cx.strokeStyle=g;cx.lineWidth=2;cx.beginPath();cx.moveTo(m.x,m.y);cx.lineTo(m.x-ux*tl,m.y-uy*tl);cx.stroke();blob(m.x,m.y,18,c,0.55);cx.beginPath();cx.arc(m.x,m.y,2.2,0,6.283);cx.fillStyle='#fffaf0';cx.fill();}
function catchMeteor(){const m=MET;MET=null;const g=prodRate()*(has('cS')?300:60);S.E+=g;S.Erun+=g;let s='ENERGY +'+fmt(g);const pg=phGain(PH_MET,PH_MET_MIN);if(pg)s+='　PHOTON +'+fmt(pg);if(S.flags.bat){vesAdd(1);S.deposited=true;s='METEOR +1　'+s;if(curTab==='battery')renderPanel(true);}SND.play('catch',4);POPS.push({x:m.x,y:m.y-14,t:0,s});for(let k=0;k<50;k++){const a=Math.random()*6.283,v=R(0.8,4);P.push({x:m.x,y:m.y,vx:Math.cos(a)*v,vy:Math.sin(a)*v,l:1,c:k%3?[255,236,200]:mix(COLORS[k%6].rgb,G,1-A[k%6]),r:R(0.8,2.2),dr:0.016});}}
function startRestart(rs,quiet,vr){if(vr){RST={t:0,vr:true};SND.play('resail');document.getElementById('block').style.display='block';return;}RST={t:0,rs:!!rs,quiet:!!quiet};if(!quiet)SND.play('resail');if(!quiet){curTab='drive';document.getElementById('app').classList.add('rstDim');}renderPanel(true);document.getElementById('block').style.display='block';}   // quiet＝航海中の自動の停止：見ているタブはそのまま、画面も暗くしない
function drawRst(){if(RST.vr)return drawLaunch();const r=RST;r.t++;const t=r.t;
  if(t<30){SPDF=0;}
  if(t>=30&&t<90){ROTV=2*(t-30)/60;}   /* 中心が白く光る演出はなくした（2026-11-06） */
  if(t===60){const ln=r.rs&&RESTART_LINES[S.restarts];if(ln)story('rs'+S.restarts,ln);else subtitle('もう一度、船を出す。');}
  if(t===80&&r.rs){for(let i=0;i<7;i++)TG[i]=memTarget(i);paintGoal();}
  if(t===80){['hud','route','panel'].forEach((id,i)=>{document.getElementById(id).style.transitionDelay=(i*0.25)+'s';});document.getElementById('app').classList.remove('rstDim');setTimeout(()=>{['hud','route','panel'].forEach(id=>document.getElementById(id).style.transitionDelay='');},1500);}
  if(t>=80){const p=cl((t-80)/70);SPDF=ei(p);ROTV=2*(1-p);}
  ROT+=ROTV;TKG.setAttribute('transform','rotate('+ROT.toFixed(2)+' 88 88)');
  if(t>=150){SPDF=1;ROTV=0;ROT=Math.round(ROT/5)*5;TKG.setAttribute('transform','rotate('+ROT+' 88 88)');NEWSK=[];document.getElementById('block').style.display='none';RST=null;}}
/* 航海の自動の緊急停止（2026-11-16 に軽くした）：大きな演出・画面の覆い・時間の停止をやめ、鈴の音と小さな光、上の短い知らせだけ */
function autoBrake(){const g=wGain();SND.play('milestone');prestige(false);FXQ.prestige=false;fla=Math.max(fla,0.03);TRIP.push({x:RC.x,y:RC.y,t:0,c:[200,210,235]});paintSpeed();renderPanel(true);toast('自動で止まった　歪み +'+fmt(g));}
function startBrake(g,auto){NEWSK=[];BRK={t:0,g,lit:nines(S.stage),auto:!!auto};SND.play(auto?'milestone':'brake');document.getElementById('block').style.display='block';}
function drawBrk(){if(BRK.man)return drawVr();const b=BRK;b.t++;const t=b.t,low=fxLow,amp=low?0.4:1,B0=30,B1=180,S1=215,S2=335;
  if(b.t===1){b.st=S.stage;b.bv0=BVC;b.sp0=Math.max(0,SPDF);b.sk0=stk;b.rv0=ROTV;}   // 2026-11-20：止め始めは今の流れの速さのまま（前は3〜6倍に跳ね上がり、加速したように見えた）
  const red=t<B1?(t<B0?0.5+0.5*Math.sin(t*0.5):1-(t-B0)/(B1-B0)):0;
  if(red>0){const g=cx.createRadialGradient(RC.x,RC.y,Math.min(CW,CH)*0.2,RC.x,RC.y,Math.max(CW,CH)*0.75);g.addColorStop(0,'rgba(0,0,0,0)');g.addColorStop(1,'rgba(230,40,30,'+(0.42*red*amp)+')');cx.fillStyle=g;cx.fillRect(0,0,CW,CH);}
  if(t<B1)for(let i=0;i<12;i++){let op='';if(i<b.lit){if(t<B0)op=(Math.floor(t/4)%2?'0.2':'1');else op=(i<b.lit*Math.pow(1-(t-B0)/(B1-B0),1.5)?'1':'0.12');}SEG[i].style.opacity=op;}
  if(t===1&&!low)frameEl.classList.add('shakeL');
  if(t>=B0&&t<B1){const p=(t-B0)/(B1-B0),k=Math.pow(1-p,3);BVC=b.bv0*k;SPDF=b.sp0*k;stk=Math.round(b.sk0*Math.pow(1-p,2));ROTV=b.rv0*k;
    if(t===B0){frameEl.classList.remove('shakeL');fla=low?0.03:0.08;if(!low){frameEl.style.setProperty('--sh','7px');frameEl.classList.remove('shake');void frameEl.offsetWidth;frameEl.classList.add('shake');const ap=document.getElementById('app');ap.classList.remove('lurch');void ap.offsetWidth;ap.classList.add('lurch');}}
    if(!low&&t%40===10&&p<0.7){frameEl.style.setProperty('--sh',(5*(1-p)).toFixed(1)+'px');frameEl.classList.remove('shake');void frameEl.offsetWidth;frameEl.classList.add('shake');}
    const fr=stageBeta(b.st)*Math.pow(1-p,2.2),h=document.getElementById('hV');h.textContent=fr>=0.01?(fr*100).toFixed(fr>0.9?2:1)+'% c':Math.round(fr*C_KMS).toLocaleString('ja-JP')+' km/s';}
  if(t===B1){stk=0;BVC=0;for(const sg of SEG)sg.style.opacity='';if(b.rs)rebirth();else if(b.vr)redraw();else prestige(false);paintSpeed();renderPanel(true);fla=low?0.06:0.14;
    if(!low){frameEl.style.setProperty('--sh','3px');frameEl.classList.remove('shake');void frameEl.offsetWidth;frameEl.classList.add('shake');}}
  if(t>=B1&&t<S1){SPDF=0;ROTV=0;}   // 止まる直前の逆向きの反動はやめた（後ろへ進むように見えた、2026-11-20）
  if(t===S1){SPDF=0;ROTV=0;STILL=true;if(!b.auto)document.getElementById('app').classList.add('rstDim');}
  if(t>S1)SPDF=0;
  if(t<S1){ROT+=ROTV;TKG.setAttribute('transform','rotate('+ROT.toFixed(2)+' 88 88)');}
  if(t>=S2){SPDF=0;STILL=false;frameEl.classList.remove('shakeL');document.getElementById('block').style.display='none';BRK=null;if(b.rs)openGlow(()=>startRestart(true));else if(b.vr&&b.auto){glowAutoSpend();trailAutoSpend();startRestart();}else if(b.vr){glowAutoSpend();openWake(()=>startRestart());}else if(b.auto)startRestart(false,true);else openSkill(true,b.g);}}
/* 航路の引き直し（2026-11-23、試作 A「航跡を巻き取る」）：前は緊急停止の赤い演出を流用していた。
   手で引き直す：星の流れが緩む → 故郷からここまでの航路が窓に浮かぶ → 先から故郷へ巻き戻り、ほどけた光が昇って「航跡 +○」を数える → 航跡の小窓 →
   「船を出す」で故郷から新しい線が引かれ（古い航路は薄い影）、「新しい航路へ。」、星がまた流れる。タブは動かさない。
   自動（法則「引き直しの記憶」）：操作を止めず、窓の中で小さな航路が1秒半で巻き戻るだけ（autoRedraw）。 */
let VRP=[],VRT={x:0,y:0},VROLD=null,VMINI=null;
function vrGeom(n,seed,bx){bx=bx||{x0:FR.x+FR.w/2,yb:FR.y+FR.h-46,yt:FR.y+100,amp:Math.min(FR.w*0.2,120)};let sd=Math.max(1,Math.floor(seed*7919)%2147483646);const r=()=>{sd=(sd*16807)%2147483647;return sd/2147483647;},ph=r()*6.283,P=[];
  for(let k=0;k<=n;k++){const t=k/n;P.push({x:bx.x0+Math.sin(k*0.9+ph)*bx.amp*(0.35+0.65*t)+(r()-.5)*bx.amp*0.06,y:bx.yb-(bx.yb-bx.yt)*t});}
  const o=[];for(let k=0;k<n;k++){const a=P[k],b=P[k+1],ym=(a.y+b.y)/2;for(let i=0;i<12;i++){const t=i/12,u=1-t;o.push({x:u*u*u*a.x+3*u*u*t*a.x+3*u*t*t*b.x+t*t*t*b.x,y:u*u*u*a.y+3*u*u*t*ym+3*u*t*t*ym+t*t*t*b.y});}}o.push(P[n]);return {P,pts:o};}
function vrVeil(a){if(a<=0.005)return;cx.save();cx.beginPath();if(cx.roundRect)cx.roundRect(FR.x,FR.y,FR.w,FR.h,18);else cx.rect(FR.x,FR.y,FR.w,FR.h);cx.clip();cx.fillStyle='rgba(4,5,12,'+a.toFixed(3)+')';cx.fillRect(FR.x,FR.y,FR.w,FR.h);cx.restore();}
function vrLine(pts,i1,a,w){if(i1<1||a<=0.002)return;w=w||1;cx.lineCap='round';cx.beginPath();cx.moveTo(pts[0].x,pts[0].y);for(let i=1;i<=i1;i++)cx.lineTo(pts[i].x,pts[i].y);cx.strokeStyle='rgba(255,226,190,'+(a*0.13).toFixed(3)+')';cx.lineWidth=5*w;cx.stroke();cx.strokeStyle='rgba(255,226,190,'+a.toFixed(3)+')';cx.lineWidth=w;cx.stroke();}
function vrTip(x,y,a,big){if(a<=0.01)return;blob(x,y,big?34:16,[255,226,190],0.28*a);cx.fillStyle='rgba(255,244,230,'+a.toFixed(3)+')';cx.beginPath();cx.arc(x,y,big?2.6:1.6,0,6.283);cx.fill();}
function vrHome(h,a,label){cx.fillStyle='rgba(255,214,170,'+(0.9*a).toFixed(3)+')';cx.beginPath();cx.arc(h.x,h.y,2.2,0,6.283);cx.fill();if(label){cx.font='300 10px Murecho, sans-serif';cx.textAlign='center';cx.fillStyle='rgba(236,238,242,'+(0.5*a).toFixed(3)+')';cx.fillText('故郷',h.x,h.y+16);}}
function vrSyms(b,gm,tip,a,glowAt){const P=gm.P;for(let k=1;k<b.n;k++){if(k*12>tip)continue;const s=b.path[k-1],o=FORKS.find(f=>f.id===s),c=o?o.col:[255,226,190];cx.strokeStyle=rgb(c,0.7*a);cx.lineWidth=0.9;cx.beginPath();cx.arc(P[k].x,P[k].y,3.4,0,6.283);cx.stroke();if(glowAt!=null&&Math.abs(k*12-glowAt)<6)blob(P[k].x,P[k].y,16,c,0.45*a);}}
function vrEmit(gm,from,to,n){for(let i=to;i<from&&i<gm.pts.length-1;i++){const p=gm.pts[i];for(let m=0;m<n;m++)VRP.push({x:p.x+R(-2,2),y:p.y,vx:R(-.3,.3),vy:R(-.8,-.3),l:1});}}
function drawVrP(){const tx=VRT.x,ty=VRT.y;for(let i=VRP.length-1;i>=0;i--){const p=VRP[i];p.l-=0.012;const k=1-p.l;p.x+=p.vx+(tx-p.x)*0.02*k;p.y+=p.vy+(ty-p.y)*0.025*k;if(p.l<=0||(Math.abs(p.y-ty)<5&&Math.abs(p.x-tx)<30)){VRP.splice(i,1);continue;}cx.fillStyle='rgba(255,240,215,'+(p.l*0.9).toFixed(3)+')';cx.fillRect(p.x,p.y,1.3,1.3);}}
function startRedraw(){const g=tGain();if(g<1)return;BRK={t:0,vr:true,man:true,g,path:S.route?S.route.path.slice():[],n:Math.max(2,voyDoublings(S.vdist||1e4)),sp0:Math.max(0,SPDF),rv0:ROTV};document.getElementById('block').style.display='block';SND.play('brake');}
function drawVr(){const b=BRK;b.t++;const t=b.t,low=fxLow;
  if(t===1){document.getElementById('app').classList.add('rstDim','vrOn');b.geo=vrGeom(b.n,(S.st.redraws||0)+3);}
  if(t<=120){const k=1-ei(t/120);SPDF=b.sp0*k;ROTV=b.rv0*k;ROT+=ROTV;TKG.setAttribute('transform','rotate('+ROT.toFixed(2)+' 88 88)');}else{SPDF=0;ROTV=0;}
  if(t===110)STILL=true;
  vrVeil(0.82*ei(cl((t-40)/90))+0.18*ei(cl((t-505)/40)));   // 最後は真っ暗まで沈めて、航跡の小窓へつなぐ   // 背景（光の帯・銀河・星）を暗く沈めてから航路を浮かべる（重なって見えにくかった、2026-11-24）
  const gm=b.geo,N=gm.pts.length-1;VRT={x:FR.x+FR.w/2,y:FR.y+50};
  if(t>=110){const a=cl((t-110)/50);let tip=t<230?Math.round(N*ei(cl((t-110)/110))):t<250?N:Math.round(N*(1-ei(cl((t-250)/280))));
    vrLine(gm.pts,tip,0.75*a,1);vrSyms(b,gm,tip,a,t>=250?tip:null);const q=gm.pts[tip];vrTip(q.x,q.y,a,true);vrHome(gm.P[0],a,true);
    if(t>=250){vrEmit(gm,b.prev==null?N:b.prev,tip,low?1:2);b.prev=tip;}}
  if(t>=240){const a=cl((t-240)/40)*(t>520?1-cl((t-520)/24):1),ty=FR.y+58;cx.textAlign='center';cx.font='400 9px Michroma, sans-serif';cx.fillStyle='rgba(236,238,242,'+(0.5*a).toFixed(3)+')';cx.fillText('W A K E',FR.x+FR.w/2,ty-22);cx.font='300 22px Jura, sans-serif';cx.fillStyle='rgba(255,241,220,'+a.toFixed(3)+')';cx.fillText('航跡 +'+fmt(Math.round(b.g*ei(cl((t-250)/290)))),FR.x+FR.w/2,ty+4);}
  if(t===250)SND.play('learn');
  if(t>=545){VROLD=gm;redraw();BRK=null;STILL=false;SPDF=0;document.getElementById('block').style.display='none';paintSpeed();renderPanel(true);glowAutoSpend();openWake(()=>startRestart(false,false,true));}}
function drawLaunch(){const r=RST;r.t++;const t=r.t;
  if(t===1){r.geo=vrGeom(22,(S.st.redraws||0)*7+11);STILL=false;}
  vrVeil(0.82*(1-ei(cl((t-150)/100))));
  const gm=r.geo,N=gm.pts.length-1,fade=1-cl((t-200)/70);
  if(VROLD&&fade>0)vrLine(VROLD.pts,VROLD.pts.length-1,0.08*fade,1);
  const tip=Math.round(N*eo(cl(t/170)));vrLine(gm.pts,tip,0.8*fade,1);const q=gm.pts[tip];vrTip(q.x,q.y,fade,true);vrHome(gm.P[0],fade,false);
  if(t===110)subtitle('新しい航路へ。');
  if(t===150){['hud','route','panel'].forEach((id,i)=>{document.getElementById(id).style.transitionDelay=(i*0.25)+'s';});document.getElementById('app').classList.remove('rstDim','vrOn');setTimeout(()=>{['hud','route','panel'].forEach(id=>document.getElementById(id).style.transitionDelay='');},1600);}
  SPDF=t<150?0:ei(cl((t-150)/90));
  if(t>=270){SPDF=1;ROTV=0;RST=null;VROLD=null;document.getElementById('block').style.display='none';}}
/* 自動の引き直し：操作は止めない。窓の中で小さな航路が巻き戻り、粒がリングへ昇る */
function autoRedraw(){const path=S.route?S.route.path.slice():[],n=Math.max(2,voyDoublings(S.vdist||1e4)),g=redraw();if(!g)return;glowAutoSpend();trailAutoSpend();
  const h=Math.min(FR.h*0.42,220);VMINI={t:0,n,path,g,geo:vrGeom(n,(S.st.redraws||0)+5,{x0:RC.x,yb:RC.y+h/2,yt:RC.y-h/2,amp:Math.min(FR.w*0.12,60)})};SND.play('learn');toast('自動で航路を引き直した　航跡 +'+fmt(g));paintSpeed();renderPanel(true);}
function drawVMini(){const m=VMINI;m.t++;const t=m.t,gm=m.geo,N=gm.pts.length-1,a=0.55*cl(t/20)*(1-cl((t-95)/15));VRT={x:RC.x,y:RC.y};
  const tip=t<20?N:Math.round(N*(1-ei(cl((t-20)/75))));vrLine(gm.pts,tip,a,0.8);vrTip(gm.pts[tip].x,gm.pts[tip].y,a,false);vrHome(gm.P[0],a,false);if(t>20){vrEmit(gm,m.prev==null?N:m.prev,tip,1);m.prev=tip;}
  if(t>=110)VMINI=null;}
const CH_T=65;
function drawAcc(){const a=ACC;a.t++;const low=fxLow,lv=a.lvl,n=nines(lv),t=a.t,dur=162,amp=low?0.45:1;
  if(n>0){const i=(n-1)%12,an=-1.5708+(i+0.5)/12*6.283,ax=RC.x+Math.cos(an)*74*RCS,ay=RC.y+Math.sin(an)*74*RCS,c=mix(COLORS[i%6].rgb,G,1-A[i%6]),g=t<CH_T?t/CH_T:Math.max(0,1-(t-CH_T)/70);blob(ax,ay,(9+lv*0.35)*(0.5+g)*RCS,c,0.5*g);SEG[i].setAttribute('stroke-width',(2.2+3*g).toFixed(2));}
  let e=0;
  if(t<CH_T){const c=t/CH_T,f=0.35+0.65*Math.sin(Math.PI*Math.min(1,c*1.1));if(!a.inS)a.inS=[];const SK=Math.max(1,Math.hypot(FR.w,FR.h)/487);for(let k=0;k<(low?3:8);k++){const an=Math.random()*6.283,d=SK*R(465,560),ci=(k+t)%6;a.inS.push({x:RC.x+Math.cos(an)*d,y:RC.y+Math.sin(an)*d,an,sp:R(0.022,0.045),l:0,s:R(0.7,1.5),c:mix(COLORS[ci].rgb,G,1-A[ci])});}
    // 2026-11-18：溜めの光も背景の星と同じく、遠いほど速く・中心に近いほどゆっくり（中心からの距離に比例して寄る）。リングの手前で溶ける。前は一定の速さで中心まで届き、星の流れとかみ合っていなかった
    cx.save();cx.beginPath();cx.rect(FR.x,FR.y,FR.w,FR.h);cx.clip();
    const RR=80*RCS;for(let k=a.inS.length-1;k>=0;k--){const q=a.inS[k];let dd=Math.hypot(q.x-RC.x,q.y-RC.y);const mv=dd*q.sp*f;q.x-=Math.cos(q.an)*mv;q.y-=Math.sin(q.an)*mv;q.l=Math.min(1,q.l+0.08);dd-=mv;if(dd<RR*0.9){a.inS.splice(k,1);continue;}const al=q.l*cl((dd-RR*0.9)/(RR*1.2)),tl=mv*2.4;cx.beginPath();cx.moveTo(q.x,q.y);cx.lineTo(q.x+Math.cos(q.an)*tl,q.y+Math.sin(q.an)*tl);cx.strokeStyle=rgb(q.c,al*0.7);cx.lineWidth=q.s*0.7;cx.stroke();cx.beginPath();cx.arc(q.x,q.y,q.s,0,6.283);cx.fillStyle=rgb(q.c,al);cx.fill();}cx.restore();}
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

let HOMEC=null;
function drawHome(){const h=HOMEA;h.t++;const D=380;   // 雲を抜けるまで（約6秒）
  if(!h.L){h.L=[];for(let i=0;i<18;i++){const pf=[];for(let k=0;k<14;k++){const a=R(0,6.283),d=Math.sqrt(Math.random())*1.6;pf.push({x:Math.cos(a)*d,y:Math.sin(a)*d*0.7,r:R(0.35,0.9)});}h.L.push({s:i*17+R(-5,5),pf});}}
  const cxp=CW/2,cyp=CH*0.45,base=Math.max(CW,CH)*0.5,gp=cl(h.t/D),col=mix([182,187,198],G,0.3);
  cx.fillStyle='rgba(19,21,30,'+ei(cl(h.t/45)).toFixed(3)+')';cx.fillRect(0,0,CW,CH);
  let fog=0;const vis=h.L.map(L=>{const age=h.t-L.s,dur=140-75*gp;return{L,p:age/dur};}).filter(o=>o.p>0&&o.p<1).sort((a,b)=>a.p-b.p);
  // 雲は1/4の大きさの画面（上下左右に6ずつ余白。ぼかしで画面の縁が薄くならないよう）に描いてから、なめらかに引き伸ばす（2026-11-16）。薄い丸いぼかしを何十枚も重ねると、PC の細かい画面で細かな網目の線が見えていた
  const hw=Math.ceil(CW/4)+12,hh=Math.ceil(CH/4)+12;if(!HOMEC||HOMEC.width!==hw||HOMEC.height!==hh){HOMEC=document.createElement('canvas');HOMEC.width=hw;HOMEC.height=hh;}
  const HX=HOMEC.getContext('2d');HX.setTransform(1,0,0,1,0,0);HX.clearRect(0,0,hw,hh);HX.setTransform(0.25,0,0,0.25,6,6);
  const hb=(x,y,rr,c,a)=>{if(a<=0.002||rr<=0)return;const g=HX.createRadialGradient(x,y,0,x,y,rr);g.addColorStop(0,rgb(c,a));g.addColorStop(0.45,rgb(c,a*0.45));g.addColorStop(1,rgb(c,0));HX.fillStyle=g;HX.fillRect(x-rr,y-rr,rr*2,rr*2);};
  for(const o of vis){const al=(o.p<0.6?o.p/0.6:1)*(0.6-0.2*gp),sc=0.2/(1-o.p+0.04);for(const f of o.L.pf){const x=cxp+f.x*base*sc,y=cyp+f.y*base*sc,r=f.r*base*sc*0.9;if(x+r<0||x-r>CW||y+r<0||y-r>CH)continue;const fa=al*(o.p>0.85?(1-o.p)/0.15:1);hb(x,y,r,col,fa*0.38);hb(x+r*0.35,y-r*0.15,r*0.55,[220,224,232],fa*0.22);}}
  cx.save();cx.imageSmoothingEnabled=true;cx.imageSmoothingQuality='high';if('filter' in cx)cx.filter='blur(6px)';cx.drawImage(HOMEC,-24,-24,hw*4,hh*4);cx.restore();   // 引き伸ばしたときの粗さもぼかして消す
  for(const o of vis){const z=1-o.p,sc=0.2/(z+0.04);if(o.p>0.78)fog=Math.max(fog,Math.sin((o.p-0.78)/0.22*Math.PI)*0.42);
    if(o.p>0.55){const k=(o.p-0.55)/0.45;for(const f of o.L.pf.slice(0,6)){const dx=f.x,dy=f.y,dl=Math.hypot(dx,dy)||1,r1=base*sc*dl*0.9,r2=r1*1.25;cx.beginPath();cx.moveTo(cxp+dx/dl*r1,cyp+dy/dl*r1);cx.lineTo(cxp+dx/dl*r2,cyp+dy/dl*r2);cx.strokeStyle=rgb([220,224,232],0.12*k*(1-gp*0.5));cx.lineWidth=2;cx.stroke();}}}
  if(fog>0){cx.fillStyle=rgb(mix([150,155,168],[60,64,74],gp),fog);cx.fillRect(0,0,CW,CH);}
  if(h.t>D&&!h.done){h.done=true;homeColors();}}
