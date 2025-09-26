import {
  importPlus,
  injectStyle
} from "../helpers/index.js";
import {
  setActiveNav,
  setAnchorHydration,
  setDefaultScroll
} from "../utils/index.js";

export default function singleBuilder(ctx)
{
  // Register builder logic for the single article page
  ctx.builder.future(dispose =>
  {
    // Import the CSS for the article detail page
    importPlus("./styles/single.css").then(injectStyle).then(() => {
      // Dynamically import the HTML template for the article detail page
      importPlus("./pages/single.html").then(html => {
        // Define disposal behavior and set the container to the imported template
        dispose(() => {
          ctx.container = () => html;
        });
      });
    });
  });

  // Hook executed when the single article page is mounted
  ctx.onMeet.set = () =>
  {
    // Reset the page scroll to the default position when entering this view
    setDefaultScroll();

    // Mark "Any" navigation as active (since article detail is not tied to a specific nav link)
    setActiveNav("*");

    // Dynamically import the module for the article detail page
    import("../hydrators/single.js").then(({ default: setSingleHydration }) => {
      // Populate article detail content using hydration logic
      setSingleHydration(ctx);

      // Enable anchor link handling (for navigation within SPA)
      setAnchorHydration();
    });
  };
}
