import { favorites } from "../models/index.js";

export function toggleFavorite(id, btn) {
  // Toggle the id in favorites array
  if (favorites.includes(id)) {
    const index = favorites.indexOf(id);
    if (index > -1) {
      favorites.splice(index, 1);
    }
    btn.textContent = "Favorite";
  } else {
    favorites.push(id);
    btn.textContent = "Unfavorite";
  }

  return favorites.length > 0;
}