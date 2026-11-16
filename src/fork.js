'use strict';
/* =====================================================================
   航路の分かれ道（③ 航海）
   遊んでいる間、10分ほどごとに窓の中心から光の道が2〜3本のびる。道の先の光を押すと、その道へ進む。
   選ばなければ、しばらくして道は消え、まっすぐ進む
   ===================================================================== */
const forkEl=document.createElement('div');forkEl.id='forkOv';forkEl.setAttribute('role','group');forkEl.setAttribute('aria-label','航路の分かれ道');frameEl.appendChild(forkEl);
let forkKey='',FORK_STYLE='scene';   // scene＝窓の外の景色として、gauge＝計器の分岐図として（試作中）
const f1=n=>n.toFixed(1);
// 行き先の姿（光の点と線で）：星雲＝色の霞、残骸＝崩れた星の欠片、静かな空域＝光の少ない暗い円、追い風＝流れる光の川
function forkIcon(id,x,y,r,col){let sd=id.length*97+7;const rnd=()=>{sd=(sd*16807)%2147483647;return sd/2147483647;};let v='';const c=a=>'rgba('+col.join(',')+','+a+')';
  if(id==='neb'){for(let k=0;k<5;k++){const a=rnd()*6.283,d=rnd()*r*0.5;v+='<circle cx="'+f1(x+Math.cos(a)*d)+'" cy="'+f1(y+Math.sin(a)*d*0.6)+'" r="'+f1(r*(0.5+rnd()*0.5))+'" fill="url(#fkN'+id+')" opacity=".55"/>';}
    for(let k=0;k<26;k++){const a=rnd()*6.283,d=Math.pow(rnd(),0.7)*r;v+='<circle cx="'+f1(x+Math.cos(a)*d)+'" cy="'+f1(y+Math.sin(a)*d*0.6)+'" r="'+(0.4+rnd()*0.7).toFixed(2)+'" fill="#fff" opacity="'+(0.3+rnd()*0.6).toFixed(2)+'"/>';}}
  else if(id==='wreck'){v+='<circle cx="'+f1(x)+'" cy="'+f1(y)+'" r="'+f1(r*0.22)+'" fill="none" stroke="'+c(0.7)+'" stroke-width=".8"/>';
    for(let k=0;k<11;k++){const a=rnd()*6.283,d=r*(0.35+rnd()*0.65),l=2+rnd()*5,b=rnd()*6.283,px=x+Math.cos(a)*d,py=y+Math.sin(a)*d*0.8;v+='<line x1="'+f1(px)+'" y1="'+f1(py)+'" x2="'+f1(px+Math.cos(b)*l)+'" y2="'+f1(py+Math.sin(b)*l)+'" stroke="'+c(0.4+rnd()*0.5)+'" stroke-width=".9" stroke-linecap="round"/>';}
    for(let k=0;k<10;k++){const a=rnd()*6.283,d=r*(0.3+rnd()*0.8);v+='<circle cx="'+f1(x+Math.cos(a)*d)+'" cy="'+f1(y+Math.sin(a)*d*0.8)+'" r=".7" fill="'+c(0.8)+'"/>';}}
  else if(id==='calm'){v+='<circle cx="'+f1(x)+'" cy="'+f1(y)+'" r="'+f1(r*0.9)+'" fill="#04050C" opacity=".85"/><circle cx="'+f1(x)+'" cy="'+f1(y)+'" r="'+f1(r*0.9)+'" fill="none" stroke="'+c(0.35)+'" stroke-width=".7" stroke-dasharray="1 4"/>'+
    '<circle cx="'+f1(x)+'" cy="'+f1(y)+'" r="1.6" fill="'+c(0.95)+'"/><circle cx="'+f1(x)+'" cy="'+f1(y)+'" r="'+f1(r*0.45)+'" fill="url(#fkN'+id+')" opacity=".5"/>';}
  else{for(let k=0;k<4;k++){const yy=y-r*0.45+k*r*0.3;v+='<path class="fkFlow" d="M'+f1(x-r)+' '+f1(yy)+'C'+f1(x-r*0.3)+' '+f1(yy-r*0.35)+' '+f1(x+r*0.3)+' '+f1(yy+r*0.35)+' '+f1(x+r)+' '+f1(yy)+'" fill="none" stroke="'+c(0.25+k*0.15)+'" stroke-width=".9" stroke-dasharray="3 6" stroke-linecap="round"/>';}}
  return v;}
