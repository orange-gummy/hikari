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
  if(paused||bootOn)return;
  // 緊急停止の演出から、星図、帆を張る演出が終わるまでは、ゲームの時間を止める（航海の自動の停止も含む）
  const halted=!!BRK||!!RST||(skillOpen&&skillPick)||glowOpen||wakeOpen||pickOpen||lawOpen||endOpen;
  if(S.uOffer&&!pickOpen&&!FOLD)openPick();else if(S.flags.lawPend&&!S.uOffer&&!pickOpen&&!lawOpen&&!bootOn)openLaws();   // 法則の小窓の途中で閉じたときも開き直す   // 宇宙を畳んだあと（読み込み直したときも）、次の宇宙の時の流れを選ぶ
  if(!climax&&!halted){const steps=timeMult>=100?10:1;for(let k=0;k<steps;k++)tick(dt*timeMult/steps);checkStory();}
  if(FXQ.accel){const r=FXQ.accel;FXQ.accel=false;SND.play('accel',S.stage);for(const sg of SEG)sg.setAttribute('stroke-width','2.2');if(ACC&&ACC.t>=CH_T){ACC.t=CH_T-1;ACC.lvl=S.stage;HVR={from:S.stage-1,to:S.stage,t0:Date.now()};}else if(ACC){ACC.lvl=S.stage;HVR={from:S.stage-1,to:S.stage,t0:Date.now()+Math.max(0,(CH_T-ACC.t))*16};}else{ACC={t:0,lvl:S.stage};HVR={from:S.stage-1,to:S.stage,t0:Date.now()+1080};}const v=document.getElementById('hV'),dl=Math.max(0,(HVR?HVR.t0:Date.now())-Date.now());v.style.transition='text-shadow .25s, opacity .25s';setTimeout(()=>{v.style.textShadow='0 0 12px rgba(235,240,255,.85)';setTimeout(()=>{v.style.transition='text-shadow 1.2s';v.style.textShadow='';},450);},dl);if(r>1.05)hudPop('故郷の時間 ×'+fmtG(r));}
  if(FXQ.release){FXQ.release=false;SND.play('release');const r=FXQ.relBtn||{left:CW/2,top:CH*0.85,width:0,height:0},tg=document.getElementById('spdV').getBoundingClientRect(),sx=r.left+r.width/2,sy=r.top+r.height/2,tx=tg.left+tg.width/2,ty=tg.top+tg.height/2;FXQ.relBtn=null;
    const gc=mix([255,200,110],G,1-A[3]);for(let k=0;k<(fxLow?30:80);k++){const d=R(24,36);P.push({x:sx+R(-40,40),y:sy+R(-8,8),vx:(tx-sx)/d+R(-1.2,1.2),vy:(ty-sy)/d+R(-1.2,1.2),l:1,c:gc,r:R(1,2.4),dr:0.9/d});}
    fla=Math.max(fla,fxLow?0.05:0.14);const v=document.getElementById('spdV');setTimeout(()=>{v.style.transform='scale(1.3)';v.style.color='#ffd38a';setTimeout(()=>{v.style.transform='';v.style.color='';},900);},450);}
  if(FXQ.autoDone!=null){const i=FXQ.autoDone;FXQ.autoDone=null;toast(DEVICES[i].name+'が <b>'+S.dev[i]+'台</b> に届いた');if(curTab==='drive')renderDrive(true);}
  if(FXQ.tier!=null){const i=FXQ.tier;FXQ.tier=null;SND.play('tier',DEVICES[i].col);TIERFX={i,t:Date.now()};if(curTab==='drive')refreshTier(i);const u=devUI.find(x=>x.i===i);const sv0=u&&u.el&&u.el.querySelector('svg')?u.el.querySelector('svg').getBoundingClientRect():null;if(sv0&&sv0.width>0){const sv=sv0,c=mix(colRGB(DEVICES[i].col),G,1-A[DEVICES[i].col]);TRIP.push({x:sv.left+sv.width/2,y:sv.top+sv.height/2,t:0,c});
    u.el.dataset.sweep='1';u.el.style.background='';u.el.style.backgroundImage='linear-gradient(90deg,transparent,'+rgb(c,0.22)+',transparent)';u.el.style.backgroundSize='40% 100%';u.el.style.backgroundRepeat='no-repeat';const an=u.el.animate&&u.el.animate([{backgroundPosition:'-60% 0'},{backgroundPosition:'160% 0'}],{duration:900,easing:'ease-out'});if(an)an.onfinish=()=>{u.el.style.backgroundImage='';delete u.el.dataset.sweep;};}}
  if(FXQ.letter){toast('故郷からの便り　<b>+'+fmt(FXQ.letter)+'</b>');FXQ.letter=0;}
  if(FXQ.restart){FXQ.restart=0;if(curTab==='drive')renderDrive(true);}
  // ③：航海では緊急停止を自動で（小窓が開いている間は待つ）
  // 蓄電池：故郷で最初の1年が過ぎ、色を失う演出が終わったら開く
  if(!S.flags.bat&&S.years>=1&&S.flags.why&&!VQ.length&&!vqTimer&&!BRK&&!RST&&!climax){if(!batAt)batAt=Date.now()+4000;else if(Date.now()>batAt){S.flags.bat=1;logLine(LINES.bat,-1);SND.play('light');renderPanel(true);paintGoal();}}
  if(FXQ.autoShower){FXQ.autoShower=false;if(!document.querySelector('.modal.on,#title.on')&&!skillOpen)startShower();}
  // ④ 引き直しの記憶：航路の引き直しも自動で
  if(autoRedrawReady()&&!LIGHTFX&&!BRK&&!RST&&!climax&&!ACC&&!FOLD&&!skillOpen&&!document.querySelector('.modal.on,#title.on'))autoRedraw();
  // 航海の自動の緊急停止は 2026-11-17 になくした（歪みは走りながら入る、economy.js voyWarp()）
  if(FXQ.found){const ks=FXQ.found;FXQ.found=null;SND.play('light');fla=Math.max(fla,0.22);if(ks.includes(DEST.length-1)&&!S.flags.door4&&S.uni===0&&!S.chal)setTimeout(()=>{if(!S.flags.door4)showDoor4();},2600);ks.forEach(k=>toast('新しい色　<b style="color:'+rgb(NEW_COLORS[k].rgb,1)+'">'+NEW_COLORS[k].name+'</b>　'+DEVICES[ANCHOR+1+k].name+'が使えるようになった'));if(curTab==='drive')renderDrive(true);}
  if(FXQ.chalDone){const {id,lv}=FXQ.chalDone;FXQ.chalDone=null;SND.play('light');fla=Math.max(fla,0.22);toast(lv===1?'チャレンジを越えた　<b>'+SKILLS.find(k=>k.id===id).name+'</b> が灯った':'「'+CHAL[id].name+'」段'+lv+'を越えた　<b>'+SKILLS.find(k=>k.id===id).name+'</b> が強くなった');renderPanel(true);}
  if(FXQ.voyBack){FXQ.voyBack=false;applyLoadedVisuals();renderPanel(true);paintGoal();toast('預けていた航海に戻った');}
  if(FXQ.fork){FXQ.fork=false;SND.play('milestone');}paintFork();
  if(FXQ.route){const c=FXQ.route;FXQ.route=null;const o=FORKS.find(x=>x.id===c);logLine(FORK_LINES[c],-1);toast('宙域 '+S.route.n+'　<b>'+o.name+'</b>　'+forkText(c));if(curTab==='voy')renderPanel(true);}   // 航路図：新しい宙域に入った
  if(FXQ.redraw){FXQ.redraw=0;if(curTab==='drive')renderDrive(true);}
  if(FXQ.voyage){FXQ.voyage=false;routeMode=null;}
  if(FXQ.milestone){FXQ.milestone=false;SND.play('milestone');}   /* 画面全体のフラッシュはなくした（2026-11-06）。音と、台数の節目の表示だけ */
  if(FXQ.prestige){FXQ.prestige=false;if(!BRK){stk=60;fla=0.25;}}
  if(FXQ.region){FXQ.region=false;fla=Math.max(fla,0.12);if(curTab==='drive')renderDrive(true);}
  if(S.stage!==lastStage){lastStage=S.stage;paintSpeed();if(curTab==='drive')renderDrive(false);}
  {const want=musOn&&sndVol>0&&!bootOn&&!climax&&!LIGHTFX&&!document.hidden;if(want&&!SND.mus)SND.musicStart();else if(!want&&SND.mus)SND.musicStop();}   // 音楽：到着と光になる場面では止める
  paintHUD();rollHV();if(curTab==='photon'||curTab==='sail')paintPhoton();acc+=dt;hushTick();if(acc>0.25){acc=0;paintGoal();paintHG();paintUniView();if(curTab==='drive')renderDrive(false);else if(!panelHold&&curTab==='boost')renderBoost();else if(!panelHold&&curTab==='battery')renderBattery();else if(!panelHold&&curTab==='reset')renderReset();else if(!panelHold&&(curTab==='glow'||curTab==='restart'))renderGlow();else if(!panelHold&&curTab==='stars')renderUnlock();else if(!panelHold&&(curTab==='voy'||curTab==='wake'))renderVoy();}
  secAcc+=dt;if(secAcc>1){sigTick(secAcc);secAcc=0;telTick();checkAch();if(S.voy&&!S.chal&&S.autoGlow!==false&&glowAffordable())glowAutoSpend();   // GALAXY では残光の強化は自動（2026-11-17）
renderPanelTabsOnly();if(curTab==='stats')renderStats();if(skillOpen&&S.W!==lastWShown)renderSkill();}
  saveAcc+=dt;if(saveAcc>10){saveAcc=0;save();}
}
let HVR=null;
function rollHV(){if(!HVR)return;const h=document.getElementById('hV'),el2=Date.now()-HVR.t0;const to=HVR.to,from=Math.max(0,HVR.from);if(el2<0){if(from>=13&&nines(from)>=DOT9)return;h.textContent=from<=5?KMS[from].toLocaleString('ja-JP')+' km/s':stagePct(from)+'% c';return;}
  if(to>=13&&nines(to)>=DOT9){if(!HVR.done){paintSpeed();const n=h.querySelector('.hv9n');if(n)n.classList.add('hv9in');HVR.done=1;}if(el2>1300)HVR=null;return;}   // 点の表示では、増えた点がふっと灯る
  if(to>=13){if(!HVR.done){const prev=stagePct(to-1),fin=stagePct(to),add=fin.slice(prev.length);h.innerHTML=prev+'<span class="new9">'+add+'</span>%\u00a0c';hvSize(h,fin+'% c');HVR.done=1;}if(el2>1300){paintSpeed();HVR=null;}return;}
  const p=Math.min(1,el2/900),q=eo(p);
  if(to<=5){const v=KMS[from]+(KMS[to]-KMS[from])*q;h.textContent=Math.round(v).toLocaleString('ja-JP')+' km/s';}
  else{const v0=stageBeta(from)*100,v1=stageBeta(to)*100,v=v0+(v1-v0)*q;h.textContent=(v<1?v.toFixed(2):v<10?v.toFixed(1):Math.floor(v).toString())+'% c';}
  hvSize(h,h.textContent);   // 2026-11-18 まで消した sizeFor を呼んでいて、9が12個までの加速のたびに毎コマ止まっていた
  if(p>=1){paintSpeed();HVR=null;}}
