// helpers + identity
const $  = s => document.querySelector(s);
const $$ = s => document.querySelectorAll(s);
const esc = s => String(s).replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;

const beltMap = Object.fromEntries(CONFIG.belts.map(b=>[b.id,b]));
CONFIG.projects.forEach((p,i)=>{p._i=i; p._belt=beltMap[p.belt]||CONFIG.belts[0];});

$("#k-name").textContent    = CONFIG.name;
// mission = one focus area per line → a span each
$("#k-mission").innerHTML = (CONFIG.mission||"").split("\n")
  .map(s=>s.replace(/,\s*$/,"").trim()).filter(Boolean)
  .map(c=>`<span>${esc(c)}</span>`).join("");
$("#rail").innerHTML = CONFIG.links.map(l=>
  `<a href="${esc(l.url)}" target="_blank" rel="noopener">${esc(l.label)}</a>`).join("");

// --- starfield ---
// faint background stars; a few pulse brighter on a sine cycle
const starCv=$("#stars"), sctx=starCv.getContext("2d");
let stars=[];
function initStars(){
  const dpr=Math.min(devicePixelRatio,2);
  starCv.width=innerWidth*dpr; starCv.height=innerHeight*dpr; sctx.setTransform(dpr,0,0,dpr,0,0);
  const n=Math.round(innerWidth*innerHeight/6500);
  stars=[]; for(let i=0;i<n;i++)stars.push({
    x:Math.random()*innerWidth, y:Math.random()*innerHeight,
    b:0.10+Math.random()*0.30, ph:Math.random()*Math.PI*2,
    sp:0.25+Math.random()*1.1, big:Math.random()<0.09 });
}
initStars(); addEventListener("resize",initStars);
(function starLoop(){
  const t=performance.now()/1000;
  sctx.clearRect(0,0,innerWidth,innerHeight);
  for(const s of stars){
    const shine=reduce?0:Math.pow(Math.max(0,Math.sin(t*s.sp+s.ph)),8);
    const a=Math.min(1,s.b+shine*0.85), rad=(s.big?1.4:0.9)+shine*1.4;
    sctx.beginPath(); sctx.arc(s.x,s.y,rad,0,7);
    sctx.fillStyle=`rgba(245,225,180,${a})`;
    sctx.shadowBlur=shine>0.45?7:0; sctx.shadowColor="rgba(245,225,180,.9)";
    sctx.fill();
  }
  sctx.shadowBlur=0;
  requestAnimationFrame(starLoop);
})();

// --- 2D center views: solar map + galaxy ---
// mini panels always animate; the full-screen center follows the active view
let neoObjs=[], neoOrbits=[], nearEarthMarks=[];
// name · distance · Hubble type · render params (arm count, flatness, tint)
const GALAXIES=[
  {name:"MILKY WAY",         dist:"27,000 LY TO CORE", q:"Milky Way galaxy center",      type:"barred",     arms:4, flat:0.42, hue:[255,214,150]},
  {name:"ANDROMEDA · M31",   dist:"2.5 MILLION LY",    q:"Andromeda galaxy M31",         type:"spiral",     arms:2, flat:0.30, hue:[188,208,255]},
  {name:"WHIRLPOOL · M51",   dist:"31 MILLION LY",     q:"Whirlpool galaxy M51 Hubble",  type:"spiral",     arms:2, flat:0.82, hue:[160,220,255]},
  {name:"SOMBRERO · M104",   dist:"29 MILLION LY",     q:"Sombrero galaxy M104",         type:"edge",       arms:2, flat:0.12, hue:[255,226,176]},
  {name:"TRIANGULUM · M33",  dist:"2.7 MILLION LY",    q:"Triangulum galaxy M33",        type:"spiral",     arms:3, flat:0.60, hue:[182,232,212]},
  {name:"PINWHEEL · M101",   dist:"21 MILLION LY",     q:"Pinwheel galaxy M101 Hubble",  type:"spiral",     arms:5, flat:0.86, hue:[202,222,255]},
  {name:"BODE'S · M81",      dist:"12 MILLION LY",     q:"Bode's galaxy M81",            type:"spiral",     arms:2, flat:0.55, hue:[210,216,255]},
  {name:"CIGAR · M82",       dist:"12 MILLION LY",     q:"Cigar galaxy M82",             type:"irregular",  arms:0, flat:0.30, hue:[255,150,110]},
  {name:"BLACK EYE · M64",   dist:"17 MILLION LY",     q:"Black Eye galaxy M64",         type:"spiral",     arms:2, flat:0.50, hue:[255,206,150]},
  {name:"CENTAURUS A",       dist:"12 MILLION LY",     q:"Centaurus A galaxy",           type:"elliptical", arms:0, flat:0.72, hue:[255,192,140]},
  {name:"VIRGO A · M87",     dist:"53 MILLION LY",     q:"M87 galaxy",                   type:"elliptical", arms:0, flat:0.88, hue:[255,226,182]},
];
let galIdx=0;
const galaxyParticles=[]; for(let i=0;i<1300;i++)galaxyParticles.push({i,r:Math.pow(i/1300,0.62),off:(Math.random()-0.5)*0.55,tw:Math.random()*6.28,rr:Math.random()});
// drag-to-rotate state, shared by the full-screen map + galaxy views
let vpSpin=0, vpTilt=0;
// r is a compressed orbit radius (0-1), not real AU. moons/rings only draw full-screen.
const PLANETS=[
  {r:0.11,c:"#d8a06a",s:1.9, ph:0.4,n:"MERCURY",sz:1.7},
  {r:0.17,c:"#e6c9a0",s:1.5, ph:2.0,n:"VENUS",  sz:2.6},
  {r:0.23,c:"#5f9bff",s:1.25,ph:3.6,n:"EARTH",  sz:2.6, moons:[{mr:0.038,s:5.5,c:"#cfd3dc",sz:1.0,nm:"MOON"}]},
  {r:0.30,c:"#ff7a4d",s:1.0, ph:1.1,n:"MARS",   sz:2.1},
  {r:0.46,c:"#e6c088",s:0.55,ph:5.0,n:"JUPITER",sz:5.2, moons:[
     {mr:0.052,s:5.2,c:"#e8d29a",sz:0.9,nm:"IO"},      {mr:0.068,s:3.7,c:"#dbe6ff",sz:0.9,nm:"EUROPA"},
     {mr:0.088,s:2.6,c:"#c9b48f",sz:1.2,nm:"GANYMEDE"},{mr:0.110,s:1.9,c:"#9f8f7a",sz:1.1,nm:"CALLISTO"}]},
  {r:0.61,c:"#e8d59a",s:0.36,ph:2.3,n:"SATURN", sz:4.6, rings:true},
  {r:0.75,c:"#a8ece4",s:0.24,ph:4.1,n:"URANUS", sz:3.5},
  {r:0.86,c:"#5f8fff",s:0.18,ph:0.7,n:"NEPTUNE",sz:3.5},
  {r:0.95,c:"#c9b8a8",s:0.13,ph:3.2,n:"PLUTO",  sz:1.5}];
// We don't have real orbital elements per NEO, so derive plausible ones (a, e, inc,
// node, periapsis) by hashing the designation — stable across reloads, and enough to
// draw a tilted ellipse + a debris cloud around it. hashStr gives a 0-1 float per key.
const hashStr=s=>{let h=2166136261;for(const c of String(s)){h^=c.charCodeAt(0);h=Math.imul(h,16777619);}return (h>>>0)/4294967295;};
function rebuildNeoScatter(){
  neoOrbits=neoObjs.slice(0,30).map(o=>{
    const r1=hashStr(o.des+"a"),r2=hashStr(o.des+"e"),r3=hashStr(o.des+"i"),
          r4=hashStr(o.des+"O"),r5=hashStr(o.des+"w");
    const a=0.9+r1*2.6, e=0.15+r2*0.55, inc=(r3-0.5)*1.1, Om=r4*6.2832, w=r5*6.2832;
    const cO=Math.cos(Om),sO=Math.sin(Om),cI=Math.cos(inc),sI=Math.sin(inc),cW=Math.cos(w),sW=Math.sin(w);
    const at=v=>{                                             // true anomaly → point on the mapped ellipse
      const rAU=a*(1-e*e)/(1+e*Math.cos(v));
      const xa=rAU*(Math.cos(v)*cW-Math.sin(v)*sW), za=rAU*(Math.cos(v)*sW+Math.sin(v)*cW);
      const y=za*sI, z2=za*cI;
      const X=xa*cO+z2*sO, Z=-xa*sO+z2*cO;
      const len=Math.hypot(X,y,Z)||1e-6, f=mapAU(len)/len;
      return {X:X*f, Y:y*f, Z:Z*f};
    };
    const pts=[]; for(let k=0;k<=64;k++)pts.push(at(k/64*6.2832));
    // scatter dust over the whole orbit with wide jitter (haz orbits get more)
    const dust=[], nDust=o.haz?240:130;
    for(let k=0;k<nDust;k++){
      const v=hashStr(o.des+"d"+k)*6.2832;
      const p=at(v), j=0.09+0.15*hashStr(o.des+"js"+k);
      dust.push({X:p.X+(hashStr(o.des+"x"+k)-0.5)*j, Y:p.Y+(hashStr(o.des+"y"+k)-0.5)*j*0.45,
        Z:p.Z+(hashStr(o.des+"z"+k)-0.5)*j, tw:hashStr(o.des+"t"+k)*6.2832,
        sz:hashStr(o.des+"sz"+k)<0.12?3:2, a:0.3+0.7*hashStr(o.des+"al"+k)});
    }
    return {haz:!!o.haz, pts, dust};
  });
  // the 7 nearest passes, jittered into a little cluster near Earth
  nearEarthMarks=neoObjs.slice().sort((a,b)=>a.ld-b.ld).slice(0,7).map(o=>({
    dx:(hashStr(o.des+"ex")-0.5)*0.10, dz:(hashStr(o.des+"ez")-0.5)*0.10,
    dy:(hashStr(o.des+"ey")-0.5)*0.03, haz:!!o.haz}));
}
// Heliocentric map. CMEs and flares are real DONKI events, placed physically: a CME
// plume points along its heliographic lon/lat, spreads over its half-angle, and its
// front sits at speed × time-since-launch (mapped through mapAU). ORB/CME/FLR/SOL
// toggle the layers.
const MAP_LAYERS={orb:true,cme:true,flr:true,sol:true};
let vpZoom=1;
// real AU → compressed map radius. Fitted to the planet radii above (Earth 1→0.23,
// Jupiter 5.2→0.46) so CME fronts land between the right planets.
const mapAU=au=>0.23*Math.pow(Math.max(au,0.001),0.42);
const AU_KM_=1.496e8;
let cmePlumes=[], solFlares=[], solarStatus="⊙ DONKI · SYNCING…";
// used when DONKI is unreachable so the map isn't empty (realistic sample values)
const CME_FALLBACK=[
  {lon:22, halfAngle:29, speed:488, start:Date.now()-30*36e5, halo:false},
  {lon:156,halfAngle:24, speed:620, start:Date.now()-20*36e5, halo:false},
  {lon:-95,halfAngle:38, speed:450, start:Date.now()-52*36e5, halo:false}];
