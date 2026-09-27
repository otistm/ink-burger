/* Ink Burger: the dishes and their ingredients, the weeks (one new dish each), and the shape of a day. */
"use strict";
/* Each dish is a "suit": its cards only stack on cards of the same dish, bottom layer first.
   base: always in the order, first; tops: optional, unlocked in this order over the dish's first week; cap: always, last.
   Ingredient fields: n name on the card, s name in hints, sh short name for order names, h height on a ticket, ch height on a card,
   k the drawing (see shape() in draw.js), f its fill, and a few drawing extras (c count). */
const DISHES=[
  {id:'burger',name:'Burgers',base:[0,1],tops:[2,4,5,3,6,7],cap:[8],ings:[
    {n:'Bottom bun',s:'bottom bun',h:12,ch:20,k:'bunb'},
    {n:'Patty',s:'patty',h:13,ch:20,k:'patty'},
    {n:'Cheese',s:'cheese',h:6,ch:12,k:'cheese'},
    {n:'Bacon',s:'bacon',sh:'Bacon',h:7,ch:14,k:'wave',f:'stripes'},
    {n:'Lettuce',s:'lettuce',sh:'Lettuce',h:8,ch:16,k:'lettuce'},
    {n:'Tomato',s:'tomato',sh:'Tomato',h:7,ch:14,k:'tomato'},
    {n:'Onion',s:'onion',sh:'Onion',h:6,ch:12,k:'onion'},
    {n:'Pickles',s:'pickles',sh:'Pickle',h:6,ch:14,k:'pickles'},
    {n:'Top bun',s:'top bun',h:20,ch:30,k:'bunt'}]},
  {id:'pizza',name:'Pizza',plain:'Margherita',works:'Supreme',noun:'pizza',base:[0,1,2],tops:[3,4,5,6],cap:[7],ings:[
    {n:'Dough',s:'pizza dough',h:10,ch:16,k:'dough'},
    {n:'Sauce',s:'pizza sauce',h:5,ch:10,k:'drip',f:'stripes'},
    {n:'Mozzarella',s:'mozzarella',h:6,ch:12,k:'melt'},
    {n:'Pepperoni',s:'pepperoni',sh:'Pepperoni',h:5,ch:10,k:'discs',f:'dots',c:4},
    {n:'Mushroom',s:'mushrooms',sh:'Mushroom',h:9,ch:15,k:'caps'},
    {n:'Olives',s:'olives',sh:'Olive',h:5,ch:10,k:'rings',c:5},
    {n:'Peppers',s:'peppers',sh:'Pepper',h:6,ch:12,k:'wave',f:'paper'},
    {n:'Basil',s:'basil',h:7,ch:14,k:'leaves'}]},
  {id:'pasta',name:'Pasta',plain:'Spaghetti',works:'Pasta feast',noun:'pasta',base:[0,1,2],tops:[3,4,5,6],cap:[7],ings:[
    {n:'Bowl',s:'a pasta bowl',h:14,ch:20,k:'bowl'},
    {n:'Noodles',s:'noodles',h:12,ch:18,k:'heap'},
    {n:'Marinara',s:'marinara',h:7,ch:12,k:'blob',f:'stripes'},
    {n:'Meatballs',s:'meatballs',sh:'Meatball',h:9,ch:15,k:'balls',f:'hatch',c:3},
    {n:'Sausage',s:'sausage',sh:'Sausage',h:6,ch:12,k:'discs',f:'hatch',c:4},
    {n:'Peas',s:'peas',sh:'Pea',h:5,ch:10,k:'balls',f:'paper',c:7},
    {n:'Spinach',s:'spinach',sh:'Spinach',h:7,ch:14,k:'lettuce'},
    {n:'Parmesan',s:'parmesan',h:5,ch:10,k:'shards'}]},
  {id:'sandwich',name:'Sandwiches',plain:'Turkey sandwich',works:'Club sandwich',noun:'sandwich',base:[0,1],tops:[2,3,4,5],cap:[6],ings:[
    {n:'Bread',s:'bread',h:9,ch:14,k:'slice'},
    {n:'Turkey',s:'turkey',h:9,ch:14,k:'fold'},
    {n:'Swiss',s:'swiss cheese',sh:'Swiss',h:6,ch:12,k:'swiss'},
    {n:'Avocado',s:'avocado',sh:'Avocado',h:6,ch:12,k:'avo'},
    {n:'Cucumber',s:'cucumber',sh:'Cucumber',h:6,ch:12,k:'rings',c:3},
    {n:'Egg',s:'egg',sh:'Egg',h:7,ch:12,k:'egg'},
    {n:'Top slice',s:'the top slice',h:12,ch:18,k:'crown'}]},
  {id:'nachos',name:'Nachos',plain:'Cheesy nachos',works:'Loaded nachos',noun:'nachos',base:[0,1,2],tops:[3,4,5,6],cap:[7],ings:[
    {n:'Chips',s:'chips',h:10,ch:16,k:'chips'},
    {n:'Beans',s:'beans',h:7,ch:12,k:'blob',f:'dots'},
    {n:'Queso',s:'queso',h:6,ch:12,k:'melt'},
    {n:'Jalapeños',s:'jalapeños',sh:'Jalapeño',h:5,ch:10,k:'rings',c:4},
    {n:'Salsa',s:'salsa',sh:'Salsa',h:6,ch:12,k:'chunks'},
    {n:'Guac',s:'guac',sh:'Guac',h:7,ch:12,k:'blob',f:'paper',specks:1},
    {n:'Corn',s:'corn',sh:'Corn',h:5,ch:10,k:'balls',f:'dots',c:6},
    {n:'Sour cream',s:'sour cream',h:10,ch:16,k:'dollop'}]},
  {id:'cake',name:'Cakes',plain:'Sponge cake',works:'Layer cake',noun:'cake',base:[0,1],tops:[2,3,4,5],cap:[6,7],ings:[
    {n:'Plate',s:'a cake plate',h:5,ch:8,k:'plate'},
    {n:'Sponge',s:'sponge',h:12,ch:18,k:'slab',f:'dots'},
    {n:'Jam',s:'jam',sh:'Jam',h:4,ch:8,k:'slab',f:'stripes'},
    {n:'Cream',s:'cream',sh:'Cream',h:7,ch:12,k:'cloud'},
    {n:'Berries',s:'berries',sh:'Berry',h:7,ch:12,k:'balls',f:'paper',c:4,shine:1},
    {n:'Chocolate',s:'chocolate',sh:'Chocolate',h:6,ch:10,k:'slab',f:'hatch'},
    {n:'Frosting',s:'frosting',h:9,ch:14,k:'frost'},
    {n:'Cherry',s:'a cherry',h:9,ch:14,k:'cherry'}]},
  {id:'cookie',name:'Cookies',plain:'Double cookie',works:'Cookie tower',noun:'cookie',base:[0,1],tops:[2,3,4,5],cap:[6,7],ings:[
    {n:'Plate',s:'a cookie plate',h:5,ch:8,k:'plate'},
    {n:'Cookie',s:'a cookie',h:8,ch:14,k:'cookie'},
    {n:'Ice cream',s:'ice cream',sh:'Ice cream',h:10,ch:16,k:'cloud'},
    {n:'Caramel',s:'caramel',sh:'Caramel',h:5,ch:10,k:'drip',f:'stripes'},
    {n:'Mallow',s:'marshmallow',sh:'Mallow',h:9,ch:14,k:'mallow'},
    {n:'Choc chips',s:'chocolate chips',sh:'Choc chip',h:5,ch:10,k:'drops'},
    {n:'Top cookie',s:'the top cookie',h:8,ch:14,k:'cookie'},
    {n:'Sprinkles',s:'sprinkles',h:4,ch:8,k:'sprinkles'}]},
];
// One flat list of every ingredient. A card's t is its place in this list; burgers come first, so t 0–8 are the burger cards.
// d is the dish, r the number printed on the card (1 = the bottom layer).
const ING=[];
DISHES.forEach((D,d)=>{D.first=ING.length;D.ings.forEach((x,i)=>ING.push({...x,d,r:i+1}))});
const IDS=(d,list)=>list.map(i=>DISHES[d].first+i);

