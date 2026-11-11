'use strict';
/* =====================================================================
   ⑤ 光になる（一度きりの終わり）
   光の近さを書き換えきり、9が22個まで届くと LIGHT 層が開く。「光になる」で最後の加速。
   星が止まり、数字・タブ・リング・窓の枠が光の粒になって一つずつほどけ、暗闇に白い点ひとつと一文。
   タップで画面が戻り、④の続きを遊べる。窓の中心には小さな白い光がずっと残る。
   ===================================================================== */
function canLight(){return S.voy&&law('lc')>=LAWS.find(L=>L.id==='lc').max&&S.stage>=maxStage();}
function lightCost(){return accelCost(maxStage()+1);}
function becomeLight(){if(!canLight()||S.E<lightCost())return false;S.E-=lightCost();S.lightDone=true;S.lightAt=Date.now();S.lightUni=S.uni+1;save();return true;}
/* LIGHT タブ：光速を示す縦の線へ、光の線が伸びる。その手前に、いまの船 */
function renderLight(){const done=S.lightDone,ready=canLight(),c=lightCost(),key='l|'+[done,ready,S.E>=c,S.stage,law('lc')].join('|');if(pbody.dataset.k===key)return;pbody.dataset.k=key;
  const W=360,H=170,y=82,xc=300,n=Math.min(S.uni+1,14),prog=done?1:Math.min(1,S.stage/maxStage());
  let v='<svg class="uniSky" viewBox="0 0 '+W+' '+H+'" aria-label="光速への線"><defs><linearGradient id="lgl" x1="0" x2="1"><stop offset="0" stop-color="#fff" stop-opacity="0"/><stop offset=".85" stop-color="#fff" stop-opacity=".55"/><stop offset="1" stop-color="#fff" stop-opacity=".9"/></linearGradient><radialGradient id="lgg"><stop offset="0" stop-color="#fff" stop-opacity=".45"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></radialGradient></defs>'+
    '<line x1="20" y1="'+y+'" x2="'+xc+'" y2="'+y+'" stroke="url(#lgl)" stroke-width=".8"/>'+
    '<circle cx="'+xc+'" cy="'+y+'" r="38" fill="url(#lgg)"/><line x1="'+xc+'" y1="'+(y-36)+'" x2="'+xc+'" y2="'+(y+36)+'" stroke="#fff" stroke-opacity=".9" stroke-width="1"/>'+
    '<text x="'+xc+'" y="'+(y-44)+'" text-anchor="middle" font-size="14" font-style="italic" font-family="serif" fill="rgba(255,255,255,.8)">c</text>';
  for(let i=0;i<n;i++){const t=UNI_TINT[(i===S.uni?S.uTint:(S.uHist[i]?S.uHist[i].tint:i))%UNI_TINT.length];v+='<circle cx="'+(40+i*(220/Math.max(1,n-1||1))).toFixed(1)+'" cy="'+y+'" r="1.2" fill="'+rgb(t.a,0.7)+'"/>';}
  const sx=done?xc:40+(xc-52)*prog;
  v+='<circle cx="'+sx.toFixed(1)+'" cy="'+y+'" r="9" fill="'+(done?'rgba(255,255,255,.5)':'rgba(255,236,210,.35)')+'"/><circle cx="'+sx.toFixed(1)+'" cy="'+y+'" r="2" fill="#fff"/>'+
    '<text x="'+sx.toFixed(1)+'" y="'+(y+24)+'" text-anchor="'+(sx>250?'end':'middle')+'" font-size="10" fill="rgba(236,238,242,.45)">'+(done?'光になった':'いまの船')+'</text></svg>';
  let d;
  if(done){const dt=new Date(S.lightAt||Date.now());d='<div class="row" style="padding:0"><span style="font-size:14px">光になった</span></div><div class="note" style="margin:4px 0 10px">'+dt.getFullYear()+'年'+(dt.getMonth()+1)+'月'+dt.getDate()+'日、宇宙 '+roman(S.lightUni||S.uni+1)+'で。<br>旅は、まだ続けられる。窓の中心の光は、そのとき追いついた光。</div><button class="act" id="ltAgain">もう一度見る</button>';}
  else{d='<div class="row" style="padding:0"><span style="font-size:14px">光になる</span></div><div class="note" style="margin:4px 0 10px">最後の加速。光の速さに届くと、船の時間は止まる。一度きり。そのあとも、宇宙を畳む旅は続けられる。'+
      (ready?'':'<br>9を22個並べると、最後の加速ができる。')+'</div><button class="act" id="ltGo"'+(ready&&S.E>=c?'':' disabled')+' style="border-color:rgba(255,255,255,.7);color:#fff;letter-spacing:.2em;box-shadow:0 0 18px rgba(255,255,255,.12)">光になる'+(ready&&S.E<c?'　あと'+fmt(c-S.E):'')+'</button>';}
  pbody.innerHTML='<div class="phead"><span class="lab">LIGHT</span><span class="num" style="font-size:12px;color:var(--ink-dim)">9 × '+nines(S.stage)+'</span></div>'+v+'<div class="gDet">'+d+'</div>';
  const go=document.getElementById('ltGo');if(go)go.onclick=()=>confirmBox('光になる','最後の加速。一度きり。終わったあとも、宇宙を畳む旅は続けられる。',()=>{if(becomeLight())startLightEnd(false);});
  const ag=document.getElementById('ltAgain');if(ag)ag.onclick=()=>startLightEnd(true);}
