import should from 'should' // eslint-disable-line no-unused-vars
import jsdom from 'jsdom'

import { UnknownStateError } from '../util/errors.js'
import VisualFSA from '../fsa/visual_fsa.js'
import NFAConverter from '../fsa/nfa_converter.js'
import DraggableCanvas from '../canvas/draggable_canvas.js'
import Location from '../canvas/location.js'
import Circle from '../canvas/drawables/circle.js'
import QuadraticCurvedLine from '../canvas/drawables/quadratic_curved_line.js'
import BezierCurvedLine from '../canvas/drawables/bezier_curved_line.js'
import Text from '../canvas/drawables/text.js'
import ArrowedStraightLine from '../canvas/drawables/arrowed_straight_line.js'
import FSA from '../fsa/fsa.js'
const { JSDOM } = jsdom

function getVisualNFA () {
    const visualNFA = new VisualFSA(new DraggableCanvas('#nfa'), false)

    visualNFA.addNode('1', new Location(100, 100))
    visualNFA.addNode('2', new Location(200, 100))
    visualNFA.setStartState('1')
    visualNFA.addAcceptState('2')
    visualNFA.addTransition('1', '2', 'a')
    visualNFA.addTransition('1', '2', 'ε')
    visualNFA.addTransition('2', '1', 'b')
    visualNFA.addTransition('2', '2', 'b')

    return visualNFA
}

