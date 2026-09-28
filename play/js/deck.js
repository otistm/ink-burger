/* Ink Burger prototype C: kitchen deck-builder. Turn-based: no clock. Each turn you draw a hand from your pantry deck and
   tap cards to add them to orders. "Next turn" throws away what's left, every waiting customer loses one turn of patience,
   the next customer comes in, and you draw a fresh hand. Between days, spend tips in the shop: more cards, special cards,
   house rules, or tossing cards you don't want. */
"use strict";
const stage=$('#stage');
const G={};
// special cards: not ingredients, each does something when played
const SPECIALS={
  sauce:{n:'Special sauce',d:'Counts as any topping an order needs next',price:12,
    art:'<path d="M42 10h16v10l6 8v40q0 4-4 4H40q-4 0-4-4V28l6-8z" style="fill:var(--paper);stroke:var(--ink)" stroke-width="3" stroke-linejoin="round"/><path d="M36 44h28" style="stroke:var(--ink)" stroke-width="3"/><circle cx="50" cy="56" r="5" style="fill:var(--ink)"/>'},
  cook:{n:'Line cook',d:'Draw two more cards',price:10,
    art:'<path d="M32 44q-10-2-8-12 2-9 12-7 3-10 14-10t14 10q10-2 12 7 2 10-8 12v16H32z" style="fill:var(--paper);stroke:var(--ink)" stroke-width="3" stroke-linejoin="round"/><path d="M34 54h32" style="stroke:var(--ink)" stroke-width="3"/>'},
  coffee:{n:'Free coffee',d:'Every waiting customer waits one more turn',price:10,
    art:'<path d="M30 30h36v24q0 14-18 14T30 54z" style="fill:var(--paper);stroke:var(--ink)" stroke-width="3" stroke-linejoin="round"/><path d="M66 36q10 0 10 8t-10 8" style="fill:none;stroke:var(--ink)" stroke-width="3"/><path d="M40 14q-4 5 0 10M50 12q-4 5 0 10" style="fill:none;stroke:var(--ink)" stroke-width="3" stroke-linecap="round"/>'},
};
// house rules: bought once, last the whole week
const RULES={
  grill:{n:'Grill master',d:'Burgers with two or more toppings tip $3 more',price:26},
  hands:{n:'Big hands',d:'Draw 7 cards a turn instead of 6',price:30},
  sign:{n:'Neon sign',d:'New customers wait one more turn',price:26},
  bell:{n:'Service bell',d:'Serving an order draws you a card',price:22},
};
const START_DECK=[0,0,0,1,1,1,8,8,8,2,2,4,4];

function cardFace(c,i){
  if(c.s){const S_=SPECIALS[c.s];return `<button class="card spc" data-i="${i}" aria-label="${S_.n}: ${S_.d}"><span class="rk">★</span><span class="nm">${S_.n}</span><svg class="art" viewBox="0 0 100 80" aria-hidden="true">${S_.art}</svg></button>`}
  return cardHTML({id:0,t:c.t,up:true},'',null,true).replace('<div class="card"',`<button class="card" data-i="${i}"`).replace(/<\/div>$/,'</button>');
}
const cardName=c=>c.s?SPECIALS[c.s].n:ING[c.t].n;

