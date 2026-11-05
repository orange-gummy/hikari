'use strict';
/* =====================================================================
   UI ― 星座・リング・航路・紋章・目標・HUD・字幕・タップ
   ===================================================================== */
/* 星座 */
const CONS_PTS=[[8,34],[26,14],[46,26],[64,6],[84,22],[104,10],[122,36]],CL=[],CHL=[],CD=[];
for(let i=0;i<6;i++)CL.push(el('line',{x1:CONS_PTS[i][0],y1:CONS_PTS[i][1],x2:CONS_PTS[i+1][0],y2:CONS_PTS[i+1][1],'stroke-width':0.6},consEl));
CONS_PTS.forEach(p=>{CHL.push(el('circle',{cx:p[0],cy:p[1],r:6},consEl));CD.push(el('circle',{cx:p[0],cy:p[1],r:2.4},consEl));});
/* 航海で見つけた色の星座（故郷の7色の隣に、少し離して並べる） */
const CONS2_PTS=[[150,32],[166,14],[182,28],[196,12]],CG2=el('g',{},consEl),CL2=[],CH2=[],CD2=[];
for(let i=0;i<3;i++)CL2.push(el('line',{x1:CONS2_PTS[i][0],y1:CONS2_PTS[i][1],x2:CONS2_PTS[i+1][0],y2:CONS2_PTS[i+1][1],'stroke-width':0.6},CG2));
CONS2_PTS.forEach(p=>{CH2.push(el('circle',{cx:p[0],cy:p[1],r:6},CG2));CD2.push(el('circle',{cx:p[0],cy:p[1],r:2.2,'stroke-width':0.6},CG2));});
let cons2On=null;
function paintCons2(){const on=!!(S.voy||S.found>0);if(on!==cons2On){cons2On=on;CG2.style.display=on?'':'none';consEl.setAttribute('viewBox',on?'0 0 204 46':'0 0 130 46');consEl.setAttribute('width',on?'204':'130');}
  if(!on)return;for(let k=0;k<4;k++){const c=NEW_COLORS[k].rgb,got=k<S.found;CD2[k].setAttribute('fill',got?rgb(c,1):'none');CD2[k].setAttribute('stroke',got?'none':rgb(c,0.5));CD2[k].setAttribute('r',got?2.4:2.2);CH2[k].setAttribute('fill',rgb(c,got?0.18:0));}
  for(let k=0;k<3;k++){const both=k+1<S.found;CL2[k].setAttribute('stroke','rgba(214,190,255,'+(both?0.4:0.12)+')');CL2[k].setAttribute('stroke-dasharray',both?'':'2 3');}}
