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
