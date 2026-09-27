/* Ink Burger: title, day intro, end of day, lose and pause screens. */
"use strict";
function show(html){scr.innerHTML=`<div class="sc">${html}</div>`;scr.classList.add('show');scr.scrollTop=0;const b=scr.querySelector('.btn');b&&b.focus({preventScroll:true})}
function hide(){scr.classList.remove('show');scr.innerHTML=''}
function meterHTML(){return `<div class="meter bigmeter"><div class="mlab"><span>Ink Burger ${S.loyalty}%</span><span>Glossy's ${100-S.loyalty}%</span></div><div class="mbar"><i style="display:block;height:100%;width:${S.loyalty}%;background:var(--paper);border-right:2px solid var(--ink)"></i></div></div>`}
function bestLine(){
  if(BEST.won)return `Best run: won the street with $${BEST.tips} in tips`;
  if(BEST.day!=null)return `Best run: reached ${DAYS[BEST.day].name} with $${BEST.tips} in tips`;
  return '';
}
function recordBest(won){
  const better=won?(!BEST.won||S.tips>BEST.tips):(!BEST.won&&(BEST.day==null||S.day>BEST.day||(S.day===BEST.day&&S.tips>BEST.tips)));
  if(better){BEST.day=S.day;BEST.tips=S.tips;if(won)BEST.won=true;saveBest()}
}
function titleScreen(){
  S.mode='menu';
  show(`${burgerSVG([0,1,2,4,5,8],99,null,2.6,'logo')}
    <h1>Ink Burger</h1>
    <p class="tag">Stack cards. Serve burgers. Beat the place across the street.</p>
    <button class="btn" data-act="new">Open the kitchen</button>
    <div class="howto">
      <h2>How to cook</h2>
      <p><b>Tap</b> a card to add it to the order that needs it next. Every burger builds from the bottom bun up.</p>
      <p><b>Drag</b> cards between columns. A card can sit on any card with a lower number, so columns turn into half-built burgers you can plate in one move.</p>
      <p><b>Tap the pantry</b> to flip a new card. Orders that wait too long walk across the street to Glossy's.</p>
    </div>
    <p class="best">${bestLine()}</p>
    <p class="ver">Version ${VERSION}</p>`);
  if(!RM)scr.querySelectorAll('.logo g').forEach((g,i)=>g.animate([
    {transform:'translateY(-150px)',opacity:0},{transform:'translateY(0) scale(1.18,.62)',opacity:1,offset:.68},
    {transform:'scale(.94,1.1)',offset:.84},{transform:'none'}],{duration:560,delay:150+i*140,easing:'cubic-bezier(.55,0,.8,.6)',fill:'backwards'}));
}
function introScreen(){
  S.mode='intro';const D=DAYS[S.day];
  const fresh=D.fresh.map(t=>cardHTML({id:0,t,up:true},'',null,true).replace('class="card"','class="card static"')).join('');
  show(`<p class="kick">Day ${S.day+1} of ${DAYS.length}</p><h1>${D.name}</h1>
    <p class="story">${D.story}</p>
    <div class="fresh"><p>${S.day===0?'On the line today':'New on the line'}</p><div class="freshcards">${fresh}</div></div>
    ${meterHTML()}
    <button class="btn" data-act="start">Start shift</button>`);
}
function play(){
  startDay();hide();S.mode='play';last=performance.now();
  requestAnimationFrame(()=>render({deal:true}));
}
function endDay(){
  const lastDay=S.day===DAYS.length-1;
  recordBest(lastDay);
  S.mode='end';
  if(lastDay){
    show(`<p class="kick">Friday, closing time</p><h1>The street is yours</h1>
      <p class="story">Saturday morning, the neon at Glossy's flickered and went dark. Your regulars never left.</p>
      <div class="stats"><div><b>$${S.tips}</b><span>tips this week</span></div><div><b>${S.loyalty}%</b><span>of the street</span></div></div>
      <button class="btn" data-act="new">Run it back</button><button class="btn quiet" data-act="menu">Back to menu</button>`);
    return;
  }
  show(`<p class="kick">${DAYS[S.day].name}, closing time</p><h1>Shift over</h1>
    <div class="stats"><div><b>${S.served}</b><span>served</span></div><div><b>${S.walked}</b><span>walked to Glossy's</span></div><div><b>$${S.dayTips}</b><span>in tips</span></div></div>
    ${meterHTML()}
    <button class="btn" data-act="next">Open on ${DAYS[S.day+1].name}</button>`);
}
function loseScreen(){
  recordBest(false);S.mode='end';
  show(`<p class="kick">${DAYS[S.day].name}</p><h1>Glossy's took the street</h1>
    <p class="story">The line at Glossy's reached your front door. Ink Burger closes early today.</p>
    <div class="stats"><div><b>${S.served}</b><span>served</span></div><div><b>${S.walked}</b><span>walked out</span></div></div>
    <button class="btn" data-act="retry">Retry ${DAYS[S.day].name}</button><button class="btn quiet" data-act="menu">Back to menu</button>`);
}
function pauseScreen(){
  if(S.mode!=='play')return;S.mode='paused';
  show(`<h1>Paused</h1><p class="story">The grill waits for you. Customers do too, for now.</p>
    <button class="btn" data-act="resume">Resume</button>
    <button class="btn quiet" data-act="retry">Restart ${DAYS[S.day].name}</button>
    <button class="btn quiet" data-act="sound">Sound: ${S.muted?'off':'on'}</button>
    <button class="btn quiet" data-act="menu">Quit to menu</button>`);
}
scr.addEventListener('click',e=>{
  const b=e.target.closest('[data-act]');if(!b)return;const a=b.dataset.act;snd('pick');
  if(a==='new'){S.day=0;S.loyalty=60;S.tips=0;introScreen()}
  else if(a==='start')play();
  else if(a==='next'){S.day++;introScreen()}
  else if(a==='retry'){S.loyalty=S.loyaltyStart;S.tips=S.tipsStart;play()}
  else if(a==='resume'){hide();S.mode='play';last=performance.now()}
  else if(a==='sound'){S.muted=!S.muted;BEST.muted=S.muted;saveBest();b.textContent='Sound: '+(S.muted?'off':'on')}
  else if(a==='menu')titleScreen();
});
$('#pauseBtn').addEventListener('click',pauseScreen);