const FLR_FALLBACK=[{lon:-70,cls:"C5.9",t:Date.now()-2*36e5}];
function buildCmePlumes(evs){
  // cap at 12 events, evenly sampled across the window (drawing all of them is too busy)
  let list=(evs&&evs.length?evs:CME_FALLBACK);
  if(list.length>12){ const step=list.length/12; list=Array.from({length:12},(_,i)=>list[Math.floor(i*step)]); }
  cmePlumes=list.map(ev=>{
    const parts=[]; const N=ev.halo?680:520;
    for(let i=0;i<N;i++){ const g=(Math.random()+Math.random()+Math.random())/1.5-1;
      parts.push({
      off:g*Math.abs(g),                                       // bias toward the cone axis
      up:((Math.random()+Math.random()+Math.random())/1.5-1)*0.8,
      f:Math.pow(Math.random(),0.62),                          // bias toward the sun
      j:(Math.random()-0.5)*0.03,
      sz:Math.random()<0.1?1.8:1.2, br:0.5+Math.random()*0.5 }); }
    return {...ev, parts};
  });
}
buildCmePlumes();   // seed with fallback; loadDONKI() rebuilds with real data
function drawOrbital(x,w,h,t,big){
  const cx=w*0.5, cy=h*0.52, zm=big?vpZoom:1, R=Math.min(w,h)*(big?0.46:0.52)*zm;
  const tilt=Math.max(0.12,Math.min(0.92, 0.40 + (big?vpTilt:0))), spin=(big?vpSpin:0);
  // spin = yaw about the pole, tilt = pitch. vf foreshortens out-of-plane (Y) motion
  // as the view goes face-on, so orbits flatten correctly.
  const vf=Math.sqrt(Math.max(0.1,1-tilt*tilt)), cS=Math.cos(spin), sS=Math.sin(spin);
  const prj=(X,Y,Z)=>{ const x2=X*cS+Z*sS, z2=-X*sS+Z*cS;
    return {x:cx+x2*R, y:cy+z2*R*tilt-Y*R*vf}; };
  x.lineWidth=1;
  // ORB: NEO ellipses (red = hazardous, else gold) + planet orbits (Earth in blue)
  if(MAP_LAYERS.orb){
    neoOrbits.forEach((o,oi)=>{ if(!big&&oi%2)return;
      x.strokeStyle=o.haz?"rgba(255,64,47,.30)":"rgba(212,164,70,.20)";
      x.beginPath(); o.pts.forEach((p,i)=>{const s=prj(p.X,p.Y,p.Z); i?x.lineTo(s.x,s.y):x.moveTo(s.x,s.y);}); x.stroke(); });
    PLANETS.forEach(p=>{ const earth=p.n==="EARTH";
      x.strokeStyle=earth?"rgba(95,155,255,.55)":"rgba(122,90,20,.30)"; x.lineWidth=earth?1.3:1;
      x.beginPath(); for(let k=0;k<=64;k++){ const a=k/64*6.2832, s=prj(Math.cos(a)*p.r,0,Math.sin(a)*p.r);
        k?x.lineTo(s.x,s.y):x.moveTo(s.x,s.y);} x.stroke(); });
    x.lineWidth=1;
    // dust clouds. skip every other orbit + 2/3 of points in the small mini view
    neoOrbits.forEach((o,oi)=>{ if(!big&&oi%2)return;
      o.dust.forEach((d,k)=>{ if(!big&&k%3)return;
        const s=prj(d.X,d.Y,d.Z), tw=0.6+0.4*Math.sin(t*1.4+d.tw);
        x.fillStyle=o.haz?`rgba(255,64,47,${0.7*d.a*tw})`:`rgba(226,178,80,${0.55*d.a*tw})`;
        const z=big?d.sz:1.4; x.fillRect(s.x,s.y,z,z); }); });
  }
  // CME: cone aimed along each event's lon/lat, front advanced by speed × elapsed time
  if(MAP_LAYERS.cme){ const now=Date.now();
    cmePlumes.forEach(p=>{
      const travAU=Math.min(46, p.speed*((now-p.start)/1000)/AU_KM_);
      if(travAU<0.02)return;
      const lonR=(p.lon||0)*Math.PI/180, latR=(p.lat||0)*Math.PI/180,
            haR=Math.max(0.10,(p.halfAngle||30)*Math.PI/180);
      p.parts.forEach((q,i)=>{ if(!big&&i%4)return;
        const au=q.f*travAU, rm=mapAU(au); if(rm>1.15)return;
        const az=(p.halo? q.off*Math.PI : lonR+q.off*haR)+q.j;
        const el=latR+q.up*haR*0.6;
        const s=prj(rm*Math.cos(el)*Math.cos(az), rm*Math.sin(el), rm*Math.cos(el)*Math.sin(az));
        // color by distance from the sun: white-hot core → amber → ochre at the front
        const core=au<0.16, ax=1-Math.abs(q.off)*0.55;
        const al=(core?0.95:q.br*ax*(1-rm*0.62))*(big?1:0.8), sz=q.sz*(big?1:0.8);
        x.fillStyle=core?`rgba(255,248,224,${al})`:(rm<0.42?`rgba(246,200,110,${al})`:`rgba(212,164,86,${al})`);
        x.fillRect(s.x,s.y,sz,sz); });
    }); }
  // SOL: sun glow. Cap the radius so zooming in doesn't wash out the inner planets.
  if(MAP_LAYERS.sol){ const sr=Math.min(R*0.30, Math.min(w,h)*0.16);
    const g=x.createRadialGradient(cx,cy,0,cx,cy,sr);
    g.addColorStop(0,"rgba(255,250,230,.95)"); g.addColorStop(.18,"rgba(255,222,150,.55)");
    g.addColorStop(.5,"rgba(255,160,70,.16)"); g.addColorStop(1,"rgba(255,120,50,0)");
    x.fillStyle=g; x.beginPath(); x.arc(cx,cy,sr,0,7); x.fill(); }
  x.fillStyle="#fff6de"; x.shadowColor="#ffd27a"; x.shadowBlur=big?30:12;
  x.beginPath(); x.arc(cx,cy,(big?9:4)*Math.min(Math.max(zm,0.8),1.8),0,7); x.fill(); x.shadowBlur=0;
  if(big&&MAP_LAYERS.sol){ x.fillStyle="rgba(71,255,169,.8)"; x.font="10px 'Share Tech Mono',monospace"; x.fillText("SOL",cx+12,cy+3); }
  // FLR: cross-spark at each flare's source longitude on the limb, sized by GOES class
  // (X > M > C). Must draw after SOL or the glow hides it.
  if(MAP_LAYERS.flr&&big){ (solFlares.length?solFlares:FLR_FALLBACK).slice(-6).forEach((f,k)=>{
    const a=(f.lon||0)*Math.PI/180, tw=0.5+0.5*Math.sin(t*4+k*2.1);
    const cls=(f.cls||"C")[0], m=cls==="X"?1.9:cls==="M"?1.4:1;
    const s=prj(Math.cos(a)*0.065,0,Math.sin(a)*0.065), r0=(2.0+2.6*tw)*m;
    x.strokeStyle=`rgba(255,240,200,${0.35+0.5*tw})`; x.lineWidth=1;
    x.beginPath(); x.moveTo(s.x-r0*2.2,s.y); x.lineTo(s.x+r0*2.2,s.y);
    x.moveTo(s.x,s.y-r0*1.4); x.lineTo(s.x,s.y+r0*1.4); x.stroke();
    x.fillStyle=`rgba(255,250,235,${0.5+0.5*tw})`;
    x.beginPath(); x.arc(s.x,s.y,r0*0.55,0,7); x.fill(); }); }
  // planets: cyan discs (Earth blue), with moons/rings/labels in the full-screen view
  PLANETS.forEach(p=>{ const a=t*p.s+p.ph, s=prj(Math.cos(a)*p.r,0,Math.sin(a)*p.r);
    const px=s.x, py=s.y, psz=(p.sz||2.4)*(big?1.6:0.7)*Math.min(zm,1.6);
    const col=p.n==="EARTH"?"#5f9bff":"#bfe9f2";
    if(big&&p.rings){ x.save(); x.translate(px,py); x.rotate(-0.5);
      x.strokeStyle="rgba(191,233,242,.5)"; x.lineWidth=1.1;
      for(const rr of [1.6,2.0]){ x.beginPath(); x.ellipse(0,0,psz*rr,psz*rr*0.33,0,0,7); x.stroke(); } x.restore(); }
    x.fillStyle=col; x.shadowColor=col; x.shadowBlur=big?14:6;
    x.beginPath(); x.arc(px,py,psz,0,7); x.fill(); x.shadowBlur=0;
    if(big&&p.moons)p.moons.forEach((m,mi)=>{ const ma=t*m.s+mi*1.7+spin, mrr=R*m.mr;
      const mx=px+Math.cos(ma)*mrr, my=py+Math.sin(ma)*mrr*tilt;
      x.fillStyle="rgba(207,211,220,.9)"; x.beginPath(); x.arc(mx,my,m.sz||1,0,7); x.fill();
      if(m.nm==="MOON"){ x.fillStyle="rgba(180,195,220,.6)"; x.font="8px 'Share Tech Mono',monospace"; x.fillText(m.nm,mx+3,my-2); } });
    if(big){x.fillStyle="rgba(88,214,200,.95)"; x.font="11px 'Share Tech Mono',monospace"; x.fillText(p.n,px+psz+5,py+3);}});
  // nearest-pass markers, positioned relative to Earth's current spot
  if(big){ const pe=PLANETS[2], aE=t*pe.s+pe.ph;
    const eX=Math.cos(aE)*pe.r, eZ=Math.sin(aE)*pe.r;
    nearEarthMarks.forEach(m=>{ const s=prj(eX+m.dx,m.dy,eZ+m.dz);
      x.fillStyle=m.haz?"#ff5a3c":"#f0b32a";
      x.save(); x.translate(s.x,s.y); x.rotate(0.785); x.fillRect(-2.6,-2.6,5.2,5.2); x.restore(); }); }
  // a few labelled spacecraft as green diamonds (decorative, not real positions)
  if(big){ [["JUNO",0.47],["PSP",0.13],["VGR-1",1.02]].forEach(([nm,rf],k)=>{
    const a=t*0.22+k*2.3, s=prj(Math.cos(a)*rf,0,Math.sin(a)*rf);
    x.fillStyle="#54ff8a"; x.save(); x.translate(s.x,s.y); x.rotate(0.785); x.fillRect(-3.2,-3.2,6.4,6.4); x.restore();
    x.font="10px 'Share Tech Mono',monospace"; x.fillStyle="rgba(84,255,138,.9)"; x.fillText("◆ "+nm,s.x+8,s.y+3); }); }
}
// Earth-centered view (opened from the object feed). Each NeoWs object is a line
// passing Earth at its miss distance, with a diamond at closest approach.
function drawGeo(x,w,h,t){
  const cx=w*0.5, cy=h*0.52, R=Math.min(w,h)*0.46*vpZoom;
  const tilt=Math.max(0.14,Math.min(0.9, 0.38+vpTilt)), spin=vpSpin;
  // lunar-orbit + geostationary rings
  x.lineWidth=1;
  x.strokeStyle="rgba(150,162,188,.22)"; x.beginPath(); x.ellipse(cx,cy,R*0.16,R*0.16*tilt,0,0,7); x.stroke();
  x.strokeStyle="rgba(122,90,20,.25)"; x.beginPath(); x.ellipse(cx,cy,R*0.05,R*0.05*tilt,0,0,7); x.stroke();
  const list=neoObjs.slice(0,42);
  list.forEach((o,i)=>{
    const az=i*2.399+spin, incl=Math.sin(i*1.71)*0.55;
    const dx=Math.cos(az)*Math.cos(incl), dy=Math.sin(incl), dz=Math.sin(az)*Math.cos(incl);
    // push the line off Earth by the miss distance (clamped at 40 LD)
    const oaz=az+1.5708, om=R*(0.07+Math.min(o.ld||10,40)/40*0.85);
    const ox=Math.cos(oaz)*om, oy=Math.sin(i*2.9)*om*0.25, oz=Math.sin(oaz)*om;
    const L=R*1.5, P=[-L,L].map(s=>({X:ox+dx*s, Y:oy+dy*s, Z:oz+dz*s}));
    const prj=p=>({sx:cx+p.X, sy:cy+(p.Y*0.9+p.Z*tilt)});
    const A=prj(P[0]), B=prj(P[1]);
    x.strokeStyle=o.haz?"rgba(255,64,47,.55)":"rgba(240,179,42,.30)"; x.lineWidth=o.haz?1.2:1;
    x.beginPath(); x.moveTo(A.sx,A.sy); x.lineTo(B.sx,B.sy); x.stroke();
    const C=prj({X:ox,Y:oy,Z:oz});   // closest-approach point
    x.fillStyle=o.haz?"#ff402f":"#f0b32a";
    x.save(); x.translate(C.sx,C.sy); x.rotate(0.785);
    const dsz=o.haz?4.4:3.2; x.fillRect(-dsz,-dsz,dsz*2,dsz*2); x.restore();
    if(o.haz||i<2){ x.font="10px 'Share Tech Mono',monospace";
      x.fillStyle=o.haz?"rgba(255,90,70,.9)":"rgba(240,179,42,.75)"; x.fillText(o.des,C.sx+9,C.sy+3); }
  });
  // Earth + Moon last, so they sit on top of the trajectory lines
  const ma=t*0.5+spin, mx=cx+Math.cos(ma)*R*0.16, my=cy+Math.sin(ma)*R*0.16*tilt;
  x.fillStyle="#cfd3dc"; x.beginPath(); x.arc(mx,my,2.2,0,7); x.fill();
  x.fillStyle="rgba(190,200,220,.75)"; x.font="9px 'Share Tech Mono',monospace"; x.fillText("MOON",mx+5,my+3);
  x.fillStyle="#5f9bff"; x.shadowColor="#5f9bff"; x.shadowBlur=16; x.beginPath(); x.arc(cx,cy,5,0,7); x.fill(); x.shadowBlur=0;
  x.fillStyle="rgba(88,214,200,.95)"; x.font="11px 'Share Tech Mono',monospace"; x.fillText("EARTH",cx+9,cy+3);
}
function drawGalaxy(x,w,h,t,big){
  const cx=w/2, cy=h/2, R=Math.min(w,h)*(big?0.4:0.46);
  const gal=GALAXIES[galIdx]||GALAXIES[0], hue=gal.hue||[255,205,130], arms=gal.arms||2;
  // drag: horizontal spins the disk, vertical tilts it face-on ↔ edge-on
  const spin=t*0.06 + (big?vpSpin:0);
  const flat=Math.max(0.07,Math.min(1, gal.flat + (big?vpTilt:0)));
  // central bulge glow
  const g0=x.createRadialGradient(cx,cy,0,cx,cy,R*1.3);
  g0.addColorStop(0,`rgba(${hue[0]},${hue[1]},${hue[2]},.38)`); g0.addColorStop(.16,"rgba(255,165,75,.15)");
  g0.addColorStop(.5,"rgba(120,80,30,.05)"); g0.addColorStop(1,"rgba(0,0,0,0)");
  x.fillStyle=g0; x.beginPath(); x.arc(cx,cy,R*1.3,0,7); x.fill();
  galaxyParticles.forEach(g=>{
    let px,py,b;
    if(gal.type==="elliptical"){                                   // no arms, just a blob
      const a=g.i*2.399+spin, rr=Math.pow(g.rr,0.5);
      px=cx+Math.cos(a)*R*rr; py=cy+Math.sin(a)*R*rr*flat; b=1-rr*0.82;
    } else if(gal.type==="irregular"){                             // clumpy, off-axis (M82)
      const a=g.i*2.399+spin, jr=R*(0.15+g.rr*0.8);
      px=cx+Math.cos(a)*jr*(0.55+g.off); py=cy+Math.sin(a)*jr*flat*(0.7+g.off*0.4)+g.off*R*0.12; b=1-g.rr*0.6;
    } else {                                                        // spiral / barred / edge-on
      const arm=g.i%arms, wind=(gal.type==="edge"?0.5:4);
      const a=arm*(Math.PI*2/arms)+g.r*wind+spin+g.off, r=R*g.r;
      px=cx+Math.cos(a)*r; py=cy+Math.sin(a)*r*flat; b=1-g.r*0.7;
    }
    const tw=big?(0.6+0.4*Math.sin(t*2.2+g.tw)):1;
    x.fillStyle=`rgba(${(hue[0]*b*0.92+28)|0},${(hue[1]*b*0.86+38)|0},${(hue[2]*b*0.7+28)|0},${(0.7*b+0.18)*tw})`;
    const s=big?Math.max(0.9,3-g.r*1.6):1.2; x.beginPath(); x.arc(px,py,s,0,7); x.fill(); });
  // dark dust lane across edge-on galaxies (Sombrero)
  if(gal.type==="edge"){ x.strokeStyle="rgba(0,0,0,.6)"; x.lineWidth=big?5:2.2; x.beginPath(); x.moveTo(cx-R*0.98,cy); x.lineTo(cx+R*0.98,cy); x.stroke(); }
  // nucleus
  x.fillStyle="#fff4d6"; x.shadowColor="#ffd27a"; x.shadowBlur=big?52:16; x.beginPath(); x.arc(cx,cy,big?10:3.2,0,7); x.fill(); x.shadowBlur=0;
}
const vizzes=[];
$$(".pviz").forEach(cv=>vizzes.push({cv,kind:cv.dataset.viz,x:cv.getContext("2d"),w:0,h:0}));
function fitViz(o){ const r=o.cv.getBoundingClientRect(), dpr=Math.min(devicePixelRatio,2);
  const w=Math.max(1,Math.round(r.width)), h=Math.max(1,Math.round(r.height));
  if(o.cv.width!==w*dpr||o.cv.height!==h*dpr){o.cv.width=w*dpr;o.cv.height=h*dpr;o.x.setTransform(dpr,0,0,dpr,0,0);} o.w=w;o.h=h; }
