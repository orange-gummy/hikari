'use strict';
/* =====================================================================
   UI ― 画面と操作
   ===================================================================== */
const frameEl=document.getElementById('frame'),ringEl=document.getElementById('ring'),consEl=document.getElementById('cons'),pbody=document.getElementById('pbody');
const NS='http://www.w3.org/2000/svg';
function el(t,a,p){const e=document.createElementNS(NS,t);for(const k in a)e.setAttribute(k,a[k]);if(p)p.appendChild(e);return e;}
const UNITS=[[1e68,'無量大数'],[1e64,'不可思議'],[1e60,'那由他'],[1e56,'阿僧祇'],[1e52,'恒河沙'],[1e48,'極'],[1e44,'載'],[1e40,'正'],[1e36,'澗'],[1e32,'溝'],[1e28,'穣'],[1e24,'秭'],[1e20,'垓'],[1e16,'京'],[1e12,'兆'],[1e8,'億'],[1e4,'万']];
let numKanji=false;try{numKanji=localStorage.getItem('hikari_num')==='1';}catch(e){}
function fmtParts(n){if(!isFinite(n))return['∞',''];if(n<1e4){if(n<10)return[n.toFixed(n<1&&n>0?2:1).replace(/\.0$/,''),''];return[Math.floor(n).toLocaleString('ja-JP'),''];}if(!numKanji||n>=1e72){let e=Math.floor(Math.log10(n)),m=(n/Math.pow(10,e)).toFixed(2);if(m==='10.00'){m='1.00';e++;}return[m+'e'+e,''];}for(const [v,u] of UNITS)if(n>=v){const x=n/v;return[x<10?x.toFixed(2):x<100?x.toFixed(1):Math.floor(x).toString(),u];}return[String(n),''];}
function fmt(n){const p=fmtParts(n);return p[0]+p[1];}
function fmtY(n){return n<10?n.toFixed(2):n<100?n.toFixed(1):fmt(n);}
function fmtG(g){return g<1000?g.toFixed(g<10?2:1):fmt(g);}
