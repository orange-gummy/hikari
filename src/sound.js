'use strict';
/* =====================================================================
   SOUND ― 効果音（Web Audio でその場で合成する。音のファイルは使わない）
   SND.unlock() を最初のタップで呼ぶ。SND.play(名前, 引数) で鳴らす。
   ゲームの状態には触れない（試聴ページでもそのまま使うため）。
   ===================================================================== */
const SND=(()=>{
  let ac=null,master=null,dry=null,wet=null,vol=0.7,on=true;
  // 7色の音（失う順。ニ長調の五音から。灰だけ低い）
  const COLOR_HZ=[587.33,659.25,739.99,880.00,987.77,1174.66,440.00];
  function unlock(){
    if(!ac){const C=window.AudioContext||window.webkitAudioContext;if(!C)return;ac=new C();
      const comp=ac.createDynamicsCompressor();comp.threshold.value=-18;comp.ratio.value=3;comp.connect(ac.destination);
      master=ac.createGain();master.gain.value=vol;master.connect(comp);
      dry=ac.createGain();dry.gain.value=1;dry.connect(master);
      // 宇宙の広さ：減衰するノイズで作った残響
      const len=ac.sampleRate*3.2,ir=ac.createBuffer(2,len,ac.sampleRate);
      for(let c=0;c<2;c++){const d=ir.getChannelData(c);for(let i=0;i<len;i++)d[i]=(Math.random()*2-1)*Math.pow(1-i/len,2.6);}
      const cv=ac.createConvolver();cv.buffer=ir;wet=ac.createGain();wet.gain.value=0.38;wet.connect(cv);cv.connect(master);}
    if(ac.state==='suspended')ac.resume();
  }
  const now=()=>ac.currentTime;
  // 音をひとつ：周波数、波形、立ち上がり、長さ、大きさ、残響の量、音程の行き先
  function tone(f,o){o=o||{};const t=now()+(o.at||0),a=o.a||0.005,d=o.d||0.6,g=o.g||0.2;
    const os=ac.createOscillator(),gn=ac.createGain();os.type=o.type||'sine';os.frequency.setValueAtTime(f,t);
    if(o.to)os.frequency.exponentialRampToValueAtTime(o.to,t+(o.glide||d));if(o.detune)os.detune.value=o.detune;
    gn.gain.setValueAtTime(0.0001,t);gn.gain.exponentialRampToValueAtTime(g,t+a);gn.gain.exponentialRampToValueAtTime(0.0001,t+a+d);
    let out=gn;if(o.lp){const lp=ac.createBiquadFilter();lp.type='lowpass';lp.frequency.setValueAtTime(o.lp,t);if(o.lpTo)lp.frequency.exponentialRampToValueAtTime(o.lpTo,t+a+d);gn.connect(lp);out=lp;}
    os.connect(gn);out.connect(dry);const w=ac.createGain();w.gain.value=o.wet==null?0.5:o.wet;out.connect(w);w.connect(wet);
    os.start(t);os.stop(t+a+d+0.05);}
  // 鈴：倍音をずらして重ねる
  function bell(f,o){o=o||{};const g=o.g||0.12;[[1,1],[2.01,0.45],[3.03,0.22],[4.2,0.1]].forEach(([m,k],i)=>tone(f*m,Object.assign({},o,{g:g*k,d:(o.d||1.8)/(1+i*0.6),a:0.004})));}
  // 息のようなノイズ：帯域を動かして風切りにする
  function air(o){o=o||{};const t=now()+(o.at||0),d=o.d||1,len=Math.ceil(ac.sampleRate*(d+0.1)),b=ac.createBuffer(1,len,ac.sampleRate),x=b.getChannelData(0);for(let i=0;i<len;i++)x[i]=Math.random()*2-1;
    const s=ac.createBufferSource();s.buffer=b;const bp=ac.createBiquadFilter();bp.type='bandpass';bp.Q.value=o.q||1.2;bp.frequency.setValueAtTime(o.f0||400,t);bp.frequency.exponentialRampToValueAtTime(o.f1||2400,t+d);
    const gn=ac.createGain();gn.gain.setValueAtTime(0.0001,t);gn.gain.exponentialRampToValueAtTime(o.g||0.08,t+d*(o.peak||0.6));gn.gain.exponentialRampToValueAtTime(0.0001,t+d);
    s.connect(bp);bp.connect(gn);gn.connect(dry);const w=ac.createGain();w.gain.value=0.6;gn.connect(w);w.connect(wet);s.start(t);s.stop(t+d+0.1);}
  const R=(a,b)=>a+Math.random()*(b-a);
  const SOUNDS={
    // 操作（ごく小さく）
    tap:()=>tone(R(1900,2300),{d:0.07,g:0.025,wet:0.25}),
    buy:(i)=>{const f=COLOR_HZ[(i||0)%7];tone(f,{type:'triangle',d:0.22,g:0.05,lp:3000,wet:0.3});tone(f*2,{d:0.15,g:0.015,at:0.01,wet:0.3});},
    tab:()=>tone(1320,{d:0.05,g:0.015,wet:0.2}),
    // 節目
    accel:(stage)=>{const s=stage||1,base=110*Math.pow(2,Math.min(s,22)/12);air({d:1.6,f0:300,f1:3200+s*120,g:0.07,peak:0.75});
      tone(base,{type:'sawtooth',d:1.4,a:0.9,g:0.03,lp:500,lpTo:2400,to:base*2,glide:1.3});tone(base*3,{at:1.05,d:1.6,g:0.06});},
    milestone:()=>bell(1760,{d:1.1,g:0.07}),
    tier:(i)=>{const f=COLOR_HZ[(i||0)%7];bell(f,{d:1.4,g:0.09});bell(f*1.5,{at:0.12,d:1.2,g:0.06});},
    release:()=>{air({d:1.0,f0:200,f1:5000,g:0.06,peak:0.9});[0,1,2,3,4].forEach(k=>bell(COLOR_HZ[k]*2,{at:0.85+k*0.05,d:1.3,g:0.035}));tone(73.4,{at:0.85,d:1.6,g:0.12,type:'sine'});},
    brake:()=>{tone(660,{type:'sawtooth',a:0.05,d:2.4,g:0.035,to:55,glide:2.4,lp:1800,lpTo:200});air({d:2.4,f0:3000,f1:150,g:0.05,peak:0.2,q:0.8});
      tone(48,{at:2.4,a:0.003,d:0.9,g:0.35,to:30,glide:0.5,wet:0.2});},   // 2.4秒で止まり、そのあと静寂
    resail:()=>{tone(146.8,{d:0.35,g:0.12,wet:0.3});tone(146.8,{at:0.45,d:0.35,g:0.12,wet:0.3});[293.7,440,587.3].forEach((f,k)=>tone(f,{at:1.0+k*0.08,a:0.6,d:1.8,g:0.05}));},
    learn:(br)=>{const f=[740,880,1174.7,587.3][br||0];bell(f,{d:1.0,g:0.08});},
    light:()=>{[0,1,2,3,4,5].forEach(k=>bell(1174.7*Math.pow(2,k/6),{at:k*0.07,d:1.4,g:0.04}));tone(293.7,{a:0.4,d:2.0,g:0.05});},
    // 色
    lose:(i)=>{const f=COLOR_HZ[i||0];tone(f,{d:3.2,g:0.12,lp:6000,lpTo:300,detune:0});tone(f,{d:3.2,g:0.06,detune:-35,at:0.02});tone(f*2,{d:1.2,g:0.03});},   // こもって、少し狂って消える
    back:(i)=>{const f=COLOR_HZ[i||0];bell(f,{d:2.6,g:0.12});tone(f/2,{a:0.5,d:2.4,g:0.05});},
    // 到着
    hear:()=>{COLOR_HZ.forEach((f,k)=>tone(f/2,{at:k*0.35,a:2.0,d:5.0,g:0.035}));},
    fold:()=>{air({d:4.0,f0:4000,f1:120,g:0.07,peak:0.3,q:0.7});tone(880,{type:'triangle',a:0.3,d:3.8,g:0.04,to:110,glide:3.8,lp:3000,lpTo:300});tone(36.7,{at:4.0,a:0.003,d:1.2,g:0.3,wet:0.3});bell(1174.7,{at:6.4,d:3,g:0.06});[293.7,440,587.3,740].forEach((f,k)=>tone(f,{at:6.5+k*0.12,a:1.0,d:3.5,g:0.04}));},
    lightEnd:()=>{air({d:1.2,f0:300,f1:6000,g:0.08,peak:0.9});tone(110,{type:'sawtooth',a:0.8,d:1.2,g:0.04,to:880,glide:1.1,lp:600,lpTo:5000});tone(1760,{at:1.0,d:6,g:0.03,wet:0.9});[146.8,220,293.7,440].forEach((f,k)=>tone(f,{at:7.8+k*0.4,a:2.5,d:7,g:0.035,wet:0.8}));bell(1174.7,{at:10,d:5,g:0.05});},
    catch:(k)=>{const f=880*Math.pow(2,Math.min(k||0,24)/12);bell(f,{d:0.6,g:0.05});tone(f*2,{d:0.15,g:0.02});},
    land:()=>{[146.8,220,293.7,370,440,587.3].forEach((f,k)=>tone(f,{at:k*0.06,a:0.8,d:6,g:0.05}));bell(1174.7,{at:0.6,d:4,g:0.05});}
  };
  // 自動で続けて起きるもの（加速・TIER・節目）は間を空けて鳴らす
  const GAP={catch:0.03,accel:1.2,tier:0.6,milestone:0.5,buy:0.06,tap:0.04,learn:0.15,lose:1,back:1},last={};
  function play(name,arg){if(!on||vol<=0||!ac||!SOUNDS[name]||document.hidden)return;const t=ac.currentTime;if(GAP[name]&&last[name]!=null&&t-last[name]<GAP[name])return;last[name]=t;try{SOUNDS[name](arg);}catch(e){}}
  function setVolume(v){vol=v;if(master)master.gain.value=v;}
  function setOn(v){on=!!v;}
  return {unlock,play,setVolume,setOn,get on(){return on;},get volume(){return vol;},COLOR_HZ};
})();
