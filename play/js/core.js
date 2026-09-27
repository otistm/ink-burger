/* Ink Burger: small helpers, saved progress and the game state S. */
"use strict";
const $=s=>document.querySelector(s);
const app=$('#app'),rail=$('#rail'),tab=$('#tab'),fx=$('#fx'),scr=$('#screen');
const RM=matchMedia('(prefers-reduced-motion: reduce)').matches;
const rnd=(a,b)=>a+Math.floor(Math.random()*(b-a+1));
const shuffle=a=>{for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a};
const haptic=ms=>{try{navigator.vibrate&&navigator.vibrate(ms)}catch(e){}};
let CW=70,CH=92;

let BEST={};
try{BEST=JSON.parse(localStorage.getItem('inkburger')||'{}')||{}}catch(e){BEST={}}
// Older saves (before weeks) kept only day, tips and won for the one burger week. Carry them over, and let anyone who
// already won that week carry on into week 2. The old fields stay as they were.
if(!BEST.best&&BEST.day!=null){
  BEST.best=BEST.won?{week:1,day:0,tips:BEST.tips|0,won:false}:{week:0,day:BEST.day|0,tips:BEST.tips|0,won:false};
  if(BEST.won&&!BEST.run)BEST.run={v:1,week:1,day:0,loyalty:60,tips:BEST.tips|0};
}
function saveBest(){try{localStorage.setItem('inkburger',JSON.stringify(BEST))}catch(e){}}

const S={mode:'menu',week:0,day:0,loyalty:60,tips:0,muted:!!BEST.muted,flipped:new Set(),popping:new Set(),seen:new Set(),stamped:new Set()};
