'use strict';
let batAt=0;   // 蓄電池を開く一文は、最初の色を失ったあとの説明の一文から少し間を空けて出す
document.addEventListener('pointerdown',()=>SND.unlock(),true);document.addEventListener('keydown',()=>SND.unlock(),true);
/* =====================================================================
   LOOP / BOOT
   ===================================================================== */
function applyLoadedVisuals(){for(let i=0;i<7;i++){const v=memTarget(i);A[i]=v;TG[i]=v;RV[i]=v;}paintSpeed();}
function prologue(){story('pro1',LINES.pro1);setTimeout(()=>story('pro2',LINES.pro2),4400);setTimeout(()=>story('start',LINES.start),8800);}
let lastT=performance.now(),acc=0,secAcc=0,saveAcc=0,lastStage=-1,paused=false,panelHold=false;
pbody.addEventListener('pointerdown',()=>{panelHold=true;});addEventListener('pointerup',()=>{setTimeout(()=>{panelHold=false;},60);});addEventListener('pointercancel',()=>{panelHold=false;});
function loop(){const now=performance.now();let dt=Math.min(1,(now-lastT)/1000);lastT=now;if(!document.hidden)S.st.play+=dt;
  if(paused)return;
  // 緊急停止の演出から、星図、帆を張る演出が終わるまでは、ゲームの時間を止める（航海の自動の停止も含む）
  const halted=!!BRK||!!RST||(skillOpen&&skillPick);
  if(!climax&&!halted){const steps=timeMult>=100?10:1;for(let k=0;k<steps;k++)tick(dt*timeMult/steps);checkStory();}
  if(FXQ.accel){const r=FXQ.accel;FXQ.accel=false;SND.play('accel',S.stage);for(const sg of SEG)sg.setAttribute('stroke-width','2.2');if(ACC&&ACC.t>=CH_T){ACC.t=CH_T-1;ACC.lvl=S.stage;HVR={from:S.stage-1,to:S.stage,t0:Date.now()};}else if(ACC){ACC.lvl=S.stage;HVR={from:S.stage-1,to:S.stage,t0:Date.now()+Math.max(0,(CH_T-ACC.t))*16};}else{ACC={t:0,lvl:S.stage};HVR={from:S.stage-1,to:S.stage,t0:Date.now()+1080};}const v=document.getElementById('hV'),dl=Math.max(0,(HVR?HVR.t0:Date.now())-Date.now());v.style.transition='text-shadow .25s, opacity .25s';setTimeout(()=>{v.style.textShadow='0 0 12px rgba(235,240,255,.85)';setTimeout(()=>{v.style.transition='text-shadow 1.2s';v.style.textShadow='';},450);},dl);if(r>1.05)hudPop('故郷の時間 ×'+fmtG(r));}
  if(FXQ.release){FXQ.release=false;SND.play('release');const r=FXQ.relBtn||{left:CW/2,top:CH*0.85,width:0,height:0},tg=document.getElementById('spdV').getBoundingClientRect(),sx=r.left+r.width/2,sy=r.top+r.height/2,tx=tg.left+tg.width/2,ty=tg.top+tg.height/2;FXQ.relBtn=null;
    const gc=mix([255,200,110],G,1-A[3]);for(let k=0;k<(fxLow?30:80);k++){const d=R(24,36);P.push({x:sx+R(-40,40),y:sy+R(-8,8),vx:(tx-sx)/d+R(-1.2,1.2),vy:(ty-sy)/d+R(-1.2,1.2),l:1,c:gc,r:R(1,2.4),dr:0.9/d});}
    fla=Math.max(fla,fxLow?0.05:0.14);const v=document.getElementById('spdV');setTimeout(()=>{v.style.transform='scale(1.3)';v.style.color='#ffd38a';setTimeout(()=>{v.style.transform='';v.style.color='';},900);},450);}
  if(FXQ.autoDone!=null){const i=FXQ.autoDone;FXQ.autoDone=null;toast(DEVICES[i].name+'が <b>'+S.dev[i]+'台</b> に届いた');if(curTab==='drive')renderDrive(true);}
  if(FXQ.tier!=null){const i=FXQ.tier;FXQ.tier=null;SND.play('tier',DEVICES[i].col);TIERFX={i,t:Date.now()};if(curTab==='drive')refreshTier(i);const u=devUI.find(x=>x.i===i);if(u&&u.el){const sv=u.el.querySelector('svg').getBoundingClientRect(),c=mix(colRGB(DEVICES[i].col),G,1-A[DEVICES[i].col]);TRIP.push({x:sv.left+sv.width/2,y:sv.top+sv.height/2,t:0,c});
    u.el.dataset.sweep='1';u.el.style.background='';u.el.style.backgroundImage='linear-gradient(90deg,transparent,'+rgb(c,0.22)+',transparent)';u.el.style.backgroundSize='40% 100%';u.el.style.backgroundRepeat='no-repeat';const an=u.el.animate&&u.el.animate([{backgroundPosition:'-60% 0'},{backgroundPosition:'160% 0'}],{duration:900,easing:'ease-out'});if(an)an.onfinish=()=>{u.el.style.backgroundImage='';delete u.el.dataset.sweep;};}}
  if(FXQ.letter){toast('故郷からの便り　<b>+'+fmt(FXQ.letter)+'</b>');FXQ.letter=0;}
  if(FXQ.restart){FXQ.restart=0;if(curTab==='drive')renderDrive(true);}
  // ③：航海では緊急停止を自動で（小窓が開いている間は待つ）
  // 蓄電池：故郷で最初の1年が過ぎ、色を失う演出が終わったら開く
  if(!S.flags.bat&&S.years>=1&&S.flags.why&&!VQ.length&&!vqTimer&&!BRK&&!RST&&!climax){if(!batAt)batAt=Date.now()+4000;else if(Date.now()>batAt){S.flags.bat=1;logLine(LINES.bat,-1);SND.play('light');renderPanel(true);paintGoal();}}
  if(FXQ.autoShower){FXQ.autoShower=false;if(!document.querySelector('.modal.on,#title.on')&&!skillOpen)startShower();}
  // ④ 引き直しの記憶：航路の引き直しも自動で
  if(autoRedrawReady()&&!LIGHTFX&&!BRK&&!RST&&!climax&&!ACC&&!FOLD&&!skillOpen&&!document.querySelector('.modal.on,#title.on')){startBrake(0,true);BRK.vr=true;}
  if(voyStopReady()&&!FOLD&&!LIGHTFX&&!BRK&&!RST&&!climax&&!ACC&&!skillOpen&&!document.querySelector('.modal.on,#title.on')){startBrake(wGain(),true);}
  if(FXQ.found){const ks=FXQ.found;FXQ.found=null;SND.play('light');fla=Math.max(fla,0.22);ks.forEach(k=>toast('新しい色　<b style="color:'+rgb(NEW_COLORS[k].rgb,1)+'">'+NEW_COLORS[k].name+'</b>　'+DEVICES[ANCHOR+1+k].name+'が使えるようになった'));if(curTab==='drive')renderDrive(true);}
  if(FXQ.chalDone){const id=FXQ.chalDone;FXQ.chalDone=null;SND.play('light');fla=Math.max(fla,0.22);toast('チャレンジを越えた　<b>'+SKILLS.find(k=>k.id===id).name+'</b> が灯った');renderPanel(true);}
  if(FXQ.redraw){FXQ.redraw=0;if(curTab==='drive')renderDrive(true);}
  if(FXQ.voyage){FXQ.voyage=false;routeMode=null;}
  if(FXQ.burn){const g=FXQ.burn;FXQ.burn=null;SND.play('accel',S.stage);stk=Math.max(stk,40);paintRoute();toast('噴射　<b>+'+lyText(g.ly)+' 光年</b>');}
  if(FXQ.milestone){FXQ.milestone=false;SND.play('milestone');}   /* 画面全体のフラッシュはなくした（2026-11-06）。音と、台数の節目の表示だけ */
  if(FXQ.prestige){FXQ.prestige=false;if(!BRK){stk=60;fla=0.25;}}
  if(FXQ.region){FXQ.region=false;fla=Math.max(fla,0.12);if(curTab==='drive')renderDrive(true);}
  if(S.stage!==lastStage){lastStage=S.stage;paintSpeed();if(curTab==='drive')renderDrive(false);}
  paintHUD();rollHV();acc+=dt;if(acc>0.25){acc=0;paintGoal();if(curTab==='drive')renderDrive(false);else if(!panelHold&&curTab==='boost')renderBoost();else if(!panelHold&&curTab==='battery')renderBattery();else if(!panelHold&&curTab==='reset')renderReset();else if(!panelHold&&(curTab==='glow'||curTab==='restart'))renderGlow();else if(!panelHold&&curTab==='stars')renderUnlock();else if(!panelHold&&(curTab==='voy'||curTab==='wake'))renderVoy();}
  secAcc+=dt;if(secAcc>1){secAcc=0;checkAch();renderPanelTabsOnly();if(curTab==='stats')renderStats();if(skillOpen&&S.W!==lastWShown)renderSkill();}
  saveAcc+=dt;if(saveAcc>10){saveAcc=0;save();}
}
let HVR=null;
function rollHV(){if(!HVR)return;const h=document.getElementById('hV'),el2=Date.now()-HVR.t0;const to=HVR.to,from=Math.max(0,HVR.from);if(el2<0){h.textContent=from<=5?KMS[from].toLocaleString('ja-JP')+' km/s':stagePct(from)+'% c';return;}
  const sizeFor=t=>(t.length<=7?26:t.length<=10?21:t.length<=13?17:14)+'px';
  if(to>=13){if(!HVR.done){const prev=stagePct(to-1),fin=stagePct(to),add=fin.slice(prev.length);h.innerHTML=prev+'<span class="new9">'+add+'</span>% c';h.style.fontSize=sizeFor(fin+'% c');HVR.done=1;}if(el2>1300){paintSpeed();HVR=null;}return;}
  const p=Math.min(1,el2/900),q=eo(p);
  if(to<=5){const v=KMS[from]+(KMS[to]-KMS[from])*q;h.textContent=Math.round(v).toLocaleString('ja-JP')+' km/s';}
  else{const v0=stageBeta(from)*100,v1=stageBeta(to)*100,v=v0+(v1-v0)*q;h.textContent=(v<1?v.toFixed(2):v<10?v.toFixed(1):Math.floor(v).toString())+'% c';}
  h.style.fontSize=sizeFor(h.textContent);if(p>=1){paintSpeed();HVR=null;}}
