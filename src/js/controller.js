import * as model from './model.js';
import { MODAL_CLOSE_SEC } from './config.js';
import recipeView from './views/recipeView.js';
import searchView from './views/searchView.js';
import resultsView from './views/resultsView.js';
import paginationView from './views/paginationView.js';
import bookmarksView from './views/bookmarksView.js';
import addRecipeView from './views/addRecipeView.js';

import 'core-js/stable';
import 'regenerator-runtime/runtime';

// const recipeContainer = document.querySelector('.recipe');

// https://forkify-api.herokuapp.com/v2

///////////////////////////////////////

const controlRecipes = async function () {
	try {
		const id = window.location.hash.slice(1);
		if (!id) return;
		recipeView.renderSpinner();

		// 1) Update results view to mark selected search results as selected
		resultsView.update(model.getSearchResultsPage());

		// 2) Updating bookmarks view
		bookmarksView.update(model.state.bookmarks);

		// 3) Loading recipe
		await model.loadRecipe(id);

		// 4) Rendering recipe
		recipeView.render(model.state.recipe);
	} catch (error) {
		console.error(`${error} 💥💥💥💥`);
		recipeView.renderError();
	}
};

const controlSearchResults = async function () {
	try {
		// 1) Get search query
		resultsView.renderSpinner();
		const query = searchView.getQuery();

		// 2) Load search results
		await model.loadSearchResults(query);

		// 3) Render results
		resultsView.render(model.getSearchResultsPage());

		// 4) Render initial pagination buttons
		paginationView.render(model.state.search);
	} catch (error) {
		console.error(`${error} 💥💥💥💥`);
		resultsView.renderMessage();
	}
};

const controlPagination = function (goToPage) {
	// 1) Render NEW results
	resultsView.render(model.getSearchResultsPage(goToPage));

	// 2) Render NEW pagination buttons
	paginationView.render(model.state.search);
};

const controlServing = function (newServings) {
	// Update the recipe servings (in state)
	model.updateServings(newServings);
	// Update the recipe view
	// recipeView.render(model.state.recipe);
	recipeView.update(model.state.recipe);
};

const controlBookmark = function () {
	// 1) Add/remove bookmark
	if (!model.state.recipe.bookmarked) {
		model.addBookmark(model.state.recipe);
	} else if (model.state.recipe.bookmarked) {
		model.deleteBookmark(model.state.recipe.id);
	}

	// 2) Update recipe view
	recipeView.update(model.state.recipe);

	// 3) Render bookmarksView
	bookmarksView.render(model.state.bookmarks);
};

const controlBookmarks = function () {
	bookmarksView.render(model.state.bookmarks);
};

const controlAddRecipe = async function (newRecipe) {
	try {
		// Show loading spinner
		addRecipeView.renderSpinner();

		// Upload the new recipe data;
		await model.uploadRecipe(newRecipe);

		// Render recipe
		recipeView.render(model.state.recipe);

		// Success message
		addRecipeView.renderMessage();

		// Render bookmark view
		bookmarksView.render(model.state.bookmarks);

		// Change ID in URL
		window.history.pushState(null, '', `#${model.state.recipe.id}`);

		// Close form window
		setTimeout(function () {
			addRecipeView.toggleWindow();
		}, MODAL_CLOSE_SEC * 1000);
	} catch (error) {
		console.error('💥', error);
		addRecipeView.renderError(error.message);
	}
};

const init = function () {
	bookmarksView.addHandlerRender(controlBookmarks);
	recipeView.addHandlerRender(controlRecipes);
	recipeView.addHandlerUpdateServings(controlServing);
	recipeView.addHandlerAddBookmark(controlBookmark);
	searchView.addHandlerSearch(controlSearchResults);
	paginationView.addHandlerClick(controlPagination);
	addRecipeView.addHandlerUpload(controlAddRecipe);
};

init();
