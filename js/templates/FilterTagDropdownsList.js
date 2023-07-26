import { htmlToElement } from "../lib/utils.js";
import FilterTagDropdown from "./FilterTagDropdown.js";

export default class FilterTagDropdownsList {
  /** @type {FilterTagDropdown[]} */
  #filterTagDropdowns = [];
  /** @type {HTMLElement} */
  #element = null;

  /**
   * @param {Filter[]} filters is an array of Filter objects
   */
  constructor(filters) {
    this.#filterTagDropdowns = filters.map(
      (filter) => new FilterTagDropdown(filter)
    );
    this.#initialize();
  }

  #initialize() {
    this.#createFilterTagDropdownsList();
  }

  #createFilterTagDropdownsList() {
    const filterTagDropdownsListContainer = `
      <div class="d-flex flex-row gap-4">
      </div>
    `;
    this.#element = htmlToElement(filterTagDropdownsListContainer);
    this.#filterTagDropdowns.forEach((filterTagDropdown) => {
      this.#element.appendChild(filterTagDropdown.element);
    });
  }

  get element() {
    return this.#element;
  }
}
