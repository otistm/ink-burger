/* Ink Burger prototype A: drop and stack. The next ingredient swings on a hook above the plate; tap to drop it.
   Land it on the stack to build the order at the front of the line (dashed outline on the rail). Too far off the layer
   below and it slides off, costing that customer some patience. A dead-centre landing is a "Perfect" and tips extra. */
"use strict";
const stage=$('#stage');
const G={};                                  // this game's state
let SW=360,SH=500,K=2.2,PX=180,PY=470;       // stage size, px per drawing unit, plate centre x, plate top y (world)
const HY=64;                                 // highest the hanging ingredient's top can be on screen
const GAP=150;                               // how far the hook hangs above the top of the stack

function sizeStage(){
  const r=stage.getBoundingClientRect();SW=r.width;SH=r.height;
  K=Math.min(SW*.56,230)/100;PX=SW/2;PY=SH-28;
  const w=$('#world');if(w)w.setAttribute('viewBox',`0 0 ${SW} ${SH}`);
  if(G.plate)G.plate.setAttribute('d',`M${PX-58*K} ${PY} H${PX+58*K} Q${PX+56*K} ${PY+14} ${PX+48*K} ${PY+14} H${PX-48*K} Q${PX-56*K} ${PY+14} ${PX-58*K} ${PY} Z`);
}
const layerH=t=>ING[t].h*K;
// one ingredient drawn at the stage's scale, bottom-centred on (0,0) so it can be moved with a transform
function layerSVG(t){const h=ING[t].h;return `<g class="L"><g class="sq"><g transform="translate(${-50*K} ${-h*K}) scale(${K})">${layerG(t,0,h,'full',2.7/K)}</g></g></g>`}
function place(el,x,yBottom,rot=0){el.setAttribute('transform',`translate(${x} ${yBottom})${rot?` rotate(${rot})`:''}`)}

function setup(){
  stage.innerHTML=`<svg id="world" aria-label="Kitchen: tap to drop"><path id="rail2" style="fill:none;stroke:var(--ink)" stroke-width="3" stroke-linecap="round"/>
    <line id="rope" style="stroke:var(--ink)" stroke-width="2"/><circle id="hookDot" r="4" style="fill:var(--ink)"/>
    <g id="cam"><path id="plate" style="fill:var(--paper);stroke:var(--ink)" stroke-width="2.6"/><g id="stackG"></g><g id="itemG"></g></g></svg>
    <div class="taphint" id="taphint">Tap anywhere to drop</div>`;
  G.plate=$('#plate');G.stackG=$('#stackG');G.itemG=$('#itemG');G.cam=$('#cam');G.rope=$('#rope');G.hookDot=$('#hookDot');
  sizeStage();
}

/* ---------- orders ---------- */
const patience=o=>16+3*o.recipe.length-1.2*S.day;
function current(){
  if(G.cur&&!G.cur.done&&!G.cur.gone)return G.cur;
  const live=liveTickets().sort((a,b)=>a.id-b.id);G.cur=live[0]||null;
  G.stack=[];G.stackG.innerHTML='';G.stackG.removeAttribute('style');
  return G.cur;
}
function markCur(){rail.querySelectorAll('.ticket').forEach(el=>el.classList.toggle('hot',!!G.cur&&+el.dataset.tid===G.cur.id))}

