import { RecipesApi } from "./api/Api.js";
import Recipe from "./models/Recipe.js";
import RecipeCardsList from "./templates/RecipeCardsList.js";

export default class App {
  #recipesApi;
  #recipes;
  #dropdownsFiltersContainer;
  #searchtagsContainer;
  #recipesContainer;

  constructor() {
    this.#recipesApi = new RecipesApi("data/recipes.json");
    this.#recipes = [];
    this.#dropdownsFiltersContainer = document.querySelector(".dropdowns-filters-list-container");
    this.#searchtagsContainer = document.querySelector(".searchtags-list-container");
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
    this.#recipesContainer.appendChild(recipeCardsList.element);
  }
}
