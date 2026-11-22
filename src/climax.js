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
    ct(()=>{HEARD={t:0};SND.play('hear');STILL=false;logLine(LINES.hear,-1);document.getElementById('app').classList.add('landed');
      ct(()=>{logLine(LINES.home,-1);HOMEA={t:0};document.getElementById('app').classList.add('landed');},2200);},2000);}},50);}
function homeColors(){LANDED=true;HOMEA=null;document.getElementById('app').classList.add('landed');const rw=document.getElementById('ringWrap');rw.style.transition='opacity 1.5s';rw.style.opacity='0';GAP=2400;   /* 色が戻る間隔。短いと情景が何枚も重なる */ct(()=>{for(let i=6;i>=0;i--)queueVisual(()=>visualBack(i));const w=ci(()=>{if(!VQ.length&&!vqTimer){clearInterval(w);GAP=3700;logLine(LINES.all,-1);ct(()=>landing(),3800);}},300);},1200);}
function landing(){SND.play('land');logLine(LINES.land,-1);if(!PREVIEW){if(!S.cleared){S.st.loops.push({n:S.restarts+1,sec:Math.round(S.loopTime),at:Date.now(),chal:S.chal||null});if(S.st.loops.length>100)S.st.loops.shift();}S.cleared=true;S.dist=GOAL_LY;save();}const e=document.getElementById('ending');
  /* 「着いた。」を読む間（3.5秒）を置いてから空に溶け、空が満ちてから「空は、こんな色だった。」 */
  END.push(setTimeout(()=>{e.classList.add('on');requestAnimationFrame(()=>{e.style.opacity='1';});},3500));
  END.push(setTimeout(()=>{document.getElementById('endLine').style.opacity='1';endShown=performance.now();},3500+5000));END.push(setTimeout(showTitle,3500+14500));}
let END=[],endShown=0;
/* 章の扉（2026-11-16）：上位の星8つを灯して故郷に着いたとき、いつものタイトルの前に一度だけ出る。
   故郷の家並みの上、空の高いところに隣の銀河が浮かび、地平線からそこへ細い航路がのびて、船の光が上っていく */
function doorScene(){const W=innerWidth,H=innerHeight,hz=Math.round(H*0.88),gx=W*0.5,gy=H*0.17,gr=Math.max(26,Math.min(W,H)*0.07);titleScene('dSky',0.88);
  let sd=5;const rnd=()=>{sd=(sd*16807)%2147483647;return sd/2147483647;},f=n=>n.toFixed(1);
  let v='<svg width="'+W+'" height="'+H+'" viewBox="0 0 '+W+' '+H+'" aria-hidden="true"><defs><radialGradient id="dCore"><stop offset="0" stop-color="#fff" stop-opacity=".9"/><stop offset=".25" stop-color="rgb(210,200,255)" stop-opacity=".35"/><stop offset="1" stop-color="rgb(180,170,255)" stop-opacity="0"/></radialGradient>'+
    '<linearGradient id="dRoute" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stop-color="rgb(255,226,190)" stop-opacity=".7"/><stop offset="1" stop-color="rgb(200,190,255)" stop-opacity=".15"/></linearGradient></defs>';
  // 隣の銀河：2本の腕に光の点
  v+='<circle cx="'+f(gx)+'" cy="'+f(gy)+'" r="'+f(gr*2.4)+'" fill="url(#dCore)" opacity=".35"/>';
  for(let k=0;k<160;k++){const arm=k%2,t=rnd(),a=arm*Math.PI+t*4.6+0.4,rr=t*gr*1.6;v+='<circle cx="'+f(gx+Math.cos(a)*rr+(rnd()-0.5)*gr*0.2)+'" cy="'+f(gy+Math.sin(a)*rr*0.42+(rnd()-0.5)*gr*0.14)+'" r="'+(0.4+rnd()*0.7).toFixed(2)+'" fill="'+(rnd()<0.25?'#cfc6ff':'#eceef2')+'" opacity="'+((0.25+rnd()*0.6)*(1-t*0.55)).toFixed(2)+'"/>';}
  v+='<circle cx="'+f(gx)+'" cy="'+f(gy)+'" r="'+f(gr*0.45)+'" fill="url(#dCore)"/>';
  // 地平線から銀河へ、細い航路と目盛り。船の光が上っていく
  const x0=W*0.5,y0=hz-4,cx1=W*1.02,cy1=(hz+gy)*0.52,d='M'+f(x0)+' '+f(y0)+'Q'+f(cx1)+' '+f(cy1)+' '+f(gx)+' '+f(gy+gr*0.8);
  v+='<path d="'+d+'" fill="none" stroke="url(#dRoute)" stroke-width="1" stroke-dasharray="2 5"/>';
  for(let k=1;k<10;k++){const t=k/10,bx=(1-t)*(1-t)*x0+2*(1-t)*t*cx1+t*t*gx,by=(1-t)*(1-t)*y0+2*(1-t)*t*cy1+t*t*(gy+gr*0.8);v+='<circle cx="'+f(bx)+'" cy="'+f(by)+'" r="1" fill="rgba(236,238,242,'+(0.5-t*0.3).toFixed(2)+')"/>';}
  v+='<circle r="2.4" fill="#fff"><animateMotion dur="9s" repeatCount="indefinite" path="'+d+'" keyPoints="0;1" keyTimes="0;1" calcMode="spline" keySplines=".5 0 .5 1"/></circle><circle r="9" fill="rgba(255,236,210,.25)"><animateMotion dur="9s" repeatCount="indefinite" path="'+d+'" keyPoints="0;1" keyTimes="0;1" calcMode="spline" keySplines=".5 0 .5 1"/></circle>';
  document.getElementById('dFar').innerHTML=v+'</svg>';}
