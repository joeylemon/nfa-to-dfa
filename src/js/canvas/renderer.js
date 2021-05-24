export default class Renderer {
    /**
     * Renderer adds some helper functions to render objects onto the canvas
     *
     * @param {Element} canvas The canvas element
     * @param {CanvasRenderingContext2D} ctx The 2D context of the canvas element
     */
    constructor (canvas, ctx) {
        this.canvas = canvas
        this.ctx = ctx

        this.defaultColor = '#000'
    }

    /**
     * Rotate the drawing context so later drawings will be rotated. The rotation must be manually reset
     * with unrotate()
     *
     * @param {Number} angle The angle at which to rotate the canvas (in degrees)
     * @param {Position} drawLoc The location that will be drawn at (must draw the desired object at 0, 0)
     *
     * @example
     *     canvas.renderer.rotate(Math.PI, {x: 25, y: 50})
     *     canvas.renderer.drawText('Hello world!', 15, {x: 0, y: 0})
     */
    rotate (angle, drawLoc) {
        this.ctx.save()
        this.ctx.translate(drawLoc.x, drawLoc.y)
        this.ctx.rotate(angle)
    }

    /**
     * Restore the drawing context to undo the rotation
     */
    unrotate () {
        this.ctx.restore()
    }

    /**
     * Set the color of the drawing context
     *
     * @param {String} color The new color (e.g. '#000' or 'rgba(0,0,0,0.5)')
     */
    setColor (color) {
        this.ctx.fillStyle = color
        this.ctx.strokeStyle = color
    }

    /**
     * Restore the default drawing color
     */
    resetColor () {
        this.ctx.fillStyle = this.defaultColor
        this.ctx.strokeStyle = this.defaultColor
    }
}
