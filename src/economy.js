'use strict';
/* =====================================================================
   ECONOMY ― 計算と行動
   ===================================================================== */
function nines(s){return s<11?0:s-10;}
function stageBeta(s){return s<=11?SPEEDS[s]:1-Math.pow(10,-nines(s));}
function stageGamma(s){if(s<11){const b=SPEEDS[s];return 1/Math.sqrt(1-b*b);}const e=Math.pow(10,-nines(s));return 1/Math.sqrt(e*(2-e));}
function stagePct(s){if(s<=5)return (SPEEDS[s]*100).toPrecision(1);if(s<=11)return String(Math.round(SPEEDS[s]*100));return s===12?'99':s<=22?'99.'+'9'.repeat(s-12):'99.999…';}
function stageLabel(s){return stagePct(s);}
function speedText(s){return s<=5?'秒速'+KMS[s].toLocaleString('ja-JP')+'km':'光速の'+stagePct(s)+'%';}
function kmsOf(s){return Math.round(stageBeta(s)*C_KMS);}
function maxStage(){return S.voy?MAX_STAGE+law('lc'):TOP_STAGE;}   // 航海（③④）は今までどおり ④ 光の上限で上がる。故郷への周回は9が22個まで
function stageCost(s){if(s<=12)return STAGE_COST[s];const m=stageMultAt(glow('rm'));if(s<MAX_STAGE)return STAGE_COST[12]*Math.pow(m,s-12);const k=s-MAX_STAGE,ch=Math.min(k,FINAL_N-1);return STAGE_COST[12]*Math.pow(m,MAX_STAGE-13)*FINAL_MULT*Math.pow(FINAL_MULT,ch)*Math.pow(m,k-ch);}   // 9が12個と13個への加速は、値段の上がり方を FINAL_MULT 倍に抑える（1周目の終わりまで届く目標を残す）
function accelCost(s){let c=stageCost(s);if(has('p1'))c*=0.8;if(has('p2'))c*=0.7;return c;}
function regionIndex(d){let r=0;for(let i=0;i<REGIONS.length;i++)if(d>=REGIONS[i].from)r=i;return r;}
function regionMult(i){const m=REGIONS[S.region].m;return (m[i]||1)*(m.all||1);}
function milMult(n){let m=1;const b=has('eA')?3:2;for(const x of MILESTONES)if(n>=x)m*=b;return m;}
function synK(){return has('e5')?1.5:1;}
const TIER_NEED=[0,0,10,25,50,100,200],TIER_COST=[0,0,300,1e5,3e7,1e10,3e12],ROMAN=['','I','II','III','IV','V','VI'];
function upgA(i){return Math.pow(TIER_X*(has('e5')?1.25:1),(S.tier[i]||1)-1);}
const TIER_FREE=+((typeof process!=='undefined'&&process.env.TIER_FREE)||4),TIER_X=+((typeof process!=='undefined'&&process.env.TIER_X)||2.5);   // TIER 1段ごとの生産の倍率（2026-11-16 に ×2 から上げた。加速ごとに開く分の遅れをうめる）
   // TIER は、装置が出てきた段階で TIER_FREE まで、そこから加速1回ごとに1つ上まで上げられる（2026-11-16。出てきた瞬間に V まで上がらないように）
function tierStage(i,t){return (DEVICES[i].unlock||0)+Math.max(0,t-TIER_FREE);}
function tierNext(i){const t=(S.tier[i]||1)+1;if(t>6)return null;const st=tierStage(i,t);return{t,need:TIER_NEED[t],cost:DEVICES[i].cost*TIER_COST[t],st,lock:S.stage<st};}
function tierUp(i){const n=tierNext(i);if(!n||n.lock||S.dev[i]<n.need||S.E<n.cost)return;S.E-=n.cost;S.tier[i]=n.t;FXQ.tier=i;}
function kinds(){let k=0;for(const i of PRODI)if(S.dev[i]>0)k++;return k;}
function synMult(i){if((S.tier[i]||1)<3)return 1;const n=S.dev,k=synK();
  switch(i){case 0:return 1+0.02*n[1]*k;case 1:return 1+0.02*n[2]*k;case 2:return 1+0.03*n[5]*k;case 3:return 1+0.01*n[0]*k;case 4:return 1+0.03*n[6]*k;case 6:return 1+0.05*n[ANCHOR]*k;case 7:return 1+0.10*kinds()*k;default:return 1;}}
