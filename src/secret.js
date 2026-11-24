'use strict';
/* =====================================================================
   隠し要素（2026-11-24）
   ① 故郷からの便り：窓の隅でときどき光が短く長く点滅する。押すと故郷から届いた一文が読める（11通。12通目は「おかえり」の画面に）
   ② リングを押したまま10秒待つと、星の流れが止まり、音が消えて「静かだ。」。指を離すと戻る
   ③ 速さの表示を続けて9回押すと、一瞬「＝ 1」と光る（0.999…＝1）
   どれも隠し実績（data.js の ACHIEVEMENTS で5つめが 1 のもの）とつながる
   ===================================================================== */
// ① 便り
let SIG=null;   // {el,t0}
const sigEl=document.createElement('button');sigEl.id='sigDot';sigEl.setAttribute('aria-label','かすかな光');frameEl.appendChild(sigEl);
sigEl.addEventListener('pointerdown',e=>e.stopPropagation());
sigEl.addEventListener('click',e=>{e.stopPropagation();if(!SIG)return;sigHide();const i=S.letters||0;if(i>=LETTERS.length-1)return;S.letters=i+1;SND.play('light');
  subtitle('便り　'+LETTERS[i]);S.log.push({y:Math.floor(S.years),t:LETTERS[i],c:-1,k:'mail'});if(S.log.length>200)S.log.shift();if(curTab==='log')renderPanel(true);save();});
function sigShow(){const W=FR.w,H=FR.h;if(!W||!H)return;const side=Math.random()<0.5,x=side?18+Math.random()*W*0.18:W-18-Math.random()*W*0.18,y=H*(0.12+Math.random()*0.7);
  sigEl.style.left=Math.round(x)+'px';sigEl.style.top=Math.round(y)+'px';sigEl.classList.add('on');SIG={t0:performance.now()};}
function sigHide(){sigEl.classList.remove('on');SIG=null;}
let sigAcc=0;
function sigTick(dt){   // main.js のループから1秒ごと
  const busy=S.chal||climax||BRK||RST||FOLD||LIGHTFX||skillOpen||glowOpen||bootOn||document.querySelector('.modal.on,#door.on,#lawOv.on,#pickOv.on,#wakeOv.on,#recOv.on');
  if(SIG){if(busy||performance.now()-SIG.t0>25000)sigHide();return;}
  if(busy||!S.flags.bat||(S.letters||0)>=LETTERS.length-1)return;
  sigAcc+=dt;if(sigAcc<15*60)return;   // 前の光から15分は出さない
  if(Math.random()<dt/(20*60)){sigAcc=0;sigShow();}}   // そのあとは平均20分に1回
// 12通目は、11通を読んだあとで1時間以上離れて戻ったとき、「おかえり」の画面に
function welcomeLetter(el2){if((S.letters||0)!==LETTERS.length-1||el2<3600)return '';const i=LETTERS.length-1;S.letters=LETTERS.length;S.log.push({y:Math.floor(S.years),t:LETTERS[i],c:-1,k:'mail'});return LETTERS[i];}
// ② 静けさ
let HUSH=null;   // {t0,x,y,on,sp}
function hushOk(){return !climax&&!BRK&&!RST&&!FOLD&&!LIGHTFX&&!ACC&&!skillOpen&&!glowOpen&&!bootOn;}
frameEl.addEventListener('pointerdown',e=>{const dx=e.clientX-RC.x,dy=e.clientY-RC.y;if(Math.hypot(dx,dy)>88*RCS||!hushOk())return;HUSH={t0:performance.now(),x:e.clientX,y:e.clientY,on:false};});
frameEl.addEventListener('pointermove',e=>{if(HUSH&&!HUSH.on&&Math.hypot(e.clientX-HUSH.x,e.clientY-HUSH.y)>14)HUSH=null;});
const hushEnd=()=>{if(!HUSH)return;if(HUSH.on){STILL=false;const sp=HUSH.sp,t0=performance.now();const st=n=>{const p=Math.min(1,(n-t0)/1200);SPDF=sp*p;if(p<1)requestAnimationFrame(st);};requestAnimationFrame(st);}HUSH=null;};
addEventListener('pointerup',hushEnd);addEventListener('pointercancel',hushEnd);
function hushTick(){if(!HUSH||HUSH.on)return;if(!hushOk()){HUSH=null;return;}if(performance.now()-HUSH.t0<10000)return;
  HUSH.on=true;HUSH.sp=SPDF||1;const t0=performance.now(),sp=HUSH.sp;const st=n=>{if(!HUSH||!HUSH.on)return;const p=Math.min(1,(n-t0)/1500);SPDF=sp*(1-p);if(p<1)requestAnimationFrame(st);else STILL=true;};requestAnimationFrame(st);
  subtitle('静かだ。');if(!S.flags.hStill){S.flags.hStill=1;checkAch();}}
// ③ 9の向こう
let nineTap={n:0,t:0};
document.getElementById('hV').addEventListener('click',()=>{const now=performance.now();nineTap.n=now-nineTap.t<700?nineTap.n+1:1;nineTap.t=now;if(nineTap.n<9)return;nineTap.n=0;
  const h=document.getElementById('hV'),r=h.getBoundingClientRect(),o=document.createElement('div');o.className='oneEq';o.textContent='＝ 1';o.style.left=Math.round(r.left)+'px';o.style.top=Math.round(r.top)+'px';o.style.height=Math.round(r.height)+'px';document.body.appendChild(o);
  requestAnimationFrame(()=>o.classList.add('on'));setTimeout(()=>{o.classList.remove('on');setTimeout(()=>o.remove(),700);},1600);SND.play('light');if(!S.flags.hOne){S.flags.hOne=1;checkAch();}});
