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

export default class SearchEngine {
  // Data cache
  /** @type {Recipe[]} */
  #allRecipes = [];
  /** @type {Map<Recipe.id, Recipe>} */
  #allRecipesById = new Map();
  /** @type {Set<string>} */
  #allIngredients = new Set();
  /** @type {Set<string>} */
  #allAppliances = new Set();
  /** @type {Set<string>} */
  #allUtensils = new Set();

  // Search tags sent by the user
  /** @type {Set<string>} */
  #ingredientsSearchTags = new Set();
  /** @type {Set<string>} */
  #appliancesSearchTags = new Set();
  /** @type {Set<string>} */
  #utensilsSearchTags = new Set();
  // Search input sent by the user
  #mainSearchInput = "";

  // Recipes from search results by inputs
  /** @type {Set<Recipe.id>} */
  #filteredRecipesByIngredients = new Set();
  /** @type {Set<Recipe.id>} */
  #filteredRecipesByAppliances = new Set();
  /** @type {Set<Recipe.id>} */
  #filteredRecipesByUtensils = new Set();
  /** @type {Set<Recipe.id>} */
  #filteredRecipesSearchInput = new Set();

  // Remaining tags available after search for each filter
  /** @type {Set<string>} */
  #filteredIngredients = new Set();
  /** @type {Set<string>} */
  #filteredAppliances = new Set();
  /** @type {Set<string>} */
  #filteredUtensils = new Set();

  // Cache for partial search result if at least 3 recipes after intersection of all inputs results
  /** @type {Recipe[]} */
  #partialGlobalRecipesSearchResult = [];

  // Final recipes search result after intersection of all inputs results
  /** @type {Recipe[]} */
  #globalRecipesSearchResult = [];

  // Flag to know if we have already sent partial results to the views
  /** @type {boolean} */
  #hasSentPartialResult = false;

  /**
   * @param {Recipe[]} recipes
   */
  constructor(recipes) {
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
    this.#initialize();
  }

  #initialize() {
    this.#filteredIngredients = new Set(this.#allIngredients);
    this.#filteredAppliances = new Set(this.#allAppliances);
    this.#filteredUtensils = new Set(this.#allUtensils);

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

  #notifyUpdateFiltersOptions() {
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

