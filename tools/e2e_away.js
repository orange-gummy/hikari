// 留守の確認（2026-11-19）：試算ツールで作った本物に近いセーブ（SNAP で書き出したもの）を、1日・3日・7日あけて開く。
// 使い方：SNAP=2,5,8,12,20 SNAPDIR=<dir> node tools/balance_bot.js --days C --week 20 で書き出してから、
//         python -m http.server 8123 を動かして SNAPDIR=<dir> node tools/e2e_away.js
const {chromium}=require('playwright'),fs=require('fs'),path=require('path');
const DIR=process.env.SNAPDIR||'.',OUT=process.env.OUT||require('os').tmpdir()+'/away/';fs.mkdirSync(OUT,{recursive:true});
const DAY=86400e3;
const cases=[];
for(const d of [2,5,8,12,20])for(const a of [1,3,7])cases.push({name:'day'+d+'_'+a+'d',file:'day'+d+'.json',away:a*DAY});
cases.push({name:'day12_pick_1d',file:'day12.json',away:DAY,f:s=>{s.uOffer=['fast','bright','far'];}});
cases.push({name:'day2_arrived_1d',file:'day2.json',away:DAY,f:s=>{s.cleared=true;s.dist=1e4;}});
cases.push({name:'day20_30d',file:'day20.json',away:30*DAY});
(async()=>{const b=await chromium.launch();const errs=[];
for(const c of cases){const o=JSON.parse(fs.readFileSync(path.join(DIR,c.file),'utf8'));o.flags=Object.assign({},o.flags,{start:1});if(c.f)c.f(o);o.last=Date.now()-c.away;   // 試算ツールのセーブはプロローグを見ていない
  const ctx=await b.newContext({viewport:{width:390,height:800}});await ctx.addInitScript(x=>{if(!sessionStorage.getItem('set')){localStorage.setItem('hikari_save',x);sessionStorage.setItem('set','1');}},JSON.stringify(o));
  const p=await ctx.newPage();p.on('pageerror',e=>errs.push(c.name+': '+e.message));p.on('console',m=>{if(m.type()==='error')errs.push(c.name+' [console] '+m.text());});
  await p.goto('http://localhost:8123/');await p.waitForTimeout(1200);
  const before=await p.evaluate(()=>({E:S.E,stage:S.stage,vdist:S.vdist,dist:S.dist,years:S.years,windT:S.windT||0}));
  const t0=Date.now();await p.evaluate(()=>bootGo());await p.waitForTimeout(400);
  try{await p.waitForFunction(()=>document.getElementById('mWelcome').classList.contains('on')||pickOpen||document.getElementById('title').classList.contains('on'),null,{timeout:20000});}catch(e){errs.push(c.name+': 戻ったときの小窓が出ない');}
  const ms=Date.now()-t0;await p.waitForTimeout(1500);await p.screenshot({path:OUT+c.name+'.png'});
  const w=await p.evaluate(()=>{const m=document.getElementById('mWelcome');return m.classList.contains('on')?document.getElementById('wBody').innerText.replace(/\n/g,' '):'';});
  await p.evaluate(()=>{const m=document.getElementById('mWelcome');if(m.classList.contains('on'))document.getElementById('wOk').click();});
  const mid=await p.evaluate(()=>({E:S.E,T:typeof T!=='undefined'?T:0}));await p.waitForTimeout(5000);
  const after=await p.evaluate(()=>({E:S.E,T:typeof T!=='undefined'?T:0,stage:S.stage,vdist:S.vdist,dist:S.dist,years:S.years,windT:Math.round(S.windT||0),pick:pickOpen,halted:!!BRK||!!RST||glowOpen||wakeOpen||pickOpen,ov:[...document.querySelectorAll('.modal.on')].map(e=>e.id)}));
  const f=x=>typeof x==='number'?x.toExponential(2):x;
  console.log(c.name.padEnd(18),'処理',ms+'ms','|',w.slice(0,120),'|','段階',before.stage+'→'+after.stage,'E',f(before.E)+'→'+f(after.E),'距離',f(before.vdist||before.dist)+'→'+f(after.vdist||after.dist),'追い風',Math.round(before.windT)+'→'+after.windT+'秒','5秒で動く',after.T>mid.T&&after.E!==mid.E,'止まり',after.halted,'小窓',after.ov.join(','));
  await ctx.close();}
console.log('ERRORS',errs.length);console.log(errs.slice(0,20).join('\n'));await b.close();})();
