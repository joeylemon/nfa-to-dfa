export function distance (loc1, loc2) {
    return Math.hypot(loc2.x - loc1.x, loc2.y - loc1.y)
}

export function angleBetween (from, to) {
    return Math.atan2(to.y - from.y, to.x - from.x)
}

export function moveToAngle (from, angle, distance) {
    return {
        x: from.x + Math.cos(angle) * distance,
        y: from.y + Math.sin(angle) * distance
    }
}

export function moveFromAngle (from, angle, distance) {
    return {
        x: from.x - Math.cos(angle) * distance,
        y: from.y - Math.sin(angle) * distance
    }
}
