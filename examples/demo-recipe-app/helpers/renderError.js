export function renderError() {
  const container = document.createElement("section");
  container.setAttribute("class", "not-found");
  container.innerHTML = (`
    <h1>404</h1>
    <p>Sorry, the page you are looking for could not be found.</p>
  `);
  return container;
}