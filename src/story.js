'use strict';
/* =====================================================================
   STORY ― 日誌、色の喪失、区域
   ===================================================================== */
function achCheck(){const got=[];for(const a of ACHIEVEMENTS)if(!S.ach.includes(a[0])&&a[3](S)){S.ach.push(a[0]);got.push(a);}return got;}   // 新しく取った実績を返す
function story(key,text,color){if(key&&S.flags[key])return;if(key)S.flags[key]=1;logLine(text,color==null?-1:color);}
function logLine(text,color){S.log.push({y:Math.floor(S.years),t:text,c:color});if(S.log.length>200)S.log.shift();subtitle(text);if(typeof curTab!=='undefined'&&curTab==='log')renderPanel(true);}
function checkStory(){chalCheck();
  for(const [k,v] of [['y100',100],['y1000',1000]])if(S.years>=v)story(k,LINES[k]);
  const r=regionIndex(S.dist);if(r!==S.region){S.region=r;if(has('pS'))S.sling=60;if(REGIONS[r].line)story('reg'+r,REGIONS[r].line);FXQ.region=true;}
  if(S.dist>=GOAL_LY/2&&!S.cleared)story('half',LINES.half);if(S.dist>=GOAL_LY*0.97&&!S.cleared)story('near',LINES.near);if(S.dist>=GOAL_LY&&!S.cleared&&typeof climax!=='undefined'&&!climax)startClimax();
  while(!S.voy&&S.lost<6&&S.years>=LOSE_YEARS[S.lost]){const i=S.lost;S.lost++;homeLetter();queueVisual(()=>visualLose(i));}
}
function homeLetter(){if(has('cG'))S.sig=sp('cG');if(!has('cL'))return;const g=prodRate()*600;S.E+=g;S.Erun+=g;FXQ.letter=g;}
function forceLoseAll(){if(S.voy)return;while(S.lost<6){const i=S.lost;S.lost++;homeLetter();queueVisual(()=>visualLose(i));}if(!S.greyLost){S.greyLost=true;homeLetter();queueVisual(()=>visualLose(6));}}
