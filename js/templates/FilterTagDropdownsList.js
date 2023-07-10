import { htmlToElement } from "../lib/utils.js";
import FilterTagDropdown from "./FilterTagDropdown.js";

export default class FilterTagDropdownsList {
  #filterTagDropdowns = [];
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
      <div>
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
