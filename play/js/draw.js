/* Ink Burger: drawing ingredients, dishes on tickets, dish icons, customer faces and cards as ink SVG. */
"use strict";
const FILL={paper:'var(--paper)',dots:'url(#dots)',hatch:'url(#hatch)',stripes:'url(#stripes)',ink:'var(--ink)'};
const inkLine=(d,sw,k=.6)=>`<path d="${d}" style="fill:none;stroke:var(--ink)" stroke-width="${sw*k}" stroke-linecap="round"/>`;
const inkDot=(x,y,rx,ry=rx)=>`<ellipse cx="${x}" cy="${y}" rx="${rx}" ry="${ry}" style="fill:var(--ink)"/>`;
const oval=(cx,cy,rx,ry)=>`M${cx-rx} ${cy} a${rx} ${ry} 0 1 0 ${2*rx} 0 a${rx} ${ry} 0 1 0 ${-2*rx} 0`;
const pill=(x0,x1,y,b)=>{const m=(y+b)/2,r=Math.min(6,(x1-x0)/2);return `M${x0+r} ${y} H${x1-r} Q${x1} ${y} ${x1} ${m} Q${x1} ${b} ${x1-r} ${b} H${x0+r} Q${x0} ${b} ${x0} ${m} Q${x0} ${y} ${x0+r} ${y} Z`};
const spread=(n,a=8,z=92)=>Array.from({length:n},(_,i)=>a+(z-a)*(i+.5)/n);

