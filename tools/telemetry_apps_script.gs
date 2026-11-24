/** @OnlyCurrentDoc */   // このスプレッドシートだけを読み書きする（権限の確認が「すべてのスプレッドシート」ではなく、このファイルだけになる）
// 遊んでいる人の進み具合を受け取る Google Apps Script（2026-11-24）
// 使い方：Google スプレッドシートを新しく作る → 拡張機能 → Apps Script → このファイルの中身を全部貼り付けて保存 →
//         デプロイ → 新しいデプロイ → 種類「ウェブアプリ」、実行するユーザー「自分」、アクセスできるユーザー「全員」→ デプロイ →
//         出てきた URL（https://script.google.com/macros/s/…/exec）を src/data.js の TELEMETRY_URL に入れる
// シート：log（届いたものを1行ずつ）・latest（1人1行、いちばん新しい進み具合）・saves（1人1行、いちばん新しいセーブ。消えたときの控え）
const COLS=['受信','id','呼び名','版','きっかけ','遊び始めて(日)','遊んだ時間(時間)','章','故郷に着いた回数','9の数','9の最高','距離(光年)','見つけた色','灯した星','チャレンジの段','引き直し','宇宙','実績','光になった'];
function sheet_(ss,name,head){let sh=ss.getSheetByName(name);if(!sh){sh=ss.insertSheet(name);if(head)sh.appendRow(head);sh.setFrozenRows(1);}return sh;}
function upsert_(sh,id,row){const n=sh.getLastRow();if(n>=2){const ids=sh.getRange(2,2,n-1,1).getValues();for(let i=0;i<ids.length;i++)if(ids[i][0]===id){sh.getRange(i+2,1,1,row.length).setValues([row]);return;}}sh.appendRow(row);}
function doPost(e){
  const lock=LockService.getScriptLock();lock.waitLock(10000);
  try{
    const d=JSON.parse(e.postData.contents);if(!d||!d.id)return ContentService.createTextOutput('ng');
    const ss=SpreadsheetApp.getActiveSpreadsheet(),now=new Date();
    const row=[now,d.id,d.name||'',d.ver||'',d.why||'',d.days,d.play,d.ch,d.loops,d.n9,d.best9,d.dist,d.found,d.lit,d.chal,d.redraws,d.uni,d.ach,d.light?'はい':''];
    sheet_(ss,'log',COLS).appendRow(row);
    upsert_(sheet_(ss,'latest',COLS),d.id,row);
    if(d.save){const parts=[];for(let i=0;i<d.save.length;i+=45000)parts.push(d.save.slice(i,i+45000));upsert_(sheet_(ss,'saves',['受信','id','呼び名','セーブ（書き出しと同じ形。長いときは右の列へ続く）']),d.id,[now,d.id,d.name||''].concat(parts));}
    return ContentService.createTextOutput('ok');
  }finally{lock.releaseLock();}
}
