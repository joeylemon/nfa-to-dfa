import Drawable from './drawable.js'

export default class Text extends Drawable {
    /**
     * @param {Location} loc The location to draw the text
     * @param {Object} options The options with which to draw the text
     * @example
     *     new Text({x: 0, y: 0}, {
     *         text: 'Hello world!',
     *         color: '#fff',
     *         size: 15,
     *         font: 'Roboto'
     *     })
     */
    constructor (loc, options) {
        super()
        this.loc = loc
        this.options = options
    }

    draw (rend) {
        rend.setColor(this.options.color)

        rend.ctx.textAlign = 'center'
        rend.ctx.font = `${this.options.size}px ${this.options.font}`
        rend.ctx.fillText(this.options.text, this.loc.x, this.loc.y)

        rend.resetColor()
    }
}
