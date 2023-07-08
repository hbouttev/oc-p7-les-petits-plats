export class Api {
  #url;

  /**
   * @param {string} url
   */
  constructor(url) {
    this.#url = url;
  }

  async get() {
    return fetch(this.#url)
      .then((res) => res.json())
      .catch((err) => console.log("An error occurred", err));
  }
}

export class RecipesApi extends Api {
  /**
   * @param {string} url
   */
  constructor(url) {
    super(url);
  }

  async getAllRecipes() {
    return await this.get();
  }
}