/* リング */
function arcD(r,a0,a1){return 'M'+(88+r*Math.cos(a0)).toFixed(2)+' '+(88+r*Math.sin(a0)).toFixed(2)+'A'+r+' '+r+' 0 0 1 '+(88+r*Math.cos(a1)).toFixed(2)+' '+(88+r*Math.sin(a1)).toFixed(2);}
const TKG=el('g',{},ringEl);for(let i=0;i<72;i++){const a=i/72*6.283,r2=i%6===0?80:83;el('line',{x1:88+86*Math.cos(a),y1:88+86*Math.sin(a),x2:88+r2*Math.cos(a),y2:88+r2*Math.sin(a),stroke:'rgba(236,238,242,0.3)','stroke-width':0.5},TKG);}
const SEG=[];for(let i=0;i<12;i++){const a0=-1.5708+i/12*6.283+0.05;SEG.push(el('path',{d:arcD(74,a0,a0+6.283/12-0.1),fill:'none','stroke-width':2.2,'stroke-linecap':'round'},ringEl));}
function nextMemIndex(){if(S.cleared)return -1;if(S.lost<6)return S.lost;if(!S.greyLost)return 6;return -1;}
function paintColorUI(ag){
  const n=nines(S.stage);
  for(let i=0;i<12;i++){if(i<n){const ci=i%6;SEG[i].setAttribute('stroke',rgb(mix(COLORS[ci].rgb,G,1-A[ci]),1));}else SEG[i].setAttribute('stroke','rgba(255,255,255,0.12)');}
  const nm=nextMemIndex();let warn=false;if(nm>=0&&nm<6){warn=S.years/LOSE_YEARS[nm]>0.85;}else if(nm===6)warn=S.stage>=GREY_STAGE-1;
  for(let i=0;i<7;i++){const a=A[i],col=mix(COLORS[i].rgb,[90,92,100],1-a);let op=1;if(warn&&i===nm&&A[i]>0.5)op=0.35+0.65*Math.abs(Math.sin(T*0.12));
    CD[i].setAttribute('fill',rgb(POP[i]>0.3?COLORS[i].rgb:col,1));CD[i].setAttribute('opacity',op.toFixed(2));CD[i].setAttribute('r',(1.4+1.0*Math.max(a,POP[i])+POP[i]*2.2).toFixed(2));CHL[i].setAttribute('fill',rgb(COLORS[i].rgb,(0.18*a*op+POP[i]*0.3).toFixed(3)));CHL[i].setAttribute('r',(6+POP[i]*7).toFixed(2));}
  for(let i=0;i<6;i++){const m=Math.min(A[i],A[i+1]);CL[i].setAttribute('stroke','rgba(255,255,255,'+(0.07+0.3*m).toFixed(3)+')');CL[i].setAttribute('stroke-dasharray',m<0.5?'2 3':'');}
  paintCons2();
  if(curTab==='drive')paintDeviceColors();
  if(devGlow>0.02)devGlow*=0.94;
  const hb=0.3+0.7*cl(S.dist/GOAL_LY);const hs=4+hb*6;const h=document.getElementById('rHome');h.style.width=h.style.height=hs+'px';h.style.margin=(-hs/2)+'px '+(-hs/2)+'px 0 0';h.style.boxShadow='0 0 '+(6+hb*14)+'px rgba(160,200,255,'+(0.3+hb*0.5)+')';
}
/* 航路 */
function routePos(d){return S.voy?Math.log10(1+d)/Math.log10(1+DEST[DEST.length-1].ly):Math.log10(1+d)/Math.log10(1+GOAL_LY);}
let routeMode=null;
function buildRoute(){const voy=!!S.voy;if(routeMode===voy)return;routeMode=voy;const t=document.getElementById('rTicks'),nm=document.getElementById('rNames');t.innerHTML='';nm.innerHTML='';
  const at=q=>'calc(6px + (100% - 20px)*'+q.toFixed(4)+')';
  if(!voy)REGIONS.slice(1).forEach(r=>{const d=document.createElement('i');d.className='rTick';d.style.left=at(routePos(r.from));t.appendChild(d);});
  else DEST.forEach((g,k)=>{const q=routePos(g.ly),d=document.createElement('i');d.className='rTick';d.style.left=at(q);t.appendChild(d);const s=document.createElement('span');s.textContent=g.name;s.style.left=at(q);s.dataset.k=k;nm.appendChild(s);});
  document.getElementById('rHome').style.display=voy?'none':'';}
function paintRoute(){buildRoute();if(S.voy){paintVoyRoute();return;}const p=S.cleared?1:routePos(S.dist);document.getElementById('rShip').style.left='calc(6px + (100% - 20px)*'+p.toFixed(4)+')';document.getElementById('rDone').style.width='calc((100% - 20px)*'+p.toFixed(4)+')';
  document.getElementById('rReg').textContent=REGIONS[S.region].name;const rem=Math.max(0,GOAL_LY-S.dist);document.getElementById('ds').textContent=S.cleared?'0':Math.ceil(rem).toLocaleString('ja-JP');document.getElementById('dsTo').textContent='故郷まで';}
function nextDest(){return S.found<DEST.length?DEST[S.found]:null;}
function voyRegion(){const n=nextDest(),d=S.vdist;if(d<1e5)return '故郷の銀河';if(!n)return '宇宙の果ての先';if(d<n.ly*0.6)return S.found===0?'銀河間の空隙':S.found===1?'銀河群の縁':S.found===2?'泡と糸のあいだ':'はじまりの光の手前';return n.name+'の近く';}
function lyText(n){if(n>=1e8)return fmt(n);if(n>=1e4)return Math.round(n/1e4).toLocaleString('ja-JP')+'万';return Math.ceil(n).toLocaleString('ja-JP');}
function paintVoyRoute(){const p=routePos(S.vdist),at='calc(6px + (100% - 20px)*'+p.toFixed(4)+')';document.getElementById('rShip').style.left=at;document.getElementById('rDone').style.width='calc((100% - 20px)*'+p.toFixed(4)+')';
  document.getElementById('rReg').textContent=voyRegion();const n=nextDest();document.getElementById('dsTo').textContent=n?n.name+'まで':'いちばん遠く';document.getElementById('ds').textContent=n?lyText(Math.max(0,n.ly-S.vdist)):lyText(S.vbest);
  document.querySelectorAll('#rNames span').forEach(s=>{const k=+s.dataset.k;s.style.display=k===S.found?'':'none';});}   // 名前は次の目的地だけ（詰まって読めないので）
