import Drawable from './drawable.js'
import Location from '../location.js'

export default class Circle extends Drawable {
    /**
     * @param {Location} loc The location to draw the circle
     * @param {Object} options The options with which to draw the circle
     * @example
     *     new Circle(new Location(0, 0), {
     *         radius: 20,
     *         color: '#fff',
     *         text: new Text(...textOptions),
     *         borderOptions: {color: '#000', width: 2},
     *         outlineOptions: {color: '#000', width: 2, distance: 5}
     *     })
     */
    constructor (loc, options) {
        super()
        this.loc = loc
        this.options = options
        this.editable = true
        this.move(this.loc)
    }

    touches (loc) {
        return loc.distance(this.loc) < this.options.radius
    }

    move (to) {
        this.loc = to
        if (this.options.text) { this.options.text.loc = new Location(to.x, to.y) }

        this.dispatchEvent('move', { newLocation: to })
    }

    draw (rend) {
        if (this.options.borderOptions) {
            rend.setColor(this.options.borderOptions.color)
            rend.ctx.beginPath()
            rend.ctx.arc(this.loc.x, this.loc.y, this.options.radius + this.options.borderOptions.width, 0, 2 * Math.PI)
            rend.ctx.fill()
        }

        if (this.options.outlineOptions) {
            rend.ctx.lineWidth = this.options.outlineOptions.width
            rend.setColor(this.options.outlineOptions.color)
            rend.ctx.beginPath()
            rend.ctx.arc(this.loc.x, this.loc.y, this.options.radius + this.options.outlineOptions.distance, 0, 2 * Math.PI)
            rend.ctx.stroke()
        }

        rend.setColor(this.options.color)

        rend.ctx.beginPath()
        rend.ctx.arc(this.loc.x, this.loc.y, this.options.radius, 0, 2 * Math.PI)
        rend.ctx.fill()

        if (this.options.text) this.options.text.draw(rend)

        rend.resetColor()
    }
}
