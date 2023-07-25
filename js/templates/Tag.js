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
      <button
        type="button"
        class="btn btn-primary position-relative py-3 ps-3 pe-5"
      >
        ${this.#tag}
        <span
          class="position-absolute top-50 end-0 translate-middle-y me-2 tag-close-button"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="28"
            height="28"
            viewBox="0 0 16 16"
          >
            <path
              d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708z"
            />
          </svg>
        </span>
      </button>
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
