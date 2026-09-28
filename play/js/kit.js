/* Ink Burger prototypes: the shared shell. Screens, street meter, tips, the ticket rail, serving and walkouts, and the day
   flow for the burger week. Each prototype adds one game file that defines GAME and calls kitStart() at its end:
   GAME = {id, name, blurb, how:[...], start(D), tick(dt), stop()}. The old solitaire files stay in the repo, unused. */
"use strict";
let PB={};                       // this prototype's own saved best, kept apart from the real game's save
const pbKey=()=>'inkburger-proto-'+GAME.id;
function savePB(){try{localStorage.setItem(pbKey(),JSON.stringify(PB))}catch(e){}}

/* ---------- sizing ---------- */
function sizeKit(){
  const H=app.clientHeight||innerHeight;
  document.documentElement.style.setProperty('--railh',Math.round(Math.max(118,Math.min(170,H*.2)))+'px');
}

/* ---------- tickets: S.slots holds what's on the rail ---------- */
let TID=0,NO=0;
function newTicket(o,max){return{id:++TID,no:++NO,dish:o.dish,recipe:o.recipe,name:o.name,p:0,time:max,max,tilt:(Math.random()*3-1.5).toFixed(2)}}
function drawRail(){
  renderRail();
  rail.querySelectorAll('.ticket').forEach(el=>{
    const id=+el.dataset.tid;
    if(!S.seen.has(id)){S.seen.add(id);if(!RM)el.animate([{transform:'translateY(-70px) rotate(var(--tilt))',opacity:0},{transform:'translateY(6px) rotate(var(--tilt)) scaleY(.94)',opacity:1,offset:.7},{transform:'rotate(var(--tilt))'}],{duration:420,easing:'cubic-bezier(.3,.8,.4,1)'})}
    const st=el.querySelector('.stamp span');
    if(st&&!S.stamped.has(id)){S.stamped.add(id);if(!RM)st.animate([{transform:'scale(2.2) rotate(-20deg)',opacity:0},{transform:'scale(.92) rotate(-11deg)',opacity:1,offset:.7},{transform:getComputedStyle(st).transform}],{duration:300,easing:'ease-in'})}
  });
  GAME.afterRail&&GAME.afterRail();
}
// cheap per-frame update: patience bars and faces, without rebuilding the rail
function railBars(){
  S.slots.forEach(t=>{
    if(!t||t.done||t.gone)return;const el=rail.querySelector(`[data-tid="${t.id}"]`);if(!el)return;
    el.querySelector('.pbar i').style.width=Math.max(0,t.time/t.max*100)+'%';
    const m=mood(t);if(!el.classList.contains(m)){el.classList.remove('calm','itchy','mad');el.classList.add(m)}
  });
}
const liveTickets=()=>S.slots.filter(t=>t&&!t.done&&!t.gone);
// drop finished and walked-out tickets once their stamp has shown; true if the rail changed
function railSweep(){
  let ch=false;S.slots.forEach((t,i)=>{if(t&&t.removeAt!=null&&S.clock>=t.removeAt){S.slots[i]=null;ch=true}});return ch;
}
function serveTicket(t,bonus=0){
  const f=t.time/t.max,stars=f>.6?3:f>.3?2:1;
  t.done=true;t.stars=stars;t.removeAt=S.clock+1.1;
  const tip=stars*4+t.recipe.length+bonus;
  S.tips+=tip;S.dayTips+=tip;S.served++;
  drawRail();
  const el=rail.querySelector(`[data-tid="${t.id}"]`);
  if(el){const r=el.getBoundingClientRect();floatText('+$'+tip,r.left+r.width/2,r.top+r.height*.35)}
  addLoyalty(2+2*stars);snd('serve');haptic([12,40,12]);
  return tip;
}
function walkTicket(t){
  t.gone=true;t.removeAt=S.clock+1.3;S.walked++;
  addLoyalty(-14);snd('walk');haptic(60);drawRail();
  if(S.loyalty<=0&&S.mode==='play'){S.mode='lost';GAME.stop&&GAME.stop();setTimeout(loseScreen,1200)}
}