/* ---------- the swinging ingredient ---------- */
function spawnItem(){
  const t=current();if(!t||G.item)return;
  const ing=t.recipe[t.p];
  G.itemG.innerHTML=layerSVG(ing);
  G.item={t:ing,x:PX,y:0,vy:0,state:'hang',el:G.itemG.firstChild,rot:0};
}
function drop(){
  if(S.mode!=='play'||!G.item||G.item.state!=='hang')return;
  G.item.state='fall';G.item.vy=120;snd('pick');haptic(6);
  $('#taphint').classList.add('gone');
}
function topY(){return G.stack.length?G.stack[G.stack.length-1].y-layerH(G.stack[G.stack.length-1].t):PY}
function topX(){return G.stack.length?G.stack[G.stack.length-1].x:PX}
function land(){
  const it=G.item,t=G.cur,bx=topX(),off=it.x-bx,half=50*K;
  if(!t||t.done||t.gone){it.state='off';it.vx=0;it.spin=0;return}
  if(Math.abs(off)>half*.7){                    // slides off the edge
    it.state='off';it.vx=Math.sign(off)*170;it.spin=Math.sign(off)*260;it.vy=-60;
    t.time=Math.max(.5,t.time-2);G.missed++;snd('bad');haptic(30);
    const r=stage.getBoundingClientRect();floatText('Oops',r.left+it.x,r.top+G.hy+40,'small');
    G.respawn=.55;return;
  }
  const perfect=Math.abs(off)<Math.max(8,K*4);
  const x=perfect?bx:it.x,y=topY();
  G.itemG.innerHTML='';G.item=null;
  G.stackG.insertAdjacentHTML('beforeend',layerSVG(it.t));
  const el=G.stackG.lastChild;G.stack.push({t:it.t,x,y,el});place(el,x,y);
  if(!RM)el.querySelector('.sq').animate([{transform:'scale(1.22,.6)'},{transform:'scale(.93,1.12)',offset:.55},{transform:'none'}],{duration:280,easing:'ease-out'});
  G.sway+=off*.35;
  // lean too far from the plate's centre and the whole thing topples: start this order again
  if(Math.abs(x-PX)>half*.85){
    G.toppled++;t.p=0;t.time=Math.max(.5,t.time-3);snd('walk');haptic(60);drawRail();
    const r=stage.getBoundingClientRect();floatText('Timber!',r.left+x,r.top+y+G.camY-40,'small');
    const g=G.stackG,side=Math.sign(x-PX);G.busy=true;
    const a=g.animate([{transform:'none'},{transform:`translate(${side*60}px,40px) rotate(${side*28}deg)`,opacity:0}],{duration:RM?60:560,easing:'cubic-bezier(.6,0,.9,.5)',fill:'forwards'});
    a.onfinish=()=>{G.stack=[];g.innerHTML='';a.cancel();G.busy=false;G.respawn=.3};
    return;
  }
  t.p++;S.popping.clear();drawRail();
  if(perfect){G.perfect++;t.perfects=(t.perfects||0)+1;snd('ding');const r=stage.getBoundingClientRect();floatText('Perfect',r.left+x,r.top+y+G.camY-30,'small')}
  else snd('place');
  haptic(10);
  if(t.p>=t.recipe.length){t.pending=true;G.busy=true;setTimeout(()=>finish(t),380)}
  else G.respawn=.18;
}
// the finished order: tip, then the plate slides off to the right
function finish(t){
  if(t.gone){G.busy=false;return}
  serveTicket(t,2*(t.perfects||0));
  const a=G.stackG.animate([{transform:'none'},{transform:`translate(${SW*.9}px,-10px) rotate(8deg)`,opacity:.2}],{duration:RM?60:460,easing:'cubic-bezier(.5,0,.8,.4)',fill:'forwards'});
  a.onfinish=()=>{G.stack=[];G.stackG.innerHTML='';a.cancel();G.busy=false;G.cur=null;G.respawn=.3};
}
function dumpStack(){
  const g=G.stackG;if(!G.stack.length)return;
  const a=g.animate([{transform:'none'},{transform:'translate(-30px,160px) rotate(-14deg)',opacity:0}],{duration:RM?60:520,easing:'ease-in',fill:'forwards'});
  G.busy=true;a.onfinish=()=>{G.stack=[];g.innerHTML='';a.cancel();G.busy=false};
}

