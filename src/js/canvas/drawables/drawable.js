import EventHandler from '../../util/event_handler.js'

export default class Drawable extends EventHandler {
    /**
     * Drawable represents a drawable object that can be placed on a DraggableCanvas
     */
    constructor () {
        super()

        // Generate a random id for this drawable object
        this.id = Math.floor(Math.random() * 10000000)

        this.eventListeners = []
    }

    draw () {
        throw new Error('a drawable object was used without a draw function defined')
    }
}