/* ---------- meter, tips, floating text, toast ---------- */
function hud(){$('#tips').textContent='$'+S.tips;$('#mfill').style.width=S.loyalty+'%'}
function addLoyalty(d){
  S.loyalty=Math.max(0,Math.min(100,S.loyalty+d));hud();
  const r=$('.mbar').getBoundingClientRect();floatText((d>0?'+':'')+d,r.left+r.width*S.loyalty/100,r.bottom+14);
}
function floatText(txt,x,y,cls=''){
  const el=document.createElement('div');el.className='float '+cls;el.textContent=txt;
  el.style.left=x+'px';el.style.top=y+'px';fx.appendChild(el);
  el.animate([{transform:'translate(-50%,-50%) scale(.6)',opacity:0},{transform:'translate(-50%,-90%) scale(1.15)',opacity:1,offset:.25},{transform:'translate(-50%,-190%) scale(1)',opacity:0}],{duration:1000,easing:'ease-out'}).onfinish=()=>el.remove();
}
let toastT;
function toast(msg){const t=$('#toast');t.textContent=msg;t.classList.add('show');clearTimeout(toastT);toastT=setTimeout(()=>t.classList.remove('show'),1400)}
function wiggle(el){if(!el||RM)return;el.animate([{transform:'translateX(0)'},{transform:'translateX(-5px) rotate(-2deg)'},{transform:'translateX(5px) rotate(2deg)'},{transform:'translateX(-3px)'},{transform:'none'}],{duration:260})}

/* ---------- the day ---------- */
function startShift(){
  const D=S.D=dayDef(0,S.day);
  S.loyaltyStart=S.loyalty;S.tipsStart=S.tips;
  S.slots=Array(D.rail).fill(null);S.clock=0;S.served=0;S.walked=0;S.dayTips=0;NO=0;
  S.seen.clear();S.stamped.clear();S.popping.clear();
  hide();hud();S.mode='play';last=performance.now();
  GAME.start(D);drawRail();
}
// the game calls this when its last order has gone
function endShift(){
  if(S.mode!=='play')return;S.mode='ending';GAME.stop&&GAME.stop();
  setTimeout(endDay,700);
}

