/* Ink Burger: plating, serving, walkouts, the pantry, moving cards, toasts. */
"use strict";
function plate(run,loc,only,fromRects){
  const types=run.map(c=>c.t);
  let c=active().filter(t=>matches(t,types));
  if(only)c=c.filter(t=>t===only);
  if(!c.length)return false;
  c.sort((a,b)=>a.time-b.time);
  const t=c[0];
  const fly=run.map(card=>{
    let r=fromRects&&fromRects.get(String(card.id));
    if(!r){const el=app.querySelector(`.card[data-id="${card.id}"]`);r=el?el.getBoundingClientRect():null}
    return{r,card};
  });
  removeFromLoc(loc,run.length);
  const li0=t.p;t.p+=run.length;
  fly.forEach((f,k)=>S.popping.add(t.id+':'+(li0+k)));
  render();
  fly.forEach((f,k)=>flyTo(f,t.id,li0+k,k));
  snd('plate');haptic(10);
  if(t.p===t.recipe.length){t.pending=true;setTimeout(()=>{if(!t.gone&&S.slots.includes(t))serve(t)},430+85*run.length)}
  return true;
}
function flyTo(f,tid,li,k){
  const key=tid+':'+li;
  const done=()=>{S.popping.delete(key);const g=rail.querySelector(`[data-tid="${tid}"] g[data-li="${li}"]`);if(g){g.style.opacity='';if(!RM)g.animate([{transform:'scale(1.3,.35)'},{transform:'scale(.92,1.25)',offset:.55},{transform:'none'}],{duration:260,easing:'ease-out'});snd('pop')}};
  const g=rail.querySelector(`[data-tid="${tid}"] g[data-li="${li}"]`);
  if(!g||!f.r||RM){done();return}
  const tr=g.getBoundingClientRect();
  const el=document.createElement('div');el.className='fly';
  el.style.cssText=`left:${f.r.left}px;top:${f.r.top}px;width:${f.r.width}px;height:${f.r.height}px`;
  el.innerHTML=cardHTML(f.card,'',null,true);fx.appendChild(el);
  const sx=Math.max(.15,tr.width/f.r.width);
  const dx=(tr.left+tr.width/2)-(f.r.left+f.r.width/2),dy=(tr.top+tr.height/2)-(f.r.top+f.r.height/2);
  const a=el.animate([
    {transform:'translate(0,0) scale(1)',opacity:1},
    {transform:`translate(${dx*.45}px,${dy*.5-46}px) scale(${(1+sx)/2}) rotate(-9deg)`,opacity:1,offset:.5},
    {transform:`translate(${dx}px,${dy}px) scale(${sx},${sx*.45})`,opacity:0}
  ],{duration:380,delay:k*85,easing:'cubic-bezier(.45,0,.55,1)',fill:'both'});
  a.onfinish=()=>{el.remove();done()};
}
function serve(t){
  const f=t.time/t.max,stars=f>.6?3:f>.3?2:1;
  t.done=true;t.pending=false;t.stars=stars;t.removeAt=S.clock+1.1;
  const tip=stars*4+t.recipe.length;
  S.tips+=tip;S.dayTips+=tip;S.served++;
  const el=rail.querySelector(`[data-tid="${t.id}"]`);
  if(el){const r=el.getBoundingClientRect();floatText('+$'+tip,r.left+r.width/2,r.top+r.height*.35)}
  addLoyalty(2+2*stars);
  snd('serve');haptic([12,40,12]);
  render();
}
function walkout(t){
  t.gone=true;t.removeAt=S.clock+1.3;S.walked++;
  addLoyalty(-14);snd('walk');haptic(60);
  if(S.loyalty<=0){S.mode='lost';setTimeout(loseScreen,1200)}
}
function addLoyalty(d){
  S.loyalty=Math.max(0,Math.min(100,S.loyalty+d));
  $('#mfill').style.width=S.loyalty+'%';
  const r=$('.mbar').getBoundingClientRect();
  floatText((d>0?'+':'')+d,r.left+r.width*S.loyalty/100,r.bottom+14);
}
function floatText(txt,x,y){
  const el=document.createElement('div');el.className='float';el.textContent=txt;
  el.style.left=x+'px';el.style.top=y+'px';fx.appendChild(el);
  el.animate([{transform:'translate(-50%,-50%) scale(.6)',opacity:0},{transform:'translate(-50%,-90%) scale(1.15)',opacity:1,offset:.25},{transform:'translate(-50%,-190%) scale(1)',opacity:0}],{duration:1000,easing:'ease-out'}).onfinish=()=>el.remove();
}
function drawStock(){
  if(S.stock.length){const c=S.stock.pop();c.up=true;S.waste.push(c);S.flipped.add(c.id);snd('draw')}
  else if(S.waste.length){S.stock=S.waste.reverse().map(c=>(c.up=false,c));S.waste=[];snd('reset')}
  else return;
  render();
}
function move(run,loc,tgt){
  removeFromLoc(loc,run.length);
  const [k,a]=tgt.split(':');
  if(k==='col')S.cols[+a].push(...run);else S.prep[+a]=run[0];
  snd('place');haptic(8);
}
let toastT;
function toast(msg){const t=$('#toast');t.textContent=msg;t.classList.add('show');clearTimeout(toastT);toastT=setTimeout(()=>t.classList.remove('show'),1400)}
function wiggle(el){if(!el||RM)return;el.animate([{transform:'translateX(0)'},{transform:'translateX(-5px) rotate(-2deg)'},{transform:'translateX(5px) rotate(2deg)'},{transform:'translateX(-3px)'},{transform:'none'}],{duration:260})}
function tap(loc,run,el){
  if(!run){wiggle(el);snd('bad');toast("Those cards aren't in burger order");return}
  if(!plate(run,loc)){
    wiggle(el);snd('bad');
    toast(run.length>1?'No order needs that stack next':`No order needs ${ING[run[0].t].s} next`);
  }
}
