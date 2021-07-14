import NFAConverter from './fsa/nfa_converter.js'
import DraggableCanvas from './canvas/draggable_canvas.js'
import VisualFSA from './fsa/visual_fsa.js'
import { keepHeightSynced, showWarning, downloadFile, selectFile } from './util/util.js'
import AnimatedNFAConverter from './fsa/animated_nfa_converter.js'
import FSADescription from './elements/fsa_description.js'

keepHeightSynced([['#dfa-title', '#nfa-title']])

const nfa = {
    visual: new VisualFSA(new DraggableCanvas('#nfa'), false),
    desc: new FSADescription('#nfa-delta-transitions')
}

const dfa = {
    visual: new VisualFSA(new DraggableCanvas('#dfa'), true),
    desc: new FSADescription('#dfa-delta-transitions')
}

nfa.visual.addEventListener('change', () => {
    if (nfa.visual.fsa.states.length > 0) {
        setEditButtonsState(true)
        nfa.desc.update(nfa.visual.fsa, true)
    } else {
        setEditButtonsState(false)
        nfa.desc.reset()
    }
})

dfa.visual.addEventListener('change', () => {
    if (dfa.visual.fsa.states.length > 0) {
        dfa.desc.update(dfa.visual.fsa, false)
        document.querySelector('#step-backward').disabled = false
    } else {
        dfa.desc.reset()
        document.querySelector('#step-backward').disabled = true
    }
})

/**
 * Draw the canvas any time there is a change to its elements
 */
draw()
function draw () {
    nfa.visual.draggableCanvas.draw()
    dfa.visual.draggableCanvas.draw()
    window.requestAnimationFrame(draw)
}

/**
 * Update the edit buttons enabled state
 *
 * @param {Boolean} enabled True to enable the buttons, false to disable the buttons
 * @param {Boolean} onlyDFA True to only affect the DFA buttons
 */
function setEditButtonsState (enabled, onlyDFA) {
    if (!onlyDFA) {
        document.querySelector('#export').disabled = !enabled
        document.querySelector('#nfa-reset').disabled = !enabled
        document.querySelector('#dfa-reset').disabled = !enabled
    }

    document.querySelectorAll('.conversion-button').forEach(e => {
        e.disabled = !enabled
    })
    document.querySelector('#dfa-conversion-step').innerHTML = ''
}

/**
 * Ensure the NFA has the appropriate values to begin a conversion to a DFA
 * @returns {Boolean} True if the NFA is valid, false if not
 */
function validateNFA () {
    if (nfa.visual.fsa.states.length === 0) {
        showWarning('You must add states to the NFA before performing the conversion.')
        return false
    }

    if (!nfa.visual.fsa.startState || nfa.visual.fsa.startState === '') {
        showWarning('You must set the start state in the NFA before performing the conversion.')
        return false
    }

    if (nfa.visual.fsa.alphabet.length === 0) {
        showWarning('You must add at least one transition to establish an alphabet.')
        return false
    }

    return true
}

let converter
let animatedConverter

/**
 * Advance the NFA conversion one-by-one with the step forward button
 */
document.querySelector('#step-forward').addEventListener('click', () => {
    if (!validateNFA()) return

    if (animatedConverter) {
        animatedConverter.stop()
        animatedConverter = undefined
    }

    if (!converter || !converter.nfa.startState) {
        converter = new NFAConverter(nfa.visual.fsa.clone())
    }

    try {
        const [newDFA, step] = converter.stepForward()
        if (newDFA && step) {
            console.log(step, newDFA)
            dfa.visual.performStep(step, newDFA)
            document.querySelector('#dfa-conversion-step').innerHTML = step.desc
        } else {
            setEditButtonsState(false, true)
        }
    } catch (e) {
        showWarning(e.message)
        converter = undefined
        dfa.visual.reset()
    }
})

/**
 * Undo the NFA conversion one-by-one with the step backward button
 */
document.querySelector('#step-backward').addEventListener('click', () => {
    if (!converter) return

    if (animatedConverter) {
        animatedConverter.stop()
        animatedConverter = undefined
    }

    const [prevDFA, prevStep] = converter.stepBackward()
    if (prevDFA && prevStep) {
        dfa.visual.undoStep(prevStep, prevDFA)
        setEditButtonsState(true, true)
        document.querySelector('#dfa-conversion-step').innerHTML = `<span class="tag is-warning" style="margin-right: 5px;">Undo</span> ${prevStep.desc}`
    }
})

/**
 * Begin an automatic conversion animation with the animate button
 */
document.querySelector('#animate').addEventListener('click', () => {
    if (!validateNFA()) return

    if (!animatedConverter) {
        if (!converter) {
            converter = new NFAConverter(nfa.visual.fsa.clone())
        }

        animatedConverter = new AnimatedNFAConverter(converter, dfa.visual, 750)

        animatedConverter.addEventListener('start', () => {
            document.querySelector('#animate').innerHTML = '<i class="mdi mdi-pause" aria-hidden="true"></i>Pause'
        })

        animatedConverter.addEventListener('stop', () => {
            document.querySelector('#animate').innerHTML = '<i class="mdi mdi-play" aria-hidden="true"></i>Animate'
        })

        animatedConverter.addEventListener('complete', () => {
            setEditButtonsState(false, true)
        })

        animatedConverter.play(err => {
            showWarning(err.message)
            converter = undefined
            animatedConverter = undefined
            dfa.visual.reset()
        })
    } else {
        animatedConverter.stop()
        animatedConverter = undefined
    }
})

/**
 * Fully complete the conversion with the complete button
 */
