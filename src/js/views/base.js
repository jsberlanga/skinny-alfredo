export const elements = {
  searchForm: document.querySelector(".search"),
  searchInput: document.querySelector(".search__field"),
  searchRes: document.querySelector(".results"),
  searchResList: document.querySelector(".results__list"),
  searchResPages: document.querySelector(".results__pages"),
  recipe: document.querySelector(".recipe"),
  shoppingList: document.querySelector(".shopping__list")
};

export const renderLoader = parent => {
  const loader = `
    <div class="loader">
      <svg>
        <use href="img/icons.svg#icon-cw"></use>
      </dvg>
    </div>
  `;
  parent.insertAdjacentHTML("beforeend", loader);
};

export const clearLoader = () => {
  const loader = document.querySelector(`.loader`);
  if (loader) loader.parentElement.removeChild(loader);
};
