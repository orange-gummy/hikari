'use strict';
/* =====================================================================
   UI ― スキル（星図）
   ===================================================================== */
let selSkill=null;
let LAYOUT=null;
function buildLayout(B,L,R0,FO){const pos={};const nArm=4;
  for(let br=0;br<4;br++){const phi=[-Math.PI/2,0,Math.PI/2,Math.PI][br];const steps=Math.max(...SKILLS.filter(k=>k.br===br).map(k=>k.step));let th=phi,r=R0;const pts=[];
    for(let st=0;st<=steps;st++){if(st>0){let acc=0;while(acc<L){const dth=0.01;const r1=R0+B*(th-phi);acc+=Math.hypot(r1*dth,B*dth);th+=dth;}r=R0+B*(th-phi);}pts.push([th,r]);}
    SKILLS.filter(k=>k.br===br).forEach(k=>{const [t,r]=pts[k.step];let x=r*Math.cos(t),y=r*Math.sin(t);if(k.fork){const tx=-r*Math.sin(t)+B*Math.cos(t),ty=r*Math.cos(t)+B*Math.sin(t),tl=Math.hypot(tx,ty),nx=-ty/tl,ny=tx/tl;x+=nx*FO*k.fork;y+=ny*FO*k.fork;}pos[k.id]=[180+x,176+y];});}
  return pos;}
