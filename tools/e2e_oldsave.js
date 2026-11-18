const {chromium}=require('playwright');(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:390,height:800}});
const errs=[];p.on('pageerror',e=>errs.push(e.message));p.on('console',m=>{if(m.type()==='error')errs.push(m.text());});
await p.goto('http://localhost:8123/');await p.waitForTimeout(800);
// 今の形のセーブを作って、古い形に崩す
const cases={
 voyOld:s=>{s.voy=true;s.found=4;s.uni=2;s.U=3;s.law={lc:2,td:1,ut:3};delete s.uKind;delete s.uOffer;s.tg={vs:2,ps:6,ls:1};delete s.phAuto;s.ag={rm:4,wm:2,sk:1,am:1};s.stage=30;s.maxStage=30;s.view='ph';},
 midFold:s=>{s.voy=true;s.found=4;s.uni=1;s.uOffer=['fast','calm','clear'];s.uKind=null;},
 chalVoy:s=>{s.voy=true;s.found=2;s.chal='pR';s.chalLv=2;s.voyStash={stage:30,vdist:1e9};},
 badChal:s=>{s.chal='zz';s.chalLv=1;},
 fresh60:s=>{s.stage=22;s.maxStage=22;s.E=1e40;s.Erun=1e40;}};
for(const [k,f] of Object.entries(cases)){
  const raw=await p.evaluate(()=>JSON.stringify(Object.assign(freshState(),{last:Date.now()-3*3600*1000})));
  const o=JSON.parse(raw);f(o);const c2=await b.newContext({viewport:{width:390,height:800}});await c2.addInitScript(x=>{if(!sessionStorage.getItem('set')){localStorage.setItem('hikari_save',x);sessionStorage.setItem('set','1');}},JSON.stringify(o));
  const q=await c2.newPage();q.on('pageerror',e=>errs.push(k+': '+e.message));await q.goto('http://localhost:8123/');await q.waitForTimeout(1200);await q.evaluate(()=>bootGo());await q.waitForTimeout(3000);
  const r=await q.evaluate(()=>({U:S.U,law:S.law,tg:S.tg,L:S.L,ag:S.ag,pick:typeof pickOpen!=='undefined'&&pickOpen,stage:S.stage,E:S.E}));
  console.log(k,JSON.stringify(r));await q.screenshot({path:require('os').tmpdir()+'/old_'+k+'.png'});await c2.close();}
console.log('errs',errs.length,errs.slice(0,8));await b.close();})();
