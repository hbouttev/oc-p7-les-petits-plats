import { htmlToElement, removeAllChildNodes } from "../lib/utils.js";
import RecipeCard from "./RecipeCard.js";
import PubSub from "../events/PubSub.js";
import { SearchEventsTypes } from "../events/searchEvents.js";

export default class RecipeCardsList {
  /** @type {RecipeCard[]} */
  #recipeCards = [];
  /** @type {HTMLElement} */
  #element = null;
  /** @type {HTMLElement} */
  #cardsContainer = null;
  /** @type {HTMLElement} */
  #errorContainer = null;

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
      <div>
        <div class="row error-container"></div>
        <div class="row row-cols-3 g-5 cards-container"></div>
      </div>
    `;
    this.#element = htmlToElement(recipeCardsListContainer);
    this.#cardsContainer = this.#element.querySelector(".cards-container");
    this.#errorContainer = this.#element.querySelector(".error-container");
    this.#renderRecipeCardsList();
  }

  #renderRecipeCardsList(searchInput = "") {
    if (this.#recipeCards.length !== 0) {
      const recipeCardContainer = `
      <div class="col">
      </div>
    `;
      this.#recipeCards.forEach((recipeCard) => {
        const cardContainer = htmlToElement(recipeCardContainer);
        cardContainer.appendChild(recipeCard.element);
        this.#cardsContainer.appendChild(cardContainer);
      });
    } else {
      const noRecipeCard = `
        <div class="row">
          <p class="text-center">
            Aucune recette ne contient '${searchInput}', vous pouvez chercher « tarte aux pommes », « poisson », etc.
          </p>
        </div>
      `;
      this.#errorContainer.appendChild(htmlToElement(noRecipeCard));
    }
  }

  #clearRecipeCardsList() {
    removeAllChildNodes(this.#cardsContainer);
    removeAllChildNodes(this.#errorContainer);
  }

  handleUpdateSearchResult(event, { recipes, hadPartialBefore, searchInput }) {
    this.#recipeCards = recipes.map((recipe) => new RecipeCard(recipe));
    if (!hadPartialBefore) {
      this.#clearRecipeCardsList();
    }
    this.#renderRecipeCardsList(searchInput);
  }

  get element() {
    return this.#element;
  }
}
