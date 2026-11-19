// 自動プレイでバランスを試算するツール
// 使い方: node tools/balance_bot.js              （ずっと画面を触り続けたとして、最初から故郷到着までを1秒刻みで回す）
//         node tools/balance_bot.js --loops 3    （故郷に着いたら再出発して、さらに3周する。残光は安い順に使う）
//         node tools/balance_bot.js --days A     （放置込みで1週間。A＝1日3回×15分（8時・13時・21時）、B＝1日1回×30分（21時）。
//                                                   遊んでいない間は放置の上限まで進む。着いたらすぐ再出発する）
//         --gaps で、触っている間の「暇な時間」（手応えのある出来事の間隔）を出す
//         --week 10 で日数を変えられる（既定は7日）。上位の星が8つ灯ったあと着くと、③の航海に出る
const fs=require('fs'),path=require('path');
{let _s=+(process.env.SEED||12345);Math.random=()=>{_s=(_s*16807)%2147483647;return _s/2147483647;};}   // 試算は毎回同じ乱数（航路図の候補など）。SEED で変えられる
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
const PATH=['p1','e1','c1','p2','e2','c2','p3','e3','c3','pB','pA','eA','eB','cB','cA','p5','e5','c5','pS','eC','cS','cL','pI','eR','cC','cM','pW'];
function best(){let b=null,P0=null;const nxt=S.stage<maxStage()?accelCost(S.stage+1):1e300;for(const i of PRODI){if(!devOpen(i)||chalBlocksDevice(i))continue;const c=devCost(i,1);if(c>S.E||c>0.12*nxt)continue;if(P0===null)P0=prodRate();S.dev[i]++;const P1=prodRate();S.dev[i]--;const r=(P1-P0)/c;if(!b||r>b.r)b={i,r};}return b;}
let lastP=0;
// 暇な時間を測る（--gaps）：触っている間の秒だけを数え、手応えのある出来事（加速・TIER・新しい装置・緊急停止とスキル・色を失う・
// 再出発・チャレンジ・目的地・引き直し・宇宙を畳む）の間隔を記録する。装置を買い足すだけの時間は「暇」に数える
let aT=0,lastEv=0,evPrev=null,evWhat='';const GAPS=[];
function evSnap(){return {stage:S.stage,tier:S.tier.reduce((a,b)=>a+b,0),dev:PRODI.filter(i=>devOpen(i)&&!chalBlocksDevice(i)).length,stop:S.prestiges,lost:S.lost+(S.greyLost?1:0),loop:S.restarts,chal:(S.chal||'')+(S.chalLv||0),found:S.found,redraw:S.st.redraws,uni:S.uni,fork:S.st.forks||0};}
const EV_NAME={stage:'加速',tier:'TIER',dev:'新しい装置',stop:'緊急停止',lost:'色を失う',loop:'再出発',chal:'チャレンジ',found:'目的地',redraw:'引き直し',uni:'宇宙を畳む',fork:'分かれ道'};
function gapTick(st){aT+=st||1;const s=evSnap();if(evPrev){const ch=Object.keys(s).filter(k=>s[k]!==evPrev[k]&&!(k==='stage'&&s.stop!==evPrev.stop)&&!(k==='tier'&&s.stop!==evPrev.stop));
    if(ch.length){GAPS.push({g:aT-lastEv,at:stamp(),loop:S.restarts+1,stage:evPrev.stage,voy:!!S.voy,dist:Math.round(S.voy?S.vdist:S.dist),before:evWhat,after:ch.map(k=>EV_NAME[k]).join('・')});lastEv=aT;evWhat=ch.map(k=>EV_NAME[k]).join('・');}}
  evPrev=s;}