/* 終わりの場面 */
let LIGHTFX=null;
const LFX_CV=document.createElement('canvas');LFX_CV.id='lightFx';LFX_CV.setAttribute('aria-hidden','true');document.body.appendChild(LFX_CV);const lfx=LFX_CV.getContext('2d');
const LFX_HIDE=['#tabs','#pbody','#goal','#sub','#toasts','#route','#hudL','#cons','#hudR','#pset','#ringWrap','#frame'];
// ほどける順番（フレーム）と、粒を出す部品
const LFX_STEPS=[[120,['#tabs button'],'#tabs'],[165,['#pbody > *'],'#pbody'],[215,['#goal','#sub'],null],[250,['#route'],'#route'],[290,['#hudL > *','#cons','#hudR > *'],null],[345,['#ringWrap'],'#ringWrap'],[400,['#frame'],'#frame']];
function startLightEnd(replay){if(LIGHTFX)return;const w=innerWidth,h=innerHeight;LFX_CV.width=Math.round(w*DPR);LFX_CV.height=Math.round(h*DPR);lfx.setTransform(DPR,0,0,DPR,0,0);
  LIGHTFX={t:0,P:[],replay,w,h,canTap:false,closing:0};SND.play('lightEnd');document.getElementById('block').style.display='block';LFX_CV.style.display='block';LFX_CV.style.pointerEvents='none';
  if(typeof skillOpen!=='undefined'&&skillOpen)closeSkill();}
function lfxSpawn(sel){document.querySelectorAll(sel).forEach(el=>{const r=el.getBoundingClientRect();if(r.width<2||r.height<2||getComputedStyle(el).opacity==='0')return;
  const frame=sel==='#frame',n=frame?420:Math.max(24,Math.min(380,Math.round(r.width*r.height/70)));
  for(let i=0;i<n;i++){let x,y;if(frame){const e=Math.floor(Math.random()*4),u=Math.random();x=e===0?r.left+u*r.width:e===1?r.right:e===2?r.left+u*r.width:r.left;y=e===0?r.top:e===1?r.top+u*r.height:e===2?r.bottom:r.top+u*r.height;}else{x=r.left+Math.random()*r.width;y=r.top+Math.random()*r.height;}
    LIGHTFX.P.push({x,y,vx:(Math.random()-0.5)*0.5,vy:-0.15-Math.random()*0.55,a:0.35+Math.random()*0.6,l:0,L:110+Math.random()*120,s:0.5+Math.random()*0.9});}});}
