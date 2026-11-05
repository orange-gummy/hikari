'use strict';
/* =====================================================================
   UI ― パネル（上の段 DRIVE・BOOST・BATTERY・LOG、下の段は層 HOME・STAR・GALAXY（のちに UNIVERSE・LIGHT））
   ===================================================================== */
/* タブ */
let curTab='drive',buyMode='1';
/* タブは入れ子：下の段で層（HOME・STAR・GALAXY）と LOG を選び、上の段にその層の中のタブを出す。層が1つのうちは1段 */
const LAYERS=[{id:'home',name:'HOME',tabs:['drive','boost','battery','skill','reset']},{id:'star',name:'STAR',tabs:['restart','glow','stars']},{id:'galaxy',name:'GALAXY',tabs:['voy','wake']}];
const TAB_NAME={drive:'DRIVE',boost:'BOOST',battery:'BATTERY',skill:'SKILL',reset:'STOP',restart:'RESTART',glow:'AFTERGLOW',stars:'STARS',voy:'VOYAGE',wake:'WAKE',log:'LOG'};
const lastTab={home:'drive',star:'restart',galaxy:'voy'};let curLayer='home',tabs=[],tabKey='';
function layerOpen(id){return id==='home'||(id==='star'&&(S.cleared||S.restarts>0||S.lTotal>0))||(id==='galaxy'&&(S.voy||canVoyage()));}
function layerOf(t){const L=LAYERS.find(x=>x.tabs.includes(t));return L?L.id:null;}
function tabClick(t){if(t==='skill'){openSkill(false);return;}if(t==='stars'){const k=SKILLS.find(z=>z.glow&&!S.lit.includes(z.id))||SKILLS.find(z=>z.glow);selSkill=k.id;openSkill(false);return;}curTab=t;renderPanel(true);}
function buildTabs(){const open=LAYERS.filter(L=>layerOpen(L.id)),multi=open.length>1||!tabHidden('reset');   // 緊急停止が開いたら2段（下に HOME と LOG）
  const sub=(multi?LAYERS.find(L=>L.id===curLayer).tabs:LAYERS[0].tabs.concat(['log'])).filter(t=>!tabHidden(t));
  const key=sub.join()+'|'+(multi?open.map(L=>L.id).join():'');if(key===tabKey)return;tabKey=key;
  const mk=(t,cls,label)=>'<button data-t="'+t+'"'+(cls?' class="'+cls+'"':'')+' role="tab">'+label+'</button>';
  document.getElementById('tr1').innerHTML=sub.map(t=>mk(t,'',TAB_NAME[t])).join('');
  const r2=document.getElementById('tr2');r2.innerHTML=multi?open.map(L=>'<button data-l="'+L.id+'" role="tab"><i></i>'+L.name+'</button>').join('')+mk('log','','LOG'):'';r2.style.display=multi?'':'none';
  tabs=[...document.querySelectorAll('#tabs button')];
  tabs.forEach(b=>b.addEventListener('click',()=>{if(b.dataset.l){curTab=lastTab[b.dataset.l];curLayer=b.dataset.l;renderPanel(true);return;}tabClick(b.dataset.t);}));}
let skillOpen=false,lastWShown=-1;
function openSkill(pick,gained){skillPick=!!pick;skillOpen=true;PANX=0;PANY=0;PANS=1;const ov=document.getElementById('skillOv');ov.classList.add('on','intro','fadeIn');renderSkill();
  const box=document.getElementById('skBody');box.querySelectorAll('#skPan > line').forEach((l,i)=>l.style.animationDelay=(0.2+i*0.035).toFixed(2)+'s');box.querySelectorAll('.node').forEach(n=>{const k=SKILLS.find(z=>z.id===n.dataset.id);n.style.animationDelay=(0.35+k.step*0.14+k.br*0.05).toFixed(2)+'s';});
  requestAnimationFrame(()=>requestAnimationFrame(()=>ov.classList.remove('fadeIn')));setTimeout(()=>ov.classList.remove('intro'),2400);
  if(pick&&gained){const w=document.getElementById('skW'),to=S.W,from=Math.max(0,to-gained),t0=performance.now()+500;lastWShown=S.W;const step=()=>{const p=Math.min(1,Math.max(0,(performance.now()-t0)/1300)),q=1-Math.pow(1-p,3);w.textContent='歪み '+fmt(Math.round(from+(to-from)*q));if(p<1&&skillOpen)requestAnimationFrame(step);else if(skillOpen){w.textContent='歪み '+fmt(S.W);paintWm();}};w.textContent='歪み '+fmt(from);requestAnimationFrame(step);}}