/* ---------- each frame ---------- */
function tick(dt){
  const D=S.D;let ch=false;
  // customers arrive
  G.next-=dt;if(!liveTickets().length)G.next=Math.min(G.next,.8);
  if(G.next<=0&&G.orders.length){const i=S.slots.indexOf(null);if(i>=0){const o=G.orders.shift();S.slots[i]=newTicket(o,patience(o));G.next=D.gap*.9;ch=true;snd('ding')}}
  // patience
  for(const t of liveTickets()){if(t.pending)continue;t.time-=dt;
    if(t.time<=0){const wasCur=t===G.cur;walkTicket(t);ch=true;if(wasCur){dumpStack();G.cur=null;if(G.item&&G.item.state==='hang'){G.itemG.innerHTML='';G.item=null}G.respawn=.6}}}
  if(railSweep())ch=true;
  if(ch){drawRail()}else railBars();
  if(S.mode!=='play')return;
  // the next ingredient
  if(!G.item&&!G.busy){G.respawn-=dt;if(G.respawn<=0)spawnItem()}
  G.phase+=dt*(2.1+.28*S.day+.1*G.stack.length);
  const A=Math.min(SW*.34,140),it=G.item;
  if(it){
    if(it.state==='hang'){it.x=PX+A*Math.sin(G.phase);it.y=G.hy-G.camY+layerH(it.t)}
    else{it.vy+=2600*dt;it.y+=it.vy*dt;
      if(it.state==='fall'&&it.y>=topY())land();
      else if(it.state==='off'){it.x+=it.vx*dt;it.rot+=it.spin*dt;if(it.y>PY+SH){G.itemG.innerHTML='';G.item=null}}}
    if(G.item)place(G.item.el,G.item.x,G.item.y,G.item.rot);
  }
  // hook, rope and rail, in screen space: the hook rides a little above the stack
  G.hy+=(Math.max(HY,topY()+G.camY-GAP)-G.hy)*Math.min(1,dt*6);
  $('#rail2').setAttribute('d',`M${SW*.08} ${G.hy-30} H${SW*.92}`);
  const hang=it&&it.state==='hang';
  G.rope.style.opacity=G.hookDot.style.opacity=hang?1:0;
  if(hang){G.rope.setAttribute('x1',it.x);G.rope.setAttribute('y1',G.hy-30);G.rope.setAttribute('x2',it.x);G.rope.setAttribute('y2',G.hy);G.hookDot.setAttribute('cx',it.x);G.hookDot.setAttribute('cy',G.hy)}
  // the stack sways like a spring, more at the top
  G.swayV+=(-60*G.sway-7*G.swayV)*dt;G.sway+=G.swayV*dt;
  const n=G.stack.length;G.stack.forEach((L,i)=>place(L.el,L.x+G.sway*Math.pow((i+1)/n,1.5),L.y));
  // camera rises as the stack grows
  const want=Math.max(0,HY+GAP-topY());G.camY+=(want-G.camY)*Math.min(1,dt*5);
  G.cam.setAttribute('transform',`translate(0 ${G.camY})`);
  // the day ends when everyone is served or gone
  if(!G.orders.length&&!liveTickets().length&&!G.busy&&S.slots.every(t=>!t))endShift();
}

const GAME={
  id:'stack',name:'Drop and stack',
  blurb:'Swing, drop, stack. Build each burger before the customer gives up.',
  how:['<b>Tap anywhere</b> to drop the swinging ingredient onto the plate. It always brings the next thing the order needs.',
    '<b>Land it on the stack.</b> Too far off the layer below and it slides off, and the customer loses patience.',
    '<b>Keep it straight.</b> Let the stack lean too far off the plate and it topples, and you start that burger again.',
    '<b>Dead centre</b> is a Perfect: it snaps straight and adds to the tip. The swing speeds up as the stack grows.'],
  start(D){
    setup();Object.assign(G,{orders:Array.from({length:D.orders},()=>makeOrder(D)),next:.5,cur:null,stack:[],item:null,busy:false,
      respawn:.4,phase:0,sway:0,swayV:0,camY:0,hy:0,perfect:0,missed:0,toppled:0});
    G.hy=Math.max(HY,PY-GAP);
  },
  tick,
  stop(){G.item=null;G.busy=false},
  resize(){if(G.plate){sizeStage();G.stack=[];G.stackG.innerHTML='';if(G.cur){G.cur.p=0;drawRail()}}},
  afterRail:markCur,
  stats:()=>`<p class="kick">Perfect drops: ${G.perfect} · Slid off: ${G.missed} · Toppled: ${G.toppled}</p>`,
};
stage.addEventListener('pointerdown',e=>{e.preventDefault();drop()});
addEventListener('keydown',e=>{if(e.code==='Space'){e.preventDefault();drop()}});
kitStart();
