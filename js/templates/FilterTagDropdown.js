import { htmlToElement, removeAllChildNodes } from "../lib/utils.js";
import DropdownOption from "./DropdownOption.js";
import PubSub from "../events/PubSub.js";
import { SearchEventsTypes } from "../events/searchEvents.js";

export default class FilterTagDropdown {
  /** @type {Filter} */
  #filter;
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
  /** @type {HTMLElement} */
  #element = null;
  /** @type {HTMLInputElement} */
  #searchInput = null;
  /** @type {HTMLElement} */
  #selectedOptionsContainer = null;
  /** @type {HTMLElement} */
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
    this.#selectedOptionsContainer =
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
   * @param {Map<Filter.id, { searchTags: string[], options: string[] }>} newOptionsMap new dropdown options list to display
   * @return {void}
   */
  #updateOptions(newOptionsMap) {
    const selectedOptions = newOptionsMap.get(this.#filter.id).searchTags;
    const newOptions = newOptionsMap.get(this.#filter.id).options;
    this.#selectedOptions = new Set(selectedOptions);
    this.#selectableOptions = new Set(newOptions);
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

  /**
   * Render the filtered options list in the dropdown.
   * Don't call directly, call filterAndRenderOptions() to filter the options
   * list before rendering (or manually do it before).
   */
  #renderFilteredOptions() {
    removeAllChildNodes(this.#selectedOptionsContainer);
    removeAllChildNodes(this.#filteredOptionsContainer);
    for (const selectedOption of this.#selectedOptions) {
      const option = new DropdownOption(selectedOption, { active: true });
      this.#initializeOption(option);
      this.#selectedOptionsContainer.appendChild(option.element);
    }
    for (const filteredOption of this.#filteredSelectableOptions) {
      const option = new DropdownOption(filteredOption);
      this.#initializeOption(option);
      this.#filteredOptionsContainer.appendChild(option.element);
    }
  }

  /**
   * Initialize event listeners for a dropdown option.
   * @param {DropdownOption} option
   */
  #initializeOption(option) {
    const optionElement = option.element;
    optionElement.addEventListener("click", () => {
      if (option.active) {
        option.active = false;
        optionElement.remove();
        this.#notifyRemoveSearchTag(option.option);
      } else {
        option.active = true;
        this.#selectedOptionsContainer.appendChild(optionElement);
        this.#notifyAddSearchTag(option.option);
      }
    });
  }

  /**
   * Handler for the update filter options event, implements PubSub callback
   * @param {string} event topic name
   * @param {Map<Filter.id, { searchTags: string[], options: string[] }>} optionsMap new dropdown options list
   */
  handleUpdateFilterOptions(event, optionsMap) {
    if (!optionsMap.has(this.#filter.id)) return;
    this.#updateOptions(optionsMap);
  }

  get element() {
    return this.#element;
  }
}
