# SPA-JSPLUS

SPA-JSPlus is a simple implementation of a **Single Page Application (SPA)** built with **vanilla JavaScript**.  
This project is **not a library or framework**, but rather a **pattern/example** that demonstrates how SPA needs can be solved without relying on modern frameworks.  

The goals are:  
- To inspire developers who still enjoy working with **vanillaJS**.  
- To provide a real-world example of how routing, state, and lifecycle management can be achieved with minimal code.  
- To be easily adopted or customized for project-specific needs.  

---

## Features

- Simple and lightweight, no external dependencies  
- Support for both History API and Hash mode routing  
- Easy-to-use API for defining routes  
- Lifecycle hooks: `onMeet`, `onArrive`, `onExit`, `onComeback`  
- Query string and parameter support  
- Transition notifier system  
- Works in local file system and production servers  

---

## What's New in v2.0.0

This release is a major step forward compared to `v1.x.x`.  
The core idea remains **vanilla-first**, but the codebase is now refactored to be more modular and portable:

- **Modular ESM structure**  
  The source code has been split into multiple files under `src/` (e.g. `prototypes/`, `helpers/`, `utils/`).  
  Each feature is encapsulated in its own module and re-exported through the main `spa.js`.  
  This makes the system easier to maintain and extend.

- **Portable by design**  
  You can now use SPA-JSPlus in multiple environments:
  - As a plain `<script type="module">` in a modern browser (no bundler required).  
  - Imported into projects that use bundlers such as **Webpack**, **Vite**, or **Rollup**.  
  - Still fully usable in **vanilla-only** setups without Node.js or npm.  

- **Improved compatibility**  
  The modular design ensures that the SPA engine works consistently whether you run it directly from the file system, through a dev server, or inside a bundled application.  

- **Cleaner organization**  
  Internal methods (like prototypes, helpers, and utils) are separated for clarity.  
  This makes it easier to explore the codebase, debug, or customize only the parts you need.

- **Optimized navigation loop**  
  Navigation blockers now use a safer interval + timeout guard, avoiding infinite loops and improving overall performance.  

- **Optimized route matching**  
  The route resolver (`navigator`) now uses regex compilation with param keys caching for faster lookups, reducing overhead on repeated navigations.  

- **Server.js fix for History API**  
  Built-in server now properly serves `test.html` for unknown routes, while keeping correct `type="module"` script resolution. This ensures clean URLs like `/search/term` work without 404 or MIME errors.  

- **New unit-style test file**  
  A simple test script (`test/test-navigator-reactor.js`) is included to verify reactor registration and navigator resolution (with PASS/FAIL output in Node.js console).  

- **All features from 1.x.x are preserved**  
  Including auto-detection for hashtag mode, smarter `baseUrl` and `dividerPath`, query string handling, and navigation isolation.
  
- **CDN build support**  
  Each version now ships with a `bundle.js` script that can generate a ready-to-use CDN file.  
  Run `node spa/2.0.0/bundle.js` and it will produce `spa/2.0.0/cdn/amd.prod.js`.  
  This file is a minified, browser-ready build exposing `window.Spa`, so it can be used directly in a `<script>` tag without any bundler.

---

## How to Run

### 1. Using the built-in Node.js server
Navigate into the version folder:
```bash
cd spa/2.0.0
node server.js
```

Or run directly with relative path:
```bash
node spa/2.0.0/server.js
```

Access in browser:
- http://localhost:4500/
- http://localhost:4500/about


### 2. Using Live Server extension (IDE)
If you’re using VS Code / IDEA, right click on `test.html` → **Open with Live Server**.  
The URL usually looks like:
- http://127.0.0.1:5500/test.html#/
- http://127.0.0.1:5500/test.html#/about

---

## How It Works

### Routing
SPA-JSPlus uses the `reactor()` method to register routes.

