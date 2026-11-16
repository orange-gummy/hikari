'use strict';
/* =====================================================================
   航路の分かれ道（③ 航海）
   遊んでいる間、10分ほどごとに窓の中心から光の道が2〜3本のびる。道の先の光を押すと、その道へ進む。
   選ばなければ、しばらくして道は消え、まっすぐ進む
   ===================================================================== */
const forkEl=document.createElement('div');forkEl.id='forkOv';forkEl.setAttribute('role','group');forkEl.setAttribute('aria-label','航路の分かれ道');frameEl.appendChild(forkEl);
let forkKey='';
function paintFork(){const f=S.fork,show=f&&S.voy&&!BRK&&!RST&&!climax&&!FOLD&&!LIGHTFX&&!skillOpen&&!glowOpen;
  if(!show){if(forkKey){forkKey='';forkEl.innerHTML='';forkEl.classList.remove('on');document.body.classList.remove('forkOn');}return;}
  const key=f.opts.join(',')+'|'+Math.round(FR.w)+'x'+Math.round(FR.h);
  if(key!==forkKey){forkKey=key;const W=FR.w,H=FR.h,cx=RC.x-FR.x,rr=ringEl.getBoundingClientRect().height/2||60,cy=RC.y-FR.y+rr*0.92,n=f.opts.length,sx=Math.min(W*0.36,170),sy=Math.max(34,Math.min(H-cy-56,150));   // 道はリングの下の端から、窓の下のほうへ
    const ang=n===2?[-0.62,0.62]:[-0.95,0,0.95];   // 窓の下のほうへ、扇のように開く
    let v='<svg width="'+W+'" height="'+H+'" viewBox="0 0 '+W+' '+H+'"><defs><radialGradient id="fkG"><stop offset="0" stop-color="#fff" stop-opacity=".7"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></radialGradient></defs>';
    f.opts.forEach((id,k)=>{const o=FORKS.find(x=>x.id===id),q=n===1?0:(k/(n-1))*2-1,ex=cx+q*sx,ey=cy+sy*(1-(sy>90?0.25:0)*Math.abs(q)),mx=cx+q*sx*0.15,my=cy+sy*0.55,col='rgb('+o.col.join(',')+')',
      anc='middle',dx=0,lx=Math.max(64,Math.min(W-64,ex)),ly=ey+24;
      v+='<g class="fkOpt" data-fk="'+id+'" tabindex="0" role="button" aria-label="'+o.name+'　'+forkText(id)+'">'+
        '<path d="M'+cx.toFixed(1)+' '+cy.toFixed(1)+'Q'+mx.toFixed(1)+' '+my.toFixed(1)+' '+ex.toFixed(1)+' '+ey.toFixed(1)+'" fill="none" stroke="'+col+'" stroke-opacity=".25" stroke-width="5" stroke-linecap="round"/>'+
        '<path class="fkFlow" d="M'+cx.toFixed(1)+' '+cy.toFixed(1)+'Q'+mx.toFixed(1)+' '+my.toFixed(1)+' '+ex.toFixed(1)+' '+ey.toFixed(1)+'" fill="none" stroke="'+col+'" stroke-width="1.2" stroke-linecap="round" stroke-dasharray="2 9"/>'+
        '<circle cx="'+ex.toFixed(1)+'" cy="'+ey.toFixed(1)+'" r="22" fill="url(#fkG)" opacity=".35"/><circle class="fkNode" cx="'+ex.toFixed(1)+'" cy="'+ey.toFixed(1)+'" r="4.5" fill="'+col+'"/>'+
        '<circle cx="'+ex.toFixed(1)+'" cy="'+ey.toFixed(1)+'" r="11" fill="none" stroke="'+col+'" stroke-opacity=".6" stroke-width=".8"/>'+
        '<text x="'+(lx+dx).toFixed(1)+'" y="'+ly.toFixed(1)+'" text-anchor="'+anc+'" font-size="12.5" fill="#f6f7fb">'+o.name+'</text>'+
        '<text class="fkSub" x="'+(lx+dx).toFixed(1)+'" y="'+(ly+16).toFixed(1)+'" text-anchor="'+anc+'" font-size="11" fill="'+col+'">'+forkText(id)+'</text>'+
        '<circle cx="'+ex.toFixed(1)+'" cy="'+ey.toFixed(1)+'" r="34" fill="transparent"/></g>';});
    v+='<circle class="fkLife" cx="'+cx.toFixed(1)+'" cy="'+cy.toFixed(1)+'" r="9" fill="none" stroke="rgba(236,238,242,.55)" stroke-width="1" transform="rotate(-90 '+cx.toFixed(1)+' '+cy.toFixed(1)+')" stroke-dasharray="56.5 56.5"/>'+
      '</svg>';
    forkEl.innerHTML=v;forkEl.classList.add('on');document.body.classList.add('forkOn');
    forkEl.querySelectorAll('[data-fk]').forEach(g=>{const go=e=>{e.stopPropagation();e.preventDefault();pickFork(g.dataset.fk);};g.addEventListener('pointerdown',e=>e.stopPropagation());g.addEventListener('click',go);g.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' ')go(e);});});}
  // 残り時間：中心の小さな輪が欠けていく
  const lf=forkEl.querySelector('.fkLife');if(lf){const k=Math.max(0,f.life/FORK_LIFE);lf.setAttribute('stroke-dasharray',(56.5*k).toFixed(1)+' 56.5');}
  forkEl.style.opacity=f.life<10?Math.max(0,f.life/10).toFixed(2):'';}
function pickFork(id){const o=FORKS.find(x=>x.id===id),txt=forkText(id);if(!chooseFork(id))return;SND.play('light');fla=Math.max(fla,0.12);
  toast(o.name+'　<b>'+txt+'</b>');logLine(FORK_LINES[id],-1);forkKey='';paintFork();save();if(curTab==='drive'||curTab==='voy')renderPanel(true);}
