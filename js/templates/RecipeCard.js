import { htmlToElement } from "../lib/utils.js";

export default class RecipeCard {
  /** @type {Recipe} */
  #recipe;
  /** @type {HTMLElement} */
  #element = null;

  /**
   * @param {Recipe} recipe is a Recipe object from API
   * @return {void}
   */
  constructor(recipe) {
    this.#recipe = recipe;
    this.#initialize();
  }

  #initialize() {
    this.#createRecipeCard();
  }

  #createRecipeCard() {
    const recipeCard = `
      <div class="card shadow-sm h-100 rounded-5 border-0 overflow-hidden">
        <img
          src="assets/images/recipes/${this.#recipe.image}"
          class="card-img-top object-fit-cover recipe-card-img"
          alt="..."
        />
        <div class="card-img-overlay">
          <span
            class="badge rounded-pill text-bg-primary text-black fw-normal position-absolute end-0 mx-4 my-2 px-3 py-2 secondary-bg-color"
            >${this.#recipe.time}min</span
          >
        </div>
        <div class="card-body p-4">
          <h5 class="card-title fw-normal my-2">${this.#recipe.name}</h5>
          <h6
            class="card-subtitle mt-4 mb-3 text-uppercase fw-bold color-light-grey"
          >
            Recette
          </h6>
          <p class="card-text">
            ${this.#recipe.description}
          </p>
          <h6
            class="card-subtitle mt-4 mb-3 text-uppercase fw-bold color-light-grey"
          >
            Ingrédients
          </h6>
          <div class="card-ingredients-container row row-cols-2 g-3"></div>
        </div>
      </div>
    `;
    this.#element = htmlToElement(recipeCard);
    const ingredientsContainer = this.#element.querySelector(
      ".card-ingredients-container"
    );
    const ingredients = this.#recipe.ingredients.map((ingredient) => {
      const ingredientElement = `
        <div class="card-ingredient w-50">
          <p class="card-ingredient-name m-0 fw-medium">
            ${ingredient.ingredient}
          </p>
          <p class="card-ingredient-quantity m-0 color-light-grey">
            ${ingredient.quantity ?? ""} ${ingredient.unit ?? ""}
          </p>
        </div>
      `;
      return htmlToElement(ingredientElement);
    });
    for (const ingredient of ingredients) {
      ingredientsContainer.appendChild(ingredient);
    }
  }

  get recipe() {
    return this.#recipe;
  }

  get element() {
    return this.#element;
  }
}
