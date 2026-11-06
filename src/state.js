'use strict';
/* =====================================================================
   STATE ― ゲームの状態とセーブ
   ===================================================================== */
function freshState(){return{v:SAVE_VERSION,E:0,Erun:0,maxE:0,dev:DEVICES.map(()=>0),frac:DEVICES.map(()=>0),upg:[],stage:0,maxStage:0,W:0,wTotal:0,skills:[],prestiges:0,peakP:0,
  battery:0,years:0,dist:0,lost:0,greyLost:false,flags:{},ach:[],log:[],taps:0,deposited:false,idleBack:false,cleared:false,
  runTime:0,pulse:0,burst:0,over:0,overMul:1,batDep:0,released:false,auto:DEVICES.map(()=>1),autoT:[0,0,0,0,0,0,0,0],autoBud:0.5,autoBought:0,autoAcc:true,autoTier:true,autoRel:true,sling:0,coast:0,crit:0,tier:[1,1,1,1,1,1,1,1],region:0,
  L:0,lTotal:0,restarts:0,ag:{},lit:[],prevSkills:[],sig:0,loopTime:0,
  chal:null,voy:false,vdist:0,vbest:0,vL:0,found:0,T:0,tTotal:0,tg:{},uni:0,U:0,uTotal:0,law:{},uHist:[],ubest:0,uTime:0,uTint:0,lightDone:false,lightAt:0,lightUni:0,st:freshStats(),last:Date.now()};}
/* 統計（ETC の STATS）。2026-11-06 から数え始める */
function freshStats(){return {since:Date.now(),play:0,idle:0,stops:0,loops:[],chal:{},dest:{},redraws:0};}
let S=freshState();
function has(id){if(S.skills.includes(id)||S.lit.includes(id))return true;const l=S.chal==='eL'?0:(S.ag.am||0);if(!l||id[0]!=='a')return false;for(let k=1;k<=l;k++)if(AM_GRANT[k].includes(id))return true;return false;}
function law(id){return S.law[id]||0;}
function glow(id){return S.chal==='eL'?0:(S.ag[id]||0);}   // チャレンジ「残光なし」の間は残光の強化が効かない
function upgHas(id){return S.upg.includes(id);}
function save(){S.last=Date.now();try{localStorage.setItem(SAVE_KEY,JSON.stringify(S));}catch(e){}}
function normalize(o){const f=freshState();const s=Object.assign(f,o);s.dev=DEVICES.map((_,i)=>(o.dev&&o.dev[i])||0);s.frac=DEVICES.map((_,i)=>(o.frac&&o.frac[i])||0);s.auto=DEVICES.map((_,i)=>(o.auto&&o.auto[i]===0)?0:1);s.autoT=(o.autoT||[0,0,0,0,0,0,0,0]).slice(0,8);
  s.skills=(o.skills||[]).filter(id=>SKILLS.some(k=>k.id===id));s.tier=DEVICES.map((_,i)=>(o.tier&&o.tier[i])||((o.upg||[]).includes('u'+i+'b')?3:(o.upg||[]).includes('u'+i+'a')?2:1));s.ag=(o.ag&&typeof o.ag==='object')?o.ag:{};s.tg=(o.tg&&typeof o.tg==='object')?o.tg:{};s.law=(o.law&&typeof o.law==='object')?o.law:{};s.uHist=Array.isArray(o.uHist)?o.uHist:[];s.st=Object.assign(freshStats(),(o.st&&typeof o.st==='object')?o.st:{});if(o.ubest==null)s.ubest=s.vbest||0;if(!s.flags.bat&&(s.deposited||s.restarts>0||s.voy||s.lost>=1||s.prestiges>0))s.flags.bat=1;   /* 蓄電池は故郷の最初の1年で開く（2026-11-06）。それより前のセーブで進んでいれば開いておく */   /* ④より前のセーブは、宇宙 I でいちばん遠く行った距離をそのまま使う */if(s.vL>64)s.vL=s.vdist>=1e4?Math.floor(Math.log2(s.vdist/1e4))+1:0;   /* 1万光年ごとに数えていた頃のセーブを読み替える */s.lit=(o.lit||[]).filter(id=>SKILLS.some(k=>k.id===id&&k.glow));s.prevSkills=(o.prevSkills||[]).filter(id=>SKILLS.some(k=>k.id===id));if((o.v||1)<6){if((o.skills||[]).includes('aS'))s.W+=2048;if(s.ag.am>2){s.ag.am=2;s.L+=20;}}delete s.stopK;delete s.autoStop;  /* 版6で自動の緊急停止をなくした。使った歪みと残光は返す */const add=(o.v||1)<3?9:o.v===3?5:0;if(add){if(s.stage>0)s.stage+=add;if(s.maxStage>0)s.maxStage+=add;}s.v=SAVE_VERSION;return s;}
function load(){try{const t=localStorage.getItem(SAVE_KEY);if(!t)return false;const o=JSON.parse(t);if(!o||!o.v)return false;S=normalize(o);return true;}catch(e){return false;}}
function exportSave(){return btoa(unescape(encodeURIComponent(JSON.stringify(S))));}
function importSave(txt){const o=JSON.parse(decodeURIComponent(escape(atob(txt.trim()))));if(!o||!o.v)throw new Error('format');S=normalize(o);}

const FXQ={};   // 経済の計算から演出への合図
