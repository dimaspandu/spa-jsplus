# SPA-JSPLUS v2.0.3

SPA-JSPlus is a **vanilla JavaScript Single Page Application (SPA) engine** designed as a **reference implementation**, not a framework.

This project demonstrates how a modern SPA can be built using **native browser APIs**, **ES modules**, and a **minimal custom bundler**, without relying on frameworks like React, Vue, or Angular.

> SPA-JSPlus focuses on **clarity, control, and portability**, not abstraction.

---

## Philosophy

* ❌ Not a framework

* ❌ Not opinionated

* ❌ No runtime dependencies

* ✅ Vanilla JavaScript only

* ✅ Explicit routing & lifecycle control

* ✅ Works as **native ESM** or **single-file CDN bundle**

* ✅ Designed to be **copied, modified, and embedded**

---

## Key Concepts

* SPA routing without frameworks
* Stack-based navigation model
* Explicit lifecycle hooks
* Works in:

  * local filesystem
  * development server
  * production server
  * CDN `<script>` usage

---

## Features

* Lightweight, zero external dependencies
* History API **and** Hash mode routing
* Route definition via `reactor()`
* Lifecycle hooks:

  * `onMeet`
  * `onArrive`
  * `onExit`
  * `onComeback`
* Query string & path parameter support
* Transition notifier system
* Supports:

  * native ESM development
  * bundled production output
  * global CDN usage

---

## What’s New in v2.0.3

### 🔹 New Build & Execution Workflow

Version **2.0.3** introduces a **clear separation of execution modes**:

| Mode       | Purpose                       |
| ---------- | ----------------------------- |
| **Dev**    | Native ESM, no bundling       |
| **Start**  | Bundled output, local preview |
| **Bundle** | Single-file CDN distribution  |

This makes SPA-JSPlus usable as:

* a development playground
* a production-ready SPA
* a reusable CDN runtime

---

### 🔹 Dev Mode (Native ESM)

Run SPA-JSPlus directly in the browser **without bundling**:

```bash
node run.dev.js
```

* Serves the `src/` directory
* Uses browser-native ES modules
* Ideal for:

  * debugging
  * rapid iteration
  * understanding module boundaries

Entry HTML:

```html
<script type="module" src="./index.test.js"></script>
```

---

### 🔹 Start Mode (Bundled Preview)

Bundle the application first, then serve the result:

```bash
node run.start.js
```

Flow:

1. Bundle `src/pre-index.test.js`
2. Emit to `dist/index.test.js`
3. Serve the `dist/` directory

Use this to:

* test real production output
* validate bundled behavior
* simulate deployment locally

---

### 🔹 Bundle Mode (CDN Build)

Generate a **single-file production bundle**:

```bash
node run.bundle.js
```

Output:

```
cdn/djs.prod.js
```

This file:

* is minified
* has no module imports
* can be loaded directly via `<script src>`

---

## CDN Usage Example

```html
<script src="djs.prod.js"></script>
<script>
  const app = new window.Spa();

  app.reactor("/", (ctx) => {
    ctx.container = "<h1>Hello from CDN build</h1>";
  });

  app.err((ctx) => {
    ctx.container = "<h1>404</h1>";
  });

  app.tap();
</script>
```

Notes:

* No `import` / `require`
* Global exposure via `window.Spa`
* Suitable for legacy or non-module environments

---

## Routing Basics

Register routes using `reactor()`:

```js
app.reactor("/about", (ctx) => {
  ctx.container = "<h1>About Page</h1>";
});
```

### `ctx.container` accepts:

1. **String** → rendered as HTML (`innerHTML`)
2. **Node** → DOM node
3. **Function** → returns string or Node (evaluated per visit)

---

## Navigation API

```js
app.navigatePush("/about");
app.navigateReplace("/about");
app.navigateClear();
```

---

## Lifecycle Hooks

SPA-JSPlus uses a **stack-based routing model**.

### Hooks

* `onMeet` → runs every time route becomes active
* `onArrive` → runs only on first entry
* `onExit` → runs before leaving the route
* `onComeback` → runs when returning to a previous route

### Stack Behavior

* **Push** → `onMeet` + `onArrive`
* **Pop** → `onExit` + `onComeback`
* **Revisit** → `onMeet`

---

### Hook Configuration

Each hook has:

* `.set` → logic to execute
* `.delay` → delay in milliseconds

```js
ctx.onMeet.set = () => {
  console.log("entered");
};

ctx.onMeet.delay = 500;
```

---

### Special Behavior: `ctx.endReactor`

Controls history behavior on exit:

```js
ctx.endReactor = true;
```

Or dynamically:

```js
ctx.endReactor = () => ctx.params.force === "1";
```

If `onExit.set` returns `false`, navigation is blocked.

---

## Routing Modes

* **History API**

  * Clean URLs: `/about`
* **Hash Mode**

  * Fallback: `#/about`
  * Automatically used if History API is unavailable

---

## Query Strings & Params

```js
/search/{q}?page=2
```

Access via:

```js
ctx.params.q
ctx.query.page
```

---

## Project Structure (v2.0.3)

```
spa/2.0.3
├─ src/            # ESM source
├─ dist/           # Bundled preview output
├─ cdn/            # Single-file CDN build
├─ run.dev.js      # Native ESM dev server
├─ run.start.js    # Bundle + serve dist
├─ run.bundle.js   # CDN bundler
```

---

## Notes

* Core SPA logic lives in `src/spa.js`
* Designed as:

  * learning material
  * reference architecture
  * experimental SPA engine
* Free to copy, modify, and embed

---

## License

MIT © dimaspandu
