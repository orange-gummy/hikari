// 自動プレイでバランスを試算するツール
// 使い方: node tools/balance_bot.js              （ずっと画面を触り続けたとして、最初から故郷到着までを1秒刻みで回す）
//         node tools/balance_bot.js --loops 3    （故郷に着いたら再出発して、さらに3周する。残光は安い順に使う）
//         node tools/balance_bot.js --days A     （放置込みで1週間。A＝1日3回×15分（8時・13時・21時）、B＝1日1回×30分（21時）。
//                                                   遊んでいない間は放置の上限まで進む。着いたらすぐ再出発する）
//         --week 10 で日数を変えられる（既定は7日）。上位の星が8つ灯ったあと着くと、③の航海に出る
const fs=require('fs'),path=require('path');
const CORE_FILES=['data','state','economy','story'];
let core=CORE_FILES.map(f=>fs.readFileSync(path.join(__dirname,'..','src',f+'.js'),'utf8')).join('\n');
core=core.replace("if(typeof skillPick!=='undefined'&&!skillPick)return;","");
const argv=process.argv,arg=k=>{const i=argv.indexOf(k);return i>0?argv[i+1]:null;};
const LOOPS=+(arg('--loops')||0),DAYS=arg('--days'),WEEK=+(arg('--week')||7);
const SCHED={A:[[8,15],[13,15],[21,15]],B:[[21,30]],C:[[8,60],[13,60],[21,60]]};
if(DAYS&&!SCHED[DAYS]){console.error('--days は A・B・C');process.exit(1);}

// 経済側が呼ぶ演出の関数を空にしておく。LOSES は色を失った時刻
const stub=`var localStorage={getItem:()=>null,setItem:()=>{}};var curTab='x';function subtitle(){} function renderPanel(){}
var t=0;var LOSES=[];function queueVisual(f){LOSES.push(stamp());}var done=false;var climax=false,BRK=null;function startClimax(){done=true;}
`;

