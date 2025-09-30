# SPA-JSPLUS

SPA-JSPlus is a simple implementation of a **Single Page Application (SPA)** built with **vanilla JavaScript**.
This project is **not a library or framework**, but rather a **pattern/example** that demonstrates how SPA needs can be solved without relying on modern frameworks.

The goals are:

* To inspire developers who still enjoy working with **vanillaJS**.
* To provide a real-world example of how routing, state, and lifecycle management can be achieved with minimal code.
* To be easily adopted or customized for project-specific needs.

---

## Demo: Recipe App

This folder (`examples/demo-recipe-app`) contains a **Recipe Application** built with the SPA-JSPlus pattern.
It demonstrates how to implement routing, modals, and state management in a real-world scenario using **vanilla JavaScript**.

### Features

* **Home Page** → Displays a list of recipes.
* **Favorites Page** → Shows only the recipes marked as favorite.
* **Recipe Details Modal** → Opens when you click a recipe, showing its ingredients and instructions.
* **Favorite/Unfavorite** → Toggle favorite status of each recipe.
* **Bottom Navigation** → Switch between Home and Favorites with active state styling.
* **404 Page** → Displays an error page for unknown routes.

### Screenshot

![Recipe App Screenshot](assets/screenshot.png)

---

## Project Structure

```
├── assets/                # Static assets (images, icons, etc.)
├── dist/                  # Build output (generated after build)
├── helpers/               # Helper modules (modal, rendering, etc.)
├── models/                # Data models
├── spa/                   # Core SPA engine (spa.js, router, etc.)
├── 404.html               # Custom error page
├── app.js                 # Main app entry logic
├── config.json            # Bundle + build + start configuration
├── favorites.html         # Favorites page
├── index.css              # Styles
├── index.html             # Main HTML entry point
├── index.js               # JavaScript entry point
├── run.build.js           # Run build (bundle + copy assets)
├── run.bundle.js          # Only run bundler
├── run.start.js           # Start server for dist/
```

---

## Usage

### Development Mode (Direct HTML)

For quick testing during development, you can skip the build step:

1. Open the file `index.html` inside your editor.  
2. If you’re using **VSCode**, right-click `index.html` → **Open with Live Server**.  
3. The app will run immediately without bundling or running Node.js scripts.  

This mode is recommended for local development and debugging.

---

### Bundle

Generate the bundled JavaScript only (written into `dist/index.js`):

```bash
node run.bundle.js
```

---

### Build

Bundle + copy assets + preprocess files:

```bash
node run.build.js
```

---

### Start Build

Serve the `dist/` directory (production-like mode):

```bash
node run.start.js
```

---

### Build & Start Combined

You can also run build and then start immediately:

```bash
node run.build.js && node run.start.js
```

---

## Example Code

Here is a snippet from `index.js` showing how routes are declared:

```js
import { app } from "./app.js";
import {
  closeModal,
  openModal
} from "./helpers/modal.js";
import { hideTransitionIndicator } from "./helpers/hideTransitionIndicator.js";
import { renderError } from "./helpers/renderError.js";
import { renderRecipes } from "./helpers/renderRecipes.js";
import { setActiveNav } from "./helpers/setActiveNav.js";

// --- Home reactor ---
app.reactor(["", "/", "/home"], function(ctx) {
  // ctx.container is always called again on every route change.
  // If you assign a function, it will re-run every time (no memo).
  // If you assign a plain value or the return of a function,
  // it will be reused (works like memoization).
  ctx.container = function() {
    return renderRecipes("/");
  };

  ctx.onMeet.set = function() {
    document.title = "Recipe App";
    setActiveNav("home-navigator");
    hideTransitionIndicator(); // hide indicator once route is ready

    // If a recipeId query exists, open the modal
    if (ctx.query.recipeId) {
      openModal(parseInt(ctx.query.recipeId));
    } else {
      closeModal();
    }
  };

  // --- endReactor ---
  // Determines if this reactor should immediately clear its history
  // when the user navigates away.
  //
  // - Returning `true` means: "force go(-1)" → the route is temporary
  //   and should be removed from the navigation stack.
  // - Returning `false` means: "stay in history" → normal back/forward
  //   navigation still applies.
  //
  // In this case:
  // - If a modal (recipeId) is open → return false (so user can close modal first).
  // - Otherwise → return true (page can be cleared on exit).
  ctx.endReactor = function() {
    if (ctx.query.recipeId) {
      return false;
    }
    return true;
  };
});

// --- Favorites reactor ---
app.reactor("/favorites", function(ctx) {
  // Same explanation as above for ctx.container
  ctx.container = function() {
    return renderRecipes("/favorites");
  };

  ctx.onMeet.set = function() {
    document.title = "Recipe App - Favorites";
    setActiveNav("favorites-navigator");
    hideTransitionIndicator(); // hide once loaded

    if (ctx.query.recipeId) {
      openModal(parseInt(ctx.query.recipeId));
    } else {
      closeModal();
    }
  };
});

// --- Error reactor (for unknown routes) ---
app.err(function(ctx) {
  // Here container is set only once and reused (memoized),
  // because it's assigned the return value directly.
  ctx.container = renderError();

  ctx.onMeet.set = function() {
    document.title = "Recipe App - Page Not Found";
    setActiveNav(null);
    hideTransitionIndicator(); // hide once loaded
  };
});

// --- Transition notifier ---
// Triggered whenever navigation/transition happens.
// We use this to show a sticky indicator at the bottom of the screen.
app.addNotifier("transition", function() {
  const el = document.getElementById("transition-indicator");
  if (el) {
    el.classList.remove("hidden"); // show indicator during transition
  }
});

// --- Start app routing ---
app.tap();
```

---

## Live Demo

Try the live version here:
[https://spademorecipeapp.netlify.app/](https://spademorecipeapp.netlify.app/)

---

## Notes

* The SPA core implementation is located at: `spa.js`.
* This project is licensed under **MIT** → free to study, modify, and use.
* It is not an official library, but rather a pattern & experiment for vanillaJS lovers.

---

## License

MIT © dimaspandu
