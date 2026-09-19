# Personal website — Anas Flaifel

Anas's existing static portfolio, refined around SCADA, SQL Server, IoT, and engineering visualization. HTML, CSS, and small vanilla JavaScript modules; no framework or package installation.

## Preview

From this project folder, run:

```powershell
python -m http.server 8765 --bind 127.0.0.1
```

Open http://127.0.0.1:8765. Serve over HTTP rather than opening the HTML as a file so browser modules load correctly. The checked-in index.html is ready to serve without building.

## Content and source files

- `content/portfolio.json`: approved profile, project overview, capabilities, and course information.
- `src/index.template.html`: page structure and navigation.
- `src/components/`: reusable project card and accessible gate diagram.
- `index.html`: generated static output. Edit the content/templates, then rebuild.
- `my-personal-page.css`: base styles, identity, layout, and responsive rules.
- `assets/css/`: project and interactive-lab styles.
- `assets/js/navigation.js`: progressively enhanced mobile navigation.
- `assets/js/engineering-scene.js`: shared SVG/3D controls, loading, and fallback states.
- `assets/js/gate-model.js`: optional procedural Three.js model.

## Rebuild and check

Node.js is needed only when changing content/templates or running checks. No npm dependencies are needed.

```powershell
node scripts/build.mjs
node scripts/build.mjs --check
node scripts/check.mjs
```

The small build script separates data from presentation while producing readable content and native expandable project details that work without JavaScript. There is no production application server, database, or contact-form backend.

## Interactive lab

The gate is an illustrative portfolio demo with simulated values, not an operational interface or hydraulic simulation. It uses a locally available SVG by default. Three.js 0.180.0 is loaded from jsDelivr only after the visitor selects **Explore in 3D**. This optional view requires Internet access and WebGL 2; failures leave the SVG controls available. The module has a 15-second loading timeout and handles context loss. The camera and gate use labeled native range controls, including keyboard input.

Rendering happens on demand, with no continuous animation; hidden/offscreen scenes do not render. Pixel ratio is capped at 1.5. CSS honors reduced motion. Geometry is procedural, so there are no large model downloads or client assets.

Three.js is MIT licensed: https://github.com/mrdoob/three.js/blob/r180/LICENSE

The existing local Inter font is used, removing the previous Google Fonts request. `portrait.webp` is an optimized derivative of the existing portrait; the original image and other existing assets are preserved.

## Content boundaries

The project entry is a combined overview of responsibilities across two projects still in development. It does not invent separate project scopes, delivery results, metrics, or a start date. Public wording uses general water-sector descriptions. Client identities, presentation material, internal addresses, and operational screenshots are not included. Fortinet links point to course information, not personal credential verification. n8n is presented as introductory experience.

## Verification checklist

- Desktop, laptop, tablet, and mobile layouts; no clipped content or horizontal overflow.
- Mobile menu opens/closes, Escape returns focus, and anchor navigation remains available without JavaScript.
- Project details open using Enter/Space; all interactive elements have visible keyboard focus.
- Gate opening, view angle, reset, diagram switching, and loading/error states.
- WebGL unavailable, network/module failure, and JavaScript-disabled alternatives.
- Reduced-motion styles and no automatic 3D animation.
- Local links/assets and existing mailto/social destinations. Sending mail requires a configured mail application.

No deployment or publishing is performed by the build/check scripts.
