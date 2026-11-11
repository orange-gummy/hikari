'use strict';
/* =====================================================================
   UI ― パネル（上の段 DRIVE・BOOST・BATTERY・LOG、下の段は層 HOME・STAR・GALAXY（のちに UNIVERSE・LIGHT））
   ===================================================================== */
/* タブ */
let curTab='drive',buyMode='1';
/* タブは入れ子：下の段で層（HOME・STAR・GALAXY）と LOG を選び、上の段にその層の中のタブを出す。層が1つのうちは1段 */
const LAYERS=[{id:'home',name:'HOME',tabs:['drive','boost','battery','reset']},{id:'star',name:'STAR',tabs:['restart','stars']},{id:'galaxy',name:'GALAXY',tabs:['voy','wake']},{id:'universe',name:'UNIVERSE',tabs:['uni']},{id:'light',name:'LIGHT',tabs:['light']},{id:'etc',name:'ETC',tabs:['log','ach','stats','set']}];
const TAB_NAME={drive:'DRIVE',boost:'BOOST',battery:'METEOR',skill:'SKILL',reset:'STOP',restart:'RESTART',glow:'UPGRADE',stars:'CHALLENGE',voy:'VOYAGE',wake:'WAKE',uni:'LAW',light:'LIGHT',log:'LOG',ach:'RECORD',stats:'STATS',set:'SETTING'};
const lastTab={home:'drive',star:'restart',galaxy:'voy',universe:'uni',light:'light',etc:'log'};let curLayer='home',tabs=[],tabKey='';
function layerOpen(id){return id==='home'||id==='etc'||(id==='star'&&(S.cleared||S.restarts>0||S.lTotal>0))||(id==='galaxy'&&(S.voy||canVoyage()))||(id==='universe'&&(S.uni>0||canFold()))||(id==='light'&&(law('lc')>=10||S.lightDone));}
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
function tabHidden(t){const L=layerOf(t);if(L&&!layerOpen(L))return true;return (t==='battery'&&((S.chal==='c7'&&S.chalLv>=2)||!S.flags.bat))||(t==='reset'&&S.maxStage<BRAKE_STAGE&&S.restarts===0)||(t==='skill'&&S.prestiges<1&&S.W<1&&S.skills.length===0&&S.lTotal===0);}   // 層が開くまでタブごと出さない
function tabLocked(t){return (t==='skill'&&S.prestiges<1&&S.W<1&&S.skills.length===0&&S.lTotal===0)||(t==='battery'&&!S.flags.bat);}
let devUI=[],TIERFX=null;
function renderPanel(force){
  if(tabHidden(curTab))curTab='drive';
  curLayer=layerOf(curTab)||'home';lastTab[curLayer]=curTab;
  const isSet=curTab==='set',ps=document.getElementById('pset');pbody.style.display=isSet?'none':'';ps.style.display=isSet?'':'none';
  paintTabs();
  if(curTab==='drive')renderDrive(force);else if(curTab==='boost')renderBoost();else if(curTab==='battery')renderBattery();else if(curTab==='reset')renderReset();else if(curTab==='glow'||curTab==='restart')renderGlow();else if(curTab==='stars')renderUnlock();else if(curTab==='voy'||curTab==='wake')renderVoy();else if(curTab==='uni')renderUniverse();else if(curTab==='light')renderLight();else if(curTab==='set')renderSet();else if(curTab==='stats')renderStats();else renderLog();
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
      const bt=w.querySelector('.buy');bt.addEventListener('click',()=>{if(buyDevice(i,buyMode)){SND.play('buy',DEVICES[i].col);const r=bt.getBoundingClientRect();for(let k=0;k<10;k++){const a=-1.57+R(-1,1),v=R(0.5,1.7);P.push({x:r.left+r.width/2,y:r.top,vx:Math.cos(a)*v,vy:Math.sin(a)*v,l:1,c:colRGB(d.col),r:R(0.8,1.8),gr:A[d.col]<0.5,dr:0.02});}updateDrive();}});
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
  u.bt.textContent=chalBlocksDevice(i)?'縛り':(buyMode==='1'?'':'×'+k+' ')+fmt(c);u.bt.disabled=c>S.E||chalBlocksDevice(i);
  const rm=i===ANCHOR?1:regionMult(i);if(rm!==1){u.rg.style.display='';u.rg.textContent='区域 ×'+rm;}else u.rg.style.display='none';
  if(u.spn){const sp=DEVICES[i].spawn;u.spn.textContent=(S.dev[i]*sp.rate).toFixed(1);}
  u.upBtns.forEach(([b,up])=>b.disabled=S.E<up.cost);if(u.hint){const tn=tierNext(u.i),cnt=!!(tn&&S.dev[u.i]>=tn.need),can=cnt&&S.E>=tn.cost;u.hint.classList.toggle('can',can);u.hint.style.display=cnt?'':'none';const sw=u.hint.querySelector('.swp');if(sw)sw.style.display=can?'':'none';const dc=DEVICES[u.i].col,cc=mix(colRGB(dc),G,1-A[dc]);if(!u.el.dataset.sweep)u.el.style.background=can?'linear-gradient(90deg,'+rgb(cc,0.16)+','+rgb(cc,0.02)+')':'';u.el.style.boxShadow=cnt?'inset 2px 0 0 '+rgb(cc,can?0.9:0.5):'';}});
}
function paintDeviceColors(){devUI.forEach(u=>{const d=DEVICES[u.i],a=A[d.col],base=mix(d.col===5?[230,232,240]:colRGB(d.col),G,1-a),col=rgb(devGlow>0.05?mix(base,[255,255,255],devGlow*0.5):base,1);u.em.parts.forEach(p=>p.setAttribute('stroke',col));u.em.core.setAttribute('fill',col);
  if(!u.ticks.length)return;const n=S.dev[u.i],scale=n>=100?2:1;for(let k=0;k<100;k++){const t=u.ticks[k];t.style.background=(k+1)*scale<=n?col:(t.big?'rgba(255,255,255,.3)':'rgba(255,255,255,.12)');}});}
