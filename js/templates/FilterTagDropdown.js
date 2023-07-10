import { htmlToElement, removeAllChildNodes } from "../lib/utils.js";
import PubSub from "../events/PubSub.js";
import { SearchEventsTypes } from "../events/searchEvents.js";

// OU : class filterTag et class filterTagDropdown qui extend filterTag avec
// l'implémentation du dropdown comme composant

export default class FilterTagDropdown {
  #filter;
  #options = [];
  #activeOptions = [];
  #filteredOptions = [];
  #optionsWithActive = [];
  #element = null;
  #searchInput = null;
  #activeOptionsContainer = null;
  #filteredOptionsContainer = null;

  /**
   * @param {Filter} filter is a Filter object storing title and id
   */
  constructor(filter) {
    this.#filter = filter;
    this.#initialize();
  }

  #initialize() {
    // ajouter les this.addEventListener pour les events custom et les this.dispatchEvent pour les events custom
    this.#createFilterTagDropdown();
    // test
    this.#updateOptions(["chocolat", "poulet", "citron", "fromage"]);
    this.#renderFilteredOptions();
    this.#searchInput.addEventListener(
      "input",
      this.handleFilterInput.bind(this)
    );
    PubSub.subscribe(
      SearchEventsTypes.UpdateFilterOptions,
      this.handleUpdateFilterOptions.bind(this)
    );
  }

  #createFilterTagDropdown() {
    const filterTagDropdown = `
      <div class="btn-group">
        <button
          class="btn btn-primary dropdown-toggle dropdown-filter"
          type="button"
          data-bs-toggle="dropdown"
          data-bs-auto-close="outside"
          aria-expanded="false"
        >
          ${this.#filter.title}
        </button>
        <div class="dropdown-menu dropdown dropdown-filter">
          <div class="px-4 py-3">
            <input type="search" class="form-control" aria-label="Search" />
          </div>
          <div class="active-options">
            <button class="dropdown-item active" type="button">
              Dropdown item
            </button>
            <button class="dropdown-item active" type="button">
              Dropdown item
            </button>
          </div>
          <div class="filtered-options">
          </div>
        </div>
      </div>
    `;
    this.#element = htmlToElement(filterTagDropdown);
    this.#activeOptionsContainer =
      this.#element.querySelector(".active-options");
    this.#filteredOptionsContainer =
      this.#element.querySelector(".filtered-options");
    this.#searchInput = this.#element.querySelector("input");
  }

  #filterOptions(filter) {
    this.#filteredOptions = this.#options.filter((option) =>
      option.toLowerCase().includes(filter)
    );
  }

  handleFilterInput() {
    const filter = this.#searchInput.value.toLowerCase();
    this.#filterOptions(filter);
    this.#renderFilteredOptions();
  }

  /**
   * @param {String[]} newOptions new dropdown options list to display
   * @return {void}
   */
  #updateOptions(newOptions) {
    this.#options = newOptions;
    this.#optionsWithActive = newOptions.filter(
      (newOption) => !this.#activeOptions.includes(newOption)
    );
    this.handleFilterInput();

    // this.#renderOptions();
  }

  #renderActiveOptions() {}

  #renderFilteredOptions() {
    removeAllChildNodes(this.#filteredOptionsContainer);
    this.#filteredOptions.forEach((option) => {
      const optionElement = htmlToElement(`
        <button class="dropdown-item" type="button">${option}</button>
      `);
      this.#filteredOptionsContainer.appendChild(optionElement);
    });
  }

  /**
   * Handler for the update filter options event, implements PubSub callback
   * @param {String} event topic name
   * @param {String[]} newOptions new dropdown options list
   */
  handleUpdateFilterOptions(event, newOptions) {
    this.#updateOptions(newOptions);
  }

  get element() {
    return this.#element;
  }
}
