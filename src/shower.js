'use strict';
/* =====================================================================
   流星群（METEOR タブの「流星群を呼ぶ」）
   器の段に応じた数の流れ星が窓を横切る。横切るだけでも少し入り、タップか指でなぞって捕まえると大きく入る。
   続けて捕まえると連続の倍率（1.5秒あくと途切れる）、一筆で何個も捕まえると一筆の倍率。
   ===================================================================== */
let SHOWER=null;
function startShower(){if(SHOWER||!canShower()||BRK||RST||climax||FOLD||LIGHTFX)return false;const tier=vesTier(),v=VES[tier];
  SHOWER={t:0,tier,dur:v.dur*60,total:Math.round(v.count*(has('e3')?1.5:1)),spawned:0,acc:0,ms:[],caught:0,combo:0,best:0,gain:0,last:-999,stroke:null,trail:[]};
  S.vessel=0;S.released=true;SND.play('release');subtitle(v.n+'が来る。');save();return true;}
function shBase(){return prodRate()*3;}                               // 横切るだけの流れ星1つ
function shCatchGain(k){const cap=has('eB')?5:3,cm=Math.min(cap,1+0.05*SHOWER.combo),sm=Math.min(2,1+0.15*(k-1));return prodRate()*30*cm*sm*(has('eB')?2:1);}
function shSpawn(){const s=SHOWER,sc=Math.min(1.15,Math.max(0.8,Math.min(FR.w,FR.h)/420)),u=Math.random(),sx=FR.x+FR.w*(0.15+u*1.0),sy=FR.y-20-Math.random()*FR.h*0.25,sp=(3.2+Math.random()*2.6)*sc,a=Math.PI*(0.66+Math.random()*0.08);
  const cols=[[255,240,220],[255,240,220],[255,240,220]].concat(COLORS.slice(0,6).map((c,i)=>mix(c.rgb,G,1-A[i])));
  s.ms.push({x:sx,y:sy,vx:Math.cos(a)*sp,vy:Math.sin(a)*sp,c:cols[Math.floor(Math.random()*cols.length)],dead:false});s.spawned++;}
// 点（x,y）と線分（ax,ay)-(bx,by）の距離
function segDist(x,y,ax,ay,bx,by){const dx=bx-ax,dy=by-ay,l=dx*dx+dy*dy;let t=l?((x-ax)*dx+(y-ay)*dy)/l:0;t=Math.max(0,Math.min(1,t));return Math.hypot(x-ax-dx*t,y-ay-dy*t);}
function shTry(ax,ay,bx,by,rad){const s=SHOWER;if(!s)return;let got=0;
  for(const m of s.ms){if(m.dead)continue;if(segDist(m.x,m.y,ax,ay,bx,by)<rad){m.dead=true;got++;if(s.stroke)s.stroke.k++;
    if(s.t-s.last>90)s.combo=0;s.combo++;s.last=s.t;if(s.combo>s.best)s.best=s.combo;s.caught++;
    const g=shCatchGain(s.stroke?s.stroke.k:1);S.E+=g;S.Erun+=g;s.gain+=g;SND.play('catch',s.combo);
    POPS.push({x:m.x,y:m.y-14,t:0,s:'+'+fmt(g)});for(let k=0;k<22;k++){const a=Math.random()*6.283,v=R(0.8,3.4);P.push({x:m.x,y:m.y,vx:Math.cos(a)*v,vy:Math.sin(a)*v,l:1,c:m.c,r:R(0.8,2),dr:0.02});}}}
  return got;}
