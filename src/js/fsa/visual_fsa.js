import FSA from './fsa.js'
import Location from '../canvas/location.js'
import EditNodeMenu from '../elements/edit_node_menu.js'
import AddNodeMenu from '../elements/add_node_menu.js'
import EditTransitionMenu from '../elements/edit_transition_menu.js'
import OverlayMessage from '../elements/overlay_message.js'
import Circle from '../canvas/drawables/circle.js'
import Text from '../canvas/drawables/text.js'
import QuadraticCurvedLine from '../canvas/drawables/quadratic_curved_line.js'
import BezierCurvedLine from '../canvas/drawables/bezier_curved_line.js'
import ArrowedStraightLine from '../canvas/drawables/arrowed_straight_line.js'

const NODE_RADIUS = 30
const NODE_COLOR = '#34b1eb'
const NODE_LABEL_SIZE = 24
const NODE_OUTLINE_RADIUS = 5

const START_NODE_ARROW_LENGTH = 100
const START_NODE_ARROW_ANGLE = -135 * (Math.PI / 180)

const TRANSITION_WIDTH = 3
const TRANSITION_COLOR = 'rgba(0,0,0,1)'
const TRANSITION_ARROW_RADIUS = 10
const TRANSITION_CONTROL_RADIUS = 60
const TRANSITION_TEXT_RADIUS = 25

const SELF_TRANSITION_CONTROL_RADIUS = 125
const SELF_TRANSITION_START_ANGLE = Math.PI
const SELF_TRANSITION_END_ANGLE = 3 * Math.PI / 2

const DFA_START_LOCATION = { x: 85, y: 150 }
const DFA_NODE_DISTANCE = 175

export default class VisualFSA {
    constructor (draggableCanvas, isDFA) {
        this.draggableCanvas = draggableCanvas
        this.fsa = new FSA([], [], {}, undefined, [])
        this.nodes = []
        this.isDFA = isDFA

        if (!isDFA) {
            // Listen for mouse moves to draw a transition-in-progress
            this.draggableCanvas.addEventListener('mousemove', e => {
                if (this.addingTransitionNode) {
                    this.transitionInProgress = this.getQuadraticLine(this.addingTransitionNode.loc, e.loc)
                    this.render()
                }
            })

            // Listen for mouse down to add a transition
            this.draggableCanvas.addEventListener('mousedown', e => {
                if (this.addingTransitionNode) {
                    if (e.obj && e.obj instanceof Circle && e.obj.options.text) {
                        const endState = e.obj.options.text.options.text
                        this.overlay = new OverlayMessage('#nfa-container', 'Press the key of the symbol for the transition')

                        this.overlay.addEventListener('keydown', function (e) {
                            if (!this.overlay) return

                            if (e.key.length === 1) {
                                try {
                                    this.addTransition(this.addingTransitionNode.label, endState, e.key === 'e' ? 'ε' : e.key)
                                    this.render()
                                } catch (e) {
                                    this.overlay.setMessage('That symbol is not in the given alphabet')
                                    return
                                }
                            }

                            this.overlay.deletePrevious()
                        }.bind(this))

                        this.overlay.addEventListener('close', () => {
                            this.addingTransitionNode = undefined
                            this.transitionInProgress = undefined
                            this.overlay = undefined
                            this.draggableCanvas.draggingObject = undefined
                            document.body.style.cursor = 'auto'
                            this.render()
                        })
                    } else {
                        this.addingTransitionNode = undefined
                        this.transitionInProgress = undefined
                        this.render()
                    }
                }
            })

            // Listen for right clicks on an empty spot to create new nodes
            this.draggableCanvas.addEventListener('rightclick', e => {
                // Don't show the menu if the user is currently creating a transition
                if (this.transitionInProgress) { return }

                const addMenu = new AddNodeMenu(e.clientX, e.clientY)
                addMenu.addEventListener('create', () => {
                    this.addNode(this.getNextStateNumber().toString(), e.loc)
                    this.render()
                })
            })

            // Listen for keydown to stop transition-in-progress if the user presses escape
            document.addEventListener('keydown', e => {
                if (e.key === 'Escape') {
                    this.addingTransitionNode = undefined
                    this.transitionInProgress = undefined
                    if (this.overlay) { this.overlay.deletePrevious() }
                    this.render()
                }
            })
        }
    }

