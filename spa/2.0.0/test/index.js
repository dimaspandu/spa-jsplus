import Spa from "../src/index.js";

// ---------------------------------------------------------------------------
// SPA Initialization Options
//
// Available options:
// - baseUrl: string     → (optional) Base URL if the app is hosted in a subdirectory.
// - dividerPath: string → (optional) Change the path divider (default is "/").
// - hashtag: boolean    → (optional) Use hashtag mode if the server does not support
//                         the HTML5 History API (direct URL access would cause 404).
// - hostdom: node       → The container DOM element where rendered views will be injected.
//
// Example URL behaviors:
// - History API (hashtag: false, baseUrl = "http://localhost:4500")
//   → http://localhost:4500/         (Home)
//   → http://localhost:4500/about    (About)
//
// - Hash mode (hashtag: true, dividerPath: "#")
//   → http://127.0.0.1:5500/test.html#/        (Home)
//   → http://127.0.0.1:5500/test.html#/about   (About)
//
// - Hash mode with local file system
//   → file:///E:/self-improvement/something/spa-jsplus/test.html#/        (Home)
//   → file:///E:/self-improvement/something/spa-jsplus/test.html#/about   (About)
//
// In this example we use a self-invoking function (IIFE) to return different
// configurations depending on environment:
//
// - If running locally (http://localhost:4500), we explicitly set `baseUrl`
//   and disable hashtag mode (`hashtag: false`) because our dev server is
//   configured with a fallback for direct routes.
// - In production (or any other origin), we only specify `hostdom` and rely
//   on default behavior (which typically means hashtag mode is allowed).
// ---------------------------------------------------------------------------
const app = new Spa({
  hostdom: document.getElementById("output")
});

// Dynamically build navigation menu
(function() {
  [
    { path: "/", text: "Home" },
    { path: "/about", text: "About" },
    { path: "/remote", text: "Remote" }
  ].forEach(menu => {
    const menuElement = document.createElement("a");
    menuElement.setAttribute("href", menu.path);
    menuElement.setAttribute("id", `menu-${menu.text.toLowerCase()}`);
    menuElement.innerText = menu.text;
    
    // Prevent default navigation and use app.navigatePush
    // NOTE: Besides navigatePush, there are also:
    // - app.navigateReplace(path): replace current history entry
    // - app.navigateClear(path): clear entire history stack
    menuElement.onclick = function(e) {
      e.preventDefault();
      app.navigatePush(menu.path);
    };
    
    document.getElementById("menu").appendChild(menuElement);
  });
})();

// Utility: set document title
function setTitle(title) {
  document.title = title;
}

// Utility: highlight active menu item
function setActiveMenu(targetMenuId) {
  const menuElement = document.getElementById("menu");
  menuElement.childNodes.forEach(childMenu => {
    if (childMenu.getAttribute("id") === targetMenuId) {
      childMenu.style.color = "green";
    } else {
      childMenu.style.color = "unset";
    }
  });
}

// Utility: create a container element for page content
function generateContainer(innerHTML) {
  const container = document.createElement("div");
  container.innerHTML = innerHTML;
  return container;
}

/**
 * ------------------------
 * ROUTE DEFINITIONS
 * ------------------------
 */

// Home page
app.reactor(["", "/", "/home"], function(ctx) {
  ctx.container = () => generateContainer(`
    <h1 id="greetings">Welcome to the Home Page!</h1>
    <form id="form-search">
      <input id="form-search__input" placeholder="Type anything..." type="text" />
      <button type="submit">Search</button>
    </form>
    <hr />
    <button id="button-next" type="button">GO TO THE END</button>
  `);

  // Actions when entering the page
  ctx.onMeet.set = () => {
    setTitle("SPA - Home!");
    setActiveMenu("menu-home");

    // Handle form submission
    const formSearch = document.getElementById("form-search");
    if (formSearch) {
      formSearch.onsubmit = (e) => {
        e.preventDefault();
        const formSearchInput = document.getElementById("form-search__input");
        app.navigatePush(`/search/${formSearchInput.value}`);
      };
    }

    // Handle "next" button
    const buttonNext = document.getElementById("button-next");
    if (buttonNext) {
      // Example: navigate to /end with query string (?arrivalTime=...)
      // The query string is automatically parsed and available via ctx.query on target page
      buttonNext.onclick = () =>
        app.navigatePush(`/end?arrivalTime=${new Date().toTimeString()}`);
    }
  };

  // Actions when returning back to this page
  ctx.onComeback.set = () => {
    const greetings = document.getElementById("greetings");
    if (greetings) {
      greetings.innerText = "Welcome back to the Home Page!";
    }
  };
});