function skillPos(k){if(!LAYOUT)LAYOUT=buildLayout(46,44,52,22);return LAYOUT[k.id];}
function skVis(k){return !k.glow||S.lTotal>0||S.lit.length>0;}  // 残光の星は、初めて故郷に着いてから見える
function skBBox(){let x0=180,x1=180,y0=176,y1=176;SKILLS.filter(skVis).forEach(k=>{const [x,y]=skillPos(k);x0=Math.min(x0,x);x1=Math.max(x1,x);y0=Math.min(y0,y);y1=Math.max(y1,y);});const m=22;return{x:x0-m,y:y0-m,w:x1-x0+2*m,h:y1-y0+2*m};}
function prereqPos(k){if(k.step===0)return[180,176];const prev=SKILLS.filter(x=>x.br===k.br&&x.step===k.step-1);let p=prev.find(x=>has(x.id))||prev[0];return skillPos(p);}
const SK_ICON={
p1:'<path d="M-3 -7L4 0L-3 7"/>',p2:'<path d="M-7 -7L0 0L-7 7M1 -7L8 0L1 7"/>',p3:'<path d="M-9 0H7M3 -4L7 0L3 4M-9 -5H-2M-9 5H-2"/>',
pA:'<path d="M2 -10L-5 1H1L-2 10L6 -2H0Z"/>',pB:'<path d="M-10 2Q-5 -3 0 2T10 2M6 -2L10 2L6 6"/>',p5:'<ellipse rx="10" ry="6"/><path d="M0 0V-4M0 0L5 1"/>',
e1:'<circle r="3.5"/><path d="M0 -10V-7M0 7V10M-10 0H-7M7 0H10M-7 -7L-5 -5M5 5L7 7M-7 7L-5 5M5 -5L7 -7"/>',e2:'<path d="M7 -3A8 8 0 1 0 6 5M7 -8V-3H2"/><path d="M-3 3L3 -3"/><circle cx="-2.5" cy="-2.5" r=".9"/><circle cx="2.5" cy="2.5" r=".9"/>',
e3:'<rect x="-9" y="-5" width="16" height="10" rx="2"/><path d="M7 -2V2M-6 -2V2M-3 -2V2M0 -2V2"/>',eA:'<circle cx="-7" r="3.5"/><circle r="3.5"/><circle cx="7" r="3.5"/>',
eB:'<rect x="-9" y="-5" width="16" height="10" rx="2"/><path d="M7 -2V2M-1 -4L-4 1H0L-2 5"/>',e5:'<path d="M0 0C-3 -5 -10 -5 -10 0S-3 5 0 0S10 -5 10 0S3 5 0 0"/>',
c1:'<path d="M3 -8A8 8 0 1 0 6 6A6 6 0 1 1 3 -8Z"/>',c2:'<circle cx="-5" cy="4" r="1.6"/><path d="M-1 0A5 5 0 0 1 -1 8M2 -4A9 9 0 0 1 2 12"/>',
c3:'<path d="M1 -8A8 8 0 1 0 4 6A6 6 0 1 1 1 -8Z"/><path d="M8 -6L9 -4L11 -3.5L9 -3L8 -1L7 -3L5 -3.5L7 -4Z"/>',cA:'<circle r="2"/><circle r="6" stroke-opacity=".7"/><circle r="10" stroke-opacity=".4"/>',
a:'<circle r="4"/><path d="M0 -10V-6M0 6V10M-10 0H-6M6 0H10M-7 -7L-4 -4M4 4L7 7M-7 7L-4 4M4 -4L7 -7"/>',pS:'<path d="M-9 8Q-6 -9 9 -6M5 -9L9 -6L6 -2"/><circle cx="-9" cy="8" r="1.6"/>',pI:'<path d="M-10 0H10M-10 -5H4M-10 5H4"/>',pW:'<path d="M-9 -7L-2 0L-9 7" stroke-opacity=".35"/><path d="M-4 -7L3 0L-4 7" stroke-opacity=".65"/><path d="M1 -7L8 0L1 7"/>',
eC:'<path d="M0 -10L2 -3L9 -3L3 1L5 9L0 4L-5 9L-3 1L-9 -3L-2 -3Z"/>',eR:'<circle cx="0" cy="-5" r="3.5"/><circle cx="-5" cy="4" r="3.5"/><circle cx="5" cy="4" r="3.5"/>',
cS:'<path d="M-10 6L4 -4"/><path d="M6 -6L7 -8L8 -6L10 -5L8 -4L7 -2L6 -4L4 -5Z"/>',cL:'<rect x="-9" y="-6" width="18" height="12" rx="1.5"/><path d="M-9 -5L0 2L9 -5"/>',cC:'<circle r="7"/><path d="M0 -10V-4M0 4V10M-10 0H-4M4 0H10"/>',cM:'<path d="M0 -10L6 -2L1 0L4 8L-4 2L-1 0L-6 -6Z"/>',
pR:'<path d="M-9 6A9 9 0 0 1 9 6" stroke-opacity=".35"/><path d="M-5 6A5 5 0 0 1 5 6" stroke-opacity=".7"/><circle cy="6" r="1.6"/>',pL:'<path d="M-5 8L1 -9L6 8Z"/><path d="M-10 -5H-6M-10 0H-7M-10 5H-8"/>',eL:'<circle r="3.5"/><path d="M-8 5A9 9 0 0 1 5 -8" stroke-opacity=".55"/><path d="M8 -5A9 9 0 0 1 -5 8" stroke-opacity=".3"/>',eM:'<rect x="-9" y="-5" width="16" height="10" rx="2"/><path d="M7 -2V2"/><rect x="-6.5" y="-2.5" width="6" height="5"/>',
c7:'<path d="M1 -8A8 8 0 1 0 4 6A6 6 0 1 1 1 -8Z"/><circle cx="8" cy="-7" r="1"/><circle cx="10.5" cy="-2" r="1"/><circle cx="8" cy="3" r="1"/>',cG:'<path d="M-7 9V1L0 -5L7 1V9Z"/><path d="M-4 -8A6 6 0 0 1 4 -8M-7 -11A10 10 0 0 1 7 -11" stroke-opacity=".6"/>',a8:'<path d="M0 -9V8M-5 -4H5M-7 3Q0 12 7 3"/>',aM:'<circle cx="-7" cy="5" r="2"/><circle cx="0" cy="-6" r="2"/><circle cx="7" cy="4" r="2"/><path d="M-6 3L-1 -4M1.5 -4.5L6 2"/>',
aR:'<rect x="-9" y="-5" width="14" height="10" rx="2"/><path d="M8 0H12M10 -2L12 0L10 2"/>',aT:'<path d="M-6 -6V6M0 -6V6M6 -6V6M-9 -7H9M-9 7H9"/>',aA:'<path d="M-9 -7L-2 0L-9 7M-2 -7L5 0L-2 7M5 -7V7"/>',cB:'<path d="M-6 -9H6M-6 9H6M-5 -9Q-5 -3 0 0Q5 3 5 9M5 -9Q5 -3 0 0Q-5 3 -5 9"/>',c5:'<path d="M0 0A2 2 0 1 1 2 2A5 5 0 1 1 -5 -2A8 8 0 1 1 6 8M6 8L2 9M6 8L5 4"/>'};
function skIcon(k,x,y,own,av,blocked){const c=BR_COL[k.br],can=av&&S.W>=k.cost,ic=SK_ICON[k.id]||SK_ICON.a;
  if(own)return '<circle cx="'+x+'" cy="'+y+'" r="20" fill="'+rgb(c,0.18)+'"/><circle cx="'+x+'" cy="'+y+'" r="15.5" fill="'+rgb(c,0.92)+'"/><g transform="translate('+x+' '+y+') scale(.8)" fill="none" stroke="#0a0b14" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">'+ic+'</g>';
  if(can)return '<circle class="skPulse" cx="'+x+'" cy="'+y+'" r="19" fill="none" stroke="'+rgb(c,0.9)+'" stroke-width="1.2"/><circle cx="'+x+'" cy="'+y+'" r="15.5" fill="#05060e" stroke="'+rgb(c,1)+'" stroke-width="1.6"/><g transform="translate('+x+' '+y+') scale(.8)" fill="none" stroke="'+rgb(c,1)+'" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">'+ic+'</g>';
  if(av)return '<circle cx="'+x+'" cy="'+y+'" r="15.5" fill="#05060e" stroke="'+rgb(c,0.55)+'" stroke-width="1.2" stroke-dasharray="3 3"/><g transform="translate('+x+' '+y+') scale(.8)" fill="none" stroke="'+rgb(c,0.55)+'" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round">'+ic+'</g>';
  return '<circle cx="'+x+'" cy="'+y+'" r="15.5" fill="#05060e" stroke="rgba(255,255,255,.1)" stroke-width="1"/><g transform="translate('+x+' '+y+') scale(.8)" fill="none" stroke="rgba(150,152,162,.35)" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round">'+ic+'</g>';}
