import Drawable from './drawable.js'

export default class Text extends Drawable {
    /**
     * @param {Location} loc The location to draw the text
     * @param {String} text The text to draw
     * @param {Number} size The size of the text in pixels
     * @param {String} color The color of the text
     * @param {String} font The font of the text
     */
    constructor (loc, text, size, color, font) {
        super()
        this.loc = loc
        this.text = text
        this.size = size
        this.color = color
        this.font = font
    }

    draw (rend) {
        rend.setColor(this.color)

        rend.ctx.textAlign = 'center'
        rend.ctx.font = `${this.size}px ${this.font}`
        rend.ctx.fillText(this.text, this.loc.x, this.loc.y)

        rend.resetColor()
    }
}