function batteryCapRaw(P){return Math.max(2000,P*3600*(has('e3')?4:1));}
function traitMult(i){const n=S.dev;switch(i){
  case 0:return 1+0.25*Math.min(S.stage,11)+0.2*nines(S.stage);
  case 2:return 1+2*Math.min(1,(S.vessel||0)/VES[VES.length-1].need);   // 器が満ちるほど強い
  case 3:return S.runTime<300?3:1;
  case 4:return 1+0.1*Math.floor(n[0]/10);
  case 5:return S.pulse>0?4:1;
  case 6:return 1+Math.log10(1+S.years);
  case 7:return 1+0.15*S.skills.length;
  case 9:return 1+Math.log10(1+S.vdist/1e4);
  case 10:return 1+0.002*S.dev.reduce((a,b)=>a+b,0);
  case 11:return Math.pow(2,S.found);
  case 12:return 1+Math.log10(1+S.loopTime/3600);
  default:return 1;}}
function fissionBonus(){return 1+Math.min(1,0.005*S.dev[1]);}
function devBase(i){if(i===ANCHOR)return 0;return DEVICES[i].prod*S.dev[i]*milMult(S.dev[i])*upgA(i)*synMult(i)*regionMult(i);}
function devRateRaw(i){return devBase(i)*traitMult(i)*starDevMult(i)*(S.chal==='eL'?Math.pow(0.5,Math.max(0,S.runTime-(S.lastBuy[i]||0))/chalP()):1);}   // 「冷えていく炉」
// 余熱（買ったばかりの装置）と連なる船（上位の装置の台数）
function starDevMult(i){let m=1;if(has('eL')&&S.lastBuy[i]!=null&&S.runTime-S.lastBuy[i]<60)m*=sp('eL');
  if(has('aM')){let u=0;for(const j of PRODI)if(j>i)u+=S.dev[j]||0;m*=Math.min(sp('aM'),1+0.002*u);}return m;}
function chalP(){return CHAL[S.chal]&&CHAL[S.chal].p?CHAL[S.chal].p[(S.chalLv||1)-1]:1;}
function sp(id){return STAR_P[id].p[Math.max(1,Math.min(3,S.chalTier[id]||1))-1];}   // 上位の星の強さ（越えた段で変わる）
function starText(id){return STAR_P[id]?STAR_P[id].t(sp(id)):'';}
function wMult(){return 1+0.01*S.W;}   // 使わずに持っている歪み1つにつき生産+1%
function globalMult(){return Math.pow(timeGamma(S.stage),1+0.1*law('td'))*(has('p5')?1.5:1)*(has('e1')?2:1)*(has('p3')?1.5:1)*wMult()*fissionBonus()*(has('pB')?1+0.2*nines(S.stage):1)*(has('pA')&&S.burst>0?5:1)*(S.over>0?S.overMul:1)*(has('pS')&&S.sling>0?3:1)*(has('pI')?Math.min(3,1+2*S.coast/300):1)*(has('eC')&&S.crit>0?2:1)*(has('eR')&&resonant()?1.5:1)*(has('cM')?1+0.2*lostN():1)*(1+0.25*glow('sk'))*(has('pL')?1+sp('pL')*S.stage:1)*(has('cG')&&S.sig>0?10:1)*achMult();}
function achMult(){return 1+ACH_BONUS*S.ach.length;}
function resonant(){const c={};for(const i of PRODI){const t=S.tier[i]||1;if(t>=2&&S.dev[i]>0)c[t]=(c[t]||0)+1;}return Object.values(c).some(v=>v>=3);}
function lostN(){if(S.cleared)return 0;let n=S.greyLost?1:0;for(let i=0;i<6;i++)if(!memHas(i))n++;return n;}
function memHas(i){if(S.cleared||S.voy)return true;return i===6?!S.greyLost:i>=S.lost;}
function memTarget(i){return memHas(i)?1:0;}
function onMilestone(){FXQ.milestone=true;if(has('eC'))S.crit=30;}
function baseRateNoFusion(){let b=0;for(const i of PRODI)if(i!==2)b+=devBase(i);return b*globalMult();}
function prodRate(){let b=0;for(const i of PRODI)b+=devRateRaw(i);let r=b*globalMult()*sailMult();   // ③ 光子の帆：船の時間が速く流れるif(routeCur()==='rough')r*=ROUTE_ROUGH_P;   // 航路図：荒れた宙域
  if(S.chal==='eM'&&r>1)r=Math.pow(r,chalP());                                    // 「薄い光」：桁が小さくなる
  if(has('eM')&&r>1)r=Math.pow(r,sp('eM'));                                       // 濃い光
  if(has('a8')&&S.loopTime<600)r*=sp('a8');                                       // 出だしの風
  if(S.chal==='a8')r/=Math.pow(Math.max(1,S.loopTime/10),chalP());                // 「急ぐ帰り道」：周回の時間（10秒単位）で割られる
  return r;}
