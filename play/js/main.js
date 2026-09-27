/* Ink Burger: main loop and startup (always last). */
"use strict";
let last=performance.now();
function loop(now){const dt=Math.min(.1,(now-last)/1000);last=now;if(S.mode==='play')tick(dt);requestAnimationFrame(loop)}
requestAnimationFrame(loop);

document.addEventListener('visibilitychange',()=>{if(document.hidden)pauseScreen()});
addEventListener('resize',()=>{sizeCards();if(S.cols)render()});

sizeCards();
S.day=0;startDay();renderRail();renderMid();renderTab();
titleScreen();
