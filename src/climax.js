'use strict';
/* =====================================================================
   CLIMAX ― 光速の限界から着陸まで
   ===================================================================== */
let climax=false;
// 到着の演出のタイマー（スキップで全部止める）
let CLT=[];const ct=(f,ms)=>{const id=setTimeout(f,ms);CLT.push(id);return id;},ci=(f,ms)=>{const id=setInterval(f,ms);CLT.push(id);return id;};
function startClimax(){climax=true;CLT.forEach(clearTimeout);CLT=[];document.getElementById('skipC').style.display=S.restarts>0&&!PREVIEW?'':'none';document.getElementById('block').style.display='block';VQ.length=0;if(vqTimer){clearTimeout(vqTimer);vqTimer=null;}
  for(let i=0;i<7;i++){TG[i]=0;}story(null,LINES.arrive);if(typeof skillOpen!=='undefined'&&skillOpen)closeSkill();
  const t0=Date.now();const dec=ci(()=>{const p=cl((Date.now()-t0)/2600);SPDF=1-ei(p);if(p>=1){clearInterval(dec);SPDF=0;STILL=true;document.getElementById('panel').style.opacity='.2';
    ct(()=>{HEARD={t:0};STILL=false;logLine(LINES.hear,-1);document.getElementById('app').classList.add('landed');
      ct(()=>{logLine(LINES.home,-1);HOMEA={t:0};document.getElementById('app').classList.add('landed');},2200);},2000);}},50);}
function homeColors(){LANDED=true;HOMEA=null;document.getElementById('app').classList.add('landed');const rw=document.getElementById('ringWrap');rw.style.transition='opacity 1.5s';rw.style.opacity='0';GAP=2400;   /* 色が戻る間隔。短いと情景が何枚も重なる */ct(()=>{for(let i=6;i>=0;i--)queueVisual(()=>visualBack(i));const w=ci(()=>{if(!VQ.length&&!vqTimer){clearInterval(w);GAP=3700;logLine(LINES.all,-1);ct(()=>landing(),3800);}},300);},1200);}
function landing(){logLine(LINES.land,-1);if(!PREVIEW){S.cleared=true;S.dist=GOAL_LY;save();}const e=document.getElementById('ending');e.classList.add('on');requestAnimationFrame(()=>{e.style.opacity='1';});
  END.push(setTimeout(()=>{document.getElementById('endLine').style.opacity='1';endShown=performance.now();},3500));END.push(setTimeout(showTitle,13000));}
let END=[],endShown=0;
function showTitle(){END.forEach(clearTimeout);END=[];endShown=0;document.getElementById('skipC').style.display='none';paintTitle();document.getElementById('title').classList.add('on');}
// 「空は、こんな色だった。」はタップで飛ばせる（文字が出てから）
// iPhone では div の click が届かないことがあるので pointerup で受ける。文字が見えてから（出始めて1.5秒後から）飛ばせる
document.getElementById('ending').addEventListener('pointerup',()=>{if(!END.length||document.getElementById('title').classList.contains('on'))return;if(!endShown||performance.now()-endShown<1500)return;showTitle();});
let PREVIEW=null;
document.getElementById('sEnd').onclick=()=>{document.getElementById('mSet').classList.remove('on');PREVIEW={log:S.log.length,flags:Object.assign({},S.flags)};startClimax();};
document.getElementById('tBack').onclick=()=>{if(PREVIEW){S.log.length=PREVIEW.log;S.flags=PREVIEW.flags;PREVIEW=null;setTimeout(()=>{applyLoadedVisuals();renderPanel(true);},0);}document.getElementById('title').classList.remove('on');const e=document.getElementById('ending');e.classList.remove('on');e.style.opacity='0';document.getElementById('block').style.display='none';document.getElementById('panel').style.opacity='1';climax=false;HOMEA=null;LANDED=false;HEARD=null;fla=0;SPDF=1;STILL=false;BLOOM=null;GAP=3700;document.getElementById('app').classList.remove('landed');document.getElementById('ringWrap').style.opacity='';};
function paintTitle(){const f=document.getElementById('tFar');f.style.display=!PREVIEW&&canVoyage()?'':'none';const b=document.getElementById('tAgain');b.disabled=!!PREVIEW||!S.cleared;b.textContent=PREVIEW||!S.cleared?'もう一度、船を出す':'もう一度、船を出す　残光 +'+fmt(lGain());}
document.getElementById('tAgain').onclick=()=>{if(PREVIEW||!S.cleared)return;document.getElementById('tBack').onclick();rebirth();applyLoadedVisuals();for(let i=0;i<7;i++){A[i]=0.4;}curTab='drive';renderPanel(true);paintGoal();save();startRestart(true);};
// ③ さらに遠くへ：着いたあとの故郷から、長い航海に出る
function goFarther(){if(!canVoyage())return;if(document.getElementById('title').classList.contains('on'))document.getElementById('tBack').onclick();startVoyage();applyLoadedVisuals();curTab='drive';renderPanel(true);paintGoal();save();startRestart();}
document.getElementById('tFar').onclick=()=>{if(!PREVIEW)goFarther();};
document.getElementById('tNew').onclick=()=>{S=freshState();applyLoadedVisuals();save();document.getElementById('tBack').onclick();renderPanel(true);prologue();};
// 2回目以降の到着は、演出を飛ばしてタイトルへ進める
function skipClimax(){if(!climax)return;CLT.forEach(id=>{clearTimeout(id);clearInterval(id);});CLT=[];VQ.length=0;if(vqTimer){clearTimeout(vqTimer);vqTimer=null;}
  HOMEA=null;HEARD=null;STILL=false;SPDF=0;GAP=3700;LANDED=true;document.getElementById('app').classList.add('landed');document.getElementById('ringWrap').style.opacity='0';
  landing();for(let i=0;i<7;i++){TG[i]=1;A[i]=1;RV[i]=1;}showTitle();}
document.getElementById('skipC').onclick=skipClimax;
