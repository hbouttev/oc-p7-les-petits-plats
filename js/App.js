import { RecipesApi } from "./api/Api.js";
import Recipe from "./models/Recipe.js";
import RecipeCardsList from "./templates/RecipeCardsList.js";
import { Filters } from "./search/SearchEngine.js";
import Filter from "./models/Filter.js";
import FilterTagDropdownsList from "./templates/FilterTagDropdownsList.js";
import RecipesCounter from "./templates/RecipesCounter.js";
import TagsList from "./templates/TagsList.js";
import SearchEngine from "./search/SearchEngine.js";
import PubSub from "./events/PubSub.js";
import { SearchEventsTypes } from "./events/searchEvents.js";

export default class App {
  /** @type {RecipesApi} */
  #recipesApi;
  /** @type {HTMLElement} */
  #dropdownsFiltersContainer;
  /** @type {HTMLElement} */
  #searchTagsContainer;
  /** @type {HTMLElement} */
  #recipesCounterContainer;
  /** @type {HTMLElement} */
  #recipesContainer;
  /** @type {HTMLInputElement} */
  #mainSearchInput;

  constructor() {
    this.#recipesApi = new RecipesApi("data/recipes.json");
    this.#dropdownsFiltersContainer = document.querySelector(
      ".dropdowns-filters-list-container"
    );
    this.#searchTagsContainer = document.querySelector(
      ".searchtags-list-container"
    );
    this.#recipesCounterContainer = document.querySelector(
      ".recipes-counter-container"
    );
    this.#recipesContainer = document.querySelector(".recipes-list-container");
    this.#mainSearchInput = document.querySelector(".main-search-input");
  }

  /**
   * Main function of the app, entry point
   * @returns {Promise<void>}
   */
  async main() {
    const recipesData = await this.#recipesApi.getAllRecipes();
    const recipes = recipesData.map((recipe) => new Recipe(recipe));
    const recipeCardsList = new RecipeCardsList(recipes);
    const filters = Object.values(Filters).map(
      ({ displayName, id }) => new Filter(displayName, id)
    );
    const filterTagDropdownsList = new FilterTagDropdownsList(filters);
    const tagsList = new TagsList();
    SearchEngine.initialize(recipes);
    const recipesCounter = new RecipesCounter(recipes.length);
    this.#dropdownsFiltersContainer.appendChild(filterTagDropdownsList.element);
    this.#searchTagsContainer.appendChild(tagsList.element);
    this.#recipesCounterContainer.appendChild(recipesCounter.element);
    this.#recipesContainer.appendChild(recipeCardsList.element);
    this.#mainSearchInput.addEventListener("input", (event) => {
      if (event.target.value.length >= 3 || event.target.value.length === 0) {
        PubSub.publish(SearchEventsTypes.MainSearch, {
          search: event.target.value,
        });
      }
    });
  }
}