const vpCv=$("#viewport"), vpx=vpCv.getContext("2d");
function fitViewport(){ const dpr=Math.min(devicePixelRatio,2);
  if(vpCv.width!==innerWidth*dpr||vpCv.height!==innerHeight*dpr){vpCv.width=innerWidth*dpr;vpCv.height=innerHeight*dpr;} vpx.setTransform(dpr,0,0,dpr,0,0); return vpx; }

let viewMode="craft";
const VIEW_LABEL={craft:"SATELLITE MODEL",orbital:"HELIOCENTRIC SOLAR MAP",geo:"GEOCENTRIC EARTH MAP",galaxy:"DEEP-FIELD GALAXY"};
function setView(mode){
  viewMode=mode;
  $$("#sidecol .viewsw").forEach(el=>el.classList.toggle("on",el.dataset.view===mode));
  const vp=$("#viewport"), sc=$("#scene");
  const gl3d = mode==="galaxy" && !!renderer;                       // WebGL galaxy, else 2D fallback
  sc.classList.toggle("hide", !(mode==="craft" || gl3d));           // #scene = craft or 3D galaxy
  vp.classList.toggle("show", mode==="orbital" || mode==="geo" || (mode==="galaxy" && !renderer));
  if(renderer){
    craftHolder.visible = (mode==="craft");
    galaxyHolder.visible = gl3d;
    if(gl3d){ buildGalaxy3D(galIdx); targZ=8.2; targX=-0.42; spin=!reduce; }
    else if(mode==="craft"){ targZ=6.6; targX=-0.42; }
  }
  // fleet roster in craft view, galaxy roster in galaxy view
  const side=$("#sidecol"), wasFleet=side.classList.contains("show-fleet"), wasGx=side.classList.contains("show-galaxies");
  side.classList.toggle("show-fleet",mode==="craft");
  side.classList.toggle("show-galaxies",mode==="galaxy");
  // collapse the mini previews that aren't active, to free up scroll room
  const om=$("#orbital-mini"), gm=$("#galaxy-mini");
  if(om)om.classList.toggle("collapsed",mode!=="orbital");
  if(gm)gm.classList.toggle("collapsed",mode!=="galaxy");
  const fp=$("#feedpanel"); if(fp)fp.classList.toggle("collapsed",mode!=="geo");
  if(mode==="craft" && !wasFleet && typeof renderFleet==="function") renderFleet();
  if(mode==="galaxy" && !wasGx && typeof renderGalaxies==="function") renderGalaxies();
  const vl=$("#view-label"); if(vl)vl.textContent=VIEW_LABEL[mode]||"";
  // map overlay (title chip, layer toggles, nearest-approach box) — only on the maps
  const mu=$("#map-ui"); if(mu){ mu.hidden=!(mode==="orbital"||mode==="geo");
    const chip=$("#map-chip"); if(chip)chip.textContent=VIEW_LABEL[mode]||"";
    const tg=$("#map-toggles"); if(tg)tg.style.display=(mode==="orbital")?"flex":"none";
    const ms=$("#map-status"); if(ms)ms.style.display=(mode==="orbital")?"block":"none";  // space weather is heliocentric-only
    if(mode==="orbital"||mode==="geo")vpZoom=1; }
}
$$("#sidecol .viewsw").forEach(el=>{
  const go=()=>setView(el.dataset.view);
  el.addEventListener("click",go);
  el.addEventListener("keydown",e=>{if(e.key==="Enter"||e.key===" "){e.preventDefault();go();}});
});
// clicking a panel label: switches view on a view-switcher, folds the body on a roster
$$("#sidecol .panel>.plabel").forEach(lbl=>{
  lbl.addEventListener("click",e=>{ e.stopPropagation();
    const p=lbl.parentElement;
    if(p.classList.contains("viewsw")){ setView(p.dataset.view); return; }
    p.classList.toggle("collapsed");
    // canvases have zero size while collapsed, so redraw after they're visible
    if(p.id==="fleet" && !p.classList.contains("collapsed")) requestAnimationFrame(()=>requestAnimationFrame(redrawFleetIcons));
    if(p.id==="galaxies" && !p.classList.contains("collapsed")) requestAnimationFrame(()=>requestAnimationFrame(redrawGalaxyIcons));
  });
});
(function hud2d(){
  const t=performance.now()/1000;
  vizzes.forEach(o=>{fitViz(o);const{x,w,h}=o;x.clearRect(0,0,w,h);
    if(o.kind==="orbital")drawOrbital(x,w,h,t,false); else drawGalaxy(x,w,h,t,false);});
  if(viewMode!=="craft"){const x=fitViewport(); x.clearRect(0,0,innerWidth,innerHeight);
    if(viewMode==="orbital")drawOrbital(x,innerWidth,innerHeight,t,true);
    else if(viewMode==="geo")drawGeo(x,innerWidth,innerHeight,t);
    else drawGalaxy(x,innerWidth,innerHeight,t,true);}
  requestAnimationFrame(hud2d);
})();

// drag to rotate + wheel to zoom the full-screen map / galaxy
let vpDrag=false, vpLX=0, vpLY=0;
vpCv.style.touchAction="none";
vpCv.addEventListener("pointerdown",e=>{ if(viewMode==="craft")return; vpDrag=true; vpLX=e.clientX; vpLY=e.clientY; vpCv.style.cursor="grabbing"; });
addEventListener("pointerup",()=>{ vpDrag=false; vpCv.style.cursor=""; });
addEventListener("pointermove",e=>{ if(!vpDrag)return;
  vpSpin+=(e.clientX-vpLX)*0.006; vpTilt=Math.max(-0.34,Math.min(0.5, vpTilt+(e.clientY-vpLY)*0.004));
  vpLX=e.clientX; vpLY=e.clientY; });
addEventListener("wheel",e=>{ if(viewMode!=="orbital"&&viewMode!=="geo")return;
  vpZoom=Math.max(0.5,Math.min(3.6, vpZoom*Math.exp(-e.deltaY*0.0012))); },{passive:true});
// ORB / CME / FLR / SOL layer toggles
$$("#map-toggles .mtg").forEach(b=>b.addEventListener("click",()=>{
  const k=b.dataset.tg; MAP_LAYERS[k]=!MAP_LAYERS[k]; b.classList.toggle("on",MAP_LAYERS[k]); }));

// galaxy auto-cycle (same idea as the fleet)
function updateGalaxyLabel(){ const g=GALAXIES[galIdx]; const n=$("#gx-name"), d=$("#gx-dist");
  if(n)n.textContent=g.name; if(d)d.textContent=g.dist; markActiveGalaxy();
  if(viewMode==="galaxy" && renderer && typeof buildGalaxy3D==="function") buildGalaxy3D(galIdx); }  // rebuild the 3D points
let galTimer=null;
function restartGalaxyCycle(){ if(reduce)return; clearInterval(galTimer);
  galTimer=setInterval(()=>{ galIdx=(galIdx+1)%GALAXIES.length; updateGalaxyLabel(); }, 12000); }

// galaxy roster thumbnails (a simpler, static version of drawGalaxy)
function drawMiniGalaxy(x,w,h,gal){
  const cx=w/2,cy=h/2,R=Math.min(w,h)*0.42,hue=gal.hue||[255,205,130],arms=gal.arms||2,flat=gal.flat;
  const g0=x.createRadialGradient(cx,cy,0,cx,cy,R*1.4);
  g0.addColorStop(0,`rgba(${hue[0]},${hue[1]},${hue[2]},.5)`); g0.addColorStop(1,"rgba(0,0,0,0)");
  x.fillStyle=g0; x.fillRect(0,0,w,h);
  for(let i=0;i<260;i++){ const rr=Math.pow(i/260,0.6); let px,py;
    if(gal.type==="elliptical"){const a=i*2.399;px=cx+Math.cos(a)*R*rr;py=cy+Math.sin(a)*R*rr*flat;}
    else{const arm=i%arms,a=arm*(6.283/arms)+rr*(gal.type==="edge"?0.5:4);px=cx+Math.cos(a)*R*rr;py=cy+Math.sin(a)*R*rr*flat;}
    const b=1-rr*0.7; x.fillStyle=`rgba(${(hue[0]*b)|0},${(hue[1]*b)|0},${(hue[2]*b)|0},${0.6*b+0.2})`;
    x.beginPath();x.arc(px,py,1,0,7);x.fill(); }
  if(gal.type==="edge"){x.strokeStyle="rgba(0,0,0,.6)";x.lineWidth=2;x.beginPath();x.moveTo(cx-R,cy);x.lineTo(cx+R,cy);x.stroke();}
  x.fillStyle="#fff4d6";x.beginPath();x.arc(cx,cy,2.2,0,7);x.fill();
}
function drawGalaxyIcon(cv,gal,idx){
  const r=cv.getBoundingClientRect(), dpr=Math.min(devicePixelRatio,2);
  if(r.width<4||r.height<4){cv.dataset.pending="1";return;} delete cv.dataset.pending;
  cv.width=Math.max(1,r.width*dpr); cv.height=Math.max(1,r.height*dpr);
  const x=cv.getContext("2d"); x.setTransform(dpr,0,0,dpr,0,0); const w=r.width,h=r.height;
  x.clearRect(0,0,w,h);
  drawMiniGalaxy(x,w,h,gal);
}
function markActiveGalaxy(){ $$("#galaxy-cards .gxcard").forEach(el=>el.classList.toggle("on",+el.dataset.gx===galIdx)); }
function redrawGalaxyIcons(){ $$("#galaxy-cards .gxcard").forEach(el=>{const i=+el.dataset.gx,cv=el.querySelector("canvas"); if(cv)drawGalaxyIcon(cv,GALAXIES[i],i);}); }
function renderGalaxies(){
  const nn=$("#gx-n"); if(nn)nn.textContent=GALAXIES.length;
  $("#galaxy-cards").innerHTML=GALAXIES.map((g,i)=>
    `<div class="fcard gxcard" data-gx="${i}" tabindex="0" role="button" aria-label="${esc(g.name)}">
      <canvas></canvas>
      <div class="fc-info">
        <div class="fc-code">${esc(g.name)}<span class="fc-live">VIEW</span></div>
        <div class="fc-dist">${esc(g.dist)}</div>
      </div>
    </div>`).join("");
  $$("#galaxy-cards .gxcard").forEach(el=>{
    const i=+el.dataset.gx, g=GALAXIES[i];
    requestAnimationFrame(()=>drawGalaxyIcon(el.querySelector("canvas"),g,i));
    const sel=()=>{ galIdx=i; updateGalaxyLabel(); restartGalaxyCycle(); };
    el.addEventListener("click",sel);
    el.addEventListener("keydown",e=>{if(e.key==="Enter"||e.key===" "){e.preventDefault();sel();}});
  });
  markActiveGalaxy();
}
updateGalaxyLabel();
restartGalaxyCycle();

