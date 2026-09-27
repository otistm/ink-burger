// Writes icons/icon.svg from the game's own burger drawing. Run: node tools/icon-svg.js
const fs=require('fs'),path=require('path'),vm=require('vm');
const js=f=>fs.readFileSync(path.join(__dirname,'..','play','js',f),'utf8');
const ctx={};vm.createContext(ctx);
vm.runInContext(js('data.js')+js('draw.js')+';this.burgerSVG=burgerSVG;',ctx);
const pat=`<defs><pattern id="hatch" width="5" height="5" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><rect width="5" height="5" fill="#fff"/><line x1="0" y1="0" x2="0" y2="5" stroke="#000" stroke-width="2.6"/></pattern><pattern id="dots" width="6" height="6" patternUnits="userSpaceOnUse"><rect width="6" height="6" fill="#fff"/><circle cx="3" cy="3" r="1.15" fill="#000"/></pattern></defs>`;
let b=ctx.burgerSVG([0,1,2,4,8],99,null,3.2).replace(/var\(--ink\)/g,'#000').replace(/var\(--paper\)/g,'#fff');
const vb=b.match(/viewBox="0 0 100 (\d+)"/)[1]|0, inner=b.replace(/^<svg[^>]*>/,'').replace(/<\/svg>$/,'');
const s=130, dy=(s-vb)/2;
fs.writeFileSync(path.join(__dirname,'..','icons','icon.svg'),
`<svg xmlns="http://www.w3.org/2000/svg" viewBox="-15 -15 ${s} ${s}">${pat}<rect x="-15" y="-15" width="${s}" height="${s}" fill="#fff"/><g transform="translate(0 ${dy-15})">${inner}</g></svg>\n`);
console.log('Wrote icons/icon.svg');
