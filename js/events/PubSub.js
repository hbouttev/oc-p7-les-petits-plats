/**
 * Publisher/Subscriber static class
 * @class PubSub
 * @static
 */
export default class PubSub {
  /** event/subscribers map */
  static #subscribers = new Map();

  /**
   * Subscribe to an event
   * @param {String} event topic name
   * @param {Function} callback callback function
   * @returns {{unsubscribe(): void}} object with method to unsubscribe from topic
   */
  static subscribe(event, callback) {
    if (!this.#subscribers.has(event)) {
      this.#subscribers.set(event, []);
    }
    let index = this.#subscribers.get(event).push(callback) - 1;

    return {
      unsubscribe() {
        PubSub.#subscribers.get(event).splice(index, 1);
      },
    };
  }

  /**
   * Publish an event with some data
   * @param {String} event topic name
   * @param {Object} data data to send to subscribers
   */
  static publish(event, data) {
    if (!this.#subscribers.has(event)) {
      return;
    }
    this.#subscribers
      .get(event)
      .forEach((subscriberCallback) => subscriberCallback(event, data));
  }
}
