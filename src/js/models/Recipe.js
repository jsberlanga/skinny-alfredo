import axios from "axios";
import { key, proxy } from "../config";

export default class Recipe {
  constructor(id) {
    this.id = id;
  }

  async getRecipe() {
    try {
      const res = await axios(
        `${proxy}http://food2fork.com/api/get?key=${key}&rId=${this.id}`
      );
      this.title = res.data.recipe.title;
      this.author = res.data.recipe.publisher;
      this.img = res.data.recipe.image_url;
      this.url = res.data.recipe.source_url;
      this.ingredients = res.data.recipe.ingredients;
    } catch (err) {
      console.log(err);
    }
  }

  calcTime() {
    // Calculate 15 min each 3 ingredients
    const numIngredients = this.ingredients.length;
    const periods = Math.ceil(numIngredients / 3);
    this.time = periods * 15;
  }

  calcServings() {
    this.servings = 4;
  }

  parseIngredients() {
    const unitsFull = [
      "tablespoons",
      "tablespoon",
      "ounces",
      "ounce",
      "teaspoons",
      "teaspoon",
      "cups",
      "pounds"
    ];
    const unitsShort = [
      "tbsp",
      "tbsp",
      "oz",
      "oz",
      "tsp",
      "tsp",
      "cup",
      "pound"
    ];
    const units = [...unitsShort, "kg", "g"];

    const newIngredients = this.ingredients.map(item => {
      // Get single ingredient and make it lowercase
      let ingredient = item.toLowerCase();

      // Replace units with their abbreviations
      unitsFull.forEach((unit, index) => {
        ingredient = ingredient.replace(unit, unitsShort[index]);
      });

      // Remove the parentheses and the content within
      ingredient = ingredient.replace(/ *\([^)]*\) */g, " ");

      //PARSE INGREDIENT
      // We are splitting into words each ingredient so as to obtain at the end the count the unit and the ingredient
      const ingredientArr = ingredient.split(" ");

      // Find the unit and check whether it is included on the unitsShort array.
      // If it returns -1 means that there is no unit
      const unitIndex = ingredientArr.findIndex(el => units.includes(el));

      let ingredientObj = {};

      // There is unit on the array
      if (unitIndex > -1) {
        // We suppose that the unit comes at the beginning if the ingredientArr
        const arrCount = ingredientArr.slice(0, unitIndex);

        let count;
        if (arrCount.length === 1) {
          // We are removing the dash on certain sentences where it appears as a plus, for example 1 - 1/2 teaspoon
          count = eval(ingredientArr[0].replace("-", "+"));
        } else {
          // Example 5 1/2 cups, arrCount will be [5, 1/2] then we evaluate if eval("5+1/2") which is 5.5
          count = eval(ingredientArr.slice(0, unitIndex).join("+"));
        }

        ingredientObj = {
          count,
          unit: ingredientArr[unitIndex],
          ingredient: ingredientArr.slice(unitIndex + 1).join(" ")
        };

        // There is no unit, but the first element on the array is a number
      } else if (parseInt(ingredientArr[0], 10)) {
        ingredientObj = {
          count: parseInt(ingredientArr[0], 10),
          unit: "",
          ingredient: ingredientArr.slice(1).join(" ")
        };

        // There is no unit and no number in the first position
      } else if (unitIndex === -1) {
        ingredientObj = {
          count: 1,
          unit: "",
          ingredient
        };
      }

      return ingredientObj;
    });
    this.ingredients = newIngredients;
  }
  updateServings(type) {
    // Servings
    const newServings =
      type === "decrease" ? this.servings - 1 : this.servings + 1;

    // Ingredients
    this.ingredients.forEach(ingredient => {
      ingredient.count *= newServings / this.servings;
    });

    this.servings = newServings;
  }
}
