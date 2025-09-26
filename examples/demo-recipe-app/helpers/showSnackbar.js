export function showSnackbar(message) {
  const snackbar = document.createElement("div");
  snackbar.className = "snackbar";
  snackbar.textContent = message;

  document.body.appendChild(snackbar);

  // Force reflow so animation can start
  void snackbar.offsetWidth;
  snackbar.classList.add("snackbar--visible");

  // Remove after 3s
  setTimeout(() => {
    snackbar.classList.remove("snackbar--visible");
    setTimeout(() => {
      snackbar.remove();
    }, 300);
  }, 3000);
}