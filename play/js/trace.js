/* Ink Burger prototype B: trace the recipe. A grid of ingredient tiles; drag one finger through touching tiles
   (sideways or diagonal) in recipe order. The order on the rail builds as you trace. Let go on a finished order to serve
   it, or after two or more tiles to plate part of it and finish it later. Longer traces tip more. Used tiles pop and new
   ones drop in from the top. */
"use strict";
const stage=$('#stage');
const COLS=5,ROWS=6;
const G={};
let TS=64,GX=0,GY=0,GAPPX=6;                  // tile size, grid left and top, gap between tiles

function sizeGrid(){
  const r=stage.getBoundingClientRect();
  TS=Math.floor(Math.min((r.width-(COLS-1)*GAPPX)/COLS,(r.height-54-(ROWS-1)*GAPPX)/ROWS,76));
  GX=Math.round((r.width-(COLS*TS+(COLS-1)*GAPPX))/2);GY=Math.max(4,Math.round((r.height-50-(ROWS*TS+(ROWS-1)*GAPPX))/2));
  stage.style.setProperty('--ts',TS+'px');
}
const cx=c=>GX+c*(TS+GAPPX)+TS/2, cy=r=>GY+r*(TS+GAPPX)+TS/2;
function tileHTML(tile){return `<div class="tile" data-k="${tile.k}" aria-label="${ING[tile.t].n}">${artSVG(tile.t)}<span>${ING[tile.t].n}</span></div>`}
function setup(){
  stage.innerHTML=`<div id="grid"></div><svg id="path" aria-hidden="true"><polyline id="pline"/></svg>
    <div class="tracebar"><span id="traceTip">Drag through the tiles in recipe order</span><button class="btn quiet" id="shuffle">Shake the pantry</button></div>`;
  G.gridEl=$('#grid');G.pline=$('#pline');
  $('#shuffle').addEventListener('click',shakePantry);
  sizeGrid();
}

/* ---------- the grid: G.cells[r][c] = {k,t,el} ---------- */
let KEY=0;
// new tiles lean toward what the rail needs next, plus some of everything on today's menu
function pickIngredient(){
  const bag=[];
  const want=[...liveTickets(),...G.orders.slice(0,2).map(o=>({recipe:o.recipe,p:0}))];
  want.forEach(t=>t.recipe.slice(t.p).forEach(x=>bag.push(x,x)));
  const D=S.D;[0,1,8,...D.tops[0]].forEach(x=>bag.push(x));
  return bag[rnd(0,bag.length-1)];
}
function makeTile(c,r,fromRow){
  const tile={k:++KEY,t:pickIngredient()};
  G.gridEl.insertAdjacentHTML('beforeend',tileHTML(tile));tile.el=G.gridEl.lastChild;
  G.cells[r][c]=tile;posTile(tile,c,r);
  if(fromRow!=null&&!RM){const dy=(fromRow-r)*(TS+GAPPX);tile.el.animate([{transform:`translate(${cx(c)-TS/2}px,${cy(r)-TS/2+dy}px)`},{transform:`translate(${cx(c)-TS/2}px,${cy(r)-TS/2}px) scale(1.08,.9)`,offset:.8},{transform:`translate(${cx(c)-TS/2}px,${cy(r)-TS/2}px)`}],{duration:300+(r-fromRow)*40,easing:'cubic-bezier(.4,0,.6,1)'})}
}
function posTile(tile,c,r){tile.c=c;tile.r=r;tile.el.style.transform=`translate(${cx(c)-TS/2}px,${cy(r)-TS/2}px)`}
function fillGrid(){
  G.gridEl.innerHTML='';G.cells=Array.from({length:ROWS},()=>Array(COLS).fill(null));
  for(let r=0;r<ROWS;r++)for(let c=0;c<COLS;c++)makeTile(c,r,r-ROWS);
}
// remove used tiles; everything above falls down, and new tiles drop in from the top
function collapse(used){
  used.forEach(tl=>{G.cells[tl.r][tl.c]=null;const el=tl.el;
    if(RM)el.remove();else el.animate([{opacity:1},{transform:el.style.transform+' scale(1.25)',opacity:0}],{duration:220,easing:'ease-out'}).onfinish=()=>el.remove()});
  for(let c=0;c<COLS;c++){
    const col=[];for(let r=ROWS-1;r>=0;r--)if(G.cells[r][c])col.push(G.cells[r][c]);
    let r=ROWS-1;
    col.forEach(tl=>{const from=tl.r;G.cells[r][c]=tl;if(from!==r){posTile(tl,c,r);if(!RM)tl.el.animate([{transform:`translate(${cx(c)-TS/2}px,${cy(from)-TS/2}px)`},{transform:`translate(${cx(c)-TS/2}px,${cy(r)-TS/2}px) scale(1.06,.92)`,offset:.8},{transform:tl.el.style.transform}],{duration:260+(r-from)*40,easing:'cubic-bezier(.4,0,.6,1)'})}r--});
    let missing=r+1;for(let k=r;k>=0;k--){G.cells[k][c]=null;makeTile(c,k,k-missing)}
  }
}
function shakePantry(){
  if(S.mode!=='play'||G.path.length)return;
  liveTickets().forEach(t=>t.time=Math.max(.5,t.time-3));
  snd('reset');toast('Pantry shaken. Everyone waited a little longer.');
  for(let r=0;r<ROWS;r++)for(let c=0;c<COLS;c++){const tl=G.cells[r][c];tl.t=pickIngredient();tl.el.outerHTML=tileHTML(tl);tl.el=G.gridEl.querySelector(`[data-k="${tl.k}"]`);posTile(tl,c,r);
    if(!RM)tl.el.animate([{transform:tl.el.style.transform+' rotate(-8deg) scale(.8)'},{transform:tl.el.style.transform}],{duration:260,delay:(r+c)*20,easing:'ease-out'})}
}

