import { htmlToElement } from "../lib/utils.js";

export default class RecipeCard {
  #recipe;
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
      <div class="card h-100 rounded-5 border-0 overflow-hidden">
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
          <h5 class="card-title my-2">Limonade de Coco</h5>
          <h6
            class="card-subtitle mt-4 mb-3 text-body-secondary text-uppercase fw-bold"
          >
            Recette
          </h6>
          <p class="card-text">
            ${this.#recipe.description}
          </p>
        </div>
      </div>
    `;
    this.#element = htmlToElement(recipeCard);
  }

  get recipe() {
    return this.#recipe;
  }

  get element() {
    return this.#element;
  }
}