function renderPanelTabsOnly(){paintTabs();}
function offline(){windMigrate();const el2=(Date.now()-(S.last||Date.now()))/1000;if(el2<30||S.cleared)return;S.st.idle+=Math.min(el2,offlineCap());if(S.flags.bat)vesAdd(Math.min(el2,offlineCap())/600);const t=Math.min(el2,offlineCap());const e0=S.Erun,y0=S.years,w0=S.windT||0;const steps=200,mul=has('cB')?2:1;for(let k=0;k<steps;k++)tick(t/steps,mul);
  if(el2>=600)S.idleBack=true;if(el2>=3*86400)S.flags.hAway=1;welcomeOn=true;checkStory();
  // 2026-11-19「おかえり」は枠のない全面の画面に。眠っていた間の星の軌跡（弧の長さ＝留守の時間、24時間でほぼひと回り）が伸び、数字が下から出る（試作 B）
  const h=Math.floor(t/3600),m=Math.floor(t%3600/60),eg=Math.max(0,S.Erun-e0),row=(a,b)=>'<div class="wR"><span>'+a+'</span><b>'+b+'</b></div>';
  document.getElementById('wLine').textContent=el2<3600?'少しのあいだ、目を閉じていた。':el2<6*3600?'眠っている間に、星が少し動いた。':el2<20*3600?'眠っている間に、星が大きく回った。':el2<30*3600?'眠っている間に、星がひと回りした。':'星が、何度も回った。';
  {const lt=welcomeLetter(el2);if(lt)document.getElementById('wLine').insertAdjacentHTML('beforeend','<span class="wMail">便り　'+lt+'</span>');}   // 12通目の便り（隠し要素）
  document.getElementById('wBody').innerHTML=row('眠っていた時間',(h?h+'<small>時間</small>':'')+m+'<small>分</small>')+row('故郷で過ぎた年月',fmtY(S.years-y0)+'<small>年</small>')+row('集めたエネルギー','<span id="wE">0</span>')+((S.windT||0)>w0?row('追い風 ×'+WIND_X,'<small>あと</small>'+windMin()+'<small>分</small>'):'');
  document.getElementById('wNote').textContent=el2>t?'放置できる上限（'+(offlineCap()/3600)+'時間）までの分を受け取る':'';
  {let v='',sd=11;const rnd=()=>{sd=(sd*16807)%2147483647;return sd/2147483647;},span=Math.max(0.25,Math.min(6.1,el2/86400*6.283)),cx=120,cy=120;
    for(let k=0;k<38;k++){const rad=10+rnd()*100,a0=rnd()*6.283,a1=a0+span,al=(0.12+rnd()*0.42).toFixed(2),c=['255,236,210','200,215,255','236,238,242'][k%3],x0=cx+Math.cos(a0)*rad,y0=cy+Math.sin(a0)*rad,x1=cx+Math.cos(a1)*rad,y1=cy+Math.sin(a1)*rad;
      v+='<path class="wTr" style="animation-delay:'+(rnd()*0.4).toFixed(2)+'s" pathLength="1" d="M'+x0.toFixed(1)+' '+y0.toFixed(1)+'A'+rad.toFixed(1)+' '+rad.toFixed(1)+' 0 '+(span>Math.PI?1:0)+' 1 '+x1.toFixed(1)+' '+y1.toFixed(1)+'" fill="none" stroke="rgba('+c+','+al+')" stroke-width="'+(0.4+rnd()*0.5).toFixed(2)+'" stroke-linecap="round"/><circle class="wSt" cx="'+x1.toFixed(1)+'" cy="'+y1.toFixed(1)+'" r="'+(0.8+rnd()*0.6).toFixed(2)+'" fill="rgba('+c+','+Math.min(1,+al+0.35).toFixed(2)+')"/>';}
    document.getElementById('wTrail').innerHTML=v+'<circle cx="120" cy="120" r="2" fill="#fff4e6"/>';}
  {const el=document.getElementById('wE'),t0=performance.now()+1200;const run=now=>{const p=Math.max(0,Math.min(1,(now-t0)/1200)),q=1-Math.pow(1-p,3);el.textContent=fmt(eg*q);if(p<1)requestAnimationFrame(run);};requestAnimationFrame(run);}   // 数えながら増える
  const m2=document.getElementById('mWelcome');m2.classList.add('on');document.getElementById('wOk').onclick=()=>{m2.classList.remove('on');welcomeOn=false;checkStory();logLine(IDLE_LINES[Math.floor(Math.random()*IDLE_LINES.length)],-1);};}
