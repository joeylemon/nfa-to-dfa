import Drawable from './drawable.js'
import Arrow from './arrow.js'
import Location from '../location.js'

export default class QuadraticCurvedLine extends Drawable {
    /**
     * @param {Location} from The initial location to start the line
     * @param {Location} to The end location to end the line
     * @param {Location} cp The control point for the quadratic curve
     * @param {Object} options The options with which to draw the line
     * @example
     *     new QuadraticCurvedLine(new Location(0, 0), new Location(50, 0), new Location(50, 50), {
     *         color: '#000',
     *         arrowRadius: 5
     *     })
     */
    constructor (from, to, cp, options) {
        super()
        this.from = from
        this.to = to
        this.cp = cp
        this.options = options

        this.arrowhead = new Arrow(cp, to, options)
    }

    /**
    * Use the bezier point equation to find a point on the line
    *
    * @param {Number} t The position on the line (0 <= t <= 1)
    */
    locationAt (t) {
        return new Location(
            Math.pow(1 - t, 2) * this.from.x + 2 * (1 - t) * t * this.cp.x + Math.pow(t, 2) * this.to.x,
            Math.pow(1 - t, 2) * this.from.y + 2 * (1 - t) * t * this.cp.y + Math.pow(t, 2) * this.to.y
        )
    }

    /**
     * Use the bezier curve equation to find the angle at a point on the line
     *
     * @param {Number} t The position on the line (0 <= t <= 1)
     */
    angleAt (t) {
        const dx = 2 * (1 - t) * (this.cp.x - this.from.x) + 2 * t * (this.to.x - this.cp.x)
        const dy = 2 * (1 - t) * (this.cp.y - this.from.y) + 2 * t * (this.to.y - this.cp.y)
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
        rend.ctx.quadraticCurveTo(this.cp.x, this.cp.y, this.to.x, this.to.y)
        rend.ctx.stroke()
        rend.resetColor()

        this.arrowhead.draw(rend)
    }
}
