import { app } from "../app.js";

export function renderEmptyState(container) {
  container.innerHTML = "";

  const emptyState = document.createElement("div");
  emptyState.className = "empty-state";

  const icon = document.createElement("div");
  icon.className = "empty-state__icon";
  const img = document.createElement("img");
  img.src = "./assets/empty-state.png";
  img.alt = "Empty illustration";
  icon.appendChild(img);

  const title = document.createElement("p");
  title.className = "empty-state__title";
  title.textContent =
    app.state.activeReactor.origin === "/favorites"
      ? "No Favorites Yet"
      : "No Recipes Available";

  const text = document.createElement("p");
  text.className = "empty-state__text";
  text.textContent =
    app.state.activeReactor.origin === "/favorites"
      ? "Tap the heart button on a recipe to save it here."
      : "Please check back later or add some recipes.";

  emptyState.appendChild(icon);
  emptyState.appendChild(title);
  emptyState.appendChild(text);

  container.appendChild(emptyState);

  return container;
}