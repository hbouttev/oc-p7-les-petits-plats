import { capitalizeFirstLetter } from "../lib/utils.js";

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
    this.#time = recipeData.time;
    this.#description = recipeData.description;
    // we need to format ingredients and utensils as it's done in backend
    this.#ingredients = recipeData.ingredients.map((ingredient) => ({
      ...ingredient,
      ingredient: capitalizeFirstLetter(ingredient.ingredient.toLowerCase()), // it lowercases proper nouns too, but that's okay for now
    }));
    this.#appliance = recipeData.appliance;
    this.#utensils = recipeData.utensils.map((utensil) =>
      capitalizeFirstLetter(utensil.toLowerCase())
    );
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
