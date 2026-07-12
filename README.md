# SENTRY-Style Retrofuturist Portfolio

A NASA mission-control HUD portfolio in the spirit of
[sentry.artificialisabel.com](https://sentry.artificialisabel.com) — amber-on-near-black,
Instrument Serif titles with CRT raster stripes, red bracketed panels, and **live NASA
data** throughout. Vanilla HTML/CSS/JS + Three.js (vendored) — **no build step**.

**Live:** <https://timmyhsu07.github.io> · recruiter view: `/?hire`

---

## The four views (left-column switchers)

- **CRAFT — satellite view.** Real NASA CAD models (`models/*.glb`, Draco-decoded,
  rendered as green wireframes with a whisper-faint phosphor glow). The fleet roster
  auto-cycles 15 craft (Voyager 1/2, New Horizons, Parker, Juno, MRO, Cassini…); every
  entry has a real model. Live **DSN Now** ground-station lock shows per-craft
  dish/band/data-rate.
- **HELIOCENTRIC SOLAR MAP.** A 3D solar system you can drag-orbit and scroll-zoom:
  - **CME plumes & solar flares are real events** from **NASA DONKI** (space-weather
    database). Each CME is a golden particle jet aimed along its measured heliographic
    longitude/latitude, spread by its half-angle, with its front at *speed × time since
    launch* — where the ejection actually is right now. Flares twinkle on the sun's limb
    at their source longitude, sized by GOES class. A status line shows the latest
    flare, the next ENLIL-simulated CME Earth-arrival, and the 24 h max Kp.
  - **The NEO orbit web** — every plotted near-Earth object gets a thin tilted
    Keplerian ellipse (red = potentially hazardous) wrapped in a diffuse red/gold
    debris cloud; Earth's orbit is highlighted blue; the week's closest passes
    cluster as diamonds at Earth.
  - **ORB / CME / FLR / SOL** buttons toggle the layers; a SENTRY-style
    **NEAREST APPROACH** box shows the closest upcoming miss (LD/KM, V-REL, live ETA).
- **GEOCENTRIC EARTH MAP** — click **SOURCE / OBJECT FEED**. Every close approach from
  the live **NeoWs** feed becomes a trajectory streaking past Earth at its actual miss
  distance, with diamonds at closest approach (red = PHA, labeled).
- **GALAXY.** Eleven real catalogued galaxies (Milky Way → M87) as interactive 3D point
  clouds matching each one's true morphology; auto-cycles with name + distance.

**RETRO LOOK** toggles the CRT mode: a convex fisheye tube (pop-out, not pincushion),
phosphor grille + scanlines, rounded bezel, and a pointer remap so hover/clicks land on
what you *see* through the distortion. Tune it in `js/config.js → retro`
(`fisheyeBulge / fisheyeSpan / fisheyeFill / fisheyeFit`). Phones open on the galaxy view.

## URLs

| Link | Lands on |
|---|---|
| `/` | the retrofuturist HUD (this page) |
| `/?hire` | **recruiter page in light mode** — the link to share with recruiters |
| `/?recruiter` | recruiter page (visitor's saved light/dark) |

The recruiter page is a clean single-column résumé view (dark + gray/navy light mode)
that reads the same `config.js`, so both pages update together.

## Live NASA data

| Source | Feeds |
|---|---|
| **NeoWs** (`api.nasa.gov/neo`) | close-approach feed, TRACKED/PLOTTED/PHA counts, nearest-approach box, both maps |
| **DSN Now** (`eyes.nasa.gov/dsn`) | live Deep Space Network signal locks per craft |
| **DONKI** (`api.nasa.gov/DONKI`) | real CMEs (direction/width/speed/ENLIL ETA), flares, geomagnetic Kp |

Set your free key in `js/config.js → nasaKey` (<https://api.nasa.gov>). Every feed
falls back to bundled sample data — the page always works offline.

## Make it yours — edit `js/config.js` only

One `CONFIG` object drives both pages: identity (`name/role/mission`), `links`,
`about` (+ `stack`), `research[]`, `projects[]` (+ `belts`), `contact`, `fleet[]`
(each craft may point at a `models/*.glb`), and `retro` (CRT knobs). Drop your résumé
PDF in the root and point the RESUME link at it (bump its `?v=` when replacing).

## Run locally

```bash
python3 -m http.server 8000   # → http://localhost:8000   (or: npm start)
```

Any static server works; a server (vs `file://`) lets the NASA fetches run.

## Deploy

Hosted on **GitHub Pages** from `main` / root — **`git push` is the deploy**. The
`.nojekyll` file makes Pages serve files as-is; bump the `?v=N` query strings in
`index.html`/`recruiter.html` when changing JS/CSS so browsers fetch fresh copies.