// Each ingredient's side-on outline between y (top) and y+h (bottom), 0–100 wide: d the path, f its fill, deco extra ink on top.
function shape(t,y,h){
  const I=ING[t],b=y+h,m=y+h/2,F=FILL[I.f]||'var(--paper)';
  switch(I.k){
    // burger
    case 'bunb':return{d:`M8 ${y} H92 V${b-5} Q92 ${b} 86 ${b} H14 Q8 ${b} 8 ${b-5} Z`,f:'var(--paper)'};
    case 'patty':return{d:`M10 ${y} H90 Q96 ${y} 96 ${m} Q96 ${b} 90 ${b} H10 Q4 ${b} 4 ${m} Q4 ${y} 10 ${y} Z`,f:'url(#hatch)'};
    case 'cheese':return{d:`M4 ${y} H96 V${b} H81 L77 ${b+4} L73 ${b} H40 L35 ${b+5} L30 ${b} H4 Z`,f:'url(#dots)'};
    case 'wave':return{d:`M6 ${y+2} Q20 ${y-2} 34 ${y+2} T62 ${y+2} T90 ${y+2} L94 ${y+2} L94 ${b-2} Q80 ${b+2} 66 ${b-2} T38 ${b-2} T10 ${b-2} L6 ${b-2} Z`,f:F};
    case 'lettuce':{let d=`M3 ${y+2} Q50 ${y-3} 97 ${y+2} L97 ${m}`;for(let x=97;x>3.1;x-=11.75)d+=` Q${(x-5.875).toFixed(2)} ${b+2} ${(x-11.75).toFixed(2)} ${m}`;
      return{d:d+' Z',f:'var(--paper)',deco:sw=>`<path d="M18 ${m} l7 -2 M42 ${m} l7 -2 M66 ${m} l7 -2" style="fill:none;stroke:var(--ink)" stroke-width="${sw*.6}" stroke-linecap="round"/>`}}
    case 'tomato':return{d:`M12 ${y} H88 Q93 ${y} 93 ${m} Q93 ${b} 88 ${b} H12 Q7 ${b} 7 ${m} Q7 ${y} 12 ${y} Z`,f:'var(--paper)',
      deco:()=>[24,40,60,76].map(x=>`<ellipse cx="${x}" cy="${m}" rx="2.2" ry="${Math.max(1,h*.16)}" style="fill:var(--ink)"/>`).join('')};
    case 'onion':{const ry=h/2;return{d:`M10 ${m} a18 ${ry} 0 1 0 36 0 a18 ${ry} 0 1 0 -36 0 M54 ${m} a18 ${ry} 0 1 0 36 0 a18 ${ry} 0 1 0 -36 0`,f:'var(--paper)',
      deco:sw=>`<ellipse cx="28" cy="${m}" rx="10" ry="${ry*.45}" style="fill:none;stroke:var(--ink)" stroke-width="${sw*.6}"/><ellipse cx="72" cy="${m}" rx="10" ry="${ry*.45}" style="fill:none;stroke:var(--ink)" stroke-width="${sw*.6}"/>`}}
    case 'pickles':{const r=h/2+1;return{d:[22,50,78].map(cx=>`M${cx-r} ${m} a${r} ${r} 0 1 0 ${2*r} 0 a${r} ${r} 0 1 0 ${-2*r} 0`).join(' '),f:'var(--paper)',
      deco:()=>[22,50,78].map(cx=>`<circle cx="${cx-r*.35}" cy="${m-r*.2}" r="${r*.18}" style="fill:var(--ink)"/><circle cx="${cx+r*.35}" cy="${m+r*.25}" r="${r*.18}" style="fill:var(--ink)"/>`).join('')}}
    case 'bunt':return{d:`M6 ${b} H94 V${b-3} Q94 ${y} 50 ${y} Q6 ${y} 6 ${b-3} Z`,f:'var(--paper)',
      deco:()=>[[30,.5,-20],[45,.3,10],[60,.48,-10],[72,.66,20],[40,.68,15],[54,.62,-25]].map(([x,f,r])=>`<ellipse cx="${x}" cy="${y+h*f}" rx="2.4" ry="1.1" transform="rotate(${r} ${x} ${y+h*f})" style="fill:var(--ink)"/>`).join('')};
    // plates, bowls, doughs and breads
    case 'plate':return{d:`M1 ${y} H99 Q97 ${b} 89 ${b} H11 Q3 ${b} 1 ${y} Z`,f:'var(--paper)'};
    case 'bowl':return{d:`M3 ${y} H97 Q95 ${b} 50 ${b} Q5 ${b} 3 ${y} Z`,f:'var(--paper)',deco:sw=>inkLine(`M14 ${y+h*.3} Q50 ${y+h*.5} 86 ${y+h*.3}`,sw)};
    case 'dough':return{d:pill(3,97,y,b),f:'var(--paper)',deco:sw=>inkLine(`M14 ${m} Q16 ${y+1.5} 20 ${y+1.5} M86 ${m} Q84 ${y+1.5} 80 ${y+1.5}`,sw)+[34,50,66].map(x=>inkDot(x,m+.5,1.1)).join('')};
    case 'slice':return{d:`M5 ${y+2} Q5 ${y} 8 ${y} H92 Q95 ${y} 95 ${y+2} V${b-2} Q95 ${b} 92 ${b} H8 Q5 ${b} 5 ${b-2} Z`,f:'var(--paper)',
      deco:()=>[[22,.45],[40,.6],[58,.4],[76,.58]].map(([x,f])=>inkDot(x,y+h*f,1.6,1)).join('')};
    case 'crown':return{d:`M5 ${b} V${y+h*.45} Q5 ${y} 28 ${y} Q50 ${y+h*.22} 72 ${y} Q95 ${y} 95 ${y+h*.45} V${b} Z`,f:'var(--paper)',
      deco:()=>[[26,.62],[44,.72],[60,.6],[76,.72]].map(([x,f])=>inkDot(x,y+h*f,1.6,1)).join('')};
    case 'chips':{let d=`M3 ${b}`;spread(6,3,97).forEach((x,i)=>{d+=` L${x-8} ${b} L${x} ${y+(i%2)*2} L${x+8} ${b}`});
      return{d:d+' Z',f:'var(--paper)',deco:()=>spread(6,3,97).map(x=>inkDot(x,b-h*.3,.9)).join('')}}
    case 'cookie':return{d:pill(5,95,y,b),f:'var(--paper)',deco:()=>[[20,.45],[34,.62],[50,.4],[64,.6],[80,.48]].map(([x,f])=>inkDot(x,y+h*f,1.8,1.3)).join('')};
    // sauces, spreads and soft layers
    case 'drip':return{d:`M4 ${y} H96 V${b} H80 Q76 ${b+4} 72 ${b} H46 Q41 ${b+5} 36 ${b} H4 Z`,f:F};
    case 'melt':return{d:`M3 ${y} H97 V${b} H86 Q84 ${b+4} 81 ${b+4} Q78 ${b+4} 77 ${b} H52 Q50 ${b+5} 47 ${b+5} Q44 ${b+5} 43 ${b} H22 Q20 ${b+3} 17 ${b+3} Q15 ${b+3} 14 ${b} H3 Z`,f:'var(--paper)'};
    case 'blob':return{d:`M6 ${b} Q2 ${m} 14 ${y+1} Q30 ${y-2} 50 ${y+1} Q70 ${y-2} 86 ${y+1} Q98 ${m} 94 ${b} Z`,f:F,
      deco:I.specks?()=>[[22,.6],[36,.4],[52,.62],[66,.42],[80,.64]].map(([x,f])=>inkDot(x,y+h*f,1.1)).join(''):null};
    case 'slab':return{d:`M4 ${y+1.5} Q4 ${y} 6 ${y} H94 Q96 ${y} 96 ${y+1.5} V${b-1.5} Q96 ${b} 94 ${b} H6 Q4 ${b} 4 ${b-1.5} Z`,f:F};
    case 'cloud':{let d=`M5 ${b} V${m}`;for(let x=5;x<94.9;x+=15)d+=` Q${x+7.5} ${y-1} ${x+15} ${m}`;return{d:d+` V${b} Z`,f:'var(--paper)'}}
    case 'frost':return{d:`M3 ${b-2} V${y+3} Q3 ${y} 8 ${y} H92 Q97 ${y} 97 ${y+3} V${b-2} Q92 ${b+3} 87 ${b-2} Q78 ${b} 70 ${b-2} Q62 ${b+3} 55 ${b-2} Q42 ${b} 32 ${b-2} Q22 ${b+3} 13 ${b-2} Q8 ${b} 3 ${b-2} Z`,f:'var(--paper)',
      deco:sw=>inkLine(`M12 ${y+h*.35} Q20 ${y+h*.55} 28 ${y+h*.35} T44 ${y+h*.35} T60 ${y+h*.35} T76 ${y+h*.35} T90 ${y+h*.35}`,sw)};
    case 'dollop':return{d:`M16 ${b} Q8 ${b} 14 ${m+1} Q18 ${m-1} 30 ${m} Q34 ${y} 50 ${y} Q66 ${y} 70 ${m} Q82 ${m-1} 86 ${m+1} Q92 ${b} 84 ${b} Z`,f:'var(--paper)',
      deco:sw=>inkLine(`M38 ${m+1} Q50 ${m-2} 62 ${m+1}`,sw)};
    case 'heap':return{d:`M4 ${b} Q6 ${y} 50 ${y} Q94 ${y} 96 ${b} Z`,f:'var(--paper)',
      deco:sw=>[.4,.7].map(f=>{const yy=y+h*f,x0=f>.5?12:22,x1=f>.5?88:78;let d=`M${x0} ${yy}`;for(let x=x0;x<x1;x+=10)d+=` q5 -3 10 0`;return inkLine(d,sw)}).join('')};
    case 'fold':return{d:`M4 ${y+2} Q15 ${y-1} 26 ${y+2} Q37 ${y+5} 48 ${y+2} Q59 ${y-1} 70 ${y+2} Q81 ${y+5} 96 ${y+2} V${b-1} Q50 ${b+2} 4 ${b-1} Z`,f:'var(--paper)',
      deco:sw=>inkLine(`M26 ${y+3.5} Q24 ${m+1} 28 ${b-1.5} M70 ${y+3.5} Q68 ${m+1} 72 ${b-1.5}`,sw)};
    case 'swiss':return{d:`M4 ${y} H96 V${b} H4 Z`,f:'var(--paper)',
      deco:sw=>[[18,.5,3],[40,.45,2],[62,.55,3.4],[82,.45,2]].map(([x,f,r])=>`<ellipse cx="${x}" cy="${y+h*f}" rx="${r}" ry="${Math.min(r,h*.3)}" style="fill:none;stroke:var(--ink)" stroke-width="${sw*.6}"/>`).join('')};
    case 'egg':return{d:`M4 ${b} Q4 ${y+1} 26 ${y+2} Q50 ${y-1} 74 ${y+2} Q96 ${y+1} 96 ${b} Z`,f:'var(--paper)',
      deco:sw=>[32,68].map(x=>`<ellipse cx="${x}" cy="${m+.5}" rx="8" ry="${h*.3}" style="fill:url(#dots);stroke:var(--ink)" stroke-width="${sw*.6}"/>`).join('')};
    // pieces laid across the top
    case 'discs':{const n=I.c||4,rx=84/n/2-.8;return{d:spread(n).map(x=>oval(x,m,rx,h/2)).join(' '),f:F}}
    case 'rings':{const n=I.c||4,rx=84/n/2-.8;return{d:spread(n).map(x=>oval(x,m,rx,h/2)).join(' '),f:'var(--paper)',
      deco:sw=>spread(n).map(x=>`<ellipse cx="${x}" cy="${m}" rx="${rx*.42}" ry="${h*.22}" style="fill:none;stroke:var(--ink)" stroke-width="${sw*.6}"/>`).join('')}}
    case 'balls':{const n=I.c||3,r=Math.min(h/2+.6,84/n/2-.6);return{d:spread(n).map(x=>oval(x,b-r,r,r)).join(' '),f:F,
      deco:I.shine?()=>spread(n).map(x=>inkDot(x-r*.35,b-r*1.35,r*.2)).join(''):null}}
    case 'caps':return{d:[24,50,76].map(x=>`M${x-11} ${y+h*.62} Q${x-11} ${y} ${x} ${y} Q${x+11} ${y} ${x+11} ${y+h*.62} Z M${x-3.5} ${y+h*.62} H${x+3.5} V${b} H${x-3.5} Z`).join(' '),f:'var(--paper)'};
    case 'leaves':return{d:[24,50,76].map(x=>`M${x-12} ${m} Q${x} ${y-2} ${x+12} ${m} Q${x} ${b+2} ${x-12} ${m} Z`).join(' '),f:'var(--paper)',
      deco:sw=>inkLine([24,50,76].map(x=>`M${x-9} ${m} H${x+8}`).join(' '),sw)};
    case 'shards':{let d=`M4 ${b}`;for(let i=0,x=4;x<95;i++,x+=11.5)d+=` L${x+4} ${y+(i%2)*1.5} L${x+8} ${y+h*.4} L${x+11.5} ${b}`;return{d:d+' Z',f:'var(--paper)'}}
    case 'chunks':return{d:spread(6).map((x,i)=>{const s=h-.5,t0=b-s-(i%2),l=x-s/2,r=x+s/2;return `M${l} ${t0+1.5} Q${l} ${t0} ${l+1.5} ${t0} H${r-1.5} Q${r} ${t0} ${r} ${t0+1.5} V${t0+s} H${l} Z`}).join(' '),f:'url(#hatch)'};
    case 'avo':return{d:[27,73].map(x=>pill(x-22,x+22,y,b)).join(' '),f:'var(--paper)',
      deco:sw=>[27,73].map(x=>`<path d="${pill(x-16,x+16,y+h*.28,b-h*.28)}" style="fill:none;stroke:var(--ink)" stroke-width="${sw*.6}"/>`).join('')};
    case 'cherry':{const r=h*.42;return{d:oval(50,b-r,r,r),f:'var(--paper)',deco:sw=>inkLine(`M50 ${b-2*r} Q52 ${y-3} 60 ${y-5}`,sw,.8)+inkDot(46,b-r*1.3,r*.22)}}
    case 'mallow':return{d:[27,73].map(x=>pill(x-21,x+21,y,b)).join(' '),f:'var(--paper)'};
    case 'drops':return{d:spread(6).map(x=>`M${x} ${y} Q${x+5} ${b} ${x} ${b} Q${x-5} ${b} ${x} ${y} Z`).join(' '),f:'var(--ink)'};
    case 'sprinkles':{const d=spread(9).map((x,i)=>{const a=i%3-1;return `M${x-3} ${m+a} L${x+3} ${m-a}`}).join(' ');
      return{d,f:'none',deco:sw=>inkLine(d,sw,1.3)}}
  }
}
function layerG(t,y,h,mode,sw){
  const s=shape(t,y,h);
  if(mode==='full')return `<path d="${s.d}" style="fill:${s.f};stroke:var(--ink)" stroke-width="${sw}" stroke-linejoin="round"/>${s.deco?s.deco(sw):''}`;
  if(mode==='next')return `<path d="${s.d}" style="fill:none;stroke:var(--ink)" stroke-width="${sw*.8}" stroke-dasharray="4 3" stroke-linejoin="round"/>`;
  return `<path d="${s.d}" style="fill:none;stroke:var(--faint)" stroke-width="${sw*.8}" stroke-dasharray="3 3" stroke-linejoin="round"/>`;
}
function artSVG(t){const h=ING[t].ch;return `<svg class="art" viewBox="0 -4 100 44" aria-hidden="true">${layerG(t,20-h/2,h,'full',3.4)}</svg>`}
function burgerSVG(recipe,p,tid,sw=2.2,cls=''){
  const hs=recipe.map(x=>ING[x].h),H=hs.reduce((a,b)=>a+b,0)+9;
  let y=H-4,g='';
  recipe.forEach((x,i)=>{
    const h=hs[i];y-=h;
    const mode=i<p?'full':i===p?'next':'ghost';
    const hide=tid!=null&&S.popping.has(tid+':'+i)?' style="opacity:0"':'';
    g+=`<g data-li="${i}"${hide}>${layerG(x,y,h,mode,sw)}</g>`;
  });
  return `<svg class="${cls}" viewBox="0 0 100 ${H}" preserveAspectRatio="xMidYMax meet" aria-hidden="true">${g}</svg>`;
}
// A small icon for each dish, like a suit on a playing card (20 × 20).
const DISH_ICON=[
  '<path d="M3 10 Q3 3 10 3 Q17 3 17 10 Z"/><path d="M2.5 12.5 H17.5" style="fill:none"/><path d="M3.5 15 H16.5 V17.5 H3.5 Z"/>',
  '<path d="M2.5 4.5 Q10 1 17.5 4.5 L10 18.5 Z"/><circle cx="8.6" cy="7.4" r="1.4" style="fill:var(--ink)"/><circle cx="11.6" cy="10.8" r="1.3" style="fill:var(--ink)"/>',
  '<path d="M2 9.5 H18 Q17 17.5 10 17.5 Q3 17.5 2 9.5 Z"/><path d="M6 9.5 Q6 5 9 6.5 Q12 8 12.5 4 M10 9.5 Q11 6.5 14 7" style="fill:none"/>',
  '<path d="M2.5 16.5 L17.5 16.5 L17.5 3.5 Z"/><path d="M6.5 14 L15 14 L15 7" style="fill:none"/>',
  '<path d="M1.5 16.5 L6.5 4.5 L11 16.5 Z"/><path d="M9 16.5 L13.5 3.5 L18.5 16.5 Z"/>',
  '<path d="M2.5 17 V10 L17.5 6 V17 Z"/><path d="M2.5 13 L17.5 10" style="fill:none"/><circle cx="14" cy="3.6" r="1.8" style="fill:var(--ink)"/>',
  '<circle cx="10" cy="10" r="7.2"/><circle cx="7.5" cy="8" r="1.1" style="fill:var(--ink)"/><circle cx="12.5" cy="9" r="1.1" style="fill:var(--ink)"/><circle cx="9.5" cy="13" r="1.1" style="fill:var(--ink)"/>',
];
const dishIcon=(d,cls='suit')=>`<svg class="${cls}" viewBox="0 0 20 20" aria-hidden="true"><g style="fill:var(--paper);stroke:var(--ink)" stroke-width="1.8" stroke-linejoin="round" stroke-linecap="round">${DISH_ICON[d]}</g></svg>`;
const FACE=`<svg class="face" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="10" style="fill:var(--paper);stroke:var(--ink)" stroke-width="2"/><circle cx="8.5" cy="10.5" r="1.4" style="fill:var(--ink)"/><circle cx="15.5" cy="10.5" r="1.4" style="fill:var(--ink)"/><path class="brow" d="M6.5 7 L10 8.3 M17.5 7 L14 8.3"/><path class="m happy" d="M7.5 14.5 Q12 18.8 16.5 14.5"/><path class="m meh" d="M8.5 16 H15.5"/><path class="m grr" d="M8 17.5 Q12 14 16 17.5"/></svg>`;

function cardHTML(c,style='',loc=null,noId=false){
  const id=noId?'':` data-id="${c.id}"`,l=loc?` data-loc="${loc}"`:'',I=ING[c.t];
  if(!c.up)return `<div class="card down"${id} style="${style}"><span class="bk">IB</span></div>`;
  return `<div class="card"${id}${l} style="${style}" aria-label="${I.n}, ${DISHES[I.d].name.toLowerCase()} ${I.r}"><span class="nm">${I.n}</span><span class="rk">${I.r}</span>${dishIcon(I.d)}${artSVG(c.t)}</div>`;
}