function setup(){
  stage.innerHTML=`<div class="piles"><div class="pile"><div class="card down"><span class="bk">IB</span></div><b id="dkPile"></b><small>Pantry</small></div>
      <div class="turn"><b id="dkTurn"></b><small>Turn</small></div>
      <div class="pile"><div class="card down used"><span class="bk">IB</span></div><b id="dkUsed"></b><small>Used</small></div></div>
    <div id="dkRules"></div>
    <div id="hand" aria-label="Your hand"></div>
    <button class="btn" id="nextTurn">Next turn</button>`;
  $('#nextTurn').addEventListener('click',nextTurn);
  $('#hand').addEventListener('click',e=>{const b=e.target.closest('[data-i]');if(b)playCard(+b.dataset.i,b)});
}
function drawHand(){
  const n=G.run.rules.includes('hands')?7:6;
  while(G.hand.length<n)if(!drawOne())break;
}
function drawOne(){
  if(!G.pile.length){if(!G.used.length)return false;G.pile=shuffle(G.used);G.used=[];toast('Pantry reshuffled')}
  G.hand.push(G.pile.pop());return true;
}
function renderHand(anim){
  const h=$('#hand');h.innerHTML=G.hand.map(cardFace).join('');
  if(anim&&!RM)h.querySelectorAll('.card').forEach((el,i)=>el.animate([{transform:'translateY(90px) rotate(8deg)',opacity:0},{transform:'translateY(-6px)',opacity:1,offset:.7},{transform:'none'}],{duration:320,delay:i*45,easing:'cubic-bezier(.3,.8,.4,1)',fill:'backwards'}));
  $('#dkPile').textContent=G.pile.length;$('#dkUsed').textContent=G.used.length;$('#dkTurn').textContent=G.turn;
  $('#dkRules').innerHTML=G.run.rules.map(r=>`<span>${RULES[r].n}</span>`).join('');
}
function arrive(){
  const i=S.slots.indexOf(null);if(i<0||!G.orders.length)return false;
  const o=G.orders.shift(),turns=(o.recipe.length>=6?5:4)+(G.run.rules.includes('sign')?1:0);
  S.slots[i]=newTicket(o,turns);snd('ding');return true;
}
const isTop=t=>t!==0&&t!==1&&t!==8;
function playCard(i,el){
  if(S.mode!=='play')return;const c=G.hand[i];if(!c)return;
  const live=liveTickets().filter(t=>!t.pending).sort((a,b)=>a.time-b.time);
  if(c.s==='cook'){G.hand.splice(i,1);G.used.push(c);drawOne();drawOne();snd('draw');renderHand();return}
  if(c.s==='coffee'){if(!live.length){wiggle(el);toast('Nobody is waiting');return}
    G.hand.splice(i,1);G.used.push(c);live.forEach(t=>t.time=Math.min(t.max,t.time+1));snd('pop');drawRail();renderHand();toast('Everyone waits a turn longer');return}
  const t=c.s==='sauce'?live.find(t=>isTop(t.recipe[t.p])):live.find(t=>t.recipe[t.p]===c.t);
  if(!t){wiggle(el);snd('bad');toast(c.s?'No order needs a topping next':`No order needs ${ING[c.t].s} next`);return}
  G.hand.splice(i,1);G.used.push(c);
  // the card flies up to its ticket
  const tk=rail.querySelector(`[data-tid="${t.id}"]`);
  if(tk&&el&&!RM){const a=el.getBoundingClientRect(),b=tk.getBoundingClientRect(),f=el.cloneNode(true);f.className+=' fly';
    Object.assign(f.style,{left:a.left+'px',top:a.top+'px',width:a.width+'px',height:a.height+'px',position:'fixed'});fx.appendChild(f);
    f.animate([{transform:'none'},{transform:`translate(${b.left+b.width/2-a.left-a.width/2}px,${b.top+b.height/2-a.top-a.height/2}px) scale(.35)`,opacity:.2}],{duration:320,easing:'cubic-bezier(.5,0,.7,1)'}).onfinish=()=>f.remove()}
  t.p++;snd('plate');haptic(8);
  if(t.p>=t.recipe.length){
    t.pending=true;const tops=t.recipe.filter(isTop).length;
    setTimeout(()=>{if(t.gone)return;serveTicket(t,G.run.rules.includes('grill')&&tops>=2?3:0);
      if(G.run.rules.includes('bell')&&drawOne())renderHand();checkEnd()},300);
  }
  drawRail();renderHand();
}
function nextTurn(){
  if(S.mode!=='play')return;snd('reset');
  G.used.push(...G.hand);G.hand=[];G.turn++;
  for(const t of liveTickets()){if(t.pending)continue;t.time-=1;if(t.time<=0)walkTicket(t)}
  if(S.mode!=='play')return;
  arrive();if(S.day>=3&&G.turn%2===0)arrive();
  drawRail();drawHand();renderHand(true);checkEnd();
}
function checkEnd(){if(!G.orders.length&&!liveTickets().length)setTimeout(()=>{if(S.mode==='play'&&!liveTickets().length&&!G.orders.length)endShift()},900)}
function tick(){
  let ch=railSweep();
  // nobody waiting: the next customer walks straight in, no need to end the turn
  if(S.mode==='play'&&!liveTickets().length&&G.orders.length&&arrive())ch=true;
  if(ch)drawRail();else railBars();
}

