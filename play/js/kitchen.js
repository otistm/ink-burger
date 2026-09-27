/* Ink Burger: setting up a day: orders, the deal and the pantry. */
"use strict";
function burgerName(tops){
  const has=x=>tops.includes(x);
  if(!tops.length)return 'Hamburger';
  if(tops.length>=4)return 'The Works';
  if(has(2)&&has(3))return 'Bacon cheese';
  if(tops.length===1&&has(2))return 'Cheeseburger';
  if(has(2))return 'Cheese deluxe';
  if(has(4)&&has(5))return 'Garden burger';
  return ING[tops[0]].sh+' burger';
}
function orderName(d,tops){
  const N=DISHES[d];
  if(d===0)return burgerName(tops);
  if(!tops.length)return N.plain;
  if(tops.length>=3)return N.works;
  return ING[tops[0]].sh+' '+N.noun;
}
// The newest dish on the menu shows up in about half the orders; the rest share the other half.
function pickDish(D){
  const menu=D.menu,fresh=menu[menu.length-1];
  if(menu.length===1||Math.random()<.45)return fresh;
  return menu[rnd(0,menu.length-2)];
}
function makeOrder(D){
  const d=pickDish(D),N=DISHES[d],T=D.tops[d];
  const k=Math.min(T.length,rnd(D.minT,D.maxT));
  const tops=shuffle(T.slice()).slice(0,k).sort((a,b)=>a-b);
  return {dish:d,recipe:[...IDS(d,N.base),...tops,...IDS(d,N.cap)],name:orderName(d,tops)};
}
let NID=1;
function startDay(){
  const D=S.D=dayDef(S.week,S.day);
  S.loyaltyStart=S.loyalty;S.tipsStart=S.tips;
  const orders=[];for(let i=0;i<D.orders;i++)orders.push(makeOrder(D));
  const types=orders.flatMap(o=>o.recipe);
  // spare cards: anything but each dish's bottom layer, with toppings twice as likely
  const pool=D.menu.flatMap(d=>[...IDS(d,DISHES[d].base.slice(1)),...D.tops[d],...D.tops[d]]);
  const extra=Math.round(types.length*.2);
  for(let i=0;i<extra;i++)types.push(pool[rnd(0,pool.length-1)]);
  shuffle(types);
  S.cols=[[],[],[],[],[]];
  S.cols.forEach((col,c)=>{for(let k=0;k<=c;k++)col.push({id:NID++,t:types.pop(),up:k===c})});
  S.stock=types.map(t=>({id:NID++,t,up:false}));
  S.waste=[];S.prep=[null,null];
  S.slots=Array(D.rail).fill(null);
  S.queue=orders;S.nextArrive=.6;S.clock=0;S.no=0;S.tid=S.tid||0;
  S.served=0;S.walked=0;S.dayTips=0;
  S.flipped.clear();S.popping.clear();
}
