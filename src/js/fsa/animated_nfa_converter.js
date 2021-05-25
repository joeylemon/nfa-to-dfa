import EventHandler from '../util/event_handler.js'

export default class AnimatedNFAConverter extends EventHandler {
    constructor (converter, visualDFA, speed) {
        super()
        this.converter = converter
        this.visualDFA = visualDFA
        this.speed = speed
    }

    stop () {
        if (this.interval) {
            clearInterval(this.interval)
            this.dispatchEvent('stop')
        }
    }

    step () {
        const [newDFA, step] = this.converter.stepForward()
        if (newDFA && step) {
            this.visualDFA.syncDFA(step, newDFA)
        } else {
            this.stop()
        }
    }

    play () {
        this.dispatchEvent('start')
        this.step()
        this.interval = setInterval(this.step.bind(this), this.speed)
    }
}