function skUnlit(k,x,y){const can=S.L>=k.glow;return '<circle cx="'+x+'" cy="'+y+'" r="15.5" fill="#05060e" stroke="rgba(255,236,200,'+(can?0.6:0.28)+')" stroke-width="1" stroke-dasharray="1 3"/><circle cx="'+x+'" cy="'+y+'" r="'+(can?2.4:1.6)+'" fill="rgba(255,236,200,'+(can?0.95:0.5)+')"/>';}
function skBg(){const VB=skBBox(),R=Math.hypot(Math.max(Math.abs(VB.x-180),Math.abs(VB.x+VB.w-180)),Math.max(Math.abs(VB.y-176),Math.abs(VB.y+VB.h-176)))+40;let h='<defs>'+BR_COL.map((c,i)=>'<radialGradient id="skg'+i+'"><stop offset="0" stop-color="'+rgb(c,1)+'"/><stop offset="1" stop-color="'+rgb(c,0)+'"/></radialGradient>').join('')+'<radialGradient id="skgc"><stop offset="0" stop-color="rgba(255,240,220,.35)"/><stop offset="1" stop-color="rgba(255,240,220,0)"/></radialGradient></defs>';
  h+='<g pointer-events="none">';SKILLS.filter(skVis).forEach(k=>{const [x,y]=skillPos(k);h+='<circle cx="'+x.toFixed(1)+'" cy="'+y.toFixed(1)+'" r="40" fill="url(#skg'+k.br+')" opacity="'+(has(k.id)?0.3:0.1)+'"/>';});h+='<circle cx="180" cy="176" r="70" fill="url(#skgc)"/>';
  h+='<g fill="none" stroke="#fff"><animateTransform attributeName="transform" type="rotate" from="0 180 176" to="360 180 176" dur="300s" repeatCount="indefinite"/>';for(let r=40;r<R;r+=44)h+='<circle cx="180" cy="176" r="'+r+'" stroke-opacity=".07"/>';for(let k=0;k<12;k++){const an=k*Math.PI/6;h+='<line x1="180" y1="176" x2="'+(180+R*Math.cos(an)).toFixed(0)+'" y2="'+(176+R*Math.sin(an)).toFixed(0)+'" stroke-opacity=".05"/>';}
  for(let k=0;k<72;k++){const an=k*Math.PI/36,r1=R-8,r2=R-(k%6===0?16:12);h+='<line x1="'+(180+r1*Math.cos(an)).toFixed(1)+'" y1="'+(176+r1*Math.sin(an)).toFixed(1)+'" x2="'+(180+r2*Math.cos(an)).toFixed(1)+'" y2="'+(176+r2*Math.sin(an)).toFixed(1)+'" stroke-opacity=".12"/>';}
  h+='</g></g>';return h;}