/* ---------- tracing ---------- */
// every live order the path could be building: its recipe from where it's up to must start with the path
function matchesFor(path){
  const types=path.map(tl=>tl.t);
  return liveTickets().filter(t=>!t.pending&&t.base+types.length<=t.recipe.length&&types.every((x,i)=>t.recipe[t.base+i]===x)).sort((a,b)=>a.time-b.time);
}
function tileAt(x,y){
  const c=Math.round((x-GX-TS/2)/(TS+GAPPX)),r=Math.round((y-GY-TS/2)/(TS+GAPPX));
  if(c<0||r<0||c>=COLS||r>=ROWS)return null;
  if(Math.hypot(x-cx(c),y-cy(r))>TS*.46)return null;   // stay near the middle, so diagonals don't misfire
  return G.cells[r][c];
}
function preview(){
  const m=G.path.length?matchesFor(G.path):[];
  liveTickets().forEach(t=>t.p=t.base);                   // undo last preview
  if(m[0])m[0].p=m[0].base+G.path.length;
  G.target=m[0]||null;drawRail();
  G.gridEl.querySelectorAll('.tile.on').forEach(el=>el.classList.remove('on'));
  G.path.forEach(tl=>tl.el.classList.add('on'));
  G.pline.setAttribute('points',G.path.map(tl=>`${cx(tl.c)},${cy(tl.r)}`).join(' '));
  const n=G.path.length,done=G.target&&G.target.p===G.target.recipe.length;
  $('#traceTip').textContent=!n?'Drag through the tiles in recipe order':done?'Let go to serve':n<2&&G.target?'Keep going…':G.target?'Let go to plate this much':'';
}
function addTile(tl){
  const path=G.path;
  if(!tl||path.includes(tl)&&tl!==path[path.length-2])return;
  if(tl===path[path.length-2]){path.pop();snd('draw');preview();return}   // step back
  const last=path[path.length-1];
  if(last&&(Math.abs(last.c-tl.c)>1||Math.abs(last.r-tl.r)>1))return;
  if(!matchesFor([...path,tl]).length){if(!G.buzzed){G.buzzed=true;wiggle(tl.el);snd('bad')}return}
  G.buzzed=false;path.push(tl);snd('pick');haptic(5);
  if(!RM)tl.el.animate([{transform:tl.el.style.transform+' scale(1.14)'},{transform:tl.el.style.transform}],{duration:160});
  preview();
}
function endTrace(){
  const path=G.path,t=G.target;G.path=[];G.target=null;
  if(!path.length)return;
  const done=t&&t.p===t.recipe.length;
  if(t&&(done||path.length>=2)){
    t.base=t.p;G.chains.push(path.length);
    const bonus=path.length>=3?(path.length-2)*2:0;t.bonus=(t.bonus||0)+bonus;
    if(bonus){const r=stage.getBoundingClientRect(),e=path[path.length-1];floatText(`${path.length} in a row`,r.left+cx(e.c),r.top+cy(e.r)-TS*.6,'small')}
    snd('plate');haptic(10);collapse(path);
    if(done){t.pending=true;setTimeout(()=>{if(!t.gone)serveTicket(t,t.bonus)},250)}
  }else{
    if(path.length===1&&t)toast('Trace at least two tiles, or finish an order');
    snd('bad');
  }
  preview();
}
stage.addEventListener('pointerdown',e=>{
  if(S.mode!=='play'||e.target.closest('button'))return;
  const r=stage.getBoundingClientRect(),tl=tileAt(e.clientX-r.left,e.clientY-r.top);if(!tl)return;
  e.preventDefault();stage.setPointerCapture(e.pointerId);G.tracing=true;G.path=[];G.buzzed=false;addTile(tl);
});
stage.addEventListener('pointermove',e=>{
  if(!G.tracing)return;const r=stage.getBoundingClientRect();addTile(tileAt(e.clientX-r.left,e.clientY-r.top));
});
const stopTrace=()=>{if(!G.tracing)return;G.tracing=false;endTrace()};
stage.addEventListener('pointerup',stopTrace);stage.addEventListener('pointercancel',stopTrace);