// nav-card icons (about / research / projects / contact), canvas-drawn
function drawNavIcon(cv,sec){
  if(!cv) return;
  const r=cv.getBoundingClientRect(), dpr=Math.min(devicePixelRatio,2);
  if(r.width<8||r.height<20) return;   // layout not settled yet; a later redraw catches it
  cv.width=Math.max(1,Math.round(r.width*dpr)); cv.height=Math.max(1,Math.round(r.height*dpr));
  const x=cv.getContext("2d"); x.setTransform(dpr,0,0,dpr,0,0);
  const w=r.width,h=r.height,cx=w/2,cy=h/2; const s=h/30; x.translate(cx,cy); x.scale(s,s); x.translate(-cx,-cy);  // fit the icon to the card
  x.strokeStyle="#47ffa9"; x.fillStyle="#47ffa9"; x.lineWidth=1.1; x.globalAlpha=.92;
  if(sec==="about"){ x.beginPath(); x.arc(cx,cy-4,3.4,0,7); x.stroke(); x.beginPath(); x.arc(cx,cy+8,7,Math.PI,0); x.stroke(); }
  else if(sec==="research"){ x.beginPath(); x.arc(cx,cy,3,0,7); x.stroke(); for(let k=0;k<3;k++){x.beginPath(); x.ellipse(cx,cy,9,3.4,k*Math.PI/3+0.4,0,7); x.stroke();} }
  else if(sec==="projects"){ x.strokeRect(cx-7,cy-6,14,12); x.beginPath(); x.moveTo(cx-2,cy-6); x.lineTo(cx-2,cy+6); x.moveTo(cx-7,cy); x.lineTo(cx+7,cy); x.stroke(); }
  else { x.beginPath(); x.arc(cx-6,cy+5,1.6,0,7); x.fill(); for(const rr of [5,9,13]){x.globalAlpha=.5; x.beginPath(); x.arc(cx-6,cy+5,rr,-Math.PI/2,0.02); x.stroke();} x.globalAlpha=.92; }
  x.globalAlpha=1;
}
function drawNavIcons(){ $$("#nav .navcard").forEach(el=>drawNavIcon(el.querySelector(".nav-ic"), el.dataset.sec)); }
requestAnimationFrame(drawNavIcons);
addEventListener("load", drawNavIcons);
addEventListener("resize", drawNavIcons);
// icons depend on final layout + the web font; redraw a few times as things settle
[120,350,800,1600].forEach(t=>setTimeout(drawNavIcons,t));
if(document.fonts&&document.fonts.ready) document.fonts.ready.then(drawNavIcons);
if(window.ResizeObserver){ const navRO=new ResizeObserver(()=>drawNavIcons());
  $$("#nav .navcard .nav-ic").forEach(c=>navRO.observe(c)); }

// nav cards open their section overlay
$$("[data-sec]").forEach(el=>{
  el.addEventListener("click",e=>{e.stopPropagation();openPanel(el.dataset.sec);});
  el.addEventListener("keydown",e=>{if(e.key==="Enter"||e.key===" "){e.preventDefault();openPanel(el.dataset.sec);}});
});