function gapReport(){const L=x=>x>=3600?(x/3600).toFixed(1)+'時間':Math.round(x/60)+'分';
  console.log('');console.log('― 暇な時間（触っている間に、次の手応えのある出来事まで待った時間）―');
  console.log('触っていた時間 '+(aT/3600).toFixed(1)+'時間、出来事 '+GAPS.length+'回、平均の間隔 '+(aT/Math.max(1,GAPS.length)/60).toFixed(1)+'分');
  const loops=[...new Set(GAPS.map(g=>g.loop))];
  for(const lp of loops){const G=GAPS.filter(g=>g.loop===lp),c=m=>G.filter(g=>g.g>=m*60).length,w=G.filter(g=>g.g>=300).reduce((a,g)=>a+g.g,0),tot=G.reduce((a,g)=>a+g.g,0);
    console.log('周'+lp+(G[0].voy?'（航海）':'')+'：5分以上 '+c(5)+'回・10分以上 '+c(10)+'回・20分以上 '+c(20)+'回　5分以上の待ちの合計 '+L(w)+'（触った時間の'+Math.round(100*w/Math.max(1,tot))+'%）');}
  console.log('長い待ち（上位15）：');
  GAPS.slice().sort((a,b)=>b.g-a.g).slice(0,15).forEach(g=>console.log('  '+L(g.g).padStart(6)+'  '+g.at+(DAYS?'日':'分')+'　周'+g.loop+' 段階'+g.stage+(g.voy?' 航海':'')+' 距離'+g.dist+'　'+(g.before||'はじめ')+' → '+g.after));}
