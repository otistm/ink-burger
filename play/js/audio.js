/* Ink Burger: procedural sound effects. */
"use strict";
let AC=null;
function tone(f,d,type,v,when=0,slide){
  const t0=AC.currentTime+when,o=AC.createOscillator(),g=AC.createGain();
  o.type=type;o.frequency.setValueAtTime(f,t0);
  if(slide)o.frequency.exponentialRampToValueAtTime(slide,t0+d);
  g.gain.setValueAtTime(v,t0);g.gain.exponentialRampToValueAtTime(.0008,t0+d);
  o.connect(g).connect(AC.destination);o.start(t0);o.stop(t0+d+.03);
}
function snd(k){
  if(S.muted)return;
  try{
    AC=AC||new (window.AudioContext||window.webkitAudioContext)();
    if(AC.state==='suspended')AC.resume();
    if(k==='pick')tone(720,.05,'triangle',.05);
    else if(k==='place')tone(320,.09,'triangle',.09,0,210);
    else if(k==='draw')tone(950,.035,'triangle',.035);
    else if(k==='reset'){tone(500,.06,'triangle',.04);tone(380,.07,'triangle',.04,.06)}
    else if(k==='plate')tone(520,.09,'square',.03,0,820);
    else if(k==='pop')tone(1100,.04,'sine',.04);
    else if(k==='serve'){[660,880,1320].forEach((f,i)=>tone(f,.16,'triangle',.06,i*.07))}
    else if(k==='walk')tone(190,.4,'sawtooth',.045,0,80);
    else if(k==='bad')tone(150,.12,'square',.035);
    else if(k==='ding'){tone(1568,.35,'sine',.05);tone(1318,.4,'sine',.04,.08)}
  }catch(e){}
}
