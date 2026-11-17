'use strict';
/* =====================================================================
   UI ― パネル（上の段 DRIVE・BOOST・BATTERY・LOG、下の段は層 HOME・STAR・GALAXY（のちに UNIVERSE・LIGHT））
   ===================================================================== */
/* タブ */
let curTab='drive',buyMode='1';
/* タブは入れ子：下の段で層（HOME・STAR・GALAXY）と LOG を選び、上の段にその層の中のタブを出す。層が1つのうちは1段 */
const LAYERS=[{id:'home',name:'HOME',tabs:['drive','boost','battery','reset']},{id:'star',name:'STAR',tabs:['restart','stars']},{id:'galaxy',name:'GALAXY',tabs:['photon','sail','voy','wake']},{id:'universe',name:'UNIVERSE',tabs:['uni']},{id:'light',name:'LIGHT',tabs:['light']},{id:'etc',name:'ETC',tabs:['log','ach','stats','set']}];
const TAB_NAME={drive:'DRIVE',boost:'BOOST',battery:'METEOR',skill:'SKILL',reset:'STOP',restart:'RESTART',glow:'UPGRADE',stars:'CHALLENGE',voy:'VOYAGE',photon:'PHOTON',sail:'SAIL',wake:'WAKE',uni:'LAW',light:'LIGHT',log:'LOG',ach:'RECORD',stats:'STATS',set:'SETTING'};
const lastTab={home:'drive',star:'restart',galaxy:'voy',universe:'uni',light:'light',etc:'log'};let curLayer='home',tabs=[],tabKey='';
function layerOpen(id){return id==='home'||id==='etc'||(id==='star'&&(S.cleared||S.restarts>0||S.lTotal>0))||(id==='galaxy'&&(S.voy||S.voyStash||canVoyage()))||(id==='universe'&&(S.uni>0||canFold()))||(id==='light'&&(law('lc')>=10||S.lightDone));}
function layerOf(t){const L=LAYERS.find(x=>x.tabs.includes(t));return L?L.id:null;}
function tabClick(t){if(t==='skill'){openSkill(false);return;}curTab=t;renderPanel(true);}
function buildTabs(){const open=LAYERS.filter(L=>layerOpen(L.id));   // 上の段に層（HOME〜LIGHT と ETC）、下の段にその層の中のタブ
  const sub=LAYERS.find(L=>L.id===curLayer).tabs.filter(t=>!tabHidden(t));
  const key=sub.join()+'|'+open.map(L=>L.id).join();if(key===tabKey)return;tabKey=key;
  const mk=(t,cls,label)=>'<button data-t="'+t+'"'+(cls?' class="'+cls+'"':'')+' role="tab">'+label+'</button>';
  document.getElementById('tr1').innerHTML=sub.map(t=>mk(t,'',TAB_NAME[t])).join('');
  const r2=document.getElementById('tr2');r2.innerHTML=open.map(L=>'<button data-l="'+L.id+'" role="tab"><i></i>'+L.name+'</button>').join('');r2.classList.toggle('many',open.length>=6);
  tabs=[...document.querySelectorAll('#tabs button')];
  tabs.forEach(b=>b.addEventListener('click',()=>{SND.play('tab');if(b.dataset.l){curTab=lastTab[b.dataset.l];curLayer=b.dataset.l;renderPanel(true);return;}tabClick(b.dataset.t);}));}
let skillOpen=false,lastWShown=-1;
function openSkill(pick,gained){skillPick=!!pick;skillOpen=true;PANX=0;PANY=0;PANS=1;const ov=document.getElementById('skillOv');ov.classList.add('on','intro','fadeIn');renderSkill();
  const box=document.getElementById('skBody');box.querySelectorAll('#skPan > line').forEach((l,i)=>l.style.animationDelay=(0.2+i*0.035).toFixed(2)+'s');box.querySelectorAll('.node').forEach(n=>{const k=SKILLS.find(z=>z.id===n.dataset.id);n.style.animationDelay=(0.35+k.step*0.14+k.br*0.05).toFixed(2)+'s';});
  requestAnimationFrame(()=>requestAnimationFrame(()=>ov.classList.remove('fadeIn')));setTimeout(()=>ov.classList.remove('intro'),2400);
  if(pick&&gained){const w=document.getElementById('skW'),to=S.W,from=Math.max(0,to-gained),t0=performance.now()+500;lastWShown=S.W;const step=()=>{const p=Math.min(1,Math.max(0,(performance.now()-t0)/1300)),q=1-Math.pow(1-p,3);w.textContent='歪み '+fmt(Math.round(from+(to-from)*q));if(p<1&&skillOpen)requestAnimationFrame(step);else if(skillOpen){w.textContent='歪み '+fmt(S.W);paintWm();}};w.textContent='歪み '+fmt(from);requestAnimationFrame(step);}}
function closeSkill(){const wasPick=skillPick;skillOpen=false;skillPick=false;if(wasPick)startRestart();document.getElementById('skillOv').classList.remove('on');renderPanel(true);}
// 変わったときだけ書き込む（同じ値でも書くたびに、iPhone では文字が描き直されて明るさがちらつく）
function setSel(b,v){const s=v?'true':'false';if(b.getAttribute('aria-selected')!==s)b.setAttribute('aria-selected',s);}
function setCls(b,c,v){if(b.classList.contains(c)!==!!v)b.classList.toggle(c,!!v);}
function paintTabs(){buildTabs();tabs.forEach(b=>{if(b.dataset.l){setSel(b,b.dataset.l===curLayer);return;}setSel(b,b.dataset.t===curTab);setCls(b,'locked',tabLocked(b.dataset.t));});}
function tabHidden(t){const L=layerOf(t);if(L&&!layerOpen(L))return true;if((t==='photon'||t==='sail')&&(!S.voy||S.chal))return true;return (t==='battery'&&((S.chal==='c7'&&S.chalLv>=2)||!S.flags.bat))||(t==='reset'&&((S.maxStage<BRAKE_STAGE&&S.restarts===0)||(S.voy&&!S.chal)))||(t==='skill'&&S.prestiges<1&&S.W<1&&S.skills.length===0&&S.lTotal===0);}   // 層が開くまでタブごと出さない
function tabLocked(t){return (t==='skill'&&S.prestiges<1&&S.W<1&&S.skills.length===0&&S.lTotal===0)||(t==='battery'&&!S.flags.bat);}
let devUI=[],TIERFX=null;
/* 次の章までの道しるべ（2026-11-16）：STAR・GALAXY・UNIVERSE・LIGHT の層の上に一行。いまの章と、次の扉までの進み具合 */
function chapterHint(){const ks=SKILLS.filter(k=>k.glow).length,n=S.lit.length;
  if(S.lightDone)return ['終章','光になった。旅は、まだ続けられる。',1];
  if(S.voy||S.voyStash||S.uni>0){if(law('lc')>=LAWS.find(L=>L.id==='lc').max)return ['次の章　光になる','9を22個並べる　いま9が'+nines(Math.max(S.stage,S.maxStage))+'個',Math.min(1,nines(S.maxStage)/22)];
    if(S.uni>0||canFold())return ['次の章　光になる','光の上限 '+law('lc')+' / 10',law('lc')/10];
    const e=DEST[DEST.length-1].ly;return ['次の章　新しい宇宙','宇宙の果てまで あと '+lyText(Math.max(0,e-S.vdist))+' 光年',Math.min(1,Math.log10(1+S.vdist)/Math.log10(e))];}
  return ['次の章　さらに遠くへ','上位の星 '+n+' / '+ks+(n>=ks?'　故郷に着くと開く':''),n/ks];}
function paintChap(){const el=document.getElementById('chap'),L=curLayer;if(!(L==='star'||L==='galaxy'||L==='universe'||L==='light')){el.innerHTML='';el.style.display='none';return;}
  const [a,b,p]=chapterHint();el.style.display='';el.innerHTML='<span class="cL">'+a+'</span><span class="cB"><i style="width:'+Math.round(Math.max(0,Math.min(1,p))*100)+'%"></i></span><span class="cR">'+b+'</span>';}
