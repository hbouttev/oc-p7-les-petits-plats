import { htmlToElement, removeAllChildNodes } from "../lib/utils.js";
import PubSub from "../events/PubSub.js";
import { SearchEventsTypes } from "../events/searchEvents.js";

// OU : class filterTag et class filterTagDropdown qui extend filterTag avec
// l'implémentation du dropdown comme composant

export default class FilterTagDropdown {
  /** @type {Filter} */
  #filter;
  /**
   * All options available for this filter (from search engine)
   * @type {Set<string>}
   */
  #allOptions = new Set();
  /**
   * Options selected by the user as a search filter
   * @type {Set<string>}
   */
  #selectedOptions = new Set();
  /**
   * Options selectable by the user (all options minus selected options)
   * @type {Set<string>}
   */
  #selectableOptions = new Set();
  /**
   * Selectable options after filtering by user input in the dropdown. They are
   * the one displayed as selectable in the dropdown.
   * @type {Set<string>}
   */
  #filteredSelectableOptions = new Set();
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
    this.#createFilterTagDropdown();
    this.#searchInput.addEventListener(
      "input",
      this.handleFilterOptionsFromInput.bind(this)
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
          <div class="options overflow-auto">
            <div class="active-options">
            </div>
            <div class="filtered-options">
            </div>
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

  /**
   * Filter the available (not active) options list from the search input value
   * @param {string} filter
   */
  #filterSelectableOptions(filter) {
    this.#filteredSelectableOptions = new Set(
      [...this.#selectableOptions].filter((option) =>
        option.toLowerCase().includes(filter)
      )
    );
  }

  #updateOptionsWithoutActive() {
    // this.#selectableOptions = this.#allOptions.filter(
    //   (option) => !this.#selectedOptions.includes(option)
    // );
    this.#selectableOptions = new Set(
      [...this.#allOptions].filter(
        (option) => !this.#selectedOptions.has(option)
      )
    );
  }

  /**
   * Update the options list when a search is made from the dropdown input and
   * render it.
   */
  #filterAndRenderOptions() {
    const filter = this.#searchInput.value.toLowerCase();
    this.#filterSelectableOptions(filter);
    this.#renderFilteredOptions();
  }

  /**
   * Handle the update of the options list when a search is made
   * from the dropdown input and render it.
   */
  handleFilterOptionsFromInput() {
    this.#filterAndRenderOptions();
  }

  /**
   * Update the options list from a search engine event.
   * @param {string[]} newOptions new dropdown options list to display
   * @return {void}
   */
  #updateOptions(newOptions) {
    this.#allOptions = new Set(newOptions);
    this.#updateOptionsWithoutActive();
    this.#filterAndRenderOptions();
  }

  /**
   * Notify subscribers that a tag has been added to the search.
   * @param {string} tag
   */
  #notifyAddSearchTag(tag) {
    PubSub.publish(SearchEventsTypes.AddTag, {
      filterId: this.#filter.id,
      tag: tag,
    });
  }

  /**
   * Notify subscribers that a tag has been removed from the search.
   * @param {string} tag
   */
  #notifyRemoveSearchTag(tag) {
    PubSub.publish(SearchEventsTypes.RemoveTag, {
      filterId: this.#filter.id,
      tag: tag,
    });
  }

  #renderActiveOptions() {}

  #renderFilteredOptions() {
    removeAllChildNodes(this.#filteredOptionsContainer);
    this.#filteredSelectableOptions.forEach((option) => {
      const optionElement = htmlToElement(`
        <button class="dropdown-item" type="button">${option}</button>
      `);
      optionElement.addEventListener("click", () => {
        // if option is not active, add it to active options, else remove it
        // and rerender filtered selectable options
        if (!optionElement.classList.contains("active")) {
          this.#selectableOptions.delete(option);
          this.#selectedOptions.add(option);
          optionElement.classList.add("active");
          this.#activeOptionsContainer.appendChild(optionElement);
          this.#notifyAddSearchTag(option);
        } else {
          this.#selectedOptions.delete(option);
          this.#selectableOptions.add(option);
          optionElement.classList.remove("active");
          this.#filteredOptionsContainer.appendChild(optionElement);
          this.#filterAndRenderOptions();
          this.#notifyRemoveSearchTag(option);
        }
      });
      this.#filteredOptionsContainer.appendChild(optionElement);
    });
  }

  /**
   * Handler for the update filter options event, implements PubSub callback
   * @param {string} event topic name
   * @param {string} filterId filter id
   * @param {string[]} options new dropdown options list
   */
  handleUpdateFilterOptions(event, { filterId, options }) {
    if (filterId !== this.#filter.id) return;
    this.#updateOptions(options);
  }

  get element() {
    return this.#element;
  }
}
