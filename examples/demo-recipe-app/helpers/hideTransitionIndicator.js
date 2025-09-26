// Hides the transition indicator once a route is fully ready (onMeet).
export function hideTransitionIndicator() {
  const el = document.getElementById("transition-indicator");
  if (el) {
    setTimeout(() => {
      el.classList.add("hidden"); // fade out after 300ms
    }, 300); // small delay before fade-out starts
  }
}