  /**
   * Send the search result. The result can be partial (3 recipes) or the
   * remaining result after a previous partial (in that case, it can't be
   * empty).
   * hadPartialBefore is a flag informing that a previous partial result has
   * been sent and that this is the remaining result.
   * @param {Recipe[]} recipesSearchResult Search result to send, partial or remaining
   * @param {boolean} partial Optional: Flag to know if the search result is
   *  partial or not. Default false.
   */
  #notifyUpdateSearchResult(recipesSearchResult, { partial = false } = {}) {
    PubSub.publish(SearchEventsTypes.UpdateSearchResult, {
      recipes: recipesSearchResult,
      hadPartialBefore: partial ? false : this.#hasSentPartialResult,
    });
  }

  #notifyNumberOfResults() {
    PubSub.publish(SearchEventsTypes.NumberOfResults, {
      results: this.#globalRecipesSearchResult.length,
    });
  }

  // Handle events methods

  handleUpdateSearchInput(event, data) {
    const { search } = data;
    this.#mainSearchInput = search;
    this.#filterRecipesBySearchInput();
    this.#updateSearchResult();
  }

  handleUpdateSearchTags(event, data) {
    const { filterId, tag } = data;
    if (event === SearchEventsTypes.AddTag) {
      switch (filterId) {
        case Filters.ingredients.id:
          this.#ingredientsSearchTags.add(tag);
          this.#filterRecipesByIngredients();
          break;
        case Filters.appliances.id:
          this.#appliancesSearchTags.add(tag);
          this.#filterRecipesByAppliances();
          break;
        case Filters.utensils.id:
          this.#utensilsSearchTags.add(tag);
          this.#filterRecipesByUtensils();
          break;
        default:
          console.error(`Unknown filter id ${filterId}`);
          return;
      }
      this.#updateSearchResult();
    } else if (event === SearchEventsTypes.RemoveTag) {
      switch (filterId) {
        case Filters.ingredients.id:
          this.#ingredientsSearchTags.delete(tag);
          this.#filterRecipesByIngredients();
          break;
        case Filters.appliances.id:
          this.#appliancesSearchTags.delete(tag);
          this.#filterRecipesByAppliances();
          break;
        case Filters.utensils.id:
          this.#utensilsSearchTags.delete(tag);
          this.#filterRecipesByUtensils();
          break;
        default:
          console.error(`Unknown filter id ${filterId}`);
          return;
      }
      this.#updateSearchResult();
    }
  }

  // Filter methods

  #filterRecipesBySearchInput() {
    this.#filteredRecipesSearchInput.clear();
    if (this.#mainSearchInput === "") {
      return;
    }
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

  #filterRecipesByIngredients() {
    this.#filteredRecipesByIngredients.clear();
    if (this.#ingredientsSearchTags.size === 0) {
      return;
    }
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

  #filterRecipesByAppliances() {
    this.#filteredRecipesByAppliances.clear();
    if (this.#appliancesSearchTags.size === 0) {
      return;
    }
    for (const recipe of this.#allRecipes) {
      if (this.#appliancesSearchTags.has(recipe.appliance)) {
        this.#filteredRecipesByAppliances.add(recipe.id);
      }
    }
  }

  #filterRecipesByUtensils() {
    this.#filteredRecipesByUtensils.clear();
    if (this.#utensilsSearchTags.size === 0) {
      return;
    }
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

  /**
   * Update the new filters options available based on the global search
   * result.
   * this.#globalRecipesSearchResult has to be set before calling this method.
   */
  #updateFiltersOptions() {
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
   * Return the intersection of the filtered recipes ids of the given sets.
   * It needs at least a base set if no other filter is applied.
   * @param {Set<Recipe.id>} baseSet Base Set of filtered recipes ids to
   *  intersect with
   * @param {Set<Recipe.id>} sets Optional: Sets of filtered recipes ids to
   *  intersect with the baseSet.
   * @returns {Set<Recipe.id>}
   */
  #intersectionOfFilteredRecipes(baseSet, ...sets) {
    let intersection = new Set();
    let hasSentPartialResult = false;
    // if other sets, do the intersection, else return the baseSet
    // in every case, if there is at least 3 results, send a partial result
    if (sets.length > 0) {
      for (const recipeId of baseSet) {
        let isPresent = true;
        for (const set of sets) {
          if (!set.has(recipeId)) {
            isPresent = false;
            break;
          }
        }
        if (isPresent) {
          intersection.add(recipeId);
          // send 3 first partial results if there is at least 3 results and
          // clear the intersection to send only the remaining results at the
          // end
          if (!hasSentPartialResult && intersection.size === 3) {
            this.#partialGlobalRecipesSearchResult = this.#getRecipesFromIds([
              ...intersection,
            ]);
            this.#notifyUpdateSearchResult(
              this.#partialGlobalRecipesSearchResult,
              { partial: true }
            );
            hasSentPartialResult = true;
            intersection.clear();
          }
        }
      }
    } else {
      intersection = new Set(baseSet);
      // check if baseSet has more than 3 elements, if yes, send first 3 elements
      if (baseSet.size > 3) {
        const partialResult = new Set();
        const intersectionIterator = intersection.values();
        for (let i = 0; i < 3; i++) {
          const recipeId = intersectionIterator.next().value;
          partialResult.add(recipeId);
          intersection.delete(recipeId);
        }
        this.#partialGlobalRecipesSearchResult = this.#getRecipesFromIds([
          ...partialResult,
        ]);
        this.#notifyUpdateSearchResult(this.#partialGlobalRecipesSearchResult, {
          partial: true,
        });
        hasSentPartialResult = true;
      }
    }

    this.#hasSentPartialResult = hasSentPartialResult;
    return intersection;
  }

  #updateSearchResult() {
    // we look for the sets that are currently filtered to intersect them, and
    // if there is more than one we look for the smallest one to use as base
    // set
    const setsToIntersect = new Set();
    let smallestSet;
    if (this.#mainSearchInput.length > 0) {
      setsToIntersect.add(this.#filteredRecipesSearchInput);
    }
    if (this.#appliancesSearchTags.size > 0) {
      setsToIntersect.add(this.#filteredRecipesByAppliances);
    }
    if (this.#utensilsSearchTags.size > 0) {
      setsToIntersect.add(this.#filteredRecipesByUtensils);
    }
    if (this.#ingredientsSearchTags.size > 0) {
      setsToIntersect.add(this.#filteredRecipesByIngredients);
    }
    if (setsToIntersect.size > 1) {
      for (const set of setsToIntersect) {
        if (!smallestSet || set.size < smallestSet.size) {
          smallestSet = set;
        }
      }
    } else if (setsToIntersect.size === 1) {
      smallestSet = setsToIntersect.values().next().value;
    } else {
      // no current filter, send all recipes (reset search result for views)
      smallestSet = new Set(this.#allRecipesById.keys());
    }
    setsToIntersect.delete(smallestSet);

    const intersection = this.#intersectionOfFilteredRecipes(
      smallestSet,
      ...setsToIntersect
    );

    // here, a partial result might have been sent if at least 3 results were
    // found during intersection, so we need to check
    if (this.#hasSentPartialResult && intersection.size === 0) {
      // no more results found after first partial result was sent, just update
      // filters and don't send an empty result
      this.#globalRecipesSearchResult = this.#partialGlobalRecipesSearchResult;
    } else if (this.#hasSentPartialResult) {
      // concat first sent partial and remaining results in global search result
      const remainingResults = this.#getRecipesFromIds([...intersection]);
      this.#globalRecipesSearchResult =
        this.#partialGlobalRecipesSearchResult.concat(remainingResults);
      this.#notifyUpdateSearchResult(remainingResults); // not partial
    } else {
      this.#globalRecipesSearchResult = this.#getRecipesFromIds([
        ...intersection,
      ]);
      this.#notifyUpdateSearchResult(this.#globalRecipesSearchResult); // not partial
    }
    this.#notifyNumberOfResults();
    this.#updateFiltersOptions();
    this.#notifyUpdateFiltersOptions();
  }

  /**
   * Return an array of recipes from an array of recipes ids
   * @param {Recipe.id[]} recipesIds
   * @returns {Recipe[]}
   */
  #getRecipesFromIds(recipesIds) {
    return recipesIds.map((id) => this.#allRecipesById.get(id));
  }

  /**
   * Return a Set of remaining tags after removing search tags
   * @param {Set<string>} tags All tags remaining after search
   * @param {Set<string>} searchTags Search tags included in tags
   * @returns {Set<string>}
   */
  #removeSearchTagsFromTags(tags, searchTags) {
    return setDifference(tags, searchTags);
  }
}