// 成し遂げたこと：灯した上位の星8つを小さな星座で、故郷に着いた回数。次に開くもの
function paintDoorText(){const ks=SKILLS.filter(k=>k.glow),W=230,H=70,P=ks.map((_,i)=>{const a=-Math.PI/2+i*Math.PI*2/ks.length;return [W/2+Math.cos(a)*92,H/2+Math.sin(a)*26];});
  let v='<svg width="'+W+'" height="'+H+'" viewBox="0 0 '+W+' '+H+'" aria-label="灯した上位の星">';
  ks.forEach((k,i)=>{const a=P[i],b=P[(i+1)%ks.length];v+='<line x1="'+a[0].toFixed(1)+'" y1="'+a[1].toFixed(1)+'" x2="'+b[0].toFixed(1)+'" y2="'+b[1].toFixed(1)+'" stroke="rgba(255,236,200,.35)" stroke-width=".7"/>';});
  ks.forEach((k,i)=>{const [x,y]=P[i],c=BR_COL[k.br];v+='<circle class="bStar" style="animation-delay:-'+(i*0.6)+'s" cx="'+x.toFixed(1)+'" cy="'+y.toFixed(1)+'" r="7" fill="rgba('+c.join(',')+',.25)"/><circle cx="'+x.toFixed(1)+'" cy="'+y.toFixed(1)+'" r="2.2" fill="rgb('+c.join(',')+')"/>';});
  document.getElementById('dStars').innerHTML=v+'</svg>';
  const n=S.restarts+(S.cleared?1:0);document.getElementById('dSum').innerHTML='上位の星 <b>'+S.lit.length+' / '+ks.length+'</b> が灯った<i>·</i>故郷に着いた <b>'+n+'</b> 回';
  document.getElementById('dOpen').innerHTML='<span class="dOL">ひらくもの</span>隣の銀河への航海<i>·</i>新しい色と装置<i>·</i>航路の分かれ道';}
