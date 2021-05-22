import EventHandler from '../util/event_handler.js'

export default class EditNodeMenu extends EventHandler {
    /**
    * Create a new node edit menu in the DOM
    *
    * @param {Number} x The x-coordinate of the menu
    * @param {Number} y The y-coordinate of the menu
    */
    constructor (x, y) {
        super()
        this.deletePrevious()

        document.body.insertAdjacentHTML('beforeend', `
            <div class="edit-node-menu" id="edit-node-menu">
                <div class="option" id="edit-node-menu-set-start">
                    <span class="material-icons" style="color: #5599ff;">play_circle</span>Set as start state
                </div>
                <div class="option" id="edit-node-menu-toggle-accept">
                    <span class="material-icons" style="color: #72b771;">check_circle</span>Toggle as accept state
                </div class="option">
                <div class="option" id="edit-node-menu-delete">
                    <span class="material-icons" style="color: #ff6767;">remove_circle</span>Delete state
                </div class="option">
            </div>`)
        const elem = document.querySelector('#edit-node-menu')

        elem.style.top = `${y}px`
        elem.style.left = `${x}px`

        // Adjust x-value if the menu extends past the viewport
        const left = parseInt(elem.style.left.replace('px', ''))
        if (left + elem.clientWidth > window.innerWidth) {
            elem.style.left = `${window.innerWidth - elem.clientWidth - 10}px`
        }

        document.querySelector('#edit-node-menu-set-start').addEventListener('click', () => {
            this.dispatchEvent('selectedstart')
        })

        document.querySelector('#edit-node-menu-toggle-accept').addEventListener('click', () => {
            this.dispatchEvent('toggledaccept')
        })

        document.querySelector('#edit-node-menu-delete').addEventListener('click', () => {
            this.dispatchEvent('delete')
        })

        elem.addEventListener('DOMNodeRemoved', () => {
            this.dispatchEvent('close')
        })

        window.addEventListener('click', () => {
            this.deletePrevious()
        })
    }

    deletePrevious () {
        const elem = document.querySelector('#edit-node-menu')

        // Delete the previous menu first
        if (elem !== null) {
            elem.parentNode.removeChild(elem)
        }
    }
}
