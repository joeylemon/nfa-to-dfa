import EventHandler from '../util/event_handler.js'

export default class EditNodeMenu extends EventHandler {
    /**
    * Create a menu in the DOM that allows the user to edit aspects of an FSA node
    *
    * @param {Number} x The x-coordinate of the menu
    * @param {Number} y The y-coordinate of the menu
    */
    constructor (x, y) {
        super()
        this.deletePrevious()

        document.body.insertAdjacentHTML('beforeend', `
            <div class="edit-menu" id="edit-node-menu">
                <div class="option" id="edit-node-menu-add-transition">
                    <i class="mdi mdi-plus-circle" aria-hidden="true" style="color: #a4a4a4;"></i>Add transition
                </div>
                <div class="option" id="edit-node-menu-set-start">
                    <i class="mdi mdi-play-circle" aria-hidden="true" style="color: #5599ff;"></i>Set as start state
                </div>
                <div class="option" id="edit-node-menu-toggle-accept">
                    <i class="mdi mdi-check-circle" aria-hidden="true" style="color: #72b771;"></i>Toggle as accept state
                </div class="option">
                <div class="option" id="edit-node-menu-delete">
                    <i class="mdi mdi-minus-circle" aria-hidden="true" style="color: #ff6767;"></i>Delete state
                </div class="option">
            </div>`)
        const elem = document.querySelector('#edit-node-menu')

        x -= 10
        y -= 10
        elem.style.top = `${y}px`
        elem.style.left = `${x}px`

        // Adjust x-value if the menu extends past the viewport
        const left = parseInt(elem.style.left.replace('px', ''))
        if (left + elem.clientWidth > window.innerWidth) {
            elem.style.left = `${window.innerWidth - elem.clientWidth - 10}px`
        }

        document.querySelector('#edit-node-menu-add-transition').addEventListener('click', () => {
            this.dispatchEvent('addtransition')
        })

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

        // If the user clicks elsewhere in the webpage, delete the menu
        window.addEventListener('click', () => {
            this.deletePrevious()
        })
    }

    /**
     * Delete the previous EditNodeMenu if it exists in the DOM
     */
    deletePrevious () {
        const elem = document.querySelector('.edit-menu')

        // Delete the previous menu first
        if (elem !== null) {
            elem.parentNode.removeChild(elem)
        }
    }
}