// --- fleet (auto-cycles the active craft) ---
let fleetTab="ACTIVE", currentCraft=null, cycleTimer=null;
function drawFleetIcon(cv,f){
  const r=cv.getBoundingClientRect(), dpr=Math.min(devicePixelRatio,2);
  if(r.width<4||r.height<4){cv.dataset.pending="1";return;}   // hidden/collapsed; redraw when shown
  delete cv.dataset.pending;
  cv.width=Math.max(1,r.width*dpr); cv.height=Math.max(1,r.height*dpr);
  const x=cv.getContext("2d"); x.setTransform(dpr,0,0,dpr,0,0);
  const w=r.width,h=r.height,cx=w*0.5,cy=h*0.5, col=f.status==="ENDED"?"#7c6320":"#47ffa9";
  // silhouettes are authored for a 64×30 box; scale to whatever the canvas is
  const sc=Math.min(w/64,h/30); x.translate(cx,cy); x.scale(sc,sc); x.translate(-cx,-cy);
  x.strokeStyle=col; x.fillStyle=col; x.lineWidth=1/sc; x.globalAlpha=.95;
  const line=(a,b,c,d)=>{x.beginPath();x.moveTo(a,b);x.lineTo(c,d);x.stroke();};
  const box=(bx,by,bw,bh)=>x.strokeRect(bx-bw/2,by-bh/2,bw,bh);
  // dish: outer ellipse, inner ellipse, 8 spokes
  const dish=(dx,dy,r0)=>{ x.beginPath();x.ellipse(dx,dy,r0,r0*0.62,0,0,7);x.stroke();
    x.beginPath();x.ellipse(dx,dy,r0*0.5,r0*0.31,0,0,7);x.stroke();
    for(let k=0;k<8;k++){const a=k*Math.PI/4;x.beginPath();x.moveTo(dx,dy);x.lineTo(dx+Math.cos(a)*r0,dy+Math.sin(a)*r0*0.62);x.stroke();} };
  // segmented solar-array grid
  const grid=(gx,gy,gw,gh,cols,rows)=>{ box(gx,gy,gw,gh);
    for(let i=1;i<cols;i++){const px=gx-gw/2+gw*i/cols;line(px,gy-gh/2,px,gy+gh/2);}
    for(let i=1;i<rows;i++){const py=gy-gh/2+gh*i/rows;line(gx-gw/2,py,gx+gw/2,py);} };
  switch(f.type){
    case "voyager": dish(cx-11,cy-3,10); box(cx+1,cy-1,9,9);
      line(cx+6,cy+2,cx+31,cy+11);                                 // long magnetometer boom
      line(cx-6,cy+5,cx-20,cy+9); for(let k=0;k<3;k++)box(cx-15-k*5,cy+9,4,5);  // RTG boom + RTGs
      line(cx+5,cy-3,cx+18,cy-11); box(cx+20,cy-12,4,4); break;     // science boom
    case "newhorizons": dish(cx-3,cy-2,11);
      x.beginPath();x.moveTo(cx-6,cy+8);x.lineTo(cx+6,cy+8);x.lineTo(cx,cy+1);x.closePath();x.stroke();  // triangular bus
      line(cx+5,cy+4,cx+26,cy+9); box(cx+27,cy+9,4,4); break;       // single RTG
    case "juno": box(cx,cy,8,9);                                    // hex bus + 3 solar wings
      for(let k=0;k<3;k++){const a=k*2.094+0.5;const ux=Math.cos(a),uy=Math.sin(a)*0.62;
        line(cx+ux*5,cy+uy*5,cx+ux*13,cy+uy*13);
        grid(cx+ux*22,cy+uy*22,13,7,4,2);} break;
    case "parker": x.beginPath();x.ellipse(cx,cy-9,16,4,0,Math.PI,0);x.stroke();  // heat shield arc
      box(cx,cy,7,9); grid(cx-15,cy,11,6,3,2); grid(cx+15,cy,11,6,3,2); break;
    case "psyche": box(cx,cy,9,10); grid(cx-20,cy,22,11,4,3); grid(cx+20,cy,22,11,4,3); dish(cx,cy-9,4); break;
    case "cassini": dish(cx,cy-9,12); box(cx,cy+5,8,13);
      line(cx-20,cy+11,cx+5,cy+3); box(cx-22,cy+11,4,4);            // magnetometer boom
      for(let k=0;k<3;k++)line(cx,cy+9,cx-8+k*8,cy+13); break;      // RTGs
    case "galileo": dish(cx,cy-7,12); box(cx,cy+4,10,8);
      line(cx-21,cy+10,cx+5,cy+3); box(cx-23,cy+10,4,4);
      line(cx-7,cy+4,cx-17,cy+4); box(cx-19,cy+4,4,4); break;
    case "jwst":
      x.beginPath(); for(let k=0;k<6;k++){const a=k*Math.PI/3-Math.PI/2,px=cx+Math.cos(a)*8,py=cy-3+Math.sin(a)*8*0.7; k?x.lineTo(px,py):x.moveTo(px,py);} x.closePath(); x.stroke();
      x.beginPath(); x.moveTo(cx-22,cy+9); x.lineTo(cx,cy+3); x.lineTo(cx+22,cy+9); x.lineTo(cx,cy+13); x.closePath(); x.stroke();
      for(let i=1;i<4;i++)line(cx-22+i*11,cy+9-i*1.5,cx-11+i*11,cy+9-(i-1)*1.5); break;
    case "orbiter": box(cx,cy,9,9); grid(cx-20,cy,20,9,4,3); grid(cx+20,cy,20,9,4,3); dish(cx,cy-8,4); break;
    default: dish(cx-6,cy,10); box(cx+7,cy,8,8);
  }
  x.globalAlpha=1;
}
function markActiveCard(){ $$("#fleet-cards .fcard").forEach(el=>el.classList.toggle("on",el.dataset.code===(currentCraft&&currentCraft.code))); }
function renderFleet(){
  $("#n-active").textContent=CONFIG.fleet.filter(f=>f.status==="ACTIVE").length;
  $("#n-ended").textContent=CONFIG.fleet.filter(f=>f.status==="ENDED").length;
  const list=CONFIG.fleet.filter(f=>f.status===fleetTab);
  // craft with a GLB get a pre-rendered thumbnail; others use the canvas silhouette
  const thumbFor=f=>f.model?f.model.replace(/^models\//,"models/thumbs/").replace(/\.glb$/i,".png"):"";
  $("#fleet-cards").innerHTML=list.map(f=>{
    const th=thumbFor(f);
    const vis=th?`<img class="fc-thumb ${f.status==="ENDED"?"ended":""}" src="${esc(th)}" alt="" loading="lazy">`:`<canvas></canvas>`;
    return `<div class="fcard" data-code="${f.code}" tabindex="0" role="button" aria-label="${esc(f.name)}">
      ${vis}
      <div class="fc-info">
        <div class="fc-code">${esc(f.code)}<span class="fc-live ${f.status==="ENDED"?"ended":""}">${f.status==="ENDED"?"ENDED":"LIVE"}</span></div>
        <div class="fc-region">${esc(f.region)}</div>
      </div>
    </div>`;}).join("");
  $$("#fleet-cards .fcard").forEach(el=>{
    const f=CONFIG.fleet.find(c=>c.code===el.dataset.code);
    const cv=el.querySelector("canvas");
    if(cv) requestAnimationFrame(()=>drawFleetIcon(cv,f));
    const sel=()=>{ selectCraft(el.dataset.code); setView("craft"); startCycle(); };  // select + restart the cycle timer
    el.addEventListener("click",sel);
    el.addEventListener("keydown",e=>{if(e.key==="Enter"||e.key===" "){e.preventDefault();sel();}});
  });
  markActiveCard(); renderFleetDSN();
}
function redrawFleetIcons(){
  $$("#fleet-cards .fcard").forEach(el=>{
    const f=CONFIG.fleet.find(c=>c.code===el.dataset.code); const cv=el.querySelector("canvas");
    if(f&&cv)drawFleetIcon(cv,f);
  });
}
$$("#fleet .fleet-tabs .hud-btn").forEach(b=>b.addEventListener("click",()=>{
  fleetTab=b.dataset.tab; $$("#fleet .fleet-tabs .hud-btn").forEach(x=>x.classList.toggle("on",x===b)); renderFleet();
}));
function setCraftSpec(f){
  $("#cr-code").textContent=f.code; $("#cr-name").textContent=f.name;
  const d=craftDSN(f), rng=d&&fmtRange(d.range);
  $("#cr-spec").innerHTML=`
    <span class="k">STATUS</span><span class="v hl">${esc(f.status)}</span>
    <span class="k">REGION</span><span class="v rd">${esc(f.region)}</span>
    <span class="k">RANGE</span><span class="v">${rng||esc(f.range)}</span>
    <span class="k">V-REL</span><span class="v">${esc(f.vrel)}</span>
    <span class="k">SIGNAL</span><span class="v cy">${esc(f.signal)}</span>
    <span class="k">LAUNCH</span><span class="v">${esc(f.launch)}</span>`;
  const el=$("#cr-dsn");
  if(f.status==="ENDED"){ el.innerHTML=`○ DSN · DECOMMISSIONED`; return; }
  if(d){ const rate=isFinite(d.rate)&&d.rate>0?(d.rate>1e6?(d.rate/1e6).toFixed(1)+" Mb/s":Math.round(d.rate/1000)+" kb/s"):"—";
    el.innerHTML=`<span class="live">◉ DSN LIVE</span> · ${esc(d.dish)} · RTLT ${fmtRTLT(d.rtlt)} · ${rate}${d.band?" · "+esc(d.band):""}`;
  }else{ el.innerHTML=`○ DSN · NOT IN CONTACT · <b>${dsnSignals}</b> NET SIGNALS`; }
}
function selectCraft(code){
  const f=CONFIG.fleet.find(c=>c.code===code); if(!f)return;
  currentCraft=f; setCraftSpec(f); buildCraft(f); markActiveCard();
}
function startCycle(){
  clearInterval(cycleTimer); if(reduce)return;
  const list=CONFIG.fleet.filter(f=>f.status==="ACTIVE");
  cycleTimer=setInterval(()=>{
    let i=list.findIndex(f=>f.code===(currentCraft&&currentCraft.code));
    i=(i+1)%list.length; selectCraft(list[i].code);
  },15000);   // next craft every 15s
}

// --- DSN Now (live) ---
// which antennas are talking to which craft, plus range / data-rate / round-trip time
let dsnLive={}, dsnSignals=0;
const AU_KM=1.495978707e8;
function fmtRTLT(sec){ if(!isFinite(sec)||sec<=0)return "—"; const m=Math.round(sec/60); return m<60?m+"m":Math.floor(m/60)+"h "+(m%60)+"m"; }
function fmtRange(km){ if(!isFinite(km)||km<=0)return null; return km>2e7?(km/AU_KM).toFixed(2)+" AU":Math.round(km/1000)+"k KM"; }
function craftDSN(f){ return f&&f.naif!=null ? dsnLive[Math.abs(f.naif)] : null; }
function renderFleetDSN(){
  $$("#fleet-cards .fcard").forEach(el=>{
    const f=CONFIG.fleet.find(c=>c.code===el.dataset.code), live=craftDSN(f), b=el.querySelector(".fc-live");
    if(b&&f&&f.status!=="ENDED"){ b.classList.toggle("dsn",!!live); b.textContent=live?"◉ DSN":"LIVE"; }
  });
}
async function loadDSN(){
  try{
    const txt=await fetch("https://eyes.nasa.gov/dsn/data/dsn.xml?r="+Date.now()).then(r=>{if(!r.ok)throw 0;return r.text();});
    const doc=new DOMParser().parseFromString(txt,"text/xml"); const live={}; let sig=0;
    doc.querySelectorAll("dish").forEach(d=>{
      const dish=d.getAttribute("name"), sigs=[...d.querySelectorAll("downSignal")];
      sigs.forEach(s=>{ if(s.getAttribute("active")==="true")sig++; });
      d.querySelectorAll("target").forEach(tg=>{
        const id=Math.abs(parseInt(tg.getAttribute("id"))||0);
        const s=sigs.find(v=>Math.abs(parseInt(v.getAttribute("spacecraftID"))||0)===id && v.getAttribute("active")==="true");
        live[id]={dish, range:parseFloat(tg.getAttribute("downlegRange")), rtlt:parseFloat(tg.getAttribute("rtlt")),
          rate:s?parseFloat(s.getAttribute("dataRate")):NaN, band:s?s.getAttribute("band"):null};
      });
    });
    dsnLive=live; dsnSignals=sig;
    $("#dsnline").className="dsnline";
    $("#dsnline").innerHTML=`◉ DSN LIVE · <b>${sig}</b> SIGNALS · GDS/CBR/MAD`;
    if(currentCraft)setCraftSpec(currentCraft);
    renderFleetDSN();
  }catch(e){
    console.warn("DSN Now fetch failed.",e);
    $("#dsnline").className="dsnline off"; $("#dsnline").textContent="◉ DSN · FEED UNAVAILABLE";
  }
}

// --- DONKI (live CMEs / flares / Kp) ---
const fmtAgo=ms=>{const h=Math.floor(ms/36e5),m=Math.floor(ms/6e4)%60;return `${String(h).padStart(2,"0")}H ${String(m).padStart(2,"0")}M`;};
function parseSrcLon(loc){ const m=/([EW])(\d+)/.exec(loc||""); return m?(m[1]==="W"?1:-1)*parseInt(m[2]):0; }
function setSolarStatus(s){ solarStatus=s; const el=$("#map-status"); if(el)el.textContent=s; }
async function loadDONKI(){
  const key=CONFIG.nasaKey||"DEMO_KEY", end=new Date().toISOString().slice(0,10),
        start=new Date(Date.now()-10*864e5).toISOString().slice(0,10);
  const get=ep=>fetch(`https://api.nasa.gov/DONKI/${ep}?startDate=${start}&endDate=${end}&api_key=${key}`)
    .then(r=>{if(!r.ok)throw new Error("HTTP "+r.status);return r.json();});
  try{
    const [cmes,flrs,gsts]=await Promise.all([get("CME").catch(()=>[]),get("FLR").catch(()=>[]),get("GST").catch(()=>[])]);
    // one plume per CME, using its flagged most-accurate analysis
    const evs=(cmes||[]).map(c=>{
      const as=(c.cmeAnalyses||[]); const a=as.find(v=>v.isMostAccurate)||as[0]; if(!a)return null;
      const eta=((a.enlilList||[])[0]||{}).estimatedShockArrivalTime||null;
      return { lon:a.longitude, lat:a.latitude||0, halfAngle:a.halfAngle||30, speed:a.speed||400,
        start:Date.parse(c.startTime), halo:a.longitude==null||(a.halfAngle||0)>=60, eta };
    }).filter(Boolean);
    if(evs.length)buildCmePlumes(evs);
    // keep the last 10 flares for the limb sparks + status line
    solFlares=(flrs||[]).slice(-10).map(f=>({lon:parseSrcLon(f.sourceLocation),cls:f.classType||"C",t:Date.parse(f.peakTime||f.beginTime)}));
    // status line: latest flare · next CME ETA · max Kp over 24h
    const bits=[];
    const lastF=solFlares[solFlares.length-1];
    if(lastF&&isFinite(lastF.t))bits.push(`${lastF.cls} FLARE ${fmtAgo(Date.now()-lastF.t)} AGO`);
    const nextEta=evs.map(e=>Date.parse(e.eta)).filter(t=>t>Date.now()).sort((a,b)=>a-b)[0];
    if(nextEta)bits.push(`CME ETA ${fmtAgo(nextEta-Date.now())}`);
    let kp=0; (gsts||[]).forEach(g=>(g.allKpIndex||[]).forEach(k=>{ if(Date.parse(k.observedTime)>Date.now()-864e5)kp=Math.max(kp,k.kpIndex); }));
    if(kp){ const g=Math.max(0,Math.round(kp)-4); bits.push(`Kp ${Math.round(kp)}${g>0?` (G${Math.min(g,5)})`:""}`); }
    setSolarStatus(bits.length?"⊙ "+bits.join(" · "):"⊙ QUIET SUN · NO RECENT EVENTS");
  }catch(e){
    console.warn("DONKI fetch failed — modeled CME fallback.",e);
    setSolarStatus("⊙ DONKI OFFLINE · MODELED EVENTS");
  }
}

// --- Three.js: wireframe spacecraft hero ---
const canvas=$("#scene");
let renderer=null;
try{ renderer=new THREE.WebGLRenderer({canvas,antialias:true,alpha:true});
  renderer.setPixelRatio(Math.min(devicePixelRatio,2));
}catch(err){
  console.warn("WebGL unavailable — spacecraft model offline.",err);
  canvas.style.display="none";
  const n=document.createElement("div"); n.id="craft-offline";
  n.style.cssText="position:fixed;left:58%;top:46%;transform:translate(-50%,-50%);z-index:5;text-align:center;"+
    "font-family:var(--tt);color:var(--orange);letter-spacing:.14em;font-size:13px;pointer-events:none";
  n.innerHTML='▸ WEBGL MODEL OFFLINE<br><span style="color:var(--text-dim);font-size:11px">3D CONTEXT UNAVAILABLE</span>';
  document.getElementById("hud").appendChild(n);
}
const scene=new THREE.Scene();
const cam=new THREE.PerspectiveCamera(46,1,0.1,100);
const craftHolder=new THREE.Group(); scene.add(craftHolder);
craftHolder.position.set(0.7,-0.15,0);
const craftPivot=new THREE.Group(); craftHolder.add(craftPivot);
// two faint green rings around the craft
[[3.4,0.46],[2.9,0.5]].forEach(([rad,tilt],i)=>{
  const ring=new THREE.Mesh(new THREE.TorusGeometry(rad,0.008,3,128),
    new THREE.MeshBasicMaterial({color:0x47ffa9,transparent:true,opacity:i?0.10:0.17,
      blending:THREE.AdditiveBlending,depthWrite:false}));
  ring.rotation.x=Math.PI*tilt; craftHolder.add(ring);
});
// very faint green wash behind the craft (low alpha so it reads as warmth, not a disc)
const glowTex=(()=>{ const c=document.createElement("canvas"); c.width=c.height=256;
  const g=c.getContext("2d"), gr=g.createRadialGradient(128,128,0,128,128,128);
  gr.addColorStop(0,"rgba(71,255,169,.055)"); gr.addColorStop(.4,"rgba(71,255,169,.028)");
  gr.addColorStop(.75,"rgba(71,255,169,.01)"); gr.addColorStop(1,"rgba(71,255,169,0)");
  g.fillStyle=gr; g.fillRect(0,0,256,256); return new THREE.CanvasTexture(c); })();
const craftGlow=new THREE.Sprite(new THREE.SpriteMaterial({map:glowTex,transparent:true,
  opacity:0.6,blending:THREE.AdditiveBlending,depthWrite:false}));
craftGlow.scale.set(17,17,1); craftPivot.add(craftGlow);

// --- 3D galaxies (WebGL point clouds) ---
const galaxyHolder=new THREE.Group(); scene.add(galaxyHolder); galaxyHolder.visible=false;
galaxyHolder.position.set(0.4,-0.05,0);
const galaxyPivot=new THREE.Group(); galaxyHolder.add(galaxyPivot);
let galaxy3D=null;
function buildGalaxy3D(idx){
  if(galaxy3D){ galaxyPivot.remove(galaxy3D);
    galaxy3D.traverse(o=>{o.geometry&&o.geometry.dispose();o.material&&o.material.dispose();}); galaxy3D=null; }
  const gal=GALAXIES[idx]||GALAXIES[0], hue=(gal.hue||[255,205,130]).map(c=>c/255);
  // same shape rules as the 2D drawGalaxy, extruded into a 3D point cloud
  const arms=gal.arms||2, N=6500, R=3.0, pos=new Float32Array(N*3), col=new Float32Array(N*3), rnd=Math.random;
  for(let i=0;i<N;i++){
    let x=0,y=0,z=0,b;
    if(gal.type==="elliptical"){                       // ellipsoidal swarm
      const rr=Math.pow(rnd(),0.5), u=rnd()*2-1, th=rnd()*6.2832, s=Math.sqrt(1-u*u);
      x=rr*R*s*Math.cos(th); z=rr*R*s*Math.sin(th); y=rr*R*u*0.62; b=1-rr*0.8;
    } else if(gal.type==="irregular"){                  // clumpy blob
      const rr=Math.pow(rnd(),0.5), th=rnd()*6.2832;
      x=Math.cos(th)*rr*R*(0.6+rnd()*0.6); z=Math.sin(th)*rr*R*(0.5+rnd()*0.5);
      y=(rnd()-0.5)*R*0.32; b=1-rr*0.5;
    } else {                                            // spiral / barred / edge-on disk
      const arm=i%arms, rr=Math.pow(rnd(),0.6);
      const a=arm*(6.2832/arms)+rr*(gal.type==="edge"?0.5:4);
      const w=(rnd()-0.5)*(gal.type==="edge"?0.12:0.36)*(1-rr*0.35);     // scatter perpendicular to the arm
      x=(Math.cos(a)*rr + Math.cos(a+1.5708)*w)*R;
      z=(Math.sin(a)*rr + Math.sin(a+1.5708)*w)*R;
      y=(rnd()-0.5)*R*(gal.type==="edge"?0.04:0.11)*(1-rr*0.4); b=1-rr*0.7;
    }
    const cr=Math.hypot(x,y,z)/R, core=cr<0.13?0.55:0;                   // brighten the core
    pos[i*3]=x; pos[i*3+1]=y; pos[i*3+2]=z;
    col[i*3]=Math.min(1,hue[0]*b+core); col[i*3+1]=Math.min(1,hue[1]*b+core); col[i*3+2]=Math.min(1,hue[2]*b+core);
  }
  const geo=new THREE.BufferGeometry();
  geo.setAttribute("position",new THREE.BufferAttribute(pos,3));
  geo.setAttribute("color",new THREE.BufferAttribute(col,3));
  const mat=new THREE.PointsMaterial({size:0.05,vertexColors:true,transparent:true,opacity:0.95,
    blending:THREE.AdditiveBlending,depthWrite:false,sizeAttenuation:true});
  galaxy3D=new THREE.Group();
  galaxy3D.add(new THREE.Points(geo,mat));
  // soft central glow sphere + a small bright nucleus
  galaxy3D.add(new THREE.Mesh(new THREE.SphereGeometry(0.9,16,16),
    new THREE.MeshBasicMaterial({color:new THREE.Color(hue[0],hue[1],hue[2]),transparent:true,opacity:0.05,
      blending:THREE.AdditiveBlending,depthWrite:false})));
  galaxy3D.add(new THREE.Mesh(new THREE.SphereGeometry(0.15,14,14),
    new THREE.MeshBasicMaterial({color:0xfff4d6,transparent:true,opacity:0.95})));
  galaxyPivot.add(galaxy3D);
}
const wire=(geo,col=0x47ffa9,op=0.9)=>new THREE.Mesh(geo,
  new THREE.MeshBasicMaterial({color:col,wireframe:true,transparent:true,opacity:op}));
let craftModel=null;
// Procedural wireframe per craft — dishes, booms, arrays, RTGs. Built from a handful
// of primitive helpers below. This is the instant fallback before any GLB loads.
function buildCraftModel(type){
  if(craftModel){craftPivot.remove(craftModel); craftModel.traverse(o=>{o.geometry&&o.geometry.dispose();o.material&&o.material.dispose();});}
  const g=new THREE.Group();
  const add=m=>{g.add(m);return m;};
  const MINT=0x47ffa9,GREEN=0x54ff8a,BLUE=0x5f7bff,CYAN=0x39d6c8,ORANGE=0xff6a1f,GOLD=0xf0b32a;
  // paraboloid dish, as a lathe of a squared profile
  const dish=(rad,depth,z,radial=26,col=MINT)=>{
    const pts=[]; for(let i=0;i<=7;i++){const r=rad*i/7; pts.push(new THREE.Vector2(Math.max(0.001,r), depth*(i/7)*(i/7)));}
    const d=add(wire(new THREE.LatheGeometry(pts,radial),col,0.85)); d.position.set(0,0,z); d.rotation.x=-Math.PI/2;
    const horn=add(wire(new THREE.ConeGeometry(0.06,0.26,6),col,0.8)); horn.position.set(0,0,z+depth+0.2); horn.rotation.x=Math.PI/2;
    return d;
  };
  // boom: thin cylinder with lots of height segments so the wireframe reads as a lattice
  const truss=(len,x,y,z,rz,r=0.03,col=MINT)=>{ const b=add(wire(new THREE.CylinderGeometry(r,r,len,4,Math.max(6,Math.round(len*5))),col,0.8));
    b.position.set(x,y,z); b.rotation.z=rz; return b; };
  const box=(w,h,d,x,y,z,col=MINT)=>{ const b=add(wire(new THREE.BoxGeometry(w,h,d,Math.max(1,Math.round(w*2.5)),Math.max(1,Math.round(h*2.5)),Math.max(1,Math.round(d*2.5))),col,0.85)); b.position.set(x,y,z); return b; };
  const cyl=(rt,rb,h,x,y,z,seg=12,col=MINT)=>{ const c=add(wire(new THREE.CylinderGeometry(rt,rb,h,seg,2),col,0.85)); c.position.set(x,y,z); c.rotation.x=Math.PI/2; return c; };
  const panel=(w,h,x,y,z,cols,rows,col=BLUE)=>{ const p=add(wire(new THREE.BoxGeometry(w,0.015,h,cols,1,rows),col,0.8)); p.position.set(x,y,z); return p; };
  const rtgs=(x,y,z,n=3)=>{ for(let k=0;k<n;k++){const c=add(wire(new THREE.CylinderGeometry(0.15,0.15,0.34,8,1),GREEN,0.9)); c.rotation.z=Math.PI/2; c.position.set(x-k*0.4,y,z);} };

  switch(type){
    case "voyager":
      cyl(0.5,0.5,0.5,0,0,0,10);                                // decagonal bus
      dish(1.5,0.5,0.9,30);                                     // high-gain dish
      truss(4.7,-2.35,0.05,-0.15,Math.PI*0.5);                  // magnetometer boom (very long)
      truss(1.6,-1.05,-0.55,0.1,Math.PI/2,0.035); rtgs(-1.55,-0.55,0.1,3);
      truss(1.5,0.95,0.5,-0.35,Math.PI*0.33,0.03);              // science scan-platform boom
      box(0.3,0.3,0.3,1.6,0.9,-0.6);                            // instruments
      break;
    case "newhorizons":
      { const body=add(wire(new THREE.CylinderGeometry(0.45,0.66,0.6,3,2),MINT,0.85)); body.rotation.x=Math.PI/2; }  // triangular bus
      dish(1.12,0.4,0.72,24);
      cyl(0.13,0.13,1.15,-1.0,-0.1,-0.1,8,GREEN);               // single RTG
      truss(0.6,0.45,-0.45,0.3,0,0.025);
      break;
    case "juno":
      cyl(0.55,0.55,0.72,0,0,0,6);                              // hexagonal bus
      for(let k=0;k<3;k++){ const arm=new THREE.Group();
        for(let s=0;s<4;s++){ const p=wire(new THREE.BoxGeometry(0.7,0.015,0.66,4,1,3),BLUE,0.8); p.position.set(0.95+s*0.74,0,0); arm.add(p); }
        const jb=wire(new THREE.CylinderGeometry(0.02,0.02,0.7,4,5),MINT,0.8); jb.rotation.z=Math.PI/2; jb.position.set(0.6,0,0); arm.add(jb);
        arm.rotation.z=k*Math.PI*2/3; g.add(arm); }
      dish(0.5,0.2,0.6,16);                                     // small HGA
      break;
    case "parker":
      { const shield=add(wire(new THREE.CylinderGeometry(1.2,1.2,0.05,8,1),ORANGE,0.85)); shield.position.set(0,0,1.1); shield.rotation.x=Math.PI/2; }  // heat shield
      cyl(0.42,0.42,0.7,0,0,0.2,6);                             // bus
      for(const sgn of [-1,1]) panel(0.85,0.5,sgn*0.82,0,-0.1,5,3);   // cooled solar wings
      break;
    case "psyche":
      box(0.85,0.95,0.85,0,0,0);                                // bus
      for(const sgn of [-1,1]) for(let s=0;s<3;s++) panel(0.88,1.0,sgn*(0.9+s*0.9),0,0,3,4,CYAN);  // large 5-panel arrays
      dish(0.62,0.24,0.6,18);
      break;
    case "cassini":
      dish(1.4,0.55,1.55,30);                                   // big HGA on top
      cyl(0.5,0.5,1.9,0,0,0.15,12);                             // tall central stack
      box(0.62,0.62,0.7,0,0,-0.7);                              // lower module
      truss(3.9,-1.95,-0.5,-0.4,Math.PI*0.5,0.02);              // magnetometer boom
      for(let k=0;k<3;k++){ const b=add(wire(new THREE.CylinderGeometry(0.14,0.14,1.0,6,2),GREEN,0.9)); b.position.set(0.5*Math.cos(k*2.1),0.5*Math.sin(k*2.1),-1.05); b.rotation.x=Math.PI/2; }  // 3 RTGs
      break;
    case "galileo":
      dish(1.25,0.5,1.05,26);
      cyl(0.6,0.6,0.65,0,0,0.1,12);                             // spun section
      box(0.5,0.5,0.6,0,0,-0.55);                               // despun section
      truss(3.3,-1.65,-0.5,-0.3,Math.PI*0.5,0.02);              // magnetometer boom
      truss(1.3,-0.95,0.45,0,Math.PI/2,0.035); rtgs(-1.05,0.45,0,2);
      break;
    case "jwst":
      { const sh=add(wire(new THREE.BoxGeometry(3.4,0.02,2.2,14,1,8),ORANGE,0.5)); sh.position.set(0,-0.18,-0.1); }   // sunshield
      for(let i=1;i<3;i++){ const l=add(wire(new THREE.BoxGeometry(3.4-i*0.4,0.02,2.2-i*0.3,10,1,6),ORANGE,0.28)); l.position.set(0,-0.18-i*0.12,-0.1); }
      dish(1.05,0.16,0.55,6,GOLD);                              // segmented primary mirror (hex-ish)
      truss(1.0,0,0.5,0.95,0,0.02);
      break;
    case "orbiter":
      box(0.9,0.9,1.0,0,0,0);
      for(const s of [-1,1]) for(let k=0;k<2;k++) panel(1.1,0.85,s*(1.0+k*1.15),0,0,4,4,BLUE);
      dish(0.72,0.28,0.7,20);
      break;
    default: cyl(0.5,0.5,0.6,0,0,0,10); dish(1.1,0.42,0.72,24);
  }
  craftModel=g; craftPivot.add(g);
}

// If a craft has model:"models/x.glb" in config, load it and swap it in over the
// procedural build. The procedural one stays up until (and unless) the GLB loads.
const gltfLoader = (renderer && typeof THREE.GLTFLoader==="function") ? new THREE.GLTFLoader() : null;
let modelToken = 0;
function buildCraft(f){
  const type = (typeof f==="string") ? f : ((f&&f.type)||"orbiter");
  buildCraftModel(type);
  const url = (f && typeof f==="object") ? f.model : null;
  if(url && gltfLoader){
    // token so a fast craft-switch discards a GLB that finishes loading late
    const tok = ++modelToken;
    gltfLoader.load(url,
      g => { if(tok===modelToken) applyGLB(g.scene || (g.scenes&&g.scenes[0])); },
      undefined,
      err => console.warn("GLB model load failed — keeping procedural model:", url, err));
  } else { modelToken++; }                         // invalidate any in-flight load
}
function applyGLB(obj){
  if(!obj) return;
  const MINT=0x47ffa9;
  const lineMat=new THREE.LineBasicMaterial({color:MINT,transparent:true,opacity:0.9});
  const grp=new THREE.Group();
  obj.updateMatrixWorld(true);
  // draw crease edges, not the full triangle wireframe — much cleaner on dense CAD meshes
  obj.traverse(o=>{ if(o.isMesh && o.geometry){
    const seg=new THREE.LineSegments(new THREE.EdgesGeometry(o.geometry,24), lineMat);   // 24° crease threshold
    seg.applyMatrix4(o.matrixWorld); grp.add(seg);
  }});
  grp.updateMatrixWorld(true);
  const bx=new THREE.Box3().setFromObject(grp), size=new THREE.Vector3(), ctr=new THREE.Vector3();
  bx.getSize(size); bx.getCenter(ctr);
  const s = 3.2/(Math.max(size.x,size.y,size.z)||1);   // scale to a fixed size regardless of source units
  grp.scale.setScalar(s); grp.position.set(-ctr.x*s,-ctr.y*s,-ctr.z*s);
  if(craftModel){ craftPivot.remove(craftModel);
    craftModel.traverse(o=>{ o.geometry&&o.geometry.dispose&&o.geometry.dispose(); }); }
  craftModel=grp; craftPivot.add(grp);
}

// drag to rotate; otherwise it slowly auto-spins
let spin=!reduce, targY=0.6, curY=0.6, targX=-0.42, curX=-0.42, targZ=6.6, curZ=6.6;
let dragging=false, lx=0, ly=0;
canvas.addEventListener("pointerdown",e=>{dragging=true;spin=false;lx=e.clientX;ly=e.clientY;});
addEventListener("pointerup",()=>{dragging=false; setTimeout(()=>{if(!dragging)spin=!reduce;},2500);});
addEventListener("pointermove",e=>{ if(dragging){
  targY+=(e.clientX-lx)*0.008; targX=Math.max(-1.4,Math.min(1.4,targX+(e.clientY-ly)*0.008));
  lx=e.clientX; ly=e.clientY; }});
canvas.addEventListener("wheel",e=>{e.preventDefault();targZ=Math.max(3.6,Math.min(9,targZ+e.deltaY*0.004));},{passive:false});
function resize(){const w=innerWidth,h=innerHeight;if(renderer)renderer.setSize(w,h);cam.aspect=w/h;cam.updateProjectionMatrix();}
addEventListener("resize",resize); resize();
function frame(){
  requestAnimationFrame(frame);
  if(spin)targY+=0.0045;
  curY+=(targY-curY)*0.08; curX+=(targX-curX)*0.08; curZ+=(targZ-curZ)*0.08;
  craftPivot.rotation.y=curY; craftPivot.rotation.x=curX;
  galaxyPivot.rotation.y=curY; galaxyPivot.rotation.x=curX;   // craft + galaxy share the rotation
  craftHolder.children.forEach(c=>{ if(c!==craftPivot) c.rotation.z+=0.0009; });
  cam.position.set(0,0,curZ); cam.lookAt(0,0,0);
  renderer.render(scene,cam);
}
buildCraft(CONFIG.fleet.find(x=>x.type==="newhorizons") || {type:"newhorizons"});
if(renderer)frame();   // 2D HUD + stars still run even without WebGL

// --- project dossier overlay ---
const dossier=$("#dossier");
function openDossier(p){
  $("#d-idx").textContent="OBJ-"+String(p._i+1).padStart(3,"0");
  $("#d-name").textContent=p.name;
  const cls=$("#d-cls"); cls.textContent="◈ "+p._belt.label+"  ·  "+p.status; cls.style.color=p._belt.color;
  $("#d-desc").textContent=p.desc;
  $("#d-meta").innerHTML=`
    <span class="k">BELT</span><span class="v">${esc(p._belt.label)}</span>
    <span class="k">STATUS</span><span class="v">${esc(p.status)}</span>
    <span class="k">DESIGNATION</span><span class="v">OBJ-${String(p._i+1).padStart(3,"0")}</span>`;
  $("#d-tech").innerHTML=(p.tech||[]).map(t=>`<span>${esc(t)}</span>`).join("");
  $("#d-links").innerHTML=(p.links||[]).map((l,i)=>
    `<a class="btn ${i?'ghost':''}" href="${esc(l.url)}" target="_blank" rel="noopener">${esc(l.label)} ↗</a>`).join("");
  dossier.classList.add("open");
}
$("#d-close").addEventListener("click",()=>dossier.classList.remove("open"));
addEventListener("keydown",e=>{if(e.key==="Escape"){dossier.classList.remove("open");closePanel();}});

// --- section overlays (about / research / projects / contact) ---
const panel=$("#panel"), scrim=$("#panel-scrim"), pBody=$("#p-body");
let lastFocus=null;
const SECTIONS={
  about:    {kicker:"PERSONNEL //", title:"ABOUT ME", render:renderAbout},
  research: {kicker:"RESEARCH // EXPERIENCE",  title:"RESEARCH & EXPERIENCE", render:renderResearch},
  projects: {kicker:"TRACKED OBJECTS // INDEX",  title:"PROJECTS", render:renderProjectsIndex},
  contact:  {kicker:"UPLINK // CHANNEL OPEN",    title:"CONTACT",  render:renderContact},
};
function linkRow(links){return (links||[]).map(l=>`<a href="${esc(l.url)}" target="_blank" rel="noopener">${esc(l.label)} ↗</a>`).join("");}
function renderAbout(){
  const a=CONFIG.about||{};
  const facts=(a.facts||[]).map(f=>`<span class="k">${esc(f.k)}</span><span class="v">${esc(f.v)}</span>`).join("");
  const stack=(a.stack||[]).map(s=>`<span class="chip">${esc(s)}</span>`).join("");
  return `${a.lead?`<div class="p-lead">${esc(a.lead)}</div>`:""}
    ${(a.body||[]).map(p=>`<p class="p-text">${esc(p)}</p>`).join("")}
    ${facts?`<div class="p-facts">${facts}</div>`:""}
    ${stack?`<div class="p-sub">CORE STACK</div><div class="chips">${stack}</div>`:""}`;
}
function renderResearch(){
  const items=CONFIG.research||[];
  if(!items.length)return `<p class="p-text">No research entries yet.</p>`;
  const list=items.map((r,i)=>`
    <div class="research-item" data-ri="${i}" tabindex="0" role="button" aria-label="View ${esc(r.name)}">
      <div class="ri-name">${esc(r.name)}</div>
      <div class="ri-org">${esc(r.org||"")}${r.org&&r.year?" · ":""}${esc(r.year||"")}${r.status?" · "+esc(r.status):""}</div>
      <div class="ri-desc">${esc(r.desc||"")}</div>
      <span class="ri-open">OPEN DETAIL ▸</span>
    </div>`).join("");
  return `<div class="research-split">
    <div class="research-list">${list}</div>
    <div class="research-detail blurred" id="research-detail"><div class="rd-hint">◂ SELECT AN ENTRY</div></div>
  </div>`;
}
function fillResearchDetail(i){
  const r=CONFIG.research[i], d=document.getElementById("research-detail"); if(!r||!d)return;
  const bullets=(r.detail||[r.desc]).map(b=>`<li>${esc(b)}</li>`).join("");
  const tags=(r.tags||[]).map(t=>`<span class="chip">${esc(t)}</span>`).join("");
  const links=(r.links||[]).map(l=>`<a href="${esc(l.url)}" target="_blank" rel="noopener">${esc(l.label)} ↗</a>`).join("");
  d.innerHTML=`<div class="rd-name">${esc(r.name)}</div>
    <div class="rd-org">${esc(r.org||"")}${r.org&&r.year?" · ":""}${esc(r.year||"")}${r.status?" · "+esc(r.status):""}</div>
    ${tags?`<div class="chips" style="margin-top:11px">${tags}</div>`:""}
    <ul>${bullets}</ul>
    ${links?`<div class="rd-links">${links}</div>`:""}`;
  d.classList.remove("blurred");
}
function renderProjectsIndex(){
  return `<div class="cards">`+CONFIG.projects.map(p=>{
    const tags=(p.tech||[]).map(t=>`<span class="chip">${esc(t)}</span>`).join("");
    return `<div class="card click" data-pi="${p._i}" tabindex="0" role="button" aria-label="Open ${esc(p.name)}">
      <div class="c-top"><span class="c-name">${esc(p.name)}</span>
        <span class="c-meta" style="color:${p._belt.color}">${esc(p._belt.label)} · ${esc(p.status)}</span></div>
      <div class="c-desc">${esc(p.desc||"")}</div>
      <div class="c-foot"><div class="chips">${tags}</div><span class="c-open">OPEN DOSSIER ▸</span></div></div>`;
  }).join("")+`</div>`;
}
function renderContact(){
  const c=CONFIG.contact||{};
  const rows=(c.channels||[]).map(ch=>
    `<span class="k">${esc(ch.k)}</span><span class="v"><a href="${esc(ch.url)}" target="_blank" rel="noopener">${esc(ch.v)} ↗</a></span>`).join("");
  return `${c.lead?`<div class="p-lead">${esc(c.lead)}</div>`:""}
    ${(c.body||[]).map(p=>`<p class="p-text">${esc(p)}</p>`).join("")}
    ${rows?`<div class="p-facts">${rows}</div>`:""}`;
}
function openPanel(sec){
  const s=SECTIONS[sec]; if(!s)return;
  lastFocus=document.activeElement;
  $("#p-kicker").textContent=s.kicker; $("#p-title").textContent=s.title;
  pBody.innerHTML=s.render(); panel.scrollTop=0;
  pBody.querySelectorAll(".card.click").forEach(el=>{
    const open=()=>{closePanel();openDossier(CONFIG.projects[+el.dataset.pi]);};
    el.addEventListener("click",open);
    el.addEventListener("keydown",e=>{if(e.key==="Enter"||e.key===" "){e.preventDefault();open();}});
  });
  pBody.querySelectorAll(".research-item").forEach(el=>{
    const pick=()=>{pBody.querySelectorAll(".research-item").forEach(x=>x.classList.remove("on"));
      el.classList.add("on"); fillResearchDetail(+el.dataset.ri);};
    el.addEventListener("click",pick);
    el.addEventListener("keydown",e=>{if(e.key==="Enter"||e.key===" "){e.preventDefault();pick();}});
  });
  panel.setAttribute("aria-hidden","false"); scrim.classList.add("show"); panel.classList.add("show");
  $("#p-close").focus();
}
function closePanel(){
  if(!panel.classList.contains("show"))return;
  panel.classList.remove("show"); scrim.classList.remove("show"); panel.setAttribute("aria-hidden","true");
  if(lastFocus&&lastFocus.focus)lastFocus.focus();
}
$("#p-close").addEventListener("click",closePanel);
scrim.addEventListener("click",closePanel);

// --- NeoWs feed (live close approaches) ---
const MON=["JAN","FEB","MAR","APR","MAY","JUN","JUL","AUG","SEP","OCT","NOV","DEC"];
const SAMPLE={tracked:31,pha:4,src:"SAMPLE",objs:[
  {des:"2005 QC5",date:"2026-07-09",ld:79.24,v:15.2,haz:false},
  {des:"2011 EP51",date:"2026-07-09",ld:12.41,v:8.6,haz:true},
  {des:"2026 NT",date:"2026-07-10",ld:9.59,v:7.31,haz:false},
  {des:"2026 NH",date:"2026-07-10",ld:5.37,v:13.3,haz:true},
  {des:"2007 AA2",date:"2026-07-11",ld:17.77,v:7.2,haz:false},
  {des:"2026 MQ3",date:"2026-07-12",ld:12.41,v:8.6,haz:false},
  {des:"2025 PN7",date:"2026-07-13",ld:2.6,v:11.59,haz:true},
  {des:"2020 OM",date:"2026-07-14",ld:9.08,v:9.5,haz:false},
  {des:"2026 KU3",date:"2026-07-15",ld:8.6,v:7.68,haz:false}]};
function normalizeNeoWs(j){
  const days=j.near_earth_objects||{}, objs=[];
  Object.keys(days).forEach(day=>days[day].forEach(o=>{
    const ca=(o.close_approach_data||[])[0]; if(!ca)return;
    objs.push({
      des:(o.name.match(/\(([^)]+)\)/)||[])[1] || o.name.trim(),
      date:ca.close_approach_date,
      epoch:ca.epoch_date_close_approach||Date.parse(ca.close_approach_date),
      ld:parseFloat(ca.miss_distance.lunar),
      km:parseFloat(ca.miss_distance.kilometers),
      v:parseFloat(ca.relative_velocity.kilometers_per_second),
      haz:!!o.is_potentially_hazardous_asteroid });
  }));
  objs.sort((a,b)=>a.date.localeCompare(b.date)||a.ld-b.ld);
  return {objs, tracked:j.element_count||objs.length, pha:objs.filter(o=>o.haz).length, src:"NASA NeoWs"};
}
// fills the NEAREST APPROACH box with the closest upcoming pass
function updateNearestApproach(objs){
  const now=Date.now();
  const up=objs.filter(o=>(o.epoch||Date.parse(o.date)||0)>=now-864e5);
  const best=(up.length?up:objs).slice().sort((a,b)=>a.ld-b.ld)[0];
  if(!best)return;
  const km=isFinite(best.km)?best.km:best.ld*384400;
  const ep=best.epoch||Date.parse(best.date)||now, dt=ep-now;
  const eta=dt>0?`${String(Math.floor(dt/36e5)).padStart(2,"0")}H ${String(Math.floor(dt/6e4)%60).padStart(2,"0")}M`:"PASSED";
  const d=new Date(ep);
  const stamp=`${d.getUTCFullYear()}-${MON[d.getUTCMonth()]}-${String(d.getUTCDate()).padStart(2,"0")} ${String(d.getUTCHours()).padStart(2,"0")}:${String(d.getUTCMinutes()).padStart(2,"0")}Z`;
  const set=(id,v)=>{const el=$(id); if(el)el.textContent=v;};
  set("#ma-des",`(${best.des})`);
  set("#ma-ld",`${best.ld.toFixed(3)} LD`);
  set("#ma-km",`${Math.round(km).toLocaleString("en-US")} KM`);
  set("#ma-v",isNaN(best.v)?"—":`${best.v.toFixed(2)} KM/S`);
  set("#ma-eta",eta);
  set("#ma-date",stamp);
}
function renderFeed(data){
  const {objs,tracked,pha,src}=data;
  neoObjs=objs; rebuildNeoScatter();                       // used by both maps
  updateNearestApproach(objs);
  const orb=$("#orb-n"); if(orb)orb.textContent=String(objs.length).padStart(2,"0");
  $("#t-total").textContent=String(tracked).padStart(2,"0");
  $("#t-plotted").textContent=String(Math.min(objs.length,30)).padStart(2,"0");
  $("#t-sentry").textContent=String(pha).padStart(2,"0");
  $("#feedbox").innerHTML=objs.slice(0,60).map((o,i)=>{
    const dp=o.date.split("-"), date=dp.length>=3?`${dp[2]} ${MON[+dp[1]-1]}`:"—";
    const close=o.haz||o.ld<3;
    return `<div class="ln${close?" close":""}"><span class="i">${String(i+1).padStart(3,"0")}</span>`+
      `<span class="des">${esc(o.des)}</span><span class="d">${date}</span>`+
      `<span class="ld">${o.ld.toFixed(2)}</span><span class="v">${isNaN(o.v)?"—":o.v.toFixed(1)}</span></div>`;
  }).join("");
  $("#feed-hd").innerHTML=`▸ ${src} · ${tracked} REC · PHA ${pha} <span class="live">● LIVE</span>`;
}
async function loadNASA(){
  const d=new Date(), s=d.toISOString().slice(0,10), e=new Date(d.getTime()+6*864e5).toISOString().slice(0,10);
  const key=CONFIG.nasaKey||"DEMO_KEY";
  try{
    const j=await fetch(`https://api.nasa.gov/neo/rest/v1/feed?start_date=${s}&end_date=${e}&api_key=${key}`)
      .then(r=>{if(!r.ok)throw new Error("HTTP "+r.status);return r.json();});
    renderFeed(normalizeNeoWs(j));
  }catch(err){
    console.warn("NeoWs fetch failed — using sample data.",err);
    renderFeed(SAMPLE);
    $("#feed-hd").innerHTML='▸ NASA NeoWs · OFFLINE · SAMPLE <span class="live">● LIVE</span>';
  }
  const box=$("#feedbox"); let fs=0;   // slow auto-scroll through the list
  if(!reduce)setInterval(()=>{ if(box.scrollHeight>box.clientHeight+2){ fs+=0.4;
    if(fs>=box.scrollHeight-box.clientHeight)fs=0; box.scrollTop=fs; }},40);
}
renderFeed(SAMPLE);   // show sample data immediately; loadNASA() replaces it
loadNASA();
setInterval(()=>updateNearestApproach(neoObjs),30000);   // tick the ETA down

