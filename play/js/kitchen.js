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
  return SHORT[tops[0]]+' burger';
}
function makeOrder(D){
  const k=Math.min(D.tops.length,rnd(D.minT,D.maxT));
  const tops=shuffle(D.tops.slice()).slice(0,k).sort((a,b)=>a-b);
  return {recipe:[0,1,...tops,8],name:burgerName(tops)};
}
let NID=1;
function startDay(){
  const D=DAYS[S.day];
  S.loyaltyStart=S.loyalty;S.tipsStart=S.tips;
  const orders=[];for(let i=0;i<D.orders;i++)orders.push(makeOrder(D));
  const types=orders.flatMap(o=>o.recipe);
  const pool=[1,...D.tops,...D.tops];
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