describe('Visual FSA', () => {
    before(done => {
        JSDOM.fromFile('./index.html').then(dom => {
            global.window = dom.window
            global.document = dom.window.document
            global.window.HTMLCanvasElement.prototype.getContext = () => {
                return {
                    setTransform: () => { },
                    translate: () => { }
                }
            }
            done()
        }).catch(err => console.error(err))
    })

    it('should import a saved json', done => {
        const visualNFA = new VisualFSA(new DraggableCanvas('#nfa'), false)

        visualNFA.fromJSON('{"nodes":[{"label":"1","loc":{"x":206,"y":119},"transitionText":{"2":["b"],"3":["ε"]}},{"label":"2","loc":{"x":560,"y":119},"transitionText":{"1":["a"],"2":["b"]},"acceptState":true},{"label":"3","loc":{"x":375,"y":388},"transitionText":{"2":["a"],"3":["a","b"]}}],"fsa":{"states":["1","2","3"],"alphabet":["a","b"],"transitions":{"1":{"ε":["3"],"b":["2"]},"2":{"b":["2"],"a":["1"]},"3":{"a":["2","3"],"b":["3"]}},"startState":"1","acceptStates":["2"]}}')

        visualNFA.fsa.should.be.instanceOf(FSA)

        visualNFA.fsa.states.should.eql(['1', '2', '3'])
        visualNFA.fsa.acceptStates.should.eql(['2'])
        visualNFA.fsa.startState.should.eql('1')
        visualNFA.fsa.alphabet.should.eql(['a', 'b'])
        visualNFA.fsa.transitions.should.eql({
            '1': { b: ['2'], ε: ['3'] },
            '2': { a: ['1'], b: ['2'] },
            '3': { a: ['2', '3'], b: ['3'] }
        })

        visualNFA.nodes.find(n => n.label === '1').loc.should.eql(new Location(206, 119))
        visualNFA.nodes.find(n => n.label === '2').loc.should.eql(new Location(560, 119))
        visualNFA.nodes.find(n => n.label === '3').loc.should.eql(new Location(375, 388))

        done()
    })

    it('should create a valid FSA', done => {
        const visualNFA = getVisualNFA()

        visualNFA.fsa.states.should.eql(['1', '2'])
        visualNFA.fsa.acceptStates.should.eql(['2'])
        visualNFA.fsa.startState.should.eql('1')
        visualNFA.fsa.alphabet.should.eql(['a', 'b'])
        visualNFA.fsa.transitions.should.eql({
            '1': { a: ['2'], ε: ['2'] },
            '2': { b: ['1', '2'] }
        })

        done()
    })

    it('should add objects to the canvas', done => {
        const visualNFA = getVisualNFA()
        visualNFA.render()
        let i = 0

        visualNFA.draggableCanvas.objects.length.should.be.above(0)
        visualNFA.draggableCanvas.objects[i++].should.be.instanceOf(QuadraticCurvedLine)
        visualNFA.draggableCanvas.objects[i++].should.be.instanceOf(Text)
        visualNFA.draggableCanvas.objects[i++].should.be.instanceOf(QuadraticCurvedLine)
        visualNFA.draggableCanvas.objects[i++].should.be.instanceOf(Text)
        visualNFA.draggableCanvas.objects[i++].should.be.instanceOf(BezierCurvedLine)
        visualNFA.draggableCanvas.objects[i++].should.be.instanceOf(Text)
        visualNFA.draggableCanvas.objects[i++].should.be.instanceOf(ArrowedStraightLine)
        visualNFA.draggableCanvas.objects[i++].should.be.instanceOf(Circle)
        visualNFA.draggableCanvas.objects[i].options.color.should.eql('green')
        visualNFA.draggableCanvas.objects[i].options.should.have.property('outlineOptions')
        visualNFA.draggableCanvas.objects[i++].should.be.instanceOf(Circle)

        done()
    })

    it('should remove transition and update alphabet', done => {
        const visualNFA = getVisualNFA()

        visualNFA.removeTransitions('1', '2')
        visualNFA.fsa.alphabet.should.eql(['b'])
        visualNFA.fsa.transitions.should.eql({
            '1': {},
            '2': { b: ['1', '2'] }
        })

        done()
    })

    it('should not allow modifying a node that does not exist', done => {
        const visualNFA = getVisualNFA()
        should(() => { visualNFA.setStartState('3') }).throw(new UnknownStateError('3'))
        should(() => { visualNFA.addAcceptState('3') }).throw(new UnknownStateError('3'))
        should(() => { visualNFA.removeAcceptState('3') }).throw(new UnknownStateError('3'))
        should(() => { visualNFA.removeNode('3') }).throw(new UnknownStateError('3'))
        should(() => { visualNFA.addTransition('1', '3', 'a') }).throw(new UnknownStateError('3'))

        done()
    })

    it('should initialize a DFA after the first conversion step', done => {
        const visualNFA = getVisualNFA()
        const visualDFA = new VisualFSA(new DraggableCanvas('#dfa'), true)
        const converter = new NFAConverter(visualNFA.fsa)

        const [newDFA, step] = converter.stepForward()
        visualDFA.performStep(step, newDFA)

        visualDFA.fsa.states.should.eql(['Ø', '1', '2', '1,2'])
        visualDFA.fsa.startState.should.eql('1,2')
        visualDFA.fsa.acceptStates.should.eql(['2', '1,2'])

        done()
    })

    it('should create a valid DFA after completing the conversion', done => {
        const visualNFA = getVisualNFA()
        const visualDFA = new VisualFSA(new DraggableCanvas('#dfa'), true)
        const converter = new NFAConverter(visualNFA.fsa)

        const changes = converter.complete()
        for (const change of changes) {
            const [newDFA, step] = change
            visualDFA.performStep(step, newDFA)
        }

        visualDFA.fsa.states.should.eql(['Ø', '2', '1,2'])
        visualDFA.fsa.startState.should.eql('1,2')
        visualDFA.fsa.acceptStates.should.eql(['2', '1,2'])
        visualDFA.fsa.transitions.should.eql({
            'Ø': { a: ['Ø'], b: ['Ø'] },
            '2': { a: ['Ø'], b: ['1,2'] },
            '1,2': { a: ['2'], b: ['1,2'] }
        })

        done()
    })

    it('should step backward in the DFA conversion', done => {
        const visualNFA = new VisualFSA(new DraggableCanvas('#nfa'), false)

        visualNFA.addNode('1', new Location(100, 100))
        visualNFA.addNode('2', new Location(100, 100))
        visualNFA.setStartState('1')
        visualNFA.addAcceptState('1')
        visualNFA.addTransition('1', '2', 'b')
        visualNFA.addTransition('1', '1', 'a')
        visualNFA.addTransition('2', '1', 'a')
        visualNFA.addTransition('2', '2', 'b')

        const visualDFA = new VisualFSA(new DraggableCanvas('#dfa'), true)
        const converter = new NFAConverter(visualNFA.fsa)

        for (let i = 0; i < 10; i++) {
            const [newDFA, step] = converter.stepForward()
            visualDFA.performStep(step, newDFA)
        }

        visualDFA.fsa.states.should.eql(['1', '2', '1,2'])
        visualDFA.fsa.startState.should.eql('1')
        visualDFA.fsa.acceptStates.should.eql(['1', '1,2'])
        visualDFA.fsa.transitions.should.eql({
            '1': { a: ['1'], b: ['2'] },
            '2': { a: ['1'], b: ['2'] },
            '1,2': { a: ['1'], b: ['2'] }
        })

        {
            const [prevDFA, step] = converter.stepBackward()
            visualDFA.undoStep(step, prevDFA)
        }

        visualDFA.fsa.states.should.eql(['1', '2', '1,2', 'Ø'])
        visualDFA.fsa.startState.should.eql('1')
        visualDFA.fsa.acceptStates.should.eql(['1', '1,2'])
        visualDFA.fsa.transitions.should.eql({
            'Ø': { a: ['Ø'], b: ['Ø'] },
            '1': { a: ['1'], b: ['2'] },
            '2': { a: ['1'], b: ['2'] },
            '1,2': { a: ['1'], b: ['2'] }
        })

        for (let i = 0; i < 2; i++) {
            const [newDFA, step] = converter.stepForward()
            visualDFA.performStep(step, newDFA)
        }

        visualDFA.fsa.states.should.eql(['1', '2'])
        visualDFA.fsa.startState.should.eql('1')
        visualDFA.fsa.acceptStates.should.eql(['1'])
        visualDFA.fsa.transitions.should.eql({
            '1': { a: ['1'], b: ['2'] },
            '2': { a: ['1'], b: ['2'] }
        })

        {
            const [prevDFA, step] = converter.stepBackward()
            visualDFA.undoStep(step, prevDFA)
        }

        visualDFA.fsa.states.should.eql(['1', '2', '1,2'])
        visualDFA.fsa.startState.should.eql('1')
        visualDFA.fsa.acceptStates.should.eql(['1', '1,2'])
        visualDFA.fsa.transitions.should.eql({
            '1': { a: ['1'], b: ['2'] },
            '2': { a: ['1'], b: ['2'] },
            '1,2': { a: ['1'], b: ['2'] }
        })

        done()
    })
})
