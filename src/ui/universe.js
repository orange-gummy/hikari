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
  // 法則の筋
  const A=[-2.4,-1.57,-0.74],r0=34,len=92;
  LAWS.forEach((L,i)=>{const a=A[i],l=law(L.id),m=L.max,step=len/m,on=uniPast<0&&uniSel===L.id,al=on?1:0.55,c=L.col,P=k=>[cx+Math.cos(a)*(r0+k*step),cy+Math.sin(a)*(r0+k*step)];
    const [sx,sy]=P(0),[ex,ey]=P(m),cs=Math.cos(a),anc=cs<-0.3?'end':cs>0.3?'start':'middle',tx=cx+Math.cos(a)*(r0+len+15),ty=cy+Math.sin(a)*(r0+len+15);
    v+='<g data-law="'+L.id+'" style="cursor:pointer"><line x1="'+sx.toFixed(1)+'" y1="'+sy.toFixed(1)+'" x2="'+ex.toFixed(1)+'" y2="'+ey.toFixed(1)+'" stroke="transparent" stroke-width="16"/>'+
      '<line x1="'+sx.toFixed(1)+'" y1="'+sy.toFixed(1)+'" x2="'+ex.toFixed(1)+'" y2="'+ey.toFixed(1)+'" stroke="'+rgb(c,on?0.3:0.14)+'" stroke-width=".6" stroke-dasharray="1.2 3.5"/>';
    if(l>0){const [lx,ly]=P(l);v+='<line x1="'+sx.toFixed(1)+'" y1="'+sy.toFixed(1)+'" x2="'+lx.toFixed(1)+'" y2="'+ly.toFixed(1)+'" stroke="'+rgb(c,0.7*al)+'" stroke-width="'+(on?1.1:0.8)+'"/>';
      for(let k=1;k<=l;k++){const [px,py]=P(k);if(k===l)v+='<circle cx="'+px.toFixed(1)+'" cy="'+py.toFixed(1)+'" r="'+(on?9:6)+'" fill="'+rgb(c,0.22*al)+'"/>';v+='<circle cx="'+px.toFixed(1)+'" cy="'+py.toFixed(1)+'" r="'+(k===l?2:1.1)+'" fill="'+rgb(c,al)+'"/>';}}
    if(on){const [qx,qy]=P(Math.max(l,0));v+='<circle cx="'+qx.toFixed(1)+'" cy="'+qy.toFixed(1)+'" r="7" fill="none" stroke="'+rgb(c,0.5)+'" stroke-width=".6"/>';}
    v+='<text x="'+tx.toFixed(1)+'" y="'+(ty+3).toFixed(1)+'" text-anchor="'+anc+'" font-size="10" fill="rgba(236,238,242,'+(on?0.9:0.5)+')">'+L.name+'</text>'+
      '<text x="'+tx.toFixed(1)+'" y="'+(ty+15).toFixed(1)+'" text-anchor="'+anc+'" font-size="9" class="num" fill="rgba(236,238,242,'+(on?0.6:0.3)+')">'+l+'/'+m+'</text></g>';});
  v+='</svg>';
  let d='';
  if(uniPast===S.uni){const K=S.uKind&&UNI_KIND.find(x=>x.id===S.uKind),lw=LAWS.filter(L=>law(L.id)).map(L=>L.name+' '+law(L.id)).join('・')||'まだ書き換えていない';   // いまの宇宙の記録
    d='<div class="row" style="padding:0"><span style="font-size:14px">宇宙 '+roman(S.uni+1)+'（いま）</span></div><div class="note" style="margin:4px 0 10px">いちばん遠く　'+(S.ubest?lyText(S.ubest)+' 光年':'—')+'<br>この宇宙にいる時間　'+durText(S.uTime||0)+'<br>いまの法則　'+lw+(K?'<br>時の流れ　'+K.name:'')+(canFold()?'<br>畳むと得る法則　'+uGain():'')+'</div><button class="act" id="uBack">法則に戻る</button>';}
  else if(uniPast>=0&&S.uHist[uniPast]){const h=S.uHist[uniPast],lw=LAWS.filter(L=>h.law[L.id]).map(L=>L.name+' '+h.law[L.id]).join('・')||'まだ書き換えていない';
    d='<div class="row" style="padding:0"><span style="font-size:14px">宇宙 '+roman(uniPast+1)+'</span></div><div class="note" style="margin:4px 0 10px">いちばん遠く　'+lyText(h.far)+' 光年<br>得た法則　'+h.gain+'<br>この宇宙にいた時間　'+durText(h.time)+'<br>そのときの法則　'+lw+(h.kind?'<br>時の流れ　'+UNI_KIND.find(x=>x.id===h.kind).name:'')+'</div><button class="act" id="uBack">いまの宇宙に戻る</button>';}
  else{const L=LAWS.find(x=>x.id===uniSel)||LAWS[0],l=law(L.id),nx=lawNext(L.id),K=S.uKind&&UNI_KIND.find(x=>x.id===S.uKind);
    if(K)d+='<div class="note" style="margin:0 0 10px">この宇宙の時の流れ　<span style="color:'+rgb(UNI_TINT[K.tint].a,1)+'">'+K.name+'</span>　'+K.p[0]+' '+K.p[1]+(K.p2?'・'+K.p2[0]+' '+K.p2[1]:'')+'・'+K.m[0]+' '+K.m[1]+'</div>';
    d+='<div class="row" style="padding:0"><span style="font-size:14px">'+L.name+'</span><span class="num" style="font-size:12px;color:var(--ink-dim)">'+l+' / '+L.max+'</span></div>'+
      '<div class="note" style="margin:4px 0 8px">'+(nx?nx.text:'書き換えきった。')+'</div>'+(nx&&(S.flags.lawFold||!S.U)?'<div class="note" style="margin:0 0 8px;color:rgba(236,238,242,.4)">法則は、宇宙を畳んだときに書き換える。</div>':'');
    if(nx&&!S.flags.lawFold&&S.U>0)d+='<button class="act" id="uLaw"'+(S.U<nx.cost?' disabled':'')+' style="border-color:rgba(200,210,255,.6);color:#dfe4ff">書き換える　法則 '+nx.cost+'</button>';}
  d+=canFold()?'<button class="act" id="uFold" style="margin-top:10px">宇宙を畳む　法則 +'+uGain()+'</button>':'<div class="note" style="margin-top:8px">宇宙の果てに着くと、宇宙を畳める。距離・航跡とその強化は戻り、見つけた色と装置・灯した星・記憶の強化・実績は残る。</div>';
  pbody.innerHTML='<div class="phead"><span class="lab">UNIVERSE '+roman(S.uni+1)+'</span><span class="num" style="font-size:12px;color:var(--ink-dim)">法則 '+fmt(S.U)+((S.shard||0)>0?'　かけら '+S.shard:'')+'</span></div>'+v+'<div class="gDet">'+d+'</div>';
  pbody.querySelectorAll('[data-law]').forEach(g=>g.onclick=()=>{uniSel=g.dataset.law;uniPast=-1;renderUniverse();});
  pbody.querySelectorAll('[data-up]').forEach(g=>g.onclick=()=>{uniPast=+g.dataset.up;renderUniverse();});
  const bk=document.getElementById('uBack');if(bk)bk.onclick=()=>{uniPast=-1;renderUniverse();};
  const lb=document.getElementById('uLaw');if(lb)lb.onclick=()=>{if(buyLaw(uniSel)){SND.play('light');fla=Math.max(fla,0.12);renderPanel(true);paintSpeed();}};
  const fb=document.getElementById('uFold');if(fb)fb.onclick=()=>confirmBox('宇宙を畳む','法則を '+uGain()+' 得て、新しい宇宙で故郷から航海をやり直す。次の宇宙の時の流れを、候補から選ぶ。距離・航跡とその強化は戻る。見つけた色と装置・灯した星・記憶の強化・実績は残る。',()=>startFold());
}
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
  document.getElementById('pickGo').onclick=()=>{if(chooseKind(k.id)){SND.play('light');fla=Math.max(fla,0.14);closePick();applyLoadedVisuals();S.flags.lawFold=1;if(LAWS.some(L=>{const n=lawNext(L.id);return n&&S.U>=n.cost;}))S.flags.lawPend=1;save();pbody.dataset.k='';renderPanel(true);if(S.flags.lawPend)openLaws();}};
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

