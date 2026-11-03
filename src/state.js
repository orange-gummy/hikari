'use strict';
/* =====================================================================
   STATE ― ゲームの状態とセーブ
   ===================================================================== */
function freshState(){return{v:SAVE_VERSION,E:0,Erun:0,maxE:0,dev:DEVICES.map(()=>0),frac:DEVICES.map(()=>0),upg:[],stage:0,maxStage:0,W:0,wTotal:0,skills:[],prestiges:0,peakP:0,
  battery:0,years:0,dist:0,lost:0,greyLost:false,flags:{},ach:[],log:[],taps:0,deposited:false,idleBack:false,cleared:false,
  runTime:0,pulse:0,burst:0,over:0,overMul:1,batDep:0,released:false,auto:[1,1,1,1,1,1,1,1],autoT:[0,0,0,0,0,0,0,0],autoBud:0.5,autoBought:0,autoAcc:true,autoTier:true,autoRel:true,autoStop:true,sling:0,coast:0,crit:0,tier:[1,1,1,1,1,1,1,1],wsBuilt:0,region:0,
  L:0,lTotal:0,restarts:0,ag:{},stopK:2,last:Date.now()};}
let S=freshState();
function has(id){if(S.skills.includes(id))return true;const l=S.ag.am||0;if(!l||id[0]!=='a')return false;for(let k=1;k<=l;k++)if(AM_GRANT[k].includes(id))return true;return false;}
function glow(id){return S.ag[id]||0;}
function upgHas(id){return S.upg.includes(id);}
function save(){S.last=Date.now();try{localStorage.setItem(SAVE_KEY,JSON.stringify(S));}catch(e){}}
function normalize(o){const f=freshState();const s=Object.assign(f,o);s.dev=DEVICES.map((_,i)=>(o.dev&&o.dev[i])||0);s.frac=DEVICES.map((_,i)=>(o.frac&&o.frac[i])||0);s.auto=(o.auto||[1,1,1,1,1,1,1,1]).slice(0,8).map(v=>v?1:0);s.autoT=(o.autoT||[0,0,0,0,0,0,0,0]).slice(0,8);
  s.skills=(o.skills||[]).filter(id=>SKILLS.some(k=>k.id===id));s.tier=DEVICES.map((_,i)=>(o.tier&&o.tier[i])||((o.upg||[]).includes('u'+i+'b')?3:(o.upg||[]).includes('u'+i+'a')?2:1));s.ag=(o.ag&&typeof o.ag==='object')?o.ag:{};if(!STOP_K.includes(s.stopK))s.stopK=2;const add=(o.v||1)<3?9:o.v===3?5:0;if(add){if(s.stage>0)s.stage+=add;if(s.maxStage>0)s.maxStage+=add;}s.v=SAVE_VERSION;return s;}
function load(){try{const t=localStorage.getItem(SAVE_KEY);if(!t)return false;const o=JSON.parse(t);if(!o||!o.v)return false;S=normalize(o);return true;}catch(e){return false;}}
function exportSave(){return btoa(unescape(encodeURIComponent(JSON.stringify(S))));}
function importSave(txt){const o=JSON.parse(decodeURIComponent(escape(atob(txt.trim()))));if(!o||!o.v)throw new Error('format');S=normalize(o);}

const FXQ={};   // 経済の計算から演出への合図
