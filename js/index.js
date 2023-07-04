import App from "./App.js";
import Recipe from "./models/Recipe.js";
import RecipeCard from "./templates/RecipeCard.js";
import RecipeCardsList from "./templates/RecipeCardsList.js";

// temporary "api" function to test app
async function getRecipes() {
  return await fetch("data/recipes.json")
    .then((response) => {
      return response.json();
    })
    .then((data) => {
      return data;
    });
}

console.log("test in index.js");
// const app = new App();
// app.main();

const recipesListContainer = document.querySelector(".recipes-list-container");

const recipes = await getRecipes();
const recipeCardsList = new RecipeCardsList(recipes);
recipesListContainer.appendChild(recipeCardsList.element);

// const searchEngine = new SearchEngine();
// const filterTagDropdown = new FilterTagDropdown();
// filterTagDropdown.throwAddTagEvent();
// searchEngine.throwAddTagEvent();

// use Bootstrap with the data api to create a dropdown with search input filter
// for the dropdown items and a dynamic items array