/* ---------- each frame ---------- */
const patience=o=>18+3*o.recipe.length-1.2*S.day;
function tick(dt){
  const D=S.D;let ch=false;
  G.next-=dt;if(!liveTickets().length)G.next=Math.min(G.next,.8);
  if(G.next<=0&&G.orders.length){const i=S.slots.indexOf(null);if(i>=0){const o=G.orders.shift(),t=newTicket(o,patience(o));t.base=0;S.slots[i]=t;G.next=D.gap;ch=true;snd('ding')}}
  for(const t of liveTickets()){if(t.pending)continue;t.time-=dt;if(t.time<=0){walkTicket(t);ch=true;if(G.target===t)G.target=null}}
  if(railSweep())ch=true;
  if(ch)drawRail();else railBars();
  if(S.mode==='play'&&!G.orders.length&&!liveTickets().length&&S.slots.every(t=>!t)&&!G.tracing)endShift();
}

const GAME={
  id:'trace',name:'Trace the recipe',
  blurb:'Drag through the pantry in recipe order. Build every burger in one swipe, or a few.',
  how:['<b>Drag one finger</b> through touching tiles, sideways or diagonally, in recipe order: bottom bun, patty, toppings, top bun. The order builds on its ticket as you go.',
    '<b>Let go on a finished order</b> to serve it. Let go after two or more tiles to plate part of it and finish it later.',
    '<b>Longer traces tip more.</b> Used tiles pop and new ones drop in. Stuck? Shake the pantry, but everyone waits a little longer.'],
  start(D){
    setup();Object.assign(G,{orders:Array.from({length:D.orders},()=>makeOrder(D)),next:.5,path:[],target:null,tracing:false,chains:[]});
    fillGrid();
  },
  tick,
  stop(){G.tracing=false;G.path=[]},
  resize(){if(G.cells){sizeGrid();G.cells.forEach((row,r)=>row.forEach((tl,c)=>tl&&posTile(tl,c,r)))}},
  afterRail(){if(G.target){const el=rail.querySelector(`[data-tid="${G.target.id}"]`);el&&el.classList.add('hot')}},
  stats:()=>{const n=G.chains.length;return n?`<p class="kick">Longest trace: ${Math.max(...G.chains)} tiles · Average: ${(G.chains.reduce((a,b)=>a+b,0)/n).toFixed(1)}</p>`:''},
};
kitStart();