function renderPanel(force){
  if(tabHidden(curTab))curTab='drive';
  curLayer=layerOf(curTab)||'home';lastTab[curLayer]=curTab;
  const isSet=curTab==='set',ps=document.getElementById('pset');pbody.style.display=isSet?'none':'';ps.style.display=isSet?'':'none';
  paintTabs();paintChap();
  if(curTab==='drive')renderDrive(force);else if(curTab==='boost')renderBoost();else if(curTab==='battery')renderBattery();else if(curTab==='reset')renderReset();else if(curTab==='glow'||curTab==='restart')renderGlow();else if(curTab==='stars')renderUnlock();else if(curTab==='voy'||curTab==='wake')renderVoy();else if(curTab==='photon'||curTab==='sail')renderPhoton();else if(curTab==='uni')renderUniverse();else if(curTab==='light')renderLight();else if(curTab==='set')renderSet();else if(curTab==='stats')renderStats();else renderLog();
}
function devVisible(i){return devOpen(i);}
function upgVisible(u){return !upgHas(u.id)&&S.dev[u.dev]>=u.need;}
function renderDrive(force){
  const order=DEVICES.map((_,i)=>i).sort((a,b)=>(DEVICES[a].find||0)-(DEVICES[b].find||0)||DEVICES[a].unlock-DEVICES[b].unlock);
  const visible=order.filter(devVisible);const nextLocked=order.find(i=>i!==ANCHOR&&!devVisible(i)&&(!DEVICES[i].find||S.voy));
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
      const bt=w.querySelector('.buy');bt.addEventListener('click',()=>{if(buyDevice(i,buyMode)){SND.play('buy',DEVICES[i].col);const r=bt.getBoundingClientRect();for(let k=0;k<10;k++){const a=-1.57+R(-1,1),v=R(0.5,1.7);P.push({x:r.left+r.width/2,y:r.top,vx:Math.cos(a)*v,vy:Math.sin(a)*v,l:1,c:colRGB(d.col),r:R(0.8,1.8),gr:A[d.col]<0.5,dr:0.02});}updateDrive();}});
      devUI.push({i,el:w,hint:w.querySelector('.tierHint'),em,ticks,cnt:w.querySelector('.dvCnt'),out:w.querySelector('.dvOut'),bt,rg:w.querySelector('.rg'),spn:w.querySelector('.spn'),upBtns});});
    if(nextLocked!=null){const d=DEVICES[nextLocked],w=document.createElement('div');w.className='dv dvLocked';w.innerHTML='<div class="dvRow"><svg width="26" height="26" viewBox="0 0 26 26"><circle cx="13" cy="13" r="11.5" fill="none" stroke="#fff" stroke-width=".6" stroke-dasharray="2 3"/></svg><div style="flex:1"><div class="dvName">？？？</div><div class="dvOut">'+(d.find?(S.found<d.find?DEST[d.find-1].name+'に着くと現れる':speedText(d.unlock)+'で現れる'):speedText(d.unlock)+'で現れる')+'</div></div></div>';pbody.appendChild(w);}
  }
  updateDrive();paintDeviceColors();
}
function tierHintHTML(i,tn){return '<span class="nw swp">右へスワイプ<span class="arr">››</span></span> <span class="nw">TIER '+ROMAN[tn.t]+'（'+(tn.t===3&&SYN[i]?'相乗：'+SYN[i]:'生産×'+fmtG(TIER_X*(has('e5')?1.25:1)))+'）</span> '+(tn.lock?'<span class="nw">あと加速 '+(tn.st-S.stage)+' 回で開く</span>':'<span class="nw num">必要 '+fmt(tn.cost)+'</span>')+'';}
// TIER が上がったら、その行の表示だけ書き換える（一覧ごと作り直すと、自動で上がるたびにちらつく）
function refreshTier(i){const u=devUI.find(x=>x.i===i);if(!u)return;const r=u.el.querySelector('.tierR');if(r){r.textContent='TIER '+ROMAN[S.tier[i]];r.classList.remove('tierNew');void r.offsetWidth;r.classList.add('tierNew');}
  if(u.hint){const tn=tierNext(i);if(tn)u.hint.innerHTML=tierHintHTML(i,tn);else{u.hint.remove();u.hint=null;}}}
function autoLabel(i){return S.auto[i]?'自動':'手動';}
function updateDrive(){const gm=globalMult();devUI.forEach(u=>{const i=u.i,k=buyMode==='max'?Math.max(1,devMax(i)):+buyMode,c=devCost(i,k);u.cnt.textContent=String(S.dev[i]).padStart(3,'0');
  if(i===ANCHOR)u.out.textContent='故郷の時間 −'+Math.round(anchorCut()*100)+'%';else{const tm=traitMult(i);u.out.textContent='+'+fmt(devRateRaw(i)*gm)+' / 秒'+(tm>1.001?'　個性 ×'+tm.toFixed(2):'');}
  u.bt.textContent=chalBlocksDevice(i)?'縛り':(buyMode==='1'?'':'×'+k+' ')+fmt(c);u.bt.disabled=c>S.E||chalBlocksDevice(i);
  const rm=i===ANCHOR?1:regionMult(i);if(rm!==1){u.rg.style.display='';u.rg.textContent='区域 ×'+rm;}else u.rg.style.display='none';
  if(u.spn){const sp=DEVICES[i].spawn;u.spn.textContent=(S.dev[i]*sp.rate).toFixed(1);}
  u.upBtns.forEach(([b,up])=>b.disabled=S.E<up.cost);if(u.hint){const tn=tierNext(u.i),cnt=!!(tn&&S.dev[u.i]>=tn.need),can=cnt&&!tn.lock&&S.E>=tn.cost;if(tn){const hk=tn.t+'|'+tn.lock+'|'+S.stage;if(u.hint.dataset.k!==hk){u.hint.dataset.k=hk;u.hint.innerHTML=tierHintHTML(u.i,tn);}}u.hint.classList.toggle('can',can);u.hint.style.display=cnt?'':'none';const sw=u.hint.querySelector('.swp');if(sw)sw.style.display=can?'':'none';const dc=DEVICES[u.i].col,cc=mix(colRGB(dc),G,1-A[dc]);if(!u.el.dataset.sweep)u.el.style.background=can?'linear-gradient(90deg,'+rgb(cc,0.16)+','+rgb(cc,0.02)+')':'';u.el.style.boxShadow=cnt?'inset 2px 0 0 '+rgb(cc,can?0.9:0.5):'';}});
}
function paintDeviceColors(){devUI.forEach(u=>{const d=DEVICES[u.i],a=A[d.col],base=mix(d.col===5?[230,232,240]:colRGB(d.col),G,1-a),col=rgb(devGlow>0.05?mix(base,[255,255,255],devGlow*0.5):base,1);u.em.parts.forEach(p=>p.setAttribute('stroke',col));u.em.core.setAttribute('fill',col);
  if(!u.ticks.length)return;const n=S.dev[u.i],scale=n>=100?2:1;for(let k=0;k<100;k++){const t=u.ticks[k];t.style.background=(k+1)*scale<=n?col:(t.big?'rgba(255,255,255,.3)':'rgba(255,255,255,.12)');}});}