function devShare(i){return devRateRaw(i)*globalMult();}
function tapGain(){return Math.max(1,prodRate()*0.05)*(has('c2')?3:1)*(has('cA')?5:1)*((S.tier[5]||1)>=3?1+0.02*S.dev[5]*synK():1);}
function growth(i){return DEVICES[i].growth||DEVICE_GROWTH;}
function devCost(i,k){const g=growth(i),c=DEVICES[i].cost*Math.pow(g,S.dev[i]);return c*(Math.pow(g,k)-1)/(g-1);}
function devMax(i){const g=growth(i),c=DEVICES[i].cost*Math.pow(g,S.dev[i]);return Math.max(0,Math.floor(Math.log(S.E*(g-1)/c+1)/Math.log(g)));}
function batteryCap(){return batteryCapRaw(prodRate());}
function batteryRate(){return 0.03+(has('e2')?0.02:0);}
function windMigrate(){if(!(S.wind>0))return;const P=prodRate();S.windT=(S.windT||0)+Math.min(P>0?S.wind/(P*(WIND_X-1)):0,offlineCap()*(1-OFF_NOW)/(WIND_X-1));delete S.wind;}   // 版6の途中まで追い風はエネルギーで貯めていた。留守の上限に見合う時間までに切り詰めて移す
function offlineCap(){return (has('c7')?sp('c7'):has('c3')?24:has('c1')?8:2)*3600;}
function wGain(){return Math.floor(Math.pow(S.Erun/1e6,0.22))*wMultAt(glow('wm'));}
function shipK(){return SHIP_K*(has('p3')?1.5:1)*(1+0.25*glow('sk'));}
function anchorCut(){return 0;}
// 故郷の時間の速まり：9が（12＋光の上限）個までは γ のまま、その先は γ の TIME_K 乗でゆるやかに
function timeGamma(s){const c=MAX_STAGE+law('lc');if(s<=c)return stageGamma(s);const g=stageGamma(c);return g*Math.pow(stageGamma(s)/g,TIME_K);}
function yearsPerSec(){return timeGamma(S.stage)*shipK()*(1-anchorCut())/SECONDS_PER_YEAR*(S.chal==='cG'?chalP():1);}
function nextMs(n){for(const m of MILESTONES)if(n<m)return m;return Math.ceil((n+1)/100)*100;}
function autoBuy(){for(let i=DEVICES.length-1;i>=0;i--){if(!(has('a'+i)||(S.voy&&i>ANCHOR))||S.auto[i]===0)continue;if(!devOpen(i)||chalBlocksDevice(i))continue;let g=0;while(g++<60){const c=devCost(i,1);if(c>S.E)break;S.E-=c;const before=S.dev[i];S.dev[i]++;onBought(i);S.autoBought++;story('auto',LINES.auto);if(MILESTONES.some(x=>before<x&&S.dev[i]>=x))onMilestone();}}}
function canFinal(){return S.stage===MAX_STAGE-1&&S.dist>=GOAL_LY*ARRIVE_RATIO;}