/* Weeks: Glossy's opens something new, and Ink Burger adds that dish. Each week keeps the two dishes before it on the menu. */
const DAYNAMES=['Monday','Tuesday','Wednesday','Thursday','Friday'];
const WEEKS=[
  {dish:0,rival:"Glossy's",stories:[
    "Ink Burger has fed this block for thirty years. This morning a neon sign went up across the street: Glossy's. Keep your regulars happy.",
    "Glossy's is giving away free fries. Half the lunch crowd is standing on the corner, deciding.",
    "Glossy's put bacon on everything. Now your regulars are asking for it too.",
    "A food critic ate at Glossy's last night. Word is she's eating here today.",
    "Glossy's is running two-for-one. Whoever wins Friday wins the street."]},
  {dish:1,rival:"Glossy's Pizza",next:"On Monday, Glossy's opens a pizza place.",stories:[
    "Glossy's opened a pizza place next to their burger place. So Ink Burger fired up the old oven out back. Pizza's on the menu.",
    "Glossy's pizza comes in a box shaped like their logo. Your regulars say yours tastes like pizza.",
    "Glossy's is holding a pizza-eating contest on the sidewalk. Nobody has finished a slice yet.",
    "A Glossy's delivery kid got lost and ate lunch here instead. He says he'll tell his friends.",
    "Friday is pizza night. Whoever's oven stays hotter wins the block."]},
  {dish:2,rival:"Glossy's Pasta",next:"On Monday, Glossy's opens a pasta place.",stories:[
    "Glossy's Pasta opened on the corner, with a man in a tall hat twirling noodles in the window. Ink Burger dusts off grandma's recipe.",
    "Glossy's noodles come out of a machine. Yours come out of a pot older than the building.",
    "Glossy's is giving away free breadsticks. They are very long and very dry.",
    "It's raining. Rainy days are pasta days, and the whole street is hungry.",
    "Glossy's is serving a meatball the size of a bowling ball. Don't flinch."]},
  {dish:3,rival:"Glossy's Deli",next:"On Monday, Glossy's opens a deli.",stories:[
    "Glossy's Deli opened with a sign that says BEST ON THE BLOCK. Ink Burger starts slicing bread.",
    "The office crowd wants lunch they can eat at a desk. Glossy's wraps theirs in gold foil.",
    "Glossy's Deli ran out of bread by eleven. Their line is looking your way.",
    "There's a picnic in the park across the road. Everyone needs sandwiches, fast.",
    "Glossy's cuts every sandwich into tiny triangles. Show them a proper half."]},
  {dish:4,rival:"Glossy's Cantina",next:"On Monday, Glossy's opens a cantina.",stories:[
    "Glossy's Cantina opened with a band and a neon cactus. Ink Burger bought a very large bag of chips.",
    "It's game night on the street. Nachos travel from the counter to the couch.",
    "Glossy's cheese comes out of a pump. Yours comes off a block.",
    "Glossy's hot sauce made a grown man cry. He wants something friendlier.",
    "The big match is tonight. The whole block wants nachos at kick-off."]},
  {dish:5,rival:"Glossy's Bakery",next:"On Monday, Glossy's opens a bakery.",stories:[
    "Glossy's Bakery opened with a wedding cake in the window taller than the door. Ink Burger borrows the neighbor's mixer.",
    "Three birthdays on the block today. Candles not included.",
    "Glossy's cakes are gorgeous. People say they taste like the box they came in.",
    "The school bake sale sold out by noon. The parents are coming to you.",
    "Glossy's is baking a cake the size of a car for the weekend. Keep your slices coming."]},
  {dish:6,rival:"Glossy's Cookie Co.",next:"On Monday, Glossy's opens a cookie shop.",stories:[
    "Glossy's Cookie Co. opened, with free samples and a giant cookie mascot. Ink Burger rolls up its sleeves one last time.",
    "The cookie mascot has been standing outside your door all morning, waving.",
    "School's out early. Every kid on the block has a dollar.",
    "Glossy's has stretched itself thin. Half their signs are flickering.",
    "Last stand. Win today and Glossy's is out of new ideas."]},
];
// How each day of the week plays. rail: tickets at once; base: patience in seconds (plus 5 per layer); gap: seconds between customers;
// minT, maxT: how many toppings an order has.
const DAYTPL=[
  {orders:6,base:50,rail:2,gap:10,minT:0,maxT:2},
  {orders:8,base:45,rail:3,gap:10,minT:1,maxT:2},
  {orders:9,base:42,rail:3,gap:9,minT:1,maxT:3},
  {orders:10,base:38,rail:3,gap:8.5,minT:1,maxT:3},
  {orders:12,base:35,rail:3,gap:8,minT:2,maxT:4},
];
// Everything about one day: the menu (dish numbers, the new one last), the toppings each dish can have, and the new cards to show.
function dayDef(w,d){
  const W=WEEKS[w],menu=[];for(let k=Math.max(0,w-2);k<=w;k++)menu.push(k);
  const tops={};menu.forEach(m=>{const T=DISHES[m].tops;tops[m]=IDS(m,m===W.dish?T.slice(0,Math.min(T.length,2+d)):T)});
  const N=DISHES[W.dish];
  const fresh=d===0?IDS(W.dish,[...N.base,...N.tops.slice(0,2),...N.cap]):N.tops.length>1+d?IDS(W.dish,[N.tops[1+d]]):[];
  return{...DAYTPL[d],week:w,day:d,name:DAYNAMES[d],menu,tops,fresh,story:W.stories[d],rival:W.rival};
}
