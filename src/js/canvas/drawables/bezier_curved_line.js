import Drawable from './drawable.js'
import Arrow from './arrow.js'
import Location from '../location.js'

export default class BezierCurvedLine extends Drawable {
    /**
     * @param {Location} from The initial location to start the line
     * @param {Location} to The end location to end the line
     * @param {Location} cp1 The first control point for the bezier curve
     * @param {Location} cp2 The second control point for the bezier curve
     * @param {Object} options The options with which to draw the line
     * @example
     *     new BezierCurvedLine(new Location(0, 0), new Location(50, 0), new Location(50, 50), new Location(50, 100), {
     *         color: '#000',
     *         arrowRadius: 5
     *     })
     */
    constructor (from, to, cp1, cp2, options) {
        super()
        this.from = from
        this.to = to
        this.cp1 = cp1
        this.cp2 = cp2
        this.options = options

        this.arrowhead = new Arrow(cp2, to, options)
    }

    /**
     * Use the bezier point equation to find a point on the line
     *
     * @param {Number} t The position on the line (0 <= t <= 1)
     */
    locationAt (t) {
        return new Location(
            Math.pow(1 - t, 3) * this.from.x + 3 * Math.pow(1 - t, 2) * t * this.cp1.x + 3 * (1 - t) * Math.pow(t, 2) * this.cp2.x + Math.pow(t, 3) * this.to.x,
            Math.pow(1 - t, 3) * this.from.y + 3 * Math.pow(1 - t, 2) * t * this.cp1.y + 3 * (1 - t) * Math.pow(t, 2) * this.cp2.y + Math.pow(t, 3) * this.to.y
        )
    }

    /**
     * Use the bezier curve equation to find the angle at a point on the line
     *
     * @param {Number} t The position on the line (0 <= t <= 1)
     */
    angleAt (t) {
        const dx = 3 * Math.pow(1 - t, 2) * (this.cp1.x - this.from.x) + 6 * (1 - t) * t * (this.cp2.x - this.cp1.x) + 3 * Math.pow(t, 2) * (this.to.x - this.cp2.x)
        const dy = 3 * Math.pow(1 - t, 2) * (this.cp1.y - this.from.y) + 6 * (1 - t) * t * (this.cp2.y - this.cp1.y) + 3 * Math.pow(t, 2) * (this.to.y - this.cp2.y)
        return -Math.atan2(dx, dy) + 0.5 * Math.PI
    }

    midpoint () {
        return this.locationAt(0.5)
    }

    midpointAngle () {
        return this.angleAt(0.5)
    }

    touches (loc) {
        for (let i = 0.05; i < 0.95; i += 0.1) {
            const from = this.locationAt(i)
            if (loc.distance(from) < 15) return true
        }
        return false
    }

    draw (rend) {
        rend.setColor(this.options.color)
        rend.ctx.lineWidth = this.options.width
        rend.ctx.beginPath()
        rend.ctx.moveTo(this.from.x, this.from.y)
        rend.ctx.bezierCurveTo(this.cp1.x, this.cp1.y, this.cp2.x, this.cp2.y, this.to.x, this.to.y)
        rend.ctx.stroke()
        rend.resetColor()

        this.arrowhead.draw(rend)
    }
}
