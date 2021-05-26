import Drawable from './drawable.js'

export default class Arrow extends Drawable {
    /**
     * @param {Location} from The initial location to start the arrow
     * @param {Location} to The end location to end the arrow
     * @param {Object} options The options with which to draw the arrow
     * @example
     *     new Arrow(new Location(0, 0), new Location(0, 0), {
     *         color: '#000',
     *         arrowRadius: 5
     *     })
     */
    constructor (from, to, options) {
        super()
        this.from = from
        this.to = to
        this.options = options
    }

    draw (rend) {
        rend.setColor(this.options.color)
        rend.ctx.beginPath()

        let angle = Math.atan2(this.to.y - this.from.y, this.to.x - this.from.x)
        let x = this.options.arrowRadius * Math.cos(angle) + this.to.x
        let y = this.options.arrowRadius * Math.sin(angle) + this.to.y

        rend.ctx.moveTo(x, y)

        angle += (1.0 / 3.0) * (2 * Math.PI)
        x = this.options.arrowRadius * Math.cos(angle) + this.to.x
        y = this.options.arrowRadius * Math.sin(angle) + this.to.y

        rend.ctx.lineTo(x, y)

        angle += (1.0 / 3.0) * (2 * Math.PI)
        x = this.options.arrowRadius * Math.cos(angle) + this.to.x
        y = this.options.arrowRadius * Math.sin(angle) + this.to.y

        rend.ctx.lineTo(x, y)

        rend.ctx.closePath()

        rend.ctx.fill()
        rend.resetColor()
    }
}
