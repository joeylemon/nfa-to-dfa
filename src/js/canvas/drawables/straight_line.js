import Drawable from './drawable.js'

export default class StraightLine extends Drawable {
    /**
     * @param {Location} from The initial location to start the line
     * @param {Location} to The end location to end the line
     * @param {Object} options The options with which to draw the line
     * @example
     *     new StraightLine(new Location(0, 0), new Location(50, 0), {
     *         width: 5,
     *         color: '#fff',
     *         dash: [10, 2]
     *     })
     */
    constructor (from, to, options) {
        super()
        this.from = from
        this.to = to
        this.options = options

        if (!this.options.dash) this.options.dash = []
    }

    draw (rend) {
        rend.setColor(this.options.color)
        rend.ctx.beginPath()
        rend.ctx.setLineDash(this.options.dash)
        rend.ctx.moveTo(this.from.x, this.from.y)
        rend.ctx.lineTo(this.to.x, this.to.y)
        rend.ctx.lineWidth = this.options.width
        rend.ctx.stroke()
        rend.ctx.setLineDash([])
        rend.resetColor()
    }
}