// End page
app.reactor("/end", function(ctx) {
  ctx.container = () => generateContainer(`
    <h1>Welcome to the end of the page!</h1>
    <h2>You can't back anymore...</h2>
    <!-- Accessing the query string parameter from ctx.query -->
    <h3>Your arrival time is: ${ctx.query.arrivalTime}</h3>
    <hr />
    <button id="button-next" type="button">GO TO THE HOME</button>
  `);

  ctx.onMeet.set = () => {
    setTitle("SPA - End!");
    setActiveMenu("");

    // Handle "next" button
    const buttonNext = document.getElementById("button-next");
    if (buttonNext) {
      buttonNext.onclick = () =>
        // Navigate to "/home" with a *new* query string parameter
        // Important: each route manages its own query string.
        // So when you go from "/end?arrivalTime=..." to "/home?arrivalTime=...",
        // the "/home" route will have its own query value, not inherit the old one.
        app.navigatePush(`/home?arrivalTime=${new Date().toTimeString()}`);
    }
  };

  // Immediately clear history when leaving
  ctx.onExit.delay = -1;
});

// About page
app.reactor("/about", function(ctx) {
  ctx.container = () => generateContainer(`
    <h1>Welcome to the About Page!</h1>
    <button id="button-next" type="button">GO TO DETAILS</button>
  `);

  ctx.onMeet.set = () => {
    setTitle("SPA - About!");
    setActiveMenu("menu-about");

    const buttonNext = document.getElementById("button-next");
    if (buttonNext) {
      buttonNext.onclick = () => app.navigatePush("/about/details");
    }
  };

  // Nested route: About Details
  app.reactor("/about/details", function(ctx) {
    ctx.container = generateContainer(`
      <h1>Welcome to the About Details Page!</h1>
      <hr />
      <button id="button-back" type="button">BACK</button>
    `);

    ctx.onMeet.set = () => {
      setTitle("SPA - About Details!");
      setActiveMenu("menu-about");

      const buttonBack = document.getElementById("button-back");
      if (buttonBack) {
        buttonBack.onclick = () => window.history.back();
      }
    };
    
    // ----------------------------------------------------------
    // IMPORTANT:
    // This route (/about/details) is dynamically built only
    // when the user first visits /about and clicks "GO TO DETAILS".
    // It cannot be accessed directly via browser URL input.
    // Direct access will trigger the SPA 404 / "page not found"
    // handler because the route has not been established yet.
    // ----------------------------------------------------------
  });
});

// Remote page (loads external script dynamically)
app.reactor("/remote", function(ctx) {
  const loader = document.createElement("script");
  loader.setAttribute("src", `./test/microfrontend.js`);
  document.head.appendChild(loader);

  // Load script asynchronously
  ctx.builder.future(function(dispose) {
    loader.onload = function() {
      // Apply once loaded
      dispose(function snapshot() {
        ctx.container = () => generateContainer(`
          <h1>${ctx.params.message}</h1>
        `);
      });
    };
  });

  ctx.onMeet.set = () => {
    setTitle("SPA - Remote!");
    setActiveMenu("menu-remote");
  };
});

