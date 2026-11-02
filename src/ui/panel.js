'use strict';
/* =====================================================================
   UI ― パネル（DRIVE・BOOST・BATTERY・RESET・LOG）
   ===================================================================== */
/* タブ */
let curTab='drive',buyMode='1';
const tabs=[...document.querySelectorAll('#tabs button')];
let skillOpen=false,lastWShown=-1;
function openSkill(pick,gained){skillPick=!!pick;skillOpen=true;PANX=0;PANY=0;PANS=1;const ov=document.getElementById('skillOv');ov.classList.add('on','intro','fadeIn');renderSkill();
  const box=document.getElementById('skBody');box.querySelectorAll('#skPan > line').forEach((l,i)=>l.style.animationDelay=(0.2+i*0.035).toFixed(2)+'s');box.querySelectorAll('.node').forEach(n=>{const k=SKILLS.find(z=>z.id===n.dataset.id);n.style.animationDelay=(0.35+k.step*0.14+k.br*0.05).toFixed(2)+'s';});
  requestAnimationFrame(()=>requestAnimationFrame(()=>ov.classList.remove('fadeIn')));setTimeout(()=>ov.classList.remove('intro'),2400);
  if(pick&&gained){const w=document.getElementById('skW'),to=S.W,from=Math.max(0,to-gained),t0=performance.now()+500;lastWShown=S.W;const step=()=>{const p=Math.min(1,Math.max(0,(performance.now()-t0)/1300)),q=1-Math.pow(1-p,3);w.textContent='歪み '+fmt(Math.round(from+(to-from)*q));if(p<1&&skillOpen)requestAnimationFrame(step);else if(skillOpen)w.textContent='歪み '+fmt(S.W);};w.textContent='歪み '+fmt(from);requestAnimationFrame(step);}}
