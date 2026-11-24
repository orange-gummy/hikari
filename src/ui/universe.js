'use strict';
/* =====================================================================
   UI ― ④ 新しい宇宙（UNIVERSE タブ「宇宙の系譜」）
   これまでの宇宙が小さな渦巻き銀河として下に積み上がり、いまの宇宙から4つの法則が光の筋として伸びる。
   筋は段の数だけ光の粒が連なり、まだの段は点線。過去の宇宙を押すと、その宇宙の記録を出す。
   ===================================================================== */
function roman(n){const R=[[1000,'M'],[900,'CM'],[500,'D'],[400,'CD'],[100,'C'],[90,'XC'],[50,'L'],[40,'XL'],[10,'X'],[9,'IX'],[5,'V'],[4,'IV'],[1,'I']];let s='';for(const [v,r] of R)while(n>=v){s+=r;n-=v;}return s;}
let uniSel='lc',uniPast=-1;
const GALAXY_SVG={};
/* 渦巻き銀河：2本の腕に光の点を散らす。宇宙ごとに形を変えず、一度作ったら使い回す */
function galaxySvg(k,r,a,tint){const key=k+'|'+r+'|'+a+'|'+tint;if(GALAXY_SVG[key])return GALAXY_SVG[key];
  let seed=11+k*7;const rnd=()=>{seed=(seed*16807)%2147483647;return seed/2147483647;};
  const T2=UNI_TINT[tint%UNI_TINT.length],ca=rgb(T2.a,1),cb=rgb(T2.b,1),tilt=k*0.9;
  let h='<circle r="'+(r*1.8).toFixed(1)+'" fill="url(#ugl'+(tint%UNI_TINT.length)+')" opacity="'+(0.55*a).toFixed(2)+'"/>';
  const n=Math.round(110*Math.min(1,r/20+0.3));
  for(let i=0;i<n;i++){const arm=i%2,f=rnd(),ang=arm*Math.PI+f*4.2+tilt,rr=f*r,jx=(rnd()-0.5)*r*0.18,jy=(rnd()-0.5)*r*0.18;
    h+='<circle cx="'+(Math.cos(ang)*rr+jx).toFixed(1)+'" cy="'+(Math.sin(ang)*rr*0.55+jy).toFixed(1)+'" r="'+(0.4+rnd()*0.7).toFixed(2)+'" fill="'+(rnd()<0.2?cb:ca)+'" opacity="'+((0.25+rnd()*0.6)*a*(1-f*0.5)).toFixed(2)+'"/>';}
  h+='<circle r="'+(r*0.35).toFixed(1)+'" fill="url(#ugc)" opacity="'+(0.8*a).toFixed(2)+'"/><circle r="1.2" fill="#fff" opacity="'+a+'"/>';
  return GALAXY_SVG[key]=h;}