/* 起動時のタイトル（2026-11-15）：開くたびに出る。暗い宇宙に船の丸い窓が浮かび、中を星が流れる。
   窓の中の7色の星座は、まだ持っている色だけが灯る。出ている間はゲームの時間を進めず、入ったときに留守の分を受け取る */
let bootOn=false;
function bootStatus(){const loop='<i>·</i>'+(S.restarts+1)+' 周目';if(S.voy){const d=nextDest();return (d?d.name+'まで あと '+lyText(Math.max(0,d.ly-S.vdist))+' 光年':'宇宙の果ての先へ '+lyText(S.vdist)+' 光年')+'<i>·</i>宇宙 '+roman(S.uni+1);}
  if(S.cleared)return '故郷に着いている。'+loop;let lost=0;for(let i=0;i<7;i++)if(!memHas(i))lost++;
  return REGIONS[regionIndex(S.dist)].name+'<i>·</i>故郷まで '+Math.max(0,Math.ceil(GOAL_LY-S.dist)).toLocaleString('ja-JP')+' 光年'+(lost?'<i>·</i>失った色 '+lost:'')+loop;}
function paintBoot(){const W=innerWidth,H=vpH(),ch=H<560?0:Math.round(Math.max(120,H*0.19)),cy0=H-ch,cxp=W/2,BODY=230,TOP=60,r=Math.round(Math.max(60,Math.min(W*0.3,H*0.17,170,((cy0||H)-24-BODY-TOP-50)/2))),cyp=Math.round(Math.max(TOP+r+20,Math.min(H*(ch?0.30:0.36),(cy0||H)-24-BODY-r-30)));   // 題名とボタンが計器盤にかからないよう、輪の大きさと位置を決める
  let sd=23;const rnd=()=>{sd=(sd*16807)%2147483647;return sd/2147483647;},f=n=>n.toFixed(1),on=COLORS.map((_,i)=>memHas(i)),ink=a=>'rgba(236,238,242,'+a+')';
  let v='<svg width="'+W+'" height="'+H+'" viewBox="0 0 '+W+' '+H+'" aria-hidden="true"><defs>'+
    '<linearGradient id="bTail" x1="1" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff" stop-opacity="0"/><stop offset="1" stop-color="#fff" stop-opacity=".9"/></linearGradient>'+
    '<filter id="bBlur" filterUnits="userSpaceOnUse" x="0" y="0" width="'+W+'" height="'+H+'"><feGaussianBlur stdDeviation="7"/></filter>'+
    '<radialGradient id="bBloom"><stop offset="0" stop-color="rgb(150,170,255)" stop-opacity=".22"/><stop offset=".6" stop-color="rgb(150,170,255)" stop-opacity=".06"/><stop offset="1" stop-color="rgb(150,170,255)" stop-opacity="0"/></radialGradient>'+
    '<radialGradient id="bCore"><stop offset="0" stop-color="#fff" stop-opacity=".85"/><stop offset=".18" stop-color="rgb(225,232,255)" stop-opacity=".35"/><stop offset="1" stop-color="rgb(200,215,255)" stop-opacity="0"/></radialGradient>'+
    '<linearGradient id="bFlare" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#fff" stop-opacity="0"/><stop offset=".5" stop-color="#fff" stop-opacity=".85"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></linearGradient>'+
    '<linearGradient id="bFlareV" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff" stop-opacity="0"/><stop offset=".5" stop-color="#fff" stop-opacity=".6"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></linearGradient>'+
    '<linearGradient id="bScanG" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#dfe6ff" stop-opacity="0"/><stop offset=".7" stop-color="#dfe6ff" stop-opacity=".35"/><stop offset="1" stop-color="#dfe6ff" stop-opacity="0"/></linearGradient>'+
    '<radialGradient id="bHome"><stop offset="0" stop-color="rgb(255,214,170)" stop-opacity=".7"/><stop offset="1" stop-color="rgb(255,214,170)" stop-opacity="0"/></radialGradient>'+
    '<radialGradient id="bGrey"><stop offset="0" stop-color="rgb(130,134,146)" stop-opacity=".5"/><stop offset="1" stop-color="rgb(130,134,146)" stop-opacity="0"/></radialGradient>'+
    COLORS.map((c,i)=>'<radialGradient id="bC'+i+'"><stop offset="0" stop-color="rgb('+c.rgb.join(',')+')" stop-opacity=".55"/><stop offset="1" stop-color="rgb('+c.rgb.join(',')+')" stop-opacity="0"/></radialGradient>').join('')+'</defs>';
  // 空に漂う星雲：持っている色は色のまま、失った色は灰色に
  const NB=[[0.16,0.20,0],[0.84,0.14,4],[0.10,0.62,1],[0.90,0.56,2],[0.50,0.08,3],[0.34,0.74,5]];
  NB.forEach(([nx,ny,ci],k)=>{const rr=Math.max(W,H)*(0.16+0.05*(k%3));v+='<ellipse class="bNeb" style="animation-delay:-'+(k*4)+'s" cx="'+f(nx*W)+'" cy="'+f(ny*(cy0||H))+'" rx="'+f(rr)+'" ry="'+f(rr*0.62)+'" fill="url(#'+(on[ci]?'bC'+ci:'bGrey')+')" opacity="'+(on[ci]?0.16:0.10)+'"/>';});
  // 星：窓の向こうを、進む先（輪の中心）から外へ流れる。速いほど速い。故郷に着いているときは止まっている
  const base=S.cleared?0:16-11*Math.min(1,S.stage/22),far=Math.hypot(W,H)*0.62,ns=Math.round(Math.min(220,W*H/5200));
  for(let k=0;k<ns;k++){const a=rnd()*6.283,q0=0.03+rnd()*0.25,sz=(0.4+rnd()*0.9).toFixed(2),x0=cxp+Math.cos(a)*far*q0,y0=cyp+Math.sin(a)*far*q0,x1=cxp+Math.cos(a)*far*1.05,y1=cyp+Math.sin(a)*far*1.05;
    if(!base){const q=0.05+rnd()*0.95;v+='<circle'+(rnd()<0.3?' class="gTw" style="animation-delay:-'+f(rnd()*5)+'s"':'')+' cx="'+f(cxp+Math.cos(a)*far*q)+'" cy="'+f(cyp+Math.sin(a)*far*q)+'" r="'+sz+'" fill="#eceef2" opacity="'+(0.25+rnd()*0.55).toFixed(2)+'"/>';continue;}
    const dur=(base*(0.7+rnd()*1.1)).toFixed(1),at=' dur="'+dur+'s" begin="-'+(rnd()*base*2).toFixed(1)+'s" repeatCount="indefinite"';
    v+='<circle r="'+sz+'" fill="#eceef2"><animate attributeName="cx" from="'+f(x0)+'" to="'+f(x1)+'"'+at+' calcMode="spline" keyTimes="0;1" keySplines=".7 0 1 .5"/><animate attributeName="cy" from="'+f(y0)+'" to="'+f(y1)+'"'+at+' calcMode="spline" keyTimes="0;1" keySplines=".7 0 1 .5"/><animate attributeName="opacity" values="0;.3;.95"'+at+'/></circle>';}
  v+='<g class="bShoot"><line x1="'+f(W*0.78)+'" y1="'+f(H*0.10)+'" x2="'+f(W*0.78-70)+'" y2="'+f(H*0.10+38)+'" stroke="url(#bTail)" stroke-width="1.2"/></g>';
  // 光の筋：速いほど、星が進む先から長く尾を引く
  if(base){const sf=0.35+0.65*Math.min(1,S.stage/22),nl=Math.round(Math.min(150,W*H/7000));
    for(let k=0;k<nl;k++){const a=rnd()*6.283,d0=r*1.2+Math.pow(rnd(),0.8)*(far-r*1.2),len=(5+d0/far*90)*sf*(0.5+rnd()),c=Math.cos(a),sn=Math.sin(a);
      v+='<line'+(rnd()<0.4?' class="gTw" style="animation-delay:-'+f(rnd()*5)+'s"':'')+' x1="'+f(cxp+c*d0)+'" y1="'+f(cyp+sn*d0)+'" x2="'+f(cxp+c*(d0+len))+'" y2="'+f(cyp+sn*(d0+len))+'" stroke="#dfe6ff" stroke-opacity="'+(0.10+0.32*rnd()*(d0/far)).toFixed(2)+'" stroke-width="'+(0.5+rnd()*0.7).toFixed(2)+'" stroke-linecap="round"/>';}}
  const base2=cy0||H;
  // 奥行きの目盛り：進む先から放射状にのびる細い線と、同心の輪
  for(let k=0;k<24;k++){const a=k*Math.PI/12+0.13;v+='<line x1="'+f(cxp+Math.cos(a)*r*1.5)+'" y1="'+f(cyp+Math.sin(a)*r*1.5)+'" x2="'+f(cxp+Math.cos(a)*far)+'" y2="'+f(cyp+Math.sin(a)*far)+'" stroke="'+ink(0.045)+'" stroke-width=".6"/>';}
  [1.75,2.5,3.6,5.2].forEach((m,k)=>{v+='<circle cx="'+cxp+'" cy="'+cyp+'" r="'+f(r*m)+'" fill="none" stroke="'+ink(0.07-k*0.01)+'" stroke-width=".6" stroke-dasharray="'+(k%2?'1 7':'2 10')+'"/>';});
  // 遠くの渦巻き銀河と、空の隅の7色の星座（記憶の星座。持っている色だけが灯る）
  {const gx=W*0.85,gy=base2*0.66,gr=Math.max(22,Math.min(W,H)*0.045);for(let k=0;k<70;k++){const arm=k%2,t=rnd(),a=arm*Math.PI+t*4.4+0.6,rr=t*gr;v+='<circle cx="'+f(gx+Math.cos(a)*rr+(rnd()-0.5)*gr*0.16)+'" cy="'+f(gy+Math.sin(a)*rr*0.5+(rnd()-0.5)*gr*0.12)+'" r="'+(0.35+rnd()*0.55).toFixed(2)+'" fill="#dfe4ff" opacity="'+((0.2+rnd()*0.5)*(1-t*0.5)).toFixed(2)+'"/>';}
    v+='<circle cx="'+f(gx)+'" cy="'+f(gy)+'" r="'+f(gr*0.3)+'" fill="url(#bCore)" opacity=".5"/>';
    const cs=Math.max(0.7,Math.min(1.1,W/520)),ox=Math.max(18,W*0.05),oy=Math.max(40,base2*0.07),Q=CONS_PTS.map(p=>[ox+p[0]*cs,oy+p[1]*cs]);
    for(let i=0;i<6;i++){const b=on[i]&&on[i+1];v+='<line x1="'+f(Q[i][0])+'" y1="'+f(Q[i][1])+'" x2="'+f(Q[i+1][0])+'" y2="'+f(Q[i+1][1])+'" stroke="'+ink(b?0.4:0.12)+'" stroke-width=".6"'+(b?'':' stroke-dasharray="1.5 3"')+'/>';}
    Q.forEach(([x,y],i)=>{v+=on[i]?'<circle cx="'+f(x)+'" cy="'+f(y)+'" r="7" fill="url(#bC'+i+')"/><circle class="bStar" style="animation-delay:-'+(i*0.7)+'s" cx="'+f(x)+'" cy="'+f(y)+'" r="1.8" fill="rgb('+COLORS[i].rgb.join(',')+')"/>':'<circle cx="'+f(x)+'" cy="'+f(y)+'" r="1.6" fill="none" stroke="'+ink(0.28)+'" stroke-width=".6"/>';});}
  // 進む先の光と、それを囲む7色の輪（光速に近づくと星の光が前に集まって虹の輪になる）。持っている色だけが灯る
  const arc=(i,rad)=>{const a0=(-90+i*360/7+3)*Math.PI/180,a1=(-90+(i+1)*360/7-3)*Math.PI/180;return 'M'+f(cxp+Math.cos(a0)*rad)+' '+f(cyp+Math.sin(a0)*rad)+'A'+rad+' '+rad+' 0 0 1 '+f(cxp+Math.cos(a1)*rad)+' '+f(cyp+Math.sin(a1)*rad);};
  v+='<circle cx="'+cxp+'" cy="'+cyp+'" r="'+f(r*1.45)+'" fill="url(#bBloom)" opacity=".5"/>';
  for(let i=0;i<7;i++){const col='rgb('+COLORS[i].rgb.join(',')+')';
    v+=on[i]?'<path d="'+arc(i,r)+'" fill="none" stroke="'+col+'" stroke-width="'+f(Math.max(10,r*0.11))+'" stroke-linecap="round" opacity=".28" filter="url(#bBlur)"/><path class="bStar" style="animation-delay:-'+(i*0.7)+'s" d="'+arc(i,r)+'" fill="none" stroke="'+col+'" stroke-width="1.6" stroke-linecap="round"/>'
      :'<path d="'+arc(i,r)+'" fill="none" stroke="'+ink(0.22)+'" stroke-width=".8" stroke-dasharray="1.5 5"/>';}
  v+='<circle cx="'+cxp+'" cy="'+cyp+'" r="'+f(r*0.86)+'" fill="none" stroke="'+ink(0.12)+'" stroke-width=".6"/>';
  v+='<g class="bTickRing" style="transform-origin:'+cxp+'px '+cyp+'px">';   // 色の輪の外の目盛りは、ゆっくり回る
  for(let k=0;k<72;k++){const a=k*Math.PI/36,l=k%6?4:9;v+='<line x1="'+f(cxp+Math.cos(a)*(r+12))+'" y1="'+f(cyp+Math.sin(a)*(r+12))+'" x2="'+f(cxp+Math.cos(a)*(r+12+l))+'" y2="'+f(cyp+Math.sin(a)*(r+12+l))+'" stroke="'+ink(k%6?0.16:0.34)+'" stroke-width=".6"/>';}
  v+='</g>';
  {const rp=r,cp='M'+f(cxp)+' '+f(cyp-rp)+'A'+rp+' '+rp+' 0 1 1 '+f(cxp-0.01)+' '+f(cyp-rp)+'Z';   // 7色の輪を、光がひとつ回る
    for(let k=0;k<5;k++)v+='<circle r="'+(2.6-k*0.45).toFixed(2)+'" fill="#fff" opacity="'+(0.95-k*0.18).toFixed(2)+'"><animateMotion dur="7s" begin="-'+(k*0.06).toFixed(2)+'s" repeatCount="indefinite" path="'+cp+'"/></circle>';
    v+='<g class="bScan" style="transform-origin:'+cxp+'px '+cyp+'px"><line x1="'+cxp+'" y1="'+cyp+'" x2="'+f(cxp+r*1.55)+'" y2="'+cyp+'" stroke="url(#bScanG)" stroke-width="1"/></g>';}
  v+='<circle cx="'+cxp+'" cy="'+cyp+'" r="'+f(r*0.5)+'" fill="url(#bCore)" class="bBreath" style="transform-origin:'+cxp+'px '+cyp+'px"/>'+
    '<rect x="'+f(cxp-r*1.7)+'" y="'+f(cyp-0.6)+'" width="'+f(r*3.4)+'" height="1.2" fill="url(#bFlare)"/><rect x="'+f(cxp-0.5)+'" y="'+f(cyp-r*0.55)+'" width="1" height="'+f(r*1.1)+'" fill="url(#bFlareV)"/>'+
    '<circle cx="'+cxp+'" cy="'+cyp+'" r="2.6" fill="#fff"/>';
  // 輪の細部：ゆっくり回る外の輪と逆に回る内の弧、9の数の点、四方の印
  const org='style="transform-origin:'+cxp+'px '+cyp+'px"';
  v+='<g class="bRotA" '+org+'><circle cx="'+cxp+'" cy="'+cyp+'" r="'+f(r+30)+'" fill="none" stroke="'+ink(0.2)+'" stroke-width=".7" stroke-dasharray="'+f((r+30)*0.5)+' '+f((r+30)*0.18)+' 2 '+f((r+30)*0.1)+'"/><circle cx="'+f(cxp+r+30)+'" cy="'+cyp+'" r="2" fill="'+ink(0.7)+'"/></g>'+
    '<g class="bRotB" '+org+'><circle cx="'+cxp+'" cy="'+cyp+'" r="'+f(r*0.78)+'" fill="none" stroke="'+ink(0.22)+'" stroke-width=".7" stroke-dasharray="'+f(r*0.78*0.9)+' '+f(r*0.78*1.19)+'"/><circle cx="'+cxp+'" cy="'+cyp+'" r="'+f(r*0.64)+'" fill="none" stroke="'+ink(0.1)+'" stroke-width=".6" stroke-dasharray="1 6"/></g>';
  {const n9=nines(S.stage),tot=22,rp=r*0.92;for(let k=0;k<tot;k++){const a=-Math.PI/2+(k+0.5)*2*Math.PI/tot,lit=k<n9;v+='<circle cx="'+f(cxp+Math.cos(a)*rp)+'" cy="'+f(cyp+Math.sin(a)*rp)+'" r="'+(lit?1.5:0.8)+'" fill="'+(lit?'#fff':ink(0.25))+'"/>';}
    if(n9)v+='<text x="'+cxp+'" y="'+f(cyp+r*0.46)+'" text-anchor="middle" font-size="'+f(Math.max(9,r*0.085))+'" letter-spacing="2" fill="'+ink(0.55)+'" font-family="Jura,sans-serif">9 × '+n9+'</text>';}
  for(let k=0;k<4;k++){const a=k*Math.PI/2+Math.PI/4,d=r+46,c=Math.cos(a),sn=Math.sin(a),px2=cxp+c*d,py2=cyp+sn*d,tx=-sn*9,ty=c*9;v+='<path d="M'+f(px2+tx)+' '+f(py2+ty)+'L'+f(px2)+' '+f(py2)+'L'+f(px2-tx)+' '+f(py2-ty)+'" fill="none" stroke="'+ink(0.3)+'" stroke-width=".7" transform="rotate(0)"/>';}
  // 船の中：窓の枠の柱と、手前の計器盤
  const st=(x,dx)=>'<path d="M'+f(cxp+dx*0.2)+' -10Q'+f(x)+' '+f(base2*0.3)+' '+f(x-dx*0.04)+' '+base2+'" fill="none" stroke="'+ink(0.2)+'" stroke-width="1"/><path d="M'+f(cxp+dx*0.2+dx*0.03)+' -10Q'+f(x+dx*0.035)+' '+f(base2*0.3)+' '+f(x-dx*0.005)+' '+base2+'" fill="none" stroke="'+ink(0.09)+'" stroke-width=".7"/>';
  v+=st(W*0.07,-W)+st(W*0.93,W)+'<path d="M'+f(W*0.02)+' '+f(base2*0.08)+'Q'+cxp+' '+f(-base2*0.05)+' '+f(W*0.98)+' '+f(base2*0.08)+'" fill="none" stroke="'+ink(0.12)+'" stroke-width=".8"/>';
  if(ch){v+='<rect x="0" y="'+cy0+'" width="'+W+'" height="'+ch+'" fill="#05060e"/><line x1="0" y1="'+cy0+'" x2="'+W+'" y2="'+cy0+'" stroke="'+ink(0.38)+'" stroke-width=".8"/><line x1="0" y1="'+(cy0+5)+'" x2="'+W+'" y2="'+(cy0+5)+'" stroke="'+ink(0.1)+'" stroke-width=".6"/>';
    for(let x=14;x<W;x+=46)v+='<circle cx="'+x+'" cy="'+(cy0+12)+'" r=".9" fill="'+ink(0.3)+'"/>';
    // 航路の計器：遠い宙域から故郷まで（航海中は故郷から宇宙の果てまで）。区域の節目と、いまの船
    const x0=Math.max(34,W*0.14),x1=W-x0,ry=cy0+ch*0.52,lg=d=>Math.log10(1+d),px=p=>x0+(x1-x0)*Math.max(0,Math.min(1,p));
    const nR=REGIONS.length,rp=d=>{const i=regionIndex(d),a=REGIONS[i].from,b=i+1<nR?REGIONS[i+1].from:GOAL_LY;return (i+Math.min(1,(d-a)/(b-a)))/nR;};   // 区域ごとに同じ幅（区域の中は距離に比例）
    const marks=S.voy?DEST.map(d=>[lg(d.ly)/lg(DEST[DEST.length-1].ly),d.name]):REGIONS.slice(1).map((g,i)=>[(i+1)/nR,g.name]),p=S.voy?lg(S.vdist)/lg(DEST[DEST.length-1].ly):S.cleared?1:rp(S.dist);
    v+='<line x1="'+f(x0)+'" y1="'+f(ry)+'" x2="'+f(x1)+'" y2="'+f(ry)+'" stroke="'+ink(0.22)+'" stroke-width=".8" stroke-dasharray="1.5 4"/><line x1="'+f(x0)+'" y1="'+f(ry)+'" x2="'+f(px(p))+'" y2="'+f(ry)+'" stroke="'+ink(0.7)+'" stroke-width="1"/>';
    marks.forEach(([m])=>{if(m<0.999)v+='<line x1="'+f(px(m))+'" y1="'+f(ry-4)+'" x2="'+f(px(m))+'" y2="'+f(ry+4)+'" stroke="'+ink(m<=p?0.6:0.25)+'" stroke-width=".7"/>';});
    v+='<circle cx="'+f(x0)+'" cy="'+f(ry)+'" r="1.6" fill="'+ink(0.6)+'"/><circle cx="'+f(x1)+'" cy="'+f(ry)+'" r="13" fill="url(#bHome)" class="bStar"/><circle cx="'+f(x1)+'" cy="'+f(ry)+'" r="2.2" fill="rgb(255,226,190)"/>'+
      '<path d="M'+f(px(p)-5)+' '+f(ry-4.5)+'L'+f(px(p)+5)+' '+f(ry)+'L'+f(px(p)-5)+' '+f(ry+4.5)+'Z" fill="#04050C" stroke="#f6f7fb" stroke-width=".9"/>'+
      '<text x="'+f(x0)+'" y="'+f(ry+22)+'" text-anchor="middle" font-size="10" fill="'+ink(0.4)+'">'+(S.voy?'故郷':'遠い宙域')+'</text><text x="'+f(x1)+'" y="'+f(ry+22)+'" text-anchor="middle" font-size="10" fill="rgba(255,226,190,.7)">'+(S.voy?'宇宙の果て':'故郷')+'</text>';
    v+='<text x="'+f(x0)+'" y="'+f(ry-16)+'" font-size="9" letter-spacing="1.5" fill="'+ink(0.38)+'" font-family="Michroma,Jura,sans-serif">VELOCITY</text><text x="'+f(x0)+'" y="'+f(ry-29)+'" font-size="13" fill="'+ink(0.85)+'" font-family="Jura,sans-serif">'+speedText(S.stage)+'</text>'+
      '<text x="'+f(x1)+'" y="'+f(ry-16)+'" text-anchor="end" font-size="9" letter-spacing="1.5" fill="'+ink(0.38)+'" font-family="Michroma,Jura,sans-serif">HOME</text><text x="'+f(x1)+'" y="'+f(ry-29)+'" text-anchor="end" font-size="13" fill="'+ink(0.85)+'" font-family="Jura,sans-serif">'+Math.floor(S.years).toLocaleString('ja-JP')+' 年</text>';
    // 計器盤の細部：7色の表示灯、装置の台数の棒、区域と周回の読み取り、左右の柱の目盛り
    {const ly=cy0+13,sp2=Math.min(22,(x1-x0)*0.06),lx=cxp-sp2*3;v+='<line x1="'+f(lx-10)+'" y1="'+ly+'" x2="'+f(lx+sp2*6+10)+'" y2="'+ly+'" stroke="'+ink(0.12)+'" stroke-width=".6"/>';
      for(let i=0;i<7;i++)v+=on[i]?'<circle cx="'+f(lx+i*sp2)+'" cy="'+ly+'" r="6" fill="url(#bC'+i+')"/><circle cx="'+f(lx+i*sp2)+'" cy="'+ly+'" r="2" fill="rgb('+COLORS[i].rgb.join(',')+')"/>':'<circle cx="'+f(lx+i*sp2)+'" cy="'+ly+'" r="2" fill="#05060e" stroke="'+ink(0.3)+'" stroke-width=".6"/>';
      const by=Math.min(H-10,ry+44),bx=cxp-8*4.5+2;for(let i=0;i<8;i++){const hh=Math.min(20,Math.log10(1+(S.dev[i]||0))*7);v+='<line x1="'+f(bx+i*9)+'" y1="'+f(by)+'" x2="'+f(bx+i*9)+'" y2="'+f(by-20)+'" stroke="'+ink(0.1)+'" stroke-width="3"/>'+(hh>0.5?'<line class="bBar" style="animation-delay:-'+(i*0.4)+'s" x1="'+f(bx+i*9)+'" y1="'+f(by)+'" x2="'+f(bx+i*9)+'" y2="'+f(by-hh)+'" stroke="'+ink(0.7)+'" stroke-width="3"/>':'');}
      const lab=(x,anc,a,b)=>'<text x="'+f(x)+'" y="'+f(cy0-24)+'" text-anchor="'+anc+'" font-size="8.5" letter-spacing="1.5" fill="'+ink(0.34)+'" font-family="Michroma,Jura,sans-serif">'+a+'</text><text x="'+f(x)+'" y="'+f(cy0-10)+'" text-anchor="'+anc+'" font-size="11" fill="'+ink(0.7)+'">'+b+'</text>';
      // REGION と LOOP は題名の下の一行に移した（2026-11-16、文字が重なるため）
      [[W*0.045,Math.min(1,S.stage/22)],[W*0.955,Math.min(1,p)]].forEach(([tx,val],k)=>{const t0=cy0*0.42,t1=cy0-44,n=16,sp=(t1-t0)/n;
        v+='<clipPath id="bTk'+k+'"><rect x="'+f(tx-12)+'" y="'+f(t0-1)+'" width="24" height="'+f(t1-t0+2)+'"/></clipPath><g clip-path="url(#bTk'+k+')"><g class="bTicks" style="--tk:'+f(sp*4)+'px;animation-direction:'+(k?'reverse':'normal')+'">';
        for(let j=-4;j<=n;j++){const y=t0+sp*j,l=((j%4)+4)%4?3:7;v+='<line x1="'+f(tx-(k?l:0))+'" y1="'+f(y)+'" x2="'+f(tx+(k?0:l))+'" y2="'+f(y)+'" stroke="'+ink(((j%4)+4)%4?0.18:0.36)+'" stroke-width=".6"/>';}
        v+='</g></g>';
        const py=t1-(t1-t0)*val,d=k?-1:1;v+='<path d="M'+f(tx+d*10)+' '+f(py)+'l'+(d*7)+' -4v8z" fill="'+ink(0.85)+'"/>';});}
    // 小さな計器：速度の段階の針
    const gx=Math.max(20,x0*0.45),gy=cy0+ch*0.52,gr=Math.min(13,x0*0.3),ga=Math.PI*(1-Math.min(1,S.stage/22));
    [gx,W-gx].forEach((g,k)=>{const an=k?Math.PI*(1-Math.min(1,p)):ga;v+='<g class="bDial" style="transform-origin:'+f(g)+'px '+f(gy)+'px"><circle cx="'+f(g)+'" cy="'+f(gy)+'" r="'+f(gr*0.55)+'" fill="none" stroke="'+ink(0.25)+'" stroke-width=".6" stroke-dasharray="1 2.2"/></g><path d="M'+f(g-gr)+' '+f(gy)+'A'+gr+' '+gr+' 0 0 1 '+f(g+gr)+' '+f(gy)+'" fill="none" stroke="'+ink(0.3)+'" stroke-width=".7"/><line class="bNeedle" style="transform-origin:'+f(g)+'px '+f(gy)+'px;animation-delay:-'+k*1.3+'s" x1="'+f(g)+'" y1="'+f(gy)+'" x2="'+f(g+Math.cos(an)*gr*0.8)+'" y2="'+f(gy-Math.sin(an)*gr*0.8)+'" stroke="'+ink(0.75)+'" stroke-width=".8"/><circle cx="'+f(g)+'" cy="'+f(gy)+'" r="1" fill="'+ink(0.7)+'"/>';});}
  v+='</svg>';
  document.getElementById('bSky').innerHTML=v;document.getElementById('bBody').style.top=(cyp+r+30)+'px';
  document.getElementById('bStat').innerHTML=bootStatus();document.getElementById('bGo').textContent=S.flags.start?'船に戻る':'船を出す';}