    toJSON () {
        return JSON.stringify({
            nodes: this.nodes,
            fsa: this.fsa
        })
    }

    fromJSON (obj) {
        this.nodes = obj.nodes

        // Cast the given FSA
        this.fsa = Object.assign(new FSA(), obj.fsa)

        // Cast node locations to Locations
        for (const node of this.nodes) {
            node.loc = new Location(node.loc.x, node.loc.y)
        }

        this.render()
    }

    setStartState (label) {
        this.fsa.startState = label
    }

    addAcceptState (label) {
        this.fsa.acceptStates.push(label)
        this.getNode(label).acceptState = true
    }

    removeAcceptState (label) {
        this.fsa.acceptStates = this.fsa.acceptStates.filter(e => e !== label)
        this.getNode(label).acceptState = false
    }

    addNode (label, loc) {
        this.fsa.states.push(label)
        this.nodes.push({
            label: label,
            loc: loc,
            transitionText: {}
        })
    }

    removeNode (label) {
        this.fsa.removeState(label)
        this.nodes = this.nodes.filter(e => e.label !== label)
        for (const node of this.nodes) {
            if (node.transitionText[label]) delete node.transitionText[label]
        }
    }

    getNode (label) {
        const node = this.nodes.find(e => e.label === label)
        if (!node) { throw new Error(`could not find node with label ${label}`) }

        return node
    }

    getNextStateNumber () {
        for (let i = 1; i < 100; i++) {
            if (!this.fsa.states.includes(i.toString())) { return i }
        }

        throw new Error('max state count exceeded')
    }

    updateAlphabet () {
        const alphabet = []
        for (const fromState of Object.keys(this.fsa.transitions)) {
            for (const symbol of Object.keys(this.fsa.transitions[fromState])) {
                if (symbol !== 'ε') { alphabet.push(symbol) }
            }
        }
        this.fsa.alphabet = [...new Set(alphabet)].sort()
    }

    addTransition (from, to, symbol) {
        const fromNode = this.getNode(from)

        // Set up object structure if it doesn't exist
        if (!this.fsa.transitions[from]) this.fsa.transitions[from] = {}
        if (!this.fsa.transitions[from][symbol]) this.fsa.transitions[from][symbol] = []
        if (!fromNode.transitionText[to]) fromNode.transitionText[to] = []

        // Add the transitions to the arrays
        this.fsa.transitions[from][symbol].push(to)
        fromNode.transitionText[to].push(symbol)

        // Remove duplicates in case the user somehow added two of the same transitions
        fromNode.transitionText[to] = [...new Set(fromNode.transitionText[to])].sort()
        this.fsa.transitions[from][symbol] = [...new Set(this.fsa.transitions[from][symbol])].sort()

        this.updateAlphabet()
    }

    removeTransitions (from, to) {
        const fromNode = this.getNode(from)
        this.fsa.transitions[from] = {}
        delete fromNode.transitionText[to]

        this.updateAlphabet()
    }

    getQuadraticLine (from, to, fromNode, toNode) {
        // Get the angle between the fromNode and the toNode
        const angleFromTo = from.angleTo(to)

        // Get the perpendicular angle to the angle between the fromNode and the toNode
        const perpendicularAngle = angleFromTo - (Math.PI / 2)

        // Get the midpoint between the fromNode and the toNode
        const midpoint = new Location((from.x + to.x) / 2, (from.y + to.y) / 2)

        // Set the control point of the quadratic curve to TRANSITION_CONTROL_RADIUS towards the perpendicular angle
        const controlPoint = midpoint.moveToAngle(perpendicularAngle, TRANSITION_CONTROL_RADIUS)

        // Calculate the outermost point of the fromNode so the beginning of the line extends perfectly from outside the circle
        const fromOutsideRadius = from.moveToAngle(from.angleTo(controlPoint), NODE_RADIUS + (fromNode && fromNode.acceptState ? NODE_OUTLINE_RADIUS : 0))

        // Calculate the outermost point of the toNode so the arrowhead perfectly points to the circle
        const toOutsideRadius = to.moveFromAngle(controlPoint.angleTo(to), NODE_RADIUS + TRANSITION_ARROW_RADIUS + (toNode && toNode.acceptState ? NODE_OUTLINE_RADIUS : 0))

        return new QuadraticCurvedLine(fromOutsideRadius, toOutsideRadius, controlPoint, {
            width: TRANSITION_WIDTH,
            color: TRANSITION_COLOR,
            arrowRadius: TRANSITION_ARROW_RADIUS
        })
    }

