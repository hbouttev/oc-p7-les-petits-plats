export default class Filter {
  #title;
  #id;

  constructor(title, id) {
    this.#title = title;
    this.#id = id;
  }

  get title() {
    return this.#title;
  }

  get id() {
    return this.#id;
  }
}
