import { app } from "../app.js";
import {
  favorites,
  recipes
} from "../models/index.js";
import { handleFavorite } from "./handleFavorite.js";
import { renderEmptyState } from "./renderEmptyState.js";

export function renderRecipes(origin) {
  const container = document.createElement("section");
  container.setAttribute("class", origin === "/favorites" ? "favorites" : "home");

  const list = origin === "/favorites" ? recipes.filter(r => favorites.includes(r.id)) : recipes;

  // Empty state
  if (list.length === 0) {
    return renderEmptyState(container);
  }

  // Recipe list
  list.forEach(recipe => {
    const card = document.createElement("div");
    card.className = "recipe-card";

    // Image wrapper
    const imgWrapper = document.createElement("div");
    imgWrapper.className = "recipe-card__img-wrapper";
    imgWrapper.addEventListener("click", () => app.navigatePush(`${origin}?recipeId=${recipe.id}`));

    const img = document.createElement("img");
    img.className = "recipe-card__img";
    img.src = recipe.img;
    img.alt = recipe.name;

    imgWrapper.appendChild(img);
    card.appendChild(imgWrapper);

    // Card content
    const content = document.createElement("div");
    content.className = "recipe-card__content";

    const title = document.createElement("h2");
    title.className = "recipe-card__title";
    title.textContent = recipe.name;

    const btn = document.createElement("button");
    btn.className = "recipe-card__btn";
    btn.textContent = favorites.includes(recipe.id)
      ? "Unfavorite"
      : "Favorite";
    btn.addEventListener("click", () => handleFavorite({
      button: btn,
      card,
      container,
      recipe
    }));

    content.appendChild(title);
    content.appendChild(btn);

    card.appendChild(content);
    container.appendChild(card);
  });

  return container;
}