function tick(dt,offMul){
  const P=prodRate();let gain;
  if(offMul){const g=P*offMul*dt,now=S.chal?1:OFF_NOW;gain=g*now;S.windT=(S.windT||0)+dt*offMul*(1-now)/(WIND_X-1);}   // 留守の間：一部だけすぐ入り、残りは追い風に（チャレンジ中は全部すぐ入る）
  else{gain=P*dt;if(S.windT>0){const w=Math.min(S.windT,dt);gain+=P*w*(WIND_X-1);S.windT-=w;}forkTick(dt);}
  if(S.nebT>0)S.nebT=Math.max(0,S.nebT-dt);   // 遊んでいる間：追い風が吹いていれば生産 ×WIND_X
  S.E+=gain;S.Erun+=gain;if(S.E>S.maxE)S.maxE=S.E;if(P>S.peakP)S.peakP=P;voyWarp();phTick(dt*(offMul||1));
  autoBuy();if(has('aT')&&S.autoTier){for(const i of PRODI){const n=tierNext(i);if(n&&!n.lock&&S.dev[i]>=n.need&&S.E>=n.cost)tierUp(i);}}if(has('aA')&&S.autoAcc&&S.stage<maxStage()&&S.E>=accelCost(S.stage+1)&&!climax&&!BRK)accelerate();
  for(const i of [4,5,6]){const sp=DEVICES[i].spawn;if(S.dev[i]>0){S.frac[sp.to]+=S.dev[i]*sp.rate/60*dt;if(S.frac[sp.to]>=1){const w=Math.floor(S.frac[sp.to]);S.dev[sp.to]+=w;S.frac[sp.to]-=w;}}}
  const dy=yearsPerSec()*dt;S.years+=dy;
  if(S.voy)S.uTime+=dt*(offMul||1);
  if(S.voy)voyAdvance(dy*Math.max(stageBeta(S.stage),0.02)*voyMult()*sailMult());
  else if(!S.cleared){S.dist=Math.min(GOAL_LY,S.dist+dy/(S.chal==='cG'?chalP():1)*Math.max(stageBeta(S.stage),0.02));}
  S.runTime+=dt;if(!S.cleared)S.loopTime+=dt;S.coast+=dt;if(S.over>0)S.over=Math.max(0,S.over-dt);if(S.sling>0)S.sling=Math.max(0,S.sling-dt);if(S.crit>0)S.crit=Math.max(0,S.crit-dt);if(has('aR')&&S.autoRel&&S.vessel>=VES[VES.length-1].need&&canShower())FXQ.autoShower=true;if(S.pulse>0)S.pulse=Math.max(0,S.pulse-dt);if(S.burst>0)S.burst=Math.max(0,S.burst-dt);if(S.sig>0)S.sig=Math.max(0,S.sig-dt);autoLearn();
}
function devOpen(i){if(i===ANCHOR)return false;   // 時間の錨はやめた（2026-11-11）。番号は航海の装置のために残す
  const d=DEVICES[i];if(d.find&&S.found<d.find)return false;return S.dev[i]>0||S.maxStage>=d.unlock;}
