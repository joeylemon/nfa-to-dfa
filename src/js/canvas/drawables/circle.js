import Drawable from './drawable.js'

export default class Circle extends Drawable {
    /**
     * @param {Position} loc The location to draw the circle
     * @param {Number} radius The radius of the circle in pixels
     * @param {String} color The color of the circle
     */
    constructor (loc, radius, color, text) {
        super()
        this.loc = loc
        this.radius = radius
        this.color = color
        this.text = text
        this.move(this.loc)
    }

    move (to) {
        this.loc = to
        if (this.text) { this.text.loc = { x: to.x, y: to.y + this.text.size / 4 } }
    }

    draw (rend) {
        rend.setColor(this.color)

        rend.ctx.beginPath()
        rend.ctx.arc(this.loc.x, this.loc.y, this.radius, 0, 2 * Math.PI)
        rend.ctx.fill()

        if (this.text) { this.text.draw(rend) }

        rend.resetColor()
    }
}
