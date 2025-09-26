export function setActiveNav(activeId) {
  const navs = ["home-navigator", "favorites-navigator"];
  navs.forEach(id => {
    const el = document.getElementById(id);
    if (!el) {
      return;
    }
    el.classList.toggle("bottom-nav__btn--active", id === activeId);
  });
}