function renderUniverse(){
  if(curTab==='laws'){renderLawTab();return;}
  const key='u|'+[S.uni,uniPast===S.uni?Math.floor((S.uTime||0)/60):0,S.U,S.shard,JSON.stringify(S.law),uniSel,uniPast,S.uTint,S.uKind,canFold(),uGain()].join('|');if(pbody.dataset.k===key)return;pbody.dataset.k=key;
  const W=360,H=330,cx=180,cy=168,n=S.uni+1,show=Math.min(n,6);
  // いまの宇宙と、下に沈んでいく過去の宇宙（多いときは新しい5つだけ）
  const ys=[];let y=cy;for(let age=0;age<show;age++){ys.push(y);y+=age===0?78:Math.max(24,52-age*8);}
  let v='<svg class="uniSky" viewBox="0 0 '+W+' '+H+'" role="group" aria-label="宇宙の系譜"><defs><radialGradient id="ugc"><stop offset="0" stop-color="#fffaf0"/><stop offset="1" stop-color="#fffaf0" stop-opacity="0"/></radialGradient>'+
    UNI_TINT.map((t,i)=>'<radialGradient id="ugl'+i+'"><stop offset="0" stop-color="'+rgb(t.a,0.45)+'"/><stop offset="1" stop-color="'+rgb(t.a,0)+'"/></radialGradient>').join('')+'</defs>';
  let path='';for(let yy=ys[show-1]+30;yy>=cy;yy-=3)path+=(path?'L':'M')+(cx+Math.sin(yy/23)*3).toFixed(1)+' '+yy;
  v+='<path d="'+path+'" fill="none" stroke="rgba(236,238,242,.18)" stroke-width=".6"/>';
  for(let age=show-1;age>=0;age--){const k=n-1-age,yy=ys[age],gx=cx+Math.sin(yy/23)*3,r=age===0?24:Math.max(6,15-age*2.5),a=age===0?1:Math.max(0.35,0.8-age*0.13);
    const tint=age===0?S.uTint:(S.uHist[k]?S.uHist[k].tint:k),sel=uniPast===k;
    v+='<g transform="translate('+gx.toFixed(1)+' '+yy+')"'+' data-up="'+k+'" style="cursor:pointer"><circle r="'+(r+10)+'" fill="transparent"/>'+galaxySvg(k,r,a,tint)+
      (sel?'<circle r="'+(r+6)+'" fill="none" stroke="'+rgb(UNI_TINT[tint%UNI_TINT.length].a,0.6)+'" stroke-width=".7"/>':'')+
      '<text x="'+(r+14)+'" y="4" font-size="'+(age===0?11:9.5)+'" fill="rgba(236,238,242,'+(age===0||sel?0.85:0.4)+')">宇宙 '+roman(k+1)+'</text></g>';}
  v+='</svg>';
  let d='';
  if(uniPast===S.uni){const K=S.uKind&&UNI_KIND.find(x=>x.id===S.uKind),lw=LAWS.filter(L=>law(L.id)).map(L=>L.name+' '+law(L.id)).join('・')||'まだ書き換えていない';   // いまの宇宙の記録
    d='<div class="row" style="padding:0"><span style="font-size:14px">宇宙 '+roman(S.uni+1)+'（いま）</span></div><div class="note" style="margin:4px 0 10px">いちばん遠く　'+(S.ubest?lyText(S.ubest)+' 光年':'—')+'<br>この宇宙にいる時間　'+durText(S.uTime||0)+'<br>いまの法則　'+lw+(K?'<br>時の流れ　'+K.name:'')+(canFold()?'<br>畳むと得る公理　'+uGain():'')+'</div><button class="act" id="uBack">戻る</button>';}
  else if(uniPast>=0&&S.uHist[uniPast]){const h=S.uHist[uniPast],lw=LAWS.filter(L=>h.law[L.id]).map(L=>L.name+' '+h.law[L.id]).join('・')||'まだ書き換えていない';
    d='<div class="row" style="padding:0"><span style="font-size:14px">宇宙 '+roman(uniPast+1)+'</span></div><div class="note" style="margin:4px 0 10px">いちばん遠く　'+lyText(h.far)+' 光年<br>得た法則　'+h.gain+'<br>この宇宙にいた時間　'+durText(h.time)+'<br>そのときの法則　'+lw+(h.kind?'<br>時の流れ　'+UNI_KIND.find(x=>x.id===h.kind).name:'')+'</div><button class="act" id="uBack">いまの宇宙に戻る</button>';}
  else{const K=S.uKind&&UNI_KIND.find(x=>x.id===S.uKind);
    if(K)d+='<div class="note" style="margin:0 0 10px">この宇宙の時の流れ　<span style="color:'+rgb(UNI_TINT[K.tint].a,1)+'">'+K.name+'</span>　'+K.p[0]+' '+K.p[1]+(K.p2?'・'+K.p2[0]+' '+K.p2[1]:'')+'・'+K.m[0]+' '+K.m[1]+'</div>';
}
  d+=canFold()?'<button class="act" id="uFold" style="margin-top:10px">宇宙を畳む　公理 +'+uGain()+'</button>':'<div class="note" style="margin-top:8px">宇宙の果てに着くと、宇宙を畳める。距離・航跡とその強化は戻り、見つけた色と装置・灯した星・記憶の強化・実績は残る。</div>';
  pbody.innerHTML='<div class="phead"><span class="lab">UNIVERSE '+roman(S.uni+1)+'</span><span class="num" style="font-size:12px;color:var(--ink-dim)">公理 '+fmt(S.U)+((S.shard||0)>0?'　かけら '+S.shard:'')+'</span></div>'+v+'<div class="gDet">'+d+'</div>';
  pbody.querySelectorAll('[data-up]').forEach(g=>g.onclick=()=>{uniPast=+g.dataset.up;renderUniverse();});
  const bk=document.getElementById('uBack');if(bk)bk.onclick=()=>{uniPast=-1;renderUniverse();};
  const ue=document.getElementById('uEnd');if(ue)ue.onclick=()=>showBeyondEnd();
  const fb=document.getElementById('uFold');if(fb)fb.onclick=()=>confirmBox('宇宙を畳む','公理を '+uGain()+' 得て、新しい宇宙で故郷から航海をやり直す。次の宇宙の時の流れを、候補から選ぶ。距離・航跡とその強化は戻る。見つけた色と装置・灯した星・記憶の強化・実績は残る。',()=>startFold());
}
// LAWS タブ（2026-11-24、MAP から分けた）：開いている式ごとに項の段と効き目。見るだけ
function renderLawTab(){const key='lw|'+[S.U,S.uni,JSON.stringify(S.law),JSON.stringify(S.beyond||{}),S.shard].join('|');if(pbody.dataset.k===key)return;pbody.dataset.k=key;
  let d=LAW_EQS.filter(e=>lawEqOpen(e.id)).map(e=>'<div class="note" style="margin:8px 0 2px;letter-spacing:.1em">'+e.name+'</div>'+LAWS.filter(X=>X.eq===e.id).map(X=>{const lx=law(X.id);return '<div class="row" style="padding:3px 0"><span style="font-size:13px"><span class="M" style="font-family:var(--log);display:inline-block;min-width:30px">'+lawSym(X,lx)+'</span>'+X.name+'　<span class="num" style="font-size:11px;color:var(--ink-dim)">'+lx+' / '+X.max+'</span></span><span class="num" style="font-size:12px">'+lawNow(X.id,lx)+'</span></div>';}).join('')).join('')+
      '<div class="note" style="margin:6px 0 8px;color:rgba(236,238,242,.4)">法則は、宇宙を畳んだときに書き換える。式の項をすべて書き換えると、その式を超えられる。</div>'+(beyondAll()?'<button class="act" id="uEnd">すべての法則を超えた場面を見る</button>':'');
  pbody.innerHTML='<div class="phead"><span class="lab">LAWS</span><span class="num" style="font-size:12px;color:var(--ink-dim)">公理 '+fmt(S.U)+'</span></div>'+d;
  const ue=document.getElementById('uEnd');if(ue)ue.onclick=()=>showBeyondEnd();}
