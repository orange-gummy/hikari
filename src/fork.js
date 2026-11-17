'use strict';
/* =====================================================================
   航路の分かれ道（③ 航海）
   遊んでいる間、10分ほどごとに窓の下の端に計器の分岐図が出る（細い線の枝分かれと記号）。枝の先を押すと、その道へ進む。
   選ばなければ、しばらくして道は消え、まっすぐ進む
   ===================================================================== */
const forkEl=document.createElement('div');forkEl.id='forkOv';forkEl.setAttribute('role','group');forkEl.setAttribute('aria-label','航路の分かれ道');frameEl.appendChild(forkEl);
let forkKey='';
const f1=n=>n.toFixed(1);
const fkDefs=()=>'';
// 星系の記号（航路図と窓の下の分岐図で共通）
function routeSym(id,col,k){k=k||1;const sw=(1/k).toFixed(2),r=v=>(v*k).toFixed(1);
  if(id==='neb')return '<circle r="'+r(5)+'" fill="none" stroke="'+col+'" stroke-width="1"/><circle r="'+r(1.6)+'" fill="'+col+'"/>';
  if(id==='wreck')return '<path d="M0 '+r(-5.5)+'L'+r(5.5)+' 0L0 '+r(5.5)+'L'+r(-5.5)+' 0Z" fill="none" stroke="'+col+'" stroke-width="1"/>';
  if(id==='calm')return '<rect x="'+r(-4.5)+'" y="'+r(-4.5)+'" width="'+r(9)+'" height="'+r(9)+'" fill="none" stroke="'+col+'" stroke-width="1"/>';
  if(id==='cluster')return '<circle r="'+r(1.5)+'" fill="'+col+'"/><circle cx="'+r(-4)+'" cy="'+r(2)+'" r="'+r(1.1)+'" fill="'+col+'"/><circle cx="'+r(3.6)+'" cy="'+r(2.6)+'" r="'+r(1.1)+'" fill="'+col+'"/><circle cx="'+r(.6)+'" cy="'+r(-4.2)+'" r="'+r(1.1)+'" fill="'+col+'"/>';
  if(id==='rough')return '<path d="M'+r(-6)+' 0L'+r(-3)+' '+r(-4)+'L0 '+r(3)+'L'+r(3)+' '+r(-4)+'L'+r(6)+' 0" fill="none" stroke="'+col+'" stroke-width="1"/>';
  return '<circle r="'+r(5)+'" fill="none" stroke="'+col+'" stroke-width="1" stroke-dasharray="2 2"/><circle r="'+r(1)+'" fill="'+col+'"/>';}
// 計器の分岐図として：窓の下の端に、細い線の枝分かれと記号
// 窓の下にリング（と ENERGY · PHOTON の切り替え）との間の高さが足りないときは、分岐図をやめて一行にする（2026-11-17。スマホで文字がリングに重なっていた）
function forkRow(f){const W=FR.w,H=FR.h,ink=a=>'rgba(236,238,242,'+a+')';   // 高さが足りないときは、左下の隅に小さな入口だけ（押すと GALAXY の VOYAGE に航路図）
  return '<svg width="'+W+'" height="'+H+'" viewBox="0 0 '+W+' '+H+'"><g class="fkOpt" data-fk="__map" tabindex="0" role="button" aria-label="次の宙域を選ぶ"><rect x="6" y="'+(H-40)+'" width="120" height="34" fill="transparent"/><text x="16" y="'+(H-25)+'" font-size="8.5" letter-spacing="1.5" fill="'+ink(0.5)+'" font-family="Michroma,Jura,sans-serif">NEXT SECTOR</text><text x="16" y="'+(H-11)+'" font-size="10.5" fill="#f6f7fb">道が '+f.opts.length+' つ　›</text></g></svg>';}