// 画面を触っている1秒
// st 秒をまとめて進める（航海の間は VSTEP 秒ずつ。タップは10秒に3回の割合を、まとめた分だけ足す）
const VSTEP=+(process.env.VSTEP||5);   // 航海の前（①②）もまとめると、加速や停止の時機がずれて結果が変わり、速くもならなかった
function act(st){st=st||1;PLAYED+=st;const many=st>1;
  tick(st);const P=prodRate();if(S.chal!=='c7'&&(many?true:(P<2000||t%10<3))){const n=many?(P<2000?st:st*0.3):1;S.E+=tapGain()*2*n;S.Erun+=tapGain()*2*n;S.pulse=10;}
  if(S.voy&&!S.chal){if(many)phGain(PH_TAP*2*st*0.3,PH_TAP_MIN);else if(t%10<3)phGain(PH_TAP*2,PH_TAP_MIN);if(!process.env.NOPH&&!phAutoOpen())phBuyPart();}   // ③ 光子：手元の4分の1までで列を買う（残りは引き直すときの帆に）
  checkStory();chalWatch();if(t%5===0)achCheck();gapTick(st);
  let g=true,gi=0;while(g&&gi++<300){g=false;
    if(S.stage<maxStage()&&S.E>=accelCost(S.stage+1)){accelerate();LOG.push([stamp(),'st',S.stage,Math.round(S.years)]);g=true;continue;}
    const nxt=S.stage<maxStage()?accelCost(S.stage+1):1e300;
    for(const i of PRODI){const n=tierNext(i);if(n&&!n.lock&&S.dev[i]>=n.need&&S.E>=n.cost&&n.cost<0.2*nxt){tierUp(i);g=true;}}   // まだ開いていない TIER（n.lock）を選ぶと、上げられないまま300回空回りしていた（2026-11-18）}
    const b=best();if(b){const k=DAYS?Math.floor(devMax(b.i)/4):0;if(k>1){const n0=S.dev[b.i];S.E-=devCost(b.i,k);S.dev[b.i]+=k;onBought(b.i);if(MILESTONES.some(x=>n0<x&&S.dev[b.i]>=x))onMilestone();}else{const n0=S.dev[b.i];buyDevice(b.i,'1');if(S.dev[b.i]===n0)break;}g=true;}}   // 買えなかったら（チャレンジの縛りなど）やめる。前は300回空回りして遅かった（2026-11-18）  // 日数モードは放置で溜まった分をまとめて買う
  if(S.fork){const o=S.fork.opts;chooseFork(['neb','cluster','wreck','calm','rough','unknown'].find(x=>o.includes(x)));}
  if(S.voy&&t%60===0)voyManage();   // 航海では遊んでいる間も、引き直しと航跡・残光の強化を判断する
  if(S.voy)return;   // ③では止まらない（歪みとスキルは economy.js voyWarp() が走りながら）
  const w=wGain();if(S.stage>=BRAKE_STAGE&&w>=Math.max(5,1.6*(S.W+skillSpent()))&&t-lastP>90){prestige(false);lastP=t;LOG.push([stamp(),'prest',w]);for(const id of PATH){const k=SKILLS.find(z=>z.id===id);if(k.cost<=100||k.cost<=0.25*S.W)buySkill(id);}}
}
// 放置（ゲームの offline() と同じく、上限までを200刻みで進める）
function idle(sec){if(sec<30||done)return;const tt=Math.min(sec,offlineCap()),mul=has('cB')?2:1;for(let k=0;k<200&&!done;k++){tick(tt/200,mul);checkStory();chalWatch();achCheck();}}
// 着いたら再出発し、残光を安い順に強化と星に使う
let loopStart=0;
function pri(x){return x[1].cost*(x[0]==='rm'?0.4:1);}   // 航路の記憶を優先
// 周ごとに、遊んだ時間とチャレンジの周かを出す（2026-11-18。周の長さは寝ている間も含むので、短い周と長い周が交互に見えていた）
var LASTCH='',PLAYED=0;function arrive(){
  RLOG.push('周'+(S.restarts+1)+' '+(DAYS?((t-loopStart)/3600).toFixed(1)+'時間（遊んだ'+(PLAYED/3600).toFixed(1)+'時間'+(LASTCH?'・'+LASTCH+(S.chal?' 目標9×'+nines(S.chalNeed)+'に届かず':''):'')+'・9×'+nines(S.maxStage)+'、'+(t/86400).toFixed(2)+'日目に到着）':((t-loopStart)/60).toFixed(1)+'分')+' 停止'+S.prestiges+' 色 '+LOSES.join(' '));
  LOSES.length=0;LASTCH='';PLAYED=0;S.cleared=true;done=false;lastP=t;loopStart=t;
  if(canVoyage()){startVoyage();voyDay=(t/86400).toFixed(2)+'日目';}else rebirth();
  spendL();
  // 上位の星はチャレンジで灯す：まだ灯っていない星があれば、再出発の代わりに挑む
  if(!S.voy){const id=CHAL_ORDER.find(k=>!S.lit.includes(k));if(id&&startChallenge(id)){CLOG.push(CHAL[id].name+' '+(t/86400).toFixed(2)+'日目〜');chalT=t;LASTCH='チャレンジ '+CHAL[id].name;}}
}
const CHAL_ORDER=process.env.CHAL_ORDER?process.env.CHAL_ORDER.split(','):Object.keys(CHAL),CLOG=[];let chalT=0;
function chalWatch(){if(chalT&&!S.chal){if(process.env.DBG)console.log('DBG chal done',CLOG[CLOG.length-1],'loopTime',S.loopTime,'maxStage',S.maxStage,'t',t);CLOG[CLOG.length-1]+=(S.loopTime/3600).toFixed(1)+'時間';chalT=0;if(S.lit.length>=8&&!litDay)litDay=(t/86400).toFixed(2)+'日目';}}
function spendL(){
  let b=true;while(b){b=false;const c=AFTERGLOW.map(a=>[a.id,glowNext(a.id)]).filter(x=>x[1]&&x[1].cost<=S.L).sort((x,y)=>pri(x)-pri(y));if(c.length){buyGlow(c[0][0]);b=true;}}
  if(S.lit.length>=8&&!litDay)litDay=(t/86400).toFixed(2)+'日目';
}
let litDay=null,voyDay=null;const FOUND=[],REDRAW=[];
// ③：残光と航跡を使い、航跡が今までの合計以上たまるなら航路を引き直す
// ④：宇宙の果てに着いてから FOLD_H 時間たったら宇宙を畳み、法則を安い順に（光の上限と時の遅れを先に）使う
const FOLD_H=+(process.env.FOLD_H||8),ULOG=[];let endAt=null,lcDay=null;
function uniManage(){lightWatch();if(!canFold()){endAt=null;return;}if(endAt==null)endAt=t;
  if(t-endAt>=FOLD_H*(DAYS?3600:60)){const g=fold();const pk=process.env.KIND&&S.uOffer.includes(process.env.KIND)?process.env.KIND:S.uOffer[0];if(!process.env.NOKIND)chooseKind(pk);ULOG.push('宇宙'+(S.uni+1)+'へ '+(t/86400).toFixed(2)+'日目 +'+g+' '+pk);endAt=null;lastP=t;
    let b=true;while(b){b=false;const c=LAWS.map(a=>[a.id,lawNext(a.id)]).filter(x=>x[1]&&x[1].cost<=S.U).sort((x,y)=>x[1].cost*(x[0]==='ar'?0.6:1)-y[1].cost*(y[0]==='ar'?0.6:1));if(c.length){buyLaw(c[0][0]);b=true;}}
    if(law('lc')>=10&&!lcDay)lcDay=(t/86400).toFixed(2)+'日目';}
  }
