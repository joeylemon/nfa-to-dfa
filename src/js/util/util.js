export function distance (loc1, loc2) {
    return Math.hypot(loc2.x - loc1.x, loc2.y - loc1.y)
}
