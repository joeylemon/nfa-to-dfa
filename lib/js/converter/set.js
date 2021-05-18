/*
   First, we're going to dangerously modify the Array prototype
   to be able to generically call equals(). This allows us to
   compare sets of states within the set
*/

/*
   Array.equals(rhs)
   Compares the arrays element by element
*/
// eslint-disable-next-line no-extend-native
Array.prototype.equals = function (rhs) {
    const a1 = this
    const a2 = rhs

    if (!rhs) return false

    if (a1.length !== a2.length) { return false }

    for (let i = 0, l = a1.length; i < l; i++) {
        if (a1[i] instanceof Array && a2[i] instanceof Array) {
            if (!a1[i].equals(a2[i])) { return false }
        } else if (a1[i] !== a2[i]) { return false }
    }
    return true
}

/*
   Now define the Set prototype
*/

function Set (elemv) {
    if (!Set.prototype.insert) { Set.prototype.insert = function () { } }

    this.data = []

    if (arguments.length === 1) {
        for (let i = 0; i < elemv.length; i++) { this.insert(elemv[i]) }
    }
}

Set.prototype.insert = function (elem) {
    if (this.has(elem)) return false
    this.data.push(elem)
    return true
}

Set.prototype.remove = function (elem) {
    if (elem instanceof Array) {
        for (let i = 0; i < this.data.length; i++) {
            if (this.data[i].equals(elem)) {
                this.data.splice(i, 1)
                return true
            }
        }
        return false
    }

    const idx = this.data.indexOf(elem)
    if (idx === -1) return false
    this.data.splice(idx, 1)
    return true
}

Set.prototype.has = function (elem) {
    if (elem instanceof Array) {
        for (let i = 0; i < this.data.length; i++) {
            if (this.data[i].equals(elem)) return true
        }
        return false
    } else {
        if (this.data.indexOf(elem) === -1) { return false }
        return true
    }
}

Set.prototype.values = function () {
    return this.data.slice(0)
}

Set.prototype.equals = function (rhs) {
    this.data.sort()
    rhs.data.sort()

    return this.data.equals(rhs.data)
}

Set.prototype.toArray = function () {
    return this.data.slice(0)
}

Set.prototype.size = function () {
    return this.data.length
}
