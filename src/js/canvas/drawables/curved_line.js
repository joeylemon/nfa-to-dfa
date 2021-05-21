import Drawable from './drawable.js'
import Arrow from './arrow.js'

export default class CurvedLine extends Drawable {
    /**
     * @param {Location} from The initial location to start the line
     * @param {Location} to The end location to end the line
     * @param {Object} options The options with which to draw the line
     * @example
     *     new CurvedLine({x: 0, y: 0}, {x: 50, y: 0}, {
     *         color: '#000',
     *         arrowRadius: 5
     *     })
     */
    constructor (from, to, controlPoint, options) {
        super()
        this.from = from
        this.to = to
        this.controlPoint = controlPoint
        this.options = options

        this.arrowhead = new Arrow(controlPoint, to, options)
    }

    draw (rend) {
        rend.setColor(this.options.color)
        rend.ctx.lineWidth = this.options.width
        rend.ctx.beginPath()
        rend.ctx.moveTo(this.from.x, this.from.y)
        rend.ctx.quadraticCurveTo(this.controlPoint.x, this.controlPoint.y, this.to.x, this.to.y)
        rend.ctx.stroke()
        rend.resetColor()

        this.arrowhead.draw(rend)
    }
}
