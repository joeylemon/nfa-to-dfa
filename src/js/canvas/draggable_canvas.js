import Renderer from './renderer.js'
import StraightLine from './drawables/straight_line.js'
import Circle from './drawables/circle.js'
import { distance } from '../util/util.js'
import { GRID_CELL_SIZE, GRID_SIZE } from '../util/constant.js'
import Drawable from './drawables/drawable.js'

export default class DraggableCanvas {
    /**
     * DraggableCanvas represents a canvas element with added functionality such as:
     *   - zooming and panning the canvas
     *   - adding and removing objects with custom draw functions
     *
     * @param {String} selector The query selector to get the canvas element
     */
    constructor (selector) {
        this.canvas = document.querySelector(selector)

        // Perform some sanity checks on the element
        if (this.canvas === null) { throw new Error(`cannot create canvas because the given selector ${selector} does not exist`) }
        if (!(this.canvas instanceof HTMLCanvasElement)) { throw new Error('cannot create canvas because the given element is not a canvas') }

        this.ctx = this.canvas.getContext('2d')

        // Find optimal pixel ratio for the user's screen
        const dpr = window.devicePixelRatio || 1
        const bsr = this.ctx.webkitBackingStorePixelRatio ||
            this.ctx.mozBackingStorePixelRatio ||
            this.ctx.msBackingStorePixelRatio ||
            this.ctx.oBackingStorePixelRatio ||
            this.ctx.backingStorePixelRatio || 1
        this.pixelRatio = dpr / bsr

        // Initialize the canvas with the pixel ratio
        const width = this.canvas.clientWidth
        const height = this.canvas.clientHeight
        this.canvas.width = width * this.pixelRatio
        this.canvas.height = height * this.pixelRatio
        this.canvas.style.width = `${width}px`
        this.canvas.style.height = `${height}px`
        this.ctx.setTransform(this.pixelRatio, 0, 0, this.pixelRatio, 0, 0)

        // Translating by 0.5 helps to make lines less sharp
        this.ctx.translate(0.5, 0.5)

        this.canvas.addEventListener('mousedown', function (e) {
            const loc = { x: e.offsetX, y: e.offsetY }

            const obj = this.getObjectAt(loc)
            if (obj) {
                // If we found an object on the mousedown location, start dragging it
                this.draggingObject = obj
            } else {
                // Otherwise, we want to pan the canvas
                this.panGrabLocation = this.normalizeLocation(loc)
            }
        }.bind(this))

        this.canvas.addEventListener('mousemove', function (e) {
            const loc = { x: e.offsetX, y: e.offsetY }

            if (this.panGrabLocation) {
                // Pan the canvas by the difference between the mouse location and the grab location
                this.pan(this.normalizeLocation(loc).x - this.panGrabLocation.x, this.normalizeLocation(loc).y - this.panGrabLocation.y)
                this.objectsChanged = true
            } else if (this.draggingObject) {
                // Move the object to the new mouse location
                this.draggingObject.move(this.normalizeLocation(loc))
                this.objectsChanged = true
            }
        }.bind(this))

        this.canvas.addEventListener('mouseup', function (e) {
            const loc = { x: e.offsetX, y: e.offsetY }

            if (this.panGrabLocation) {
                this.objectsChanged = true
                this.panGrabLocation = undefined
            } else if (this.draggingObject) {
                this.draggingObject.move(this.normalizeLocation(loc))
                this.objectsChanged = true
                this.draggingObject = undefined
            }
        }.bind(this))

        this.renderer = new Renderer(this.canvas, this.ctx)
        this.objectsChanged = true
        this.panGrabLocation = undefined
        this.draggingObject = undefined
        this.objects = []
        this.translation = { x: 0, y: 0 }
        this.scale = 1
    }

    /**
     * Add an object to the canvas to be drawn
     *
     * @param {Drawable} drawable The object to add to the canvas, which extends the Drawable class
     */
    addObject (drawable) {
        if (!(drawable instanceof Drawable)) { throw new Error('object is not an instance of Drawable') }

        this.objects.push(drawable)
        this.objectsChanged = true
    }

    /**
     * Find the object, if it exists, at the given location
     *
     * @param {Location} loc The location to find an object at
     */
    getObjectAt (loc) {
        loc = this.normalizeLocation(loc)

        for (const obj of this.objects) {
            if (obj instanceof Circle) {
                if (distance(loc, obj.loc) < obj.radius) return obj
            }
        }

        return undefined
    }

    /**
     * Normalize a raw canvas location to a scaled and translated location, since the canvas can be panned and zoomed
     *
     * @param {Location} loc The location to normalize
     */
    normalizeLocation (loc) {
        return { x: loc.x / this.scale - this.translation.x, y: loc.y / this.scale - this.translation.y }
    }

    /**
     * Pan the canvas by the given deltas
     *
     * @param {Number} x The amount to pan in the x direction
     * @param {Number} y The amount to pan in the y direction
     */
    pan (x, y) {
        if (Math.abs(this.translation.x + x) < GRID_SIZE) {
            this.translation.x += x
            this.ctx.translate(x, 0)
        }

        if (Math.abs(this.translation.y + y) < GRID_SIZE) {
            this.translation.y += y
            this.ctx.translate(0, y)
        }
    }

    /**
     * Draw the background grid of lines on the canvas
     */
    drawGrid () {
        for (let x = -GRID_SIZE; x < this.canvas.width + GRID_SIZE; x += GRID_CELL_SIZE) {
            new StraightLine({ x: x, y: -GRID_SIZE }, { x: x, y: this.canvas.height + GRID_SIZE }, 1, 'rgba(0,0,0,0.06)').draw(this.renderer)
        }

        for (let y = -GRID_SIZE; y < this.canvas.height + GRID_SIZE; y += GRID_CELL_SIZE) {
            new StraightLine({ x: -GRID_SIZE, y: y }, { x: this.canvas.width + GRID_SIZE, y: y }, 1, 'rgba(0,0,0,0.06)').draw(this.renderer)
        }
    }

    /**
     * Draw all objects onto the canvas
     */
    draw () {
        if (!this.objectsChanged) { return }

        this.ctx.clearRect(-this.translation.x, -this.translation.y - 1, this.canvas.width, this.canvas.height + 2)
        this.drawGrid()
        this.objects.forEach(e => e.draw(this.renderer))
        this.objectsChanged = false
        // console.log("something changed, draw a new frame")
    }
}
