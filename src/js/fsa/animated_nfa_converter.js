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

    step (onError) {
        try {
            const [newDFA, step] = this.converter.stepForward()
            if (newDFA && step) {
                this.visualDFA.performStep(step, newDFA)
                document.querySelector('#dfa-conversion-step').innerHTML = step.desc
            } else {
                this.stop()
                this.dispatchEvent('complete')
            }
        } catch (e) {
            onError(e)
            this.stop()
        }
    }

    play (onError) {
        this.dispatchEvent('start')
        this.step()
        this.interval = setInterval(() => {
            this.step(onError)
        }, this.speed)
    }
}