function showDoor(){S.flags.door=true;save();doorScene();paintDoorText();document.getElementById('door').classList.add('on');}
/* 2026-11-22 章の扉 IV：はじめて宇宙の果てに着くと一度だけ（S.flags.door4）。たどった4つの色の航路が、赤くかすむ宇宙の果てまで続き、その向こうに次の宇宙の一点 */
const DOOR3_HTML=document.getElementById('dBody').innerHTML;
function door4Scene(){const W=innerWidth,H=innerHeight,f=n=>n.toFixed(1);document.getElementById('dSky').innerHTML='';
  let sd=9;const rnd=()=>{sd=(sd*16807)%2147483647;return sd/2147483647;};
  let v='<svg width="'+W+'" height="'+H+'" viewBox="0 0 '+W+' '+H+'" aria-hidden="true"><defs><linearGradient id="d4Edge" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="rgb(255,120,110)" stop-opacity="0"/><stop offset=".55" stop-color="rgb(255,120,110)" stop-opacity=".16"/><stop offset="1" stop-color="rgb(255,120,110)" stop-opacity="0"/></linearGradient><radialGradient id="d4Pt"><stop offset="0" stop-color="#fff" stop-opacity=".9"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></radialGradient></defs>';
  for(let k=0;k<Math.round(W*H/2400);k++){const tw=rnd()<0.3;v+='<circle'+(tw?' class="gTw" style="animation-delay:-'+(rnd()*5).toFixed(1)+'s"':'')+' cx="'+f(rnd()*W)+'" cy="'+f(rnd()*H)+'" r="'+(0.3+rnd()*0.7).toFixed(2)+'" fill="#eceef2" opacity="'+(0.12+rnd()*0.45).toFixed(2)+'"/>';}
  // 宇宙の果て：上のほうに、赤くかすむ大きな弧（はじまりの赤）
  const ey=H*0.13,R=W*1.6;v+='<path d="M'+f(-W*0.1)+' '+f(ey+H*0.08)+'Q'+f(W/2)+' '+f(ey-H*0.06)+' '+f(W*1.1)+' '+f(ey+H*0.08)+'" fill="none" stroke="url(#d4Edge)" stroke-width="'+f(H*0.07)+'"/>';
  v+='<path d="M'+f(-W*0.1)+' '+f(ey+H*0.08)+'Q'+f(W/2)+' '+f(ey-H*0.06)+' '+f(W*1.1)+' '+f(ey+H*0.08)+'" fill="none" stroke="rgba(255,150,140,.45)" stroke-width=".7" stroke-dasharray="1 4"/>';
  // その向こうの一点（次の宇宙）：細く巻く光
  const px=W/2,py=ey-H*0.05;for(let k=0;k<3;k++){v+='<ellipse cx="'+f(px)+'" cy="'+f(py)+'" rx="'+(10+k*7)+'" ry="'+(3+k*2.2)+'" fill="none" stroke="rgba(236,238,242,'+(0.3-k*0.08).toFixed(2)+')" stroke-width=".5"/>';}
  v+='<circle cx="'+f(px)+'" cy="'+f(py)+'" r="7" fill="url(#d4Pt)"/><circle cx="'+f(px)+'" cy="'+f(py)+'" r="1.6" fill="#fff"/>';
  // たどった航路：下の船から、紫・藍・銀・赤の4つの点を通って果てへ
  const pts=[[W*0.5,H*0.97],[W*0.3,H*0.86],[W*0.72,H*0.74],[W*0.26,H*0.62],[W*0.6,ey+H*0.07]];
  let d='M'+f(pts[0][0])+' '+f(pts[0][1]);for(let i=1;i<pts.length;i++){const a=pts[i-1],b=pts[i],my=(a[1]+b[1])/2;d+='C'+f(a[0])+' '+f(my)+' '+f(b[0])+' '+f(my)+' '+f(b[0])+' '+f(b[1]);}
  v+='<path d="'+d+'" fill="none" stroke="rgba(236,238,242,.22)" stroke-width=".8" stroke-dasharray="2 5"/>';
  for(let i=1;i<pts.length;i++){const [x,y]=pts[i];v+='<circle cx="'+f(x)+'" cy="'+f(y)+'" r="1.6" fill="rgba(236,238,242,.6)"/>';}   // 目的地は小さな白い点だけ（色の点と光の輪はやめた、2026-11-22）
  v+='<circle r="2.2" fill="#fff"><animateMotion dur="11s" repeatCount="indefinite" path="'+d+'" calcMode="spline" keyPoints="0;1" keyTimes="0;1" keySplines=".5 0 .5 1"/></circle>';
  document.getElementById('dFar').innerHTML=v+'</svg>';}
