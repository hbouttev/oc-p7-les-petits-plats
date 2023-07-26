import { htmlToElement } from "../lib/utils.js";
import Tag from "./Tag.js";
import PubSub from "../events/PubSub.js";
import { SearchEventsTypes } from "../events/searchEvents.js";

export default class TagsList {
  /** @type {Map<string, Tag>} */
  #tags = new Map();
  /** @type {HTMLElement} */
  #element = null;

  constructor() {
    this.#initialize();
  }

  #initialize() {
    this.#createTagsList();
    PubSub.subscribe(
      SearchEventsTypes.AddTag,
      this.handleUpdateTags.bind(this)
    );
    PubSub.subscribe(
      SearchEventsTypes.RemoveTag,
      this.handleUpdateTags.bind(this)
    );
  }

  #createTagsList() {
    const tagsListContainer = `
      <div class="d-flex flex-row flex-wrap gap-3">
      </div>
    `;
    this.#element = htmlToElement(tagsListContainer);
  }

  /**
   * @param {string} tag
   * @param {string} filterId
   */
  #addTag(tag, filterId) {
    const newTag = new Tag(tag, filterId);
    this.#tags.set(tag, newTag);
    this.#element.appendChild(newTag.element);
  }

  /**
   * @param {string} tag
   */
  #removeTag(tag) {
    this.#tags.get(tag).remove();
    this.#tags.delete(tag);
  }

  handleUpdateTags(event, data) {
    const { filterId, tag } = data;
    if (event === SearchEventsTypes.AddTag) {
      this.#addTag(tag, filterId);
    } else if (event === SearchEventsTypes.RemoveTag) {
      this.#removeTag(tag);
    }
  }

  get element() {
    return this.#element;
  }
}