/* 紋章 */
function emblem(svg,kind){const parts=[];const add=(t,a)=>parts.push(el(t,Object.assign({fill:'none','stroke-width':0.6},a),svg));
  add('circle',{cx:13,cy:13,r:11.5});
  if(kind==='sail')add('path',{d:'M9 19L13 6L17 19Z'});
  if(kind==='atom'){add('ellipse',{cx:13,cy:13,rx:8,ry:3.2});add('ellipse',{cx:13,cy:13,rx:8,ry:3.2,transform:'rotate(60 13 13)'});add('ellipse',{cx:13,cy:13,rx:8,ry:3.2,transform:'rotate(120 13 13)'});}
  if(kind==='fusion')add('circle',{cx:13,cy:13,r:7});
  if(kind==='anti')add('path',{d:'M13 2.5L23.5 13L13 23.5L2.5 13Z'});
  if(kind==='shell')add('path',{d:'M13 5L20 9V17L13 21L6 17V9Z'});
  if(kind==='pulsar'){add('path',{d:'M4 4L22 22M22 4L4 22'});add('circle',{cx:13,cy:13,r:4});}
  if(kind==='hole'){add('ellipse',{cx:13,cy:13,rx:10,ry:3,transform:'rotate(-20 13 13)'});add('circle',{cx:13,cy:13,r:4.5});}
  if(kind==='vacuum')add('circle',{cx:13,cy:13,r:7,'stroke-dasharray':'1.5 2.5'});
  if(kind==='anchor')add('path',{d:'M13 5V20M8 10H18M7 15Q13 23 19 15'});
  if(kind==='galaxy'){add('path',{d:'M13 13C13 9 18 9 18 13S11 19 8 14S12 4 19 7'});add('circle',{cx:13,cy:13,r:1.6});}
  if(kind==='dark')add('circle',{cx:13,cy:13,r:7.5,'stroke-dasharray':'0.8 2.6'});
  if(kind==='web')add('path',{d:'M6 8L13 6L20 10L18 18L10 20L6 8M13 6L13 13L20 10M13 13L18 18M13 13L10 20M13 13L6 8'});
  if(kind==='cmb'){add('circle',{cx:13,cy:13,r:4});add('circle',{cx:13,cy:13,r:8,'stroke-dasharray':'3 2'});}
  const core=el('circle',{cx:13,cy:13,r:2.4},svg);return{parts,core};}
/* 目標 */
function goal(){const s=S.stage,nx=s+1;
  if(S.cleared)return[canVoyage()?'GALAXYで、さらに遠くへ':'STARで、もう一度船を出す',canVoyage()?'voy':'restart',false];
  if(S.chal&&CHAL[S.chal])return['挑戦中「'+CHAL[S.chal].name+'」　'+CHAL[S.chal].gtext,null,false];
  if(S.voy&&S.stage>=MAX_STAGE){const g=tGain();return[g>=Math.max(3,S.tTotal)?'GALAXYで航路を引き直すと 航跡 +'+fmt(g):(nextDest()?nextDest().name+'まで あと'+lyText(Math.max(0,nextDest().ly-S.vdist))+'光年':'宇宙の果ての先へ'),g>=Math.max(3,S.tTotal)?'voy':null,false];}
  if(S.taps<5&&S.dev[0]===0)return['窓をタップして、エネルギーを集める',null,true];
  if(S.dev[0]===0)return['DRIVEで太陽帆を買う','drive',false];
  if(S.maxStage===0)return['BOOSTで秒速10kmまで加速する'+(S.E<accelCost(1)?'（あと'+fmt(accelCost(1)-S.E)+'）':''),S.E>=accelCost(1)?'boost':null,false];
  if(S.maxStage>=BRAKE_STAGE&&S.prestiges===0&&S.restarts===0&&wGain()>=5)return['STOPで緊急停止して、歪みを得る','reset',false];
  if(nx<=MAX_STAGE){const c=accelCost(nx),rest=S.E<c?'（あと'+fmt(c-S.E)+'）':'';return[(nx>DILATION_STAGE?'時間の進み /'+fmtG(stageGamma(nx))+' まで加速する':speedText(nx)+'まで加速する')+rest,S.E>=c&&!(has('aA')&&S.autoAcc)?'boost':null,false];}   // 自動加速中は BOOST を光らせない（たまった瞬間に加速されて一瞬だけ光るため）
  return['故郷まで あと'+Math.ceil(Math.max(0,GOAL_LY-S.dist)).toLocaleString('ja-JP')+'光年',null,false];}