/* ---------- screens ---------- */
function show(html){scr.innerHTML=`<div class="sc">${html}</div>`;scr.classList.add('show');scr.scrollTop=0;const b=scr.querySelector('.btn');b&&b.focus({preventScroll:true})}
function hide(){scr.classList.remove('show');scr.innerHTML=''}
function meterHTML(){return `<div class="meter bigmeter"><div class="mlab"><span>Ink Burger ${S.loyalty}%</span><span>Glossy's ${100-S.loyalty}%</span></div><div class="mbar"><i style="display:block;height:100%;width:${S.loyalty}%;background:var(--paper);border-right:2px solid var(--ink)"></i></div></div>`}
function recordBest(won){
  const better=won?(!PB.won||S.tips>PB.tips):(!PB.won&&(PB.day==null||S.day>PB.day||(S.day===PB.day&&S.tips>PB.tips)));
  if(better){PB.day=S.day;PB.tips=S.tips;if(won)PB.won=true;savePB()}
}
function bestLine(){
  if(PB.won)return `Best: won the week with $${PB.tips} in tips`;
  if(PB.day!=null)return `Best: reached ${DAYNAMES[PB.day]} with $${PB.tips} in tips`;
  return '';
}
function titleScreen(){
  S.mode='menu';GAME.stop&&GAME.stop();
  show(`${burgerSVG([0,1,2,4,5,8],99,null,2.6,'logo')}
    <p class="kick">Prototype</p><h1>${GAME.name}</h1>
    <p class="tag">${GAME.blurb}</p>
    <button class="btn" data-act="new">Open the kitchen</button>
    <div class="howto"><h2>How to cook</h2>${GAME.how.map(h=>`<p>${h}</p>`).join('')}</div>
    <p class="best">${bestLine()}</p>
    <p class="ver">Version ${VERSION}${ONLINE?' · ':''}${feedbackLink()}</p>`);
}
function introScreen(){
  S.mode='intro';const D=dayDef(0,S.day);
  const fresh=D.fresh.map(t=>cardHTML({id:0,t,up:true},'',null,true).replace('class="card"','class="card static"')).join('');
  show(`<p class="kick">Day ${S.day+1} of ${DAYNAMES.length}</p><h1>${D.name}</h1>
    <p class="story">${D.story}</p>
    <div class="fresh"><p>${S.day===0?'On the line today':'New on the line'}</p><div class="freshcards">${fresh}</div></div>
    ${meterHTML()}
    <button class="btn" data-act="start">Start shift</button>`);
}
function endDay(){
  const lastDay=S.day===DAYNAMES.length-1;
  recordBest(lastDay);S.mode='end';
  if(lastDay){
    show(`<p class="kick">Friday, closing time</p><h1>The street is yours</h1>
      <p class="story">You won the burger week. In the full game, Glossy's would open a pizza place next.</p>
      <div class="stats"><div><b>$${S.tips}</b><span>tips this week</span></div><div><b>${S.loyalty}%</b><span>of the street</span></div></div>
      <button class="btn" data-act="new">Run it back</button><button class="btn quiet" data-act="menu">Back to menu</button>
      <p class="ver">${feedbackLink()}</p>`);
    return;
  }
  show(`<p class="kick">${DAYNAMES[S.day]}, closing time</p><h1>Shift over</h1>
    <div class="stats"><div><b>${S.served}</b><span>served</span></div><div><b>${S.walked}</b><span>walked to Glossy's</span></div><div><b>$${S.dayTips}</b><span>in tips</span></div></div>
    ${GAME.stats?GAME.stats():''}
    ${meterHTML()}
    <button class="btn" data-act="next">Open on ${DAYNAMES[S.day+1]}</button>
    <p class="ver">${feedbackLink()}</p>`);
}
function loseScreen(){
  recordBest(false);S.mode='end';
  show(`<p class="kick">${DAYNAMES[S.day]}</p><h1>Glossy's took the street</h1>
    <p class="story">The line at Glossy's reached your front door. Ink Burger closes early today.</p>
    <div class="stats"><div><b>${S.served}</b><span>served</span></div><div><b>${S.walked}</b><span>walked out</span></div></div>
    <button class="btn" data-act="retry">Retry ${DAYNAMES[S.day]}</button><button class="btn quiet" data-act="menu">Back to menu</button>
    <p class="ver">${feedbackLink()}</p>`);
}
function pauseScreen(){
  if(S.mode!=='play')return;S.mode='paused';
  show(`<h1>Paused</h1><p class="story">The kitchen waits for you. Customers do too, for now.</p>
    <button class="btn" data-act="resume">Resume</button>
    <button class="btn quiet" data-act="retry">Restart ${DAYNAMES[S.day]}</button>
    <button class="btn quiet" data-act="sound">Sound: ${S.muted?'off':'on'}</button>
    <button class="btn quiet" data-act="menu">Quit to menu</button>
    <p class="ver">${feedbackLink()}</p>`);
}
scr.addEventListener('click',e=>{
  const b=e.target.closest('[data-act]');if(!b)return;const a=b.dataset.act;snd('pick');
  if(a==='new'){S.day=0;S.loyalty=60;S.tips=0;GAME.newRun&&GAME.newRun();introScreen()}
  else if(a==='start')startShift();
  else if(a==='next'){S.day++;introScreen()}
  else if(a==='retry'){GAME.stop&&GAME.stop();GAME.retry&&GAME.retry();S.loyalty=S.loyaltyStart;S.tips=S.tipsStart;startShift()}
  else if(a==='resume'){hide();S.mode='play';last=performance.now()}
  else if(a==='sound'){S.muted=!S.muted;b.textContent='Sound: '+(S.muted?'off':'on')}
  else if(a==='menu')titleScreen();
  else if(a==='feedback')showFeedback();
});

/* ---------- loop and startup ---------- */
let last=performance.now();
function loop(now){const dt=Math.min(.1,(now-last)/1000);last=now;if(S.mode==='play'){S.clock+=dt;GAME.tick(dt)}requestAnimationFrame(loop)}
function kitStart(){
  try{PB=JSON.parse(localStorage.getItem(pbKey())||'{}')||{}}catch(e){PB={}}
  $('#pauseBtn').addEventListener('click',pauseScreen);
  document.addEventListener('visibilitychange',()=>{if(document.hidden)pauseScreen()});
  addEventListener('resize',()=>{sizeKit();GAME.resize&&GAME.resize()});
  sizeKit();S.slots=[null,null];drawRail();hud();
  requestAnimationFrame(loop);
  titleScreen();
}
