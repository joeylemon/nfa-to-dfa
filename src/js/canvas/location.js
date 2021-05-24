export default class Location {
    /**
     * Location represents a Cartesian point on a grid with an x- and y-coordinate
     *
     * @param {Number} x The x-coordinate of the location
     * @param {Number} y The y-coordinate of the location
     */
    constructor (x, y) {
        this.x = x
        this.y = y
    }

    distance (to) {
        return Math.hypot(to.x - this.x, to.y - this.y)
    }

    angleTo (to) {
        return Math.atan2(to.y - this.y, to.x - this.x)
    }

    moveToAngle (angle, distance) {
        return new Location(this.x + Math.cos(angle) * distance, this.y + Math.sin(angle) * distance)
    }

    moveFromAngle (angle, distance) {
        return new Location(this.x - Math.cos(angle) * distance, this.y - Math.sin(angle) * distance)
    }
}