function forkGauge(f){const W=FR.w,H=FR.h,n=f.opts.length,gw=Math.min(W-28,340),rb=RC.y-FR.y+(ringEl.getBoundingClientRect().height/2||60)+(S.voy&&!S.chal?30:0),gh=Math.max(40,Math.min(n===3?84:64,H-rb-46)),x0=(W-gw)/2,y0=H-gh-22,bx=x0+gw*(W<500?0.18:0.28),ym=y0+gh/2,ex=x0+gw*(W<500?0.34:0.5);
  if(H-rb-46<(n===3?70:52))return forkRow(f);
  const ink=a=>'rgba(236,238,242,'+a+')',tight=n>1&&gh/(n-1)<34;
  let v='<svg width="'+W+'" height="'+H+'" viewBox="0 0 '+W+' '+H+'">'+fkDefs()+
    '<text x="'+f1(x0)+'" y="'+f1(y0-8)+'" font-size="8.5" letter-spacing="1.5" fill="'+ink(0.45)+'" font-family="Michroma,Jura,sans-serif">NEXT SECTOR</text>'+
    '<line x1="'+f1(x0)+'" y1="'+f1(ym)+'" x2="'+f1(bx)+'" y2="'+f1(ym)+'" stroke="'+ink(0.7)+'" stroke-width="1"/><path d="M'+f1(x0)+' '+f1(ym-4)+'l7 4l-7 4z" fill="'+ink(0.9)+'"/>'+
    '<circle class="fkLife" cx="'+f1(bx)+'" cy="'+f1(ym)+'" r="6" fill="#04050C" stroke="'+ink(0.6)+'" stroke-width="1" transform="rotate(-90 '+f1(bx)+' '+f1(ym)+')" stroke-dasharray="37.7 37.7"/>';
  for(let t=0;t<=10;t++){const xx=x0+gw*t/10;v+='<line x1="'+f1(xx)+'" y1="'+f1(y0+gh+6)+'" x2="'+f1(xx)+'" y2="'+f1(y0+gh+(t%5?9:12))+'" stroke="'+ink(0.25)+'" stroke-width=".6"/>';}
  f.opts.forEach((id,k)=>{const o=FORKS.find(x=>x.id===id),col='rgb('+o.col.join(',')+')',y=n===1?ym:y0+gh*k/(n-1),sym=routeSym(id,col);
    v+='<g class="fkOpt" data-fk="'+id+'" tabindex="0" role="button" aria-label="'+o.name+'　'+forkText(id)+'"><rect x="'+f1(bx+6)+'" y="'+f1(y-14)+'" width="'+f1(x0+gw-bx)+'" height="28" fill="transparent"/>'+
      '<path d="M'+f1(bx+6)+' '+f1(ym)+'C'+f1(bx+30)+' '+f1(ym)+' '+f1(bx+20)+' '+f1(y)+' '+f1(ex-10)+' '+f1(y)+'H'+f1(ex-8)+'" fill="none" stroke="'+col+'" stroke-opacity=".75" stroke-width="1"/>'+
      '<g transform="translate('+f1(ex)+' '+f1(y)+')" class="fkNode">'+sym+'</g>'+(tight?'<text x="'+f1(ex+14)+'" y="'+f1(y+4)+'" font-size="10.5" fill="#f6f7fb">'+o.name+'<tspan dx="8" font-size="9.5" fill="'+col+'">'+forkText(id)+'</tspan></text>':'<text x="'+f1(ex+14)+'" y="'+f1(y-1)+'" font-size="11" fill="#f6f7fb">'+o.name+'</text><text x="'+f1(ex+14)+'" y="'+f1(y+12)+'" font-size="9.5" fill="'+col+'">'+forkText(id)+'</text>')+'</g>';});
  return v+'</svg>';}
function paintFork(){const f=S.fork,show=f&&S.voy&&!BRK&&!RST&&!climax&&!FOLD&&!LIGHTFX&&!skillOpen&&!glowOpen;
  if(!show){if(forkKey){forkKey='';forkEl.innerHTML='';forkEl.classList.remove('on');document.body.classList.remove('forkOn');}return;}
  const key=f.opts.join(',')+'|'+Math.round(FR.w)+'x'+Math.round(FR.h);
  if(key!==forkKey){forkKey=key;forkEl.innerHTML=forkGauge(f);forkEl.classList.add('on');document.body.classList.add('forkOn');
    forkEl.querySelectorAll('[data-fk]').forEach(g=>{const go=e=>{e.stopPropagation();e.preventDefault();if(g.dataset.fk==='__map'){curTab='voy';renderPanel(true);return;}pickFork(g.dataset.fk);};g.addEventListener('pointerdown',e=>e.stopPropagation());g.addEventListener('click',go);g.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' ')go(e);});});}
  // 残り時間：中心の小さな輪が欠けていく
  const lf=forkEl.querySelector('.fkLife');if(lf){const k=Math.max(0,f.life/FORK_LIFE);const L=+lf.getAttribute('r')*6.283;lf.setAttribute('stroke-dasharray',(L*k).toFixed(1)+' '+L.toFixed(1));}
  forkEl.style.opacity=f.life<10?Math.max(0,f.life/10).toFixed(2):'';}
function pickFork(id){const o=FORKS.find(x=>x.id===id),txt=forkText(id);if(!chooseFork(id))return;SND.play('light');fla=Math.max(fla,0.12);
  toast('次の宙域　<b>'+o.name+'</b>　'+txt);forkKey='';paintFork();save();if(curTab==='drive'||curTab==='voy')renderPanel(true);}
