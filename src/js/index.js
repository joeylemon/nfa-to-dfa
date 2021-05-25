import FSA from './fsa/fsa.js'
import NFAConverter from './fsa/nfa_converter.js'
import DraggableCanvas from './canvas/draggable_canvas.js'
import VisualFSA from './fsa/visual_fsa.js'
import { keepElementsHeightSynced, showWarning, downloadFile, selectFile } from './util/util.js'
import AnimatedNFAConverter from './fsa/animated_nfa_converter.js'

keepElementsHeightSynced([['#dfa-instructions', '#nfa-instructions'], ['#dfa-title', '#nfa-title']])

const nfaCanvas = new DraggableCanvas('#nfa')
const dfaCanvas = new DraggableCanvas('#dfa')
const visualNFA = new VisualFSA(nfaCanvas, false)
const visualDFA = new VisualFSA(dfaCanvas, true)

let converter
let animatedConverter

function validateNFA () {
    if (visualNFA.fsa.states.length === 0) {
        showWarning('#dfa-warning', 'You must add states to the NFA before performing the conversion.')
        return false
    }

    if (!visualNFA.fsa.startState || visualNFA.fsa.startState === '') {
        showWarning('#dfa-warning', 'You must set the start state in the NFA before performing the conversion.')
        return false
    }

    if (visualNFA.fsa.alphabet.length === 0) {
        showWarning('#dfa-warning', 'You must add at least one transition to establish an alphabet.')
        return false
    }

    return true
}

/**
 * Advance the NFA conversion one-by-one with the step button
 */
document.querySelector('#step').addEventListener('click', () => {
    if (!validateNFA()) return

    if (animatedConverter) {
        animatedConverter.stop()
        animatedConverter = undefined
    }

    if (!converter || !converter.nfa.startState) {
        converter = new NFAConverter(visualNFA.fsa)
        console.log(converter)
    }

    const [newDFA, step] = converter.stepForward()
    if (newDFA && step) {
        console.log(step, newDFA)
        visualDFA.syncDFA(step, newDFA)
        document.querySelector('#dfa-conversion-step').innerHTML = step.desc
    } else {
        document.querySelectorAll('.conversion-button').forEach(e => {
            e.disabled = true
        })
        document.querySelector('#dfa-conversion-step').innerHTML = ''
    }
})

/**
 * Begin an automatic conversion animation with the animate button
 */
document.querySelector('#animate').addEventListener('click', () => {
    if (!validateNFA()) return

    if (!animatedConverter) {
        if (!converter) {
            converter = new NFAConverter(visualNFA.fsa)
        }

        animatedConverter = new AnimatedNFAConverter(converter, visualDFA, 750)

        animatedConverter.addEventListener('start', () => {
            document.querySelector('#animate').innerHTML = '<i class="mdi mdi-pause" aria-hidden="true"></i>Pause'
        })

        animatedConverter.addEventListener('stop', () => {
            document.querySelector('#animate').innerHTML = '<i class="mdi mdi-play" aria-hidden="true"></i>Animate'
        })

        animatedConverter.addEventListener('complete', () => {
            document.querySelectorAll('.conversion-button').forEach(e => {
                e.disabled = true
            })
            document.querySelector('#dfa-conversion-step').innerHTML = ''
        })

        animatedConverter.play()
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
        converter = new NFAConverter(visualNFA.fsa)
    }

    const changes = converter.complete()
    if (changes.length > 0) {
        for (const change of changes) {
            const [newDFA, step] = change
            visualDFA.syncDFA(step, newDFA)
        }
    }

    document.querySelectorAll('.conversion-button').forEach(e => {
        e.disabled = true
    })
})

/**
 * Clear the DFA with the reset button
 */
document.querySelector('#reset').addEventListener('click', () => {
    document.querySelectorAll('.conversion-button').forEach(e => {
        e.disabled = false
    })
    document.querySelector('#dfa-conversion-step').innerHTML = ''

    if (animatedConverter) {
        animatedConverter.stop()
        animatedConverter = undefined
    }

    visualDFA.fromJSON({
        nodes: [],
        fsa: new FSA([], [], {}, undefined, [])
    })
    converter = new NFAConverter(visualNFA.fsa)
})

/**
 * Download the NFA to a file with the export button
 */
document.querySelector('#export').addEventListener('click', () => {
    downloadFile('nfa.json', visualNFA.toJSON())
})

/**
 * Upload a saved NFA file with the import button
 */
document.querySelector('#import').addEventListener('click', () => {
    selectFile().then(contents => {
        try {
            const obj = JSON.parse(contents)
            if (obj.nodes && obj.fsa) {
                visualNFA.fromJSON(obj)
            } else {
                showWarning('#nfa-warning', 'The given file is improperly formatted.')
            }
        } catch (e) {
            showWarning('#nfa-warning', 'The given file is improperly formatted.')
        }
    })
})

/**
 * Show the preset dropdown with the preset button
 */
document.querySelector('#dropdown-trigger').addEventListener('click', e => {
    e.stopPropagation()
    document.querySelector('#preset-dropdown').classList.toggle('is-active')
})

/**
 * Remove the preset dropdown when the user clicks elsewhere on the page
 */
window.addEventListener('click', () => {
    document.querySelector('#preset-dropdown').classList.remove('is-active')
})

/**
 * Set the NFA to a preset configuration with the preset button
 */
document.querySelector('#preset-1').addEventListener('click', () => {
    visualNFA.fromJSON({ 'nodes': [{ 'label': '1', 'loc': { 'x': 200, 'y': 100 }, 'transitionText': { '2': ['b'], '3': ['ε'] }, 'acceptState': true }, { 'label': '2', 'loc': { 'x': 600, 'y': 100 }, 'transitionText': { '2': ['a'], '3': ['a', 'b'] } }, { 'label': '3', 'loc': { 'x': 400, 'y': 400 }, 'transitionText': { '1': ['a'] } }], 'fsa': { 'states': ['1', '2', '3'], 'alphabet': ['a', 'b'], 'transitions': { '1': { 'b': ['2'], 'ε': ['3'] }, '2': { 'a': ['2', '3'], 'b': ['3'] }, '3': { 'a': ['1'] } }, 'startState': '1', 'acceptStates': ['1'] } })
})

/**
 * Set the NFA to a preset configuration with the preset button
 */
document.querySelector('#preset-2').addEventListener('click', () => {
    visualNFA.fromJSON({ 'nodes': [{ 'label': '1', 'loc': { 'x': 154, 'y': 108 }, 'transitionText': { '2': ['ε'], '3': ['a'] } }, { 'label': '2', 'loc': { 'x': 535, 'y': 106 }, 'transitionText': {}, 'acceptState': true }, { 'label': '3', 'loc': { 'x': 334, 'y': 362 }, 'transitionText': { '2': ['a', 'b'] } }], 'fsa': { 'states': ['1', '2', '3'], 'alphabet': ['a', 'b'], 'transitions': { '1': { 'ε': ['2'], 'a': ['3'] }, '3': { 'a': ['2'], 'b': ['2'] } }, 'startState': '1', 'acceptStates': ['2'] } })
})

draw()
function draw () {
    nfaCanvas.draw()
    dfaCanvas.draw()
    window.requestAnimationFrame(draw)
}