function renderBoost(){const s=S.stage,nx=s+1,c=nx<=maxStage()?accelCost(nx):0,cap=batteryCap(),blocked=false,dil=s>=DILATION_STAGE,g=timeGamma(s);
  let h='<div class="phead"><span class="lab">'+(dil?'SHIP TIME':'VELOCITY')+'</span></div>';
  if(dil)h+='<div class="row"><span>時間の進み</span><span class="big">/'+fmtG(g)+'</span></div><div class="row"><span class="note" style="margin:0">船の1秒の間に外で過ぎる時間（＝生産の倍率）</span><span class="num">'+fmtG(g)+'秒</span></div><div class="row"><span class="note" style="margin:0">速度</span><span class="num">'+speedText(s)+'</span></div>';
  else h+='<div class="row"><span>いまの速度</span><span class="big">'+speedText(s)+'</span></div><div class="row"><span class="note" style="margin:0">'+(s>=6?'秒速':'光速の')+'</span><span class="num">'+(s>=6?kmsOf(s).toLocaleString('ja-JP')+'km':stagePct(s)+'%')+'</span></div>';
  if(nx<=maxStage()){const label=nx>DILATION_STAGE?'時間の進み /'+fmtG(timeGamma(nx))+' まで加速する':speedText(nx)+'まで加速する';
    if(has('aA'))h+='<div class="row"><span class="note" style="margin:0">自動加速</span><button class="auto" id="bAuto"'+(S.autoAcc?' data-on':'')+'>'+(S.autoAcc?'自動':'手動')+'</button></div>';
    h+='<button class="act" id="bAcc"'+(S.E<c||blocked?' disabled':'')+'>'+label+'　<span class="num">'+fmt(c)+'</span></button>';
    const ratio=(timeGamma(nx)/g).toFixed(1),un=DEVICES.filter(d=>d.unlock===nx).map(d=>d.name);
    if(blocked)h+='<div class="note">故郷まで残り'+Math.round((1-ARRIVE_RATIO)*100)+'%（'+fmt(GOAL_LY*(1-ARRIVE_RATIO))+'光年）に近づくと開く。</div>';
    else if(nx>DILATION_STAGE)h+='<div class="note">光速の'+stagePct(nx)+'%へ。速さはほとんど変わらないが、船の時間の進みが約'+ratio+'倍ゆっくりになる。外から届く光は早回しになり、生産も故郷で過ぎる時間も約'+ratio+'倍になる。</div>';
    else if(nx===DILATION_STAGE)h+='<div class="note">光速の90%を超えると、船の時間の進みがはっきり遅くなり始める。外の光が早回しで届くので、ここから先は加速するほど生産が大きく伸びる。</div>';
    else h+='<div class="note">加速すると太陽帆がよく働き、故郷への航路も早く進む。'+(un.length?un.join('、')+'が使えるようになる。':'')+''+'</div>';}
  else h+='<div class="note">これ以上は加速できない。</div>';
  pbody.dataset.k='';pbody.innerHTML=h;
  const a=document.getElementById('bAcc');if(a)a.onclick=()=>{accelerate();renderPanel(true);};const au=document.getElementById('bAuto');if(au)au.onclick=()=>{S.autoAcc=!S.autoAcc;renderPanel(true);};
}
/* 流星群の器（METEOR）：窓を横切る流れ星を捕まえて器を満たし、流星群を呼ぶ。上の4つの点が予報の段 */
function renderBattery(){const tier=vesTier(),v=S.vessel||0,top=VES[VES.length-1].need,key='bt|'+[Math.floor(v),tier,!!SHOWER,S.autoRel,has('aR')].join('|');if(pbody.dataset.k===key)return;pbody.dataset.k=key;
  const W=360,y0=26,x0=40,x1=320,xs=VES.map((_,i)=>x0+(x1-x0)*i/(VES.length-1));
  let pos=0;for(let i=0;i<VES.length;i++){if(v>=VES[i].need)pos=xs[i];else{const p0=i?VES[i-1].need:0,px=i?xs[i-1]:x0-30;pos=px+(xs[i]-px)*Math.max(0,(v-p0)/(VES[i].need-p0));break;}}
  let svg='<svg class="uniSky" viewBox="0 0 '+W+' 230" aria-label="流星群の器" style="max-height:280px"><defs><linearGradient id="vsl"><stop offset="0" stop-color="#ffd6aa" stop-opacity="0"/><stop offset="1" stop-color="#ffd6aa" stop-opacity=".85"/></linearGradient><radialGradient id="vsg"><stop offset="0" stop-color="#ffd6aa" stop-opacity=".45"/><stop offset="1" stop-color="#ffd6aa" stop-opacity="0"/></radialGradient></defs>'+
    '<line x1="'+x0+'" y1="'+y0+'" x2="'+x1+'" y2="'+y0+'" stroke="rgba(255,236,200,.18)" stroke-width=".6"/>'+(pos>x0-30?'<line x1="'+(x0-30)+'" y1="'+y0+'" x2="'+Math.min(x1,pos).toFixed(1)+'" y2="'+y0+'" stroke="url(#vsl)" stroke-width="1.2"/>':'');
  VES.forEach((q,i)=>{const on=i<=tier;svg+=(on?'<circle cx="'+xs[i]+'" cy="'+y0+'" r="11" fill="url(#vsg)"/><circle cx="'+xs[i]+'" cy="'+y0+'" r="2.6" fill="#ffe2be"/>':'<circle cx="'+xs[i]+'" cy="'+y0+'" r="1.5" fill="rgba(236,238,242,'+(i===tier+1?0.6:0.28)+')"/>')+
    '<text x="'+xs[i]+'" y="'+(y0+20)+'" text-anchor="middle" font-size="10" fill="rgba(236,238,242,'+(on?0.85:0.42)+')">'+q.n+'</text>';});
  // 器：底の丸い弧に、捕まえた流れ星の数だけ光の粒
  const cx2=180,cy2=70,r=72;svg+='<path d="M'+(cx2-r*0.95)+' '+(cy2+r*0.3)+' A'+r+' '+r+' 0 0 0 '+(cx2+r*0.95)+' '+(cy2+r*0.3)+'" fill="none" stroke="rgba(236,238,242,.25)" stroke-width=".7"/>';
  let seed=7;const rnd=()=>{seed=(seed*16807)%2147483647;return seed/2147483647;};const n=Math.round(Math.min(1,v/top)*260),cols=[[255,226,190]].concat(COLORS.slice(0,6).map(c=>c.rgb));
  const pts=[];for(let i=0;pts.length<260&&i<6000;i++){const a=0.05*Math.PI+rnd()*0.9*Math.PI,rr=Math.sqrt(rnd())*r*0.93,px=cx2+Math.cos(a)*rr,py=cy2+Math.sin(a)*rr;if(py>cy2+r*0.3+2)pts.push([px,py]);}   // 器の内側（縁より下）。下から満ちる
  pts.sort((p,q)=>q[1]-p[1]);for(let i=0;i<n;i++){const [px,py]=pts[i],c=cols[rnd()<0.15?1+Math.floor(rnd()*6):0];svg+='<circle cx="'+px.toFixed(1)+'" cy="'+py.toFixed(1)+'" r="'+(0.5+rnd()*0.9).toFixed(2)+'" fill="'+rgb(c,(0.3+rnd()*0.6).toFixed(2))+'"/>';}
  if(n>0)svg+='<ellipse cx="'+cx2+'" cy="'+(cy2+r*0.75)+'" rx="'+(r*0.8)+'" ry="'+(r*0.35)+'" fill="url(#vsg)" opacity="'+(0.3+0.5*v/top).toFixed(2)+'"/>';
  svg+='<text x="'+cx2+'" y="'+(cy2+r+28)+'" text-anchor="middle" font-size="20" class="num" fill="rgba(236,238,242,.9)">'+Math.floor(v)+'<tspan font-size="11" fill="rgba(236,238,242,.5)"> / '+top+'</tspan></text>'+
    '<text x="'+cx2+'" y="'+(cy2+r+46)+'" text-anchor="middle" font-size="10" fill="rgba(236,238,242,.5)">器の中の流れ星</text></svg>';
  const nx=VES[tier+1],cur=VES[tier],cnt=c=>Math.round(c.count*(has('e3')?1.5:1));
  let d='<div class="note" style="margin:2px 0 10px">'+(cur?'いま呼ぶと「'+cur.n+'」。約'+cur.dur+'秒、およそ'+cnt(cur)+'個。':'窓を横切る流れ星をタップで捕まえると、器に入る。')+(nx?'<br>「'+nx.n+'」まで あと'+Math.ceil(nx.need-v)+'個':'')+'</div>';
  if(has('aR'))d+='<div class="row"><span class="note" style="margin:0">極大になったら自動で呼ぶ</span><button class="auto" id="aRel"'+(S.autoRel?' data-on':'')+'>'+(S.autoRel?'自動':'手動')+'</button></div>';
  d+='<button class="act" id="vGo"'+(canShower()&&!SHOWER?'':' disabled')+' style="border-color:rgba(255,214,170,.7);color:#ffe2be;letter-spacing:.12em">'+(SHOWER?'流星群が降っている':'流星群を呼ぶ')+'</button>'+
    '<div class="note">流星群の流れ星は、タップか、指でなぞって捕まえる。一筆で何個も捕まえるほど、続けて捕まえるほど大きく入る。</div>';
  pbody.innerHTML='<div class="phead"><span class="lab">METEOR</span><span class="num" style="font-size:12px;color:var(--ink-dim)">流星群の器</span></div>'+svg+'<div class="gDet">'+d+'</div>';
  const ar=document.getElementById('aRel');if(ar)ar.onclick=()=>{S.autoRel=!S.autoRel;pbody.dataset.k='';renderBattery();};
  const go=document.getElementById('vGo');if(go)go.onclick=()=>{if(startShower())renderPanel(true);};}

function renderReset(){const g=wGain();let h='<div class="phead"><span class="lab">EMERGENCY STOP</span></div><div class="row"><span>得られる歪み</span><span class="big">'+fmt(g)+'</span></div>'+
  '<div class="note">緊急停止すると、エネルギー、速度、装置、TIER がなくなる。流星群の器はそのまま。進んだ距離と、故郷で過ぎた年月は戻らない。停止のあと星図が開き、歪みで新しいスキルを覚えられる。</div>'+
  '<button class="act" id="rGo"'+(S.stage<BRAKE_STAGE||g<1||S.chal==='pR'?' disabled':'')+'>緊急停止する</button>'+(S.chal==='pR'?'<div class="note">チャレンジ「止まらない」の間は止まれない。</div>':'')+(S.stage<BRAKE_STAGE?'<div class="note">光速の90%に達すると使える。</div>':'')+
  '<div class="row" style="margin-top:10px"><span class="note" style="margin:0">持っている歪み '+fmt(S.W)+'（使わずにいると1つにつき生産+1%）</span><span class="num">×'+fmtG(wMult())+'</span></div>'+
  '<div class="row"><span class="note" style="margin:0">これまでの停止</span><span class="num">'+S.prestiges+' 回</span></div>'+
  ((S.prestiges>0||S.skills.length||S.lTotal>0)?'<button class="act" id="rMap" style="margin-top:10px;opacity:.8">星図を見る</button>':'');
  pbody.dataset.k='';pbody.innerHTML=h;
  const mp=document.getElementById('rMap');if(mp)mp.onclick=()=>openSkill(false);
  document.getElementById('rGo').onclick=()=>confirmBox('緊急停止','歪みを '+fmt(g)+' 得て、速度0からやり直す。距離と年月はそのまま残る。このあとスキルを選べる。',()=>{startBrake(g);});}
/* ② 再出発と残光（STAR タブ）。強化は「残照の地平」：日が沈んだあとの地平線に、強化ごとの光の筋が段に応じて空へ伸びる */
let glowSel='rm',GLOWFX=null;
/* 残照の地平（2026-11-15 作り直し）：夕焼けの地平線を小窓いっぱいの景色にし、強化ごとの光の筋をその上に並べる。
   見出しと結果は上、選んだ強化の説明と「灯す」「船を出す」は下の中央に、枠なしで重ねる */
