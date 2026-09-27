/* Ink Burger: which cards can go where. */
"use strict";
// A card sits on a lower card of the same dish.
const stacks=(lo,hi)=>ING[lo.t].d===ING[hi.t].d&&hi.t>lo.t;
function parseLoc(loc){const p=loc.split(':');return{kind:p[0],a:+p[1],i:+p[2]}}
function getRun(loc){
  const L=parseLoc(loc);
  if(L.kind==='col'){const col=S.cols[L.a];for(let k=L.i;k<col.length-1;k++)if(!stacks(col[k],col[k+1]))return null;return col.slice(L.i)}
  if(L.kind==='waste')return S.waste.length?[S.waste[S.waste.length-1]]:null;
  if(L.kind==='prep')return S.prep[L.a]?[S.prep[L.a]]:null;
  return null;
}
function removeFromLoc(loc,n){
  const L=parseLoc(loc);
  if(L.kind==='col'){const col=S.cols[L.a];col.splice(col.length-n,n);const top=col[col.length-1];if(top&&!top.up){top.up=true;S.flipped.add(top.id)}}
  else if(L.kind==='waste')S.waste.pop();
  else if(L.kind==='prep')S.prep[L.a]=null;
}
const isActive=t=>t&&!t.done&&!t.gone&&!t.pending;
const active=()=>S.slots.filter(isActive);
const ticketById=id=>S.slots.find(t=>t&&t.id===id);
function matches(t,types){return t.p+types.length<=t.recipe.length&&types.every((x,k)=>t.recipe[t.p+k]===x)}
function canDrop(tgt,run,loc){
  const [k,a]=tgt.split(':'),L=parseLoc(loc);
  if(k==='col'){const c=+a;if(L.kind==='col'&&L.a===c)return false;const col=S.cols[c];if(!col.length)return true;const top=col[col.length-1];return top.up&&stacks(top,run[0])}
  if(k==='prep')return run.length===1&&!S.prep[+a];
  if(k==='ticket'){const t=ticketById(+a);return isActive(t)&&matches(t,run.map(c=>c.t))}
  return false;
}
