/* Ink Burger: ingredients and the five days of the week. */
"use strict";
const ING=[
  {n:'Bottom bun',s:'bottom bun',h:12,ch:20},
  {n:'Patty',s:'patty',h:13,ch:20},
  {n:'Cheese',s:'cheese',h:6,ch:12},
  {n:'Bacon',s:'bacon',h:7,ch:14},
  {n:'Lettuce',s:'lettuce',h:8,ch:16},
  {n:'Tomato',s:'tomato',h:7,ch:14},
  {n:'Onion',s:'onion',h:6,ch:12},
  {n:'Pickles',s:'pickles',h:6,ch:14},
  {n:'Top bun',s:'top bun',h:20,ch:30},
];
const DAYS=[
  {name:'Monday',tops:[2,4],orders:6,base:50,rail:2,gap:10,minT:0,maxT:2,fresh:[0,1,2,4,8],
   story:"Ink Burger has fed this block for thirty years. This morning a neon sign went up across the street: Glossy's. Keep your regulars happy."},
  {name:'Tuesday',tops:[2,4,5],orders:8,base:45,rail:3,gap:10,minT:1,maxT:2,fresh:[5],
   story:"Glossy's is giving away free fries. Half the lunch crowd is standing on the corner, deciding."},
  {name:'Wednesday',tops:[2,3,4,5],orders:9,base:42,rail:3,gap:9,minT:1,maxT:3,fresh:[3],
   story:"Glossy's put bacon on everything. Now your regulars are asking for it too."},
  {name:'Thursday',tops:[2,3,4,5,6],orders:10,base:38,rail:3,gap:8.5,minT:1,maxT:3,fresh:[6],
   story:"A food critic ate at Glossy's last night. Word is she's eating here today."},
  {name:'Friday',tops:[2,3,4,5,6,7],orders:12,base:35,rail:3,gap:8,minT:2,maxT:4,fresh:[7],
   story:"Glossy's is running two-for-one. Whoever wins Friday wins the street."},
];
const SHORT={3:'Bacon',4:'Lettuce',5:'Tomato',6:'Onion',7:'Pickle'};
