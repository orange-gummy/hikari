'use strict';
/* =====================================================================
   UI ― 統計（ETC の STATS）
   全体と、開いている層ごとの記録。故郷までの1周の時間は、光の点と線の小さなグラフにする。
   ===================================================================== */
function durLong(sec){sec=Math.max(0,Math.round(sec||0));const d=Math.floor(sec/86400),h=Math.floor(sec%86400/3600),m=Math.floor(sec%3600/60);
  return d?d+'日'+(h?h+'時間':''):h?h+'時間'+(m?m+'分':''):m?m+'分':sec+'秒';}
function dateText(ms){const d=new Date(ms);return d.getFullYear()+'年'+(d.getMonth()+1)+'月'+d.getDate()+'日';}
function stRow(label,val){return '<div class="row" style="padding:3px 0"><span class="note" style="margin:0">'+label+'</span><span class="num">'+val+'</span></div>';}
function stHead(name){return '<div class="stHead">'+name+'</div>';}
/* 故郷までの1周の時間：横に周回、縦に時間（対数）。いちばん短い周を灯す */
function loopChart(L){if(L.length<2)return '';const W=360,H=96,px=24,py=14,n=L.length,hrs=L.map(l=>Math.max(1/60,l.sec/3600)),lo=Math.log(Math.min(...hrs)),hi=Math.log(Math.max(...hrs)),sp=Math.max(0.5,hi-lo);
  const P=hrs.map((h,i)=>[px+(W-2*px)*(n===1?0.5:i/(n-1)),py+(H-2*py-12)*(1-(Math.log(h)-lo)/sp)]),best=hrs.indexOf(Math.min(...hrs));
  let v='<svg class="uniSky" viewBox="0 0 '+W+' '+H+'" aria-label="故郷までの1周の時間"><polyline points="'+P.map(p=>p[0].toFixed(1)+','+p[1].toFixed(1)).join(' ')+'" fill="none" stroke="rgba(255,236,200,.35)" stroke-width=".7"/>';
  P.forEach(([x,y],i)=>{const b=i===best;if(b)v+='<circle cx="'+x.toFixed(1)+'" cy="'+y.toFixed(1)+'" r="8" fill="rgba(255,214,170,.25)"/>';v+='<circle cx="'+x.toFixed(1)+'" cy="'+y.toFixed(1)+'" r="'+(b?2.4:1.5)+'" fill="'+(b?'#ffe2be':'rgba(236,238,242,.75)')+'"/>';});
  const step=Math.ceil(n/8);L.forEach((l,i)=>{if(i%step===0||i===n-1)v+='<text x="'+P[i][0].toFixed(1)+'" y="'+(H-4)+'" text-anchor="middle" font-size="8.5" fill="rgba(236,238,242,.4)">'+l.n+'</text>';});
  return v+'</svg>';}
function renderStats(){const key='st|'+Math.floor(S.st.play/30)+'|'+S.st.loops.length+'|'+S.restarts+'|'+S.uni+'|'+S.st.stops;if(pbody.dataset.k===key)return;pbody.dataset.k=key;const st=S.st;
  let h='<div class="phead"><span class="lab">STATS</span><span class="num" style="font-size:11px;color:var(--ink-dim)">'+dateText(st.since)+'から記録</span></div>';
  h+=stHead('ALL')+stRow('記録を始めてから',durLong((Date.now()-st.since)/1000))+stRow('画面を開いていた時間',durLong(st.play))+stRow('放置で進んだ時間',durLong(st.idle))+
    stRow('窓をタップした回数',S.taps.toLocaleString('ja-JP'))+stRow('いちばん多く持ったエネルギー',fmt(S.maxE||S.E))+stRow('実績',S.ach.length+' / '+ACHIEVEMENTS.length);
  h+=stHead('HOME')+stRow('緊急停止した回数',st.stops.toLocaleString('ja-JP'))+stRow('得た歪みの合計',fmt(S.wTotal||0))+stRow('いま覚えているスキル',S.skills.length+' / '+SKILLS.filter(k=>!k.glow).length);
  if(layerOpen('star')){const L=st.loops,best=L.length?Math.min(...L.map(l=>l.sec)):0,arr=S.restarts+(S.cleared||S.voy?1:0);
    h+=stHead('STAR')+stRow('故郷に着いた回数',arr)+stRow('再出発した回数',S.restarts)+stRow('得た残光の合計',fmt(S.lTotal||0))+
      (L.length?stRow('故郷までの1周（いちばん短い）',durLong(best))+stRow('故郷までの1周（いちばん最近）',durLong(L[L.length-1].sec)):'')+
      stRow('灯した上位の星',S.lit.length+' / '+SKILLS.filter(k=>k.glow).length);
    if(L.length>=2)h+='<div class="note" style="margin:8px 0 0">故郷までの1周の時間（灯った点がいちばん短い周）</div>'+loopChart(L);
    const ch=Object.keys(st.chal);if(ch.length)h+=ch.map(id=>stRow('「'+CHAL[id].name+'」を越えた日',dateText(st.chal[id]))).join('');}
  if(layerOpen('galaxy')){h+=stHead('GALAXY')+stRow('航路を引き直した回数',st.redraws)+stRow('得た航跡の合計',fmt(S.tTotal||0))+stRow('いちばん遠く進んだ距離',lyText(S.vbest||0)+' 光年');
    DEST.forEach((d,k)=>{if(st.dest[k])h+=stRow(d.name+'に着いた日',dateText(st.dest[k]));});}
  if(layerOpen('universe')){h+=stHead('UNIVERSE')+stRow('畳んだ宇宙の数',S.uni)+stRow('得た法則の合計',fmt(S.uTotal||0))+stRow('いまの宇宙にいる時間',durLong(S.uTime));
    S.uHist.forEach((u,i)=>{h+=stRow('宇宙 '+roman(i+1)+' にいた時間',durLong(u.time));});}
  if(S.lightDone)h+=stHead('LIGHT')+stRow('光になった日',dateText(S.lightAt))+stRow('記録を始めてから光になるまで',durLong((S.lightAt-st.since)/1000));
  pbody.innerHTML=h;}