const loop=`
const DAYS=${JSON.stringify(DAYS)},LOOPS=${LOOPS},WEEK=${WEEK},SCHED=${JSON.stringify(SCHED)};
function stamp(){return DAYS?(t/86400).toFixed(2):(t/60).toFixed(1);}   // 日数モードは日、ふだんは分
const LOG=[],RLOG=[];
const PATH=['p1','e1','c1','p2','e2','c2','p3','e3','c3','pB','pA','eA','eB','cB','cA','p5','e5','c5','pS','eC','cL','pI','eR','cM','pW'];
function best(){let b=null;const nxt=S.stage<maxStage()?accelCost(S.stage+1):1e300;for(const i of PRODI){if(!devOpen(i)||chalBlocksDevice(i))continue;const c=devCost(i,1);if(c>S.E||c>0.12*nxt)continue;const P0=prodRate();S.dev[i]++;const P1=prodRate();S.dev[i]--;const r=(P1-P0)/c;if(!b||r>b.r)b={i,r};}return b;}
let lastP=0;
// 画面を触っている1秒
function act(){
  tick(1);const P=prodRate();if(S.chal!=='c7'&&(P<2000||t%10<3)){S.E+=tapGain()*2;S.Erun+=tapGain()*2;S.pulse=10;}
  checkStory();chalWatch();if(t%5===0)achCheck();
  let g=true;while(g){g=false;
    if(S.stage<maxStage()&&S.E>=accelCost(S.stage+1)){accelerate();LOG.push([stamp(),'st',S.stage,Math.round(S.years)]);g=true;continue;}
    const nxt=S.stage<maxStage()?accelCost(S.stage+1):1e300;
    for(const i of PRODI){const n=tierNext(i);if(n&&S.dev[i]>=n.need&&S.E>=n.cost&&n.cost<0.2*nxt){tierUp(i);g=true;}}
    const b=best();if(b){const k=DAYS?Math.floor(devMax(b.i)/4):0;if(k>1){const n0=S.dev[b.i];S.E-=devCost(b.i,k);S.dev[b.i]+=k;if(MILESTONES.some(x=>n0<x&&S.dev[b.i]>=x))onMilestone();}else buyDevice(b.i,'1');g=true;}}  // 日数モードは放置で溜まった分をまとめて買う
  if(S.voy){if(voyStopReady()&&t-lastP>20){LOG.push([stamp(),'prest',wGain()]);prestige(false);lastP=t;}return;}   // ③では自動の停止とスキル選び
  const w=wGain();if(S.stage>=BRAKE_STAGE&&w>=Math.max(5,1.6*(S.W+skillSpent()))&&t-lastP>90){prestige(false);lastP=t;LOG.push([stamp(),'prest',w]);for(const id of PATH)buySkill(id);}
}
// 放置（ゲームの offline() と同じく、上限までを200刻みで進める）
function idle(sec){if(sec<30||done)return;const tt=Math.min(sec,offlineCap()),mul=has('cB')?2:1;for(let k=0;k<200&&!done;k++){tick(tt/200,mul);checkStory();chalWatch();achCheck();}}
// 着いたら再出発し、残光を安い順に強化と星に使う
let loopStart=0;
function pri(x){return x[1].cost*(x[0]==='rm'?0.4:1);}   // 航路の記憶を優先
function arrive(){
  RLOG.push('周'+(S.restarts+1)+' '+(DAYS?((t-loopStart)/3600).toFixed(1)+'時間（'+(t/86400).toFixed(2)+'日目に到着）':((t-loopStart)/60).toFixed(1)+'分')+' 停止'+S.prestiges+' 色 '+LOSES.join(' '));
  LOSES.length=0;S.cleared=true;done=false;lastP=t;loopStart=t;
  if(canVoyage()){startVoyage();voyDay=(t/86400).toFixed(2)+'日目';}else rebirth();
  spendL();
  // 上位の星はチャレンジで灯す：まだ灯っていない星があれば、再出発の代わりに挑む
  if(!S.voy){const id=CHAL_ORDER.find(k=>!S.lit.includes(k));if(id&&startChallenge(id)){CLOG.push(CHAL[id].name+' '+(t/86400).toFixed(2)+'日目〜');chalT=t;}}
}
const CHAL_ORDER=Object.keys(CHAL),CLOG=[];let chalT=0;
function chalWatch(){if(chalT&&!S.chal){if(process.env.DBG)console.log('DBG chal done',CLOG[CLOG.length-1],'loopTime',S.loopTime,'maxStage',S.maxStage,'t',t);CLOG[CLOG.length-1]+=(S.loopTime/3600).toFixed(1)+'時間';chalT=0;if(S.lit.length>=8&&!litDay)litDay=(t/86400).toFixed(2)+'日目';}}
function spendL(){
  let b=true;while(b){b=false;const c=AFTERGLOW.map(a=>[a.id,glowNext(a.id)]).filter(x=>x[1]&&x[1].cost<=S.L).sort((x,y)=>pri(x)-pri(y));if(c.length){buyGlow(c[0][0]);b=true;}}
  if(S.lit.length>=8&&!litDay)litDay=(t/86400).toFixed(2)+'日目';
}
let litDay=null,voyDay=null;const FOUND=[],REDRAW=[];
// ③：残光と航跡を使い、航跡が今までの合計以上たまるなら航路を引き直す
// ④：宇宙の果てに着いてから FOLD_H 時間たったら宇宙を畳み、法則を安い順に（光の上限と時の遅れを先に）使う
const FOLD_H=+(process.env.FOLD_H||8),ULOG=[];let endAt=null,lcDay=null;
function uniManage(){if(!canFold()){endAt=null;return;}if(endAt==null)endAt=t;
  if(t-endAt>=FOLD_H*(DAYS?3600:60)){const g=fold();ULOG.push('宇宙'+(S.uni+1)+'へ '+(t/86400).toFixed(2)+'日目 +'+g);endAt=null;lastP=t;
    let b=true;while(b){b=false;const c=LAWS.map(a=>[a.id,lawNext(a.id)]).filter(x=>x[1]&&x[1].cost<=S.U).sort((x,y)=>x[1].cost*(x[0]==='ut'?3:x[0]==='ar'?0.6:1)-y[1].cost*(y[0]==='ut'?3:y[0]==='ar'?0.6:1));if(c.length){buyLaw(c[0][0]);b=true;}}
    if(law('lc')>=10&&!lcDay)lcDay=(t/86400).toFixed(2)+'日目';}
  }
let lightDay=null;function lightWatch(){if(!lightDay&&law('lc')>=10&&S.stage>=maxStage()&&S.E>=accelCost(maxStage()+1))lightDay=(t/86400).toFixed(2)+'日目';}
function voyManage(){if(!S.voy)return;spendL();uniManage();lightWatch();
  while(FOUND.length<S.found)FOUND.push(DEST[FOUND.length].name+' '+(t/86400).toFixed(2)+'日目');
  const g=tGain();if(g>=Math.max(3,S.tTotal)){redraw();REDRAW.push((t/86400).toFixed(2)+'日目 +'+g);lastP=t;}
  let b=true;while(b){b=false;const c=TRAIL.map(a=>[a.id,trailNext(a.id)]).filter(x=>x[1]&&x[1].cost<=S.T).sort((x,y)=>x[1].cost*(x[0]==='vs'?0.5:1)-y[1].cost*(y[0]==='vs'?0.5:1));if(c.length){buyTrail(c[0][0]);b=true;}}}
function summary(){if(process.env.DBG)console.log('DBG maxE',S.maxE.toExponential(2),'E',S.E.toExponential(2),'stage',S.stage,'vbest',S.vbest.toExponential(2),'years',S.years.toExponential(2));if(ULOG.length||S.uni)console.log('宇宙',ULOG.join('、')||'-','／法則',JSON.stringify(S.law),'残り',S.U,'／光の上限10段',lcDay||'まだ','／光になれる日',lightDay||'まだ');if(DAYS)console.log('上位の星が8つ灯った日',litDay||'まだ');console.log('チャレンジ',CLOG.join(' / ')||'-');console.log('実績',S.ach.length+'/'+ACHIEVEMENTS.length,'×'+achMult().toFixed(2),'afterglow',JSON.stringify(S.ag),'lit',S.lit.join(',')||'-','left',S.L);}

if(!DAYS){
  for(;;){const t0=t;
    while(t-t0<7*86400&&!done){act();t++;}
    if(!(done&&S.restarts<LOOPS))break;
    arrive();
  }
  console.log('stage',S.stage,'min',(t/60).toFixed(1),'years',Math.round(S.years),'prest',S.prestiges,'loses',LOSES.join(' '));
  if(LOOPS){for(const r of RLOG)console.log(r);summary();console.log('total',(t/60).toFixed(1)+'分');}
}else{
  let lastEnd=0,played=0;
  const DL=[];
  for(let d=0;d<WEEK;d++){for(const [h,m] of SCHED[DAYS]){
    const st=d*86400+h*3600;t=st;idle(st-lastEnd);if(done)arrive();
    for(let k=0;k<m*60;k++){act();t++;played++;if(done)arrive();}
    voyManage();lastEnd=t;if(argv.includes('--verbose'))console.log('  '+(t/86400).toFixed(2)+'日 '+(S.restarts+1)+'周目 段階'+S.stage+' 年'+S.years.toFixed(1)+' 距離'+Math.round(S.dist));
  }DL.push((d+1)+'日目の終わり：'+(S.voy?'航海 距離'+fmtN(S.vdist)+' 見つけた'+S.found+' 航跡'+S.tTotal+' ':'')+(S.restarts+1)+'周目 段階'+S.stage+' 年'+Math.round(S.years)+' 距離'+Math.round(S.dist)+' 停止'+S.prestiges+' 失った色'+(S.lost+(S.greyLost?1:0)));}
  for(const l of DL)console.log(l);
  console.log('遊び方 '+DAYS+'：'+WEEK+'日で画面を触った時間 '+(played/3600).toFixed(1)+'時間');
  for(const r of RLOG)console.log(r);
  console.log('いまの周回 '+(S.restarts+1)+'周目 段階'+S.stage+' 距離'+Math.round(S.dist)+'光年 停止'+S.prestiges+' 色 '+LOSES.join(' '));
  summary();
  if(S.voy||voyDay){console.log('航海に出た日',voyDay);console.log('目的地',FOUND.join('、')||'まだ');console.log('引き直し',REDRAW.length+'回 '+REDRAW.slice(0,12).join('、'));console.log('航跡の強化',JSON.stringify(S.tg),'残り航跡',S.T,'いちばん遠く',fmtN(S.vbest)+'光年');}
}
`;
eval(stub+core+loop);
