export default class CustomElement {
    /**
     * CustomElement provides the base functionality of a new element that can be
     * added to the DOM. This includes event listeners, since it is not possible to
     * extend the built-in event handling on a custom class
     */
    constructor () {
        this.eventListeners = []
    }

    /**
     * Register a new event with the element
     *
     * @param {String} name The name of the event
     * @param {Function} fn The function to execute upon the event occurring
     */
    addEventListener (name, fn) {
        this.eventListeners.push({ name: name, fn: fn })
    }

    /**
     * Dispatch an event to all its listeners
     *
     * @param {String} name The name of the event
     * @param {Object} event The parameters to pass to the function
     */
    dispatchEvent (name, event) {
        this.eventListeners.filter(e => e.name === name).forEach(e => e.fn(event))
    }
}