function glowScene(W,H,hz){const n=AFTERGLOW.length,span=Math.min(W-48,Math.max(320,W*0.7),980),x0=(W-span)/2,sp=span/n,xs=AFTERGLOW.map((_,i)=>x0+sp*(i+0.5)),st=Math.max(18,Math.min(30,(hz-140)/9));
  let v='<svg class="gScene" width="'+W+'" height="'+H+'" viewBox="0 0 '+W+' '+H+'" role="group" aria-label="残光の強化"><defs><linearGradient id="gSky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="rgb(150,80,90)" stop-opacity="0"/><stop offset=".55" stop-color="rgb(150,80,90)" stop-opacity=".07"/><stop offset="1" stop-color="rgb(255,150,90)" stop-opacity=".30"/></linearGradient>'+
    '<radialGradient id="gSun" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="rgb(255,150,90)" stop-opacity=".30"/><stop offset=".6" stop-color="rgb(255,150,90)" stop-opacity=".08"/><stop offset="1" stop-color="rgb(255,150,90)" stop-opacity="0"/></radialGradient>'+
    '<linearGradient id="gRay" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stop-color="rgb(255,214,170)" stop-opacity=".85"/><stop offset="1" stop-color="rgb(255,214,170)" stop-opacity="0"/></linearGradient>'+
    '<linearGradient id="gLine" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="rgb(255,200,150)" stop-opacity="0"/><stop offset=".2" stop-color="rgb(255,200,150)" stop-opacity=".5"/><stop offset=".8" stop-color="rgb(255,200,150)" stop-opacity=".5"/><stop offset="1" stop-color="rgb(255,200,150)" stop-opacity="0"/></linearGradient>'+
    '<linearGradient id="gTail" x1="1" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff" stop-opacity="0"/><stop offset="1" stop-color="#fff" stop-opacity=".9"/></linearGradient><radialGradient id="gDot"><stop offset="0" stop-color="rgb(255,214,170)" stop-opacity=".6"/><stop offset="1" stop-color="rgb(255,214,170)" stop-opacity="0"/></radialGradient></defs>'+
    '<rect x="0" y="0" width="'+W+'" height="'+hz+'" fill="url(#gSky)"/><g class="gSunE"><ellipse class="gBreath" cx="'+(W/2)+'" cy="'+hz+'" rx="'+(W*0.62)+'" ry="'+Math.min(220,hz*0.5)+'" fill="url(#gSun)"/></g>';
  // 日が沈んだあとの星（地平線に近いほど少ない）
  {let sd=7;const rnd=()=>{sd=(sd*16807)%2147483647;return sd/2147483647;};const top=Math.max(0,hz-120),m=Math.round(W*top/5200);
    for(let k=0;k<m;k++){const y=rnd()*top,a=(0.15+0.55*rnd())*(1-0.6*y/Math.max(1,top));const tw=rnd()<0.3;v+='<circle'+(tw?' class="gTw" style="animation-delay:-'+(rnd()*5).toFixed(1)+'s"':'')+' cx="'+(rnd()*W).toFixed(1)+'" cy="'+y.toFixed(1)+'" r="'+(0.35+rnd()*0.7).toFixed(2)+'" fill="#eceef2" opacity="'+a.toFixed(2)+'"/>';}
    // これまでの周：故郷に着いた回数だけ、少し大きな星が灯る。続く周どうしは細い線でつなぐ（旅の星座）
    const N=Math.min(80,S.restarts+(S.voy?1:0)),y0=Math.min(top*0.25,140),yr=Math.max(60,top-y0-30),P=[];
    for(let i=0;i<N;i++){const row=Math.floor(i/6),u=0.1+(i%6)*0.15+((row*0.053)%0.1),w=0.8-(row%3)*0.33+0.11*Math.sin(i*1.7+row);P.push([u*W,y0+w*yr]);}   // 6つで一列。列ごとに少し上へ、ずらして重ならないように
    for(let i=1;i<N;i++){const [ax,ay]=P[i-1],[bx,by]=P[i];if(i%6)v+='<line x1="'+ax.toFixed(1)+'" y1="'+ay.toFixed(1)+'" x2="'+bx.toFixed(1)+'" y2="'+by.toFixed(1)+'" stroke="rgb(255,226,190)" stroke-opacity=".3" stroke-width=".7"/>';}
    P.forEach(([x,y],i)=>{const last=i===N-1;v+='<circle cx="'+x.toFixed(1)+'" cy="'+y.toFixed(1)+'" r="'+(last?9:6)+'" fill="url(#gDot)" opacity="'+(last?0.9:0.45)+'"/><circle'+(last&&glowFlow?' class="gNew"':'')+' cx="'+x.toFixed(1)+'" cy="'+y.toFixed(1)+'" r="'+(last?2:1.5)+'" fill="#fff4e6"/>';});
    if(N)v+='<text x="'+P[N-1][0].toFixed(1)+'" y="'+(P[N-1][1]+18).toFixed(1)+'" text-anchor="middle" font-size="10" fill="rgba(255,226,190,.55)">'+N+'</text>';}
  // ときどき横切る流れ星
  v+='<g class="gShoot"><line x1="'+(W*0.72)+'" y1="'+(hz*0.12)+'" x2="'+(W*0.72-70)+'" y2="'+(hz*0.12+38)+'" stroke="url(#gTail)" stroke-width="1.2"/></g>';
  v+='<line x1="0" y1="'+hz+'" x2="'+W+'" y2="'+hz+'" stroke="url(#gLine)" stroke-width=".8"/>';
  // 2026-11-17 動き：開くと筋が左から順に伸び上がる（gRise、#glowOv.gIntro のとき）、ふだんはかすかに揺れる（gSway）、選ぶと class on で明るさだけ切り替える（描き直さない）、灯すと伸びて先端から光の粒がはじける
  AFTERGLOW.forEach((a,i)=>{const l=glow(a.id),x=xs[i],sel=a.id===glowSel,steps=Math.min(l,8),h=st+steps*st+(l>8?Math.min(st,Math.log2(l-7)*6):0),fx=GLOWFX&&GLOWFX.id===a.id&&Date.now()-GLOWFX.t<1200,nq=glowNext(a.id),can=nq&&S.L>=nq.cost,org='transform-origin:'+x.toFixed(1)+'px '+hz+'px';
    v+='<g data-gs="'+a.id+'" class="gG'+(sel?' on':'')+'" style="cursor:pointer;--i:'+i+'"><rect x="'+(x-sp/2)+'" y="'+Math.max(0,hz-h-40)+'" width="'+sp+'" height="'+(h+100)+'" fill="transparent"/>'+
      '<g class="gRise" style="'+org+'"><g class="gSway" style="'+org+';animation-delay:-'+(i*1.3).toFixed(1)+'s">'+
      (l?'<rect x="'+(x-4-Math.min(l,20)*0.4)+'" y="'+(hz-h)+'" width="'+(8+Math.min(l,20)*0.8)+'" height="'+h+'" fill="url(#gRay)" opacity="'+(0.18+Math.min(l,20)*0.015)+'"/>':'')+
      '<rect class="gCore" x="'+(x-0.85-Math.min(l,20)*0.06)+'" y="'+(hz-h)+'" width="'+(1.7+Math.min(l,20)*0.12)+'" height="'+h+'" fill="url(#gRay)">'+(fx?'<animate attributeName="y" from="'+(hz-h+st)+'" to="'+(hz-h)+'" dur=".9s" calcMode="spline" keySplines=".2 .8 .3 1"/><animate attributeName="height" from="'+(h-st)+'" to="'+h+'" dur=".9s" calcMode="spline" keySplines=".2 .8 .3 1"/>':'')+'</rect>';
    for(let k=1;k<=steps;k++)v+='<circle cx="'+x+'" cy="'+(hz-k*st)+'" r="1.5" fill="rgb(255,214,170)" opacity=".8"/>';
    if(can)v+='<circle class="gTip" cx="'+x+'" cy="'+(hz-h)+'" r="2.8" fill="rgb(255,236,210)"/>';
    for(let k=0;k<Math.min(4,Math.ceil(l/2));k++){const dx=((k%2?1:-1)*(3+k*2)).toFixed(1),d=(k*0.9+i*0.37).toFixed(2);   // 先端からこぼれる光
      v+='<circle cx="'+x+'" cy="'+(hz-h)+'" r="1" fill="rgb(255,226,190)" opacity="0"><animate attributeName="cy" from="'+(hz-h)+'" to="'+(hz-h+40)+'" dur="2.6s" begin="'+d+'s" repeatCount="indefinite"/><animate attributeName="cx" from="'+x+'" to="'+(x+ +dx)+'" dur="2.6s" begin="'+d+'s" repeatCount="indefinite"/><animate attributeName="opacity" values="0;.8;0" dur="2.6s" begin="'+d+'s" repeatCount="indefinite"/></circle>';}
    if(fx)for(let k=0;k<14;k++){const an=-Math.PI/2+(Math.random()-0.5)*2.2,dd=30+Math.random()*70,tx=x+Math.cos(an)*dd,ty=hz-h+Math.sin(an)*dd,b=(0.55+Math.random()*0.25).toFixed(2),du=(1+Math.random()*0.8).toFixed(2);   // 灯したとき：先端から光の粒がはじけて昇る
      v+='<circle cx="'+x+'" cy="'+(hz-h)+'" r="'+(0.8+Math.random()*1.2).toFixed(1)+'" fill="rgb(255,236,210)" opacity="0"><animate attributeName="cx" from="'+x+'" to="'+tx.toFixed(1)+'" dur="'+du+'s" begin="'+b+'s" fill="freeze" calcMode="spline" keySplines=".1 .8 .3 1"/><animate attributeName="cy" from="'+(hz-h)+'" to="'+ty.toFixed(1)+'" dur="'+du+'s" begin="'+b+'s" fill="freeze" calcMode="spline" keySplines=".1 .8 .3 1"/><animate attributeName="opacity" values="0;1;0" dur="'+du+'s" begin="'+b+'s" fill="freeze"/></circle>';}
    v+='</g></g><circle cx="'+x+'" cy="'+hz+'" r="14" fill="url(#gDot)"'+(fx?' class="gPop"':'')+'/><circle cx="'+x+'" cy="'+hz+'" r="3.2" fill="rgb(255,226,190)"/>'+
      '<circle class="gSelR" cx="'+x+'" cy="'+hz+'" r="10" fill="none" stroke="rgb(255,214,170)" stroke-opacity=".8" stroke-width=".8"/>'+
      '<g class="gLbl"><text class="gNm" x="'+x+'" y="'+(hz+26)+'" text-anchor="middle" font-size="12">'+a.name+'</text><text x="'+x+'" y="'+(hz+44)+'" text-anchor="middle" font-size="11" fill="'+(can?'rgba(255,214,170,.95)':'rgba(236,238,242,.4)')+'">'+(nq?'残光 '+fmt(nq.cost):'灯りきった')+'</text></g></g>';});
  for(let k=0;k<14;k++){const x=x0+((k*0.618)%1)*span,d=(k*0.71).toFixed(2),dur=(6+(k%4)).toFixed(1);   // 地平線から、光の粒がゆっくり立ちのぼる
    v+='<circle cx="'+x.toFixed(1)+'" cy="'+hz+'" r="'+(0.6+(k%3)*0.3).toFixed(1)+'" fill="rgb(255,214,170)" opacity="0"><animate attributeName="cy" from="'+hz+'" to="'+(hz-180)+'" dur="'+dur+'s" begin="'+d+'s" repeatCount="indefinite"/><animate attributeName="opacity" values="0;.6;0" dur="'+dur+'s" begin="'+d+'s" repeatCount="indefinite"/></circle>';}
  if(glowFlow){glowFlow=false;for(let k=0;k<18;k++){const x=x0+Math.random()*span,d=(0.2+k*0.1).toFixed(2),r=(0.8+Math.random()*1.1).toFixed(1);
    v+='<circle cx="'+x.toFixed(1)+'" cy="-4" r="'+r+'" fill="rgb(255,226,190)" opacity="0"><animate attributeName="cy" from="-4" to="'+hz+'" dur="1.8s" begin="'+d+'s" fill="freeze" calcMode="spline" keySplines=".4 0 .9 .6"/><animate attributeName="opacity" values="0;.9;.9;0" keyTimes="0;.15;.85;1" dur="1.8s" begin="'+d+'s" fill="freeze"/></circle>';}}
  return v+'</svg>';}
