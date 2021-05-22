import EventHandler from '../../util/event_handler.js'

export default class Drawable extends EventHandler {
    /**
     * Drawable represents a drawable object that can be placed on a DraggableCanvas
     */
    constructor () {
        super()

        // Generate a random id for this drawable object
        this.id = Math.floor(Math.random() * 10000000)

        // Can this object be edited with a right-click menu?
        this.editable = false

        this.eventListeners = []
    }

    move () {
        console.warn('a drawable object was attempted to be moved without a move function defined')
    }

    draw () {
        throw new Error('a drawable object was used without a draw function defined')
    }
}