let skillPick=false,lastTap={id:null,t:0};
function nextSkillAfter(id){const k=SKILLS.find(z=>z.id===id);const nx=SKILLS.filter(z=>z.br===k.br&&z.step===k.step+1&&!has(z.id));if(k.fork){const sib=SKILLS.find(z=>z.br===k.br&&z.step===k.step&&z.id!==k.id&&!has(z.id));if(sib)return sib.id;}return nx.length?nx[0].id:id;}
let PANX=0,PANY=0,PANS=1,skMoved=false;
function skPanT(){return 'translate('+(180+PANX).toFixed(1)+' '+(176+PANY).toFixed(1)+') scale('+PANS.toFixed(3)+') translate(-180 -176)';}
function skPanApply(){const g=document.getElementById('skPan');if(g)g.setAttribute('transform',skPanT());}
function skPanBind(svg){const pts=new Map();let last=null;const unit=()=>skBBox().w/svg.getBoundingClientRect().width;svg.style.touchAction='none';
  svg.addEventListener('pointerdown',e=>{pts.set(e.pointerId,{x:e.clientX,y:e.clientY});skMoved=false;last=null;});
  svg.addEventListener('pointermove',e=>{if(!pts.has(e.pointerId))return;const prev=pts.get(e.pointerId);pts.set(e.pointerId,{x:e.clientX,y:e.clientY});
    if(pts.size===1){const dx=e.clientX-prev.x,dy=e.clientY-prev.y;if(Math.abs(dx)+Math.abs(dy)>0.5){PANX+=dx*unit();PANY+=dy*unit();if(Math.hypot(PANX,PANY)>0)skMoved=skMoved||Math.abs(dx)+Math.abs(dy)>2;}}
    else if(pts.size===2){const [a,b]=[...pts.values()],d=Math.hypot(a.x-b.x,a.y-b.y);if(last)PANS=Math.min(2.6,Math.max(0.7,PANS*d/last));last=d;skMoved=true;}
    PANX=Math.max(-260,Math.min(260,PANX));PANY=Math.max(-260,Math.min(260,PANY));skPanApply();});
  const up=e=>{pts.delete(e.pointerId);if(pts.size<2)last=null;};svg.addEventListener('pointerup',up);svg.addEventListener('pointercancel',up);svg.addEventListener('pointerleave',up);
  svg.addEventListener('wheel',e=>{e.preventDefault();PANS=Math.min(2.6,Math.max(0.7,PANS*Math.exp(-e.deltaY*0.0015)));skPanApply();},{passive:false});
  svg.addEventListener('dblclick',e=>{if(e.target.closest&&e.target.closest('.node'))return;PANX=0;PANY=0;PANS=1;skPanApply();});}