function lfxHide(sel){const el=document.querySelector(sel);if(el){el.style.transition='opacity .7s';el.style.opacity='0';}}
function drawLightEnd(){const f=LIGHTFX;if(!f)return;f.t++;const t=f.t,X=RC.x||f.w/2,Y=RC.y||f.h/2;lfx.clearRect(0,0,f.w,f.h);
  if(f.closing){f.closing++;const k=f.closing/120;lfx.globalAlpha=1-k;lfx.fillStyle='#020308';lfx.fillRect(0,0,f.w,f.h);lfx.globalAlpha=1;
    if(f.closing===2){LFX_HIDE.forEach(s=>{const el=document.querySelector(s);if(el){el.style.transition='opacity 2s';el.style.opacity='';}});STILL=false;SPDF=1;}
    if(f.closing>=120){LIGHTFX=null;LFX_CV.style.display='none';document.getElementById('block').style.display='none';LFX_HIDE.forEach(s=>{const el=document.querySelector(s);if(el)el.style.transition='';});renderPanel(true);paintGoal();}return;}
  // 最後の加速 → 星が止まる
  if(t<60){SPDF=1+5*t/60;stk=60;if(t===1)fla=Math.max(fla,0.3);}
  if(t===60){SPDF=0;STILL=true;stk=0;}
  for(const [at,sels,hide] of LFX_STEPS)if(t===at){sels.forEach(lfxSpawn);if(hide)lfxHide(hide);else sels.forEach(lfxHide);}
  // 窓の外の星も暗闇に沈む
  const dark=cl((t-400)/130);if(dark>0){lfx.fillStyle='rgba(2,3,8,'+dark.toFixed(3)+')';lfx.fillRect(0,0,f.w,f.h);}
  for(let i=f.P.length-1;i>=0;i--){const p=f.P[i];p.l++;p.x+=p.vx;p.y+=p.vy;p.vy*=0.995;const a=p.a*(1-p.l/p.L);if(a<=0){f.P.splice(i,1);continue;}lfx.fillStyle='rgba(255,250,240,'+a.toFixed(3)+')';lfx.beginPath();lfx.arc(p.x,p.y,p.s,0,6.283);lfx.fill();}
  // 白い点ひとつと、一文
  if(t>470){const k=cl((t-470)/90),g=lfx.createRadialGradient(X,Y,0,X,Y,24);g.addColorStop(0,'rgba(255,255,255,'+(0.5*k).toFixed(3)+')');g.addColorStop(1,'rgba(255,255,255,0)');lfx.fillStyle=g;lfx.fillRect(X-24,Y-24,48,48);lfx.fillStyle='rgba(255,255,255,'+k.toFixed(3)+')';lfx.beginPath();lfx.arc(X,Y,1.9,0,6.283);lfx.fill();}
  if(t>600){const k=cl((t-600)/150);lfx.save();lfx.font='400 16px "Shippori Mincho B1",serif';lfx.textAlign='center';lfx.fillStyle='rgba(236,238,242,'+(0.85*k).toFixed(3)+')';if(lfx.letterSpacing!==undefined)lfx.letterSpacing='0.16em';lfx.fillText(LINES.light,X,Y+70);lfx.restore();}
  if(t===600&&!f.replay)S.log.push({y:Math.floor(S.years),t:LINES.light,c:-1});
  if(t===840){f.canTap=true;LFX_CV.style.pointerEvents='auto';}}
LFX_CV.addEventListener('pointerup',()=>{if(LIGHTFX&&LIGHTFX.canTap&&!LIGHTFX.closing){LIGHTFX.closing=1;LFX_CV.style.pointerEvents='none';}});
/* 光になったあと：窓の中心に、小さな白い光が残る */
function drawLightMark(){if(!S.lightDone||LANDED||HOMEA||LIGHTFX)return;const X=RC.x,Y=RC.y;if(!X)return;blob(X,Y,30*(RCS||1),[255,252,245],0.5+0.08*Math.sin(T*0.03));cx.beginPath();cx.arc(X,Y,2,0,6.283);cx.fillStyle='rgba(255,255,255,.95)';cx.fill();}