function lawNow(id,l){const X=LAWS.find(x=>x.id===id);return l?X.fx(l).map(f=>f[1]).join('・'):'—';}
function durText(sec){const h=sec/3600;return h>=24?(h/24).toFixed(1)+'日':h>=1?h.toFixed(1)+'時間':Math.max(1,Math.round(sec/60))+'分';}
/* ④ 次の宇宙の時の流れを選ぶ（2026-11-18）：宇宙を畳んだあと、候補（S.uOffer）から1つ選ぶまで開く。開いている間はゲームの時間を止める。
   畳んだ一点から候補の宇宙へ線が伸び、選んだ宇宙は大きく明るく。速い＝尾を引く星・重い＝細かく巻いて中心が沈む・澄んだ＝少ない星が十字に光る・静か＝ゆっくり漂う淡い星 */
let pickOpen=false,pickSel=0,pickRAF=0;
function openPick(){if(pickOpen||!S.uOffer)return;pickOpen=true;pickSel=0;const ov=document.getElementById('pickOv');ov.classList.add('on');renderPick();
  const t0=performance.now();const run=now=>{if(!pickOpen)return;pickPaint((now-t0)/1000);pickRAF=requestAnimationFrame(run);};pickRAF=requestAnimationFrame(run);}
function closePick(){pickOpen=false;cancelAnimationFrame(pickRAF);document.getElementById('pickOv').classList.remove('on');}
function pickKinds(){return (S.uOffer||[]).map(id=>UNI_KIND.find(x=>x.id===id));}
function renderPick(){const b=document.getElementById('pickBody'),K=pickKinds(),k=K[pickSel];if(!k)return;
  b.innerHTML='<canvas id="pickCv"></canvas><div class="pTop"><div class="gLab">NEXT UNIVERSE</div><div class="pT">次の宇宙の、時の流れを選ぶ</div><div class="pS">宇宙 '+roman(S.uni+1)+'　選べるのは、この'+K.length+'つ</div></div>'+
    '<div class="pNames">'+K.map((x,i)=>'<button data-pk="'+i+'" class="'+(i===pickSel?'on':'')+'">'+x.name+'</button>').join('')+'</div>'+
    '<div class="pDet"><div class="pN">'+k.name+'</div><div class="pL">'+k.line+'</div><div class="pFx"><div class="r"><span>'+k.p[0]+'</span><span class="p">'+k.p[1]+'</span></div>'+(k.p2?'<div class="r"><span>'+k.p2[0]+'</span><span class="p">'+k.p2[1]+'</span></div>':'')+'<div class="r m"><span>'+k.m[0]+'</span><span>'+k.m[1]+'</span></div><div class="r m"><span>この宇宙を畳むまで続く</span><span></span></div></div></div>'+
    ((S.shard||0)>0?'<button class="pRe" id="pickRe"'+(S.shard<uRerollCost()?' disabled':'')+'>候補を引き直す　かけら '+uRerollCost()+'<i>（持っている '+S.shard+'）</i></button>':'')+
    '<button class="pGo" id="pickGo">この宇宙を始める</button>';
  b.querySelectorAll('[data-pk]').forEach(x=>x.onclick=()=>{pickSel=+x.dataset.pk;SND.play('tab');renderPick();});
  const re=document.getElementById('pickRe');if(re)re.onclick=()=>{if(uReroll()){SND.play('light');pickSel=0;save();renderPick();}};
  document.getElementById('pickGo').onclick=()=>{if(chooseKind(k.id)){SND.play('light');fla=Math.max(fla,0.14);closePick();applyLoadedVisuals();S.flags.lawPend=1;save();pbody.dataset.k='';renderPanel(true);if(S.flags.lawPend)openLaws();}};
  const cv=document.getElementById('pickCv');cv.onclick=e=>{const r=cv.getBoundingClientRect(),x=e.clientX-r.left,i=Math.max(0,Math.min(K.length-1,Math.floor(x/(r.width/K.length))));if(e.clientY-r.top>r.height*0.3&&e.clientY-r.top<r.height*0.62&&i!==pickSel){pickSel=i;SND.play('tab');renderPick();}};
  pickPaint(0);}
