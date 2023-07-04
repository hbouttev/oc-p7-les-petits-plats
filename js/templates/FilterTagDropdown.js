import { htmlToElement } from "../lib/utils.js";
import PubSub from "../events/PubSub.js";
import { SearchEventsTypes } from "../events/searchEvents.js";

// OU : class filterTag et class filterTagDropdown qui extend filterTag avec
// l'implémentation du dropdown comme composant

export default class FilterTagDropdown {
  #options = [];
  #element = null;

  constructor(displayName, id) {
    this.#initialize();
  }

  #initialize() {
    // ajouter les this.addEventListener pour les events custom et les this.dispatchEvent pour les events custom
    this.#createFilterTagDropdown();
    PubSub.subscribe(
      SearchEventsTypes.UpdateFilterOptions,
      this.handleUpdateFilterOptions.bind(this)
    );
  }

  #createFilterTagDropdown() {
    const filterTagDropdown = `
      <div class="filter-tag-dropdown">
      </div>
     `;
    this.#element = htmlToElement(filterTagDropdown);
  }

  /**
   * @param {String[]} newOptions new dropdown options list to display
   * @return {void}
   */
  #updateOptions(newOptions) {
    this.#options = newOptions;
    // this.#renderOptions();
  }

  /**
   * Handler for the update filter options event, implements PubSub callback
   * @param {String} event topic name
   * @param {String[]} newOptions new dropdown options list
   */
  handleUpdateFilterOptions(event, newOptions) {
    this.#updateOptions(newOptions);
  }
}
