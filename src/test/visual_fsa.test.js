import should from 'should' // eslint-disable-line no-unused-vars
import jsdom from 'jsdom'

import { UnknownStateError } from '../js/util/errors.js'
import VisualFSA from '../js/fsa/visual_fsa.js'
import NFAConverter from '../js/fsa/nfa_converter.js'
import DraggableCanvas from '../js/canvas/draggable_canvas.js'
import Location from '../js/canvas/location.js'
import Circle from '../js/canvas/drawables/circle.js'
import QuadraticCurvedLine from '../js/canvas/drawables/quadratic_curved_line.js'
import BezierCurvedLine from '../js/canvas/drawables/bezier_curved_line.js'
import Text from '../js/canvas/drawables/text.js'
import ArrowedStraightLine from '../js/canvas/drawables/arrowed_straight_line.js'
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
        visualDFA.syncDFA(step, newDFA)

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
            visualDFA.syncDFA(step, newDFA)
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
})
