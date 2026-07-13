// Recruiter view: a plain, static render of the same CONFIG that index.html uses.
// No canvas, no animation — just builds the résumé HTML. Edit js/config.js, not this.
const $ = s => document.querySelector(s);
const esc = s => String(s).replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
const C = CONFIG;

const focus = (C.mission||"").split("\n").map(s=>s.replace(/,\s*$/,"").trim()).filter(Boolean);
const rail  = (C.links||[]).map(l=>`<a href="${esc(l.url)}" target="_blank" rel="noopener">${esc(l.label)}</a>`).join("");

function aboutHTML(){
  const a=C.about||{};
  const facts=(a.facts||[]).map(f=>`<span class="k">${esc(f.k)}</span><span class="v">${esc(f.v)}</span>`).join("");
  const stack=(a.stack||[]).map(s=>`<span class="chip">${esc(s)}</span>`).join("");
  // The hero already shows about.lead under the name. Lead this section with the body
  // instead (first paragraph gets the big lead styling) so the same line isn't printed twice.
  const body=(a.body||[]).map((p,i)=>i?`<p class="p">${esc(p)}</p>`:`<div class="lead">${esc(p)}</div>`).join("");
  return `<section id="about"><span class="sec-h">About</span>
    ${body}
    ${facts?`<div class="facts">${facts}</div>`:""}
    ${stack?`<div class="sub">Core Stack</div><div class="chips">${stack}</div>`:""}</section>`;
}
function researchHTML(){
  const items=C.research||[]; if(!items.length) return "";
  return `<section id="research"><span class="sec-h">Research &amp; Experience</span>`+items.map(r=>{
    const bullets=(r.detail||[r.desc]).map(b=>`<li>${esc(b)}</li>`).join("");
    const tags=(r.tags||[]).map(t=>`<span class="chip">${esc(t)}</span>`).join("");
    const links=(r.links||[]).map(l=>`<a href="${esc(l.url)}" target="_blank" rel="noopener">${esc(l.label)} ↗</a>`).join("");
    return `<div class="entry">
      <div class="e-top"><span class="e-name">${esc(r.name)}</span>
        <span class="e-meta">${esc(r.org||"")}${r.org&&r.year?" · ":""}${esc(r.year||"")}${r.status?" · "+esc(r.status):""}</span></div>
      <ul>${bullets}</ul>
      <div class="e-foot"><div class="chips">${tags}</div><div class="e-links">${links}</div></div>
    </div>`;
  }).join("")+`</section>`;
}
function projectsHTML(){
  const items=C.projects||[]; if(!items.length) return "";
  const belt=id=>(C.belts||[]).find(b=>b.id===id)||{label:id,color:"#f0b32a"};
  return `<section id="projects"><span class="sec-h">Projects</span>`+items.map(p=>{
    const b=belt(p.belt);
    const bullets=(p.detail||[p.desc]).filter(Boolean).map(x=>`<li>${esc(x)}</li>`).join("");
    const tags=(p.tech||[]).map(t=>`<span class="chip">${esc(t)}</span>`).join("");
    const links=(p.links||[]).map(l=>`<a href="${esc(l.url)}" target="_blank" rel="noopener">${esc(l.label)} ↗</a>`).join("");
    return `<div class="entry">
      <div class="e-top"><span class="e-name">${esc(p.name)}</span>
        <span class="e-meta belt belt-${esc(p.belt)}" style="color:${b.color}">${esc(b.label)} · ${esc(p.status)}</span></div>
      <ul>${bullets}</ul>
      <div class="e-foot"><div class="chips">${tags}</div><div class="e-links">${links}</div></div>
    </div>`;
  }).join("")+`</section>`;
}
function contactHTML(){
  const c=C.contact||{};
  const rows=(c.channels||[]).map(ch=>
    `<span class="k">${esc(ch.k)}</span><span class="v"><a href="${esc(ch.url)}" target="_blank" rel="noopener">${esc(ch.v)} ↗</a></span>`).join("");
  return `<section id="contact"><span class="sec-h">Contact</span>
    ${c.lead?`<div class="lead">${esc(c.lead)}</div>`:""}
    ${(c.body||[]).map(p=>`<p class="p">${esc(p)}</p>`).join("")}
    ${rows?`<div class="contact-grid">${rows}</div>`:""}</section>`;
}

const now=new Date();
const MON=["JAN","FEB","MAR","APR","MAY","JUN","JUL","AUG","SEP","OCT","NOV","DEC"];
const stamp=`${now.getFullYear()}-${MON[now.getMonth()]}-${String(now.getDate()).padStart(2,"0")}`;

$("#app").innerHTML = `
  <div class="top">
    <span class="stamp">${esc(C.role||"")}</span>
  </div>
  <header class="hero">
    <h1>${esc(C.name||"")}</h1>
    <div class="focus">${focus.map(f=>`<span>${esc(f)}</span>`).join("")}</div>
    ${C.about&&C.about.lead?`<div class="role">${esc(C.about.lead)}</div>`:""}
    <div class="rail">${rail}</div>
  </header>
  ${aboutHTML()}
  ${researchHTML()}
  ${projectsHTML()}
  ${contactHTML()}
  <footer>${esc(stamp)}</footer>
`;
