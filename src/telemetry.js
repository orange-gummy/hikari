// 進み具合を作者のスプレッドシートへ送る（2026-11-24。遊ぶ人には作者が了承をとっている。受け口は tools/telemetry_apps_script.gs）
// 送るのは進み具合とセーブ（書き出しと同じ形。消えたときの控え）。名前や端末の情報は送らない。ID は端末ごとのでたらめな文字列（設定の版の横に出す）
let TELEMETRY_URL=/^(localhost|127\.0\.0\.1)$/.test(location.hostname)?'':'https://script.google.com/macros/s/AKfycbwNIcDl53RaHRP2AHjDDbAUCXNLAKGU8VVHADOncF0gL5ghetihjmc8qxZMUkJdaqGT7A/exec';   // ウェブアプリとして公開した URL（https://script.google.com/macros/s/…/exec）。空なら送らない
let TEL_ID='';try{TEL_ID=localStorage.getItem('hikari_tid')||'';if(!TEL_ID){TEL_ID=Math.random().toString(36).slice(2,7)+Date.now().toString(36).slice(-3);localStorage.setItem('hikari_tid',TEL_ID);}}catch(e){TEL_ID='x'+Math.random().toString(36).slice(2,8);}
let telLast=0,telKey='',telTimer=null;
function telChapter(){return S.lightDone?5:S.uni>0?4:(S.voy||S.voyStash||S.found>0)?3:(S.restarts>0||S.cleared)?2:1;}
function telBody(why,raw){const r=v=>Math.round(v*100)/100,st=S.st||{};return JSON.stringify({id:TEL_ID,ver:VERSION,why,days:r((Date.now()-(st.since||Date.now()))/864e5),play:r((st.play||0)/3600),ch:telChapter(),loops:arrivals(),n9:nines(S.stage),best9:nines(S.maxStage),
  dist:Number(((S.voy?S.vdist:S.dist)||0).toPrecision(4)),found:S.found||0,lit:(S.lit||[]).length,chal:JSON.stringify(S.chalTier||{}),redraws:st.redraws||0,uni:S.uni||0,ach:(S.ach||[]).length,light:!!S.lightDone,save:raw!=null?raw:exportSave()});}
function telSend(why,raw){if(!TELEMETRY_URL)return;telLast=Date.now();let body;try{body=telBody(why,raw);}catch(e){return;}
  try{fetch(TELEMETRY_URL,{method:'POST',mode:'no-cors',keepalive:body.length<60000,headers:{'Content-Type':'text/plain;charset=utf-8'},body}).catch(()=>{});}catch(e){}}
function telMark(){return [arrivals(),(S.lit||[]).length,JSON.stringify(S.chalTier||{}),!!S.voy,S.found,S.uni,!!S.lightDone].join('|');}
// main.js から1秒ごと：開いたとき・節目（着いた・チャレンジ・航海・目的地・宇宙・光）・30分ごとに送る
let telBadShown=false;
function telTick(){if(bootOn)return;if(SAVE_BAD&&!telBadShown){telBadShown=true;toast('セーブを読み込めなかった。元のデータは残してあり、上書きしない。');}if(!TELEMETRY_URL)return;if(!telLast){telKey=telMark();telSend(SAVE_BAD?'broken':'open',SAVE_BAD?SAVE_RAW:null);return;}
  const k=telMark();if(k!==telKey&&!telTimer)telTimer=setTimeout(()=>{telTimer=null;telSend('milestone');},5000);telKey=k;if(Date.now()-telLast>30*60e3)telSend('30min');}
document.addEventListener('visibilitychange',()=>{if(document.hidden&&telLast&&!bootOn&&Date.now()-telLast>60e3)telSend('hide');});