// --- retro CRT fisheye ---
const warp=$("#warp"), feMap=document.getElementById("fisheye-map"), feDisp=document.getElementById("fisheye-disp");
// knobs live in config.js → CONFIG.retro; these are the fallbacks. See makeFisheyeMap.
const _RETRO   = (typeof CONFIG!=="undefined" && CONFIG.retro) || {};
const FE_BULGE = Number.isFinite(_RETRO.fisheyeBulge) ? _RETRO.fisheyeBulge : 0.40;
const FE_SPAN  = Number.isFinite(_RETRO.fisheyeSpan)  ? _RETRO.fisheyeSpan  : 1.5;
const FE_FILL  = Number.isFinite(_RETRO.fisheyeFill)  ? _RETRO.fisheyeFill  : 1.2;
const FE_FIT   = Number.isFinite(_RETRO.fisheyeFit)   ? _RETRO.fisheyeFit   : 0.88;
function makeFisheyeMap(size=512,span=FE_SPAN){
  // Builds the displacement map for the SVG feDisplacementMap. Spherical (atan) mapping,
  // NOT a polynomial r² barrel: the displacement peaks mid-radius and eases off at the
  // rim, which is what makes the screen bulge OUT (convex) instead of pinching in.
  // Don't "simplify" this to r² — that inverts the effect. span = sphere size vs screen
  // (bigger = gentler); pop depth is set separately via feDisp scale.
  const c=document.createElement("canvas"); c.width=c.height=size; const x=c.getContext("2d");
  const img=x.createImageData(size,size), d=img.data, H=Math.PI/2;
  for(let y=0;y<size;y++)for(let xx=0;xx<size;xx++){
    const i=(y*size+xx)*4, u=(xx/(size-1))*2-1, v=(y/(size-1))*2-1;
    const un=u/span, vn=v/span, rn=Math.hypot(un,vn);
    let dx=0,dy=0;
    if(rn>1e-4){ const rc=Math.min(rn,0.999), w=Math.sqrt(1-rc*rc);
      dx=span*(Math.atan2(un,w)/H - un);   // longitude
      dy=span*(Math.atan2(vn,w)/H - vn);   // latitude
    }
    d[i]=Math.max(0,Math.min(255,Math.round(128+dx*127)));
    d[i+1]=Math.max(0,Math.min(255,Math.round(128+dy*127)));
    d[i+2]=128; d[i+3]=255;
  }
  x.putImageData(img,0,0); return c.toDataURL();
}
(function initFisheyeMap(){ const url=makeFisheyeMap();
  feMap.setAttribute("href",url); feMap.setAttributeNS("http://www.w3.org/1999/xlink","xlink:href",url); })();
