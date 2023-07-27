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
      <p class="text-end h-100 d-flex align-items-center justify-content-end gap-1">
        <span class="recipes-counter">${this.#numberOfRecipes}</span> recettes
      </p>
    `;
    this.#element = htmlToElement(recipeCounter);
    this.#counterElement = this.#element.querySelector(".recipes-counter");
  }

  #updateRecipeCounter() {
    this.#counterElement.textContent = this.#numberOfRecipes.toString();
  }

  handleUpdateNumberOfRecipes(event, data) {
    const { recipes } = data;
    this.#numberOfRecipes = recipes.length;
    this.#updateRecipeCounter();
  }

  get element() {
    return this.#element;
  }
}