    /**
     * Sync the FSA with the DFA following the step of the conversion process
     *
     * @param {Object} step The step's properties
     * @param {FSA} dfa The resulting DFA after this step's conversion
     */
    syncDFA (step, dfa) {
        if (step.type === 'initialize') {
            const maxCols = Math.ceil(dfa.states.length / (dfa.states.length < 16 ? 2 : 3))
            let row = 0
            let col = 0

            for (const state of dfa.states) {
                const x = DFA_START_LOCATION.x + (col * DFA_NODE_DISTANCE)
                const y = DFA_START_LOCATION.y + (row * DFA_NODE_DISTANCE)

                this.addNode(state, new Location(x, y))

                col++
                if (col >= maxCols) {
                    row++
                    col = 0
                }
            }

            this.setStartState(dfa.startState)
            dfa.acceptStates.forEach(e => this.addAcceptState(e))

            return this.render()
        }

        if (step.type === 'add_transition') {
            this.addTransition(step.fromState, step.toState, step.symbol)
            return this.render()
        }

        if (step.type === 'delete_state') {
            this.removeNode(step.state)
            return this.render()
        }
    }

    /**
     * Render the FSA onto the canvas
     */
    render () {
        this.draggableCanvas.clear()

        if (this.transitionInProgress) { this.draggableCanvas.addObject(this.transitionInProgress) }

        // Draw transition lines
        for (const fromNode of this.nodes) {
            for (const endState of Object.keys(fromNode.transitionText)) {
                const toNode = this.getNode(endState)

                let textLocation
                let textRotation

                const editFn = e => {
                    const editMenu = new EditTransitionMenu(e.clientX, e.clientY)
                    editMenu.addEventListener('delete', () => {
                        console.log('delete transition')
                        this.removeTransitions(fromNode.label, toNode.label)
                        this.render(this.draggableCanvas)
                    })
                }

                if (fromNode.label !== toNode.label) {
                    const angleFromTo = fromNode.loc.angleTo(toNode.loc)
                    const perpendicularAngle = angleFromTo + (Math.PI / 2)

                    const transitionLine = this.getQuadraticLine(fromNode.loc, toNode.loc, fromNode, toNode)

                    if (!this.isDFA) transitionLine.addEventListener('edit', editFn)
                    this.draggableCanvas.addObject(transitionLine)

                    textLocation = transitionLine.midpoint().moveFromAngle(perpendicularAngle, TRANSITION_TEXT_RADIUS)
                    textRotation = Math.abs(angleFromTo) > (Math.PI / 2) ? angleFromTo + Math.PI : angleFromTo
                } else {
                    // Set the control points towards the start and end angles
                    const cp1 = fromNode.loc.moveToAngle(-SELF_TRANSITION_START_ANGLE, SELF_TRANSITION_CONTROL_RADIUS)
                    const cp2 = fromNode.loc.moveToAngle(-SELF_TRANSITION_END_ANGLE, SELF_TRANSITION_CONTROL_RADIUS)

                    // Calculate the outermost point of the node so the beginning/end of the line perfectly touches the circle
                    const fromOutsideRadius = fromNode.loc.moveToAngle(SELF_TRANSITION_START_ANGLE, NODE_RADIUS + (fromNode.acceptState ? NODE_OUTLINE_RADIUS : 0))
                    const toOutsideRadius = fromNode.loc.moveFromAngle(SELF_TRANSITION_END_ANGLE, NODE_RADIUS + TRANSITION_ARROW_RADIUS + (fromNode.acceptState ? NODE_OUTLINE_RADIUS : 0))

                    const transitionLine = new BezierCurvedLine(fromOutsideRadius, toOutsideRadius, cp1, cp2, {
                        width: TRANSITION_WIDTH,
                        color: TRANSITION_COLOR,
                        arrowRadius: TRANSITION_ARROW_RADIUS
                    })

                    if (!this.isDFA) transitionLine.addEventListener('edit', editFn)
                    this.draggableCanvas.addObject(transitionLine)

                    // Add the text to the midpoint of the transition line with the appropriate rotation angle
                    const midpointAngle = transitionLine.midpointAngle()
                    textLocation = transitionLine.midpoint().moveToAngle(-(SELF_TRANSITION_START_ANGLE + SELF_TRANSITION_END_ANGLE) / 2, TRANSITION_TEXT_RADIUS)
                    textRotation = Math.abs(midpointAngle) > (Math.PI / 2) ? midpointAngle + Math.PI : midpointAngle
                }

                // Add the transition symbols to the line, joined by commas
                const text = new Text(textLocation, {
                    text: fromNode.transitionText[endState].join(', '),
                    rotation: textRotation,
                    color: '#000',
                    size: 24,
                    font: 'Roboto'
                })
                if (!this.isDFA) text.addEventListener('edit', editFn)
                this.draggableCanvas.addObject(text)
            }
        }

        // Draw node circles
        for (const node of this.nodes) {
            let color = NODE_COLOR
            let outline

            if (this.fsa.startState === node.label) {
                color = '#4162d1'

                // Add incoming arrow to the start state
                const from = node.loc.moveToAngle(START_NODE_ARROW_ANGLE, START_NODE_ARROW_LENGTH)
                const to = node.loc.moveToAngle(START_NODE_ARROW_ANGLE, NODE_RADIUS + TRANSITION_ARROW_RADIUS + (node.acceptState ? NODE_OUTLINE_RADIUS : 0))
                this.draggableCanvas.addObject(new ArrowedStraightLine(from, to, {
                    width: TRANSITION_WIDTH,
                    color: TRANSITION_COLOR,
                    arrowRadius: TRANSITION_ARROW_RADIUS
                }))
            }

            if (node.acceptState) {
                color = 'green'

                // Add a double outline to the accept state
                outline = { color: '#000', width: 2, distance: NODE_OUTLINE_RADIUS }
            }

            const circle = new Circle(node.loc, {
                radius: NODE_RADIUS,
                color: color,
                text: new Text(null, {
                    text: node.label,
                    size: NODE_LABEL_SIZE,
                    color: '#fff',
                    font: 'Helvetica'
                }),
                borderOptions: { color: '#000', width: 2 },
                outlineOptions: outline
            })

            if (!this.isDFA) {
                circle.addEventListener('edit', e => {
                    // Don't show the edit menu if the user is currently creating a transition
                    if (this.transitionInProgress) { return }

                    const editMenu = new EditNodeMenu(e.clientX, e.clientY)

                    editMenu.addEventListener('addtransition', () => {
                        this.addingTransitionNode = node
                    })

                    editMenu.addEventListener('selectedstart', () => {
                        this.setStartState(node.label)
                        this.render(this.draggableCanvas)
                    })

                    editMenu.addEventListener('toggledaccept', () => {
                        if (!node.acceptState) {
                            this.addAcceptState(node.label)
                        } else {
                            this.removeAcceptState(node.label)
                        }
                        this.render(this.draggableCanvas)
                    })

                    editMenu.addEventListener('delete', () => {
                        this.removeNode(node.label)
                        this.render(this.draggableCanvas)
                    })
                })
            }

            circle.addEventListener('move', e => {
                node.loc = e.newLocation
                this.render(this.draggableCanvas)
            })

            this.draggableCanvas.addObject(circle)
        }
    }
}