function glowDetail(){const a=AFTERGLOW.find(x=>x.id===glowSel)||AFTERGLOW[0],l=glow(a.id),nx=glowNext(a.id);
  return '<div class="gDet"><div class="row" style="padding:0"><span style="font-size:14px">'+a.name+'</span><span class="num" style="font-size:12px;color:var(--ink-dim)">Lv '+l+(a.max?' / '+a.max:'')+'</span></div>'+
    '<div class="note" style="margin:4px 0 0">'+a.what+'</div><div class="gVal">'+a.val(l)+(nx?'<span class="gArr">→</span><b>'+a.val(l+1)+'</b>':'')+'</div>'+
    '<div class="note" style="margin:0 0 2px">'+(nx?a.hint+'。':'これ以上は灯せない。')+'</div>'+
    (nx?'<button class="act" id="gBuy"'+(S.L<nx.cost?' disabled':'')+' style="border-color:rgba(255,200,140,.6);color:#ffd6aa">灯す　残光 '+fmt(nx.cost)+'</button>':'')+'</div>';}
/* 残光の強化は合間に開く（2026-11-09）：故郷に着いて再出発するときと、航路を引き直すときに「残照の地平」が開き、閉じると船を出す */
let glowOpen=false,glowAfter=null,glowFlow=false;
function glowAffordable(){return AFTERGLOW.some(a=>{const n=glowNext(a.id);return n&&S.L>=n.cost;});}
function glowAutoSpend(){let b=true;while(b){b=false;const c=AFTERGLOW.map(a=>[a.id,glowNext(a.id)]).filter(x=>x[1]&&x[1].cost<=S.L).sort((x,y)=>x[1].cost-y[1].cost)[0];if(c){buyGlow(c[0]);b=true;}}}
// 合間に開いたとき、いま終えた周の結果を一行で出す
function glowResult(){const r=S.lastRun;if(!r||Date.now()-r.at>10*60*1000)return '';
  return r.k==='home'?r.n+' 周目<i>·</i>故郷まで '+durLong(r.sec)+'<i>·</i><em>+'+fmt(r.g)+'</em>':'航路を引き直した<i>·</i>いちばん遠く '+lyText(r.far)+' 光年<i>·</i><em>航跡 +'+fmt(r.g)+'</em>';}
let glowIntroT=null;
function glowIntroOff(){clearTimeout(glowIntroT);document.getElementById('glowOv').classList.remove('gIntro');}
function openGlow(after){if(!glowAffordable()){after();return;}glowOpen=true;glowAfter=after;glowFlow=true;const ov=document.getElementById('glowOv');ov.classList.add('on','gIntro');renderGlowOv();clearTimeout(glowIntroT);glowIntroT=setTimeout(glowIntroOff,3200);}   // 開くときの動き（gIntro）は約3秒
function closeGlow(){glowOpen=false;document.getElementById('glowOv').classList.remove('on');const f=glowAfter;glowAfter=null;if(f)f();}
/* 光子の帆（2026-11-17 試作）：航路を引き直すときに開く。ためた光子で帆を張り、「船を出す」で閉じる。帆は引き直しても残る */
let sailOpen=false,sailAfter=null,sailFX=0;
function openSail(after){if((S.phPend||0)<sailCost()){S.phPend=0;after();return;}sailOpen=true;sailAfter=after;const ov=document.getElementById('sailOv');ov.classList.add('on','sIntro');renderSailOv();setTimeout(()=>ov.classList.remove('sIntro'),2600);}
function closeSail(){sailOpen=false;S.phPend=0;document.getElementById('sailOv').classList.remove('on');const f=sailAfter;sailAfter=null;if(f)f();}
// 帆の絵：中央の帆柱に、段の数だけ光の帆が上へ重なる。帆は風を受けてふくらみ、縁は光の点で描く
function sailScene(W,H){const n=Math.min(S.sail||0,12),cxp=W/2,base=H*0.72,top=H*0.16,mh=base-top,ink=a=>'rgba(255,236,210,'+a+')';
  let v='<svg class="sScene" width="'+W+'" height="'+H+'" viewBox="0 0 '+W+' '+H+'"><defs><linearGradient id="sFill" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="rgb(255,236,210)" stop-opacity=".02"/><stop offset=".5" stop-color="rgb(255,236,210)" stop-opacity=".16"/><stop offset="1" stop-color="rgb(255,236,210)" stop-opacity=".03"/></linearGradient><radialGradient id="sGlow"><stop offset="0" stop-color="rgb(255,236,210)" stop-opacity=".35"/><stop offset="1" stop-color="rgb(255,236,210)" stop-opacity="0"/></radialGradient></defs>';
  {let sd=3;const rnd=()=>{sd=(sd*16807)%2147483647;return sd/2147483647;};for(let k=0;k<Math.round(W*H/2600);k++){const tw=rnd()<0.3;v+='<circle'+(tw?' class="gTw" style="animation-delay:-'+(rnd()*5).toFixed(1)+'s"':'')+' cx="'+(rnd()*W).toFixed(1)+'" cy="'+(rnd()*H).toFixed(1)+'" r="'+(0.3+rnd()*0.7).toFixed(2)+'" fill="#eceef2" opacity="'+(0.15+rnd()*0.5).toFixed(2)+'"/>';}}
  v+='<ellipse cx="'+cxp+'" cy="'+(top+mh*0.45)+'" rx="'+(W*0.42)+'" ry="'+(mh*0.6)+'" fill="url(#sGlow)" opacity="'+(0.3+0.05*n).toFixed(2)+'"/>';
  v+='<line x1="'+cxp+'" y1="'+(top-10)+'" x2="'+cxp+'" y2="'+(base+30)+'" stroke="'+ink(.55)+'" stroke-width="1"/>';
  const rows=Math.max(n,1),sh=Math.min(54,mh/Math.max(rows,3));
  for(let k=0;k<n;k++){const y1=base-(k+1)*sh,y0=y1+sh*0.88,w=Math.min(W*0.4,130)*(1-k*0.045),bul=w*0.18,isNew=sailFX&&k===n-1;
    const d='M'+(cxp-w)+' '+y1+' Q'+cxp+' '+(y1-bul*0.25)+' '+(cxp+w)+' '+y1+' Q'+(cxp+w+bul)+' '+((y1+y0)/2)+' '+(cxp+w)+' '+y0+' Q'+cxp+' '+(y0-bul*0.25)+' '+(cxp-w)+' '+y0+' Q'+(cxp-w-bul)+' '+((y1+y0)/2)+' '+(cxp-w)+' '+y1+'Z';
    v+='<g class="sSheet'+(isNew?' sNew':'')+'" style="transform-origin:'+cxp+'px '+((y1+y0)/2)+'px;animation-delay:-'+(k*0.7).toFixed(1)+'s"><path d="'+d+'" fill="url(#sFill)" stroke="'+ink(.6)+'" stroke-width=".8"/>';
    for(let j=0;j<=8;j++){const t=j/8,x=cxp-w+2*w*t;v+='<circle cx="'+x.toFixed(1)+'" cy="'+(y1-bul*0.25*4*t*(1-t)).toFixed(1)+'" r="1" fill="'+ink(.85)+'"/>';}
    v+='</g>';}
  if(!n)v+='<text x="'+cxp+'" y="'+(base-mh*0.45)+'" text-anchor="middle" font-size="12" fill="'+ink(.45)+'">まだ帆はない</text>';
  for(let k=0;k<16;k++){const x=cxp+(k%2?1:-1)*(20+((k*37)%110)),d=(k*0.53).toFixed(2),du=(5+(k%4)).toFixed(1);v+='<circle cx="'+x+'" cy="'+(base+10)+'" r="'+(0.6+(k%3)*0.3)+'" fill="'+ink(.9)+'" opacity="0"><animate attributeName="cy" from="'+(base+10)+'" to="'+(top-20)+'" dur="'+du+'s" begin="'+d+'s" repeatCount="indefinite"/><animate attributeName="opacity" values="0;.7;0" dur="'+du+'s" begin="'+d+'s" repeatCount="indefinite"/></circle>';}
  if(sailFX){for(let k=0;k<18;k++){const a=Math.random()*6.283,dd=40+Math.random()*90,y=base-n*sh+sh*0.4;v+='<circle cx="'+cxp+'" cy="'+y.toFixed(1)+'" r="1.2" fill="#fff4e6" opacity="0"><animate attributeName="cx" from="'+cxp+'" to="'+(cxp+Math.cos(a)*dd).toFixed(1)+'" dur="1.2s" begin=".2s" fill="freeze" calcMode="spline" keySplines=".1 .8 .3 1"/><animate attributeName="cy" from="'+y.toFixed(1)+'" to="'+(y+Math.sin(a)*dd*0.6).toFixed(1)+'" dur="1.2s" begin=".2s" fill="freeze" calcMode="spline" keySplines=".1 .8 .3 1"/><animate attributeName="opacity" values="0;1;0" dur="1.2s" begin=".2s" fill="freeze"/></circle>';}sailFX=0;}
  return v+'</svg>';}
