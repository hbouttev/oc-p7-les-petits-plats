/**
 * Recipe model
 * @class Recipe
 */
export default class Recipe {
  #id;
  #image;
  #name;
  #servings;
  #ingredients;
  #time;
  #description;
  #appliance;
  #utensils;

  /**
   * @param {Object} recipeData is an object of recipe data from API
   * @return {void}
   */
  constructor(recipeData) {
    this.#id = recipeData.id;
    this.#image = recipeData.image;
    this.#name = recipeData.name;
    this.#servings = recipeData.servings;
    this.#ingredients = recipeData.ingredients;
    this.#time = recipeData.time;
    this.#description = recipeData.description;
    this.#appliance = recipeData.appliance;
    this.#utensils = recipeData.utensils;
  }

  get id() {
    return this.#id;
  }

  get image() {
    return this.#image;
  }

  get name() {
    return this.#name;
  }

  get servings() {
    return this.#servings;
  }

  get ingredients() {
    return this.#ingredients;
  }

  get time() {
    return this.#time;
  }

  get description() {
    return this.#description;
  }

  get appliance() {
    return this.#appliance;
  }

  get utensils() {
    return this.#utensils;
  }
}