function pickRnd(s){return()=>{s=(s*16807)%2147483647;return s/2147483647;};}
function pickGal(g,x,y,R,k,on,t){const kind=k.id,c=UNI_TINT[k.tint].a,[cr,cg,cb]=c,a=on?1:0.45,r=pickRnd(kind.length*7+3);
  const cR=kind==='bright'?R*0.8:R*0.5,gr=g.createRadialGradient(x,y,0,x,y,cR);gr.addColorStop(0,'rgba('+cr+','+cg+','+cb+','+0.55*a+')');gr.addColorStop(1,'rgba(0,0,0,0)');g.fillStyle=gr;g.beginPath();g.arc(x,y,cR,0,7);g.fill();
  const N=kind==='far'?200:kind==='bright'?220:kind==='clear'?110:kind==='heavy'?380:kind==='calm'?160:240,spin=t*(kind==='fast'?0.35:kind==='calm'?0.04:0.1);
  for(let i=0;i<N;i++){const arm=i%2,u=r(),d=(kind==='heavy'?0.12+u*0.75:kind==='far'?0.12+u*1.25:0.1+u*0.9)*R,tw=kind==='far'?1.5:kind==='heavy'?5.2:kind==='fast'?3.2:kind==='calm'?2:2.6;
    const ang=arm*Math.PI+u*tw+(r()-.5)*(kind==='clear'?0.25:kind==='calm'?0.9:0.5)+spin,px=x+Math.cos(ang)*d,py=y+Math.sin(ang)*d*0.62;
    const s=kind==='clear'?(r()<.15?1.6:0.9):(r()<.05?1.3:0.7),al=(0.25+0.75*(1-u))*a*(kind==='calm'?0.75+0.25*Math.sin(t*0.8+i):1);
    if(kind==='fast'){g.strokeStyle='rgba('+cr+','+cg+','+cb+','+al*0.5+')';g.lineWidth=0.6;g.beginPath();const a2=ang-0.25*(1-u*0.5);g.moveTo(px,py);g.lineTo(x+Math.cos(a2)*d,y+Math.sin(a2)*d*0.62);g.stroke();}
    g.fillStyle='rgba('+Math.min(255,cr+30)+','+Math.min(255,cg+30)+','+Math.min(255,cb+30)+','+al+')';g.beginPath();g.arc(px,py,s,0,7);g.fill();
    if(kind==='clear'&&s>1.2){g.strokeStyle='rgba('+cr+','+cg+','+cb+','+al*0.5+')';g.lineWidth=0.5;g.beginPath();g.moveTo(px-4,py);g.lineTo(px+4,py);g.moveTo(px,py-4);g.lineTo(px,py+4);g.stroke();}}
  if(kind==='heavy'){g.strokeStyle='rgba('+cr+','+cg+','+cb+','+0.5*a+')';g.lineWidth=0.8;g.beginPath();g.ellipse(x,y,R*0.16,R*0.1,0,0,7);g.stroke();g.fillStyle='rgba(4,5,12,.9)';g.beginPath();g.ellipse(x,y,R*0.1,R*0.06,0,0,7);g.fill();}
  else{g.fillStyle='rgba(255,250,240,'+a+')';g.beginPath();g.arc(x,y,kind==='clear'?1.6:2.2,0,7);g.fill();}
  if(on){g.strokeStyle='rgba(255,240,215,.35)';g.lineWidth=0.6;g.setLineDash([2,4]);g.lineDashOffset=-t*3;g.beginPath();g.ellipse(x,y,R*1.12,R*0.74,0,0,7);g.stroke();g.setLineDash([]);}}
function pickPaint(t){const cv=document.getElementById('pickCv');if(!cv)return;const W=cv.clientWidth,H=cv.clientHeight,dpr=Math.min(2,devicePixelRatio||1);
  if(cv.width!==Math.round(W*dpr)){cv.width=Math.round(W*dpr);cv.height=Math.round(H*dpr);}const g=cv.getContext('2d');g.setTransform(dpr,0,0,dpr,0,0);g.clearRect(0,0,W,H);
  const r=pickRnd(99);for(let i=0;i<240;i++){const b=r(),x=r()*W,y=r()*H;g.fillStyle='rgba(255,255,255,'+((0.08+b*0.4)*(0.75+0.25*Math.sin(t*1.3+i))).toFixed(3)+')';g.beginPath();g.arc(x,y,b<.95?0.5:1,0,7);g.fill();}
  const K=pickKinds(),n=K.length,sc=Math.min(1.25,W/390),ox=W/2,oy=H*0.235,gy=H*0.45,R0=Math.min(42,W/(n*3.2));
  g.fillStyle='#fff';g.beginPath();g.arc(ox,oy,2,0,7);g.fill();
  K.forEach((k,i)=>{const on=i===pickSel,gx=W*(i+0.5)/n,yy=gy+(on?14*sc:0);g.strokeStyle='rgba(255,240,215,'+(on?0.45:0.14)+')';g.lineWidth=0.7;g.setLineDash(on?[]:[2,5]);g.beginPath();g.moveTo(ox,oy);g.quadraticCurveTo((ox+gx)/2,oy+60*sc,gx,yy-R0*1.1);g.stroke();g.setLineDash([]);});
  K.forEach((k,i)=>{const on=i===pickSel;pickGal(g,W*(i+0.5)/n,gy+(on?14*sc:0),(on?R0*1.25:R0),k,on,t+i*1.3);});}
addEventListener('resize',()=>{if(pickOpen)renderPick();});

/* ④ 法則の書き換え（2026-11-24、式の試作 B）：宇宙を畳んで次の時の流れを選んだあと、暗闇のまま開く（MAP タブは見るだけ）。
   上に開いている式の一覧、真ん中に選んだ式を光の文字で小さく、その下に書き換えられる項が大きな光の円として浮かぶ（項の色、段の数だけ周りに粒、式の項と細い線でつながる）。
   円を押して選び「書き換える」（公理を使う）・「戻す」（公理を返す、ここでだけ）。書き換えると項の文字が光の粒にほどけて組み直される。「船を出す」で閉じる */