function closeSkill(){const wasPick=skillPick;skillOpen=false;skillPick=false;if(wasPick)startRestart();document.getElementById('skillOv').classList.remove('on');renderPanel(true);}
function paintTabs(){buildTabs();tabs.forEach(b=>{if(b.dataset.l){b.setAttribute('aria-selected',curTab!=='log'&&b.dataset.l===curLayer);return;}b.setAttribute('aria-selected',b.dataset.t===curTab);b.classList.toggle('locked',tabLocked(b.dataset.t));});}
function tabHidden(t){const L=layerOf(t);if(L&&!layerOpen(L))return true;return (t==='reset'&&S.maxStage<BRAKE_STAGE&&S.restarts===0)||(t==='skill'&&S.prestiges<1&&S.W<1&&S.skills.length===0&&S.lTotal===0);}   // 層が開くまでタブごと出さない
function tabLocked(t){return (t==='skill'&&S.prestiges<1&&S.W<1&&S.skills.length===0&&S.lTotal===0)||(t==='battery'&&S.maxStage<BATTERY_STAGE);}
let devUI=[],TIERFX=null;
function renderPanel(force){
  if(curTab!=='log'&&tabHidden(curTab))curTab='drive';
  if(curTab!=='log'){curLayer=layerOf(curTab)||'home';lastTab[curLayer]=curTab;}
  paintTabs();
  if(curTab==='drive')renderDrive(force);else if(curTab==='boost')renderBoost();else if(curTab==='battery')renderBattery();else if(curTab==='reset')renderReset();else if(curTab==='glow'||curTab==='restart')renderGlow();else if(curTab==='voy'||curTab==='wake')renderVoy();else renderLog();
}
function devVisible(i){return devOpen(i);}
function upgVisible(u){return !upgHas(u.id)&&S.dev[u.dev]>=u.need;}
function renderDrive(force){
  const order=DEVICES.map((_,i)=>i).sort((a,b)=>(DEVICES[a].find||0)-(DEVICES[b].find||0)||DEVICES[a].unlock-DEVICES[b].unlock);
  const visible=order.filter(devVisible);const nextLocked=order.find(i=>!devVisible(i)&&(!DEVICES[i].find||S.voy));
  const key=visible.join()+'|'+nextLocked+'|'+buyMode+'|'+S.skills.filter(x=>x[0]==='a').join()+'|'+S.auto.join()+'|'+S.autoTier;
  if(force||pbody.dataset.k!==key){pbody.dataset.k=key;pbody.innerHTML='';devUI=[];
    const h=document.createElement('div');h.className='phead';h.innerHTML='<span class="lab">DEVICES</span><span class="seg"><button data-m="1">×1</button><button data-m="10">×10</button><button data-m="max">MAX</button></span>';pbody.appendChild(h);
    h.querySelectorAll('button').forEach(b=>{b.setAttribute('aria-pressed',b.dataset.m===buyMode);b.addEventListener('click',()=>{buyMode=b.dataset.m;renderPanel(true);});});
    if(has('aT')){const w=document.createElement('div');w.className='ws';w.innerHTML='<div class="row" style="padding:0"><span>TIERの自動化</span><button class="auto" id="aTier"'+(S.autoTier?' data-on':'')+'>'+(S.autoTier?'自動':'手動')+'</button></div>';pbody.appendChild(w);w.querySelector('#aTier').onclick=()=>{S.autoTier=!S.autoTier;renderPanel(true);};}
    visible.forEach(i=>{const d=DEVICES[i],w=document.createElement('div');w.className='dv';
      let trait=d.trait;if(d.spawn)trait+='<br>'+d.spawn.why+'：'+DEVICES[d.spawn.to].name+' 毎分+<span class="spn"></span>台';
      w.innerHTML='<div class="dvRow"><svg width="26" height="26" viewBox="0 0 26 26" aria-hidden="true"></svg><div style="flex:1;min-width:0"><div class="dvName"><span class="nw">'+d.name+'</span>'+(i!==ANCHOR?'<span class="tierR'+(TIERFX&&TIERFX.i===i&&Date.now()-TIERFX.t<1500?' tierNew':'')+'" style="color:'+rgb(mix(colRGB(d.col),G,1-A[d.col]),0.95)+'">TIER '+ROMAN[S.tier[i]]+'</span>':'')+'<span class="dvCnt nw"></span><span class="badge rg" style="display:none"></span></div><div class="dvOut"></div></div>'+(has('a'+i)?'<button class="auto" data-a="'+i+'">'+autoLabel(i)+'</button>':'')+'<button class="buy"></button></div><div class="dvTrait">'+trait+'</div><div class="upg"></div>'+(i===ANCHOR?'':'<div class="tk"></div>');pbody.appendChild(w);
      const ab=w.querySelector('.auto');if(ab&&S.auto[i])ab.setAttribute('data-on','');if(ab)ab.onclick=()=>{S.auto[i]=S.auto[i]?0:1;renderPanel(true);};
      const svgE=w.querySelector('svg');
      const em=emblem(svgE,d.emb),ticks=[];const tk=w.querySelector('.tk');if(tk)for(let k=1;k<=100;k++){const t=document.createElement('i');t.big=(k===25||k===50||k===100);t.style.height=(t.big?9:4)+'px';tk.appendChild(t);ticks.push(t);}
      const ug=w.querySelector('.upg');const upBtns=[];const tn=i===ANCHOR?null:tierNext(i);let hint=null;if(tn){hint=document.createElement('div');hint.className='tierHint';const ok=S.dev[i]>=tn.need;hint.dataset.ok=ok?'1':'';hint.style.display='none';hint.innerHTML=tierHintHTML(i,tn);ug.appendChild(hint);
        let sx=0,sy=0,dx=0,drag=false,act=false;w.style.touchAction='pan-y';
        w.addEventListener('pointerdown',e=>{if(e.target.closest('button'))return;sx=e.clientX;sy=e.clientY;dx=0;act=true;drag=false;});
        w.addEventListener('pointermove',e=>{if(!act)return;const ddx=e.clientX-sx,ddy=e.clientY-sy;if(!drag){if(Math.abs(ddx)>10&&Math.abs(ddx)>Math.abs(ddy)*1.3){const tnow=tierNext(i);if(!(tnow&&S.dev[i]>=tnow.need&&S.E>=tnow.cost)){act=false;return;}drag=true;}else if(Math.abs(ddy)>10){act=false;return;}}if(drag){if(!w.hasPointerCapture(e.pointerId))try{w.setPointerCapture(e.pointerId);}catch(_){}dx=Math.max(0,Math.min(110,ddx));w.style.transform='translateX('+dx+'px)';const tq=tierNext(i),ready=!!tq&&dx>56&&S.dev[i]>=tq.need&&S.E>=tq.cost;w.classList.toggle('swReady',ready);}});
        const end=()=>{if(!act)return;act=false;w.style.transition='transform .3s cubic-bezier(.2,.8,.3,1.2)';w.style.transform='';setTimeout(()=>{w.style.transition='';},320);w.classList.remove('swReady');if(drag&&dx>56){const before=S.tier[i];tierUp(i);if(S.tier[i]===before){w.animate&&w.animate([{transform:'translateX(0)'},{transform:'translateX(-6px)'},{transform:'translateX(5px)'},{transform:'translateX(0)'}],{duration:300});}else renderPanel(true);}else if(drag&&dx>20)toast('もう少し右まで引いて離す');};
        w.addEventListener('pointerup',end);w.addEventListener('pointercancel',end);}
      const bt=w.querySelector('.buy');bt.addEventListener('click',()=>{if(buyDevice(i,buyMode)){const r=bt.getBoundingClientRect();for(let k=0;k<10;k++){const a=-1.57+R(-1,1),v=R(0.5,1.7);P.push({x:r.left+r.width/2,y:r.top,vx:Math.cos(a)*v,vy:Math.sin(a)*v,l:1,c:colRGB(d.col),r:R(0.8,1.8),gr:A[d.col]<0.5,dr:0.02});}updateDrive();}});
      devUI.push({i,el:w,hint:w.querySelector('.tierHint'),em,ticks,cnt:w.querySelector('.dvCnt'),out:w.querySelector('.dvOut'),bt,rg:w.querySelector('.rg'),spn:w.querySelector('.spn'),upBtns});});
    if(nextLocked!=null){const d=DEVICES[nextLocked],w=document.createElement('div');w.className='dv dvLocked';w.innerHTML='<div class="dvRow"><svg width="26" height="26" viewBox="0 0 26 26"><circle cx="13" cy="13" r="11.5" fill="none" stroke="#fff" stroke-width=".6" stroke-dasharray="2 3"/></svg><div style="flex:1"><div class="dvName">？？？</div><div class="dvOut">'+(d.find?(S.found<d.find?DEST[d.find-1].name+'に着くと現れる':speedText(d.unlock)+'で現れる'):speedText(d.unlock)+'で現れる')+'</div></div></div>';pbody.appendChild(w);}
  }
  updateDrive();paintDeviceColors();
}
function tierHintHTML(i,tn){return '<span class="nw swp">右へスワイプ<span class="arr">››</span></span> <span class="nw">TIER '+ROMAN[tn.t]+'（'+(tn.t===3&&SYN[i]?'相乗：'+SYN[i]:'生産×'+(has('e5')?2.5:2))+'）</span> <span class="nw num">必要 '+fmt(tn.cost)+'</span>';}
// TIER が上がったら、その行の表示だけ書き換える（一覧ごと作り直すと、自動で上がるたびにちらつく）
function refreshTier(i){const u=devUI.find(x=>x.i===i);if(!u)return;const r=u.el.querySelector('.tierR');if(r){r.textContent='TIER '+ROMAN[S.tier[i]];r.classList.remove('tierNew');void r.offsetWidth;r.classList.add('tierNew');}
  if(u.hint){const tn=tierNext(i);if(tn)u.hint.innerHTML=tierHintHTML(i,tn);else{u.hint.remove();u.hint=null;}}}