/* ④ 法則の書き換え（2026-11-24、試作 A）：宇宙を畳んで次の時の流れを選んだあと、暗闇のまま開く。MAP タブは見るだけ。
   選んだ宇宙の銀河から3本の法則の筋が扇形に伸び、段の数だけ光の粒が灯る。筋を押して選び「書き換える」、「船を出す」で新しい空が明ける */
let lawOpen=false,lawSel='lc',lawFX=null;
function openLaws(){lawOpen=true;const ov=document.getElementById('lawOv');ov.classList.add('on','lIntro');renderLaws();setTimeout(()=>ov.classList.remove('lIntro'),2600);}
function closeLaws(){lawOpen=false;delete S.flags.lawPend;document.getElementById('lawOv').classList.remove('on');save();pbody.dataset.k='';renderPanel(true);paintSpeed();}
function renderLaws(){const ov=document.getElementById('lawOv'),b=document.getElementById('lawBody'),W=ov.clientWidth||innerWidth,H=ov.clientHeight||vpH();
  const cx=W/2,cy=Math.round(H*0.53),r0=40,len=Math.max(110,Math.min(165,H*0.2)),ang=[-2.12,-1.5708,-1.02],f=n=>n.toFixed(1),h=S.uHist[S.uHist.length-1];
  let v='<svg class="lSky" width="'+W+'" height="'+H+'" viewBox="0 0 '+W+' '+H+'"><defs><radialGradient id="ugc"><stop offset="0" stop-color="#fffaf0"/><stop offset="1" stop-color="#fffaf0" stop-opacity="0"/></radialGradient>'+
    UNI_TINT.map((t,i)=>'<radialGradient id="ugl'+i+'"><stop offset="0" stop-color="'+rgb(t.a,0.45)+'"/><stop offset="1" stop-color="'+rgb(t.a,0)+'"/></radialGradient>').join('')+'</defs>';
  {let sd=3;const r=()=>{sd=(sd*16807)%2147483647;return sd/2147483647;};for(let i=0;i<Math.round(W*H/1400);i++){const tw=r()<0.3;v+='<circle'+(tw?' class="gTw" style="animation-delay:-'+(r()*5).toFixed(1)+'s"':'')+' cx="'+f(r()*W)+'" cy="'+f(r()*H)+'" r="'+(0.3+r()*0.7).toFixed(2)+'" fill="#eceef2" opacity="'+(0.12+r()*0.45).toFixed(2)+'"/>';}}
  // 畳んだ宇宙（下に小さく沈む）と、いまの宇宙
  if(h)v+='<path d="M'+cx+' '+(cy+120)+' C '+(cx-6)+' '+(cy+80)+', '+(cx+6)+' '+(cy+50)+', '+cx+' '+(cy+18)+'" stroke="rgba(236,238,242,.16)" stroke-width=".6" fill="none"/><g transform="translate('+cx+' '+(cy+128)+')" opacity=".6">'+galaxySvg(S.uni-1,9,0.7,h.tint||0)+'</g><text x="'+(cx+20)+'" y="'+(cy+132)+'" font-size="9.5" fill="rgba(236,238,242,.38)">宇宙 '+roman(S.uni)+'</text>';
  const K=S.uKind&&UNI_KIND.find(x=>x.id===S.uKind),tc=UNI_TINT[S.uTint%UNI_TINT.length].a;
  v+='<g class="lGal" transform="translate('+cx+' '+cy+')">'+galaxySvg(S.uni,28,1,S.uTint)+'</g><text x="'+(cx+40)+'" y="'+(cy+28)+'" font-size="11" fill="rgba(236,238,242,.8)">宇宙 '+roman(S.uni+1)+'</text>'+(K?'<text x="'+(cx+40)+'" y="'+(cy+42)+'" font-size="9.5" fill="'+rgb(tc,0.7)+'">'+K.name+'</text>':'');
  LAWS.forEach((L,i)=>{const a=ang[i],l=law(L.id),m=L.max,step=len/m,on=lawSel===L.id,c=L.col,P=k=>[cx+Math.cos(a)*(r0+k*step),cy+Math.sin(a)*(r0+k*step)];
    const [sx,sy]=P(0),[ex,ey]=P(m),cs=Math.cos(a),anc=cs<-0.3?'end':cs>0.3?'start':'middle',tx=cx+Math.cos(a)*(r0+len+18),ty=cy+Math.sin(a)*(r0+len+18),n=lawNext(L.id);
    v+='<g class="lBeam lb'+(i+1)+'" data-lw="'+L.id+'"><line x1="'+f(sx)+'" y1="'+f(sy)+'" x2="'+f(ex)+'" y2="'+f(ey)+'" stroke="transparent" stroke-width="24"/>'+
      '<line class="lLine" x1="'+f(sx)+'" y1="'+f(sy)+'" x2="'+f(ex)+'" y2="'+f(ey)+'" stroke="'+rgb(c,on?0.32:0.15)+'" stroke-width=".7" stroke-dasharray="1.4 4"/>';
    if(l>0){const [lx,ly]=P(l);v+='<line x1="'+f(sx)+'" y1="'+f(sy)+'" x2="'+f(lx)+'" y2="'+f(ly)+'" stroke="'+rgb(c,on?0.12:0.05)+'" stroke-width="6" stroke-linecap="round"/><line class="lLine" x1="'+f(sx)+'" y1="'+f(sy)+'" x2="'+f(lx)+'" y2="'+f(ly)+'" stroke="'+rgb(c,on?0.85:0.5)+'" stroke-width="'+(on?1.3:0.9)+'"/>';
      for(let k=1;k<=l;k++){const [px,py]=P(k),last=k===l;if(last)v+='<circle cx="'+f(px)+'" cy="'+f(py)+'" r="'+(on?11:7)+'" fill="'+rgb(c,on?0.22:0.12)+'"/>';v+='<circle class="lDot" cx="'+f(px)+'" cy="'+f(py)+'" r="'+(last?2.2:1.3)+'" fill="'+rgb(c,on?1:0.65)+'"/>';}}
    if(n&&S.U>=n.cost){const [nx,ny]=P(l+1);v+='<circle class="gTip" cx="'+f(nx)+'" cy="'+f(ny)+'" r="2" fill="'+rgb(c,0.9)+'"/>';}
    if(on){const [qx,qy]=P(l);v+='<circle cx="'+f(qx)+'" cy="'+f(qy)+'" r="8" fill="none" stroke="'+rgb(c,0.55)+'" stroke-width=".7"/>';}
    v+='<text class="lDot" x="'+f(tx)+'" y="'+f(ty+3)+'" text-anchor="'+anc+'" font-size="11" fill="rgba(236,238,242,'+(on?0.92:0.5)+')">'+L.name+'</text><text class="lDot" x="'+f(tx)+'" y="'+f(ty+17)+'" text-anchor="'+anc+'" font-size="9.5" class="num" fill="rgba(236,238,242,'+(on?0.6:0.3)+')">'+l+' / '+m+'</text></g>';});
  if(lawFX){const L=LAWS.find(x=>x.id===lawFX),i=LAWS.indexOf(L),a=ang[i],d=r0+law(L.id)*(len/L.max),X=cx+Math.cos(a)*d,Y=cy+Math.sin(a)*d;
    v+='<circle r="2.4" fill="#fff"><animate attributeName="cx" from="'+cx+'" to="'+f(X)+'" dur=".7s" fill="freeze"/><animate attributeName="cy" from="'+cy+'" to="'+f(Y)+'" dur=".7s" fill="freeze"/><animate attributeName="opacity" values="1;1;0" dur="1s" fill="freeze"/></circle>';
    for(let k=0;k<14;k++){const q=Math.random()*6.283,dd=14+Math.random()*22;v+='<circle cx="'+f(X)+'" cy="'+f(Y)+'" r="1" fill="'+rgb(L.col,1)+'" opacity="0"><animate attributeName="cx" to="'+f(X+Math.cos(q)*dd)+'" begin=".65s" dur=".9s" fill="freeze"/><animate attributeName="cy" to="'+f(Y+Math.sin(q)*dd)+'" begin=".65s" dur=".9s" fill="freeze"/><animate attributeName="opacity" values="0;1;0" begin=".65s" dur=".9s" fill="freeze"/></circle>';}lawFX=null;}
  v+='</svg>';
  const L=LAWS.find(x=>x.id===lawSel),n=lawNext(L.id);
  b.innerHTML=v+'<div class="lTop"><div class="gLab">LAWS</div><div class="lCnt">法則<b>'+fmt(S.U)+'</b></div>'+(h?'<div class="lRes">宇宙 '+roman(S.uni)+' を畳んだ　・　<i>法則 +'+h.gain+'</i></div>':'')+'</div>'+
    '<div class="lBot"><div class="lNm"><span>'+L.name+'</span><i>'+law(L.id)+' / '+L.max+'</i></div><div class="lWhat">'+(n?n.text:'書き換えきった。')+'</div>'+
    (n?'<button class="lBuy" id="lawBuy"'+(S.U<n.cost?' disabled':'')+'>書き換える　法則 '+n.cost+'</button>':'')+'<button class="lGo" id="lawGo">船を出す</button></div>';
  b.querySelectorAll('[data-lw]').forEach(g=>g.onclick=()=>{lawSel=g.dataset.lw;SND.play('tab');document.getElementById('lawOv').classList.remove('lIntro');renderLaws();});
  const bb=document.getElementById('lawBuy');if(bb)bb.onclick=()=>{if(buyLaw(lawSel)){SND.play('light');lawFX=lawSel;document.getElementById('lawOv').classList.remove('lIntro');renderLaws();}};
  document.getElementById('lawGo').onclick=()=>{SND.play('resail');closeLaws();};}
addEventListener('resize',()=>{if(lawOpen)renderLaws();});
