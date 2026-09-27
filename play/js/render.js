/* Ink Burger: sizing the table and drawing the ticket rail, pantry row and columns, with card motion. */
"use strict";
function sizeCards(){
  const W=Math.min(innerWidth,480)-20;
  const H=app.clientHeight||innerHeight;
  CW=Math.floor(Math.min(86,(W-4*7)/5));
  // fit everything to the real screen height: top bar, rail, pantry row, and a tableau with room to stack
  const railH=Math.round(Math.max(108,Math.min(190,H*.25)));
  const rest=H-110-railH;
  CH=Math.round(Math.max(62,Math.min(CW*1.3,rest/2.6)));
  document.documentElement.style.setProperty('--railh',railH+'px');
  document.documentElement.style.setProperty('--cw',CW+'px');
  document.documentElement.style.setProperty('--ch',CH+'px');
}
function mood(t){const f=t.time/t.max;return f>.5?'calm':f>.22?'itchy':'mad'}
function ticketHTML(t){
  const next=t.p<t.recipe.length?t.recipe[t.p]:null;
  const cls=t.done?'done':t.gone?'gone':mood(t);
  let stamp='';
  if(t.done)stamp=`<div class="stamp"><span>Served<br><em>${'★'.repeat(t.stars)}${'☆'.repeat(3-t.stars)}</em></span></div>`;
  if(t.gone)stamp=`<div class="stamp"><span>Went to<br>Glossy's</span></div>`;
  return `<div class="ticket ${cls}" data-tid="${t.id}" data-drop="ticket:${t.id}" style="--tilt:${t.tilt}deg">
    <div class="th">${FACE}<div><b>#${t.no}</b><small>${t.name}</small></div></div>
    <div class="bg">${burgerSVG(t.recipe,t.p,t.id)}</div>
    <div class="need">${next!=null?'Needs '+ING[next].s:'Plating…'}</div>
    <div class="pbar"><i style="width:${Math.max(0,t.time/t.max*100)}%"></i></div>${stamp}</div>`;
}
function renderRail(){
  rail.style.setProperty('--rails',S.slots.length);
  rail.innerHTML=S.slots.map(t=>t?ticketHTML(t):'<div class="slot-empty"></div>').join('');
}
function renderMid(){
  const D=DAYS[S.day];
  [0,1].forEach(i=>{
    const el=$('#prep'+i),c=S.prep[i];
    el.classList.toggle('empty',!c);
    el.innerHTML=c?cardHTML(c,'',`prep:${i}`):'<span class="lbl">Prep</span>';
  });
  const w=S.waste,we=$('#waste');
  we.classList.toggle('empty',!w.length);
  we.innerHTML=(w.length>1?cardHTML(w[w.length-2],'left:-5px;top:1px'):'')+(w.length?cardHTML(w[w.length-1],'',`waste`):'');
  const st=$('#stock');
  st.classList.toggle('empty',!S.stock.length);
  if(S.stock.length)st.innerHTML=cardHTML(S.stock[S.stock.length-1])+`<span class="cnt">${S.stock.length}</span>`;
  else st.innerHTML=`<span class="lbl">${S.waste.length?'↺<br>Restock':'Empty'}</span>`;
  $('#info').innerHTML=`<b>${D.name}</b><span>${S.queue.length} in line</span>`;
  $('#tips').textContent='$'+S.tips;
  $('#mfill').style.width=S.loyalty+'%';
}
function renderTab(){
  const H=tab.clientHeight;let h='';
  S.cols.forEach((col,c)=>{
    const offs=[];for(let i=0;i<col.length-1;i++)offs.push(col[i].up?Math.round(CH*.3):Math.round(CH*.12));
    const tot=offs.reduce((a,b)=>a+b,0);
    const f=tot>0&&tot+CH>H?Math.max(.25,(H-CH)/tot):1;
    let y=0,inner='';
    col.forEach((card,i)=>{inner+=cardHTML(card,`top:${Math.round(y)}px;z-index:${i+1}`,card.up?`col:${c}:${i}`:null);if(i<offs.length)y+=offs[i]*f});
    h+=`<div class="col" data-drop="col:${c}">${inner}</div>`;
  });
  tab.innerHTML=h;
}
function render(opts={}){
  const before=new Map(),order=new Map();
  app.querySelectorAll('.card[data-id]').forEach(el=>before.set(el.dataset.id,el.getBoundingClientRect()));
  if(opts.from)opts.from.forEach((r,id)=>before.set(id,r));
  if(opts.deal){const sr=$('#stock').getBoundingClientRect();let k=0;S.cols.forEach(col=>col.forEach(c=>{before.set(String(c.id),sr);order.set(String(c.id),k++)}))}
  renderRail();renderMid();renderTab();
  const dur=RM?120:300;
  app.querySelectorAll('.card[data-id]').forEach(el=>{
    const id=el.dataset.id,r0=before.get(id),fl=S.flipped.has(+id);
    let moved=false,dx=0,dy=0;
    if(r0){const r1=el.getBoundingClientRect();dx=r0.left-r1.left;dy=r0.top-r1.top;moved=Math.abs(dx)+Math.abs(dy)>1}
    if(moved){
      el.animate([{transform:`translate(${dx}px,${dy}px) rotate(${dx>0?-4:4}deg)${fl?' scaleX(.1)':''}`},{transform:'none'}],
        {duration:dur,delay:order.has(id)?order.get(id)*45:0,easing:'cubic-bezier(.2,1.35,.4,1)',fill:'backwards'});
    }else if(fl&&!RM){
      el.animate([{transform:'scaleX(.05)'},{transform:'scaleX(1.08)',offset:.7},{transform:'none'}],{duration:240,easing:'ease-out'});
    }
  });
  S.flipped.clear();
  // new tickets slide in, stamps slam
  rail.querySelectorAll('.ticket').forEach(el=>{
    const id=+el.dataset.tid;
    if(!S.seen.has(id)){S.seen.add(id);if(!RM)el.animate([{transform:'translateY(-70px) rotate(var(--tilt))',opacity:0},{transform:'translateY(6px) rotate(var(--tilt)) scaleY(.94)',opacity:1,offset:.7},{transform:'rotate(var(--tilt))'}],{duration:420,easing:'cubic-bezier(.3,.8,.4,1)'})}
    const st=el.querySelector('.stamp span');
    if(st&&!S.stamped.has(id)){S.stamped.add(id);if(!RM)st.animate([{transform:'scale(2.2) rotate(-20deg)',opacity:0},{transform:'scale(.92) rotate(-11deg)',opacity:1,offset:.7},{transform:getComputedStyle(st).transform}],{duration:300,easing:'ease-in'})}
  });
}