let lawOpen=false,lawEq='sr',lawSel='lc',lawFX=null,lawMsg='';
function openLaws(){lawOpen=true;if(!lawEqOpen(lawEq))lawEq='sr';{const rd=LAW_EQS.find(e=>lawEqOpen(e.id)&&!(S.beyond&&S.beyond[e.id])&&LAWS.filter(x=>x.eq===e.id).every(x=>law(x.id)>=x.max));if(rd){lawEq=rd.id;lawSel='wall';}}   // 超えられる式があれば、その壁を選んで開く
const ov=document.getElementById('lawOv');ov.classList.add('on','lIntro');renderLaws();setTimeout(()=>ov.classList.remove('lIntro'),2600);}
function closeLaws(){lawOpen=false;delete S.flags.lawPend;document.getElementById('lawOv').classList.remove('on');save();pbody.dataset.k='';renderPanel(true);paintSpeed();if(S.flags.beyondEnd&&!S.flags.beyondSeen)setTimeout(showBeyondEnd,1800);}
// 式を描いて、項の場所（円から線を引く先）を返す
function lawEqSvg(eq,cx,y,sel){const bd=!!(S.beyond&&S.beyond[eq]),br=!bd&&LAWS.filter(x=>x.eq===eq).every(x=>law(x.id)>=x.max),SG=(ch,x,yy,sz)=>{A.wall=[x,yy-sz*0.35];return (br?'<circle cx="'+x+'" cy="'+(yy-sz*0.35)+'" r="'+sz+'" fill="url(#lhl)" class="lWallG"/>':'')+'<text x="'+x+'" y="'+yy+'" font-family="Shippori Mincho B1,serif" font-size="'+sz+'" text-anchor="middle" fill="'+(br||bd||sel==='wall'?'#fff1dc':'rgba(236,238,242,.85)')+'"'+(lawFX==='wall'?' class="lNew"':'')+'>'+ch+'</text>';};const M='font-family="Shippori Mincho B1,serif" fill="rgba(236,238,242,.85)"',A={},t=(id,x,yy,sz)=>{const L=LAWS.find(z=>z.id===id),on=sel===id;A[id]=[x,yy-sz*0.35];if(id==='L'&&(bd||br)){const w=SG(bd?'∞':'Λ',x,yy,sz);A.L=A.wall;return w;}
    return '<text x="'+x+'" y="'+yy+'" font-family="Shippori Mincho B1,serif" font-size="'+sz+'" text-anchor="middle" fill="'+(on?'#fff1dc':'rgba(236,238,242,.9)')+'"'+(lawFX===id?' class="lNew"':'')+'>'+lawSym(L,law(id))+'</text><line x1="'+(x-sz*0.4)+'" y1="'+(yy+sz*0.22)+'" x2="'+(x+sz*0.4)+'" y2="'+(yy+sz*0.22)+'" stroke="'+rgb(L.col,on?0.9:0.4)+'" stroke-width=".8" stroke-dasharray="1.5 3"/>';};
  let v='';
  if(eq==='sr')v='<text x="'+(cx-74)+'" y="'+y+'" '+M+' font-size="22" text-anchor="middle">γ</text><text x="'+(cx-54)+'" y="'+(y-1)+'" '+M+' font-size="17" text-anchor="middle">=</text><text x="'+(cx+12)+'" y="'+(y-28)+'" '+M+' font-size="17" text-anchor="middle">1</text><line x1="'+(cx-37)+'" y1="'+(y-15)+'" x2="'+(cx+72)+'" y2="'+(y-15)+'" stroke="rgba(236,238,242,.6)" stroke-width=".8"/><text x="'+(cx-34)+'" y="'+(y+18)+'" '+M+' font-size="17" text-anchor="middle">(1</text>'+SG(bd?'+':'−',cx-19,y+18,17)+'<text x="'+(cx+9)+'" y="'+(y+9)+'" '+M+' font-size="14" text-anchor="middle">v²</text><line x1="'+(cx-1)+'" y1="'+(y+14)+'" x2="'+(cx+20)+'" y2="'+(y+14)+'" stroke="rgba(236,238,242,.5)" stroke-width=".7"/>'+t('lc',cx+7,y+32,15)+'<text x="'+(cx+15)+'" y="'+(y+26)+'" '+M+' font-size="9">2</text><text x="'+(cx+32)+'" y="'+(y+18)+'" '+M+' font-size="17" text-anchor="middle">)</text>'+t('td',cx+54,y+2,12);
  else if(eq==='ex')v='<text x="'+(cx-86)+'" y="'+y+'" '+M+' font-size="21" text-anchor="middle">H²</text><text x="'+(cx-64)+'" y="'+(y-1)+'" '+M+' font-size="17" text-anchor="middle">=</text><text x="'+(cx-36)+'" y="'+(y-10)+'" '+M+' font-size="13" text-anchor="middle">8πG</text><line x1="'+(cx-50)+'" y1="'+(y-5)+'" x2="'+(cx-22)+'" y2="'+(y-5)+'" stroke="rgba(236,238,242,.5)" stroke-width=".7"/><text x="'+(cx-36)+'" y="'+(y+10)+'" '+M+' font-size="13" text-anchor="middle">3</text>'+t('rho',cx-6,y+2,21)+'<text x="'+(cx+18)+'" y="'+(y-1)+'" '+M+' font-size="17" text-anchor="middle">+</text>'+t('L',cx+44,y-8,18)+'<line x1="'+(cx+32)+'" y1="'+(y-3)+'" x2="'+(cx+56)+'" y2="'+(y-3)+'" stroke="rgba(236,238,242,.5)" stroke-width=".7"/><text x="'+(cx+44)+'" y="'+(y+13)+'" '+M+' font-size="13" text-anchor="middle">3</text>';
  else if(eq==='th')v=t('S',cx-48,y+2,22)+SG(bd?'≤':'≥',cx-14,y-1,18)+'<text x="'+(cx+26)+'" y="'+(y-10)+'" '+M+' font-size="15" text-anchor="middle">Q</text><line x1="'+(cx+12)+'" y1="'+(y-4)+'" x2="'+(cx+40)+'" y2="'+(y-4)+'" stroke="rgba(236,238,242,.5)" stroke-width=".7"/>'+t('T',cx+26,y+14,15);
  else v=t('dx',cx-62,y+2,20)+'<text x="'+(cx-38)+'" y="'+(y-1)+'" '+M+' font-size="16" text-anchor="middle">·</text><text x="'+(cx-16)+'" y="'+(y+2)+'" '+M+' font-size="20" text-anchor="middle">Δp</text>'+SG(bd?'=':'≥',cx+12,y-1,18)+t('hb',cx+42,y-8,17)+'<line x1="'+(cx+30)+'" y1="'+(y-2)+'" x2="'+(cx+54)+'" y2="'+(y-2)+'" stroke="rgba(236,238,242,.5)" stroke-width=".7"/><text x="'+(cx+42)+'" y="'+(y+14)+'" '+M+' font-size="13" text-anchor="middle">2</text>';
  return {v,A};}