function chalBlocksDevice(i){return S.chal==='pL'&&i!==0;}
// 装置を買ったあとに呼ぶ：「冷えていく炉」は買った時刻を記録、「一列の船」は下の装置を0台に戻す
function onBought(i){S.lastBuy[i]=S.runTime;if(S.chal==='aM')for(let j=0;j<i;j++)S.dev[j]=0;}
function buyDevice(i,mode){
  if(!devOpen(i)||chalBlocksDevice(i))return;
  const k=mode==='max'?devMax(i):mode==='10'?10:1;if(k<1)return;
  const c=devCost(i,k);if(c>S.E)return;
  const first=S.dev[i]===0,before=S.dev[i];
  S.E-=c;S.dev[i]+=k;onBought(i);
  if(first&&LINES['dev'+i])story('dev'+i,LINES['dev'+i]);
  if(MILESTONES.some(m=>before<m&&S.dev[i]>=m))onMilestone();
  return true;
}
function buyUpgrade(id){const u=UPGRADES.find(x=>x.id===id);if(!u||upgHas(id)||S.dev[u.dev]<u.need||S.E<u.cost)return;S.E-=u.cost;S.upg.push(id);FXQ.milestone=true;}
function accelerate(){
  if(S.stage>=maxStage())return;
  const c=accelCost(S.stage+1);if(S.E<c)return;
  const g0=timeGamma(S.stage);S.E-=c;if(has('pW')){const w=prodRate()*60;S.E+=w;S.Erun+=w;}S.coast=0;S.stage++;if(S.stage>S.maxStage)S.maxStage=S.stage;
  if(has('pA'))S.burst=60;
  FXQ.accel=timeGamma(S.stage)/g0;
  const key='s'+S.stage;if(LINES[key])story(key,LINES[key]);
  if(S.stage===DILATION_STAGE&&!S.flags.dilx)setTimeout(()=>story('dilx',LINES.dilx),5200);
  if(S.stage>=GREY_STAGE)forceLoseAll();
  
}
function skillSpent(){return S.skills.reduce((a,id)=>a+SKILLS.find(k=>k.id===id).cost,0);}
function prestige(respec){
  if(S.chal==='pR')return;   // チャレンジ「止まらない」
  const g=wGain();if(S.stage<BRAKE_STAGE||g<1)return;
  const carry=has('c5')?S.peakP*60:0,st0=has('pR')?Math.floor(S.stage*sp('pR')):0,keep=0;
  if(respec){S.W+=skillSpent();S.skills=[];}
  S.W+=g;S.wTotal+=g;S.prestiges++;S.st.stops++;S.lastBuy=[];S.E=carry;S.Erun=0;S.dev=DEVICES.map((_,i)=>S.chal==='c7'&&i===0?1:0);S.frac=DEVICES.map(()=>0);S.upg=[];S.tier=DEVICES.map(()=>1);S.stage=st0;S.battery*=keep;S.batDep*=keep;S.over=0;S.peakP=0;S.runTime=0;S.pulse=0;S.burst=0;
  story('prest1',LINES.prest1);FXQ.prestige=true;voyLearn();
}
/* 再出発（第二層） */
function lGain(){return S.cleared&&!S.voy?Math.floor(RESTART_BASE*(1+0.1*S.restarts)):0;}
function rebirth(){
  const g=lGain();if(g<1)return 0;
  S.L+=g;S.lTotal+=g;S.restarts++;const lp=S.st.loops[S.st.loops.length-1];S.lastRun={k:'home',n:S.restarts,sec:lp?lp.sec:S.loopTime,g,at:Date.now()};resetRun();
  FXQ.restart=g;return g;
}
function resetRun(){   // 再出発・航海の開始・航路の引き直しで共通：①の中身と、距離・年月・歪み・スキルを戻す
  S.cleared=false;S.lost=0;S.greyLost=false;delete S.flags.near;
  S.E=0;S.Erun=0;S.dev=DEVICES.map(()=>0);S.frac=DEVICES.map(()=>0);S.upg=[];S.tier=DEVICES.map(()=>1);S.stage=0;S.maxStage=0;S.battery=0;S.batDep=0;S.over=0;S.peakP=0;S.runTime=0;S.pulse=0;S.burst=0;
  S.prevSkills=S.skills.slice();S.loopTime=0;S.W=0;S.skills=[];S.prestiges=0;S.sig=0;S.years=0;S.dist=0;S.region=0;S.sling=0;S.coast=0;S.crit=0;
}
/* ② チャレンジ：上位の星を灯す */
// 段1は②（航海に出る前）に、段2・3は航海に出てから挑む（2026-11-16）。航海中に挑むと、航海をいったん預けて故郷への周回に入り、終わると航海に戻る
function voyaged(){return S.voy||!!S.voyStash||S.uni>0||S.found>0;}
function canChallengeAt(lv){if(!lv)return false;if(lv===1)return !S.voy&&!S.voyStash&&(S.cleared||S.restarts>0);return voyaged()&&!S.chal;}
function canChallenge(id){return id?canChallengeAt(chalNext(id)):(!S.voy&&(S.cleared||S.restarts>0));}
const STASH_KEYS=['route','ph','phDev','phBuy','sail','E','Erun','dev','frac','upg','tier','stage','maxStage','battery','batDep','over','peakP','runTime','pulse','burst','skills','prevSkills','loopTime','W','prestiges','sig','years','dist','region','sling','coast','crit','cleared','lost','greyLost','vdist','vL','lastBuy','nebT','fork','forkT'];
function voyStashSave(){const o={};for(const k of STASH_KEYS)o[k]=JSON.parse(JSON.stringify(S[k]===undefined?null:S[k]));S.voyStash=o;S.voy=false;}
function voyStashBack(){if(!S.voyStash)return false;const o=S.voyStash;for(const k of STASH_KEYS)S[k]=o[k];S.voyStash=null;S.voy=true;FXQ.voyBack=true;return true;}
function chalNext(id){const t=S.chalTier[id]||0;return t<3?t+1:0;}   // 次に挑む段（3段すべて越えたら0）
function startChallenge(id){if(!CHAL[id])return false;const lv=chalNext(id);if(!canChallengeAt(lv))return false;if(S.voy)voyStashSave();resetRun();S.chal=id;S.chalLv=lv;S.lastBuy=[];if(id==='c7')S.dev[0]=1;FXQ.chal=id;return true;}
function quitChallenge(){S.chal=null;S.chalLv=0;voyStashBack();}
function chalCheck(){if(!S.chal)return;const id=S.chal,lv=S.chalLv||1,g=CHAL[id].goal[lv-1];if((g.stage&&S.maxStage>=g.stage)||(g.home&&S.dist>=GOAL_LY)){S.chal=null;S.chalLv=0;S.chalTier[id]=Math.max(S.chalTier[id]||0,lv);if(!S.lit.includes(id))S.lit.push(id);if(lv===1)S.st.chal[id]=Date.now();const k=SKILLS.find(x=>x.id===id);logLine(lv===1?k.name+'が灯った。':'「'+CHAL[id].name+'」の段'+lv+'を越えた。',-1);FXQ.chalDone={id,lv};voyStashBack();}}
/* ③ さらに遠くへ（航跡） */
function tg(id){return S.tg[id]||0;}
function voyMult(){return VOY_BASE*Math.pow(2.7,tg('vs'));}
function canVoyage(){return !S.voy&&S.cleared&&S.lit.length>=SKILLS.filter(k=>k.glow).length;}
function voyDoublings(d){return d>=1e4?Math.floor(Math.log2(d/1e4))+1:0;}   // 1万光年、2万、4万…と、距離が2倍になるたびに1回
function lPer(){return Math.floor(RESTART_BASE*(1+0.1*S.restarts))*Math.pow(2,tg('ls'));}   // 距離が2倍になるたびに入る残光
function startVoyage(){if(!canVoyage())return false;resetRun();S.voy=true;S.vdist=0;S.vL=0;routeInit();phReset();S.fork={opts:S.route.opts.slice(),life:FORK_LIFE};story('voy',VOY_LINES.start);FXQ.voyage=true;return true;}
/* 航路図（2026-11-17）：宙域＝距離が2倍になるごと（voyDoublings）。境目に来るたびに、選んでおいた星系（S.route.pick、なければ前と同じ性格か最初の候補）へ進み、
   その宙域のあいだ星系の性格が効く。次の宙域の候補を2〜3つ出す。前の「10分ごとの分かれ道」はこれにまとめた */