function showDoor4(){S.flags.door4=true;save();const b=document.getElementById('dBody');
  const cs=NEW_COLORS.map((c,i)=>'<circle cx="'+(30+i*56)+'" cy="18" r="7" fill="rgba('+c.rgb.join(',')+',.25)"/><circle cx="'+(30+i*56)+'" cy="18" r="2.4" fill="rgb('+c.rgb.join(',')+')"/>'+(i?'<line x1="'+(30+(i-1)*56+8)+'" y1="18" x2="'+(30+i*56-8)+'" y2="18" stroke="rgba(236,238,242,.3)" stroke-width=".7" stroke-dasharray="2 4"/>':'')).join('');
  b.innerHTML='<div class="dDone"><div class="dCh">CHAPTER III　さらに遠くへ</div><div id="dStars"><svg width="228" height="36" viewBox="0 0 228 36" aria-label="見つけた4つの色">'+cs+'</svg></div><div class="dSum">見つけた色 <b>'+NEW_COLORS.length+'</b><i>·</i>航路を引き直した <b>'+(S.st.redraws||0)+'</b> 回<i>·</i>9 × <b>'+nines(S.maxStage)+'</b></div></div><div class="dRule"></div><div class="dCh">CHAPTER IV</div><h1>新しい宇宙</h1><div class="dLine">果ての向こうに、もうひとつの宇宙がある。</div><div class="dOpen"><span class="dOL">ひらくもの</span>宇宙を畳む<i>·</i>次の宇宙の時の流れを選ぶ<i>·</i>法則</div><button class="act" id="dGo">先へ</button>';
  door4Scene();document.getElementById('door').classList.add('on');
  document.getElementById('dGo').onclick=()=>{closeDoor();b.innerHTML=DOOR3_HTML;bindDoorGo();curLayer='universe';curTab='uni';renderPanel(true);};}
function closeDoor(){document.getElementById('door').classList.remove('on');}
function bindDoorGo(){document.getElementById('dGo').onclick=()=>{closeDoor();goFarther();};}bindDoorGo();
addEventListener('resize',()=>{if(document.getElementById('door').classList.contains('on'))(S.flags.door4&&S.voy?door4Scene:doorScene)();});
function showTitle(){END.forEach(clearTimeout);END=[];endShown=0;document.getElementById('skipC').style.display='none';if(!PREVIEW&&canVoyage()){showDoor();return;}paintTitle();titleScene();document.getElementById('title').classList.add('on');}
// 「空は、こんな色だった。」はタップで飛ばせる（文字が出てから）
// iPhone では div の click が届かないことがあるので pointerup で受ける。文字が見えてから（出始めて1.5秒後から）飛ばせる
document.getElementById('ending').addEventListener('pointerup',()=>{if(!END.length||document.getElementById('title').classList.contains('on'))return;if(!endShown||performance.now()-endShown<1500)return;showTitle();});
let PREVIEW=null;
document.getElementById('sEnd').onclick=()=>{bootGo(true);document.getElementById('mSet').classList.remove('on');PREVIEW={log:S.log.length,flags:Object.assign({},S.flags)};startClimax();};
document.getElementById('tBack').onclick=()=>{clearSub();if(PREVIEW){S.log.length=PREVIEW.log;S.flags=PREVIEW.flags;PREVIEW=null;setTimeout(()=>{applyLoadedVisuals();renderPanel(true);},0);}document.getElementById('title').classList.remove('on');const e=document.getElementById('ending');e.classList.remove('on');e.style.opacity='0';document.getElementById('block').style.display='none';document.getElementById('panel').style.opacity='1';climax=false;HOMEA=null;LANDED=false;HEARD=null;fla=0;SPDF=1;STILL=false;BLOOM=null;GAP=3700;document.getElementById('app').classList.remove('landed');document.getElementById('ringWrap').style.opacity='';};
function paintTitle(){document.getElementById('tBack').style.display=PREVIEW?'':'none';const f=document.getElementById('tFar');f.style.display=!PREVIEW&&canVoyage()?'':'none';const b=document.getElementById('tAgain');b.disabled=!!PREVIEW||!S.cleared;b.textContent=PREVIEW||!S.cleared?'もう一度、船を出す':'もう一度、船を出す　記憶 +'+fmt(lGain());}
document.getElementById('tAgain').onclick=()=>{if(PREVIEW||!S.cleared)return;document.getElementById('tBack').onclick();rebirth();applyLoadedVisuals();for(let i=0;i<7;i++){A[i]=0.4;}curTab='drive';renderPanel(true);paintGoal();save();openGlow(()=>startRestart(true));};
// ③ さらに遠くへ：着いたあとの故郷から、長い航海に出る
function goFarther(){if(!canVoyage())return;if(climax||document.getElementById('title').classList.contains('on'))document.getElementById('tBack').onclick();startVoyage();applyLoadedVisuals();curTab='drive';renderPanel(true);paintGoal();save();startRestart();}   // 星8つで着くとタイトルの代わりに扉が出るので、タイトルが出ていなくても到着の演出を片づける（2026-11-18 まで片づけず、航海に出ても時間が止まったままだった）
document.getElementById('tGear').onclick=()=>openSettings();
document.getElementById('tFar').onclick=()=>{if(!PREVIEW)goFarther();};
// 「最初から遊ぶ」はタイトルから外した（2026-11-15）。最初からやり直すのは設定から
// 2回目以降の到着は、演出を飛ばしてタイトルへ進める
function skipClimax(){if(!climax)return;CLT.forEach(id=>{clearTimeout(id);clearInterval(id);});CLT=[];VQ.length=0;if(vqTimer){clearTimeout(vqTimer);vqTimer=null;}
  HOMEA=null;HEARD=null;STILL=false;SPDF=0;GAP=3700;LANDED=true;document.getElementById('app').classList.add('landed');document.getElementById('ringWrap').style.opacity='0';
  landing();for(let i=0;i<7;i++){TG[i]=1;A[i]=1;RV[i]=1;}showTitle();}