function renderLaws(){const ov=document.getElementById('lawOv'),b=document.getElementById('lawBody'),W=ov.clientWidth||innerWidth,H=ov.clientHeight||vpH(),f=n=>n.toFixed(1),h=S.uHist[S.uHist.length-1];
  if(!lawEqOpen(lawEq))lawEq='sr';const terms=LAWS.filter(x=>x.eq===lawEq),BY=BEYOND[lawEq],bDone=!!(S.beyond&&S.beyond[lawEq]),bReady=!bDone&&terms.every(x=>law(x.id)>=x.max),wall=bReady||bDone;if(!terms.some(x=>x.id===lawSel)&&!(wall&&lawSel==='wall'))lawSel=bReady?'wall':terms[0].id;
  const topY=Math.round(Math.max(250,H*0.33)),ny=Math.round((topY+60+H-260)/2),E=lawEqSvg(lawEq,W/2,topY,lawSel),R=wall?Math.max(30,Math.min(40,W*0.09)):Math.max(34,Math.min(46,W*0.11)),SP=wall?Math.min(128,W*0.31):Math.min(160,W*0.42),slotX=i=>W/2+(i-(wall?1:(terms.length-1)/2))*SP;
  let v='<svg class="lSky" width="'+W+'" height="'+H+'" viewBox="0 0 '+W+' '+H+'"><defs><radialGradient id="lhl"><stop offset="0" stop-color="rgba(255,236,210,.2)"/><stop offset="1" stop-color="rgba(255,236,210,0)"/></radialGradient></defs>';
  {let sd=3;const r=()=>{sd=(sd*16807)%2147483647;return sd/2147483647;};for(let i=0;i<Math.round(W*H/1400);i++){const tw=r()<0.3;v+='<circle'+(tw?' class="gTw" style="animation-delay:-'+(r()*5).toFixed(1)+'s"':'')+' cx="'+f(r()*W)+'" cy="'+f(r()*H)+'" r="'+(0.3+r()*0.7).toFixed(2)+'" fill="#eceef2" opacity="'+(0.1+r()*0.4).toFixed(2)+'"/>';}}
  v+='<g class="lEq">'+E.v+'</g>';
  terms.forEach((L,i)=>{const x=slotX(wall?i*2:i),y=ny,l=law(L.id),on=lawSel===L.id,c=L.col,[ax,ay]=E.A[L.id]||[W/2,topY],n=lawNext(L.id);
    v+='<g class="lNode ln'+(i+1)+'" data-lw="'+L.id+'" style="cursor:pointer"><line x1="'+f(ax)+'" y1="'+f(ay+10)+'" x2="'+f(x)+'" y2="'+f(y-R-6)+'" stroke="'+rgb(c,on?0.45:0.18)+'" stroke-width=".7"'+(on?'':' stroke-dasharray="2 4"')+'/>'+
      '<circle cx="'+f(x)+'" cy="'+y+'" r="'+(R+14)+'" fill="transparent"/><circle cx="'+f(x)+'" cy="'+y+'" r="'+R+'" fill="'+rgb(c,on?0.08:0.03)+'" stroke="'+rgb(c,on?0.6:0.25)+'" stroke-width=".8"/>';
    if(on)v+='<circle cx="'+f(x)+'" cy="'+y+'" r="'+(R*1.6)+'" fill="url(#lhl)"/>';
    for(let k=0;k<L.max;k++){const a=-Math.PI/2+k*2*Math.PI/L.max,lit=k<l;v+='<circle cx="'+f(x+Math.cos(a)*(R+9))+'" cy="'+f(y+Math.sin(a)*(R+9))+'" r="'+(lit?1.8:1)+'" fill="'+rgb(c,lit?0.95:0.22)+'"'+(!lit&&k===l&&n&&S.U>=n.cost?' class="gTip"':'')+'/>';}
    v+='<text x="'+f(x)+'" y="'+(y+R*0.24)+'" font-family="Shippori Mincho B1,serif" font-size="'+Math.round(R*0.72)+'" text-anchor="middle" fill="'+(on?'#fff1dc':'rgba(236,238,242,.8)')+'"'+(lawFX===L.id?' class="lNew"':'')+'>'+lawSym(L,l)+'</text>'+
      '<text x="'+f(x)+'" y="'+(y+R+30)+'" font-size="11" text-anchor="middle" fill="rgba(236,238,242,'+(on?0.88:0.45)+')">'+L.name+'　'+l+'</text></g>';
    if(lawFX===L.id){for(let k=0;k<22;k++){const q=Math.random()*6.283,dd=R*(0.5+Math.random());v+='<circle cx="'+f(x)+'" cy="'+f(y-R*0.1)+'" r="'+(0.7+Math.random())+'" fill="'+rgb(c,1)+'" opacity="0"><animate attributeName="cx" by="'+f(Math.cos(q)*dd)+'" dur="1s" fill="freeze"/><animate attributeName="cy" by="'+f(Math.sin(q)*dd)+'" dur="1s" fill="freeze"/><animate attributeName="opacity" values="0;1;0" dur="1s" fill="freeze"/></circle>';}}});
  if(wall){const x=slotX(1),y=ny,on=lawSel==='wall',[ax,ay]=E.A.wall||[W/2,topY],c=[255,236,210];
    v+='<g class="lNode lWall'+(bReady?' lWallR':'')+'" data-lw="wall" style="cursor:pointer"><line x1="'+f(ax)+'" y1="'+f(ay+10)+'" x2="'+f(x)+'" y2="'+f(y-R-6)+'" stroke="'+rgb(c,on?0.6:0.3)+'" stroke-width=".8"/><circle cx="'+f(x)+'" cy="'+y+'" r="'+(R+14)+'" fill="transparent"/>'+
      '<circle cx="'+f(x)+'" cy="'+y+'" r="'+(R*1.9)+'" fill="url(#lhl)"/><circle class="lWallC" cx="'+f(x)+'" cy="'+y+'" r="'+(R+2)+'" fill="'+rgb(c,bDone?0.1:0.06)+'" stroke="'+rgb(c,on?0.85:0.55)+'" stroke-width="1"/>'+
      '<text x="'+f(x)+'" y="'+(y+R*0.28)+'" font-family="Shippori Mincho B1,serif" font-size="'+Math.round(R*0.9)+'" text-anchor="middle" fill="#fff1dc"'+(lawFX==='wall'?' class="lNew"':'')+'>'+(bDone?BY.to:BY.from)+'</text>'+
      '<text x="'+f(x)+'" y="'+(y+R+32)+'" font-size="11" text-anchor="middle" fill="rgba(255,236,210,'+(on?0.95:0.7)+')">'+BY.wall+'</text></g>';
    if(lawFX==='wall'){for(let k=0;k<40;k++){const q=Math.random()*6.283,dd=R*(0.6+Math.random()*1.4);v+='<circle cx="'+f(x)+'" cy="'+f(y-R*0.1)+'" r="'+(0.8+Math.random())+'" fill="#fff1dc" opacity="0"><animate attributeName="cx" by="'+f(Math.cos(q)*dd)+'" dur="1.2s" fill="freeze"/><animate attributeName="cy" by="'+f(Math.sin(q)*dd)+'" dur="1.2s" fill="freeze"/><animate attributeName="opacity" values="0;1;0" dur="1.2s" fill="freeze"/></circle>';}
      v+='<rect width="'+W+'" height="'+H+'" fill="#fff8ee" opacity="0"><animate attributeName="opacity" values="0;.18;0" dur="1.6s" fill="freeze"/></rect>';}}
  v+='</svg>';
  const isW=lawSel==='wall'&&wall,L=isW?null:LAWS.find(x=>x.id===lawSel),l=isW?0:law(L.id),n=isW?null:lawNext(L.id),now=isW?[]:L.fx(l),nx=n?L.fx(l+1):null,msg=lawMsg;lawFX=null;lawMsg='';
  b.innerHTML=v+'<div class="lTop"><div class="gLab">LAWS</div><div class="lCnt">公理<b>'+fmt(S.U)+'</b></div>'+(h?'<div class="lRes">宇宙 '+roman(S.uni)+' を畳んだ　・　<i>公理 +'+h.gain+'</i></div>':'')+'</div>'+
    '<div class="lTabs">'+LAW_EQS.map(e=>{const o=lawEqOpen(e.id),dn=S.beyond&&S.beyond[e.id];return '<button data-le="'+e.id+'" class="'+(e.id===lawEq?'on':'')+'"'+(o?'':' disabled')+'>'+e.name+(dn?'<i class="lBy"></i>':'')+(o?'':'<small>宇宙 '+roman(e.open+1)+' で開く</small>')+'</button>';}).join('')+'</div>'+(msg?'<div class="lMsg" style="top:'+(ny+R+52)+'px">'+msg+'</div>':'')+
    (isW?'<div class="lBot"><div class="lNm"><span>'+BY.wall+'</span><i>'+(bDone?'超えた':'')+'</i></div><div class="lWhat2">'+(bDone?BY.name+'を、超えた。<br>'+BY.fx+'。宇宙を畳んでも、これは戻らない。':BY.name+'の項は、すべて書き換えた。<br>超えると、'+BY.fx+'（宇宙を畳んでも残る）。')+'</div>'+(bDone?'':'<button class="lBuy" id="lawBy"'+(S.U>=BY.cost?'':' disabled')+'>超える　公理 '+BY.cost+'</button>')+'<button class="lGo" id="lawGo">船を出す</button></div>':
    '<div class="lBot"><div class="lNm"><span>'+L.name+'</span><i>'+l+' / '+L.max+'</i></div><div class="lFx">'+now.map((q,i)=>'<div class="'+(q[2]>0?'up':'dn')+'"><span class="k">'+(q[2]>0?'＋':'−')+' '+q[0]+'</span><span class="v">'+(l?q[1]:'—')+(nx?'<span>→</span><b>'+nx[i][1]+'</b>':'')+'</span></div>').join('')+'</div>'+
    '<div class="lStep"><button id="lawDn"'+(l?'':' disabled')+'>戻す</button><span>'+(n?'公理 '+n.cost:'書き換えきった')+'</span><button id="lawBuy"'+(n&&S.U>=n.cost?'':' disabled')+'>書き換える</button></div><button class="lGo" id="lawGo">船を出す</button></div>');
  b.querySelectorAll('[data-lw]').forEach(g=>g.addEventListener('click',()=>{lawSel=g.dataset.lw;SND.play('tab');ov.classList.remove('lIntro');renderLaws();}));
  b.querySelectorAll('[data-le]').forEach(x=>x.onclick=()=>{lawEq=x.dataset.le;lawSel=LAWS.find(z=>z.eq===lawEq).id;SND.play('tab');ov.classList.remove('lIntro');renderLaws();});
  const by=document.getElementById('lawBy');if(by)by.onclick=()=>{if(goBeyond(lawEq)){SND.play('milestone');fla=Math.max(fla,0.2);lawFX='wall';lawMsg=BY.name+'を、超えた。';logLine(lawMsg,-1,true);if(beyondAll())S.flags.beyondEnd=1;save();ov.classList.remove('lIntro');renderLaws();}};
  const bb=document.getElementById('lawBuy');if(bb)bb.onclick=()=>{if(buyLaw(lawSel)){SND.play('light');lawFX=lawSel;ov.classList.remove('lIntro');renderLaws();}};
  const dn=document.getElementById('lawDn');if(dn)dn.onclick=()=>{if(unbuyLaw(lawSel)){SND.play('tab');lawFX=lawSel;ov.classList.remove('lIntro');renderLaws();}};
  document.getElementById('lawGo').onclick=()=>{SND.play('resail');closeLaws();};}