/* ③ 光子（2026-11-17 試作） */
function phOpen(k){return S.voy&&!S.chal&&(S.found||0)>=(PH_DEV[k].find||0);}
function sailMult(){return S.voy&&!S.chal?Math.pow(SAIL_X,S.sail||0):1;}
function phRate(){return S.voy&&!S.chal?(S.phDev[0]||0)*PH_DEV[0].rate*(SAIL_PH?sailMult():1):0;}
function phCost(k){return PH_DEV[k].cost*Math.pow(PH_DEV[k].g,S.phBuy[k]||0);}
function phBuyDev(k){if(!phOpen(k)||S.ph<phCost(k))return false;S.ph-=phCost(k);S.phBuy[k]=(S.phBuy[k]||0)+1;S.phDev[k]=(S.phDev[k]||0)+1;return true;}
function phGain(sec,min){if(!S.voy||S.chal)return 0;const g=Math.max(min,phRate()*sec);S.ph+=g;return g;}   // タップと流れ星で入る光子
function sailCost(){return SAIL_COST*Math.pow(SAIL_G,S.sail||0);}
// 帆は航路を引き直すときにだけ張る（2026-11-17）：引き直すときの光子（S.phPend）で段を上げ、帆は引き直しても残る。宇宙を畳むと最初から
function raiseSail(){if((S.phPend||0)<sailCost())return false;S.phPend-=sailCost();S.sail=(S.sail||0)+1;FXQ.sail=S.sail;return true;}
function sailAutoSpend(){while((S.phPend||0)>=sailCost())raiseSail();S.phPend=0;}
function phReset(keepSail){S.ph=0;S.phDev=[1,0,0,0];S.phBuy=[0,0,0,0];if(!keepSail)S.sail=0;}
function phTick(dt){if(!S.voy||S.chal)return;const m=SAIL_PH?sailMult():1;for(let k=PH_DEV.length-1;k>=1;k--)if(S.phDev[k]>0)S.phDev[k-1]+=S.phDev[k]*PH_DEV[k].rate*m*dt;S.ph+=phRate()*dt;}
function routeOpts(){const ids=ROUTE_TYPES.slice().sort(()=>Math.random()-0.5).slice(0,2+(Math.random()<0.5?1:0));if(Math.random()<ROUTE_UNKNOWN)ids[ids.length-1]='unknown';return ids;}
function routeInit(){S.route={n:voyDoublings(S.vdist||0),cur:null,opts:routeOpts(),pick:null,path:[],wreck:0};}
function routeCur(){return S.voy&&S.route?S.route.cur:null;}
function routeAuto(){const R=S.route;return R.pick||(R.opts.includes(R.cur)?R.cur:R.opts[0]);}
function routeEnter(n){const R=S.route,c=routeAuto();R.cur=c;R.path.push(c);R.n=n;R.pick=null;R.opts=routeOpts();
  if(c==='wreck')R.wreck++;else if(c==='calm')S.windT=(S.windT||0)+ROUTE_CALM;else if(c==='unknown')S.shard=(S.shard||0)+1;
  FXQ.route=c;S.fork={opts:R.opts.slice(),life:FORK_LIFE};FXQ.fork=true;}