function setRetro(on){
  document.body.classList.toggle("retro",on);           // scanlines / roll / flicker (CSS)
  warp.classList.toggle("fisheye",on);                  // apply the bulge filter to the whole screen
  feDisp.setAttribute("scale", on?String(Math.round(Math.min(innerWidth,innerHeight)*FE_BULGE)):"0");
  // fill: overscan the background so it still covers the corners after the bulge
  document.documentElement.style.setProperty("--fe-fill", on?String(FE_FILL):"1");
  // fit: shrink the whole screen so it sits inside a black frame instead of edge-to-edge
  document.documentElement.style.setProperty("--fe-fit", on?String(FE_FIT):"1");
}
$("#fisheye").addEventListener("click",e=>{
  const on=e.currentTarget.getAttribute("aria-pressed")!=="true";
  e.currentTarget.setAttribute("aria-pressed",String(on));
  e.currentTarget.lastChild.textContent=on?" (RETRO ON)":" (RETRO LOOK)";
  setRetro(on);
});
addEventListener("resize",()=>{ if(document.body.classList.contains("retro"))setRetro(true); });

// The fisheye is a CSS filter, so it moves pixels but the browser still hit-tests the
// original layout — hover/clicks would land where a button was, not where you see it.
// So we run the cursor through the same displacement, find the element under the
// visible pixel, apply .crt-hover (native :hover is disabled in retro), and re-route
// the click there. No-op when retro is off.
const CRT_ACT = ".navcard,.viewsw,.hud-btn,#rail a,.fcard,.gcard,a[href],button,[role='button']";
function crtMapPoint(cx,cy){
  if(!document.body.classList.contains("retro")) return {x:cx,y:cy};
  const S=parseFloat(feDisp.getAttribute("scale"))||0;
  if(!S) return {x:cx,y:cy};
  const W=innerWidth, H=innerHeight, fit=FE_FIT, span=FE_SPAN, HH=Math.PI/2;
  const wx=(cx-W/2)/fit + W/2, wy=(cy-H/2)/fit + H/2;      // undo the fit scale first
  const u=(wx/W)*2-1, v=(wy/H)*2-1, un=u/span, vn=v/span, rn=Math.hypot(un,vn);
  let dxn=0,dyn=0;
  if(rn>1e-4){ const rc=Math.min(rn,0.999), w=Math.sqrt(1-rc*rc);
    dxn=span*(Math.atan2(un,w)/HH-un); dyn=span*(Math.atan2(vn,w)/HH-vn); }
  // apply the same displacement as makeFisheyeMap, then re-apply the fit scale
  return { x:cx + S*dxn*0.498*fit, y:cy + S*dyn*0.498*fit };
}
function crtActionable(el){ return el && el.closest ? el.closest(CRT_ACT) : null; }
let crtHovEl=null;
function crtSetHover(el){
  if(el===crtHovEl) return;
  if(crtHovEl) crtHovEl.classList.remove("crt-hover");
  crtHovEl=el; if(el) el.classList.add("crt-hover");
}
addEventListener("pointermove",e=>{
  if(!document.body.classList.contains("retro") || !(e.target.closest && e.target.closest("#crt-screen"))){
    crtSetHover(null); return; }
  const p=crtMapPoint(e.clientX,e.clientY);
  crtSetHover(crtActionable(document.elementFromPoint(p.x,p.y)));
},true);
addEventListener("pointerout",e=>{ if(!e.relatedTarget) crtSetHover(null); });
addEventListener("click",e=>{
  if(!e.isTrusted || !document.body.classList.contains("retro")) return;
  if(!(e.target.closest && e.target.closest("#crt-screen"))) return;
  const p=crtMapPoint(e.clientX,e.clientY);
  const hit=crtActionable(document.elementFromPoint(p.x,p.y));
  if(hit && hit!==crtActionable(e.target)){        // visible target differs from the layout hit
    e.preventDefault(); e.stopPropagation(); hit.click();   // click the one under the cursor
  }
},true);