addEventListener('resize',()=>{if(lawOpen)renderLaws();});

/* ④の終わり（2026-11-24）：4つの法則を超えると、書き換わった4つの式が窓の四方から光の線になって一点に集まり、「すべての法則を、超えた。」→ 旅の記録 */
let endOpen=false;
function showBeyondEnd(){if(endOpen)return;endOpen=true;S.flags.beyondSeen=1;save();let el=document.getElementById('endOv');if(!el){el=document.createElement('div');el.id='endOv';el.setAttribute('role','dialog');el.setAttribute('aria-label','すべての法則を超えた');document.body.appendChild(el);}
  const W=innerWidth,H=vpH(),cx=W/2,cy=H*0.46,f=n=>n.toFixed(1),E=[['γ = 1/√(1 + v²/c²)',cx,H*0.2,[235,238,250]],['H² = (8πG/3)ρ + ∞',cx,H*0.72,[255,214,170]],['ΔS ≤ Q/T',W*0.2,cy,[255,190,170]],['Δx·Δp = 0',W*0.8,cy,[200,180,255]]];
  let v='<svg width="'+W+'" height="'+H+'" viewBox="0 0 '+W+' '+H+'"><defs><radialGradient id="egc"><stop offset="0" stop-color="#fff"/><stop offset="1" stop-color="rgba(255,255,255,0)"/></radialGradient></defs>';
  E.forEach(([t,x,y,c],i)=>{const d=(0.6+i*0.5)+'s';v+='<text x="'+f(x)+'" y="'+f(y)+'" font-family="Shippori Mincho B1,serif" font-size="'+Math.round(Math.min(17,W*0.042))+'" text-anchor="middle" fill="rgb('+c.join(',')+')" opacity="0"><animate attributeName="opacity" values="0;1;1;0" keyTimes="0;.2;.6;1" dur="5s" begin="'+d+'" fill="freeze"/>'+t+'</text>'+
    '<line x1="'+f(x)+'" y1="'+f(y)+'" x2="'+f(x)+'" y2="'+f(y)+'" stroke="rgb('+c.join(',')+')" stroke-width="1" opacity="0"><animate attributeName="x2" to="'+f(cx)+'" begin="4s" dur="1.4s" fill="freeze" calcMode="spline" keySplines=".4 0 .2 1"/><animate attributeName="y2" to="'+f(cy)+'" begin="4s" dur="1.4s" fill="freeze" calcMode="spline" keySplines=".4 0 .2 1"/><animate attributeName="opacity" values="0;.9;0" keyTimes="0;.5;1" begin="4s" dur="2.4s" fill="freeze"/></line>';});
  v+='<circle cx="'+f(cx)+'" cy="'+f(cy)+'" r="'+Math.min(60,W*0.14)+'" fill="url(#egc)" opacity="0"><animate attributeName="opacity" values="0;.9;.5" keyTimes="0;.3;1" begin="5.3s" dur="2.5s" fill="freeze"/></circle><circle cx="'+f(cx)+'" cy="'+f(cy)+'" r="2.6" fill="#fff" opacity="0"><animate attributeName="opacity" to="1" begin="5.3s" dur=".6s" fill="freeze"/></circle></svg>';
  el.innerHTML=v+'<div class="eLine">すべての法則を、超えた。</div><div class="eTap">タップで続ける</div>';el.classList.add('on');SND.play('lightEnd');
  setTimeout(()=>{el.classList.add('t1');el.onclick=()=>{el.onclick=null;el.classList.add('out');setTimeout(()=>{el.classList.remove('on','t1','out');showRecord(()=>{endOpen=false;});},900);};},7200);}