function voyAdvance(d){if(!S.route)routeInit();const rc=S.route.cur;if(rc==='neb')d*=ROUTE_NEB;else if(rc==='rough')d*=ROUTE_ROUGH;S.vdist+=d;if(S.vdist>S.vbest)S.vbest=S.vdist;if(S.vdist>S.ubest)S.ubest=S.vdist;
  const n=voyDoublings(S.vdist);while(S.route.n<n)routeEnter(S.route.n+1);if(n>S.vL){const g=(n-S.vL)*lPer()*(S.route.cur==='cluster'?2:1);S.L+=g;S.lTotal+=g;S.vL=n;}
  while(S.found<DEST.length&&S.vdist>=DEST[S.found].ly){const k=S.found;S.found++;S.st.dest[k]=Date.now();story('find'+k,NEW_COLORS[k].find);FXQ.found=(FXQ.found||[]).concat([k]);}}
function redrawReady(){return S.voy&&tGain()>=Math.max(3,Math.ceil(S.tTotal*REDRAW_R));}
// 分かれ道：得られるもの（そのときの強さに合わせる）
function forkText(id){return id==='cluster'?'この宙域の残光 ×2':id==='wreck'?'引き直しの航跡 +'+Math.round(ROUTE_WRECK*100)+'%':id==='neb'?'この宙域を ×'+ROUTE_NEB+' の速さで':id==='calm'?'追い風 +'+Math.round(ROUTE_CALM/60)+'分':id==='rough'?'速さ ×'+ROUTE_ROUGH+'・生産 ×'+ROUTE_ROUGH_P:'記憶のかけら +1';}
function forkTick(dt){if(!S.voy||S.chal)return;if(S.fork){S.fork.life-=dt;if(S.fork.life<=0)S.fork=null;}}   // 窓の下の分岐図は、宙域の境目に来たときだけ出る
function chooseFork(id){if(!S.voy||!S.route||!S.route.opts.includes(id))return false;S.route.pick=id;S.fork=null;S.st.forks=(S.st.forks||0)+1;return true;}   // 次の宙域へ向かう星系を選ぶ（境目に来たときに効く）
function tGain(){return S.voy?Math.floor(Math.sqrt(S.vdist/1e4)*(1+ROUTE_WRECK*((S.route&&S.route.wreck)||0))):0;}
function redraw(){const g=tGain();if(g<1)return 0;S.lastRun={k:'voy',far:S.vdist,g,at:Date.now()};S.st.redraws++;S.T+=g;S.tTotal+=g;S.phPend=S.ph;resetRun();S.vdist=0;S.vL=0;routeInit();phReset(true);S.stage=S.maxStage=2*tg('ps');logLine(VOY_LINES.redraw,-1);FXQ.redraw=g;return g;}
/* ④ 新しい宇宙（法則） */
function canFold(){return S.voy&&S.found>=DEST.length&&S.ubest>=DEST[DEST.length-1].ly;}   // この宇宙で宇宙の果てに着いたら
function uGain(){if(!canFold())return 0;return 2+Math.floor(Math.log2(Math.max(1,S.ubest/DEST[DEST.length-1].ly)));}   // 宇宙の果てで2、その先は距離が2倍になるたびに+1
function fold(){const g=uGain();if(g<1)return 0;
  S.uHist.push({far:S.ubest,gain:g,time:Math.round(S.uTime),law:Object.assign({},S.law),tint:S.uTint});
  S.U+=g;S.uTotal+=g;S.uni++;resetRun();S.vdist=0;S.vL=0;routeInit();phReset();S.T=0;S.tTotal=0;S.tg={};S.ubest=0;S.uTime=0;
  S.uTint=S.uni%UNI_TINT.length;FXQ.fold=g;return g;}
