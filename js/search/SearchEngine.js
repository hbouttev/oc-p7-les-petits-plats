import { SearchEventsTypes } from "../events/searchEvents.js";
import PubSub from "../events/PubSub.js";
import { setDifference } from "../lib/utils.js";

export const Filters = {
  ingredients: {
    displayName: "Ingrédients",
    id: "ingredients", // we can directly use the object key as id, but for now we keep it also as a property for readability
  },
  appliances: {
    displayName: "Appareils",
    id: "appliances",
  },
  utensils: {
    displayName: "Ustensiles",
    id: "utensils",
  },
};

/*
 * There are 3 ways to implement the search engine as a 'singleton':
 *  1. class singleton POO implementation, but this is not really the JS way
 *   with module.
 *  2. JS module, the JS way of single instance. And we're using modules.
 *  3. full static class, with static methods and properties and static
 *   initialization block. This is not really the modern JS way, and not really
 *   a POO singleton, but it works in a full JS class implementation logic.
 *  4. instead of full static class, we can just make an object literal.
 * I'm not sur that for OC project the module way is the best, because we
 * are not really supposed to use modules, even if I use them at least for
 * proper import/export readability. An evaluator could argue about it. But the
 * singleton class implementation is not really the modern JS way, so I'm
 * trying the static class implementation for now. I had to deal with similar
 * implementation in Java, which is class based, but the search engine is not
 * really the definition of a set of static methods and properties.
 *
 * */

//
// https://www.typescriptlang.org/docs/handbook/2/classes.html#why-no-static-classes
//

export default class SearchEngine {
  // Data cache
  /** @type {Recipe[]} */
  static #allRecipes = [];
  /** @type {Map<Recipe.id, Recipe>} */
  static #allRecipesById = new Map();
  /** @type {Set<string>} */
  static #allIngredients = new Set();
  /** @type {Set<string>} */
  static #allAppliances = new Set();
  /** @type {Set<string>} */
  static #allUtensils = new Set();

  // Search tags sent by the user
  /** @type {Set<string>} */
  static #ingredientsSearchTags = new Set();
  /** @type {Set<string>} */
  static #appliancesSearchTags = new Set();
  /** @type {Set<string>} */
  static #utensilsSearchTags = new Set();
  // Search input sent by the user
  static #mainSearchInput = "";

  // Recipes from search results by inputs
  /** @type {Set<Recipe.id>} */
  static #filteredRecipesByIngredients = new Set();
  /** @type {Set<Recipe.id>} */
  static #filteredRecipesByAppliances = new Set();
  /** @type {Set<Recipe.id>} */
  static #filteredRecipesByUtensils = new Set();
  /** @type {Set<Recipe.id>} */
  static #filteredRecipesSearchInput = new Set();

  // Remaining tags available after search for each filter
  /** @type {Set<string>} */
  static #filteredIngredients = new Set();
  /** @type {Set<string>} */
  static #filteredAppliances = new Set();
  /** @type {Set<string>} */
  static #filteredUtensils = new Set();

  // Final recipes search result after intersection of all inputs results
  /** @type {Recipe[]} */
  static #globalRecipesSearchResult = [];

  static initialize(recipes) {
    this.#allRecipes = recipes;
    this.#allRecipesById = new Map(
      recipes.map((recipe) => [recipe.id, recipe])
    );
    // fetch the default data and notify the views (dropdowns and cards) when data are ready to update views
    for (const recipe of recipes) {
      for (const ingredient of recipe.ingredients) {
        this.#allIngredients.add(ingredient.ingredient);
      }
      this.#allAppliances.add(recipe.appliance);
      for (const utensil of recipe.utensils) {
        this.#allUtensils.add(utensil);
      }
    }

    this.#filteredIngredients = new Set(this.#allIngredients);
    this.#filteredAppliances = new Set(this.#allAppliances);
    this.#filteredUtensils = new Set(this.#allUtensils);