// Search page (with route params and blocking behavior)
app.reactor("/search/{query}", function(ctx) {
  let blocked = false;

  ctx.container = () => generateContainer(`
    <h1>Are you searching for "${ctx.params.query}"?</h1>
    <button id="button-blck" type="button">BLOCK</button>
    <hr />
    <button id="button-next" type="button">GO TO SOMEWHERE</button>
    <hr />
    <button id="button-back" style="position: absolute; z-index: 9999;" type="button">BACK</button>
    <div id="blocker" style="align-items: center; background: rgba(255, 255, 255, .875); bottom: 0; display: none; justify-content: center; left: 0; position: fixed; right: 0; top: 0;">
      <i>Wait for 5 seconds... (You can't go back)</i>
    </div>
  `);

  ctx.onMeet.set = () => {
    setTitle("SPA - Search!");
    setActiveMenu("");

    // Handle block button (prevent back navigation temporarily)
    const buttonBlock = document.getElementById("button-blck");
    if (buttonBlock) {
      buttonBlock.onclick = () => {
        const blocker = document.getElementById("blocker");
        if (blocker) {
          blocked = true;
          blocker.style.display = "flex";
          setTimeout(() => {
            blocker.style.display = "none";
            blocked = false;
          }, 5000);
        }
      };
    }

    // Navigate forward
    const buttonNext = document.getElementById("button-next");
    if (buttonNext) {
      buttonNext.onclick = () => app.navigatePush("/somewhere");
    }

    // Go back
    const buttonBack = document.getElementById("button-back");
    if (buttonBack) {
      buttonBack.onclick = () => window.history.back();
    }
  };

  // Prevent exit if "blocked" is active
  ctx.onExit.set = () => {
    if (blocked) {
      return false;
    }
  };
});

// Error / 404 page
app.err(function(ctx) {
  ctx.container = () => generateContainer(`
    <h1>Page not found!</h1>
    <button id="button-back" type="button">BACK</button>
  `);

  ctx.onArrive.set = () => {
    setTitle("SPA - 404!");
    setActiveMenu("");

    const buttonBack = document.getElementById("button-back");
    if (buttonBack) {
      buttonBack.onclick = () => window.history.back();
    }
  };

  // Delay before exit (showing message for 1.5s)
  ctx.onExit.delay = 1500;
  ctx.onExit.set = () => {
    const buttonBack = document.getElementById("button-back");
    if (buttonBack) {
      buttonBack.innerHTML = "<i>Heading back in 1.5 seconds...</i>";
    }
  };
});

// ---------------------------------------------------------------------------
// Notifier (Event Hooks)
//
// This object contains callback functions ("hooks") that are sealed using
// Object.seal so they cannot be extended with new properties at runtime.
// Developers can override these functions to add custom logic at different
// points in the routing lifecycle.
//
// Available hooks:
// - transition: called during a general route transition
// - meet: called when entering a new route before rendering
// - arrive: called after a route has been successfully rendered
// - exit: called when leaving a route
// - comeback: called when returning to a previously visited route
//
// NOTE: There could be other instructions/hooks depending on project needs,
// but here we keep it minimal and sealed for consistency.
//
// Example usage:
// app.addNotifier("arrive", function (ctx) {
//   console.log("Arrived at route:", ctx.path);
// });
//
// app.addNotifier("exit", function (ctx) {
//   console.log("Exiting route:", ctx.path);
// });
//
// ---------------------------------------------------------------------------

// Show transition indicator when switching pages
app.addNotifier("transition", function() {
  var transistor = document.getElementById("transistor");
  if (transistor) {
    transistor.style.display = "block";
    // Delay hiding for smooth effect
    setTimeout(function() {
      transistor.style.display = "none";
    }, 1000);
  }
});

// Hide transition indicator after page is fully loaded
app.addNotifier("meet", function() {
  var transistor = document.getElementById("transistor");
  if (transistor) {
    // Delay hiding for smooth effect
    setTimeout(function() {
      if (transistor.style.display !== "none") {
        transistor.style.display = "none";
      }
    }, 1000);
  }
});

// Start the SPA (enable routing)
app.tap();

// Expose App to window
window.app = app;