function renderSailOv(){const ov=document.getElementById('sailOv'),b=document.getElementById('sailBody'),can=(S.phPend||0)>=sailCost();
  b.innerHTML='<div class="gTop"><div class="gLab">PHOTON SAIL</div><div class="gL"><span>光子</span><b>'+fmt(S.phPend||0)+'</b></div><div class="gRes">航路を引き直す前に、ためた光子で帆を張れる。光子は持ち越せない。</div></div>'+
    '<div class="gBot"><div class="gDet"><div class="row" style="padding:0"><span style="font-size:14px">光子の帆</span><span class="num" style="font-size:12px;color:var(--ink-dim)">'+(S.sail||0)+' 段</span></div><div class="note" style="margin:4px 0 0">船の時間（生産・光子・進む距離）</div><div class="gVal">×'+fmtG(sailMult())+'<span class="gArr">→</span><b>×'+fmtG(sailMult()*SAIL_X)+'</b></div>'+
    '<button class="act" id="sRaise"'+(can?'':' disabled')+' style="border-color:rgba(255,236,200,.6);color:#fff1dc">帆を張る　光子 '+fmt(sailCost())+'</button></div><button class="act" id="sailGoBtn" style="margin-top:10px">船を出す</button></div><div class="gSky"></div>';
  const W=ov.clientWidth,H=ov.clientHeight;b.querySelector('.gSky').innerHTML=sailScene(W,H);
  document.getElementById('sRaise').onclick=()=>{if(raiseSail()){SND.play('light');sailFX=1;ov.classList.remove('sIntro');renderSailOv();}};
  document.getElementById('sailGoBtn').onclick=closeSail;}
addEventListener('resize',()=>{if(sailOpen)renderSailOv();});
// 景色は小窓いっぱい。下の説明の高さを測ってから、その上に地平線を引く
function renderGlowOv(){const ov=document.getElementById('glowOv'),b=document.getElementById('glowBody');
  b.innerHTML='<div class="gTop"><div class="gLab">AFTERGLOW</div><div class="gL"><span>残光</span><b>'+fmt(S.L)+'</b></div><div class="gRes">'+(glowResult()||'船を出す前に、残光で灯しておける。')+'</div></div>'+
    '<div class="gBot">'+glowDetail()+'<button class="act" id="glowGo" style="margin-top:10px">船を出す</button></div><div class="gSky"></div>';
  const W=ov.clientWidth,H=ov.clientHeight,bot=b.querySelector('.gBot').getBoundingClientRect().height,top=b.querySelector('.gTop').getBoundingClientRect().height,hz=Math.round(Math.max(top+150,H-bot-70));
  b.querySelector('.gSky').innerHTML=glowScene(W,H,hz);
  b.querySelectorAll('[data-gs]').forEach(g=>g.onclick=()=>glowPick(g.dataset.gs));
  glowBindBuy();
  document.getElementById('glowGo').onclick=closeGlow;}
// 選ぶ：描き直さず、筋の明るさ（class on）と下の説明だけを入れ替える
function glowPick(id){if(id===glowSel)return;glowSel=id;const b=document.getElementById('glowBody');b.querySelectorAll('[data-gs]').forEach(g=>g.classList.toggle('on',g.dataset.gs===id));
  const d=b.querySelector('.gDet');if(d){d.outerHTML=glowDetail();const n=b.querySelector('.gDet');n.classList.add('gSwap');}glowBindBuy();}
// 灯す：筋が伸びて先端から光の粒、新しい値が下から入り、残光の数が減っていく
function glowBindBuy(){const gb=document.getElementById('gBuy');if(gb)gb.onclick=()=>{const L0=S.L;if(buyGlow(glowSel)){SND.play('light');GLOWFX={id:glowSel,t:Date.now()};glowIntroOff();renderGlowOv();
  const v=document.querySelector('#glowBody .gVal');if(v)v.classList.add('gRoll');const lb=document.querySelector('#glowBody .gL b'),L1=S.L,t0=performance.now();if(lb){const st=()=>{const p=Math.min(1,(performance.now()-t0)/700),e=1-Math.pow(1-p,3);lb.textContent=fmt(Math.round(L0+(L1-L0)*e));if(p<1&&glowOpen)requestAnimationFrame(st);};st();}}};}
addEventListener('resize',()=>{if(glowOpen){glowIntroOff();renderGlowOv();}});
function renderGlow(){const lg=lGain(),part=curTab==='restart'?'restart':'glow';const key='g|'+part+'|'+[fmt(S.L),S.restarts,S.cleared,S.voy,glowSel,JSON.stringify(S.ag),lg].join('|');if(pbody.dataset.k===key)return;let h='';
  if(part==='restart'){
    if(S.voy)h+='<div class="phead"><span class="lab">RESTART</span><span class="num" style="font-size:12px;color:var(--ink-dim)">残光 '+fmt(S.L)+'</span></div><div class="note">航海に出ているので、故郷には戻らない。残光は、進んだ距離が2倍になるたびに入ってくる。</div>';
    else h+='<div class="phead"><span class="lab">RESTART</span><span class="num" style="font-size:12px;color:var(--ink-dim)">残光 '+fmt(S.L)+'</span></div>'+
    '<div class="row"><span>得られる残光</span><span class="big">'+fmt(lg)+'</span></div>'+
    '<div class="note">故郷に着いたあと、もう一度、遠い宙域から船を出せる。歪みとスキル、距離、故郷の年月はなくなり、色もまた失っていく。日誌と実績、残光は残る。</div>'+
    (canVoyage()?'<button class="act" id="rsDoor" style="border-color:rgba(210,200,255,.6);color:#e6e2ff">さらに遠くへ</button><div class="note">上位の星8つが灯った。ここから先は航海になる。</div>':'<button class="act" id="rsGo"'+(lg<1?' disabled':'')+'>再出発する</button>'+(!S.cleared?'<div class="note">故郷に着くと使える。</div>':''))+
    '<div class="row" style="margin-top:10px"><span class="note" style="margin:0">これまでの再出発</span><span class="num">'+S.restarts+' 回</span></div>';}
  else h+='<div class="phead"><span class="lab">AFTERGLOW</span><span class="num" style="font-size:12px;color:var(--ink-dim)">残光 '+fmt(S.L)+'</span></div>'+glowScene(360,210,150)+glowDetail();
  pbody.dataset.k=key;pbody.innerHTML=h;
  pbody.querySelectorAll('[data-gs]').forEach(g=>g.onclick=()=>{glowSel=g.dataset.gs;pbody.dataset.k='';renderGlow();});
  const gb=document.getElementById('gBuy');if(gb)gb.onclick=()=>{if(buyGlow(glowSel)){fla=Math.max(fla,0.1);GLOWFX={id:glowSel,t:Date.now()};pbody.dataset.k='';renderGlow();}};
  const rd=document.getElementById('rsDoor');if(rd)rd.onclick=()=>showDoor();
  const rs=document.getElementById('rsGo');if(rs)rs.onclick=()=>confirmBox('再出発','残光を '+fmt(lg)+' 得て、遠い宙域からもう一度船を出す。歪みとスキル、距離、故郷の年月はなくなる。日誌と実績、残光は残る。',()=>{startBrake(0);BRK.rs=true;});}
