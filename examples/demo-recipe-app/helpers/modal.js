import recipes from "../models/recipes.js";

let modal = null;

/**
 * Create modal container if it doesn't exist
 */
function createModal() {
  modal = document.createElement("div");
  modal.id = "recipe-modal";
  modal.style.display = "none";
  document.body.appendChild(modal);
}

/**
 * Close modal with animation and remove from DOM
 */
export function closeModal() {
  if (modal) {
    modal.classList.add("closing"); // trigger animation
    modal.addEventListener(
      "animationend",
      () => {
        if (modal && modal.parentNode) {
          modal.parentNode.removeChild(modal); // remove from DOM
        }
        modal = null; // reset reference
      },
      { once: true }
    );
  }
}

export function openModal(id) {
  if (!modal) {
    createModal();
  }

  const recipe = recipes.find((r) => r.id === id);
  if (!recipe) {
    return;
  }

  modal.innerHTML = "";

  // === Top App Bar ===
  const appBar = document.createElement("div");
  appBar.className = "modal-appbar";

  const backBtn = document.createElement("button");
  backBtn.className = "modal-back";
  backBtn.innerHTML = `
    <svg width="24" height="24" viewBox="0 0 512 512">
      <polyline points="328 112 184 256 328 400" 
        style="fill:none;stroke:#000;stroke-linecap:round;stroke-linejoin:round;stroke-width:48px"/>
    </svg>
  `;
  backBtn.onclick = () => window.history.back();
  appBar.appendChild(backBtn);

  const appBarTitle = document.createElement("span");
  appBarTitle.textContent = recipe.name;
  appBar.appendChild(appBarTitle);

  // === Content body ===
  const content = document.createElement("div");
  content.className = "modal-body";

  // Image wrapper (16:9 ratio)
  const imgWrapper = document.createElement("div");
  imgWrapper.className = "modal-imgwrap";
  const img = document.createElement("img");
  img.src = recipe.img;
  img.alt = recipe.name;
  imgWrapper.appendChild(img);
  content.appendChild(imgWrapper);

  // Ingredients
  const ingredientsTitle = document.createElement("h3");
  ingredientsTitle.textContent = "Ingredients";
  content.appendChild(ingredientsTitle);

  const ul = document.createElement("ol");
  for (const ingredient of recipe.ingredients) {
    const li = document.createElement("li");
    li.textContent = ingredient;
    ul.appendChild(li);
  }
  content.appendChild(ul);

  // Instructions
  const instrTitle = document.createElement("h3");
  instrTitle.textContent = "Instructions";
  content.appendChild(instrTitle);

  const instr = document.createElement("p");
  instr.textContent = recipe.instructions;
  content.appendChild(instr);

  // Put everything together
  modal.appendChild(appBar);
  modal.appendChild(content);

  // Show with animation
  modal.style.display = "flex";
}