function renderSkill(){const box=document.getElementById('skBody');lastWShown=S.W;document.getElementById('skW').textContent='歪み '+fmt(S.W);
  document.getElementById('skTitle').textContent=skillPick?'新しく覚える星を選ぶ':'覚えているスキル';
  const VB=skBBox();let h='<div id="skMapWrap"><svg id="skMap" preserveAspectRatio="xMidYMid meet" viewBox="'+VB.x.toFixed(1)+' '+VB.y.toFixed(1)+' '+VB.w.toFixed(1)+' '+VB.h.toFixed(1)+'" role="group" aria-label="スキルの星図"><g id="skPan" transform="'+skPanT()+'">'+skBg();
  SKILLS.filter(skVis).forEach(k=>{const [x,y]=skillPos(k),[px,py]=prereqPos(k),c=BR_COL[k.br],own=has(k.id),av=skillAvailable(k);if(k.step===4){SKILLS.filter(z=>z.br===k.br&&z.step===3).forEach(z=>{const [zx,zy]=skillPos(z),o=has(z.id)&&own;h+='<line x1="'+zx+'" y1="'+zy+'" x2="'+x+'" y2="'+y+'" stroke="'+rgb(c,o?0.8:0.22)+'" stroke-width="1" '+(o?'':'stroke-dasharray="2 3"')+'/>';});return;}
    if(k.step===3){const prev=SKILLS.find(z=>z.br===k.br&&z.step===2);const [zx,zy]=skillPos(prev);const o=own;h+='<line x1="'+zx+'" y1="'+zy+'" x2="'+x+'" y2="'+y+'" stroke="'+rgb(c,o?0.8:0.22)+'" stroke-width="1" '+(o?'':'stroke-dasharray="2 3"')+'/>';return;}
    h+='<line x1="'+px+'" y1="'+py+'" x2="'+x+'" y2="'+y+'" stroke="'+(k.glow?(own?'rgba(255,236,200,.55)':'rgba(255,236,200,.14)'):rgb(c,own?0.8:0.22))+'" stroke-width="1" '+(own?'':'stroke-dasharray="'+(k.glow?'1 4':'2 3')+'"')+'/>';});
  h+='<circle cx="180" cy="176" r="14" fill="rgba(255,255,255,.06)"/><circle cx="180" cy="176" r="3" fill="#f6f7fb"/>';
  SKILLS.filter(skVis).forEach(k=>{const [x,y]=skillPos(k),c=BR_COL[k.br],own=has(k.id),av=skillAvailable(k),sel=selSkill===k.id,blocked=false;
    const lx=k.br===0?x+(k.fork? k.fork*17:17):x,anchor=k.br===0?(k.fork===-1?'end':'start'):'middle',ly=k.br===0?y+4:y+22;
    h+='<g class="node" data-id="'+k.id+'" tabindex="0" role="button" aria-label="'+k.name+'">'+(sel?'<circle cx="'+x+'" cy="'+y+'" r="20" fill="none" stroke="'+rgb(c,0.9)+'" stroke-width="1"/>':'')+
     (starLit(k)?skIcon(k,x,y,own,av,blocked):skUnlit(k,x,y))+
     '<circle cx="'+x+'" cy="'+y+'" r="20" fill="transparent"/></g>';});
  {const ks=SKILLS.find(z=>z.id===selSkill);if(ks){const [sx,sy]=skillPos(ks),w=ks.name.length*11.5+16,lx2=Math.max(VB.x+2,Math.min(VB.x+VB.w-2-w,sx-w/2)),ly2=sy+(sy<60?18:-36);h+='<g pointer-events="none"><rect x="'+lx2+'" y="'+ly2+'" width="'+w+'" height="20" rx="10" fill="#05060e" stroke="'+rgb(BR_COL[ks.br],0.6)+'" stroke-width=".8"/><text x="'+(lx2+w/2)+'" y="'+(ly2+14)+'" text-anchor="middle" font-size="11.5" fill="#f6f7fb" font-family="Murecho,sans-serif">'+ks.name+'</text></g>';}}
  h+='</g></svg></div>';
  const k=SKILLS.find(x=>x.id===selSkill)||SKILLS.find(x=>skillAvailable(x))||SKILLS[0];selSkill=k.id;
  const own=has(k.id),av=skillAvailable(k),c=BR_COL[k.br],sib=k.fork&&SKILLS.some(z=>z.br===k.br&&z.step===k.step&&z.id!==k.id&&has(z.id));
  let act='';if(!starLit(k))act='<button class="act" id="skLight"'+(S.L<k.glow?' disabled':'')+'>灯す　残光 '+k.glow+'</button><div class="note">残光で灯すと、周回の最初から効き、再出発しても消えない（残光 '+fmt(S.L)+'）。</div>';else if(own)act='<div class="note">'+(k.glow?'残光で灯した。周回しても消えない。':'習得済み')+'</div>';else if(!skillPick)act='<div class="note">スキルは緊急停止のときに覚えられる。</div>';else if(av)act='<button class="act" id="skBuy"'+(S.W<k.cost?' disabled':'')+'>覚える　歪み '+k.cost+'</button>';else act='<div class="note">'+(sib?'もう一方の道を選んでいる。振り直すと選び直せる。':'手前の星を先に覚える。')+'</div>';
  h+='<div class="skd" style="border-color:'+rgb(c,0.45)+'"><div class="row" style="padding:0"><h3>'+k.name+'</h3><span class="meta">'+BRANCHES[k.br]+(k.fork?' ・ 分岐':' ・ '+(k.step+1)+'段目')+'</span></div><div class="note" style="margin:3px 0 4px;color:var(--ink)">'+k.desc+'</div>'+skillCompare(k)+act+'</div>';
  h+=skillPick?'<div class="duo" style="max-width:640px"><button class="act" id="skRe"'+(S.skills.length?'':' disabled')+'>振り直す</button><button class="act" id="skGo">帆を張る</button></div>':'<div class="note" style="text-align:center;margin:4px 0 0">塗りつぶし＝習得済み　光る輪＝覚えられる　点線＝歪みが足りない　灰色＝まだ先'+(S.lTotal>0?'　小さな光＝残光で灯せる':'')+'</div>';
  box.innerHTML=h;
  const svgEl=document.getElementById('skMap');if(svgEl)skPanBind(svgEl);
  box.querySelectorAll('.node').forEach(n=>{const go=()=>{if(skMoved){skMoved=false;return;}const id=n.dataset.id,now=Date.now();if(skillPick&&lastTap.id===id&&now-lastTap.t<380){buySkill(id);lastTap={id:null,t:0};if(has(id)){selSkill=nextSkillAfter(id);renderSkill();return;}}else lastTap={id,t:now};selSkill=id;renderSkill();};n.addEventListener('click',go);n.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();go();}});});
  const lt=document.getElementById('skLight');if(lt)lt.onclick=()=>{if(lightStar(k.id)){FXQ.milestone=true;renderSkill();}};
  const b=document.getElementById('skBuy');if(b)b.onclick=()=>{buySkill(k.id);if(has(k.id))selSkill=nextSkillAfter(k.id);renderSkill();};
  const re=document.getElementById('skRe');if(re)re.onclick=()=>{S.W+=skillSpent();S.skills=[];NEWSK=[];renderSkill();};
  const g=document.getElementById('skGo');if(g)g.onclick=()=>confirmBox('帆を張る',(S.W>=1?'歪みが '+fmt(S.W)+' 残っている。':'')+'星図を閉じて、出航する。',closeSkill);}
