'use strict';
/* =====================================================================
   遊び方（2026-11-27、「ゲーム全体として少しわかりづらい」）
   A：仕組みにはじめて出会ったときの一行（hud.js の firstHint を足す。1秒ごとに guideTick() が見る）
   C：ETC の GUIDE タブ。いま開いている仕組みだけを短く並べる（まだ出会っていないものは出さない）
   ===================================================================== */
const gPos=(sel,side)=>()=>{const e=typeof sel==='function'?sel():document.querySelector(sel);if(!e||!e.offsetWidth)return null;const r=e.getBoundingClientRect();return {x:r.left+r.width/2,y:side==='up'?r.top:r.bottom,maxR:innerWidth-12,L:side==='up'?58:34};};   // 下の段（層）を指すときは、上の段のタブに文字が重ならないよう線を長く
const gTab=(t,l)=>()=>document.querySelector('#tabs [data-t="'+t+'"]')&&curLayer===l?document.querySelector('#tabs [data-t="'+t+'"]'):document.querySelector('#tabs [data-l="'+l+'"]');
const early=()=>!S.voy&&S.restarts===0&&!S.chal;   // はじめの周回だけ（もう先へ進んでいる人には出さない）
const HINTS=[
  {id:'gDev',when:()=>early()&&S.dev[0]>=1,text:'装置は、触れていなくてもエネルギーを生み続ける',pos:gPos('#rate','down'),side:'down'},
  {id:'gGuide',when:()=>S.flags.start&&(S.dev[0]>=1||S.restarts>0||S.voy),text:'遊び方は、ETC の GUIDE でいつでも読める',pos:gPos(()=>document.querySelector('#tabs [data-l="etc"]'),'up'),side:'up'},
  {id:'gAcc',when:()=>early()&&S.maxStage>=1,text:'光の速さに近づくほど、生産は大きく増える',pos:gPos('#hV','down'),side:'down'},
  {id:'gYear',when:()=>early()&&S.years>=0.3,text:'故郷で過ぎた年月。速く進むほど、故郷の時間は速く流れる',pos:gPos('#yr','down'),side:'down'},
  {id:'gColor',when:()=>early()&&S.lost>=1&&S.flags.why,text:'失った色は、故郷に着けば戻る',pos:gPos('#cons','down'),side:'down'},
  {id:'gDil',when:()=>early()&&S.maxStage>=DILATION_STAGE,text:'時間の進み：船の1秒のあいだに、故郷で過ぎる時間。その分だけ生産も増える',pos:gPos('#spdG','down'),side:'down'},
  {id:'gStop',when:()=>early()&&S.prestiges===0&&S.maxStage>=BRAKE_STAGE&&wGain()>=5,text:'緊急停止：速さは0に戻るが、歪みを得て、星図で船を強くできる',pos:gPos(gTab('reset','home'),'up'),side:'up'},
  {id:'gArrive',when:()=>!S.voy&&S.cleared&&S.restarts===0,text:'もう一度船を出すと、集めた記憶で船を強くできる。色はまた失っていく',pos:gPos(gTab('restart','star'),'up'),side:'up'},
  {id:'gChal',when:()=>!S.voy&&!S.chal&&!(S.lit||[]).length&&arrivals()>=CHAL_GATE,text:'CHALLENGE：縛りの中で故郷に着くと、上位の星が灯る',pos:gPos(gTab('stars','star'),'up'),side:'up'}];
let gLast=0;
function guideTick(){if(HINT||climax||FOLD||BRK||RST||Date.now()-gLast<6000)return;
  for(const h of HINTS){if(S.flags['h_'+h.id]||!h.when())continue;if(firstHint(h.id,h.text,h.pos,h.side))gLast=Date.now();return;}}
// C：GUIDE タブ。[見出し, 出す条件, [[項目, 説明], …]]
function guideSecs(){const sw=S.restarts>0||S.voy||S.cleared,st=S.maxStage||0;return [
  ['目的',true,[['ゴール','故郷まで、1万光年を帰る'],['方法','エネルギーを集めて加速し、光の速さに近づく'],['迷ったら','窓の上の「目標」の一行と、光っているタブを見る']]],
  ['エネルギー',true,[['窓に触れる','エネルギーが少し入る'],['DRIVE','装置を買うと、触れていなくてもエネルギーを生み続ける'],['TIER','装置のカードを右へスワイプすると、その装置が強くなる']]],
  ['加速',st>=1||sw,[['BOOST','エネルギーを使って、一段ずつ加速する'],['速さ','光の速さに近いほど船の時間が遅れ、生産が大きく増える'],['時間の進み','船の1秒のあいだに、故郷で過ぎる時間']]],
  ['故郷の時間と色',S.years>0||sw,[['年月','速く進むほど、故郷の時間は速く流れる'],['色','故郷で年月が過ぎるほど、記憶の色をひとつずつ失う'],['戻る','故郷に着けば、色はすべて戻る']]],
  ['流れ星',!!S.flags.bat,[['流れ星','窓を横切る流れ星に触れて捕まえると、器にたまる'],['METEOR','器がたまったら流星群を呼ぶ。なぞって捕まえるほど多く入る']]],
  ['緊急停止',st>=BRAKE_STAGE||S.prestiges>0||sw,[['STOP','速さとエネルギーを0に戻して、歪みを得る'],['歪み','星図でスキルを覚える。使わずに持っていても生産が増える'],['止めどき','加速が伸びなくなってきたら']]],
  ['追い風',!!(S.flags.h_wind||S.windT>0),[['追い風','留守の間に集めた分の一部が、戻ったあとの生産 ×'+WIND_X+' になる']]],
  ['再出発',sw,[['着くと','記憶（MEMORY）を得る'],['RESTART','もう一度、遠い宙域から船を出す。記憶で船を強くできる'],['色','また失っていくが、着くたびに戻る']]],
  ['チャレンジ',S.restarts>0||S.voy||(S.lit||[]).length>0,[['CHALLENGE','縛りの中で故郷に着く'],['越えると','上位の星が灯る。8つ灯すと、さらに遠くへ行ける']]],
  ['航海',!!S.voy,[['航海','故郷を越えて、宇宙の果てへ。止まらずに進む'],['目的地','着くたびに、新しい色と装置が見つかる'],['記憶','進んだ距離が2倍になるたびに入る'],['PHOTON','光子の装置で光子を集め、SAIL で帆を張る'],['分かれ道','宙域の境目で、次の道を VOYAGE で選べる'],['引き直す','故郷からやり直して、航跡を得る。航跡で船を強くする']]],
  ['宇宙',S.uni>0||(S.voy&&canFold()),[['畳む','宇宙の果てに着いたら、UNIVERSE で宇宙を畳む'],['時の流れ','次の宇宙の性格を、3つの中から選ぶ'],['公理','畳むと得る。LAWS の式の項を書き換える'],['超える','式の項をすべて最後の段にすると、その法則を超えられる']]]];}
function renderGuide(){pbody.dataset.k='';let h='<div class="phead"><span class="lab">GUIDE</span><span class="note" style="margin:0">遊び方</span></div>';
  for(const [t,on,rows] of guideSecs()){if(!on)continue;h+='<div class="gSec">'+t+'</div><div class="vGuide">'+rows.map(r=>'<span>'+r[0]+'</span><b>'+r[1]+'</b>').join('')+'</div>';}
  h+='<div class="note" style="margin-top:14px">新しい仕組みに出会うと、ここに加わる。</div>';pbody.innerHTML=h;}