function showBoot(){bootOn=true;paintBoot();document.getElementById('boot').classList.add('on');}
// 入る：留守の分を受け取る（はじめてなら最初の3行）。quiet＝設定から確認用の場面に移るとき
function bootGo(quiet){if(!bootOn)return;bootOn=false;const b=document.getElementById('boot');b.classList.add('out');setTimeout(()=>{b.classList.remove('on','out');document.getElementById('bSky').innerHTML='';},900);
  lastT=performance.now();if(quiet)return;SND.play('resail');if(!S.flags.start)setTimeout(prologue,900);else offline();if(!S.voy&&canVoyage())setTimeout(showDoor,900);}   // 星8つで着いたままなら、章の扉へ
document.getElementById('bGo').onclick=()=>bootGo();document.getElementById('bGear').onclick=()=>openSettings();
addEventListener('resize',()=>{if(bootOn)paintBoot();});
function boot(){for(const id of ['bVer','sVer']){const e=document.getElementById(id);if(e)e.textContent='ver '+VERSION+(id==='sVer'?'　id '+TEL_ID:'');}const had=load();initScene();resize();applyLoadedVisuals();S.region=regionIndex(S.dist);renderPanel(true);paintGoal();
  showBoot();
  addEventListener('resize',resize);const reFit=()=>{const h=vpH();if(h!==CH||innerWidth!==CW)dispatchEvent(new Event('resize'));};addEventListener('pageshow',reFit);addEventListener('orientationchange',()=>setTimeout(reFit,300));document.addEventListener('visibilitychange',()=>{if(!document.hidden)setTimeout(reFit,200);});if(window.visualViewport)visualViewport.addEventListener('resize',reFit);new ResizeObserver(measure).observe(frameEl);
  // タイトルが出ている間は保存しない（保存すると「最後に遊んだ時刻」が進み、留守の分を受け取れなくなる）
  document.addEventListener('visibilitychange',()=>{if(bootOn)return;if(document.hidden){paused=true;save();}else{offline();lastT=performance.now();paused=false;}});
  addEventListener('pagehide',()=>{if(!bootOn)save();});
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
