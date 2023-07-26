import { htmlToElement } from "../lib/utils.js";
import PubSub from "../events/PubSub.js";
import { SearchEventsTypes } from "../events/searchEvents.js";

export default class Tag {
  /** @type {string} */
  #tag;
  /** @type {string} */
  #filterId;
  /** @type {HTMLElement} */
  #element = null;
  /** @type {HTMLElement} */
  #closeButton = null;

  /**
   * @param {string} tag
   * @param {string} filterId
   */
  constructor(tag, filterId) {
    this.#tag = tag;
    this.#filterId = filterId;
    this.#initialize();
  }

  #initialize() {
    this.#createTag();
    // event listener cross to remove tag
    this.#closeButton.addEventListener(
      "click",
      this.handleRemoveTag.bind(this)
    );
  }

  #createTag() {
    const tag = `
      <div class="btn btn-primary position-relative py-3 ps-3 pe-5">
        ${this.#tag}
        <button type="button" class="btn-close position-absolute top-50 end-0 translate-middle-y me-2 tag-close-button" aria-label="Close"></button>
      </div>
    `;
    this.#element = htmlToElement(tag);
    this.#closeButton = this.#element.querySelector(".tag-close-button");
  }

  /**
   * Remove tag from the DOM. Can be call from outside when RemoveTag event is
   * received in a container from the publisher.
   */
  remove() {
    this.#element.remove();
  }

  #notifyTagRemoved() {
    PubSub.publish(SearchEventsTypes.RemoveTag, {
      filterId: this.#filterId,
      tag: this.#tag,
    });
  }

  /**
   * Handler for internal events that remove the tag from the DOM and notify
   * subscribers.
   */
  handleRemoveTag() {
    this.remove();
    this.#notifyTagRemoved();
  }

  get element() {
    return this.#element;
  }
}