const fkDefs=()=>'<defs>'+FORKS.map(o=>'<radialGradient id="fkN'+o.id+'"><stop offset="0" stop-color="rgb('+o.col.join(',')+')" stop-opacity=".9"/><stop offset="1" stop-color="rgb('+o.col.join(',')+')" stop-opacity="0"/></radialGradient>').join('')+'</defs>';
// 窓の外の景色として：行き先そのものを、窓の下のほうに小さく描く
function forkScene(f){const W=FR.w,H=FR.h,cx=RC.x-FR.x,rr=ringEl.getBoundingClientRect().height/2||60,top=RC.y-FR.y+rr*0.85,n=f.opts.length,r=Math.min(30,W/(n*3.4)),y=Math.min(top+Math.max(r+8,(H-top)*0.4),H-r-44),span=Math.min(W*0.78,n*150);
  let v='<svg width="'+W+'" height="'+H+'" viewBox="0 0 '+W+' '+H+'">'+fkDefs();
  f.opts.forEach((id,k)=>{const o=FORKS.find(x=>x.id===id),x=W/2-span/2+span*(k+0.5)/n,col='rgb('+o.col.join(',')+')';
    v+='<g class="fkOpt" data-fk="'+id+'" tabindex="0" role="button" aria-label="'+o.name+'　'+forkText(id)+'"><rect x="'+f1(x-span/n/2)+'" y="'+f1(y-r-14)+'" width="'+f1(span/n)+'" height="'+f1(r*2+56)+'" fill="transparent"/>'+forkIcon(id,x,y,r,o.col)+
      '<text x="'+f1(x)+'" y="'+f1(y+r+16)+'" text-anchor="middle" font-size="11.5" fill="#f6f7fb">'+o.name+'</text><text x="'+f1(x)+'" y="'+f1(y+r+31)+'" text-anchor="middle" font-size="10.5" fill="'+col+'">'+forkText(id)+'</text></g>';});
  v+='<circle class="fkLife" cx="'+f1(cx)+'" cy="'+f1(top+4)+'" r="7" fill="none" stroke="rgba(236,238,242,.55)" stroke-width="1" transform="rotate(-90 '+f1(cx)+' '+f1(top+4)+')" stroke-dasharray="44 44"/></svg>';return v;}
