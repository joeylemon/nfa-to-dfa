import Drawable from './drawable.js'

export default class Circle extends Drawable {
    /**
     * @param {Location} loc The location to draw the circle
     * @param {Object} options The options with which to draw the circle
     * @example
     *     new Circle({x: 0, y: 0}, {
     *         radius: 20,
     *         color: '#fff',
     *         text: new Text(...textOptions),
     *         borderOptions: {color: '#000', width: 2}
     *     })
     */
    constructor (loc, options) {
        super()
        this.loc = loc
        this.options = options
        this.editable = true
        this.move(this.loc)
    }

    move (to) {
        this.loc = to
        if (this.options.text) { this.options.text.loc = { x: to.x, y: to.y + this.options.text.options.size / 4 } }
        if (this.onmove) this.onmove(to)
    }

    draw (rend) {
        if (this.options.borderOptions) {
            rend.setColor(this.options.borderOptions.color)
            rend.ctx.beginPath()
            rend.ctx.arc(this.loc.x, this.loc.y, this.options.radius + this.options.borderOptions.width, 0, 2 * Math.PI)
            rend.ctx.fill()
        }

        rend.setColor(this.options.color)

        rend.ctx.beginPath()
        rend.ctx.arc(this.loc.x, this.loc.y, this.options.radius, 0, 2 * Math.PI)
        rend.ctx.fill()

        if (this.options.text) this.options.text.draw(rend)

        rend.resetColor()
    }
}