function lawNext(id){const a=LAWS.find(x=>x.id===id),l=law(id);return l>=a.max?null:{l,cost:a.cost(l),text:a.text(l+1)};}
function buyLaw(id){const n=lawNext(id);if(!n||S.U<n.cost)return false;S.U-=n.cost;S.law[id]=n.l+1;return true;}
function autoRedrawReady(){return law('ar')>0&&S.voy&&S.stage>=maxStage()-1&&redrawReady();}
function trailNext(id){const a=TRAIL.find(x=>x.id===id),l=tg(id);return a.max&&l>=a.max?null:{l,cost:a.cost(l),text:a.text(l+1)};}
function buyTrail(id){const n=trailNext(id);if(!n||S.T<n.cost)return false;S.T-=n.cost;S.tg[id]=n.l+1;return true;}
// ③では緊急停止とスキル選びが自動になる
function voyStopReady(){return S.voy&&S.stage>=BRAKE_STAGE&&wGain()>=Math.max(5,2*(S.W+skillSpent()));}
/* 航海では止まらない（2026-11-17）：緊急停止をなくし、止めたらもらえるはずの歪み（wGain）を走りながら受け取る。
   S.wRun＝この周ですでに受け取った分。周の集めたエネルギー（Erun）が減ったら（引き直し・畳む・チャレンジなどで最初から）0に戻す */
function voyWarp(){if(!S.voy||S.chal)return;if(S.Erun<(S.wRunE||0))S.wRun=0;S.wRunE=S.Erun;const g=wGain(),d=g-(S.wRun||0);if(d>=1){S.wRun=g;S.W+=d;S.wTotal+=d;voyLearn();}}
function voyLearn(){if(!S.voy)return;for(const id of S.prevSkills){if(has(id))continue;const k=SKILLS.find(x=>x.id===id);if(skillAvailable(k)&&S.W>=k.cost){S.W-=k.cost;S.skills.push(id);}}
  let go=true;while(go){go=false;const c=SKILLS.filter(k=>skillAvailable(k)&&S.W>=k.cost).sort((a,b)=>a.cost-b.cost)[0];if(c){S.W-=c.cost;S.skills.push(c.id);go=true;}}}
function glowNext(id){const a=AFTERGLOW.find(x=>x.id===id),l=glow(id);return a.max&&l>=a.max?null:{l,cost:a.cost(l),text:a.text(l+1)};}
function buyGlow(id){const n=glowNext(id);if(!n||S.L<n.cost)return false;S.L-=n.cost;S.ag[id]=n.l+1;return true;}
function starLit(k){return !k.glow||S.lit.includes(k.id);}
function autoLearn(){if(!has('aM'))return;for(const id of S.prevSkills){if(has(id))continue;const k=SKILLS.find(x=>x.id===id);if(!skillAvailable(k)||S.W<k.cost)return;S.W-=k.cost;S.skills.push(id);}}
function skillAvailable(k){if(has(k.id)||k.glow)return false;
  if(k.step===0)return true;return SKILLS.some(x=>x.br===k.br&&x.step===k.step-1&&has(x.id));}
function buySkill(id){const k=SKILLS.find(x=>x.id===id);if(typeof skillPick!=='undefined'&&!skillPick)return;if(!k||!skillAvailable(k)||S.W<k.cost)return;S.W-=k.cost;S.skills.push(id);if(typeof NEWSK!=='undefined')NEWSK.push(id);}
/* 流星群の器 */
function vesTier(){let t=-1;VES.forEach((v,i)=>{if(S.vessel>=v.need)t=i;});return t;}
function vesAdd(n){S.vessel=Math.min(VES[VES.length-1].need,(S.vessel||0)+n);}
function canShower(){return S.flags.bat&&!(S.chal==='c7'&&S.chalLv>=2)&&vesTier()>=0;}