/* ② チャレンジ（CHALLENGE タブ）：上位の星8つの「残光の星座」。星1つごとにチャレンジが1つ。越えるとその星が灯り、周回の最初から効いて消えない */
let litSel=null;
let unlockChal=null;
function renderUnlock(){const ks=SKILLS.filter(k=>k.glow);if(S.chal!==unlockChal){unlockChal=S.chal;if(S.chal)litSel=S.chal;}if(!litSel)litSel=(S.chal||(ks.find(k=>!S.lit.includes(k.id))||ks[0]).id);
  const key='u|'+[S.lit.join(),JSON.stringify(S.chalTier),litSel,S.chal,canChallenge(litSel),S.voy].join('|');if(pbody.dataset.k===key)return;
  const W=360,H=250,cx=180,cy=120,P=ks.map((_,i)=>{const a=-Math.PI*0.62+i*Math.PI*2/ks.length;return[cx+Math.cos(a)*120,cy+Math.sin(a)*92];});
  const tsum=ks.reduce((a,k)=>a+(S.chalTier[k.id]||0),0);let v='<div class="phead"><span class="lab">CHALLENGE</span><span class="num" style="font-size:12px;color:var(--ink-dim)">段 '+tsum+' / '+(ks.length*3)+'</span></div><svg class="gHz" viewBox="0 0 '+W+' '+H+'" role="group" aria-label="残光の星座">';
  ks.forEach((k,i)=>{const a=P[i],b=P[(i+1)%ks.length],both=S.lit.includes(k.id)&&S.lit.includes(ks[(i+1)%ks.length].id);v+='<line x1="'+a[0]+'" y1="'+a[1]+'" x2="'+b[0]+'" y2="'+b[1]+'" stroke="rgb(255,236,200)" stroke-opacity="'+(both?0.4:0.1)+'" stroke-width=".8"'+(both?'':' stroke-dasharray="2 4"')+'/>';});
  ks.forEach((k,i)=>{const [x,y]=P[i],lit=S.lit.includes(k.id),c=BR_COL[k.br],sel=k.id===litSel,act=S.chal===k.id;
    v+='<g data-us="'+k.id+'" style="cursor:pointer"><circle cx="'+x+'" cy="'+y+'" r="22" fill="transparent"/>'+
      (lit?'<circle cx="'+x+'" cy="'+y+'" r="20" fill="'+rgb(c,0.22)+'"/><circle cx="'+x+'" cy="'+y+'" r="3.4" fill="'+rgb(c,1)+'"/>'
          :'<circle cx="'+x+'" cy="'+y+'" r="9" fill="none" stroke="rgb(255,236,200)" stroke-opacity="'+(act?0.9:0.3)+'" stroke-dasharray="'+(act?'':'1 3')+'"/><circle cx="'+x+'" cy="'+y+'" r="'+(act?2.4:1.6)+'" fill="rgb(255,236,200)" fill-opacity="'+(act?1:0.5)+'"/>')+
      (sel?'<circle cx="'+x+'" cy="'+y+'" r="14" fill="none" stroke="rgb(255,214,170)" stroke-opacity=".8" stroke-width=".8"/>':'')+
      '<text x="'+x+'" y="'+(y+26)+'" text-anchor="middle" font-size="10" fill="rgba(236,238,242,'+(lit||act?0.8:0.45)+')">'+CHAL[k.id].name+'</text>'+[0,1,2].map(j=>'<circle cx="'+(x-6+j*6)+'" cy="'+(y+34)+'" r="'+(j<(S.chalTier[k.id]||0)?1.6:1)+'" fill="rgb(255,226,190)" fill-opacity="'+(j<(S.chalTier[k.id]||0)?0.95:0.25)+'"/>').join('')+'</g>';});
  v+='</svg>';
  const k=ks.find(z=>z.id===litSel),ch=CHAL[k.id],lit=S.lit.includes(k.id),act=S.chal===k.id,tier=S.chalTier[k.id]||0,nx=act?(S.chalLv||1):chalNext(k.id),ri=Math.max(1,nx||3)-1;
  v+='<div class="gDet"><div class="row" style="padding:0"><span style="font-size:14px">「'+ch.name+'」'+(nx?'　段'+nx:'')+'</span><span class="num" style="font-size:12px;color:var(--ink-dim)">'+(act?'挑戦中':tier>=3?'3段すべて越えた':tier?'段'+tier+'まで越えた':'')+'</span></div>'+
    '<div class="note" style="margin:4px 0 2px">縛り：'+ch.rule[ri]+'<br>目標：'+ch.gtext[ri]+'<br>'+(nx===1?'灯る星：'+k.name+'（'+STAR_P[k.id].t(STAR_P[k.id].p[0])+'）':nx?'越えると星「'+k.name+'」が強くなる：'+STAR_P[k.id].t(STAR_P[k.id].p[nx-2])+' → '+STAR_P[k.id].t(STAR_P[k.id].p[nx-1]):'灯った星：'+k.name+'（'+starText(k.id)+'）')+'</div>'+
    (act?'<button class="act" id="chQuit">やめる</button>':nx?'<button class="act" id="chGo"'+(canChallenge(k.id)?'':' disabled')+' style="border-color:rgba(255,200,140,.6);color:#ffd6aa">段'+nx+'に挑む</button>'+(canChallenge(k.id)?(S.voy?'<div class="note">挑む間、航海は預けておく。越えるか、やめると航海に戻る。</div>':''):'<div class="note">'+(nx>=2&&!voyaged()?'段2と段3は、航海に出てから挑める。':S.voy&&nx===1?'段1は、航海に出る前に挑む。':'故郷に一度着くと挑める。')+'</div>'):'<div class="note">この星は灯っている。周回の最初から効き、消えない。</div>')+'</div>';
  pbody.dataset.k=key;pbody.innerHTML=v;
  pbody.querySelectorAll('[data-us]').forEach(g=>g.onclick=()=>{litSel=g.dataset.us;pbody.dataset.k='';renderUnlock();});
  const go=document.getElementById('chGo');if(go)go.onclick=()=>confirmBox('チャレンジ「'+ch.name+'」段'+nx,'今の周回をやめて、遠い宙域から出直す。縛りは「'+ch.rule[ri]+'」。'+ch.gtext[ri]+'と、'+(nx===1?k.name+'が灯る。':'星「'+k.name+'」が強くなる。')+(S.voy?'航海は預けておき、越えるかやめると戻る。':'距離・年月・歪み・スキルはなくなり、残光は得られない。'),()=>{if(document.getElementById('title').classList.contains('on'))document.getElementById('tBack').onclick();if(startChallenge(k.id)){applyLoadedVisuals();curTab='drive';renderPanel(true);paintGoal();save();startRestart();}});
  const q=document.getElementById('chQuit');if(q)q.onclick=()=>confirmBox('チャレンジをやめる',S.voyStash?'縛りがなくなり、預けていた航海に戻る。この段は越えたことにならない。':'縛りがなくなり、今の周回をそのまま続ける。この段は越えたことにならない。',()=>{quitChallenge();pbody.dataset.k='';renderPanel(true);});}
/* 航路図（2026-11-17）：通ってきた宙域は光の線と星系の記号で残り、いまの宙域が明るく、次の宙域の候補が枝分かれする。先は目的地まで点で続く */
function routeMap(W){const R=S.route;if(!R)return '';const H=140,n=R.n,TOT=voyDoublings(DEST[DEST.length-1].ly),k0=Math.max(0,n-4),k1=Math.min(TOT,k0+11),step=(W-36)/(k1-k0),X=k=>18+(k-k0)*step,Y=k=>74+Math.sin(k*1.3)*12,ink=a=>'rgba(236,238,242,'+a+')',col=id=>{const o=FORKS.find(x=>x.id===id);return o?'rgb('+o.col.join(',')+')':ink(.6);};
  let v='<svg class="rMap" width="100%" viewBox="0 0 '+W+' '+H+'" preserveAspectRatio="xMidYMid meet" role="group" aria-label="航路図">';
  // 先の宙域：点で目的地まで
  for(let k=n+2;k<=k1;k++){if(k-1>=k0)v+='<line x1="'+X(k-1).toFixed(1)+'" y1="'+Y(k-1).toFixed(1)+'" x2="'+X(k).toFixed(1)+'" y2="'+Y(k).toFixed(1)+'" stroke="'+ink(.12)+'" stroke-width=".8" stroke-dasharray="2 4"/><circle cx="'+X(k).toFixed(1)+'" cy="'+Y(k).toFixed(1)+'" r="1.4" fill="'+ink(.3)+'"/>';}
  // 目的地
  DEST.forEach((g,i)=>{const k=voyDoublings(g.ly);if(k<k0||k>k1)return;const got=S.found>i;v+='<line x1="'+X(k).toFixed(1)+'" y1="16" x2="'+X(k).toFixed(1)+'" y2="'+(Y(k)-6).toFixed(1)+'" stroke="'+ink(.12)+'" stroke-width=".6"/><circle cx="'+X(k).toFixed(1)+'" cy="'+Y(k).toFixed(1)+'" r="5" fill="none" stroke="'+(got?'rgba(255,214,170,.7)':ink(.35))+'" stroke-width=".8"/><text x="'+X(k).toFixed(1)+'" y="11" text-anchor="middle" font-size="9" fill="'+(got?'rgba(255,214,170,.8)':ink(.45))+'">'+g.name+'</text>';});
  // 通ってきた道
  for(let k=Math.max(1,k0);k<=n;k++){const t=R.path[k-1];if(k>k0)v+='<line x1="'+X(k-1).toFixed(1)+'" y1="'+Y(k-1).toFixed(1)+'" x2="'+X(k).toFixed(1)+'" y2="'+Y(k).toFixed(1)+'" stroke="rgba(255,214,170,.55)" stroke-width="1"/>';if(k<n&&t)v+='<g transform="translate('+X(k).toFixed(1)+' '+Y(k).toFixed(1)+')" opacity=".75">'+routeSym(t,col(t),0.7)+'</g>';}
  if(k0===0)v+='<circle cx="'+X(0).toFixed(1)+'" cy="'+Y(0).toFixed(1)+'" r="2" fill="rgba(255,214,170,.8)"/><text x="'+X(0).toFixed(1)+'" y="'+(Y(0)+16).toFixed(1)+'" text-anchor="middle" font-size="9" fill="'+ink(.45)+'">故郷</text>';
  // いまの宙域
  const cx0=X(n),cy0=Y(n);v+='<circle class="rNow" cx="'+cx0.toFixed(1)+'" cy="'+cy0.toFixed(1)+'" r="9" fill="none" stroke="rgba(255,226,190,.8)" stroke-width=".8"/>'+(R.cur?'<g transform="translate('+cx0.toFixed(1)+' '+cy0.toFixed(1)+')">'+routeSym(R.cur,col(R.cur),0.8)+'</g>':'<circle cx="'+cx0.toFixed(1)+'" cy="'+cy0.toFixed(1)+'" r="2.4" fill="#fff4e6"/>');
  // 次の宙域の候補
  if(n<TOT){const go=routeAuto(),m=R.opts.length,nx=X(n+1);R.opts.forEach((id,i)=>{const y=Y(n+1)+(m===1?0:(i-(m-1)/2)*30),on=id===go,c=col(id);
    v+='<g class="rOpt'+(on?' on':'')+'" data-rt="'+id+'" style="cursor:pointer"><rect x="'+(nx-16).toFixed(1)+'" y="'+(y-14).toFixed(1)+'" width="32" height="28" fill="transparent"/><path d="M'+(cx0+9).toFixed(1)+' '+cy0.toFixed(1)+'C'+(cx0+step*0.5).toFixed(1)+' '+cy0.toFixed(1)+' '+(nx-step*0.5).toFixed(1)+' '+y.toFixed(1)+' '+(nx-9).toFixed(1)+' '+y.toFixed(1)+'" fill="none" stroke="'+c+'" stroke-opacity="'+(on?.85:.35)+'" stroke-width="1"'+(on?'':' stroke-dasharray="3 3"')+'/>'+
      '<g transform="translate('+nx.toFixed(1)+' '+y.toFixed(1)+')" class="'+(on?'rPick':'')+'">'+routeSym(id,c,on?1:0.85)+'</g></g>';});}
  v+='<text x="'+(W-18)+'" y="'+(H-6)+'" text-anchor="end" font-size="9" letter-spacing="1" fill="'+ink(.4)+'" font-family="Michroma,Jura,sans-serif">SECTOR '+n+' / '+TOT+'</text></svg>';
  // 説明：いまの宙域と、次の候補（押して選ぶ）
  const go=routeAuto();v+='<div class="rNowT">'+(R.cur?'いまの宙域　<b>'+FORKS.find(x=>x.id===R.cur).name+'</b>　'+forkText(R.cur):'故郷を出たところ')+'</div>';
  if(n<TOT){v+='<div class="note" style="margin:6px 0 2px">次の宙域（'+lyText(1e4*Math.pow(2,n))+' 光年から）</div>';
    R.opts.forEach(id=>{const o=FORKS.find(x=>x.id===id),on=id===go;v+='<button class="rRow'+(on?' on':'')+'" data-rt="'+id+'"><svg width="22" height="22" viewBox="-11 -11 22 22">'+routeSym(id,col(id))+'</svg><span class="rN">'+o.name+'</span><span class="rE">'+forkText(id)+'</span><span class="rS">'+(on?(R.pick?'この道へ':'選ばなければ'):'')+'</span></button>';});}
  return v;}