function renderBoost(){const s=S.stage,nx=s+1,c=nx<=maxStage()?accelCost(nx):0,cap=batteryCap(),blocked=false,dil=s>=DILATION_STAGE,g=stageGamma(s);
  let h='<div class="phead"><span class="lab">'+(dil?'SHIP TIME':'VELOCITY')+'</span></div>';
  if(dil)h+='<div class="row"><span>時間の進み</span><span class="big">/'+fmtG(g)+'</span></div><div class="row"><span class="note" style="margin:0">船の1秒の間に外で過ぎる時間（＝生産の倍率）</span><span class="num">'+fmtG(g)+'秒</span></div><div class="row"><span class="note" style="margin:0">速度</span><span class="num">'+speedText(s)+'</span></div>';
  else h+='<div class="row"><span>いまの速度</span><span class="big">'+speedText(s)+'</span></div><div class="row"><span class="note" style="margin:0">'+(s>=6?'秒速':'光速の')+'</span><span class="num">'+(s>=6?kmsOf(s).toLocaleString('ja-JP')+'km':stagePct(s)+'%')+'</span></div>';
  if(nx<=maxStage()){const label=nx>DILATION_STAGE?'時間の進み /'+fmtG(stageGamma(nx))+' まで加速する':speedText(nx)+'まで加速する';
    if(has('aA'))h+='<div class="row"><span class="note" style="margin:0">自動加速</span><button class="auto" id="bAuto"'+(S.autoAcc?' data-on':'')+'>'+(S.autoAcc?'自動':'手動')+'</button></div>';
    h+='<button class="act" id="bAcc"'+(S.E<c||blocked?' disabled':'')+'>'+label+'　<span class="num">'+fmt(c)+'</span></button>';
    const ratio=(stageGamma(nx)/g).toFixed(1),un=DEVICES.filter(d=>d.unlock===nx).map(d=>d.name);
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
  '<div class="note">緊急停止すると、エネルギー、速度、装置、改良、蓄電がなくなる。進んだ距離と、故郷で過ぎた年月は戻らない。停止のあと星図が開き、歪みで新しいスキルを覚えられる。</div>'+
  '<button class="act" id="rGo"'+(S.stage<BRAKE_STAGE||g<1||S.chal==='pR'?' disabled':'')+'>緊急停止する</button>'+(S.chal==='pR'?'<div class="note">チャレンジ「止まらない」の間は止まれない。</div>':'')+(S.stage<BRAKE_STAGE?'<div class="note">光速の90%に達すると使える。</div>':'')+
  '<div class="row" style="margin-top:10px"><span class="note" style="margin:0">持っている歪み '+fmt(S.W)+'（使わずにいると1つにつき生産+1%）</span><span class="num">×'+fmtG(wMult())+'</span></div>'+
  '<div class="row"><span class="note" style="margin:0">これまでの停止</span><span class="num">'+S.prestiges+' 回</span></div>'+
  ((S.prestiges>0||S.skills.length||S.lTotal>0)?'<button class="act" id="rMap" style="margin-top:10px;opacity:.8">星図を見る</button>':'');
  pbody.dataset.k='';pbody.innerHTML=h;
  const mp=document.getElementById('rMap');if(mp)mp.onclick=()=>openSkill(false);
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
/* 残光の強化は合間に開く（2026-11-09）：故郷に着いて再出発するときと、航路を引き直すときに「残照の地平」が開き、閉じると帆を張る */
let glowOpen=false,glowAfter=null;
function glowAffordable(){return AFTERGLOW.some(a=>{const n=glowNext(a.id);return n&&S.L>=n.cost;});}
function glowAutoSpend(){let b=true;while(b){b=false;const c=AFTERGLOW.map(a=>[a.id,glowNext(a.id)]).filter(x=>x[1]&&x[1].cost<=S.L).sort((x,y)=>x[1].cost-y[1].cost)[0];if(c){buyGlow(c[0]);b=true;}}}
function openGlow(after){if(!glowAffordable()){after();return;}glowOpen=true;glowAfter=after;document.getElementById('glowOv').classList.add('on');renderGlowOv();}
function closeGlow(){glowOpen=false;document.getElementById('glowOv').classList.remove('on');const f=glowAfter;glowAfter=null;if(f)f();}
function renderGlowOv(){const b=document.getElementById('glowBody');b.innerHTML='<div class="phead"><span class="lab">AFTERGLOW</span><span class="num" style="font-size:12px;color:var(--ink-dim)">残光 '+fmt(S.L)+'</span></div><div class="note" style="margin:0 0 4px">船を出す前に、残光で灯しておける。</div>'+glowHorizon()+'<button class="act" id="glowGo" style="margin-top:12px">帆を張る</button>';
  b.querySelectorAll('[data-gs]').forEach(g=>g.onclick=()=>{glowSel=g.dataset.gs;renderGlowOv();});
  const gb=document.getElementById('gBuy');if(gb)gb.onclick=()=>{if(buyGlow(glowSel)){SND.play('light');GLOWFX={id:glowSel,t:Date.now()};renderGlowOv();}};
  document.getElementById('glowGo').onclick=closeGlow;}
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
/* ② チャレンジ（CHALLENGE タブ）：上位の星8つの「残光の星座」。星1つごとにチャレンジが1つ。越えるとその星が灯り、周回の最初から効いて消えない */
let litSel=null;
let unlockChal=null;
function renderUnlock(){const ks=SKILLS.filter(k=>k.glow);if(S.chal!==unlockChal){unlockChal=S.chal;if(S.chal)litSel=S.chal;}if(!litSel)litSel=(S.chal||(ks.find(k=>!S.lit.includes(k.id))||ks[0]).id);
  const key='u|'+[S.lit.join(),JSON.stringify(S.chalTier),litSel,S.chal,canChallenge()].join('|');if(pbody.dataset.k===key)return;
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
    (act?'<button class="act" id="chQuit">やめる</button>':nx?'<button class="act" id="chGo"'+(canChallenge()?'':' disabled')+' style="border-color:rgba(255,200,140,.6);color:#ffd6aa">段'+nx+'に挑む</button>'+(canChallenge()?'':'<div class="note">'+(S.voy?'航海に出ている間は挑めない。':'故郷に一度着くと挑める。')+'</div>'):'<div class="note">この星は灯っている。周回の最初から効き、消えない。</div>')+'</div>';
  pbody.dataset.k=key;pbody.innerHTML=v;
  pbody.querySelectorAll('[data-us]').forEach(g=>g.onclick=()=>{litSel=g.dataset.us;pbody.dataset.k='';renderUnlock();});
  const go=document.getElementById('chGo');if(go)go.onclick=()=>confirmBox('チャレンジ「'+ch.name+'」段'+nx,'今の周回をやめて、遠い宙域から出直す。縛りは「'+ch.rule[ri]+'」。'+ch.gtext[ri]+'と、'+(nx===1?k.name+'が灯る。':'星「'+k.name+'」が強くなる。')+'距離・年月・歪み・スキルはなくなり、残光は得られない。',()=>{if(document.getElementById('title').classList.contains('on'))document.getElementById('tBack').onclick();if(startChallenge(k.id)){applyLoadedVisuals();curTab='drive';renderPanel(true);paintGoal();save();startRestart();}});
  const q=document.getElementById('chQuit');if(q)q.onclick=()=>confirmBox('チャレンジをやめる','縛りがなくなり、今の周回をそのまま続ける。この段は越えたことにならない。',()=>{quitChallenge();pbody.dataset.k='';renderPanel(true);});}
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
function renderLog(){pbody.dataset.k='';const logMode=curTab==='ach'?'ach':'log';let h='<div class="phead"><span class="lab">'+(logMode==='log'?'LOG':'RECORD')+'</span>'+(logMode==='ach'?'<span class="num" style="font-size:12px;color:var(--ink-dim)">実績 '+S.ach.length+' / '+ACHIEVEMENTS.length+'</span>':'')+'</div>';
  if(logMode==='log'){S.log.slice().reverse().forEach((e,j)=>{const col=e.c>=0?rgb(COLORS[e.c].rgb,1):'var(--ink-dim)';h+='<div class="le"><span class="y" style="color:'+col+'">故郷 '+e.y.toLocaleString('ja-JP')+'年</span><span class="t" style="opacity:'+(j===0?1:0.75)+'">'+e.t+'</span></div>';});}
  else{h+='<div class="row" style="padding:2px 0 8px"><span class="note" style="margin:0">実績1つにつき、すべての生産 +'+Math.round(ACH_BONUS*100)+'%。リセットしても消えない</span><span class="num">×'+achMult().toFixed(2)+'</span></div>';ACHIEVEMENTS.forEach(a=>{const on=S.ach.includes(a[0]);h+='<div class="ach'+(on?'':' off')+'"><span style="width:12px">'+(on?'✦':'·')+'</span><span style="flex:1">'+a[1]+'</span><span style="color:var(--ink-dim)">'+a[2]+'</span></div>';});}
  pbody.innerHTML=h;}
/* ETC の SETTING：設定の中身（#setBox）をパネルに移して出す。タイトル画面の歯車では小窓に戻して出す */
function renderSet(){const box=document.getElementById('setBox'),ps=document.getElementById('pset');if(box.parentElement!==ps)ps.appendChild(box);document.getElementById('sEnd').style.display='';paintSeg();}
