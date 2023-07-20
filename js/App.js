import { RecipesApi } from "./api/Api.js";
import Recipe from "./models/Recipe.js";
import RecipeCardsList from "./templates/RecipeCardsList.js";
import { Filters } from "./search/SearchEngine.js";
import Filter from "./models/Filter.js";
import FilterTagDropdownsList from "./templates/FilterTagDropdownsList.js";
import SearchEngine from "./search/SearchEngine.js";

export default class App {
  #recipesApi;
  #recipes;
  #dropdownsFiltersContainer;
  #searchtagsContainer;
  #recipesContainer;

  constructor() {
    this.#recipesApi = new RecipesApi("data/recipes.json");
    this.#recipes = [];
    this.#dropdownsFiltersContainer = document.querySelector(
      ".dropdowns-filters-list-container"
    );
    this.#searchtagsContainer = document.querySelector(
      ".searchtags-list-container"
    );
    this.#recipesContainer = document.querySelector(".recipes-list-container");
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
    SearchEngine.initialize(recipes);
    this.#dropdownsFiltersContainer.appendChild(filterTagDropdownsList.element);
    this.#recipesContainer.appendChild(recipeCardsList.element);
  }
}