function closeSkill(){const wasPick=skillPick;skillOpen=false;skillPick=false;if(wasPick)startRestart();document.getElementById('skillOv').classList.remove('on');renderPanel(true);}
tabs.forEach(b=>b.addEventListener('click',()=>{if(b.dataset.t==='skill'){openSkill(false);return;}curTab=b.dataset.t;renderPanel(true);}));
function tabLocked(t){return (t==='skill'&&S.prestiges<1&&S.W<1&&S.skills.length===0)||(t==='reset'&&S.maxStage<BRAKE_STAGE)||(t==='battery'&&S.maxStage<BATTERY_STAGE);}
let devUI=[],TIERFX=null;
function renderPanel(force){
  tabs.forEach(b=>{b.setAttribute('aria-selected',b.dataset.t===curTab);b.classList.toggle('locked',tabLocked(b.dataset.t));});
  if(curTab==='drive')renderDrive(force);else if(curTab==='boost')renderBoost();else if(curTab==='battery')renderBattery();else if(curTab==='reset')renderReset();else renderLog();
}
function devVisible(i){return S.dev[i]>0||S.maxStage>=DEVICES[i].unlock;}
function upgVisible(u){return !upgHas(u.id)&&S.dev[u.dev]>=u.need;}
function renderDrive(force){
  const order=[0,1,2,3,ANCHOR,4,5,6,7].sort((a,b)=>DEVICES[a].unlock-DEVICES[b].unlock);
  const visible=order.filter(devVisible);const nextLocked=order.find(i=>!devVisible(i));
  const key=visible.join()+'|'+nextLocked+'|'+buyMode+'|'+S.tier.join()+'|'+DEVICES.map((_,i)=>{const n=tierNext(i);return n&&S.dev[i]>=n.need?1:0;}).join('')+'|'+wsUnlocked()+'|'+S.skills.filter(x=>x[0]==='a').join()+'|'+S.auto.join()+'|'+S.autoTier;
  if(force||pbody.dataset.k!==key){pbody.dataset.k=key;pbody.innerHTML='';devUI=[];
    const h=document.createElement('div');h.className='phead';h.innerHTML='<span class="lab">DEVICES</span><span class="seg"><button data-m="1">×1</button><button data-m="10">×10</button><button data-m="max">MAX</button></span>';pbody.appendChild(h);
    h.querySelectorAll('button').forEach(b=>{b.setAttribute('aria-pressed',b.dataset.m===buyMode);b.addEventListener('click',()=>{buyMode=b.dataset.m;renderPanel(true);});});
    if(has('aT')){const w=document.createElement('div');w.className='ws';w.innerHTML='<div class="row" style="padding:0"><span>TIERの自動化</span><button class="auto" id="aTier"'+(S.autoTier?' data-on':'')+'>'+(S.autoTier?'自動':'手動')+'</button></div>';pbody.appendChild(w);w.querySelector('#aTier').onclick=()=>{S.autoTier=!S.autoTier;renderPanel(true);};}
    visible.forEach(i=>{const d=DEVICES[i],w=document.createElement('div');w.className='dv';
      let trait=d.trait;if(d.spawn)trait+='<br>'+d.spawn.why+'：'+DEVICES[d.spawn.to].name+' 毎分+<span class="spn"></span>台';
      w.innerHTML='<div class="dvRow"><svg width="26" height="26" viewBox="0 0 26 26" aria-hidden="true"></svg><div style="flex:1;min-width:0"><div class="dvName"><span class="nw">'+d.name+'</span>'+(i!==ANCHOR?'<span class="tierR'+(TIERFX&&TIERFX.i===i&&Date.now()-TIERFX.t<1500?' tierNew':'')+'" style="color:'+rgb(mix(COLORS[d.col].rgb,G,1-A[d.col]),0.95)+'">TIER '+ROMAN[S.tier[i]]+'</span>':'')+'<span class="dvCnt nw"></span><span class="badge rg" style="display:none"></span></div><div class="dvOut"></div></div>'+(i!==ANCHOR&&has('a'+i)?'<button class="auto" data-a="'+i+'">'+autoLabel(i)+'</button>':'')+'<button class="buy"></button></div><div class="dvTrait">'+trait+'</div><div class="upg"></div>'+(i===ANCHOR?'':'<div class="tk"></div>');pbody.appendChild(w);
      const ab=w.querySelector('.auto');if(ab&&S.auto[i])ab.setAttribute('data-on','');if(ab)ab.onclick=()=>{S.auto[i]=S.auto[i]?0:1;renderPanel(true);};
      const svgE=w.querySelector('svg');
      const em=emblem(svgE,d.emb),ticks=[];const tk=w.querySelector('.tk');if(tk)for(let k=1;k<=100;k++){const t=document.createElement('i');t.big=(k===25||k===50||k===100);t.style.height=(t.big?9:4)+'px';tk.appendChild(t);ticks.push(t);}
      const ug=w.querySelector('.upg');const upBtns=[];const tn=i===ANCHOR?null:tierNext(i);let hint=null;if(tn){hint=document.createElement('div');hint.className='tierHint';const ok=S.dev[i]>=tn.need;hint.dataset.ok=ok?'1':'';hint.style.display='none';hint.innerHTML='<span class="nw swp">右へスワイプ<span class="arr">››</span></span> <span class="nw">TIER '+ROMAN[tn.t]+'（'+(tn.t===3?'相乗：'+SYN[i]:'生産×'+(has('e5')?2.5:2))+'）</span> <span class="nw num">必要 '+fmt(tn.cost)+'</span>';ug.appendChild(hint);
        let sx=0,sy=0,dx=0,drag=false,act=false;w.style.touchAction='pan-y';
        w.addEventListener('pointerdown',e=>{if(e.target.closest('button'))return;sx=e.clientX;sy=e.clientY;dx=0;act=true;drag=false;});
        w.addEventListener('pointermove',e=>{if(!act)return;const ddx=e.clientX-sx,ddy=e.clientY-sy;if(!drag){if(Math.abs(ddx)>10&&Math.abs(ddx)>Math.abs(ddy)*1.3){const tnow=tierNext(i);if(!(tnow&&S.dev[i]>=tnow.need&&S.E>=tnow.cost)){act=false;return;}drag=true;}else if(Math.abs(ddy)>10){act=false;return;}}if(drag){if(!w.hasPointerCapture(e.pointerId))try{w.setPointerCapture(e.pointerId);}catch(_){}dx=Math.max(0,Math.min(110,ddx));w.style.transform='translateX('+dx+'px)';const ready=dx>56&&S.dev[i]>=tn.need&&S.E>=tn.cost;w.classList.toggle('swReady',ready);}});
        const end=()=>{if(!act)return;act=false;w.style.transition='transform .3s cubic-bezier(.2,.8,.3,1.2)';w.style.transform='';setTimeout(()=>{w.style.transition='';},320);w.classList.remove('swReady');if(drag&&dx>56){const before=S.tier[i];tierUp(i);if(S.tier[i]===before){w.animate&&w.animate([{transform:'translateX(0)'},{transform:'translateX(-6px)'},{transform:'translateX(5px)'},{transform:'translateX(0)'}],{duration:300});}else renderPanel(true);}else if(drag&&dx>20)toast('もう少し右まで引いて離す');};
        w.addEventListener('pointerup',end);w.addEventListener('pointercancel',end);}
      const bt=w.querySelector('.buy');bt.addEventListener('click',()=>{if(buyDevice(i,buyMode)){const r=bt.getBoundingClientRect();for(let k=0;k<10;k++){const a=-1.57+R(-1,1),v=R(0.5,1.7);P.push({x:r.left+r.width/2,y:r.top,vx:Math.cos(a)*v,vy:Math.sin(a)*v,l:1,c:COLORS[d.col].rgb,r:R(0.8,1.8),gr:A[d.col]<0.5,dr:0.02});}updateDrive();}});
      devUI.push({i,el:w,hint:w.querySelector('.tierHint'),em,ticks,cnt:w.querySelector('.dvCnt'),out:w.querySelector('.dvOut'),bt,rg:w.querySelector('.rg'),spn:w.querySelector('.spn'),upBtns});});
    if(nextLocked!=null){const d=DEVICES[nextLocked],w=document.createElement('div');w.className='dv dvLocked';w.innerHTML='<div class="dvRow"><svg width="26" height="26" viewBox="0 0 26 26"><circle cx="13" cy="13" r="11.5" fill="none" stroke="#fff" stroke-width=".6" stroke-dasharray="2 3"/></svg><div style="flex:1"><div class="dvName">？？？</div><div class="dvOut">'+speedText(d.unlock)+'で現れる</div></div></div>';pbody.appendChild(w);}
  }
  updateDrive();paintDeviceColors();
}
function autoLabel(i){return S.auto[i]?'自動':'手動';}
function updateDrive(){const gm=globalMult();devUI.forEach(u=>{const i=u.i,k=buyMode==='max'?Math.max(1,devMax(i)):+buyMode,c=devCost(i,k);u.cnt.textContent=String(S.dev[i]).padStart(3,'0');
  if(i===ANCHOR)u.out.textContent='故郷の時間 −'+Math.round(anchorCut()*100)+'%';else{const tm=traitMult(i);u.out.textContent='+'+fmt(devRateRaw(i)*gm)+' / 秒'+(tm>1.001?'　個性 ×'+tm.toFixed(2):'');}
  u.bt.textContent=(buyMode==='1'?'':'×'+k+' ')+fmt(c);u.bt.disabled=c>S.E;
  const rm=i===ANCHOR?1:regionMult(i);if(rm!==1){u.rg.style.display='';u.rg.textContent='区域 ×'+rm;}else u.rg.style.display='none';
  if(u.spn){const sp=DEVICES[i].spawn;u.spn.textContent=(S.dev[i]*sp.rate).toFixed(1);}
  u.upBtns.forEach(([b,up])=>b.disabled=S.E<up.cost);if(u.hint){const tn=tierNext(u.i),cnt=!!(tn&&S.dev[u.i]>=tn.need),can=cnt&&S.E>=tn.cost;u.hint.classList.toggle('can',can);u.hint.style.display=cnt?'':'none';const sw=u.hint.querySelector('.swp');if(sw)sw.style.display=can?'':'none';const dc=DEVICES[u.i].col,cc=mix(COLORS[dc].rgb,G,1-A[dc]);if(!u.el.dataset.sweep)u.el.style.background=can?'linear-gradient(90deg,'+rgb(cc,0.16)+','+rgb(cc,0.02)+')':'';u.el.style.boxShadow=cnt?'inset 2px 0 0 '+rgb(cc,can?0.9:0.5):'';}});
}
function paintDeviceColors(){devUI.forEach(u=>{const d=DEVICES[u.i],a=A[d.col],base=mix(d.col===5?[230,232,240]:COLORS[d.col].rgb,G,1-a),col=rgb(devGlow>0.05?mix(base,[255,255,255],devGlow*0.5):base,1);u.em.parts.forEach(p=>p.setAttribute('stroke',col));u.em.core.setAttribute('fill',col);
  if(!u.ticks.length)return;const n=S.dev[u.i],scale=n>=100?2:1;for(let k=0;k<100;k++){const t=u.ticks[k];t.style.background=(k+1)*scale<=n?col:(t.big?'rgba(255,255,255,.3)':'rgba(255,255,255,.12)');}});}