```js
app.reactor("/about", function(ctx) {
  // Important note about ctx.container assignment:
  //
  // - If you assign a plain string (like below), the SPA engine will render
  //   the string as-is. That means "<h1>About Page</h1>" will literally show
  //   up as text, not as an <h1> element.
  //
  //   Example (NOT what you want):
  //   ctx.container = "<h1>About Page</h1>";
  //
  // - To render actual HTML nodes, you should wrap the string into a container
  //   element first. For example, using a helper function:
  //
  //     function generateContainer(innerHTML) {
  //       const container = document.createElement("div");
  //       container.innerHTML = innerHTML;
  //       return container;
  //     }
  //
  //   Then assign:
  //     ctx.container = generateContainer("<h1>About Page</h1>");
  //
  //   This way, the DOM will contain a proper <h1> element.
  //
  // - Alternatively, you can build elements manually:
  //     const el = document.createElement("h1");
  //     el.innerText = "About Page";
  //     ctx.container = el;
  //
  // - ctx.container accepts either:
  //   1) A **Node** (single element or container).
  //   2) A **function** that returns a Node/string. If a function is used,
  //      it will be called every time the route is visited → always fresh.
  //   3) A **string** → rendered as raw text only (not parsed as HTML).
  //
  // - If you pass a Node (but not a function), it will be "memoized"
  //   and reused every time the route is shown. That’s efficient, but
  //   it also means you can’t reattach new event listeners unless you
  //   manage them via lifecycle hooks (like ctx.onMeet).
  //
  ctx.container = "<h1>About Page</h1>";
});
```

### Navigation
Navigate using:
```js
app.navigatePush("/about");
app.navigateReplace("/about");
app.navigateClear();
```

### Lifecycle Hooks

Each route supports simple lifecycle hooks.\
Conceptually, the routing system works like a **stack data structure**:

-   `onMeet` → executed **every time** entering the route, whether it is
    newly pushed into the stack or re-entered after the next stack has
    been popped.\
-   `onArrive` → executed **only when** the route is first pushed onto
    the stack (new arrival).\
-   `onExit` → executed **before leaving** the route, when it is about
    to be popped from the stack.\
-   `onComeback` → executed when returning to a previously visited
    route, i.e., after the next stack is popped.

#### Behavior Summary (stack analogy)

-   **Push (new route)** → `onMeet` + `onArrive`\
-   **Pop (go back)** → `onExit` (on current route) + `onComeback` (on
    previous route)\
-   **Revisit** → `onMeet` (always runs)

#### `set` and `delay`

Each lifecycle hook has two properties:

-   **`.set`** → function to define what happens in that lifecycle.\
    Default is an empty no-op function.

    Example:

    ``` js
    // @override
    ctx.onMeet.set = function() {
      // write code here
    };
    ```

-   **`.delay`** → integer value in milliseconds to delay execution.\
    Default = `0` (no delay).

    Example:

    ``` js
    ctx.onMeet.delay = 1500; // 1500 ms delay
    ```

------------------------------------------------------------------------

#### Special behaviors

-   If `.delay = -1` on **onExit**, the route will exit immediately and
    the history state will be cleared, simulating a "hard exit" (like
    closing the app).

-   If `.set` returns `false` on **onExit**, it will **block navigation
    back**.

    Example:

    ``` js
    ctx.onExit.set = () => false; // prevent leaving this route
    ```

    This is useful when the route is in the middle of a process (e.g.,
    loading) and you want to prevent the user from going back until it
    is safe.

---

### Hashtag mode vs History API
- If the server does not support the History API → automatically uses hashtag mode (`#/about`).  
- If the server supports History API → clean URLs like `/about` can be used.  

---

### Query String & Params
Supports parsing params (`/search/{q}`) and query strings (`/end?arrivalTime=10:00`).  

Access them via:
```js
ctx.params.q
ctx.query.arrivalTime
```

---

## SPA-JSPlus (CDN Build)

This folder contains the **CDN build workflow** for SPA-JSPlus v2.0.0.  
It allows you to generate a single-file bundle that can be used directly in browsers without ES modules.

### How to Generate

Run the bundler script:

```bash
cd spa/2.0.0
node bundle.js
```

This will output:

```
spa/2.0.0/cdn/amd.prod.js
```

### Usage in Browser

Simply include the generated file in your HTML:

```html
<script src="./spa/2.0.0/cdn/amd.prod.js"></script>
<script>
  // Access Spa from global scope
  const app = new window.Spa();

  app.reactor("/", (ctx) => {
    ctx.container = () => {
      const component = document.createElement("div");
      component.innerHTML = "<h1>Hello from CDN build!</h1>";
      return component;
    };
  });

  app.tap();
</script>
```

### Notes

- The generated file is already **minified** and optimized.  
- The library is exposed globally as `window.Spa`.  
- No `import` or `require` statements are needed.  
- Suitable for hosting in your own `/cdn` folder or deploying to a public CDN.

---

## Live Demo

Try the live version here:  
[https://spajsplus.netlify.app/](https://spajsplus.netlify.app/)

This demo shows how routes work with both the History API and Hash Mode.

---

## Notes
- The SPA core implementation is located at: `spa.js`.  
- This project is licensed under **MIT** → free to study, modify, and use.  
- It is not an official library, but rather a pattern & experiment for vanillaJS lovers.  

---

## License
MIT © dimaspandu