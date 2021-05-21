import FSA from './fsa/fsa.js'
import NFAConverter from './fsa/nfa_converter.js'
import DraggableCanvas from './canvas/draggable_canvas.js'
import VisualFSA from './fsa/visual_fsa.js'

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
visualNFA.addNode('q1', { x: 200, y: 200 })
visualNFA.addNode('q2', { x: 300, y: 200 })
visualNFA.addNode('q3', { x: 250, y: 300 })
visualNFA.addTransition('q1', 'q2', 'a')
visualNFA.render(nfaCanvas)
// nfaCanvas.addObject(new Circle({ x: 50, y: 50 }, 20, 'darkblue', new Text(null, 'q1', 24, '#fff', 'Helvetica')))
// nfaCanvas.addObject(new Circle({ x: 150, y: 50 }, 20, 'darkblue', new Text(null, 'q2', 24, '#fff', 'Helvetica')))
// nfaCanvas.addObject(new Circle({ x: 100, y: 150 }, 20, 'darkblue', new Text(null, 'q3', 24, '#fff', 'Helvetica')))

const dfaCanvas = new DraggableCanvas('#dfa')
// dfaCanvas.addObject(new Circle({ x: 150, y: 150 }, 20, 'darkred', new Text(null, '1', 24, '#fff', 'Helvetica')))
// dfaCanvas.addObject(new Circle({ x: 0, y: 0 }, 5, 'green'))

draw()
function draw () {
    nfaCanvas.draw()
    dfaCanvas.draw()
    window.requestAnimationFrame(draw)
}
