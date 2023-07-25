import { htmlToElement } from "../lib/utils.js";

export default class DropdownOption {
  /** @type {string} */
  #option;
  /** @type {boolean} */
  #active;
  /** @type {HTMLElement} */
  #element = null;

  /**
   * @param {string} option Option name to display
   * @param {boolean} active If the option is active or not
   */
  constructor(option, { active = false } = {}) {
    this.#option = option;
    this.#active = active;
    this.#initialize();
  }

  #initialize() {
    this.#createOption();
  }

  #createOption() {
    const option = `
      <button class="dropdown-item" type="button">${this.#option}</button>
    `;
    this.#element = htmlToElement(option);
    if (this.#active) {
      this.#element.classList.add("active");
    }
  }

  /**
   * @param {boolean} state
   */
  set active(state) {
    if (this.#active === state) return;
    this.#active = state;
    if (this.#active) {
      this.#element.classList.add("active");
    } else {
      this.#element.classList.remove("active");
    }
  }

  get active() {
    return this.#active;
  }

  get option() {
    return this.#option;
  }

  get element() {
    return this.#element;
  }
}