document.getElementById('skipC').onclick=skipClimax;
/* タイトルの景色（2026-11-15）：着いたばかりの故郷の空。地平線ぞいに家並みと窓の明かり、木々、電線を光の点と線で描き、
   空には戻ってきた7色が淡い帯になって残る。題名はその空に浮かぶ */
function titleScene(id,hzR){const el=document.getElementById(id||'tSky');if(!el)return;const W=innerWidth,H=innerHeight,hz=Math.round(H*(hzR||0.8));
  let sd=11;const rnd=()=>{sd=(sd*16807)%2147483647;return sd/2147483647;},C=COLORS.map(c=>c.rgb),rg=(c,a)=>'rgba('+c[0]+','+c[1]+','+c[2]+','+a+')';
  let v='<svg width="'+W+'" height="'+H+'" viewBox="0 0 '+W+' '+H+'" aria-hidden="true"><defs>'+
    '<linearGradient id="tBand" x1="0" y1="0" x2="0" y2="1">'+C.map((c,i)=>'<stop offset="'+(i/6).toFixed(3)+'" stop-color="'+rg(c,1)+'"/>').join('')+'</linearGradient>'+
    '<linearGradient id="tFadeX" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#fff" stop-opacity="0"/><stop offset=".25" stop-color="#fff"/><stop offset=".75" stop-color="#fff"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></linearGradient>'+
    '<linearGradient id="tFadeY" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff" stop-opacity="0"/><stop offset=".5" stop-color="#fff" stop-opacity="1"/><stop offset="1" stop-color="#fff" stop-opacity=".4"/></linearGradient>'+
    '<mask id="tBandM"><rect x="0" y="0" width="'+W+'" height="'+H+'" fill="url(#tFadeX)"/></mask><mask id="tBandY" maskContentUnits="objectBoundingBox"><rect x="0" y="0" width="1" height="1" fill="url(#tFadeY)"/></mask>'+
    '<radialGradient id="tGlow" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="rgb(255,190,140)" stop-opacity=".16"/><stop offset="1" stop-color="rgb(255,190,140)" stop-opacity="0"/></radialGradient>'+
    '<radialGradient id="tWin"><stop offset="0" stop-color="#fff" stop-opacity=".9"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></radialGradient></defs>';
  // 星（空の上ほど多い）
  const ns=Math.round(W*hz/4200);for(let k=0;k<ns;k++){const y=Math.pow(rnd(),1.6)*(hz-60),tw=rnd()<0.3;v+='<circle'+(tw?' class="gTw" style="animation-delay:-'+(rnd()*5).toFixed(1)+'s"':'')+' cx="'+(rnd()*W).toFixed(1)+'" cy="'+y.toFixed(1)+'" r="'+(0.35+rnd()*0.75).toFixed(2)+'" fill="#eceef2" opacity="'+(0.2+0.6*rnd()*(1-y/hz)).toFixed(2)+'"/>';}
  // 戻ってきた7色：地平線の上に、淡い帯
  const bh=Math.min(170,hz*0.28);v+='<g mask="url(#tBandM)"><g mask="url(#tBandY)"><rect class="tBand" x="0" y="'+(hz-bh*1.3)+'" width="'+W+'" height="'+(bh*1.3)+'" fill="url(#tBand)" opacity=".24"/></g></g>'+
    '<ellipse cx="'+(W/2)+'" cy="'+hz+'" rx="'+(W*0.6)+'" ry="'+(bh*0.9)+'" fill="url(#tGlow)"/>';
  // 地平線と家並み
  const ln='rgba(236,238,242,.32)';let x=-10,h='';
  while(x<W+20){const r=rnd();
    if(r<0.58){const w=26+rnd()*40,ht=18+rnd()*34,roof=rnd()<0.55,top=hz-ht;   // 家：屋根の線と、窓の明かり
      h+='<path d="M'+x.toFixed(1)+' '+hz+'V'+top.toFixed(1)+(roof?'L'+(x+w/2).toFixed(1)+' '+(top-10-rnd()*6).toFixed(1)+'L'+(x+w).toFixed(1)+' '+top.toFixed(1):'H'+(x+w).toFixed(1))+'V'+hz+'" fill="#04050C" stroke="'+ln+'" stroke-width=".7"/>';
      const cols=Math.max(1,Math.floor((w-8)/11)),rows=Math.max(1,Math.floor((ht-8)/11));
      for(let a=0;a<cols;a++)for(let b=0;b<rows;b++){if(rnd()<0.45)continue;const wx=x+6+a*11+3,wy=top+6+b*11+3,c=rnd()<0.7?[255,214,140]:C[Math.floor(rnd()*7)];
        h+='<circle cx="'+wx.toFixed(1)+'" cy="'+wy.toFixed(1)+'" r="5" fill="url(#tWin)" opacity=".12"/><rect x="'+(wx-1.6).toFixed(1)+'" y="'+(wy-2).toFixed(1)+'" width="3.2" height="4" fill="'+rg(c,0.85)+'"/>';}
      x+=w+2+rnd()*6;}
    else if(r<0.85){const n=4+Math.floor(rnd()*5),cx0=x+12,ht=16+rnd()*24;   // 木：光の点の集まり
      h+='<line x1="'+cx0.toFixed(1)+'" y1="'+hz+'" x2="'+cx0.toFixed(1)+'" y2="'+(hz-ht*0.5).toFixed(1)+'" stroke="'+ln+'" stroke-width=".7"/>';
      for(let k=0;k<n*3;k++){const a=rnd()*6.283,rr=rnd()*ht*0.45;h+='<circle cx="'+(cx0+Math.cos(a)*rr).toFixed(1)+'" cy="'+(hz-ht*0.62+Math.sin(a)*rr*0.8).toFixed(1)+'" r="'+(0.6+rnd()*0.8).toFixed(2)+'" fill="'+rg(rnd()<0.75?C[1]:C[2],0.55)+'"/>';}
      x+=26+rnd()*10;}
    else{x+=18+rnd()*30;}}
  // 電柱と電線
  const poles=[];for(let px=W*0.08+rnd()*40;px<W;px+=150+rnd()*90)poles.push(px);
  poles.forEach(px=>{h+='<line x1="'+px.toFixed(1)+'" y1="'+hz+'" x2="'+px.toFixed(1)+'" y2="'+(hz-74)+'" stroke="'+ln+'" stroke-width=".8"/><line x1="'+(px-9).toFixed(1)+'" y1="'+(hz-68)+'" x2="'+(px+9).toFixed(1)+'" y2="'+(hz-68)+'" stroke="'+ln+'" stroke-width=".8"/>';});
  for(let i=1;i<poles.length;i++){const a=poles[i-1],b=poles[i];for(const dy of [-68,-62])h+='<path d="M'+a.toFixed(1)+' '+(hz+dy)+'Q'+((a+b)/2).toFixed(1)+' '+(hz+dy+16)+' '+b.toFixed(1)+' '+(hz+dy)+'" fill="none" stroke="rgba(236,238,242,.2)" stroke-width=".6"/>';}
  v+=h+'<line x1="0" y1="'+hz+'" x2="'+W+'" y2="'+hz+'" stroke="rgba(236,238,242,.4)" stroke-width=".7"/><rect x="0" y="'+(hz+0.5)+'" width="'+W+'" height="'+(H-hz)+'" fill="#04050C"/>';
  // 地面の上に、点々と街灯
  for(let k=0;k<Math.round(W/90);k++){const lx=rnd()*W,ly=hz+10+rnd()*(H-hz-20);v+='<circle cx="'+lx.toFixed(1)+'" cy="'+ly.toFixed(1)+'" r="6" fill="url(#tWin)" opacity=".08"/><circle cx="'+lx.toFixed(1)+'" cy="'+ly.toFixed(1)+'" r=".9" fill="rgb(255,214,140)" opacity=".7"/>';}
  el.innerHTML=v+'</svg>';}
addEventListener('resize',()=>{if(document.getElementById('title').classList.contains('on'))titleScene();});
