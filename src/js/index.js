import FSA from './fsa/fsa.js'
import NFAConverter from './fsa/nfa_converter.js'
import DraggableCanvas from './canvas/draggable_canvas.js'
import VisualFSA from './fsa/visual_fsa.js'
import Location from './canvas/location.js'

// const nfaTest = new FSA(['1', '2', '3'], ['a', 'b'], {
//     '1': {
//         'a': undefined,
//         'b': ['2'],
//         'ε': ['3']
//     },
//     '2': {
//         'a': ['2', '3'],
//         'b': ['3'],
//         'ε': undefined
//     },
//     '3': {
//         'a': ['1'],
//         'b': undefined,
//         'ε': undefined
//     }
// }, '1', ['1'])

// console.log(nfaTest)

// const nfaConverter = new NFAConverter(nfaTest)
// console.log(nfaConverter.stepForward())
// console.log(nfaConverter)

const nfaTest = new FSA(['q1', 'q2', 'q3'], ['0', '1'], {
    'q1': {
        '0': ['q3'],
        '1': ['q2', 'q3'],
        'ε': undefined
    },
    'q2': {
        '0': ['q2'],
        '1': ['q2'],
        'ε': ['q3']
    },
    'q3': {
        '0': ['q2'],
        '1': ['q1', 'q2'],
        'ε': undefined
    }
}, 'q1', ['q1', 'q3'])

console.log(nfaTest)

const nfaConverter = new NFAConverter(nfaTest)
console.log(nfaConverter.stepForward())
console.log(nfaConverter)

const nfaCanvas = new DraggableCanvas('#nfa')
const dfaCanvas = new DraggableCanvas('#dfa')
const visualNFA = new VisualFSA(nfaCanvas, false)
const visualDFA = new VisualFSA(dfaCanvas, true)
visualNFA.addNode('1', new Location(200, 100))
visualNFA.addNode('2', new Location(600, 100))
visualNFA.addNode('3', new Location(400, 400))
visualNFA.addTransition('1', '2', 'b')
visualNFA.addTransition('1', '3', 'ε')
visualNFA.addTransition('2', '2', 'a')
visualNFA.addTransition('2', '3', 'a')
visualNFA.addTransition('2', '3', 'b')
visualNFA.addTransition('3', '1', 'a')
visualNFA.setStartState('1')
visualNFA.addAcceptState('1')
visualNFA.render()
visualDFA.render()

let converter
document.querySelector('#step').addEventListener('click', () => {
    if (!converter) {
        converter = new NFAConverter(visualNFA.fsa)
        console.log(converter)
    }

    const [newDFA, step] = converter.stepForward()
    if (newDFA && step) {
        console.log(step, newDFA)
        visualDFA.syncDFA(step, newDFA)
    } else {
        console.log('done')
    }
})

draw()
function draw () {
    nfaCanvas.draw()
    dfaCanvas.draw()
    window.requestAnimationFrame(draw)
}
