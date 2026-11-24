(() => {
  'use strict';
  // The canvas is a contrast-test stencil, not game code or source artwork.
  const pale = '#f7faf3';
  const ice = '#c5e5f1';
  const mono = 'monospace';
  const txt = (c, str, x, y, size, color = pale, weight = 500, align = 'left', font = mono) => {
    c.fillStyle = color; c.font = `${weight} ${size}px ${font}`; c.textAlign = align; c.textBaseline = 'middle'; c.fillText(str, x, y);
  };
  function poly(c, points, color) {
    c.beginPath();
    points.forEach(([x,y],i) => { if (i === 0) c.moveTo(x,y); else c.lineTo(x,y); });
    c.closePath(); c.fillStyle = color; c.fill();
  }
  function ellipse(c, x, y, rx, ry, color) {
    c.beginPath(); c.ellipse(x,y,rx,ry,0,0,Math.PI*2); c.fillStyle=color; c.fill();
  }
  function line(c, points, color, width = 1) {
    c.beginPath(); points.forEach(([x,y],i) => { if (i === 0) c.moveTo(x,y); else c.lineTo(x,y); });
    c.strokeStyle = color; c.lineWidth = width; c.stroke();
  }
  function ship(c, x, y, color = '#77bcd0', scale = 1) {
    c.save(); c.translate(x,y); c.scale(scale,scale);
    poly(c, [[0,-18],[6,-7],[21,11],[15,14],[6,10],[0,15],[-6,10],[-15,14],[-21,11],[-6,-7]], '#5d778d');
    poly(c, [[0,-18],[5,-6],[18,10],[11,9],[5,6],[0,12],[-5,6],[-11,9],[-18,10],[-5,-6]], '#dbe4db');
    poly(c, [[0,-14],[4,-3],[0,5],[-4,-3]], color);
    poly(c, [[-18,10],[-12,3],[-9,8],[-13,11]], '#e36c5b'); poly(c, [[18,10],[12,3],[9,8],[13,11]], '#e36c5b');
    c.restore();
  }
  const species = {
    'level-1': ['#5b743a','#a5c666','#dae590'],
    'level-2': ['#805941','#dfa36d','#ffd194'],
    'level-3': ['#843e62','#dc738f','#ffc19d'],
    hatch: ['#55416f','#aa7cce','#f5c4d8']
  };
  function enemy(c, x, y, type) {
    const [outer,main,high] = species[type]; c.save();c.translate(x,y);
    if(type==='level-1') {
      poly(c,[[-14,-3],[-10,-8],[-4,-11],[4,-11],[10,-8],[14,-3],[12,8],[7,9],[4,12],[-4,12],[-7,9],[-12,8]],outer);
      ellipse(c,0,-2,9,8,main);poly(c,[[-12,-2],[-9,-6],[-8,5],[-11,7]],main);poly(c,[[12,-2],[9,-6],[8,5],[11,7]],main);
    } else if(type==='level-2') {
      poly(c,[[-14,-5],[-10,-9],[-5,-9],[0,-12],[5,-9],[10,-9],[14,-5],[14,6],[10,10],[5,10],[3,12],[-3,12],[-5,10],[-10,10],[-14,6]],outer);
      poly(c,[[-12,-4],[-8,-7],[-5,-7],[-6,6],[-12,5]],main);poly(c,[[12,-4],[8,-7],[5,-7],[6,6],[12,5]],main);poly(c,[[0,-10],[5,-4],[4,6],[0,9],[-4,6],[-5,-4]],main);
    } else {
      poly(c,[[-13,-3],[-11,-9],[-6,-6],[0,-12],[6,-6],[11,-9],[13,-3],[13,4],[8,5],[7,10],[3,9],[0,12],[-3,9],[-7,10],[-8,5],[-13,4]],outer);
      poly(c,[[0,-10],[6,-3],[11,-7],[11,3],[6,4],[4,8],[-4,8],[-6,4],[-11,3],[-11,-7],[-6,-3]],main);
    }
    poly(c,[[-6,1],[-1,3],[-2,5],[-5,4]],high);poly(c,[[6,1],[1,3],[2,5],[5,4]],high);
    ellipse(c,0,8,2.4,1.6,'#ffd093'); c.restore();
  }
  function boss(c, x, y) {
    c.save();c.translate(x,y);
    for(const s of [-1,1]){
      c.save();c.scale(s,1);
      for(const [y0,y1,y2,y3] of [[-22,-38,-22,-43],[11,17,14,3],[22,39,51,34]]){
        c.beginPath();c.moveTo(40,y0);c.bezierCurveTo(68,y1,97,y2,94,y3);c.strokeStyle='#53395f';c.lineWidth=9;c.lineCap='round';c.stroke();
        c.strokeStyle='#785786';c.lineWidth=2;c.stroke();
      } c.restore();
    }
    poly(c,[[-73,-17],[-55,-34],[-32,-31],[-19,-45],[-10,-32],[0,-43],[10,-32],[19,-45],[32,-31],[55,-34],[73,-17],[60,22],[44,35],[27,31],[0,47],[-27,31],[-44,35],[-60,22]],'#5f486f');
    poly(c,[[0,-39],[17,-20],[12,-2],[21,24],[0,40],[-21,24],[-12,-2],[-17,-20]],'#806594');
    for(const ex of [-38,38]){ellipse(c,ex,-8,18,15,'#33243e');ellipse(c,ex,-8,14,11,'#f6bb67');ellipse(c,ex,-8,3,9,'#492740');ellipse(c,ex-4,-13,2,2,'#fff6c7');}
    c.restore();
  }
  function projectile(c, x, y, color) {
    c.fillStyle=color; c.fillRect(x-1,y-4,2,9);
    c.fillStyle=pale; c.fillRect(x,y-2,1,4);
  }
  function pickup(c,x,y,color,mark){
    poly(c,[[x,y-9],[x+9,y],[x,y+9],[x-9,y]],color);
    poly(c,[[x,y-6],[x+6,y],[x,y+6],[x-6,y]],'#182433');
    txt(c,mark,x,y,9,pale,750,'center');
  }
  function drawCombat(c,id,variant){
    const final=id==='level-3'&&variant==='boss';
    const index=Number(id.slice(-1));
    txt(c,'SCORE  01240',30,27,15);txt(c,final?'LEVEL 3 / BOSS':'LEVEL '+index,400,27,13,ice,650,'center');
    txt(c,'LIVES  × 3',770,27,15,pale,500,'right');
    line(c,[[30,45],[770,45]],'#7799a57a');
    if(final){
      boss(c,412,133);
      for(const [x,y] of [[575,142],[627,174],[577,208],[228,255]])enemy(c,x,y,'hatch');
    }else{
      for(let r=0;r<index+1;r++)for(let col=0;col<7;col++){
        if((r===0&&col===5)||(r===index&&col===0&&index>1))continue;
        enemy(c,191+col*66,95+r*47,id);
      }
      enemy(c,508,298,id);
    }
    ship(c,389,541);
    for(const [x,y,color] of [[390,369,'#aae9ff'],[390,433,'#aae9ff'],[270,298,'#f1c76f'],[552,393,'#ffb284'],[666,433,'#e8a8ff'],[145,459,'#b3e795'],[111,203,'#aae9ff'],[706,270,'#f1c76f'],[242,506,'#ffb284']])projectile(c,x,y,color);
    pickup(c,222,378,'#f9c264','P');pickup(c,586,490,'#93e0c6','S');
  }
  function drawMenu(c){
    txt(c,'SPACE SHOOTER',400,213,55,pale,800,'center','sans-serif');
    txt(c,'HAMK AI PROJECT',400,260,14,ice,650,'center');
    c.strokeStyle='#b6d9de';c.lineWidth=1;c.strokeRect(326,318,148,42);txt(c,'START',400,340,16,pale,700,'center');
    txt(c,'CREDITS',400,392,14,ice,500,'center');
    txt(c,'SAMPLE MENU',400,520,11,'#a7b9c5',500,'center');
  }
  function drawCredits(c){
    txt(c,'CREDITS',400,118,38,pale,750,'center','sans-serif');
    const groups=[['PROJECT','Space Shooter'],['DEVELOPMENT','Solo student project'],['COURSE','HAMK AI Project'],['TOOLS','AI-assisted concept development']];
    groups.forEach(([role,name],i)=>{const y=188+i*83;txt(c,role,400,y,12,ice,700,'center');txt(c,name,400,y+25,17,pale,500,'center','sans-serif');});
    txt(c,'SAMPLE CREDIT SCROLL',400,552,11,'#a7b9c5',500,'center');
  }
  function draw(canvas, scene, variant) {
    const c=canvas.getContext('2d');
    c.clearRect(0,0,canvas.width,canvas.height);
    if(scene==='menu')drawMenu(c);
    else if(scene==='credits')drawCredits(c);
    else drawCombat(c,scene,variant);
  }
  globalThis.ReadabilitySamples = Object.freeze({ draw });
})();
