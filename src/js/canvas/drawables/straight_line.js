import Drawable from './drawable.js'

export default class StraightLine extends Drawable {
    /**
     * @param {Location} from The initial location to start the line
     * @param {Location} to The end location to end the line
     * @param {Number} width The width of the line in pixels
     * @param {String} color The color of the line
     * @param {Array} dash The dash parameters of the line
     */
    constructor (from, to, width, color, dash = []) {
        super()
        this.from = from
        this.to = to
        this.width = width
        this.color = color
        this.dash = dash
    }

    draw (rend) {
        rend.setColor(this.color)
        rend.ctx.beginPath()
        rend.ctx.setLineDash(this.dash)
        rend.ctx.moveTo(this.from.x, this.from.y)
        rend.ctx.lineTo(this.to.x, this.to.y)
        rend.ctx.lineWidth = this.width
        rend.ctx.stroke()
        rend.ctx.setLineDash([])
        rend.resetColor()
    }
}
