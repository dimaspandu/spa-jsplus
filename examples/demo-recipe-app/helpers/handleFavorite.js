import { app } from "../app.js";
import { favorites } from "../models/index.js";
import { renderEmptyState } from "./renderEmptyState.js";
import { showSnackbar } from "./showSnackbar.js";
import { toggleFavorite } from "./toggleFavorite.js";

export function handleFavorite({
  button,
  card,
  container,
  recipe
}) {
  const wasFav = favorites.includes(recipe.id);
  const hasFav = toggleFavorite(recipe.id, button);

  // Show snackbar message
  if (wasFav) {
    if (app.state.activeReactor.origin === "/favorites") {
      if (!hasFav) {
        return renderEmptyState(container);
      }

      container.removeChild(card);
    }
    showSnackbar(recipe.name + " Removed from favorites");
  } else {
    showSnackbar(recipe.name + " Added to favorites");
  }
}