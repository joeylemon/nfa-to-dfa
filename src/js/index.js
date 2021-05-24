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
const visualNFA = new VisualFSA(nfaTest, true)
visualNFA.setAlphabet(['a', 'b'])
visualNFA.addNode('q1', new Location(200, 100))
visualNFA.addNode('q2', new Location(600, 100))
visualNFA.addNode('q3', new Location(400, 400))
visualNFA.addTransition('q1', 'q2', 'a')
visualNFA.addTransition('q1', 'q2', 'b')
visualNFA.addTransition('q2', 'q1', 'a')
visualNFA.addTransition('q2', 'q3', 'a')
visualNFA.addTransition('q3', 'q1', 'b')
visualNFA.addTransition('q3', 'q2', 'ε')
visualNFA.addTransition('q3', 'q2', 'a')
visualNFA.render(nfaCanvas)

const dfaCanvas = new DraggableCanvas('#dfa')

draw()
function draw () {
    nfaCanvas.draw()
    dfaCanvas.draw()
    window.requestAnimationFrame(draw)
}
