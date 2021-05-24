import EventHandler from '../util/event_handler.js'

export default class OverlayMessage extends EventHandler {
    /**
    * Create a message overlay on top of the given element
    *
    * @param {String} selector The selector for the element
    * @param {String} message The message to put in the center of the overlay
    */
    constructor (selector, message) {
        super()
        this.deletePrevious()

        document.querySelector(selector).insertAdjacentHTML('beforeend', `<div class="message-overlay" id="message-overlay">${message}</div>`)

        document.addEventListener('keydown', this.keydown.bind(this))
    }

    keydown (e) {
        this.dispatchEvent('keydown', e)
    }

    /**
     * Update the message in the overlay
     *
     * @param {String} message The new message
     */
    setMessage (message) {
        document.querySelector('#message-overlay').innerHTML = message
    }

    /**
     * Delete the previous EditNodeMenu if it exists in the DOM
     */
    deletePrevious () {
        const elem = document.querySelector('.message-overlay')

        // Delete the previous menu first
        if (elem !== null) {
            elem.parentNode.removeChild(elem)
            document.removeEventListener('keydown', this.keydown.bind(this))
            this.dispatchEvent('close')
            this.eventListeners = []
            delete this.eventListeners
            delete this
        }
    }
}