/* ③ 光子（2026-11-17 試作）：PHOTON タブ。光子の帆と、光子の列。数字は paintPhoton() がその場で書き換える */
function renderPhoton(){const open=PH_DEV.map((_,k)=>phOpen(k)?1:0).join(''),sailT=curTab==='sail';pbody.dataset.k='ph|'+open+'|'+curTab;   // PHOTON は装置だけ、SAIL は光子の帆だけ（HOME の DRIVE と BOOST と同じ分け方）
  let h='<div class="phead"><span class="lab">'+(sailT?'SAIL':'PHOTON')+'</span><span class="num" style="font-size:12px;color:var(--ink-dim)">光子 <b id="phN">0</b></span></div>';
  if(sailT)h+='<div class="sail"><div class="row" style="padding:0"><span>光子の帆</span><span class="num" id="sailLv"></span></div><div class="note" style="margin:2px 0 6px" id="sailFx"></div>'+
    '<div class="row" style="padding:2px 0"><span class="note" style="margin:0">次の段</span><span class="num" id="sailNx"></span></div></div><div class="note" style="margin-top:10px">帆は、航路を引き直すときに、それまでにためた光子で張る。帆は引き直しても残り、1段ごとに船の時間が ×'+SAIL_X+' 速く流れる（生産・光子・進む距離がまとめて速くなる）。光子は引き直すとなくなる。</div>';
  else PH_DEV.forEach((d,k)=>{if(!phOpen(k)){if(k===PH_DEV.findIndex((_,j)=>!phOpen(j)))h+='<div class="dv"><div class="dvRow"><div style="flex:1"><div class="dvName" style="color:var(--ink-dim)">？？？</div><div class="dvTrait">'+DEST[(d.find||1)-1].name+'に着くと現れる</div></div></div></div>';return;}
    h+='<div class="dv"><div class="dvRow"><div style="flex:1;min-width:0"><div class="dvName">'+d.name+'　<span class="num" id="phc'+k+'" style="font-size:12px;color:var(--ink-dim)"></span></div><div class="dvTrait" id="pht'+k+'"></div></div><button class="buy" id="phb'+k+'"></button></div></div>';});
  pbody.innerHTML=h;const sgo=document.getElementById('sailGo');if(sgo)sgo.onclick=()=>{if(raiseSail()){SND.play('light');fla=Math.max(fla,0.1);paintPhoton();}};
  PH_DEV.forEach((_,k)=>{const b=document.getElementById('phb'+k);if(b)b.onclick=()=>{if(phBuyDev(k)){SND.play('buy',4);paintPhoton();}};});paintPhoton();}
function paintPhoton(){const n=document.getElementById('phN');if(!n)return;n.textContent=fmt(S.ph);
  if(document.getElementById('sailLv')){document.getElementById('sailLv').textContent=(S.sail||0)+' 段';document.getElementById('sailFx').textContent='船の時間 ×'+fmtG(sailMult())+'　→　次の段で ×'+fmtG(sailMult()*SAIL_X);
  const nx=document.getElementById('sailNx');nx.textContent='光子 '+fmt(sailCost())+(S.ph>=sailCost()?'　（引き直せば張れる）':'');}
  PH_DEV.forEach((d,k)=>{const b=document.getElementById('phb'+k);if(!b)return;document.getElementById('phc'+k).textContent=fmt(Math.floor(S.phDev[k]||0))+'（買った '+(S.phBuy[k]||0)+'）';
    document.getElementById('pht'+k).textContent=k===0?'光子 +'+fmt(phRate())+' / 秒':PH_DEV[k-1].name+' +'+fmt((S.phDev[k]||0)*d.rate*sailMult())+' / 秒';
    b.textContent='光子 '+fmt(phCost(k));b.disabled=S.ph<phCost(k);});}
/* ③ さらに遠くへ（GALAXY タブ） */
function renderVoy(){let h='';const part=curTab==='wake'?'wake':'voy';
  if(part==='voy'&&!S.voy&&canVoyage())h+='<div class="phead"><span class="lab">FARTHER</span></div><div class="note">上位の星がすべて灯った。故郷を出発点に、もっと遠くへ航海に出られる。故郷への周回は終わり、航海では船は止まらない。歪みは走りながらたまり、スキルは自動で覚える。残光とその強化、灯した星、実績は残る。</div><button class="act" id="farGo">さらに遠くへ</button>';
  if(part==='wake')h+='<div class="phead"><span class="lab">WAKE</span><span class="num" style="font-size:12px;color:var(--ink-dim)">航跡 '+fmt(S.T)+'</span></div>'+(S.voy?'':'<div class="note">航海に出ると、航跡で航海を強くできる。</div>');
  if(part==='voy'&&S.voy){const tgn=tGain(),n=nextDest();
    if(!S.route)routeInit();
    h+='<div class="phead"><span class="lab">VOYAGE</span><span class="num" style="font-size:12px;color:var(--ink-dim)">航跡 '+fmt(S.T)+'</span></div>'+routeMap(Math.max(300,Math.min(520,(pbody.clientWidth||340))))+
    '<div class="row"><span>引き直すと得る航跡</span><span class="big">'+fmt(tgn)+'</span></div>'+
    '<div class="row" style="padding:2px 0"><span class="note" style="margin:0">この航海で進んだ距離</span><span class="num">'+lyText(S.vdist)+' 光年</span></div>'+
    '<div class="row" style="padding:2px 0"><span class="note" style="margin:0">次の目的地</span><span class="num">'+(n?n.name+'（'+lyText(n.ly)+' 光年）':'もう、ない')+'</span></div>'+
    '<div class="note">航路を引き直すと、故郷から航海をやり直す。距離とエネルギー、装置、歪みとスキルはなくなる。航跡、見つけた色と装置の種類、残光とその強化は残る。航海では船は止まらず、歪みは走りながらたまり、スキルは自動で覚える。進んだ距離が2倍になるたびに（1万・2万・4万光年…）残光が入る（1回 '+fmt(lPer())+'）。</div>'+
    '<button class="act" id="vrGo"'+(tgn<1?' disabled':'')+'>航路を引き直す</button>';}
  if(part==='wake'&&S.voy){
    TRAIL.forEach(a=>{const l=tg(a.id),n2=trailNext(a.id),pips=a.max?Array.from({length:a.max},(_,k)=>k<l?'●':'○').join(''):'Lv '+l;
      h+='<div class="dv"><div class="dvRow"><div style="flex:1;min-width:0"><div class="dvName">'+a.name+'　<span class="num" style="font-size:11px;letter-spacing:.2em;color:var(--ink-dim)">'+pips+'</span></div>'+
      '<div class="dvTrait">'+(l?'いま：'+a.text(l)+(n2?'<br>':''):'')+(n2?'次：'+n2.text:'')+'</div></div>'+
      (n2?'<button class="buy" data-t="'+a.id+'"'+(S.T<n2.cost?' disabled':'')+'>航跡 '+fmt(n2.cost)+'</button>':'')+'</div></div>';});}
  pbody.dataset.k='';pbody.innerHTML=h;
  pbody.querySelectorAll('[data-t]').forEach(b=>b.onclick=()=>{if(buyTrail(b.dataset.t)){fla=Math.max(fla,0.1);renderPanel(true);}});
  pbody.querySelectorAll('[data-rt]').forEach(b=>b.onclick=()=>pickFork(b.dataset.rt));
  const vr=document.getElementById('vrGo');if(vr)vr.onclick=()=>confirmBox('航路を引き直す','航跡を '+fmt(tGain())+' 得て、故郷から航海をやり直す。距離と装置、歪みとスキルはなくなる。航跡、見つけた色と装置、残光は残る。',()=>{startBrake(0);BRK.vr=true;});
  const fg=document.getElementById('farGo');if(fg)fg.onclick=()=>showDoor();}   // どこから押しても、章の扉を通って航海へ
function renderLog(){pbody.dataset.k='';const logMode=curTab==='ach'?'ach':'log';let h='<div class="phead"><span class="lab">'+(logMode==='log'?'LOG':'RECORD')+'</span>'+(logMode==='ach'?'<span class="num" style="font-size:12px;color:var(--ink-dim)">実績 '+S.ach.length+' / '+ACHIEVEMENTS.length+'</span>':'')+'</div>';
  if(logMode==='log'){S.log.slice().reverse().forEach((e,j)=>{const col=e.c>=0?rgb(COLORS[e.c].rgb,1):'var(--ink-dim)';h+='<div class="le"><span class="y" style="color:'+col+'">故郷 '+e.y.toLocaleString('ja-JP')+'年</span><span class="t" style="opacity:'+(j===0?1:0.75)+'">'+e.t+'</span></div>';});}
  else{h+='<div class="row" style="padding:2px 0 8px"><span class="note" style="margin:0">実績1つにつき、すべての生産 +'+Math.round(ACH_BONUS*100)+'%。リセットしても消えない</span><span class="num">×'+achMult().toFixed(2)+'</span></div>';ACHIEVEMENTS.forEach(a=>{const on=S.ach.includes(a[0]);h+='<div class="ach'+(on?'':' off')+'"><span style="width:12px">'+(on?'✦':'·')+'</span><span style="flex:1">'+a[1]+'</span><span style="color:var(--ink-dim)">'+a[2]+'</span></div>';});}
  pbody.innerHTML=h;}
/* ETC の SETTING：設定の中身（#setBox）をパネルに移して出す。タイトル画面の歯車では小窓に戻して出す */
function renderSet(){const box=document.getElementById('setBox'),ps=document.getElementById('pset');if(box.parentElement!==ps)ps.appendChild(box);document.getElementById('sEnd').style.display='';paintSeg();}
