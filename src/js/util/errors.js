export class UnknownStateError extends Error {
    constructor (state) {
        super()
        this.name = 'UnknownState'
        this.message = `state ${state} does not exist`
    }
}