let lastGoal='';
// 光らせるタブ：一度光ったら3秒は消さない（自動購入でエネルギーが加速の値段をまたぐたびに、点いたり消えたりしていた）
let hintTab=null,hintAt=0;
function hintLatch(t){const now=performance.now();if(t){hintTab=t;hintAt=now;return t;}if(hintTab&&now-hintAt<3000)return hintTab;hintTab=null;return null;}
function paintGoal(){const gEl=document.getElementById('goal'),hide=!!(BRK||RST||skillOpen||climax);gEl.style.opacity=hide?'0':'';if(hide){tabs.forEach(b=>setCls(b,'hint',false));frameEl.classList.remove('hintTap');return;}const [t,tab0,tap]=goal();const tab=hintLatch(tab0);if(t!==lastGoal){lastGoal=t;document.getElementById('goalT').textContent=t;}tabs.forEach(b=>setCls(b,'hint',!!tab&&curTab!==tab&&(b.dataset.t===tab||(b.dataset.l&&b.dataset.l===layerOf(tab)&&curLayer!==b.dataset.l&&tab!=='boost'))));/* 加速の案内は、別の層を見ているときは層のボタンを光らせない */setCls(frameEl,'hintTap',!!tap);}
/* HUD */
let lastUnit=0;
function paintHUD(){const p=fmtParts(S.E);document.getElementById('eV').textContent=p[0];document.getElementById('eU').textContent=p[1];const L=(p[0]+p[1]).length;document.getElementById('spdV').style.fontSize=(L<=6?28:L<=9?23:19)+'px';document.getElementById('rate').textContent='+'+fmt(prodRate())+' / 秒'+(S.stage>=DILATION_STAGE?'（×'+fmtG(stageGamma(S.stage))+'）':'')+(S.over>0?'　過負荷 ×'+S.overMul.toFixed(1):'');
  if(S.voy){document.getElementById('hrLab').textContent='VOYAGE';document.getElementById('yrU0').textContent='航跡 ';document.getElementById('yrU').textContent='';document.getElementById('yr').textContent=fmt(S.T);document.getElementById('yrRate').textContent='';   // 引き直しで得る航跡は VOYAGE タブに出す
    const n=nextDest(),m=document.getElementById('mem');m.textContent=n?'次の色 '+lyText(Math.max(0,n.ly-S.vdist))+'光年':'すべての色を見つけた';m.style.color='rgba(214,190,255,.9)';}
  else{document.getElementById('hrLab').textContent='HOME';document.getElementById('yrU0').textContent='';document.getElementById('yrU').textContent=' 年';
  document.getElementById('yr').textContent=Math.floor(S.years).toLocaleString('ja-JP');{const yr=yearsPerSec()*timeMult;document.getElementById('yrRate').textContent=yr<0.01?'+'+fmtY(yr*86400)+' 年/日':'+'+fmtY(yr)+' 年/秒';}
  const nm=nextMemIndex(),m=document.getElementById('mem');if(nm>=0&&nm<6){m.textContent='記憶が薄れるまで あと'+fmtY(Math.max(0,LOSE_YEARS[nm]-S.years))+'年';m.style.color=S.years/LOSE_YEARS[nm]>0.85?'#ffb38a':'';}else if(nm===6){m.textContent='最後の記憶が揺らいでいる';m.style.color='#ffb38a';}else m.textContent='';}
  const u=unitIndex(S.E);if(u>lastUnit&&u>=2){unitPop(numKanji?UNITS[UNITS.length-u][1]:'e'+(u*4));}if(u>lastUnit)lastUnit=u;paintRoute();}
