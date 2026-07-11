# Near Earth Object Encounters — HUD Portfolio

A single-page portfolio built as a faithful clone of
[sentry.artificialisabel.com](https://sentry.artificialisabel.com): a
retro-futurist NASA mission-control HUD. Amber-on-near-black, an Instrument
Serif title, red bracketed panels, a rotating **wireframe spacecraft** hero,
and a **live NASA near-earth-object feed**.

- **Left side column** — the **CRAFT** spec readout, the live **SOURCE /
  OBJECT FEED**, and the **FLEET** picker (compact roster). The fleet
  **auto-cycles** the hero craft every 15 seconds (or click one).
- **Top-right** — the serif title: your **name** (with an Edgerunners-style
  chromatic-glitch effect) + focus areas, live counts, and an AUDIO toggle.
- **Center** — a procedural **wireframe spacecraft** (New Horizons / Voyager /
  Juno-style) over a **twinkling starfield** (drag to rotate).
- **Bottom row (above the timeline)** — the four section panels
  **About / Research / Projects / Contact**, each carrying a little space-viz
  (heliocentric system, NEO space-bodies plot, project stream, spiral galaxy)
  and opening a full overlay.
- **Very bottom** — the MISSION TIME bar with a **local-time** clock (the
  viewer's own timezone).

Built with vanilla HTML/CSS/JS + Three.js (vendored locally — **no build
step, no framework**). The panel visuals are plain 2D `<canvas>`; only the
spacecraft uses WebGL, and it degrades to a "WEBGL MODEL OFFLINE" readout
(like SENTRY) when WebGL is unavailable.

---

## Live NASA data

The object feed and the TRACKED / PLOTTED / PHA counts come from NASA's
**NeoWs** (Near Earth Object Web Service) at `api.nasa.gov` — the CORS-enabled
API meant for client-side use, so it works from a static site with no backend.

> Note: SENTRY itself uses the JPL SSD/CNEOS APIs (`ssd-api.jpl.nasa.gov`),
> but those don't send CORS headers, so they can only be called through a
> server-side proxy. NeoWs returns the same close-approach data (lunar
> distance, relative velocity, hazard flag) and works directly in the browser.

Set your own free API key in `js/config.js` → `nasaKey`. The default
`DEMO_KEY` works but is rate-limited (~30 requests/hour per IP); grab a key in
a few seconds at <https://api.nasa.gov>. If the fetch fails, the feed falls
back to a bundled sample so the page always works.

---

## Make it yours — edit `js/config.js` only

Everything is driven by one `CONFIG` object; you never touch `app.js`.

1. **Identity** — `name` (serif title, before the ":"), `handle`, `role`,
   `mission` (phrase after your name; `\n` = line break), `credit`, `nasaKey`.
2. **Links** — the `SRC ·` rail.
3. **About** — `about`: `lead`, `body[]`, `facts[]` (`{ k, v }`), `stack[]`.
4. **Research** — `research[]`: `name`, `org`, `year`, `status`, `desc`,
   `tags[]`, `links[]`.
5. **Contact** — `contact`: `lead`, `body[]`, `channels[]` (`{ k, v, url }`).
6. **Projects** — `projects[]`: `name`, `belt` (matches a belt `id`),
   `status` (`ACTIVE`/`DEPLOYED`/`ARCHIVED`), `desc`, `tech[]`, `links[]`.
7. **Belts** — project categories (`id`, `label`, `color`, orbit `r`).
8. **Fleet** — the NASA spacecraft cards (`code`, `name`, `status`, `region`,
   `range`, `vrel`, `signal`, `launch`, `type: "dish" | "panel"`).

---

## Run it locally

Any static server works (a server is recommended so the `fetch` to
`api.nasa.gov` runs on an `http://` origin):

```bash
# Option A — Node (nothing to install; downloads `serve` on first run)
npm start                    # → http://localhost:3000

# Option B — Python (already on most machines)
python3 -m http.server 8000  # → http://localhost:8000

# Option C — VS Code: right-click index.html → "Open with Live Server"
```

Then open the printed URL in a normal browser (Chrome/Firefox/Safari) to see
the wireframe spacecraft render. Opening `index.html` via `file://` also works,
but some browsers block the NASA `fetch` from `file://`, in which case the
feed shows sample data — use a local server to get live data.

---

## Deploy (all free, static)

- **GitHub Pages** — push to a repo, then Settings → Pages → deploy from
  `main` / root.
- **Netlify / Vercel / Cloudflare Pages** — drop the folder in; framework
  preset "Other", build command none, output dir `/`.

No build configuration required — the files are already the final output.