function withSkill(id,f){const had=has(id);if(!had)S.skills.push(id);const v=f();if(!had)S.skills.pop();return v;}
function skillCompare(k){if(has(k.id))return '';const rows=[];const P0=prodRate(),P1=withSkill(k.id,prodRate);if(Math.abs(P1-P0)>P0*1e-6)rows.push(['生産',fmt(P0)+' → '+fmt(P1)+' / 秒']);
  const id=k.id;
  if(id==='p1'||id==='p2'){const n=Math.min(S.stage+1,MAX_STAGE);rows.push(['次の加速',fmt(accelCost(n))+' → '+fmt(withSkill(id,()=>accelCost(n)))]);}
  if(id==='p3')rows.push(['故郷の時間',fmtY(yearsPerSec())+' → '+fmtY(withSkill(id,yearsPerSec))+' 年/秒']);
  if(id==='pA'){rows.push(['加速後60秒の生産',fmt(P0)+' → '+fmt(P0*5)+' / 秒']);}
  if(id==='e2')rows.push(['蓄電の利子',Math.round(batteryRate()*100)+'% → '+Math.round(withSkill(id,batteryRate)*100)+'% / 年']);
  if(id==='e3')rows.push(['蓄電の上限',fmt(batteryCap())+' → '+fmt(withSkill(id,batteryCap))]);
  if(id==='eB')rows.push(['放出の過負荷','×1.0 → ×1.5、30秒 → 45秒']);
  if(id==='aA')rows.push(['加速','手動 → 自動']);else if(id==='pW')rows.push(['加速のたびに','+'+fmt(P0*60)]);else if(id==='cS')rows.push(['流れ星1つ','+'+fmt(P0*300)]);else if(id==='cL')rows.push(['便り1通','+'+fmt(P0*600)]);else if(id==='cC')rows.push(['ため撃ち1回',fmt(tapGain()*20)]);else if(id==='aT')rows.push(['TIER','手動 → 自動']);else if(id==='aM')rows.push(['スキルの覚え方','手動 → 自動']);else if(id[0]==='a'&&id.length===2)rows.push(['購入','手動 → 自動']);
  if(id==='pR')rows.push(['停止のあとの速度',speedText(0)+' → '+speedText(Math.floor(S.stage/2))]);if(id==='eM')rows.push(['停止のあとの蓄電',fmt(0)+' → '+fmt(S.battery/2)]);if(id==='c1'||id==='c3'||id==='c7')rows.push(['放置の上限',(offlineCap()/3600)+'時間 → '+(withSkill(id,offlineCap)/3600)+'時間']);
  if(id==='c2'||id==='cA')rows.push(['タップ1回',fmt(tapGain())+' → '+fmt(withSkill(id,tapGain))]);
  if(id==='cB')rows.push(['時間の錨の効果','−'+Math.round(anchorCut()*100)+'% → −'+Math.round(withSkill(id,anchorCut)*100)+'%']);
  if(id==='c5')rows.push(['停止後に持ち越す','0 → '+fmt(S.peakP*60)]);
  return rows.map(r=>'<div class="row"><span class="note" style="margin:0">'+r[0]+'</span><span class="num">'+r[1]+'</span></div>').join('');}