function paintSpeed(){const s=S.stage,g=fmtG(stageGamma(s)),h=document.getElementById('hV'),dil=s>=DILATION_STAGE;
  document.getElementById('hLab').textContent='VELOCITY';h.textContent=s<=5?KMS[s].toLocaleString('ja-JP')+' km/s':stagePct(s)+'% c';h.style.fontSize=(h.textContent.length<=7?26:h.textContent.length<=10?21:h.textContent.length<=13?17:14)+'px';
  document.getElementById('hG').textContent=dil?'船の1秒＝外の'+g+'秒':s<=5?'光速の'+stagePct(s)+'%':'秒速'+kmsOf(s).toLocaleString('ja-JP')+'km';
  document.getElementById('spdG').textContent=dil?'時間の進み /'+g:speedText(s);}
function unitPop(u){const e=document.getElementById('unitPop');e.textContent=u;e.style.transition='none';e.style.opacity='0';e.style.transform='translateY(8px)';requestAnimationFrame(()=>{e.style.transition='';e.style.opacity='0.9';e.style.transform='translateY(0)';setTimeout(()=>{e.style.opacity='0';},1800);});}
/* 字幕 */
let subT=[];
function subtitle(t){subT.forEach(clearTimeout);subT=[];const box=document.getElementById('sub'),st=document.getElementById('subT');st.innerHTML='';const sp=[...t].map(ch=>{const s=document.createElement('span');s.textContent=ch;s.style.opacity='0';st.appendChild(s);return s;});box.style.opacity='1';sp.forEach((s,k)=>subT.push(setTimeout(()=>{s.style.opacity='1';},120+k*60)));subT.push(setTimeout(()=>{box.style.opacity='0';},120+sp.length*60+3200));}
function toast(html){const t=document.createElement('div');t.className='toast';t.innerHTML=html;document.getElementById('toasts').appendChild(t);requestAnimationFrame(()=>{t.style.opacity='1';t.style.transform='translateY(0)';});setTimeout(()=>{t.style.opacity='0';setTimeout(()=>t.remove(),600);},3000);}
function checkAch(){for(const a of achCheck())toast('実績　<b>'+a[1]+'</b>　生産 ×'+achMult().toFixed(2));}
function hudPop(text){const r=document.getElementById('yr').getBoundingClientRect();POPS.push({x:r.right-30,y:r.bottom+38,t:0,s:text});}
/* タップ */
let lastTapAt=performance.now();
frameEl.addEventListener('pointerdown',ev=>{if(climax)return;if(S.chal==='c7'){if(!window._c7t||Date.now()-window._c7t>4000){toast('チャレンジ「触れない」の間は、窓に触れられない');window._c7t=Date.now();}return;}SND.play('tap');const x=ev.clientX,y=ev.clientY;if(MET&&Math.hypot(x-MET.x,y-MET.y)<46){catchMeteor();}const now=performance.now(),charged=has('cC')&&now-lastTapAt>10000;lastTapAt=now;let g=tapGain();if(charged)g*=20;S.E+=g;S.Erun+=g;S.taps++;S.pulse=has('cA')?20:10;POPS.push({x,y:y-10,t:0,s:(charged?'×20 ':'')+'+'+fmt(g)});if(charged){fla=Math.max(fla,0.1);for(let i=0;i<30;i++){const a=Math.random()*6.283,v=R(1,3.2);P.push({x,y,vx:Math.cos(a)*v,vy:Math.sin(a)*v,l:1,c:[255,236,200],r:R(1,2),dr:0.02});}}for(let i=0;i<20;i++){const k=i%5,a=Math.random()*6.283,v=R(0.2,1.1);P.push({x,y,vx:Math.cos(a)*v,vy:Math.sin(a)*v-0.15,l:1,c:COLORS[k].rgb,r:R(0.8,2),gr:A[k]<0.5,dr:0.012});}});
