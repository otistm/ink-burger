/* Ink Burger: the shift clock: customers arriving, waiting and walking out. */
"use strict";
function spawn(idx){
  const D=S.D,o=S.queue.shift(),max=D.base+5*o.recipe.length;
  S.slots[idx]={id:++S.tid,no:++S.no,dish:o.dish,recipe:o.recipe,name:o.name,p:0,time:max,max,tilt:(Math.random()*3-1.5).toFixed(2)};
}
function tick(dt){
  S.clock+=dt;let changed=false;const D=S.D;
  S.slots.forEach((t,i)=>{
    if(!t)return;
    if(t.removeAt!=null){if(S.clock>=t.removeAt){S.slots[i]=null;changed=true;S.nextArrive=Math.max(S.nextArrive,1.2)}return}
    if(t.pending)return;
    t.time-=dt;
    if(t.time<=0){walkout(t);changed=true;return}
    const el=rail.querySelector(`[data-tid="${t.id}"]`);
    if(el){el.querySelector('.pbar i').style.width=(t.time/t.max*100)+'%';const m=mood(t);if(!el.classList.contains(m)){el.classList.remove('calm','itchy','mad');el.classList.add(m)}}
  });
  if(S.mode!=='play'){if(changed)render();return}
  if(!S.slots.some(t=>t&&t.removeAt==null))S.nextArrive=Math.min(S.nextArrive,.8);
  S.nextArrive-=dt;
  if(S.nextArrive<=0&&S.queue.length){const idx=S.slots.indexOf(null);if(idx>=0){spawn(idx);S.nextArrive=D.gap;changed=true;snd('ding')}}
  if(!S.queue.length&&S.slots.every(t=>!t)){S.mode='ending';setTimeout(endDay,600)}
  if(changed)render();
}
