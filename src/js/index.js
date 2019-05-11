import Search from "./models/Search";
import Recipe from "./models/Recipe";
import ShoppingList from "./models/ShoppingList";

import * as searchView from "./views/searchView";
import * as recipeView from "./views/recipeView";
import * as shoppingListView from "./views/shoppingListView";
import { elements, renderLoader, clearLoader } from "./views/base";

/////////////////
// GLOBAL STATE
//
const state = {};

/////////////////////
// SEARCH CONTROLLER
//
const controlSearch = async () => {
  // Get query from view
  const query = searchView.getInput();

  if (query) {
    // New search object and add to state
    state.search = new Search(query);

    // Prepare UI for results
    searchView.clearInput();
    searchView.clearResults();
    renderLoader(elements.searchRes);

    try {
      // Search for recipes
      await state.search.getResults();

      // Render results on UI
      clearLoader();
      searchView.renderResults(state.search.result);
    } catch (err) {
      console.log(err);
      clearLoader();
    }
  }
};

elements.searchForm.addEventListener("submit", e => {
  e.preventDefault();
  controlSearch();
});

elements.searchResPages.addEventListener("click", e => {
  const btn = e.target.closest(".btn-inline");
  if (btn) {
    const goToPage = parseInt(btn.dataset.goto, 10);
    // searchView.clearResults();
    searchView.renderResults(state.search.result, goToPage);
  }
});

/////////////////////
// RECIPE CONTROLLER
//
const controlRecipe = async () => {
  // Get ID from url
  const id = window.location.hash.replace("#", "");

  if (id) {
    // Prepare UI for changes
    recipeView.clearRecipe();
    renderLoader(elements.recipe);

    // Highlight
    searchView.highlightSelected(id);

    // Initialize recipe
    state.recipe = new Recipe(id);

    // Recipe For Testing
    // window.r = state.recipe;

    try {
      // Get recipe data and parse ingredients
      await state.recipe.getRecipe();
      state.recipe.parseIngredients();

      // Calculate servings and time
      state.recipe.calcTime();
      state.recipe.calcServings();

      // Render recipe
      clearLoader();
      recipeView.renderRecipe(state.recipe);
      // console.log(state.recipe);
    } catch (err) {
      console.log(err);
    }
  }
};

["hashchange", "load"].forEach(event =>
  window.addEventListener(event, controlRecipe)
);

////////////////////////////
// SHOPPING LIST CONTROLLER
//
const controlShoppingList = () => {
  // Initialize list
  if (!state.shoppingList) state.shoppingList = new ShoppingList();

  // Add each ingredient to the shopping list and UI
  state.recipe.ingredients.forEach(el => {
    const item = state.shoppingList.addItem(el.count, el.unit, el.ingredient);
    shoppingListView.renderItem(item);
  });
};

//////////////////
// EVENT HANDLERS
//

// Recipe button clicks
elements.recipe.addEventListener("click", e => {
  if (e.target.matches(".btn-decrease, .btn-decrease *")) {
    // Decrease only if servings > 1
    if (state.recipe.servings > 1) {
      state.recipe.updateServings("decrease");
      recipeView.updateServingsIngredients(state.recipe);
    }
  } else if (e.target.matches(".btn-increase, .btn-increase *")) {
    // Increase button
    state.recipe.updateServings("increase");
    recipeView.updateServingsIngredients(state.recipe);
  } else if (e.target.matches(".recipe__btn--add, .recipe__btn--add *")) {
    // Add ingredients to shopping list
    controlShoppingList();
    // } else if (e.target.matches(".recipe__love, .recipe__love *")) {
    //   // Like controller
    //   controlLike();
  }
});

// Delete and update shopping list item
elements.shoppingList.addEventListener("click", e => {
  const id = e.target.closest(".shopping__item").dataset.itemid;

  // Handle the delete button
  if (e.target.matches(".shopping__delete, .shopping__delete *")) {
    // Delete from state
    state.shoppingList.deleteItem(id);

    // Delete from UI
    shoppingListView.deleteItem(id);

    // Handle the count
  } else if (e.target.matches(".shopping__count-value")) {
    const value = parseFloat(e.target.value, 10);
    state.shoppingList.updateCount(id, value);
  }
});
