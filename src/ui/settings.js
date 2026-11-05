'use strict';
/* =====================================================================
   UI ― 確認・設定
   ===================================================================== */
function confirmBox(title,body,yes){document.getElementById('cTitle').textContent=title;document.getElementById('cBody').textContent=body;const m=document.getElementById('mConfirm');m.classList.add('on');document.getElementById('cYes').onclick=()=>{m.classList.remove('on');yes();};document.getElementById('cNo').onclick=()=>m.classList.remove('on');}
let timeMult=1;
const titleOn=()=>document.getElementById('title').classList.contains('on');
document.getElementById('gear').onclick=()=>{document.getElementById('mSet').classList.add('on');document.getElementById('sEnd').style.display=titleOn()?'none':'';paintSeg();};
let fxLow=false;try{fxLow=localStorage.getItem('hikari_fx')==='1';}catch(e){}
function paintSeg(){document.querySelectorAll('#sndSeg button').forEach(b=>b.setAttribute('aria-pressed',+b.dataset.v===sndVol));document.querySelectorAll('#spdSeg button').forEach(b=>b.setAttribute('aria-pressed',+b.dataset.m===timeMult));document.querySelectorAll('#fxSeg button').forEach(b=>b.setAttribute('aria-pressed',(b.dataset.f==='1')===fxLow));document.querySelectorAll('#numSeg button').forEach(b=>b.setAttribute('aria-pressed',(b.dataset.n==='1')===numKanji));}
document.querySelectorAll('#numSeg button').forEach(b=>b.onclick=()=>{numKanji=b.dataset.n==='1';try{localStorage.setItem('hikari_num',numKanji?'1':'0');}catch(e){}lastUnit=unitIndex(S.E);paintSeg();renderPanel(true);});
document.querySelectorAll('#fxSeg button').forEach(b=>b.onclick=()=>{fxLow=b.dataset.f==='1';try{localStorage.setItem('hikari_fx',fxLow?'1':'0');}catch(e){}paintSeg();});
let sndVol=0.7;try{const v=localStorage.getItem('hikari_snd');if(v!=null)sndVol=+v;}catch(e){}SND.setVolume(sndVol);
document.querySelectorAll('#sndSeg button').forEach(b=>b.onclick=()=>{sndVol=+b.dataset.v;SND.unlock();SND.setVolume(sndVol);try{localStorage.setItem('hikari_snd',String(sndVol));}catch(e){}paintSeg();SND.play('milestone');});
document.querySelectorAll('#spdSeg button').forEach(b=>b.onclick=()=>{timeMult=+b.dataset.m;paintSeg();});
document.getElementById('sClose').onclick=()=>document.getElementById('mSet').classList.remove('on');
document.getElementById('sExp').onclick=()=>{const t=document.getElementById('saveTxt');t.value=exportSave();t.select();try{navigator.clipboard.writeText(t.value);toast('セーブを書き出して、コピーした');}catch(e){toast('セーブを書き出した');}};
document.getElementById('sImp').onclick=()=>{try{if(titleOn())document.getElementById('tBack').onclick();importSave(document.getElementById('saveTxt').value);applyLoadedVisuals();save();renderPanel(true);toast('セーブを読み込んだ');document.getElementById('mSet').classList.remove('on');}catch(e){toast('読み込めなかった。書き出した文字列をそのまま貼り付けてください');}};
document.getElementById('sReset').onclick=()=>confirmBox('最初からやり直す','すべての進行が消える。',()=>{if(titleOn())document.getElementById('tBack').onclick();S=freshState();applyLoadedVisuals();save();document.getElementById('mSet').classList.remove('on');renderPanel(true);prologue();});