function renderBoost(){const s=S.stage,nx=s+1,c=nx<=MAX_STAGE?accelCost(nx):0,cap=batteryCap(),blocked=false,dil=s>=DILATION_STAGE,g=stageGamma(s);
  let h='<div class="phead"><span class="lab">'+(dil?'SHIP TIME':'VELOCITY')+'</span></div>';
  if(dil)h+='<div class="row"><span>時間の進み</span><span class="big">/'+fmtG(g)+'</span></div><div class="row"><span class="note" style="margin:0">船の1秒の間に外で過ぎる時間（＝生産の倍率）</span><span class="num">'+fmtG(g)+'秒</span></div><div class="row"><span class="note" style="margin:0">速度</span><span class="num">'+speedText(s)+'</span></div>';
  else h+='<div class="row"><span>いまの速度</span><span class="big">'+speedText(s)+'</span></div><div class="row"><span class="note" style="margin:0">'+(s>=6?'秒速':'光速の')+'</span><span class="num">'+(s>=6?kmsOf(s).toLocaleString('ja-JP')+'km':stagePct(s)+'%')+'</span></div>';
  if(nx<=MAX_STAGE){const label=nx>DILATION_STAGE?'時間の進み /'+fmtG(stageGamma(nx))+' まで加速する':speedText(nx)+'まで加速する';
    if(has('aA'))h+='<div class="row"><span class="note" style="margin:0">自動加速</span><button class="auto" id="bAuto"'+(S.autoAcc?' data-on':'')+'>'+(S.autoAcc?'自動':'手動')+'</button></div>';
    h+='<button class="act" id="bAcc"'+(S.E<c||blocked?' disabled':'')+'>'+label+'　<span class="num">'+fmt(c)+'</span></button>';
    const ratio=(stageGamma(nx)/g).toFixed(1),un=DEVICES.filter(d=>d.unlock===nx).map(d=>d.name);
    if(blocked)h+='<div class="note">故郷まで残り'+Math.round((1-ARRIVE_RATIO)*100)+'%（'+fmt(GOAL_LY*(1-ARRIVE_RATIO))+'光年）に近づくと開く。</div>';
    else if(nx>DILATION_STAGE)h+='<div class="note">光速の'+stagePct(nx)+'%へ。速さはほとんど変わらないが、船の時間の進みが約'+ratio+'倍ゆっくりになる。外から届く光は早回しになり、生産も故郷で過ぎる時間も約'+ratio+'倍になる。</div>';
    else if(nx===DILATION_STAGE)h+='<div class="note">光速の90%を超えると、船の時間の進みがはっきり遅くなり始める。外の光が早回しで届くので、ここから先は加速するほど生産が大きく伸びる。</div>';
    else h+='<div class="note">加速すると太陽帆がよく働き、故郷への航路も早く進む。'+(un.length?un.join('、')+'が使えるようになる。':'')+(nx===BATTERY_STAGE?'蓄電池が使えるようになる。':'')+'</div>';}
  else h+='<div class="note">これ以上は加速できない。</div>';
  pbody.dataset.k='';pbody.innerHTML=h;
  const a=document.getElementById('bAcc');if(a)a.onclick=()=>{accelerate();renderPanel(true);};const au=document.getElementById('bAuto');if(au)au.onclick=()=>{S.autoAcc=!S.autoAcc;renderPanel(true);};
}
function renderBattery(){const cap=batteryCap();let h='';
  {const full=S.battery>=cap*0.999,per=Math.pow(1+batteryRate(),yearsPerSec())-1,om=S.battery>0?overMulFor(S.battery):0;
    h+='<div class="phead"><span class="lab">BATTERY</span><span class="num" style="font-size:12px;color:var(--ink-dim)">故郷の1年ごとに +'+Math.round(batteryRate()*100)+'%</span></div>'+
    '<div class="row"><span class="num" style="font-size:18px">'+fmt(S.battery)+'</span><span class="num" style="font-size:12px;color:var(--ink-dim)">上限 '+fmt(cap)+'</span></div><div class="bar'+(full?' full':'')+'"><i style="width:'+(cl(S.battery/cap)*100).toFixed(1)+'%"></i></div>'+
    '<div class="row" style="padding:2px 0"><span class="note" style="margin:0">預けた額から</span><span class="num" style="font-size:12px">×'+batGrowth().toFixed(2)+'</span></div>'+
    '<div class="row" style="padding:2px 0"><span class="note" style="margin:0">いまの速さでは 1秒で</span><span class="num" style="font-size:12px">+'+(per*100<1000?(per*100).toFixed(per<0.01?3:1):fmt(per*100))+'%</span></div>'+
    '<div class="seg" style="justify-content:space-between;margin-top:6px"><button class="act" style="margin:0 3px 0 0;font-size:12px;padding:8px" data-d=".25">25%預ける</button><button class="act" style="margin:0 3px;font-size:12px;padding:8px" data-d=".5">50%預ける</button><button class="act" style="margin:0 0 0 3px;font-size:12px;padding:8px" data-d="1">全部預ける</button></div>'+
    (has('aR')?'<div class="row"><span class="note" style="margin:0">自動放出（預けた額の4倍で）</span><button class="auto" id="aRel"'+(S.autoRel?' data-on':'')+'>'+(S.autoRel?'自動':'手動')+'</button></div>':'')+
    (S.over>0?'<div class="act" style="border-color:#ffc670;color:#ffd38a;cursor:default">過負荷 ×'+S.overMul.toFixed(1)+'　残り '+Math.ceil(S.over)+'秒</div>':'<button class="act" id="bRel"'+(S.battery<=0?' disabled':'')+' style="border-color:rgba(255,198,112,.7)">放出する'+(om?'　<span class="num">'+(has('eB')?45:30)+'秒間 生産×'+om.toFixed(1)+'</span>':'')+'</button>')+
    '<div class="note">預けた分は故郷の時間で増える。加速して外の時間が速く流れるほど早く増える。放出すると全額が戻り、しばらく「過負荷」で生産が跳ね上がる。過負荷の強さは、預けた額から何倍に増えたかで決まる。緊急停止すると中身は失われる。核融合炉は蓄電が満ちるほど強い。</div>';}
  pbody.dataset.k='';pbody.innerHTML=h;
  pbody.querySelectorAll('[data-d]').forEach(b=>b.onclick=()=>{deposit(+b.dataset.d);renderPanel(true);});
  const ar=document.getElementById('aRel');if(ar)ar.onclick=()=>{S.autoRel=!S.autoRel;renderPanel(true);};
  const rl=document.getElementById('bRel');if(rl)rl.onclick=()=>{FXQ.relBtn=rl.getBoundingClientRect();release();renderPanel(true);};}

