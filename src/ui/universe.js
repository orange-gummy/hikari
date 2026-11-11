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
  const key='u|'+[S.uni,S.U,JSON.stringify(S.law),uniSel,uniPast,S.uTint,canFold(),uGain()].join('|');if(pbody.dataset.k===key)return;pbody.dataset.k=key;
  const W=360,H=330,cx=180,cy=168,n=S.uni+1,show=Math.min(n,6);
  // いまの宇宙と、下に沈んでいく過去の宇宙（多いときは新しい5つだけ）
  const ys=[];let y=cy;for(let age=0;age<show;age++){ys.push(y);y+=age===0?78:Math.max(24,52-age*8);}
  let v='<svg class="uniSky" viewBox="0 0 '+W+' '+H+'" role="group" aria-label="宇宙の系譜"><defs><radialGradient id="ugc"><stop offset="0" stop-color="#fffaf0"/><stop offset="1" stop-color="#fffaf0" stop-opacity="0"/></radialGradient>'+
    UNI_TINT.map((t,i)=>'<radialGradient id="ugl'+i+'"><stop offset="0" stop-color="'+rgb(t.a,0.45)+'"/><stop offset="1" stop-color="'+rgb(t.a,0)+'"/></radialGradient>').join('')+'</defs>';
  let path='';for(let yy=ys[show-1]+30;yy>=cy;yy-=3)path+=(path?'L':'M')+(cx+Math.sin(yy/23)*3).toFixed(1)+' '+yy;
  v+='<path d="'+path+'" fill="none" stroke="rgba(236,238,242,.18)" stroke-width=".6"/>';
  for(let age=show-1;age>=0;age--){const k=n-1-age,yy=ys[age],gx=cx+Math.sin(yy/23)*3,r=age===0?24:Math.max(6,15-age*2.5),a=age===0?1:Math.max(0.35,0.8-age*0.13);
    const tint=age===0?S.uTint:(S.uHist[k]?S.uHist[k].tint:k),sel=uniPast===k;
    v+='<g transform="translate('+gx.toFixed(1)+' '+yy+')"'+(age>0?' data-up="'+k+'" style="cursor:pointer"':'')+'>'+(age>0?'<circle r="'+(r+10)+'" fill="transparent"/>':'')+galaxySvg(k,r,a,tint)+
      (sel?'<circle r="'+(r+6)+'" fill="none" stroke="'+rgb(UNI_TINT[tint%UNI_TINT.length].a,0.6)+'" stroke-width=".7"/>':'')+
      '<text x="'+(r+14)+'" y="4" font-size="'+(age===0?11:9.5)+'" fill="rgba(236,238,242,'+(age===0||sel?0.85:0.4)+')">宇宙 '+roman(k+1)+'</text></g>';}
  // 法則の筋
  const A=[-2.5,-1.9,-1.24,-0.64],r0=34,len=92;
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
  if(uniPast>=0&&S.uHist[uniPast]){const h=S.uHist[uniPast],lw=LAWS.filter(L=>h.law[L.id]).map(L=>L.name+' '+h.law[L.id]).join('・')||'まだ書き換えていない';
    d='<div class="row" style="padding:0"><span style="font-size:14px">宇宙 '+roman(uniPast+1)+'</span></div><div class="note" style="margin:4px 0 10px">いちばん遠く　'+lyText(h.far)+' 光年<br>得た法則　'+h.gain+'<br>この宇宙にいた時間　'+durText(h.time)+'<br>そのときの法則　'+lw+'</div><button class="act" id="uBack">いまの宇宙に戻る</button>';}
  else{const L=LAWS.find(x=>x.id===uniSel),l=law(L.id),nx=lawNext(L.id);
    d='<div class="row" style="padding:0"><span style="font-size:14px">'+L.name+'</span><span class="num" style="font-size:12px;color:var(--ink-dim)">'+l+' / '+L.max+'</span></div>'+
      '<div class="note" style="margin:4px 0 8px">'+(nx?nx.text:(L.id==='lc'?'光の上限を書き換えきった。9を22個並べると、光になれる。':'書き換えきった。'))+'</div>';
    if(L.id==='ut'&&l>0)d+='<div class="uTint">'+UNI_TINT.slice(0,l+1).map((t,i)=>'<button data-tint="'+i+'" aria-label="'+t.name+'" aria-pressed="'+(S.uTint===i)+'"><i style="background:'+rgb(t.a,1)+';box-shadow:0 0 8px '+rgb(t.a,0.7)+'"></i>'+t.name+'</button>').join('')+'</div>';
    if(nx)d+='<button class="act" id="uLaw"'+(S.U<nx.cost?' disabled':'')+' style="border-color:rgba(200,210,255,.6);color:#dfe4ff">書き換える　法則 '+nx.cost+'</button>';}
  d+=canFold()?'<button class="act" id="uFold" style="margin-top:10px">宇宙を畳む　法則 +'+uGain()+'</button>':'<div class="note" style="margin-top:8px">宇宙の果てに着くと、宇宙を畳める。距離・航跡とその強化は戻り、見つけた色と装置・灯した星・残光の強化・実績は残る。</div>';
  pbody.innerHTML='<div class="phead"><span class="lab">UNIVERSE '+roman(S.uni+1)+'</span><span class="num" style="font-size:12px;color:var(--ink-dim)">法則 '+fmt(S.U)+'</span></div>'+v+'<div class="gDet">'+d+'</div>';
  pbody.querySelectorAll('[data-law]').forEach(g=>g.onclick=()=>{uniSel=g.dataset.law;uniPast=-1;renderUniverse();});
  pbody.querySelectorAll('[data-up]').forEach(g=>g.onclick=()=>{uniPast=+g.dataset.up;renderUniverse();});
  pbody.querySelectorAll('[data-tint]').forEach(b=>b.onclick=()=>{S.uTint=+b.dataset.tint;save();renderUniverse();});
  const bk=document.getElementById('uBack');if(bk)bk.onclick=()=>{uniPast=-1;renderUniverse();};
  const lb=document.getElementById('uLaw');if(lb)lb.onclick=()=>{if(buyLaw(uniSel)){SND.play('light');fla=Math.max(fla,0.12);renderPanel(true);paintSpeed();}};
  const fb=document.getElementById('uFold');if(fb)fb.onclick=()=>confirmBox('宇宙を畳む','法則を '+uGain()+' 得て、新しい宇宙で故郷から航海をやり直す。距離・航跡とその強化は戻る。見つけた色と装置・灯した星・残光の強化・実績は残る。',()=>startFold());
}
function durText(sec){const h=sec/3600;return h>=24?(h/24).toFixed(1)+'日':h>=1?h.toFixed(1)+'時間':Math.max(1,Math.round(sec/60))+'分';}