    const allRecipesIds = new Set(this.#allRecipesById.keys());
    this.#filteredRecipesByIngredients = new Set(allRecipesIds);
    this.#filteredRecipesByAppliances = new Set(allRecipesIds);
    this.#filteredRecipesByUtensils = new Set(allRecipesIds);
    this.#filteredRecipesSearchInput = new Set(allRecipesIds);

    PubSub.subscribe(
      SearchEventsTypes.MainSearch,
      this.handleUpdateSearchInput.bind(this)
    );

    PubSub.subscribe(
      SearchEventsTypes.AddTag,
      this.handleUpdateSearchTags.bind(this)
    );

    PubSub.subscribe(
      SearchEventsTypes.RemoveTag,
      this.handleUpdateSearchTags.bind(this)
    );

    this.#notifyUpdateFiltersOptions();
  }

  // Notify events methods

  static #notifyUpdateFiltersOptions() {
    PubSub.publish(
      SearchEventsTypes.UpdateFilterOptions,
      new Map([
        [
          Filters.ingredients.id,
          {
            searchTags: [...this.#ingredientsSearchTags],
            options: [
              ...this.#removeSearchTagsFromTags(
                this.#filteredIngredients,
                this.#ingredientsSearchTags
              ),
            ],
          },
        ],
        [
          Filters.appliances.id,
          {
            searchTags: [...this.#appliancesSearchTags],
            options: [
              ...this.#removeSearchTagsFromTags(
                this.#filteredAppliances,
                this.#appliancesSearchTags
              ),
            ],
          },
        ],
        [
          Filters.utensils.id,
          {
            searchTags: [...this.#utensilsSearchTags],
            options: [
              ...this.#removeSearchTagsFromTags(
                this.#filteredUtensils,
                this.#utensilsSearchTags
              ),
            ],
          },
        ],
      ])
    );
  }

  static #notifyUpdateSearchResult() {
    PubSub.publish(SearchEventsTypes.UpdateSearchResult, {
      recipes: this.#globalRecipesSearchResult,
    });
  }

  // Handle events methods

  static handleUpdateSearchInput(event, data) {
    const { search } = data;
    this.#mainSearchInput = search;
    this.#filterRecipesBySearchInput();
    this.#updateSearchResult();
  }

  static handleUpdateSearchTags(event, data) {
    const { filterId, tag } = data;
    if (event === SearchEventsTypes.AddTag) {
      switch (filterId) {
        case Filters.ingredients.id:
          this.#ingredientsSearchTags.add(tag);
          this.#filterRecipesByIngredients();
          this.#updateSearchResult();
          break;
        case Filters.appliances.id:
          this.#appliancesSearchTags.add(tag);
          this.#filterRecipesByAppliances();
          this.#updateSearchResult();
          break;
        case Filters.utensils.id:
          this.#utensilsSearchTags.add(tag);
          this.#filterRecipesByUtensils();
          this.#updateSearchResult();
          break;
        default:
          console.error(`Unknown filter id ${filterId}`);
      }
    } else if (event === SearchEventsTypes.RemoveTag) {
      switch (filterId) {
        case Filters.ingredients.id:
          this.#ingredientsSearchTags.delete(tag);
          this.#filterRecipesByIngredients();
          this.#updateSearchResult();
          break;
        case Filters.appliances.id:
          this.#appliancesSearchTags.delete(tag);
          this.#filterRecipesByAppliances();
          this.#updateSearchResult();
          break;
        case Filters.utensils.id:
          this.#utensilsSearchTags.delete(tag);
          this.#filterRecipesByUtensils();
          this.#updateSearchResult();
          break;
        default:
          console.error(`Unknown filter id ${filterId}`);
      }
    }
  }

  // Filter methods

  static #filterRecipesBySearchInput() {
    if (this.#mainSearchInput === "") {
      this.#filteredRecipesSearchInput = new Set(this.#allRecipesById.keys());
      return;
    }
    this.#filteredRecipesSearchInput.clear();
    for (const recipe of this.#allRecipes) {
      if (
        recipe.name.toLowerCase().includes(this.#mainSearchInput.toLowerCase())
      ) {
        this.#filteredRecipesSearchInput.add(recipe.id);
      }
      if (
        recipe.description
          .toLowerCase()
          .includes(this.#mainSearchInput.toLowerCase())
      ) {
        this.#filteredRecipesSearchInput.add(recipe.id);
      }
      if (
        recipe.ingredients
          .map((ingredient) => ingredient.ingredient)
          .some((ingredient) =>
            ingredient
              .toLowerCase()
              .includes(this.#mainSearchInput.toLowerCase())
          )
      ) {
        this.#filteredRecipesSearchInput.add(recipe.id);
      }
    }
  }

  static #filterRecipesByIngredients() {
    if (this.#ingredientsSearchTags.size === 0) {
      this.#filteredRecipesByIngredients = new Set(this.#allRecipesById.keys());
      return;
    }
    this.#filteredRecipesByIngredients.clear();
    for (const recipe of this.#allRecipes) {
      const matchNeeded = this.#ingredientsSearchTags.size;
      let matchCount = 0;
      for (const ingredient of recipe.ingredients) {
        if (this.#ingredientsSearchTags.has(ingredient.ingredient)) {
          matchCount++;
        }
      }
      if (matchCount === matchNeeded) {
        this.#filteredRecipesByIngredients.add(recipe.id);
      }
    }
  }

  static #filterRecipesByAppliances() {
    if (this.#appliancesSearchTags.size === 0) {
      this.#filteredRecipesByAppliances = new Set(this.#allRecipesById.keys());
      return;
    }
    this.#filteredRecipesByAppliances.clear();
    for (const recipe of this.#allRecipes) {
      if (this.#appliancesSearchTags.has(recipe.appliance)) {
        this.#filteredRecipesByAppliances.add(recipe.id);
      }
    }
  }

  static #filterRecipesByUtensils() {
    if (this.#utensilsSearchTags.size === 0) {
      this.#filteredRecipesByUtensils = new Set(this.#allRecipesById.keys());
      return;
    }
    this.#filteredRecipesByUtensils.clear();
    for (const recipe of this.#allRecipes) {
      const matchNeeded = this.#utensilsSearchTags.size;
      let matchCount = 0;
      for (const utensil of recipe.utensils) {
        if (this.#utensilsSearchTags.has(utensil)) {
          matchCount++;
        }
      }
      if (matchCount === matchNeeded) {
        this.#filteredRecipesByUtensils.add(recipe.id);
      }
    }
  }

  static #updateFiltersOptions() {
    this.#filteredIngredients.clear();
    this.#filteredAppliances.clear();
    this.#filteredUtensils.clear();
    for (const recipe of this.#globalRecipesSearchResult) {
      for (const ingredient of recipe.ingredients) {
        this.#filteredIngredients.add(ingredient.ingredient);
      }
      this.#filteredAppliances.add(recipe.appliance);
      for (const utensil of recipe.utensils) {
        this.#filteredUtensils.add(utensil);
      }
    }
  }

  /**
   *
   * @returns {Set<Recipe.id>}
   */
  static #getIntersectionOfFilteredRecipes() {
    const intersection = new Set();
    for (const recipeId of this.#filteredRecipesSearchInput) {
      if (
        this.#filteredRecipesByAppliances.has(recipeId) &&
        this.#filteredRecipesByUtensils.has(recipeId) &&
        this.#filteredRecipesByIngredients.has(recipeId)
      ) {
        intersection.add(recipeId);
      }
    }
    return intersection;
  }

  static #updateSearchResult() {
    const intersection = this.#getIntersectionOfFilteredRecipes();
    this.#globalRecipesSearchResult = this.#getRecipesFromIds([
      ...intersection,
    ]);
    this.#notifyUpdateSearchResult();
    this.#updateFiltersOptions();
    this.#notifyUpdateFiltersOptions();
  }

  /**
   *
   * @param {Recipe.id[]} recipesIds
   * @returns {Recipe[]}
   */
  static #getRecipesFromIds(recipesIds) {
    return recipesIds.map((id) => this.#allRecipesById.get(id));
  }

  /**
   * Return a Set of remaining tags after removing search tags
   * @param {Set<string>} tags All tags remaining after search
   * @param {Set<string>} searchTags Search tags included in tags
   * @returns {Set<string>}
   */
  static #removeSearchTagsFromTags(tags, searchTags) {
    return setDifference(tags, searchTags);
  }
}
