import Drawable from './drawable.js'
import Arrow from './arrow.js'
import StraightLine from './straight_line.js'

export default class ArrowedStraightLine extends Drawable {
    /**
     * @param {Location} from The initial location to start the line
     * @param {Location} to The end location to end the line
     * @param {Object} options The options with which to draw the line
     * @example
     *     new ArrowedStraightLine(new Location(0, 0), new Location(50, 0), {
     *         width: 5,
     *         color: '#fff',
     *         dash: [10, 2],
     *         arrowRadius: 5
     *     })
     */
    constructor (from, to, options) {
        super()
        this.straightLine = new StraightLine(from, to, options)
        this.arrowhead = new Arrow(from, to, options)
    }

    draw (rend) {
        this.straightLine.draw(rend)
        this.arrowhead.draw(rend)
    }
}
