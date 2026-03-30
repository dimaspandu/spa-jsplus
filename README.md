# SPA-JSPLUS

SPA-JSPlus is an experimental **Single Page Application (SPA) engine** written in **vanilla JavaScript**, focused on **clarity, portability, and control**.

**No npm, no `node_modules`.** This repo intentionally avoids dependency managers and build stacks. Everything runs with plain Node.js and native browser APIs.

This repository is **not a framework and not a library in the traditional sense**. Instead, it is a **collection of evolving SPA engines (by version)** that demonstrate how modern SPA behavior can be implemented with minimal abstractions and without dependency-heavy ecosystems.

As of now, development and documentation are **primarily focused on SPA v2.0.4**, which represents the most complete and opinionated iteration of the project in terms of execution workflow.

---

## Project Philosophy

SPA-JSPlus exists as a counterpoint to modern frontend complexity:

* No mandatory build tools
* No dependency graphs
* No hidden lifecycle magic
* No framework lock-in

Everything is designed to be:

* **Readable** (you can understand the core in one sitting)
* **Hackable** (easy to modify for project-specific needs)
* **Portable** (works in local files, static hosting, or bundled output)

---

## Repository Structure

```
SPA-JSPLUS/
+-- bundler/        # Optional bundler for CDN / production builds
+-- doc/            # Diagrams & documentation assets
+-- examples/       # Real demo applications
+-- spa/            # SPA engines by version
|   +-- 1.0.0
|   +-- 1.0.1
|   +-- 2.0.0
|   +-- 2.0.1
|   +-- 2.0.2
|   +-- 2.0.3
|   +-- 2.0.4   <- actively documented & recommended
+-- CHANGELOG.md
+-- LICENSE
+-- README.md       # (this file)
```

> ⚠️ Earlier versions are kept for **learning, comparison, and historical context**.
> New users should start with **`spa/2.0.4`**.

---

## Current Recommended Version: v2.0.4

**SPA v2.0.4** is the most mature iteration and introduces a clearer execution model between:

* **Native ESM development mode** (`run.dev.js`)
* **Bundled production mode** (`run.start.js`)

Key highlights in v2.0.4:

* Explicit **reactor-based routing model**
* Stack-inspired lifecycle hooks (`onMeet`, `onArrive`, `onExit`, `onComeback`)
* Route-level error handling (error reactors)
* Async route builders & delayed execution
* Clear separation between **dev limitations** (CORS, native modules)
  and **production behavior** (bundled, resolved imports)

Full documentation and examples live here:

👉 **[`spa/2.0.4/README.md`](./spa/2.0.4/README.md)**

---

## Quickstart (No npm)

Run these commands from `spa/2.0.4`.

These scripts are ES modules. If your Node treats `.js` as CommonJS, rename the `run.*.js` files to `.mjs` (recommended) or run from a directory that is already ESM-enabled. This repo avoids `package.json` by default.

### Dev Mode

```bash
node run.dev.js
```

Open: http://localhost:2020

Note: Dev mode in v2.0.4 adds a focus-based auto reload when files change.

### Start Mode

```bash
node run.start.js
```

Open: http://localhost:2121

### Bundle Mode

```bash
node run.bundle.js
```

Output: `cdn/djs.prod.js`

---

## Features (v2.x)

* Vanilla JavaScript only (no dependencies)
* History API & Hash-based routing
* Reactor-based route definitions
* Lifecycle hooks with delay control
* Stack-based navigation semantics
* Query string & path parameter parsing
* Error reactors (route-level fallback)
* Works in:

  * Local filesystem
  * Static hosting
  * Bundled CDN output

---

## Demos

Live demos built using SPA-JSPlus:

* **Core SPA Demo**
  [https://spajsplus.netlify.app/](https://spajsplus.netlify.app/)

* **Demo Blog (Builder-based SPA)**
  [https://spademoblog.netlify.app/](https://spademoblog.netlify.app/)

* **Demo Recipe App**
  [https://spademorecipeapp.netlify.app/](https://spademorecipeapp.netlify.app/)

These demos intentionally showcase:

* History vs Hash routing
* Lifecycle transitions
* Error handling
* Differences between dev & production execution

---

## Bundler & CDN Usage

SPA-JSPlus **does not require a bundler** when running in **native ESM browser mode** (development / learning).

However, for **bundled production output** (single-file, CDN-friendly, no ESM/CORS issues),  
this project **intentionally uses a custom bundler**:

### ngapack

> **ngapack** is a **native JavaScript module bundler without `node_modules`**.

🔗 https://github.com/dimaspandu/ngapack

ngapack is used **only for bundling**, not for development, and aligns with SPA-JSPlus philosophy:

* No dependency tree
* No framework-specific assumptions
* No opaque build steps
* Minimal, inspectable output

The `bundler/` directory provides an **optional build machine** powered by ngapack to generate a **single-file browser-ready bundle**.

This is useful when:

* You want zero ESM / CORS issues
* You want a single `<script>` include
* You are deploying to restrictive or legacy environments

Bundled output exposes the engine as:

```js
window.Spa
```

Bundler usage and details are documented inside each SPA version (latest: v2.0.4).

---

## Who Is This For?

SPA-JSPlus is ideal for:

* Developers who enjoy **understanding the whole system**
* Learning how SPAs work under the hood
* Lightweight internal tools
* Educational demos
* Controlled environments (kiosks, embedded UIs, static hosting)

It is **not** trying to replace React, Vue, or Svelte.
It exists to explain *why* those frameworks work.

---

## Version Index

* [v1.0.0](./spa/1.0.0/) – Early CDN-style SPA
* [v1.0.1](./spa/1.0.1/)
* [v2.0.0](./spa/2.0.0/) – Portable engine refactor
* [v2.0.1](./spa/2.0.1/)
* [v2.0.2](./spa/2.0.2/)
* [v2.0.3](./spa/2.0.3/)
* **[v2.0.4](./spa/2.0.4/)** – Current, recommended

---

## Testing

There is no automated test runner in this repo. Validation is manual:

1. Run Dev mode and confirm the app loads and routing works.
2. Run Start mode and confirm the bundled output behaves the same.
3. Run Bundle mode and confirm `cdn/djs.prod.js` is produced and works when included via `<script>`.

---

## License

MIT © dimaspandu







