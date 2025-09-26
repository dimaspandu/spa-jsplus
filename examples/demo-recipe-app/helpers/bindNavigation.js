export function bindNavigation(app) {
  const homeNav = document.getElementById("home-navigator");
  const favoritesNav = document.getElementById("favorites-navigator");

  if (homeNav) {
    homeNav.onclick = function(event) {
      event.preventDefault();
      app.navigatePush("/");
    };
  }

  if (favoritesNav) {
    favoritesNav.onclick = function(event) {
      event.preventDefault();
      app.navigatePush("/favorites");
    };
  }
}