function renderReset(){const g=wGain();pbody.dataset.k='';pbody.innerHTML='<div class="phead"><span class="lab">EMERGENCY STOP</span></div><div class="row"><span>得られる歪み</span><span class="big">'+fmt(g)+'</span></div>'+
  '<div class="note">緊急停止すると、エネルギー、速度、装置、改良、蓄電がなくなる。進んだ距離と、故郷で過ぎた年月は戻らない。停止のあと星図が開き、歪みで新しいスキルを覚えられる。</div>'+
  '<button class="act" id="rGo"'+(S.stage<BRAKE_STAGE||g<1?' disabled':'')+'>緊急停止する</button>'+(S.stage<BRAKE_STAGE?'<div class="note">光速の90%に達すると使える。</div>':'')+
  (has('aS')?'<div class="row"><span class="note" style="margin:0">自動停止（得られる歪みが持ち分の2倍で）</span><button class="auto" id="aStop"'+(S.autoStop?' data-on':'')+'>'+(S.autoStop?'自動':'手動')+'</button></div>':'')+
  '<div class="row" style="margin-top:10px"><span class="note" style="margin:0">これまでの停止</span><span class="num">'+S.prestiges+' 回</span></div>';
  const ast=document.getElementById('aStop');if(ast)ast.onclick=()=>{S.autoStop=!S.autoStop;renderPanel(true);};
  document.getElementById('rGo').onclick=()=>confirmBox('緊急停止','歪みを '+fmt(g)+' 得て、速度0からやり直す。距離と年月はそのまま残る。このあとスキルを選べる。',()=>{startBrake(g);});}
