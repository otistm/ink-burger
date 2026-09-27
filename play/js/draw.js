/* Ink Burger: drawing ingredients, burgers, faces and cards as ink SVG. */
"use strict";
function shape(t,y,h){
  const b=y+h,m=y+h/2;
  switch(t){
    case 0:return{d:`M8 ${y} H92 V${b-5} Q92 ${b} 86 ${b} H14 Q8 ${b} 8 ${b-5} Z`,f:'var(--paper)'};
    case 1:return{d:`M10 ${y} H90 Q96 ${y} 96 ${m} Q96 ${b} 90 ${b} H10 Q4 ${b} 4 ${m} Q4 ${y} 10 ${y} Z`,f:'url(#hatch)'};
    case 2:return{d:`M4 ${y} H96 V${b} H81 L77 ${b+4} L73 ${b} H40 L35 ${b+5} L30 ${b} H4 Z`,f:'url(#dots)'};
    case 3:return{d:`M6 ${y+2} Q20 ${y-2} 34 ${y+2} T62 ${y+2} T90 ${y+2} L94 ${y+2} L94 ${b-2} Q80 ${b+2} 66 ${b-2} T38 ${b-2} T10 ${b-2} L6 ${b-2} Z`,f:'url(#stripes)'};
    case 4:{let d=`M3 ${y+2} Q50 ${y-3} 97 ${y+2} L97 ${m}`;for(let x=97;x>3.1;x-=11.75)d+=` Q${(x-5.875).toFixed(2)} ${b+2} ${(x-11.75).toFixed(2)} ${m}`;
      return{d:d+' Z',f:'var(--paper)',deco:sw=>`<path d="M18 ${m} l7 -2 M42 ${m} l7 -2 M66 ${m} l7 -2" style="fill:none;stroke:var(--ink)" stroke-width="${sw*.6}" stroke-linecap="round"/>`}}
    case 5:return{d:`M12 ${y} H88 Q93 ${y} 93 ${m} Q93 ${b} 88 ${b} H12 Q7 ${b} 7 ${m} Q7 ${y} 12 ${y} Z`,f:'var(--paper)',
      deco:()=>[24,40,60,76].map(x=>`<ellipse cx="${x}" cy="${m}" rx="2.2" ry="${Math.max(1,h*.16)}" style="fill:var(--ink)"/>`).join('')};
    case 6:{const ry=h/2;return{d:`M10 ${m} a18 ${ry} 0 1 0 36 0 a18 ${ry} 0 1 0 -36 0 M54 ${m} a18 ${ry} 0 1 0 36 0 a18 ${ry} 0 1 0 -36 0`,f:'var(--paper)',
      deco:sw=>`<ellipse cx="28" cy="${m}" rx="10" ry="${ry*.45}" style="fill:none;stroke:var(--ink)" stroke-width="${sw*.6}"/><ellipse cx="72" cy="${m}" rx="10" ry="${ry*.45}" style="fill:none;stroke:var(--ink)" stroke-width="${sw*.6}"/>`}}
    case 7:{const r=h/2+1;return{d:[22,50,78].map(cx=>`M${cx-r} ${m} a${r} ${r} 0 1 0 ${2*r} 0 a${r} ${r} 0 1 0 ${-2*r} 0`).join(' '),f:'var(--paper)',
      deco:()=>[22,50,78].map(cx=>`<circle cx="${cx-r*.35}" cy="${m-r*.2}" r="${r*.18}" style="fill:var(--ink)"/><circle cx="${cx+r*.35}" cy="${m+r*.25}" r="${r*.18}" style="fill:var(--ink)"/>`).join('')}}
    case 8:return{d:`M6 ${b} H94 V${b-3} Q94 ${y} 50 ${y} Q6 ${y} 6 ${b-3} Z`,f:'var(--paper)',
      deco:()=>[[30,.5,-20],[45,.3,10],[60,.48,-10],[72,.66,20],[40,.68,15],[54,.62,-25]].map(([x,f,r])=>`<ellipse cx="${x}" cy="${y+h*f}" rx="2.4" ry="1.1" transform="rotate(${r} ${x} ${y+h*f})" style="fill:var(--ink)"/>`).join('')};
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
const FACE=`<svg class="face" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="10" style="fill:var(--paper);stroke:var(--ink)" stroke-width="2"/><circle cx="8.5" cy="10.5" r="1.4" style="fill:var(--ink)"/><circle cx="15.5" cy="10.5" r="1.4" style="fill:var(--ink)"/><path class="brow" d="M6.5 7 L10 8.3 M17.5 7 L14 8.3"/><path class="m happy" d="M7.5 14.5 Q12 18.8 16.5 14.5"/><path class="m meh" d="M8.5 16 H15.5"/><path class="m grr" d="M8 17.5 Q12 14 16 17.5"/></svg>`;

function cardHTML(c,style='',loc=null,noId=false){
  const id=noId?'':` data-id="${c.id}"`,l=loc?` data-loc="${loc}"`:'';
  if(!c.up)return `<div class="card down"${id} style="${style}"><span class="bk">IB</span></div>`;
  return `<div class="card"${id}${l} style="${style}" aria-label="${ING[c.t].n}"><span class="nm">${ING[c.t].n}</span><span class="rk">${c.t+1}</span>${artSVG(c.t)}</div>`;
}