/* ---------- the shop, on the end-of-day card ---------- */
function shopOffers(){
  const D=dayDef(0,Math.min(S.day+1,4)),ings=[0,1,8,...D.tops[0]];
  const pick=()=>ings[rnd(0,ings.length-1)];
  const sp=Object.keys(SPECIALS),rl=Object.keys(RULES).filter(r=>!G.run.rules.includes(r));
  G.offers=[{t:pick()},{t:pick()},{t:D.tops[0][rnd(0,D.tops[0].length-1)]},{s:sp[rnd(0,sp.length-1)]},...(rl.length?[{r:rl[rnd(0,rl.length-1)]}]:[])];
}
const priceOf=o=>o.r?RULES[o.r].price:o.s?SPECIALS[o.s].price:isTop(o.t)?9:7;
function shopHTML(){
  const deck=[...G.run.deck],counts={};deck.forEach(c=>{const k=c.s||c.t;counts[k]=(counts[k]||0)+1});
  const offer=(o,i)=>o.sold?'':`<button class="offer" data-act="buy" data-o="${i}" ${S.tips<priceOf(o)?'disabled':''}>
      ${o.r?`<b>${RULES[o.r].n}</b><small>House rule: ${RULES[o.r].d}</small>`:o.s?`<b>${SPECIALS[o.s].n}</b><small>${SPECIALS[o.s].d}</small>`:`<b>${ING[o.t].n}</b><small>Ingredient card</small>`}
      <i>$${priceOf(o)}</i></button>`;
  return `<div id="shop"><h2>The shop</h2><p class="kick">You have $${S.tips} in tips to spend. Your pantry has ${deck.length} cards.</p>
    <div class="offers">${G.offers.map(offer).join('')}</div>
    <h2>Toss a card ($5)</h2><div class="toss">${Object.entries(counts).map(([k,n])=>`<button data-act="toss" data-k="${k}" ${S.tips<5?'disabled':''}>${isNaN(k)?SPECIALS[k].n:ING[k].n} ×${n}</button>`).join('')}</div></div>`;
}
scr.addEventListener('click',e=>{
  const b=e.target.closest('[data-act=buy],[data-act=toss]');if(!b||b.disabled)return;
  if(b.dataset.act==='buy'){const o=G.offers[+b.dataset.o];if(o.sold||S.tips<priceOf(o))return;S.tips-=priceOf(o);o.sold=true;
    if(o.r)G.run.rules.push(o.r);else G.run.deck.push(o.s?{s:o.s}:{t:o.t});snd('serve')}
  else{const k=b.dataset.k,i=G.run.deck.findIndex(c=>String(c.s||c.t)===k);if(i<0||S.tips<5)return;S.tips-=5;G.run.deck.splice(i,1);snd('pop')}
  hud();$('#shop').outerHTML=shopHTML();
});

const clone=o=>JSON.parse(JSON.stringify(o));
const GAME={
  id:'deck',name:'Kitchen deck',
  blurb:'Build your pantry deck. Draw a hand, cook the orders, and spend your tips on a better kitchen.',
  how:['<b>No clock.</b> Each turn you draw a hand of ingredient cards. <b>Tap a card</b> to add it to the order that needs it next.',
    '<b>Next turn</b> throws away the rest of your hand. Every waiting customer loses one turn of patience, and the next one comes in.',
    '<b>After each day</b>, spend tips in the shop: more ingredients, special cards like Special sauce, house rules that last the week, or toss cards you don\'t want.'],
  newRun(){G.run={deck:START_DECK.map(t=>({t})),rules:[]}},
  retry(){G.retrying=true},
  start(D){
    if(!G.run)GAME.newRun();
    if(G.retrying&&G.snap){G.run=clone(G.snap);G.retrying=false}
    else{if(S.day>0)D.fresh.forEach(t=>G.run.deck.push({t},{t}));G.snap=clone(G.run)}
    setup();
    Object.assign(G,{orders:Array.from({length:D.orders},()=>makeOrder(D)),pile:shuffle(clone(G.run.deck)),used:[],hand:[],turn:1});
    arrive();drawHand();renderHand(true);
  },
  tick,
  stop(){},
  stats(){shopOffers();return S.day<DAYNAMES.length-1?shopHTML():''},
};
kitStart();
