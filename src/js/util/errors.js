export class UnknownStateError extends Error {
    constructor (state) {
        super()
        this.name = 'UnknownState'
        this.message = `state ${state} does not exist`
    }
}

export class UnknownSymbolError extends Error {
    constructor (symbol) {
        super()
        this.name = 'UnknownSymbol'
        this.message = `symbol ${symbol} does not exist`
    }
}
