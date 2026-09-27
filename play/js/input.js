/* Ink Burger: tapping and dragging cards. */
"use strict";
let drag=null;
app.addEventListener('pointerdown',e=>{
  if(S.mode!=='play'||drag)return;
  if(e.target.closest('#stock')){drag={stock:true,x:e.clientX,y:e.clientY};return}
  const el=e.target.closest('.card[data-loc]');if(!el)return;
  drag={loc:el.dataset.loc,run:getRun(el.dataset.loc),x:e.clientX,y:e.clientY,started:false,el};
  e.preventDefault();
});
window.addEventListener('pointermove',e=>{
  if(!drag||drag.stock)return;
  if(!drag.started){
    if(Math.hypot(e.clientX-drag.x,e.clientY-drag.y)<7)return;
    if(!drag.run||S.mode!=='play'){wiggle(drag.el);snd('bad');drag=null;return}
    startDrag();
  }
  drag.ghost.style.transform=`translate(${e.clientX-drag.x}px,${e.clientY-drag.y}px)`;
  const tg=targetAt(e.clientX,e.clientY);
  const ok=tg&&canDrop(tg,drag.run,drag.loc)?tg:null;
  if(ok!==drag.hot){
    app.querySelectorAll('.hot').forEach(x=>x.classList.remove('hot'));
    if(ok){const d=app.querySelector(`[data-drop="${ok}"]`);d&&d.classList.add('hot')}
    drag.hot=ok;
  }
});
function endPointer(e,cancel){
  if(!drag)return;const d=drag;drag=null;
  if(d.stock){if(!cancel&&Math.hypot(e.clientX-d.x,e.clientY-d.y)<12&&S.mode==='play')drawStock();return}
  if(!d.started){if(!cancel&&S.mode==='play')tap(d.loc,d.run,d.el);return}
  app.querySelectorAll('.hot').forEach(x=>x.classList.remove('hot'));
  const rects=new Map([...d.ghost.querySelectorAll('.card')].map(el=>[el.dataset.id,el.getBoundingClientRect()]));
  const tg=!cancel&&S.mode==='play'?targetAt(e.clientX,e.clientY):null;
  let handled=false;
  if(tg&&canDrop(tg,d.run,d.loc)){
    if(tg.startsWith('ticket'))handled=plate(d.run,d.loc,ticketById(+tg.split(':')[1]),rects);
    else{move(d.run,d.loc,tg);render({from:rects});handled=true}
  }
  if(!handled){render({from:rects});if(tg)snd('bad')}
  d.ghost.remove();
}
window.addEventListener('pointerup',e=>endPointer(e,false));
window.addEventListener('pointercancel',e=>endPointer(e,true));
function startDrag(){
  const d=drag;d.started=true;
  const els=d.run.map(c=>app.querySelector(`.card[data-id="${c.id}"]`));
  const r0=els[0].getBoundingClientRect();
  const g=document.createElement('div');g.className='ghost';
  g.style.left=r0.left+'px';g.style.top=r0.top+'px';
  const gi=document.createElement('div');gi.className='gi';
  gi.style.transformOrigin=`${d.x-r0.left}px ${d.y-r0.top}px`;
  els.forEach(el=>{const r=el.getBoundingClientRect(),cl=el.cloneNode(true);cl.style.left=(r.left-r0.left)+'px';cl.style.top=(r.top-r0.top)+'px';cl.style.zIndex='';gi.appendChild(cl);el.style.visibility='hidden'});
  g.appendChild(gi);fx.appendChild(g);d.ghost=g;
  snd('pick');haptic(6);
}
function targetAt(x,y){
  const el=document.elementFromPoint(x,y);if(!el)return null;
  const d=el.closest('[data-drop]');return d&&app.contains(d)?d.dataset.drop:null;
}
