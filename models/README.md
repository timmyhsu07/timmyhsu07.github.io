# Real NASA 3D models

**Bundled here (15 craft):** `voyager.glb` (Voyager 1 & 2), `juno.glb`,
`parker.glb`, `newhorizons.glb`, `cassini.glb`, `galileo.glb`, `dawn.glb`,
`kepler.glb`, `messenger.glb`, `odyssey.glb`, `mro.glb`, `rosetta.glb`,
`stereo.glb`, `spitzer.glb` — the actual NASA 3D Resources / science.nasa.gov
CAD models, wired to their craft in `js/config.js` (`model:` field). They render
as clean mint crease-edge wireframes and swap in over the procedural model once
loaded.

Craft **without** a bundled model keep their procedural build, either because
NASA doesn't publish a web-ready GLB (Psyche, Lucy, Europa Clipper, BepiColombo,
Solar Orbiter) or because the published model is too dense to wireframe cleanly
(JWST, MAVEN, OSIRIS-REx, Perseverance/Curiosity rovers).

> ⚠️ **Draco note:** NASA's original GLBs use `KHR_draco_mesh_compression`,
> which plain three.js can't decode (it just fails and you see the procedural
> fallback). The bundled files here were **decoded to plain glTF** first
> (`npx @gltf-transform/cli optimize in.glb out.glb --compress false`). If you
> add a new NASA model and it won't show, decode it the same way.

The spacecraft hero renders a **procedural wireframe** for any craft *without* a
`model:` (built in `js/app.js` → `buildCraftModel`). That always works with zero
setup.

To show a **pixel-exact real NASA CAD model** for a craft instead, drop a
`.glb` (or `.gltf`) file in this folder and point the craft's `model:` field
at it in `js/config.js`. The procedural model still shows instantly as a
fallback, then the real model swaps in once it finishes loading and is
auto-wireframed / auto-scaled to fit.

### 1. Get a model

NASA publishes many spacecraft models for free:

- **NASA 3D Resources** — https://nasa3d.arc.nasa.gov/models
  (Voyager, Cassini, Galileo, Juno, Parker, Curiosity, etc.)
- **NASA Science 3D** — https://science.nasa.gov/3d-resources/
- **Solar System Treks / Eyes on the Solar System** assets

Downloads are often `.obj`, `.3ds`, `.stl`, or `.glb`. If it's **not** already
`.glb`, convert it (free):

- Open in **Blender** → `File ▸ Export ▸ glTF 2.0 (.glb)`, **or**
- Drag it into https://products.aspose.app/3d/conversion/obj-to-glb

Keep files small (< ~5 MB) so the page stays fast — decimate high-poly meshes
in Blender if needed.

### 2. Name it and wire it up

Save e.g. `models/voyager.glb`, then in `js/config.js` add a `model:` key to
that fleet entry:

```js
{ code:"VGR-1", name:"VOYAGER 1", ... type:"voyager", naif:-31,
  model:"models/voyager.glb" },
```

Reload. The craft now renders the real CAD mesh as a mint wireframe. Remove the
`model:` line (or delete the file) to fall back to the procedural build.
