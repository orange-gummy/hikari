'use strict';
/* =====================================================================
   SOUND ― 効果音と音楽（2026-11-22 作り直し。前は電子音の掃引・鋸波・鈴が混ざって統一感がなかった）
   ・音色はひとつの楽器にそろえる：フェルトを当てたピアノ（打鍵の小さな雑音、少しずれた倍音、ゆっくり消える）と、
     その柔らかい持続音（パッド）。電子音の掃引（ピューン）や鋸波はやめる。
   ・音はすべてニ長調の五音（7色の音）から。毎回わずかに音程と強さが揺れる（人が弾いたように）。
   ・音楽：ごく低い持続音の上に、持っている色の音だけを、間をあけてぽつぽつ鳴らす。色を失うとその音が曲から消え、
     取り戻すと戻る。航海で見つけた4色は高い音として加わる。
   ===================================================================== */
const SND=(()=>{
  let ac=null,master=null,dry=null,wet=null,warm=null,vol=0.7,on=true,mus=null,musVol=0.5;
  const COLOR_HZ=[587.33,659.25,739.99,880.00,987.77,1174.66,440.00];   // 7色（灰だけ低い）
  const NEW_HZ=[1318.51,1479.98,1760.00,1975.53];                           // 航海で見つけた4色
  const R=(a,b)=>a+Math.random()*(b-a);
  function unlock(ctx){
    if(!ac){const C=window.AudioContext||window.webkitAudioContext;ac=ctx||(C?new C():null);if(!ac)return;
      const comp=ac.createDynamicsCompressor();comp.threshold.value=-20;comp.ratio.value=2.5;comp.connect(ac.destination);
      master=ac.createGain();master.gain.value=vol;master.connect(comp);
      // 全体に薄い「温度」：高い音を少し丸める
      warm=ac.createBiquadFilter();warm.type='lowpass';warm.frequency.value=5200;warm.Q.value=0.4;warm.connect(master);
      dry=ac.createGain();dry.gain.value=1;dry.connect(warm);
      // 残響：広い部屋（立ち上がりの遅い減衰ノイズ、左右で少し違う）
      const len=Math.round(ac.sampleRate*4.2),ir=ac.createBuffer(2,len,ac.sampleRate);
      for(let c=0;c<2;c++){const d=ir.getChannelData(c);let lp=0;for(let i=0;i<len;i++){const t=i/len;lp=lp*0.6+(Math.random()*2-1)*0.4;d[i]=lp*Math.pow(1-t,3)*Math.min(1,i/(ac.sampleRate*0.02));}}
      const cv=ac.createConvolver();cv.buffer=ir;wet=ac.createGain();wet.gain.value=0.42;wet.connect(cv);cv.connect(warm);}
    if(ac.state==='suspended'&&ac.resume)ac.resume();}
  const now=()=>ac.currentTime;
  function out(node,w){node.connect(dry);const g=ac.createGain();g.gain.value=w==null?0.5:w;node.connect(g);g.connect(wet);}
  /* フェルトのピアノ：倍音を少し伸ばして重ね（弦の硬さ）、高い倍音ほど早く消える。打鍵にごく短い雑音 */
  function piano(f,o){o=o||{};const t=now()+(o.at||0),v=(o.g||0.1)*R(0.85,1.08),d=(o.d||2.4)*R(0.9,1.1),cents=R(-4,4);f*=Math.pow(2,cents/1200);
    const bus=ac.createGain();bus.gain.value=1;const lp=ac.createBiquadFilter();lp.type='lowpass';lp.frequency.setValueAtTime(o.bright||2600,t);lp.frequency.exponentialRampToValueAtTime(Math.max(300,(o.bright||2600)*0.35),t+d);bus.connect(lp);out(lp,o.wet);
    [[1,1],[2.003,0.42],[3.009,0.18],[4.02,0.09],[5.04,0.05]].forEach(([m,k],i)=>{if(f*m>9000)return;const os=ac.createOscillator(),gn=ac.createGain();os.type='sine';os.frequency.value=f*m;const di=d/(1+i*0.9);
      gn.gain.setValueAtTime(0.0001,t);gn.gain.exponentialRampToValueAtTime(v*k,t+0.006);gn.gain.exponentialRampToValueAtTime(v*k*0.35,t+0.18);gn.gain.exponentialRampToValueAtTime(0.0001,t+di);os.connect(gn);gn.connect(bus);os.start(t);os.stop(t+di+0.05);});
    // 打鍵（フェルト）：ごく短い、低めの雑音
    const len=Math.round(ac.sampleRate*0.03),b=ac.createBuffer(1,len,ac.sampleRate),x=b.getChannelData(0);for(let i=0;i<len;i++)x[i]=(Math.random()*2-1)*Math.pow(1-i/len,4);
    const s=ac.createBufferSource();s.buffer=b;const bp=ac.createBiquadFilter();bp.type='bandpass';bp.frequency.value=Math.min(3000,f*2);bp.Q.value=0.8;const gn=ac.createGain();gn.gain.value=v*0.35;s.connect(bp);bp.connect(gn);gn.connect(bus);s.start(t);}
  /* 柔らかい持続音：わずかにずらした三角波を2つ、ゆっくり立ち上がって消える */
  function pad(f,o){o=o||{};const t=now()+(o.at||0),a=o.a||1.2,d=o.d||4,g=(o.g||0.03);
    const lp=ac.createBiquadFilter();lp.type='lowpass';lp.frequency.setValueAtTime(o.lp||900,t);if(o.lpTo)lp.frequency.linearRampToValueAtTime(o.lpTo,t+a+d);
    const gn=ac.createGain();gn.gain.setValueAtTime(0.0001,t);gn.gain.linearRampToValueAtTime(g,t+a);gn.gain.setValueAtTime(g,t+a+d*0.3);gn.gain.exponentialRampToValueAtTime(0.0001,t+a+d);gn.connect(lp);out(lp,o.wet==null?0.7:o.wet);
    [-6,6].forEach(c=>{const os=ac.createOscillator();os.type='triangle';os.frequency.value=f;os.detune.value=c+R(-2,2);if(o.to)os.frequency.exponentialRampToValueAtTime(o.to,t+a+d);os.connect(gn);os.start(t);os.stop(t+a+d+0.1);});}
  /* 息：ごく小さな雑音のふくらみ（掃引しない） */
  function breath(o){o=o||{};const t=now()+(o.at||0),d=o.d||1.5,len=Math.round(ac.sampleRate*(d+0.1)),b=ac.createBuffer(1,len,ac.sampleRate),x=b.getChannelData(0);for(let i=0;i<len;i++)x[i]=Math.random()*2-1;
    const s=ac.createBufferSource();s.buffer=b;const lp=ac.createBiquadFilter();lp.type='lowpass';lp.frequency.value=o.f||900;const gn=ac.createGain();gn.gain.setValueAtTime(0.0001,t);gn.gain.linearRampToValueAtTime(o.g||0.02,t+d*0.5);gn.gain.linearRampToValueAtTime(0.0001,t+d);s.connect(lp);lp.connect(gn);out(gn,0.8);s.start(t);s.stop(t+d+0.1);}
  /* 効果音の音を、いま流れている和音の音に寄せる（音楽と濁らないように）。音楽が止まっているときはニ長調の五音に寄せる */
  function fit(f){let m=69+12*Math.log2(f/440);const pcs=mus&&mus.cur?CH[mus.cur][1].map(n=>n%12).concat(CH[mus.cur][0]%12):[2,4,6,9,11];let best=Math.round(m),bd=99;for(let n=Math.floor(m)-6;n<=Math.ceil(m)+6;n++){if(!pcs.includes(((n%12)+12)%12))continue;const d=Math.abs(n-m);if(d<bd){bd=d;best=n;}}return 440*Math.pow(2,(best-69)/12);}
  const pf=(f,o)=>piano(fit(f),o);
  const PENTA=[293.66,329.63,369.99,440.00,493.88];   // ニ長調の五音（低い段）
  const up=(i)=>PENTA[i%5]*Math.pow(2,Math.floor(i/5));
  const SOUNDS={
    // 操作：同じピアノのごく小さな音
    tap:()=>pf(up(10+Math.floor(R(0,5))),{g:0.018,d:0.6,bright:3200,wet:0.35}),
    buy:(i)=>pf(COLOR_HZ[(i||0)%7],{g:0.05,d:1.2,wet:0.4}),
    tab:()=>pf(1174.66,{g:0.012,d:0.35,bright:2000,wet:0.2}),
    // 節目
    accel:(stage)=>{const s=Math.min(stage||1,22),r=Math.floor(s/3);[0,2,4,7].forEach((k,j)=>pf(up(r+k),{at:j*0.11,g:0.06,d:2.2}));pad(up(r)/2,{a:0.6,d:2.6,g:0.03,lp:700,lpTo:1600});},
    milestone:()=>{pf(1174.66,{g:0.05,d:2});pf(880,{at:0.09,g:0.04,d:2});},
    tier:(i)=>{const f=COLOR_HZ[(i||0)%7];pf(f,{g:0.06,d:2});pf(f*1.5,{at:0.14,g:0.045,d:2});},
    release:()=>{[9,11,12,14,16,17,19].forEach((k,j)=>pf(up(k),{at:j*0.09,g:0.035,d:1.6,bright:3400}));pad(146.83,{a:0.8,d:3,g:0.035});},
    brake:()=>{[14,12,10,7,4].forEach((k,j)=>pf(up(k),{at:j*0.42,g:0.05-j*0.006,d:2.4,bright:2200-j*250}));pad(146.83,{a:0.4,d:3.2,g:0.04,lp:600,lpTo:180});pf(73.42,{at:2.4,g:0.12,d:3,bright:500,wet:0.3});},
    resail:()=>{pf(146.83,{g:0.08,d:1.4,bright:900});pf(146.83,{at:0.45,g:0.08,d:1.4,bright:900});[293.66,440,587.33].forEach((f,k)=>pf(f,{at:1.0+k*0.12,g:0.045,d:3}));pad(293.66,{at:1.0,a:1,d:3,g:0.025});},
    learn:(br)=>pf([739.99,880,1174.66,587.33][br||0],{g:0.06,d:1.8}),
    light:()=>{[0,2,4].forEach((k,j)=>pf(up(10+k),{at:j*0.06,g:0.035,d:2,bright:3400}));},
    // 色：失うときはこもって消え、少しだけ音程が下がる。戻るときは同じ音がはっきり鳴る
    lose:(i)=>{const f=COLOR_HZ[i||0];pf(f,{g:0.09,d:3.6,bright:1800});pad(f,{at:0.1,a:0.3,d:3.2,g:0.025,lp:1500,lpTo:200,to:f*0.97});},
    back:(i)=>{const f=COLOR_HZ[i||0];pf(f,{g:0.1,d:3.2,bright:3200});pf(f/2,{at:0.05,g:0.05,d:3});pad(f/2,{a:1,d:3,g:0.025});},
    hear:()=>{COLOR_HZ.forEach((f,k)=>pf(f/2,{at:k*0.5,g:0.04,d:5,bright:1400,wet:0.8}));pad(146.83,{a:2,d:6,g:0.03});},
    fold:()=>{[19,16,14,12,9,7,4,2,0].forEach((k,j)=>pf(up(k),{at:j*0.35,g:0.04,d:2.6,bright:2400-j*180}));pad(73.42,{at:3.2,a:0.8,d:3,g:0.05,lp:300});[293.66,440,587.33,739.99].forEach((f,k)=>pf(f,{at:6.5+k*0.15,g:0.045,d:3.6}));pad(293.66,{at:6.5,a:1.5,d:4,g:0.025});},
    lightEnd:()=>{[0,2,4,5,7,9,10,12,14,15].forEach((k,j)=>pf(up(k+5),{at:j*0.12,g:0.04,d:3,bright:3600}));pad(146.83,{at:1.2,a:3,d:8,g:0.03,wet:0.9});[146.83,220,293.66,440].forEach((f,k)=>pf(f,{at:7.8+k*0.4,g:0.04,d:6,wet:0.8}));pf(1174.66,{at:10,g:0.045,d:6});},
    catch:(k)=>pf(up(10+Math.min(k||0,12)),{g:0.04,d:0.9,bright:3400}),
    land:()=>{[146.83,220,293.66,369.99,440,587.33].forEach((f,k)=>pf(f,{at:k*0.09,g:0.05,d:5}));pad(293.66,{a:1.5,d:5,g:0.03});pf(1174.66,{at:0.7,g:0.045,d:4});}
  };
  const GAP={catch:0.03,accel:1.2,tier:0.6,milestone:0.5,buy:0.06,tap:0.04,learn:0.15,lose:1,back:1},last={};
  function play(name,arg){if(!on||vol<=0||!ac||!SOUNDS[name]||(typeof document!=='undefined'&&document.hidden))return;const t=ac.currentTime;if(GAP[name]&&last[name]!=null&&t-last[name]<GAP[name])return;last[name]=t;try{SOUNDS[name](arg);}catch(e){}}
  /* 音楽（2026-11-22）：ニ長調のゆっくりした和音の進行（1和音＝2小節、64BPM）。柔らかい和音の帯、和音の変わり目にピアノの低い音（伸ばさない）、
     その上をピアノの旋律が和音の音を中心に、近い音へ動きながらぽつぽつ歌う。進行は3つから選び、ときどき休む小節がある */
  const mid=n=>440*Math.pow(2,(n-69)/12);
  // 和音：[根音, 和音の音（中の高さ）, 旋律に使う音（高い段の候補）]
  const CH={Dmaj9:[38,[62,66,69,73,76]],Bm7:[47,[59,62,66,69,74]],Gmaj7:[43,[59,62,66,67,71]],A6:[45,[61,64,66,69,73]],Asus:[45,[62,64,69,71,76]],Em9:[40,[59,62,64,66,71]],'D/F#':[42,[62,66,69,74,78]],F_m7:[42,[61,64,66,69,73]]};
  const PROG=[['Dmaj9','Bm7','Gmaj7','Asus'],['Gmaj7','D/F#','Em9','A6'],['Bm7','Gmaj7','Dmaj9','A6'],['Dmaj9','F_m7','Gmaj7','Asus']];
  const MEL=[69,71,73,74,76,78,81,83,85,86];   // 旋律の音（ニ長調の高い段）
  const BEAT=60/64;
  function musicStart(){if(!ac||mus)return;const g=ac.createGain();g.gain.value=0.0001;g.gain.linearRampToValueAtTime(musVol,now()+4);g.connect(dry);
    mus={g,t:now()+1.5,prog:PROG[0],ci:0,last:76};musicTick();}
  function chordAt(at,name){const [root,tones]=CH[name],len=BEAT*8;
    piano(mid(root),{at,g:0.05*musVol,d:5,bright:700,wet:0.6});                                   // 変わり目に低い音を一つ（伸ばさない）
    tones.slice(0,4).forEach((n,k)=>pad(mid(n),{at:at+k*0.08,a:2.2,d:len,g:0.0075*musVol,lp:1300,wet:0.9}));   // 和音の帯（ゆっくり立ち上がり、次の和音へ重なって消える）
    if(Math.random()<0.6)tones.slice(1,4).forEach((n,k)=>piano(mid(n),{at:at+BEAT*0.5+k*0.18,g:0.022*musVol,d:3.5,bright:1600,wet:0.8}));}   // ときどき和音をそっと分散で
  function melodyBar(at,name){const tones=CH[name][1].map(n=>n%12),rest=Math.random()<0.2;if(rest)return;
    for(let b=0;b<8;b++){if(Math.random()>0.38)continue;   // 拍の4割ほどだけ鳴らす
      const cand=MEL.filter(n=>Math.abs(n-mus.last)<=5),pool=cand.filter(n=>tones.includes(n%12)),pick=(pool.length&&Math.random()<0.7?pool:cand.length?cand:MEL),n=pick[Math.floor(Math.random()*pick.length)];
      mus.last=n;const tt=at+b*BEAT+R(-0.02,0.03)+(Math.random()<0.2?BEAT/2:0);piano(mid(n),{at:tt,g:0.034*musVol*R(0.8,1.1),d:3.2,bright:2200,wet:0.8});
      if(Math.random()<0.15){const n2=MEL[Math.max(0,MEL.indexOf(n)-1)];piano(mid(n2),{at:tt+BEAT/2,g:0.026*musVol,d:2.8,bright:2000,wet:0.8});mus.last=n2;}}}
  function musicTick(h){if(!mus)return;const t=now();while(mus.t<t+(h||1)){const name=mus.prog[mus.ci],at=Math.max(0,mus.t-t);
      mus.cur=name;chordAt(at,name);melodyBar(at,name);mus.t+=BEAT*8;mus.ci++;
      if(mus.ci>=mus.prog.length){mus.ci=0;mus.prog=PROG[Math.floor(Math.random()*PROG.length)];if(Math.random()<0.3)mus.t+=BEAT*4;}}   // 1巡ごとに進行を選び直し、ときどき1小節休む
    if(typeof setTimeout!=='undefined'&&!mus.offline)mus.timer=setTimeout(musicTick,1000);}
  function musicStop(){if(!mus)return;const m=mus;mus=null;clearTimeout(m.timer);m.g.gain.cancelScheduledValues(now());m.g.gain.setValueAtTime(m.g.gain.value,now());m.g.gain.linearRampToValueAtTime(0.0001,now()+3);}
  function setVolume(v){vol=v;if(master)master.gain.value=v;}
  function setOn(v){on=!!v;}
  return {unlock,play,setVolume,setOn,musicStart,musicStop,musicTick,get mus(){return mus;},get on(){return on;},get volume(){return vol;},COLOR_HZ,piano,pad};
})();