let logMode='log';
function renderLog(){pbody.dataset.k='';let h='<div class="phead"><span class="lab">LOG</span><span class="seg"><button data-m="log">日誌</button><button data-m="ach">実績 '+S.ach.length+'/'+ACHIEVEMENTS.length+'</button></span></div>';
  if(logMode==='log'){S.log.slice().reverse().forEach((e,j)=>{const col=e.c>=0?rgb(COLORS[e.c].rgb,1):'var(--ink-dim)';h+='<div class="le"><span class="y" style="color:'+col+'">故郷 '+e.y.toLocaleString('ja-JP')+'年</span><span class="t" style="opacity:'+(j===0?1:0.75)+'">'+e.t+'</span></div>';});}
  else ACHIEVEMENTS.forEach(a=>{const on=S.ach.includes(a[0]);h+='<div class="ach'+(on?'':' off')+'"><span style="width:12px">'+(on?'✦':'·')+'</span><span style="flex:1">'+a[1]+'</span><span style="color:var(--ink-dim)">'+a[2]+'</span></div>';});
  pbody.innerHTML=h;pbody.querySelectorAll('.seg button').forEach(b=>{b.setAttribute('aria-pressed',b.dataset.m===logMode);b.onclick=()=>{logMode=b.dataset.m;renderLog();};});}