document.querySelector('#complete').addEventListener('click', () => {
    if (!validateNFA()) return

    if (animatedConverter) {
        animatedConverter.stop()
        animatedConverter = undefined
    }

    if (!converter) {
        converter = new NFAConverter(nfa.visual.fsa.clone())
    }

    try {
        const changes = converter.complete()
        if (changes.length > 0) {
            for (const change of changes) {
                const [newDFA, step] = change
                dfa.visual.performStep(step, newDFA)
            }
        }

        setEditButtonsState(false, true)
    } catch (e) {
        showWarning(e.message)
        converter = undefined
        dfa.visual.reset()
    }
})

/**
 * Clear the DFA with the reset button
 */
document.querySelector('#dfa-reset').addEventListener('click', () => {
    setEditButtonsState(true, true)

    if (animatedConverter) {
        animatedConverter.stop()
        animatedConverter = undefined
    }

    dfa.visual.reset()
    converter = undefined
})

/**
 * Clear the NFA with the reset button
 */
document.querySelector('#nfa-reset').addEventListener('click', () => {
    nfa.visual.reset()
    dfa.visual.reset()
    converter = undefined
})

/**
 * Download the NFA to a file with the export button
 */
document.querySelector('#export').addEventListener('click', () => {
    downloadFile('nfa.json', nfa.visual.toJSON())
})

/**
 * Upload a saved NFA file with the import button
 */
document.querySelector('#import').addEventListener('click', () => {
    selectFile().then(contents => {
        try {
            nfa.visual.fromJSON(contents)
        } catch (e) {
            showWarning('The given file is improperly formatted.')
        }
    })
})

/**
 * Show dropdowns when the dropdown trigger is clicked
 */
document.querySelectorAll('.dropdown-trigger button').forEach(e => e.addEventListener('click', e => {
    e.stopPropagation()
    e.target.parentElement.parentElement.classList.toggle('is-active')
}))

/**
 * Remove all dropdowns when the user clicks elsewhere on the page
 */
window.addEventListener('click', () => {
    document.querySelectorAll('.dropdown').forEach(e => e.classList.remove('is-active'))
})

/**
 * Open the NFA help modal on help button click
 */
document.querySelector('#nfa-help-button').addEventListener('click', () => {
    document.querySelector('#nfa-help-modal').classList.add('is-active')
    document.querySelectorAll('.modal-card-head').forEach(e => {
        e.style.display = 'flex'
    })
})

/**
 * Open the DFA help modal on help button click
 */
document.querySelector('#dfa-help-button').addEventListener('click', () => {
    document.querySelector('#dfa-help-modal').classList.add('is-active')
    document.querySelectorAll('.modal-card-head').forEach(e => {
        e.style.display = 'flex'
    })
})

/**
 * Close modals when the background is pressed
 */
document.querySelectorAll('.modal-close-background').forEach(e => e.addEventListener('click', e => {
    e.target.parentElement.classList.toggle('is-active')
}))

/**
 * Close modals when the close button is pressed
 */
document.querySelectorAll('.modal-close-button').forEach(e => e.addEventListener('click', e => {
    e.preventDefault()
    e.target.parentElement.parentElement.parentElement.classList.toggle('is-active')
}))

/**
 * Set the NFA to a preset configuration with the preset button
 */
document.querySelector('#preset-1').addEventListener('click', () => {
    nfa.visual.fromJSON('{"nodes":[{"label":"1","loc":{"x":200,"y":100},"transitionText":{"2":["b"],"3":["ε"]},"acceptState":true},{"label":"2","loc":{"x":600,"y":100},"transitionText":{"2":["a"],"3":["a","b"]}},{"label":"3","loc":{"x":400,"y":400},"transitionText":{"1":["a"]}}],"fsa":{"states":["1","2","3"],"alphabet":["a","b"],"transitions":{"1":{"b":["2"],"ε":["3"]},"2":{"a":["2","3"],"b":["3"]},"3":{"a":["1"]}},"startState":"1","acceptStates":["1"]}}')
})

/**
 * Set the NFA to a preset configuration with the preset button
 */
document.querySelector('#preset-2').addEventListener('click', () => {
    nfa.visual.fromJSON('{"nodes":[{"label":"1","loc":{"x":154,"y":108},"transitionText":{"2":["ε"],"3":["a"]}},{"label":"2","loc":{"x":535,"y":106},"transitionText":{},"acceptState":true},{"label":"3","loc":{"x":334,"y":362},"transitionText":{"2":["a","b"]}}],"fsa":{"states":["1","2","3"],"alphabet":["a","b"],"transitions":{"1":{"ε":["2"],"a":["3"]},"3":{"a":["2"],"b":["2"]}},"startState":"1","acceptStates":["2"]}}')
})

/**
 * Set the NFA to a preset configuration with the preset button
 */
document.querySelector('#preset-3').addEventListener('click', () => {
    nfa.visual.fromJSON('{"nodes":[{"label":"1","loc":{"x":206,"y":119},"transitionText":{"2":["b"],"3":["ε"]}},{"label":"2","loc":{"x":560,"y":119},"transitionText":{"1":["a"],"2":["b"]},"acceptState":true},{"label":"3","loc":{"x":375,"y":388},"transitionText":{"2":["a"],"3":["a","b"]}}],"fsa":{"states":["1","2","3"],"alphabet":["a","b"],"transitions":{"1":{"ε":["3"],"b":["2"]},"2":{"b":["2"],"a":["1"]},"3":{"a":["2","3"],"b":["3"]}},"startState":"1","acceptStates":["2"]}}')
})
