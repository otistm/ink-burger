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
function saveBest(){try{localStorage.setItem('inkburger',JSON.stringify(BEST))}catch(e){}}

const S={mode:'menu',day:0,loyalty:60,tips:0,muted:!!BEST.muted,flipped:new Set(),popping:new Set(),seen:new Set(),stamped:new Set()};
