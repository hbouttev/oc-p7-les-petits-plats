import { htmlToElement, removeAllChildNodes } from "../lib/utils.js";
import RecipeCard from "./RecipeCard.js";
import PubSub from "../events/PubSub.js";
import { SearchEventsTypes } from "../events/searchEvents.js";

export default class RecipeCardsList {
  /** @type {RecipeCard[]} */
  #recipeCards = [];
  /** @type {HTMLElement} */
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
    PubSub.subscribe(
      SearchEventsTypes.UpdateSearchResult,
      this.handleUpdateSearchResult.bind(this)
    );
  }

  #createRecipeCardsList() {
    const recipeCardsListContainer = `
      <div class="row row-cols-3 g-5">
      </div>
    `;
    this.#element = htmlToElement(recipeCardsListContainer);
    this.#renderRecipeCardsList();
  }

  #renderRecipeCardsList() {
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

  #updateRecipeCardsList() {
    removeAllChildNodes(this.#element);
    this.#renderRecipeCardsList();
  }

  handleUpdateSearchResult(event, { recipes }) {
    this.#recipeCards = recipes.map((recipe) => new RecipeCard(recipe));
    this.#updateRecipeCardsList();
  }

  get element() {
    return this.#element;
  }
}