function renderPanelTabsOnly(){paintTabs();}
function offline(){const el2=(Date.now()-(S.last||Date.now()))/1000;if(el2<30||S.cleared)return;S.st.idle+=Math.min(el2,offlineCap());if(S.flags.bat)vesAdd(Math.min(el2,offlineCap())/600*(has('eM')?3:1));const t=Math.min(el2,offlineCap());const e0=S.Erun,y0=S.years;const steps=200,mul=has('cB')?2:1;for(let k=0;k<steps;k++)tick(t/steps,mul);
  if(el2>=600)S.idleBack=true;checkStory();
  const h=Math.floor(t/3600),m=Math.floor(t%3600/60);document.getElementById('wBody').innerHTML='<div class="row"><span class="note" style="margin:0">船内で過ぎた時間</span><span class="num">'+(h?h+'時間':'')+m+'分</span></div><div class="row"><span class="note" style="margin:0">故郷で過ぎた年月</span><span class="num">'+fmtY(S.years-y0)+'年</span></div><div class="row"><span class="note" style="margin:0">集めたエネルギー</span><span class="num">'+fmt(Math.max(0,S.Erun-e0))+'</span></div>'+(el2>t?'<div class="note">放置できる上限（'+(offlineCap()/3600)+'時間）までの分を受け取る。</div>':'');
  const m2=document.getElementById('mWelcome');m2.classList.add('on');document.getElementById('wOk').onclick=()=>{m2.classList.remove('on');logLine(IDLE_LINES[Math.floor(Math.random()*IDLE_LINES.length)],-1);};}
