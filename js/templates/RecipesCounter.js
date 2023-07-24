import { htmlToElement } from "../lib/utils.js";
import PubSub from "../events/PubSub.js";
import { SearchEventsTypes } from "../events/searchEvents.js";

export default class RecipeCounter {
  /** @type {number} */
  #numberOfRecipes;
  /** @type {HTMLElement} */
  #element = null;
  /** @type {HTMLElement} */
  #counterElement = null;

  /**
   * @param {number} numberOfRecipes
   */
  constructor(numberOfRecipes) {
    this.#numberOfRecipes = numberOfRecipes;
    this.#initialize();
  }

  #initialize() {
    this.#createRecipeCounter();
    PubSub.subscribe(
      SearchEventsTypes.UpdateSearchResult,
      this.handleUpdateNumberOfRecipes.bind(this)
    );
  }

  #createRecipeCounter() {
    const recipeCounter = `
      <p class="text-end fw-bold">
        <span class="recipes-counter">${this.#numberOfRecipes}</span> recettes
      </p>
    `;
    this.#element = htmlToElement(recipeCounter);
    this.#counterElement = this.#element.querySelector(".recipes-counter");
  }

  #updateRecipeCounter() {
    this.#counterElement.textContent = this.#numberOfRecipes;
  }

  handleUpdateNumberOfRecipes(event, data) {
    const { recipes } = data;
    console.log("recipes conter", recipes);
    this.#numberOfRecipes = recipes.length;
    this.#updateRecipeCounter();
  }

  get element() {
    return this.#element;
  }
}
