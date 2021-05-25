import EventHandler from '../util/event_handler.js'

export default class AddNodeMenu extends EventHandler {
    /**
    * Create a menu in the DOM that allows the user add nodes to the FSA
    *
    * @param {Number} x The x-coordinate of the menu
    * @param {Number} y The y-coordinate of the menu
    */
    constructor (x, y) {
        super()
        this.deletePrevious()

        document.body.insertAdjacentHTML('beforeend', `
            <div class="edit-menu" id="add-node-menu">
                <div class="option" id="add-node-menu-add">
                    <i class="mdi mdi-plus-circle" aria-hidden="true" style="color: #a4a4a4;"></i>Add state
                </div class="option">
            </div>`)
        const elem = document.querySelector('#add-node-menu')

        x -= 10
        y -= 10
        elem.style.top = `${y}px`
        elem.style.left = `${x}px`

        // Adjust x-value if the menu extends past the viewport
        const left = parseInt(elem.style.left.replace('px', ''))
        if (left + elem.clientWidth > window.innerWidth) {
            elem.style.left = `${window.innerWidth - elem.clientWidth - 10}px`
        }

        document.querySelector('#add-node-menu-add').addEventListener('click', () => {
            this.dispatchEvent('create')
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