function boot(){const had=load();initScene();resize();applyLoadedVisuals();S.region=regionIndex(S.dist);renderPanel(true);paintGoal();
  if(!had||!S.flags.start)setTimeout(prologue,700);else offline();
  addEventListener('resize',resize);new ResizeObserver(measure).observe(frameEl);
  document.addEventListener('visibilitychange',()=>{if(document.hidden){paused=true;save();}else{offline();lastT=performance.now();paused=false;}});
  addEventListener('pagehide',save);
  setInterval(loop,50);requestAnimationFrame(frame);}
boot();
// iPhone は viewport と touch-action だけではピンチの拡大を止められないため
['gesturestart','gesturechange'].forEach(t=>document.addEventListener(t,e=>e.preventDefault(),{passive:false}));
// 2本指で動かしたら拡大させない（星図だけは自前で拡大する）。PC の Ctrl＋ホイール・トラックパッドのピンチ・Ctrl＋＋／−も止める
const inMap=e=>!!(e.target&&e.target.closest&&e.target.closest('#skMap'));
document.addEventListener('touchmove',e=>{if(e.touches.length>1&&!inMap(e))e.preventDefault();},{passive:false});
document.addEventListener('wheel',e=>{if(e.ctrlKey&&!inMap(e))e.preventDefault();},{passive:false});
document.addEventListener('keydown',e=>{if((e.ctrlKey||e.metaKey)&&['+','-','=','0',';','_'].includes(e.key))e.preventDefault();});
if('serviceWorker' in navigator&&location.protocol!=='file:')navigator.serviceWorker.register('sw.js').catch(()=>{});