function autoLabel(i){return S.auto[i]?'自動':'手動';}
function updateDrive(){const gm=globalMult();devUI.forEach(u=>{const i=u.i,k=buyMode==='max'?Math.max(1,devMax(i)):+buyMode,c=devCost(i,k);u.cnt.textContent=String(S.dev[i]).padStart(3,'0');
  if(i===ANCHOR)u.out.textContent='故郷の時間 −'+Math.round(anchorCut()*100)+'%';else{const tm=traitMult(i);u.out.textContent='+'+fmt(devRateRaw(i)*gm)+' / 秒'+(tm>1.001?'　個性 ×'+tm.toFixed(2):'');}
  u.bt.textContent=(buyMode==='1'?'':'×'+k+' ')+fmt(c);u.bt.disabled=c>S.E;
  const rm=i===ANCHOR?1:regionMult(i);if(rm!==1){u.rg.style.display='';u.rg.textContent='区域 ×'+rm;}else u.rg.style.display='none';
  if(u.spn){const sp=DEVICES[i].spawn;u.spn.textContent=(S.dev[i]*sp.rate).toFixed(1);}
  u.upBtns.forEach(([b,up])=>b.disabled=S.E<up.cost);if(u.hint){const tn=tierNext(u.i),cnt=!!(tn&&S.dev[u.i]>=tn.need),can=cnt&&S.E>=tn.cost;u.hint.classList.toggle('can',can);u.hint.style.display=cnt?'':'none';const sw=u.hint.querySelector('.swp');if(sw)sw.style.display=can?'':'none';const dc=DEVICES[u.i].col,cc=mix(colRGB(dc),G,1-A[dc]);if(!u.el.dataset.sweep)u.el.style.background=can?'linear-gradient(90deg,'+rgb(cc,0.16)+','+rgb(cc,0.02)+')':'';u.el.style.boxShadow=cnt?'inset 2px 0 0 '+rgb(cc,can?0.9:0.5):'';}});
}
function paintDeviceColors(){devUI.forEach(u=>{const d=DEVICES[u.i],a=A[d.col],base=mix(d.col===5?[230,232,240]:colRGB(d.col),G,1-a),col=rgb(devGlow>0.05?mix(base,[255,255,255],devGlow*0.5):base,1);u.em.parts.forEach(p=>p.setAttribute('stroke',col));u.em.core.setAttribute('fill',col);
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

function renderReset(){const g=wGain();let h='<div class="phead"><span class="lab">EMERGENCY STOP</span></div><div class="row"><span>得られる歪み</span><span class="big">'+fmt(g)+'</span></div>'+
  '<div class="note">緊急停止すると、エネルギー、速度、装置、改良、蓄電がなくなる。進んだ距離と、故郷で過ぎた年月は戻らない。停止のあと星図が開き、歪みで新しいスキルを覚えられる。</div>'+
  '<button class="act" id="rGo"'+(S.stage<BRAKE_STAGE||g<1?' disabled':'')+'>緊急停止する</button>'+(S.stage<BRAKE_STAGE?'<div class="note">光速の90%に達すると使える。</div>':'')+
  '<div class="row" style="margin-top:10px"><span class="note" style="margin:0">持っている歪み '+fmt(S.W)+'（使わずにいると1つにつき生産+1%）</span><span class="num">×'+fmtG(wMult())+'</span></div>'+
  '<div class="row"><span class="note" style="margin:0">これまでの停止</span><span class="num">'+S.prestiges+' 回</span></div>';
  pbody.dataset.k='';pbody.innerHTML=h;
  document.getElementById('rGo').onclick=()=>confirmBox('緊急停止','歪みを '+fmt(g)+' 得て、速度0からやり直す。距離と年月はそのまま残る。このあとスキルを選べる。',()=>{startBrake(g);});}
/* ② 再出発と残光（STAR タブ）。強化は「残照の地平」：日が沈んだあとの地平線に、強化ごとの光の筋が段に応じて空へ伸びる */
let glowSel='rm',GLOWFX=null;
function glowHorizon(){const W=360,H=210,hz=150,n=AFTERGLOW.length,xs=AFTERGLOW.map((_,i)=>W*(i+0.5)/n);
  let v='<svg class="gHz" viewBox="0 0 '+W+' '+H+'" role="group" aria-label="残光の強化"><defs><linearGradient id="gSky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="rgb(60,40,90)" stop-opacity="0"/><stop offset=".6" stop-color="rgb(150,80,90)" stop-opacity=".12"/><stop offset="1" stop-color="rgb(255,150,90)" stop-opacity=".32"/></linearGradient>'+
    '<radialGradient id="gSun" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="rgb(255,150,90)" stop-opacity=".28"/><stop offset="1" stop-color="rgb(255,150,90)" stop-opacity="0"/></radialGradient>'+
    '<linearGradient id="gRay" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stop-color="rgb(255,214,170)" stop-opacity=".85"/><stop offset="1" stop-color="rgb(255,214,170)" stop-opacity="0"/></linearGradient>'+
    '<linearGradient id="gEdge" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#fff" stop-opacity="0"/><stop offset=".18" stop-color="#fff"/><stop offset=".82" stop-color="#fff"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></linearGradient><mask id="gFade"><rect x="0" y="0" width="'+W+'" height="'+H+'" fill="url(#gEdge)"/></mask>'+
    '<radialGradient id="gDot"><stop offset="0" stop-color="rgb(255,214,170)" stop-opacity=".6"/><stop offset="1" stop-color="rgb(255,214,170)" stop-opacity="0"/></radialGradient></defs>'+
    '<g mask="url(#gFade)"><rect x="0" y="'+(hz-130)+'" width="'+W+'" height="130" fill="url(#gSky)"/><rect x="0" y="'+(hz-60)+'" width="'+W+'" height="'+(H-hz+60)+'" fill="url(#gSun)"/></g>'+
    '<line x1="6" y1="'+hz+'" x2="'+(W-6)+'" y2="'+hz+'" stroke="rgb(255,200,150)" stroke-opacity=".5" stroke-width=".8"/>';
  AFTERGLOW.forEach((a,i)=>{const l=glow(a.id),x=xs[i],sel=a.id===glowSel,steps=Math.min(l,6),h=18+steps*18+(l>6?Math.min(12,Math.log2(l-5)*4):0),fx=GLOWFX&&GLOWFX.id===a.id&&Date.now()-GLOWFX.t<1200;
    v+='<g data-gs="'+a.id+'" style="cursor:pointer"><rect x="'+(x-W/n/2)+'" y="0" width="'+(W/n)+'" height="'+H+'" fill="transparent"/>'+
      '<rect x="'+(x-(sel?1:0.7))+'" y="'+(hz-h)+'" width="'+(sel?2:1.4)+'" height="'+h+'" fill="url(#gRay)" opacity="'+(sel?1:0.65)+'"/>'+
      '<circle cx="'+x+'" cy="'+hz+'" r="12" fill="url(#gDot)"'+(fx?' class="gPop"':'')+'/><circle cx="'+x+'" cy="'+hz+'" r="3" fill="rgb(255,226,190)"/>';
    for(let k=1;k<=steps;k++)v+='<circle cx="'+x+'" cy="'+(hz-k*18)+'" r="1.4" fill="rgb(255,214,170)" opacity=".8"/>';
    if(sel)v+='<circle cx="'+x+'" cy="'+hz+'" r="9" fill="none" stroke="rgb(255,214,170)" stroke-opacity=".8" stroke-width=".8"/>';
    v+='<text x="'+x+'" y="'+(hz+24)+'" text-anchor="middle" font-size="11" fill="'+(sel?'#eceef2':'rgba(236,238,242,.6)')+'">'+a.name+'</text><text x="'+x+'" y="'+(hz+40)+'" text-anchor="middle" font-size="10" fill="rgba(236,238,242,.45)" font-family="Jura,sans-serif">Lv '+l+(a.max?' / '+a.max:'')+'</text></g>';});
  v+='</svg>';
  const a=AFTERGLOW.find(x=>x.id===glowSel)||AFTERGLOW[0],l=glow(a.id),nx=glowNext(a.id);
  v+='<div class="gDet"><div class="row" style="padding:0"><span style="font-size:14px">'+a.name+'</span><span class="num" style="font-size:12px;color:var(--ink-dim)">Lv '+l+'</span></div>'+
    '<div class="note" style="margin:4px 0 2px">'+(l?'いま：'+a.text(l)+'<br>':'')+(nx?'次：'+nx.text:'これ以上は灯せない。')+'</div>'+
    (nx?'<button class="act" id="gBuy"'+(S.L<nx.cost?' disabled':'')+' style="border-color:rgba(255,200,140,.6);color:#ffd6aa">灯す　残光 '+fmt(nx.cost)+'</button>':'')+'</div>';
  return v;}
function renderGlow(){const lg=lGain(),part=curTab==='restart'?'restart':'glow';const key='g|'+part+'|'+[fmt(S.L),S.restarts,S.cleared,S.voy,glowSel,JSON.stringify(S.ag),lg].join('|');if(pbody.dataset.k===key)return;let h='';
  if(part==='restart'){
    if(S.voy)h+='<div class="phead"><span class="lab">RESTART</span><span class="num" style="font-size:12px;color:var(--ink-dim)">残光 '+fmt(S.L)+'</span></div><div class="note">航海に出ているので、故郷には戻らない。残光は、進んだ距離が2倍になるたびに入ってくる。</div>';
    else h+='<div class="phead"><span class="lab">RESTART</span><span class="num" style="font-size:12px;color:var(--ink-dim)">残光 '+fmt(S.L)+'</span></div>'+
    '<div class="row"><span>得られる残光</span><span class="big">'+fmt(lg)+'</span></div>'+
    '<div class="note">故郷に着いたあと、もう一度、遠い宙域から船を出せる。歪みとスキル、距離、故郷の年月はなくなり、色もまた失っていく。日誌と実績、残光は残る。</div>'+
    '<button class="act" id="rsGo"'+(lg<1?' disabled':'')+'>再出発する</button>'+(!S.cleared?'<div class="note">故郷に着くと使える。</div>':'')+
    '<div class="row" style="margin-top:10px"><span class="note" style="margin:0">これまでの再出発</span><span class="num">'+S.restarts+' 回</span></div>';}
  else h+='<div class="phead"><span class="lab">AFTERGLOW</span><span class="num" style="font-size:12px;color:var(--ink-dim)">残光 '+fmt(S.L)+'</span></div>'+glowHorizon();
  pbody.dataset.k=key;pbody.innerHTML=h;
  pbody.querySelectorAll('[data-gs]').forEach(g=>g.onclick=()=>{glowSel=g.dataset.gs;pbody.dataset.k='';renderGlow();});
  const gb=document.getElementById('gBuy');if(gb)gb.onclick=()=>{if(buyGlow(glowSel)){fla=Math.max(fla,0.1);GLOWFX={id:glowSel,t:Date.now()};pbody.dataset.k='';renderGlow();}};
  const rs=document.getElementById('rsGo');if(rs)rs.onclick=()=>confirmBox('再出発','残光を '+fmt(lg)+' 得て、遠い宙域からもう一度船を出す。歪みとスキル、距離、故郷の年月はなくなる。日誌と実績、残光は残る。',()=>{startBrake(0);BRK.rs=true;});}
/* ③ さらに遠くへ（GALAXY タブ） */
function renderVoy(){let h='';const part=curTab==='wake'?'wake':'voy';
  if(part==='voy'&&!S.voy&&canVoyage())h+='<div class="phead"><span class="lab">FARTHER</span></div><div class="note">上位の星がすべて灯った。故郷を出発点に、もっと遠くへ航海に出られる。②の周回は終わり、緊急停止とスキル選びは自動になる。残光とその強化、灯した星、実績は残る。</div><button class="act" id="farGo">さらに遠くへ</button>';
  if(part==='wake')h+='<div class="phead"><span class="lab">WAKE</span><span class="num" style="font-size:12px;color:var(--ink-dim)">航跡 '+fmt(S.T)+'</span></div>'+(S.voy?'':'<div class="note">航海に出ると、航跡で航海を強くできる。</div>');
  if(part==='voy'&&S.voy){const tgn=tGain(),n=nextDest();
    h+='<div class="phead"><span class="lab">VOYAGE</span><span class="num" style="font-size:12px;color:var(--ink-dim)">航跡 '+fmt(S.T)+'</span></div>'+
    '<div class="row"><span>引き直すと得る航跡</span><span class="big">'+fmt(tgn)+'</span></div>'+
    '<div class="row" style="padding:2px 0"><span class="note" style="margin:0">この航海で進んだ距離</span><span class="num">'+lyText(S.vdist)+' 光年</span></div>'+
    '<div class="row" style="padding:2px 0"><span class="note" style="margin:0">次の目的地</span><span class="num">'+(n?n.name+'（'+lyText(n.ly)+' 光年）':'もう、ない')+'</span></div>'+
    '<div class="note">航路を引き直すと、故郷から航海をやり直す。距離と①の中身、歪みとスキルはなくなる。航跡、見つけた色と装置、残光とその強化は残る。航海では緊急停止とスキル選びが自動になり、進んだ距離が2倍になるたびに（1万・2万・4万光年…）残光が入る（1回 '+fmt(lPer())+'）。</div>'+
    '<button class="act" id="vrGo"'+(tgn<1?' disabled':'')+'>航路を引き直す</button>';}
  if(part==='wake'&&S.voy){
    TRAIL.forEach(a=>{const l=tg(a.id),n2=trailNext(a.id),pips=a.max?Array.from({length:a.max},(_,k)=>k<l?'●':'○').join(''):'Lv '+l;
      h+='<div class="dv"><div class="dvRow"><div style="flex:1;min-width:0"><div class="dvName">'+a.name+'　<span class="num" style="font-size:11px;letter-spacing:.2em;color:var(--ink-dim)">'+pips+'</span></div>'+
      '<div class="dvTrait">'+(l?'いま：'+a.text(l)+(n2?'<br>':''):'')+(n2?'次：'+n2.text:'')+'</div></div>'+
      (n2?'<button class="buy" data-t="'+a.id+'"'+(S.T<n2.cost?' disabled':'')+'>航跡 '+fmt(n2.cost)+'</button>':'')+'</div></div>';});}
  pbody.dataset.k='';pbody.innerHTML=h;
  pbody.querySelectorAll('[data-t]').forEach(b=>b.onclick=()=>{if(buyTrail(b.dataset.t)){fla=Math.max(fla,0.1);renderPanel(true);}});
  const vr=document.getElementById('vrGo');if(vr)vr.onclick=()=>confirmBox('航路を引き直す','航跡を '+fmt(tGain())+' 得て、故郷から航海をやり直す。距離と装置、歪みとスキルはなくなる。航跡、見つけた色と装置、残光は残る。',()=>{startBrake(0);BRK.vr=true;});
  const fg=document.getElementById('farGo');if(fg)fg.onclick=()=>confirmBox('さらに遠くへ','故郷を出発点に、隣の銀河へ航海に出る。②の周回は終わり、緊急停止とスキル選びは自動になる。残光とその強化、灯した星は残る。',()=>{goFarther();});}
let logMode='log';
function renderLog(){pbody.dataset.k='';let h='<div class="phead"><span class="lab">LOG</span><span class="seg"><button data-m="log">日誌</button><button data-m="ach">実績 '+S.ach.length+'/'+ACHIEVEMENTS.length+'</button></span></div>';
  if(logMode==='log'){S.log.slice().reverse().forEach((e,j)=>{const col=e.c>=0?rgb(COLORS[e.c].rgb,1):'var(--ink-dim)';h+='<div class="le"><span class="y" style="color:'+col+'">故郷 '+e.y.toLocaleString('ja-JP')+'年</span><span class="t" style="opacity:'+(j===0?1:0.75)+'">'+e.t+'</span></div>';});}
  else{h+='<div class="row" style="padding:2px 0 8px"><span class="note" style="margin:0">実績1つにつき、すべての生産 +'+Math.round(ACH_BONUS*100)+'%。リセットしても消えない</span><span class="num">×'+achMult().toFixed(2)+'</span></div>';ACHIEVEMENTS.forEach(a=>{const on=S.ach.includes(a[0]);h+='<div class="ach'+(on?'':' off')+'"><span style="width:12px">'+(on?'✦':'·')+'</span><span style="flex:1">'+a[1]+'</span><span style="color:var(--ink-dim)">'+a[2]+'</span></div>';});}
  pbody.innerHTML=h;pbody.querySelectorAll('.seg button').forEach(b=>{b.setAttribute('aria-pressed',b.dataset.m===logMode);b.onclick=()=>{logMode=b.dataset.m;renderLog();};});}