const mtHead=$("#mt-head"), mtPlay=$("#mt-play");
let mtPlaying=!reduce, mtProg=(Date.now()%864e5)/864e5;
mtPlay.textContent=mtPlaying?"❚❚":"▶";
mtPlay.addEventListener("click",()=>{mtPlaying=!mtPlaying;mtPlay.textContent=mtPlaying?"❚❚":"▶";});
(function mtTick(){ if(mtPlaying)mtProg=(mtProg+0.00016)%1; mtHead.style.left=(mtProg*100)+"%"; requestAnimationFrame(mtTick); })();

// viewer's local time + short zone label
const TZ=(()=>{try{return new Date().toLocaleTimeString("en-US",{timeZoneName:"short"}).split(" ").pop();}catch(e){return "LOCAL";}})();
function tickClock(){
  const d=new Date(), p=n=>String(n).padStart(2,"0");
  const date=`${d.getFullYear()}-${MON[d.getMonth()]}-${p(d.getDate())}`;
  $("#stamp").textContent=`${date} ${p(d.getHours())}:${p(d.getMinutes())} ${TZ}`;
  $("#clock").textContent=`${date} ${p(d.getHours())}:${p(d.getMinutes())}:${p(d.getSeconds())} ${TZ}`;
}
setInterval(tickClock,1000); tickClock();

// --- init + boot ---
renderFleet();
selectCraft("NH");
// phones start on the galaxy view (the switcher is hidden ≤760px); desktop starts on
// the craft and auto-cycles the fleet
const mobileStart = matchMedia("(max-width:760px)").matches;
setView(mobileStart ? "galaxy" : "craft");
if(!mobileStart) startCycle();
loadDSN(); setInterval(loadDSN, 30000);
loadDONKI(); setInterval(loadDONKI, 20*60*1000);

const boot=$("#boot");
const bootLines=[
  ["BOOT · CNEOS UPLINK INIT","ok"],
  ["NASA NeoWs · CLOSE-APPROACH QUERY","ok"],
  ["PHA TABLE · HAZARD SCREEN","ok"],
  [`OPERATOR RECORD · ${CONFIG.name}`,"ok"],
  ["MOUNTING SPACECRAFT MODEL · NASA GLB","ok"],
  ["NAIF/SPICE · TRAJECTORY KERNELS","ok"],
  ["AUDIO UPLINK · SFX SYNTH ARMED","warn"],
  ["SIGNAL LOCKED · WELCOME","ok"],
];
let bi=0;
function bootStep(){
  if(bi>=bootLines.length){ setTimeout(()=>{boot.classList.add("done");
    crtPowerOn();
    setTimeout(()=>boot.style.display="none",800);},450); return; }
  const [txt,cls]=bootLines[bi++];
  const el=document.createElement("div"); el.className="l";
  el.innerHTML=`&gt; ${esc(txt)} ... <span class="${cls==='warn'?'w':'ok'}">${cls==='warn'?'ARMED':'OK'}</span>`;
  boot.appendChild(el);
  if(bi===bootLines.length){const c=document.createElement("span");c.className="cur";boot.appendChild(c);}
  setTimeout(bootStep, reduce?60:150+Math.random()*140);
}
// power-on flash. Full boot sequence runs once per tab session (see sessionStorage
// below); every later return just replays this flash. The offsetWidth read restarts
// the CSS animation.
function crtPowerOn(){ document.body.classList.remove("crt-boot"); void document.body.offsetWidth;
  document.body.classList.add("crt-boot"); setTimeout(()=>document.body.classList.remove("crt-boot"),1700); }
addEventListener("pageshow",e=>{ if(e.persisted && !reduce) crtPowerOn(); });   // bfcache restore
if(reduce){ boot.style.display="none"; }
else if(!sessionStorage.getItem("mc-booted")){ sessionStorage.setItem("mc-booted","1"); bootStep(); }
else { boot.style.display="none"; crtPowerOn(); }