let lightDay=null;function lightWatch(){if(!lightDay&&lightReach())lightDay=(t/86400).toFixed(2)+'日目';}
function voyManage(){if(!S.voy)return;spendL();uniManage();lightWatch();
  while(FOUND.length<S.found)FOUND.push(DEST[FOUND.length].name+' '+(t/86400).toFixed(2)+'日目');
  const g=tGain();if(redrawReady()){redraw();trailAutoSpend();REDRAW.push((t/86400).toFixed(2)+'日目 +'+g+(S.sail?' 帆'+S.sail:''));lastP=t;}
  }   // 航跡の強化は引き直すときだけ買う（2026-11-19、ゲームと同じ）
function summary(){if(process.env.DBG)console.log('DBG maxE',S.maxE.toExponential(2),'E',S.E.toExponential(2),'stage',S.stage,'vbest',S.vbest.toExponential(2),'years',S.years.toExponential(2));if(ULOG.length||S.uni)console.log('宇宙',ULOG.join('、')||'-','／法則',JSON.stringify(S.law),'残り',S.U,'／光の上限10段',lcDay||'まだ','／光になれる日',lightDay||'まだ');if(DAYS)console.log('上位の星が8つ灯った日',litDay||'まだ');console.log('チャレンジ',CLOG.join(' / ')||'-');console.log('実績',S.ach.length+'/'+ACHIEVEMENTS.length,'×'+achMult().toFixed(2),'afterglow',JSON.stringify(S.ag),'lit',S.lit.join(',')||'-','left',S.L);}

if(!DAYS){
  for(;;){const t0=t;
    while(t-t0<7*86400&&!done){act();t++;}
    if(!(done&&S.restarts<LOOPS))break;
    arrive();
  }
  console.log('stage',S.stage,'min',(t/60).toFixed(1),'years',Math.round(S.years),'prest',S.prestiges,'loses',LOSES.join(' '));
  if(argv.includes('--gaps'))gapReport();
  if(LOOPS){for(const r of RLOG)console.log(r);summary();console.log('total',(t/60).toFixed(1)+'分');}
}else{
  let lastEnd=0,played=0;
  const DL=[];
  const UNTIL=argv.includes('--until-light');   // ⑤に届いたらそこで止める（数値を探すとき用）
  days:for(let d=0;d<WEEK;d++){for(const [h,m] of SCHED[DAYS]){if(UNTIL&&lightDay)break days;
    const st=d*86400+h*3600;t=st;idle(st-lastEnd);if(done)arrive();
    for(let k=0;k<m*60;){const st=S.voy&&!S.chal&&VSTEP>1&&t%VSTEP===0&&k+VSTEP<=m*60?VSTEP:1;act(st);t+=st;k+=st;played+=st;if(done)arrive();}   // 航海の間は VSTEP 秒ずつ（2026-11-18、試算を速くするため。VSTEP=1 で前と同じ）
    voyManage();lastEnd=t;if(argv.includes('--verbose'))console.log('  '+(t/86400).toFixed(2)+'日 '+(S.restarts+1)+'周目 段階'+S.stage+' 年'+S.years.toFixed(1)+' 距離'+Math.round(S.dist));
  }DL.push((d+1)+'日目の終わり：'+(S.voy?'航海 距離'+fmtN(S.vdist)+' 見つけた'+S.found+' 航跡'+S.tTotal+' ':'')+(S.restarts+1)+'周目 段階'+S.stage+' 年'+Math.round(S.years)+' 距離'+Math.round(S.dist)+' 停止'+S.prestiges+' 失った色'+(S.lost+(S.greyLost?1:0)));}
  for(const l of DL)console.log(l);
  console.log('遊び方 '+DAYS+'：'+WEEK+'日で画面を触った時間 '+(played/3600).toFixed(1)+'時間');
  for(const r of RLOG)console.log(r);
  console.log('いまの周回 '+(S.restarts+1)+'周目 段階'+S.stage+' 距離'+Math.round(S.dist)+'光年 停止'+S.prestiges+' 色 '+LOSES.join(' '));
  summary();if(argv.includes('--gaps'))gapReport();
  if(S.voy||voyDay){console.log('航海に出た日',voyDay);console.log('目的地',FOUND.join('、')||'まだ');console.log('引き直し',REDRAW.length+'回 '+REDRAW.slice(0,12).join('、'));console.log('航跡の強化',JSON.stringify(S.tg),'残り航跡',S.T,'いちばん遠く',fmtN(S.vbest)+'光年');}
}
`;
eval(stub+core+loop);
