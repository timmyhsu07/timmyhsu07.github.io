/* ================================================================= *
 *  ▉▉  CONFIG — THIS IS THE ONLY PART YOU NEED TO EDIT  ▉▉
 *  A SENTRY-style HUD portfolio (sentry.artificialisabel.com):
 *  live JPL/NASA near-earth-object data, a wireframe spacecraft hero,
 *  and four portfolio panels (About / Research / Projects / Contact).
 * ================================================================= */
const CONFIG = {
  name:      "TIMOTHY HSU",                     // big serif name
  handle:    "@timmyhsu07",                     // (credit line is hidden by default)
  role:      "ML/AI RESEARCHER // CS & MATH",   // headline role
  // The three focus areas, shown as a justified row under the name. One per line.
  mission:   "MACHINE LEARNING\nQUANTITATIVE FINANCE\nSOFTWARE ENGINEERING",
  credit:    "",                                // credit line under the title (blank = hidden)

  // ── RETRO CRT / FISH-EYE look (main page only) ──  a convex CRT-tube bulge that
  //    pops OUT toward you (centre magnified, straight lines bow outward). Tweak to
  //    taste, then HARD-REFRESH (Cmd+Shift+R). Nothing else depends on these.
  retro: {
    // HOW MUCH the screen pops OUT toward you (the bulge depth):
    //   0 = flat · 0.25 = gentle · 0.40 = default · 0.55 = strong · 0.7 = extreme
    //   (much past 0.45 starts pushing the edge HUD text off-screen)
    fisheyeBulge: 0.40,
    // SPHERE SIZE vs the screen: lower = a rounder, more dramatic tube whose curve
    //   reaches further toward the centre; higher = gentler, with the curvature kept
    //   near the rim.  1.4 = dramatic · 1.5 = default · 1.9+ = subtle.
    fisheyeSpan: 1.5,
    // OVERSCAN — fills the space background out to the tube's edges so there are no
    //   interior gaps before the bezel vignette. 1 = off · 1.2 = default.
    fisheyeFill: 1.2,
    // FIT — shrinks the WHOLE CRT to sit INSIDE the screen with a black frame around
    //   it (like a CRT TV in its bezel) instead of filling edge-to-edge.
    //   1 = fill the whole screen (no frame) · 0.88 = default · 0.8 = thicker frame.
    fisheyeFit: 1,
  },

  // NASA NeoWs API key. "DEMO_KEY" works but is rate-limited (~30/hr per IP);
  // grab a free key in seconds at https://api.nasa.gov and paste it here.
  nasaKey:   "Zc4xpogVH2Q1Xa0cnBBfmUdrZMpZNVt3icdbtlV7",

  // top contact / source rail. To wire up your résumé, drop the PDF in this
  // folder and point the RESUME url at its filename (see the RESUME entry).
  links: [
    { label:"GITHUB",   url:"https://github.com/timmyhsu07" },
    { label:"LINKEDIN", url:"https://www.linkedin.com/in/timhsu7/" },
    { label:"EMAIL",    url:"mailto:timmyhsu07@gmail.com" },
    { label:"RESUME",   url:"Timothy_Hsu_Resume_2026.pdf?v=3" },   // save the PDF here with this name; bump ?v= when you replace it
  ],

  // ── ABOUT ME ──  (left panel + overlay). Mirrors the LinkedIn "About".
  about: {
    lead: "ML/AI researcher building high-performance computational systems at the intersection of machine learning, quantitative methods, and mathematics.",
    body: [
      "I study Computer Science and Mathematics at the Rutgers Honors College, focused on building high-performance computational systems, applying machine learning, and developing quantitative methods for real-world problems.",
      "I'm committed to building reliable, data-driven systems at the seam of computation, applied mathematics, and ML research. You might be wondering now, why the retrofuturistic theme? Because I love space and the aesthetics of Cowboy Bebop.",
    ],
    facts: [
      { k:"BASE",   v:"NEW YORK, NY" },
      { k:"FOCUS",  v:"ML · QUANT DEV · SWE" },
      { k:"STATUS", v:"OPEN TO SUMMER 2027 ROLES" },
    ],
    stack: ["Python","Java","C++","SQL","JavaScript","PyTorch","scikit-learn","NumPy","Pandas","SciPy","Matplotlib","UMAP","PaCMAP","OpenCV","scikit-image","Pillow","QuantLib","DuckDB","Parquet","pytest","Jupyter","Docker","Git","LaTeX","Three.js"],
  },

  // ── RESEARCH ──  Each entry shows in the list; clicking it opens the detail
  // pane on the right. `detail[]` are the bullet points for that pane.
  research: [
    { name:"Counterfactual Recourse under Uncertainty", org:"TRACE AI Lab · Rutgers", year:"2026",
      status:"ACTIVE",
      desc:"GLIMPSE — geometric ML interpretability: on-manifold counterfactual recourse via autoencoders under parameter uncertainty.",
      tags:["Python","PyTorch","Autoencoders","UMAP / PaCMAP","scikit-learn"],
      detail:[
        "Built an ML-interpretability pipeline in Python (GLIMPSE: Geometric Lens for Inspecting Multiplicity of Sets and Explanations) over 5,000+ records, benchmarking 4 dimensionality-reduction algorithms and reducing projection selection to a single automated run.",
        "Engineered 3 geometric fidelity metrics (Pearson/Spearman distance correlation, trustworthiness), quantifying projection distortion and enabling automated evaluation across high-dimensional feature spaces.",
        "Designed a modular codebase across 4 core libraries with standardized interfaces, cutting dataset/algorithm onboarding time ~80% and enabling rapid experimentation across 10+ configurations.",
        "Developing a novel autoencoder-based projection with custom multi-term loss functions that preserve counterfactual distances and uncertainty geometry under parameter uncertainty.", 
      ],
      links:[{label:"GITHUB",url:"https://github.com/timmyhsu07"}] },

    { name:"Neurology Cell Analysis Pipelines", org:"Eleanna Kara Neurodegenerative Disease Lab", year:"2025",
      status:"ACTIVE",
      desc:"Lead programmer: Python microscopy pipelines quantifying neuronal morphology for neurodegenerative-disease research.",
      tags:["Python","OpenCV","scikit-image","Segmentation"],
      detail:[
        "Developed Python-based data-processing pipelines to analyze 800+ microscopy images, removing analysis bias by >50%.",
        "Designed and optimized segmentation, thresholding, and contour-detection algorithms to extract 15–20 quantitative cell features (soma area, circularity, neurite length), increasing analysis throughput by 5x.",
        "Automated QC, visualization, and summary-statistics generation across 8+ experimental batches, improving reproducibility of downstream neurobiological analyses.",
        "Modularized the codebase with reusable functions, improving maintainability and reducing rerun errors across experiments.",
      ],
      links:[{label:"GITHUB",url:"https://github.com/timmyhsu07"}] },

    { name:"Break Through Tech AI Fellowship", org:"Cornell Tech", year:"2026",
      status:"ACTIVE",
      desc:"Machine Learning & AI Fellow — a competitive year-long AI/ML fellowship, including a technical 12-week AI program from Cornell Tech.",
      tags:["Python","Machine Learning","Model Validation"],
      detail:[
        "Selected for a competitive year-long AI/ML fellowship; completed a technical 12-week AI Program from Cornell Tech, building and validating ML models on real-world datasets in Python.",
        "Completing a technical, industry-relevant project plus virtual professional-development and technical workshops on authentic leadership, effective collaboration, project management, and professional norms.",
      ],
      links:[{label:"BREAK THROUGH TECH",url:"https://www.breakthroughtech.org/"}] },
  ],

  // ── CONTACT ──  (bottom panel + overlay)
  contact: {
    lead: "Signals open: feel free to contact me!",
    body: [
      "Open to any quant-dev / SWE roles as well as for ML/AI research collaborations. I answer email the fastest.",
    ],
    channels: [
      { k:"EMAIL",    v:"timmyhsu07@gmail.com",     url:"mailto:timmyhsu07@gmail.com" },
      { k:"GITHUB",   v:"github.com/timmyhsu07",     url:"https://github.com/timmyhsu07" },
      { k:"LINKEDIN", v:"linkedin.com/in/timhsu7",   url:"https://www.linkedin.com/in/timhsu7/" },
      { k:"RESUME",   v:"Timothy_Hsu_Resume_2026.pdf", url:"Timothy_Hsu_Resume_2026.pdf?v=3" },
    ],
  },

  // ── PROJECT BELTS ──  category colors use the SENTRY key palette.
  belts: [
    { id:"ml",      label:"MACHINE LEARNING", color:"#54ff8a", r:1.55 },
    { id:"quant",   label:"QUANT / FINANCE",  color:"#ff6a1f", r:1.95 },
    { id:"systems", label:"SYSTEMS / INFRA",  color:"#39d6c8", r:2.30 },
    { id:"web",     label:"WEB / TOOLS",      color:"#5f7bff", r:2.62 },
    { id:"research",label:"RESEARCH",         color:"#ff3b2f", r:1.75 },
  ],

  // ── PROJECTS ──  belt must match a belt id. status ∈ ACTIVE|DEPLOYED|ARCHIVED
  projects: [
    { name:"GLIMPSE", belt:"ml", status:"ACTIVE",
      desc:"Geometric Lens for Inspecting Multiplicity of Sets and Explanations — an ML-interpretability pipeline in Python over 5,000+ records, benchmarking 4 dimensionality-reduction algorithms to reduce projection selection to a single automated run. Adds 3 geometric fidelity metrics (Pearson/Spearman distance correlation, trustworthiness) and a novel autoencoder projection with custom multi-term loss functions that preserve counterfactual distances and uncertainty geometry under parameter uncertainty.",
      tech:["Python","PyTorch","Autoencoders","UMAP / PaCMAP","scikit-learn","NumPy"],
      links:[{label:"GITHUB",url:"https://github.com/timmyhsu07"}] },
    { name:"GAMMA-SCALP", belt:"quant", status:"DEPLOYED",
      desc:"Research-grade options backtester for gamma-scalping (Python, NumPy, SciPy, pandas) implementing a published exit-timing framework (Ramkumar, 2025); validated Black–Scholes/Greeks against QuantLib to 1e-8 across 3,000+ Monte Carlo paths. Identified a drift-term inconsistency in the paper's hedged-P&L derivation via invariance testing and quantified a non-tradable foresight ceiling (+55% mean P&L vs. hold-to-expiry, +66% net of costs). A look-ahead-proof architecture — immutable per-day state, a write-once data cache, and a 172-test suite — shows a causal vol-forecast exit rule capturing 72% of that ceiling's edge (90% CI 66–77%) net of costs.",
      tech:["Python","NumPy","SciPy","pandas","QuantLib","pytest"],   
      links:[{label:"GITHUB",url:"https://github.com/timmyhsu07/gamma-exit.git"}] },
  ],

  // ── DEEP-SPACE FLEET ──  real NASA spacecraft. Each `type` renders a
  // distinct procedural wireframe; `naif` is the NASA/NAIF id used to match the
  // live Deep Space Network (DSN Now) feed for real-time range / data-rate.
  //
  // OPTIONAL — pixel-exact model: to show a real NASA CAD mesh for a craft, add
  //   model:"models/voyager.glb"
  // (drop the .glb in /models — see models/README.md). The procedural build
  // shows instantly and the real model swaps in once loaded.
  fleet: [
    // ── ACTIVE ──
    { code:"VGR-1", name:"VOYAGER 1",      status:"ACTIVE", region:"HELIOSHEATH / INTERSTELLAR", range:"~167 AU", vrel:"~17 KM/S", signal:"DSN · X-BAND",  launch:"1977-09-05", type:"voyager",     naif:-31, model:"models/voyager.glb" },
    { code:"VGR-2", name:"VOYAGER 2",      status:"ACTIVE", region:"INTERSTELLAR SPACE",         range:"~139 AU", vrel:"~15 KM/S", signal:"DSN · S/X-BAND",launch:"1977-08-20", type:"voyager",     naif:-32, model:"models/voyager.glb" },
    { code:"NH",    name:"NEW HORIZONS",   status:"ACTIVE", region:"OUTER SOLAR SYSTEM",         range:"~63 AU",  vrel:"~14 KM/S", signal:"DSN · X-BAND",  launch:"2006-01-19", type:"newhorizons", naif:-98, model:"models/newhorizons.glb" },
    { code:"PSP",   name:"PARKER SOLAR PROBE", status:"ACTIVE", region:"INNER HELIOSPHERE",     range:"~0.4 AU", vrel:"~110 KM/S",signal:"DSN · Ka-BAND", launch:"2018-08-12", type:"parker",      naif:-96, model:"models/parker.glb" },
    { code:"JUNO",  name:"JUNO",           status:"ACTIVE", region:"JOVIAN SYSTEM",             range:"~5.2 AU", vrel:"~30 KM/S", signal:"DSN · X-BAND",  launch:"2011-08-05", type:"juno",        naif:-61, model:"models/juno.glb" },
    { code:"PSY",   name:"PSYCHE",         status:"ACTIVE", region:"MAIN BELT TRANSFER",        range:"~2.5 AU", vrel:"~9 KM/S",  signal:"DSN · X/Ka",    launch:"2023-10-13", type:"psyche",      naif:-255 },
    { code:"JWST",  name:"JAMES WEBB",     status:"ACTIVE", region:"SUN–EARTH L2",              range:"~0.01 AU",vrel:"~0.3 KM/S",signal:"DSN · Ka-BAND", launch:"2021-12-25", type:"jwst",        naif:-170 },
    { code:"LUCY",  name:"LUCY",           status:"ACTIVE", region:"JUPITER TROJANS TRANSIT",   range:"~3.4 AU", vrel:"~13 KM/S", signal:"DSN · X/Ka",    launch:"2021-10-16", type:"orbiter",     naif:-49 },
    { code:"ORX",   name:"OSIRIS-APEX",    status:"ACTIVE", region:"NEO APOPHIS CRUISE",        range:"~1.1 AU", vrel:"~7 KM/S",  signal:"DSN · X-BAND",  launch:"2016-09-08", type:"orbiter",     naif:-64 },
    { code:"CLIP",  name:"EUROPA CLIPPER", status:"ACTIVE", region:"JUPITER TRANSIT",           range:"~2.9 AU", vrel:"~24 KM/S", signal:"DSN · X/Ka",    launch:"2024-10-14", type:"orbiter",     naif:-159 },
    { code:"BEPI",  name:"BEPICOLOMBO",    status:"ACTIVE", region:"MERCURY CRUISE",            range:"~0.9 AU", vrel:"~30 KM/S", signal:"DSN/ESA · X/Ka",launch:"2018-10-20", type:"orbiter",     naif:-121 },
    { code:"SOLO",  name:"SOLAR ORBITER",  status:"ACTIVE", region:"INNER HELIOSPHERE",         range:"~0.6 AU", vrel:"~25 KM/S", signal:"DSN/ESA · X",   launch:"2020-02-10", type:"orbiter",     naif:-144 },
    { code:"MRO",   name:"MARS RECON ORBITER", status:"ACTIVE", region:"MARS ORBIT",           range:"~1.6 AU", vrel:"~3 KM/S",  signal:"DSN · X-BAND",  launch:"2005-08-12", type:"orbiter",     naif:-74, model:"models/mro.glb" },
    { code:"ODY",   name:"MARS ODYSSEY",   status:"ACTIVE", region:"MARS ORBIT",               range:"~1.6 AU", vrel:"~3 KM/S",  signal:"DSN · X-BAND",  launch:"2001-04-07", type:"orbiter",     naif:-53, model:"models/odyssey.glb" },
    { code:"MVN",   name:"MAVEN",          status:"ACTIVE", region:"MARS ORBIT",               range:"~1.6 AU", vrel:"~3 KM/S",  signal:"DSN · X-BAND",  launch:"2013-11-18", type:"orbiter",     naif:-202 },
    { code:"MSL",   name:"CURIOSITY",      status:"ACTIVE", region:"GALE CRATER · MARS",        range:"~1.6 AU", vrel:"—",        signal:"UHF RELAY · DSN",launch:"2011-11-26", type:"rover",       naif:-76 },
    { code:"M20",   name:"PERSEVERANCE",   status:"ACTIVE", region:"JEZERO CRATER · MARS",      range:"~1.6 AU", vrel:"—",        signal:"UHF RELAY · DSN",launch:"2020-07-30", type:"rover",       naif:-168 },
    { code:"STA",   name:"STEREO-A",       status:"ACTIVE", region:"HELIOCENTRIC · 1 AU",       range:"~1.0 AU", vrel:"~30 KM/S", signal:"DSN · X-BAND",  launch:"2006-10-26", type:"orbiter",     naif:-234, model:"models/stereo.glb" },
    // ── ENDED ──
    { code:"CAS",   name:"CASSINI",        status:"ENDED",  region:"SATURN SYSTEM",             range:"—", vrel:"—", signal:"DECOMMISSIONED", launch:"1997-10-15", type:"cassini", naif:-82, model:"models/cassini.glb" },
    { code:"GLL",   name:"GALILEO",        status:"ENDED",  region:"JOVIAN SYSTEM",             range:"—", vrel:"—", signal:"DECOMMISSIONED", launch:"1989-10-18", type:"galileo", naif:-77, model:"models/galileo.glb" },
    { code:"DAWN",  name:"DAWN",           status:"ENDED",  region:"CERES ORBIT",               range:"—", vrel:"—", signal:"DECOMMISSIONED", launch:"2007-09-27", type:"orbiter", naif:-203, model:"models/dawn.glb" },
    { code:"MSGR",  name:"MESSENGER",      status:"ENDED",  region:"MERCURY ORBIT",             range:"—", vrel:"—", signal:"DECOMMISSIONED", launch:"2004-08-03", type:"orbiter", naif:-236, model:"models/messenger.glb" },
    { code:"ROS",   name:"ROSETTA",        status:"ENDED",  region:"COMET 67P",                 range:"—", vrel:"—", signal:"DECOMMISSIONED", launch:"2004-03-02", type:"orbiter", naif:-226, model:"models/rosetta.glb" },
    { code:"KEP",   name:"KEPLER",         status:"ENDED",  region:"EARTH-TRAILING ORBIT",      range:"—", vrel:"—", signal:"DECOMMISSIONED", launch:"2009-03-07", type:"orbiter", naif:-227, model:"models/kepler.glb" },
    { code:"SPZ",   name:"SPITZER",        status:"ENDED",  region:"EARTH-TRAILING ORBIT",      range:"—", vrel:"—", signal:"DECOMMISSIONED", launch:"2003-08-25", type:"orbiter", naif:-79, model:"models/spitzer.glb" },
  ],
};
/* ===================  END OF CONFIG  =================== */
