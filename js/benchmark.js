import { RecipesApi } from "./api/Api.js";
import Recipe from "./models/Recipe.js";
import SearchEngine from "./search/SearchEngine.js";

const recipesApi = new RecipesApi("data/recipes.json");
const recipesData = await recipesApi.getAllRecipes();
const recipes = recipesData.map((recipe) => new Recipe(recipe));
const searchEngine = new SearchEngine(recipes);
const benchOptions = {
  inputs: ["", "cho", "chocolat", "chosssss"],
  iterations: 10000,
};
const results = searchEngine.benchMarkSearchInput(benchOptions);
console.table(results);