function drawShower(){const s=SHOWER;if(!s)return;const k=FRK;s.t+=k;
  if(s.t<=s.dur){s.acc+=s.total/s.dur*k;while(s.acc>=1&&s.spawned<s.total){s.acc--;shSpawn();}}
  // 流れ星
  for(const m of s.ms){if(m.dead)continue;m.x+=m.vx*k;m.y+=m.vy*k;
    if(m.x<FR.x-60||m.y>FR.y+FR.h+60){m.dead=true;const g=shBase();S.E+=g;S.Erun+=g;s.gain+=g;continue;}
    const sp=Math.hypot(m.vx,m.vy),tl=sp*9,ux=m.vx/sp,uy=m.vy/sp,gr=cx.createLinearGradient(m.x,m.y,m.x-ux*tl,m.y-uy*tl);gr.addColorStop(0,rgb(m.c,0.95));gr.addColorStop(1,rgb(m.c,0));
    cx.strokeStyle=gr;cx.lineWidth=1.4;cx.beginPath();cx.moveTo(m.x,m.y);cx.lineTo(m.x-ux*tl,m.y-uy*tl);cx.stroke();blob(m.x,m.y,9,m.c,0.45);cx.beginPath();cx.arc(m.x,m.y,1.6,0,6.283);cx.fillStyle='#fffaf0';cx.fill();}
  if(s.ms.length>60&&s.ms.filter(m=>m.dead).length>30)s.ms=s.ms.filter(m=>!m.dead);
  // なぞった光の跡
  for(let i=s.trail.length-1;i>=0;i--){const q=s.trail[i];q.l-=0.04*k;if(q.l<=0){s.trail.splice(i,1);continue;}cx.strokeStyle='rgba(255,226,190,'+(0.6*q.l).toFixed(3)+')';cx.lineWidth=1.6*q.l+0.4;cx.lineCap='round';cx.beginPath();cx.moveTo(q.ax,q.ay);cx.lineTo(q.bx,q.by);cx.stroke();}
  // 連続の数と残り時間
  if(s.t-s.last>90)s.combo=0;
  const X=FR.x+FR.w/2,Y=FR.y+FR.h*0.86,left=Math.max(0,Math.ceil((s.dur-s.t)/60));cx.save();cx.textAlign='center';
  if(s.combo>=2){const k=Math.min(1,(s.t-s.last)/12);cx.font='300 '+Math.round(34+6*(1-k))+'px Jura';cx.fillStyle='rgba(255,226,190,.95)';cx.shadowColor='rgba(255,200,140,.7)';cx.shadowBlur=14;cx.fillText(s.combo+' 連',X,Y-18);cx.shadowBlur=0;}
  cx.font='300 11px Murecho';cx.fillStyle='rgba(236,238,242,.55)';cx.fillText(s.t<=s.dur?'流れ星をタップか、なぞって捕まえる　残り '+left+'秒':'',X,Y+8);cx.restore();
  // 降り終わり
  if(s.t>s.dur&&s.ms.every(m=>m.dead)){SHOWER=null;S.st.showers=(S.st.showers||0)+1;S.st.caught=(S.st.caught||0)+s.caught;if(s.best>(S.st.bestCombo||0))S.st.bestCombo=s.best;
    logLine(LINES.shEnd,-1);toast('流星群　<b>+'+fmt(s.gain)+'</b>　捕まえた '+s.caught+' / '+s.total+'　いちばん長い連続 '+s.best);SND.play('light');save();if(curTab==='battery')renderPanel(true);}}
// 指の動き：押した点と、なぞった線で捕まえる
frameEl.addEventListener('pointerdown',ev=>{if(!SHOWER)return;const x=ev.clientX,y=ev.clientY;SHOWER.stroke={x,y,k:0,id:ev.pointerId};shTry(x,y,x,y,30);try{frameEl.setPointerCapture(ev.pointerId);}catch(e){}},true);
frameEl.addEventListener('pointermove',ev=>{const s=SHOWER;if(!s||!s.stroke||s.stroke.id!==ev.pointerId)return;const x=ev.clientX,y=ev.clientY,st=s.stroke;if(Math.hypot(x-st.x,y-st.y)<3)return;
  shTry(st.x,st.y,x,y,22);s.trail.push({ax:st.x,ay:st.y,bx:x,by:y,l:1});if(st.k>=3&&!st.shown){st.shown=1;}st.x=x;st.y=y;ev.preventDefault();});
const shUp=ev=>{const s=SHOWER;if(!s||!s.stroke)return;if(s.stroke.k>=3)POPS.push({x:s.stroke.x,y:s.stroke.y-30,t:0,s:'一筆 '+s.stroke.k});s.stroke=null;};
frameEl.addEventListener('pointerup',shUp);frameEl.addEventListener('pointercancel',shUp);
