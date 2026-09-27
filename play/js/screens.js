/* Ink Burger: title, day intro, end of day, end of week, lose and pause screens. */
"use strict";
function show(html){scr.innerHTML=`<div class="sc">${html}</div>`;scr.classList.add('show');scr.scrollTop=0;const b=scr.querySelector('.btn');b&&b.focus({preventScroll:true})}
function hide(){scr.classList.remove('show');scr.innerHTML=''}
const WDAYS=DAYNAMES.length,lastWeek=()=>S.week===WEEKS.length-1;
const whenLine=(w,d)=>`Week ${w+1}, ${DAYNAMES[d]}`;
function meterHTML(){const rival=WEEKS[S.week].rival;return `<div class="meter bigmeter"><div class="mlab"><span>Ink Burger ${S.loyalty}%</span><span>${rival} ${100-S.loyalty}%</span></div><div class="mbar"><i style="display:block;height:100%;width:${S.loyalty}%;background:var(--paper);border-right:2px solid var(--ink)"></i></div></div>`}
function bestLine(){
  const B=BEST.best;if(!B)return '';
  if(B.won)return `Best run: won every street with $${B.tips} in tips`;
  return `Best run: reached ${whenLine(B.week,B.day)} with $${B.tips} in tips`;
}
function recordBest(won){
  const B=BEST.best,p=S.week*WDAYS+S.day;
  const better=won?(!B||!B.won||S.tips>B.tips):(!B||(!B.won&&(p>B.week*WDAYS+B.day||(p===B.week*WDAYS+B.day&&S.tips>B.tips))));
  if(better){BEST.best={week:S.week,day:S.day,tips:S.tips,won:!!won};saveBest()}
}
// Where to pick up: saved at the start of each day, so "Carry on" opens that morning again.
function saveRun(){BEST.run={v:1,week:S.week,day:S.day,loyalty:S.loyalty,tips:S.tips};saveBest()}
function loadRun(){
  const R=BEST.run;if(!R||R.v!==1||!WEEKS[R.week]||!(R.day>=0&&R.day<WDAYS))return false;
  S.week=R.week;S.day=R.day;S.loyalty=Math.max(1,Math.min(100,R.loyalty|0))||60;S.tips=R.tips|0;return true;
}
function titleScreen(){
  S.mode='menu';
  const R=BEST.run&&WEEKS[BEST.run.week]?BEST.run:null;
  show(`${burgerSVG([0,1,2,4,5,8],99,null,2.6,'logo')}
    <h1>Ink Burger</h1>
    <p class="tag">Stack cards. Serve burgers. Beat the place across the street.</p>
    ${R?`<button class="btn" data-act="continue">Carry on: ${whenLine(R.week,R.day)}</button><button class="btn quiet" data-act="new">Start a new game</button>`
      :`<button class="btn" data-act="new">Open the kitchen</button>`}
    <div class="howto">
      <h2>How to cook</h2>
      <p><b>Tap</b> a card to add it to the order that needs it next. Every dish builds from the bottom up.</p>
      <p><b>Drag</b> cards between columns. A card can sit on a lower number of the same dish (check the little icon), so columns turn into half-built orders you can plate in one move.</p>
      <p><b>Tap the pantry</b> to flip a new card. Orders that wait too long walk across the street to Glossy's.</p>
      <p><b>Each week</b> Glossy's opens something new, and so do you.</p>
    </div>
    <p class="best">${bestLine()}</p>
    <p class="ver">Version ${VERSION}${ONLINE?' · ':''}${feedbackLink()}</p>`);
  if(!RM)scr.querySelectorAll('.logo g').forEach((g,i)=>g.animate([
    {transform:'translateY(-150px)',opacity:0},{transform:'translateY(0) scale(1.18,.62)',opacity:1,offset:.68},
    {transform:'scale(.94,1.1)',offset:.84},{transform:'none'}],{duration:560,delay:150+i*140,easing:'cubic-bezier(.55,0,.8,.6)',fill:'backwards'}));
}
function introScreen(){
  S.mode='intro';const D=dayDef(S.week,S.day);saveRun();
  const fresh=D.fresh.map(t=>cardHTML({id:0,t,up:true},'',null,true).replace('class="card"','class="card static"')).join('');
  const menu=D.menu.length>1?`<div class="menu"><p>On the menu</p><div class="dishes">${D.menu.map(d=>`<span>${dishIcon(d,'dico')}${DISHES[d].name}</span>`).join('')}</div></div>`:'';
  show(`<p class="kick">Week ${S.week+1} · Day ${S.day+1} of ${WDAYS}</p><h1>${D.name}</h1>
    <p class="story">${D.story}</p>
    ${menu}
    ${fresh?`<div class="fresh"><p>${S.day===0?(S.week?`New: ${DISHES[D.menu[D.menu.length-1]].name.toLowerCase()}`:'On the line today'):'New on the line'}</p><div class="freshcards">${fresh}</div></div>`:''}
    ${meterHTML()}
    <button class="btn" data-act="start">Start shift</button>`);
}
function play(){
  startDay();hide();S.mode='play';last=performance.now();
  requestAnimationFrame(()=>render({deal:true}));
}
function endDay(){
  const endOfWeek=S.day===WDAYS-1,won=endOfWeek&&lastWeek();
  recordBest(won);
  S.mode='end';
  if(won){
    BEST.run=null;saveBest();
    show(`<p class="kick">Friday, closing time</p><h1>The street is yours</h1>
      <p class="story">Saturday morning, every neon sign at Glossy's flickered and went dark. Your regulars never left.</p>
      <div class="stats"><div><b>$${S.tips}</b><span>tips in all</span></div><div><b>${S.loyalty}%</b><span>of the street</span></div></div>
      <button class="btn" data-act="new">Run it back</button><button class="btn quiet" data-act="menu">Back to menu</button>
    <p class="ver">${feedbackLink()}</p>`);
    return;
  }
  if(endOfWeek){
    const N=WEEKS[S.week+1];
    show(`<p class="kick">Friday, closing time</p><h1>Week ${S.week+1} won</h1>
      <p class="story">${N.next} Ink Burger will be ready with ${DISHES[N.dish].name.toLowerCase()}.</p>
      <div class="stats"><div><b>${S.served}</b><span>served today</span></div><div><b>$${S.tips}</b><span>tips so far</span></div></div>
      ${meterHTML()}
      <button class="btn" data-act="nextweek">Start week ${S.week+2}</button>
      <p class="ver">${feedbackLink()}</p>`);
    return;
  }
  show(`<p class="kick">${DAYNAMES[S.day]}, closing time</p><h1>Shift over</h1>
    <div class="stats"><div><b>${S.served}</b><span>served</span></div><div><b>${S.walked}</b><span>walked to Glossy's</span></div><div><b>$${S.dayTips}</b><span>in tips</span></div></div>
    ${meterHTML()}
    <button class="btn" data-act="next">Open on ${DAYNAMES[S.day+1]}</button>
    <p class="ver">${feedbackLink()}</p>`);
}
function loseScreen(){
  recordBest(false);S.mode='end';
  show(`<p class="kick">${whenLine(S.week,S.day)}</p><h1>Glossy's took the street</h1>
    <p class="story">The line at ${WEEKS[S.week].rival} reached your front door. Ink Burger closes early today.</p>
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
  if(a==='new'){S.week=0;S.day=0;S.loyalty=60;S.tips=0;introScreen()}
  else if(a==='continue'){if(loadRun())introScreen();else titleScreen()}
  else if(a==='start')play();
  else if(a==='next'){S.day++;introScreen()}
  else if(a==='nextweek'){S.week++;S.day=0;S.loyalty=60;introScreen()}
  else if(a==='retry'){S.loyalty=S.loyaltyStart;S.tips=S.tipsStart;play()}
  else if(a==='resume'){hide();S.mode='play';last=performance.now()}
  else if(a==='sound'){S.muted=!S.muted;BEST.muted=S.muted;saveBest();b.textContent='Sound: '+(S.muted?'off':'on')}
  else if(a==='menu')titleScreen();
  else if(a==='feedback')showFeedback();
});
$('#pauseBtn').addEventListener('click',pauseScreen);
