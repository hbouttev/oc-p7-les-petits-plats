import { htmlToElement } from "../lib/utils.js";
import RecipeCard from "./RecipeCard.js";

export default class RecipeCardsList {
  #recipeCards = [];
  #element = null;

  /**
   * @param {Recipe[]} recipes is an array of Recipe
   */
  constructor(recipes) {
    this.#recipeCards = recipes.map((recipe) => new RecipeCard(recipe));
    this.#initialize();
  }

  #initialize() {
    this.#createRecipeCardsList();
  }

  #createRecipeCardsList() {
    const recipeCardsListContainer = `
      <div class="row row-cols-3 g-5">
      </div>
    `;
    this.#element = htmlToElement(recipeCardsListContainer);
    const recipeCardContainer = `
      <div class="col">
      </div>
    `;
    this.#recipeCards.forEach((recipeCard) => {
      const cardContainer = htmlToElement(recipeCardContainer);
      cardContainer.appendChild(recipeCard.element);
      this.#element.appendChild(cardContainer);
    });
  }

  get element() {
    return this.#element;
  }
}