// 計器の分岐図として：窓の下の端に、細い線の枝分かれと記号
function forkGauge(f){const W=FR.w,H=FR.h,n=f.opts.length,gw=Math.min(W-28,340),rb=RC.y-FR.y+(ringEl.getBoundingClientRect().height/2||60),gh=Math.max(40,Math.min(n===3?84:64,H-rb-46)),x0=(W-gw)/2,y0=H-gh-22,bx=x0+gw*(W<500?0.18:0.28),ym=y0+gh/2,ex=x0+gw*(W<500?0.34:0.5);
  const ink=a=>'rgba(236,238,242,'+a+')',tight=n>1&&gh/(n-1)<34;
  let v='<svg width="'+W+'" height="'+H+'" viewBox="0 0 '+W+' '+H+'">'+fkDefs()+
    '<text x="'+f1(x0)+'" y="'+f1(y0-8)+'" font-size="8.5" letter-spacing="1.5" fill="'+ink(0.45)+'" font-family="Michroma,Jura,sans-serif">ROUTE · BRANCH</text>'+
    '<line x1="'+f1(x0)+'" y1="'+f1(ym)+'" x2="'+f1(bx)+'" y2="'+f1(ym)+'" stroke="'+ink(0.7)+'" stroke-width="1"/><path d="M'+f1(x0)+' '+f1(ym-4)+'l7 4l-7 4z" fill="'+ink(0.9)+'"/>'+
    '<circle class="fkLife" cx="'+f1(bx)+'" cy="'+f1(ym)+'" r="6" fill="#04050C" stroke="'+ink(0.6)+'" stroke-width="1" transform="rotate(-90 '+f1(bx)+' '+f1(ym)+')" stroke-dasharray="37.7 37.7"/>';
  for(let t=0;t<=10;t++){const xx=x0+gw*t/10;v+='<line x1="'+f1(xx)+'" y1="'+f1(y0+gh+6)+'" x2="'+f1(xx)+'" y2="'+f1(y0+gh+(t%5?9:12))+'" stroke="'+ink(0.25)+'" stroke-width=".6"/>';}
  f.opts.forEach((id,k)=>{const o=FORKS.find(x=>x.id===id),col='rgb('+o.col.join(',')+')',y=n===1?ym:y0+gh*k/(n-1),sym=id==='neb'?'<circle r="5" fill="none" stroke="'+col+'" stroke-width="1"/><circle r="1.6" fill="'+col+'"/>':id==='wreck'?'<path d="M0 -5.5L5.5 0L0 5.5L-5.5 0Z" fill="none" stroke="'+col+'" stroke-width="1"/>':id==='calm'?'<rect x="-4.5" y="-4.5" width="9" height="9" fill="none" stroke="'+col+'" stroke-width="1"/>':'<path d="M-5 3L0 -4L5 3" fill="none" stroke="'+col+'" stroke-width="1"/>';
    v+='<g class="fkOpt" data-fk="'+id+'" tabindex="0" role="button" aria-label="'+o.name+'　'+forkText(id)+'"><rect x="'+f1(bx+6)+'" y="'+f1(y-14)+'" width="'+f1(x0+gw-bx)+'" height="28" fill="transparent"/>'+
      '<path d="M'+f1(bx+6)+' '+f1(ym)+'C'+f1(bx+30)+' '+f1(ym)+' '+f1(bx+20)+' '+f1(y)+' '+f1(ex-10)+' '+f1(y)+'H'+f1(ex-8)+'" fill="none" stroke="'+col+'" stroke-opacity=".75" stroke-width="1"/>'+
      '<g transform="translate('+f1(ex)+' '+f1(y)+')" class="fkNode">'+sym+'</g>'+(tight?'<text x="'+f1(ex+14)+'" y="'+f1(y+4)+'" font-size="10.5" fill="#f6f7fb">'+o.name+'<tspan dx="8" font-size="9.5" fill="'+col+'">'+forkText(id)+'</tspan></text>':'<text x="'+f1(ex+14)+'" y="'+f1(y-1)+'" font-size="11" fill="#f6f7fb">'+o.name+'</text><text x="'+f1(ex+14)+'" y="'+f1(y+12)+'" font-size="9.5" fill="'+col+'">'+forkText(id)+'</text>')+'</g>';});
  return v+'</svg>';}
function paintFork(){const f=S.fork,show=f&&S.voy&&!BRK&&!RST&&!climax&&!FOLD&&!LIGHTFX&&!skillOpen&&!glowOpen;
  if(!show){if(forkKey){forkKey='';forkEl.innerHTML='';forkEl.classList.remove('on');document.body.classList.remove('forkOn');}return;}
  const key=f.opts.join(',')+'|'+Math.round(FR.w)+'x'+Math.round(FR.h);
  if(key!==forkKey){forkKey=key;forkEl.innerHTML=FORK_STYLE==='gauge'?forkGauge(f):forkScene(f);forkEl.classList.add('on');document.body.classList.add('forkOn');
    forkEl.querySelectorAll('[data-fk]').forEach(g=>{const go=e=>{e.stopPropagation();e.preventDefault();pickFork(g.dataset.fk);};g.addEventListener('pointerdown',e=>e.stopPropagation());g.addEventListener('click',go);g.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' ')go(e);});});}
  // 残り時間：中心の小さな輪が欠けていく
  const lf=forkEl.querySelector('.fkLife');if(lf){const k=Math.max(0,f.life/FORK_LIFE);const L=+lf.getAttribute('r')*6.283;lf.setAttribute('stroke-dasharray',(L*k).toFixed(1)+' '+L.toFixed(1));}
  forkEl.style.opacity=f.life<10?Math.max(0,f.life/10).toFixed(2):'';}
function pickFork(id){const o=FORKS.find(x=>x.id===id),txt=forkText(id);if(!chooseFork(id))return;SND.play('light');fla=Math.max(fla,0.12);
  toast(o.name+'　<b>'+txt+'</b>');logLine(FORK_LINES[id],-1);forkKey='';paintFork();save();if(curTab==='drive'||curTab==='voy')renderPanel(true);}
