import EventHandler from '../util/event_handler.js'
import { UnknownStateError } from '../util/errors.js'
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

export default class VisualFSA extends EventHandler {
    constructor (draggableCanvas, isDFA) {
        super()
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
                        this.overlay = new OverlayMessage('#nfa-container', 'Enter the symbol for the transition')

                        this.overlay.addEventListener('keydown', function (e) {
                            if (!this.overlay || e.key === 'Shift') return

                            let key = e.key
                            if (e.shiftKey) { key = key.toUpperCase() }

                            if (key.length === 1) {
                                this.addTransition(this.addingTransitionNode.label, endState, key === 'e' ? 'ε' : key)
                                this.render()
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

    /**
     * Convert the VisualFSA to a JSON string for storage
     * @returns {String} The JSON string blob representing this VisualFSA
     */
    toJSON () {
        return JSON.stringify({
            nodes: this.nodes,
            fsa: this.fsa
        })
    }

    /**
     * Rebuild the VisualFSA from a saved JSON string and cast its contents to the appropriate classes
     * @param {String} str The JSON string
     */
    fromJSON (str) {
        const obj = JSON.parse(str)
        if (!obj.nodes || !obj.fsa) { throw new Error('improperly formatted visual FSA') }

        this.nodes = obj.nodes

        // Cast the given FSA
        this.fsa = Object.assign(new FSA(), obj.fsa)

        // Cast node locations to Locations
        for (const node of this.nodes) {
            node.loc = new Location(node.loc.x, node.loc.y)
        }

        this.render()
        this.dispatchEvent('change')
    }

    /**
     * Completely wipe the VisualFSA and start from scratch
     */
    reset () {
        this.nodes = []
        this.fsa = new FSA([], [], {}, undefined, [])
        this.render()
        this.dispatchEvent('change')
    }

    /**
     * Update the VisualFSA start state
     * @param {String} label The state label
     */
    setStartState (label) {
        if (!this.fsa.states.includes(label)) { throw new UnknownStateError(label) }

        this.fsa.startState = label
        this.dispatchEvent('change')
    }

    /**
     * Add an accept state to the VisualFSA
     * @param {String} label The state label
     */
    addAcceptState (label) {
        if (!this.fsa.states.includes(label)) { throw new UnknownStateError(label) }

        this.fsa.acceptStates.push(label)
        this.getNode(label).acceptState = true
        this.dispatchEvent('change')
    }

    /**
     * Remove an accept state from the VisualFSA
     * @param {String} label The state label
     */
    removeAcceptState (label) {
        if (!this.fsa.states.includes(label)) { throw new UnknownStateError(label) }

        this.fsa.acceptStates = this.fsa.acceptStates.filter(e => e !== label)
        this.getNode(label).acceptState = false
        this.dispatchEvent('change')
    }

    /**
     * Add a new state to the VisualFSA at the given location
     * @param {String} label The state label
     * @param {Location} loc The location to place the new state
     */
    addNode (label, loc) {
        this.fsa.states.push(label)
        this.nodes.push({
            label: label,
            loc: loc,
            transitionText: {}
        })
        this.dispatchEvent('change')
    }

    /**
     * Remove a state from the VisualFSA and update the alphabet and all transitions
     * @param {String} label The state label
     */
    removeNode (label) {
        if (!this.fsa.states.includes(label)) { throw new UnknownStateError(label) }

        this.fsa.removeState(label)
        this.nodes = this.nodes.filter(e => e.label !== label)
        for (const node of this.nodes) {
            if (node.transitionText[label]) delete node.transitionText[label]
        }

        this.updateAlphabet()
        this.dispatchEvent('change')
    }

    /**
     * Find the node object with the given state label
     * @param {String} label The state label
     * @returns {Object} The node object for the given state
     */
    getNode (label) {
        const node = this.nodes.find(e => e.label === label)
        if (!node) { throw new UnknownStateError(label) }

        return node
    }

    /**
     * Get the next state number to use for a new state.
     * Incrementally searches starting at 1 for the next available label.
     * @returns {Number} The next state number
     */
    getNextStateNumber () {
        for (let i = 1; i < 100; i++) {
            if (!this.fsa.states.includes(i.toString())) { return i }
        }

        throw new Error('max state count exceeded')
    }

    /**
     * Parse the FSA's transition map to infer the alphabet
     */
    updateAlphabet () {
        const alphabet = []
        for (const fromState of Object.keys(this.fsa.transitions)) {
            for (const symbol of Object.keys(this.fsa.transitions[fromState])) {
                if (symbol !== 'ε') { alphabet.push(symbol) }
            }
        }
        this.fsa.alphabet = [...new Set(alphabet)].sort()
    }

    /**
     * Create a new transition between two states on the given symbol
     * @param {String} from The state label for the origin state
     * @param {String} to The state label for the destination state
     * @param {String} symbol The alphabet symbol for the transition
     */
    addTransition (from, to, symbol) {
        if (!this.fsa.states.includes(from)) { throw new UnknownStateError(from) }
        if (!this.fsa.states.includes(to)) { throw new UnknownStateError(to) }

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
        this.dispatchEvent('change')
    }

    /**
     * Remove a single transition between the two given states on the given symbol
     * @param {String} from The state label for the origin state
     * @param {String} to The state label for the destination state
     * @param {String} symbol The alphabet symbol for the transition
     */
    removeTransition (from, to, symbol) {
        if (!this.fsa.states.includes(from)) { throw new UnknownStateError(from) }
        if (!this.fsa.states.includes(to)) { throw new UnknownStateError(to) }

        const fromNode = this.getNode(from)

        // Delete transition in the FSA
        if (this.fsa.transitions[from][symbol]) {
            this.fsa.transitions[from][symbol] = this.fsa.transitions[from][symbol].filter(e => e !== to)
            if (this.fsa.transitions[from][symbol].length === 0) { delete this.fsa.transitions[from][symbol] }
        }

        // Delete transition in the node
        if (fromNode.transitionText[to]) {
            console.log('transition text', fromNode.transitionText[to])
            fromNode.transitionText[to] = fromNode.transitionText[to].filter(e => e !== symbol)
            if (fromNode.transitionText[to].length === 0) { delete fromNode.transitionText[to] }
        }

        this.updateAlphabet()
        this.dispatchEvent('change')
    }

    /**
     * Remove all transitions between the two given states
     * @param {String} from The state label for the origin state
     * @param {String} to The state label for the destination state
     */
    removeTransitions (from, to) {
        if (!this.fsa.states.includes(from)) { throw new UnknownStateError(from) }
        if (!this.fsa.states.includes(to)) { throw new UnknownStateError(to) }

        const fromNode = this.getNode(from)

        for (const symbol of this.fsa.alphabet.concat('ε')) {
            if (this.fsa.transitions[from][symbol] && this.fsa.transitions[from][symbol].includes(to)) {
                this.fsa.transitions[from][symbol] = this.fsa.transitions[from][symbol].filter(e => e !== to)
                if (this.fsa.transitions[from][symbol].length === 0) { delete this.fsa.transitions[from][symbol] }
            }
        }

        delete fromNode.transitionText[to]

        this.updateAlphabet()
        this.dispatchEvent('change')
    }

    /**
     * Get a drawable object representing a curved quadratic line between the two states
     * @param {String} from The state label for the origin state
     * @param {String} to The state label for the destination state
     * @param {Object} fromNode The node object for the origin state
     * @param {Object} toNode The node object for the destination state
     * @returns {QuadraticCurvedLine} The drawable quadratic line to be placed onto the canvas
     */
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
    performStep (step, dfa) {
        switch (step.type) {
        case 'initialize': {
            const maxCols = Math.ceil(dfa.states.length / (Math.log2(dfa.states.length) - 1))
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

        case 'add_transition': {
            this.addTransition(step.fromState, step.toState, step.symbol)
            return this.render()
        }

        case 'delete_state': {
            step.location = this.getNode(step.state).loc
            this.removeNode(step.state)
            return this.render()
        }

        case 'merge_states': {
            const s1 = step.states[0]
            const n1 = this.getNode(s1)
            const s2 = step.states[1]
            const n2 = this.getNode(s2)
            const newState = `${s1}+${s2}`
            step.locations = [n1.loc, n2.loc]

            // Create the new state at the midpoint between the old states
            this.addNode(newState, new Location((n1.loc.x + n2.loc.x) / 2, (n1.loc.y + n2.loc.y) / 2))
            if (this.fsa.acceptStates.includes(s1)) { this.addAcceptState(newState) }
            if (this.fsa.startState === s1 || this.fsa.startState === s2) { this.setStartState(newState) }

            // Add loopback on the new state for every symbol
            for (const symbol of this.fsa.alphabet) {
                this.addTransition(newState, newState, symbol)
            }

            // Add incoming transitions to the new state using the old states' incoming transitions
            for (const state of this.fsa.states.filter(e => e !== s1 && e !== s2)) {
                for (const symbol of this.fsa.alphabet) {
                    if (this.fsa.transitions[state][symbol][0] === s1 || this.fsa.transitions[state][symbol][0] === s2) {
                        this.addTransition(state, newState, symbol)
                    }
                }
            }

            this.removeNode(s1)
            this.removeNode(s2)

            return this.render()
        }
        }
    }

    /**
     * Undo the given step by performing the opposite action
     *
     * @param {Object} step The step's properties
     * @param {FSA} dfa The previous DFA before this step's conversion
     */
    undoStep (step, dfa) {
        switch (step.type) {
        case 'initialize': {
            this.fsa = new FSA([], [], {}, undefined, [])
            this.nodes = []

            return this.render()
        }

        case 'add_transition': {
            this.removeTransition(step.fromState, step.toState, step.symbol)

            return this.render()
        }

        case 'delete_state': {
            this.addNode(step.state, step.location)
            if (dfa.startState === step.state) { this.setStartState(step.state) }
            if (dfa.acceptStates.includes(step.state)) { this.addAcceptState(step.state) }

            if (step.transitions) {
                for (const symbol of Object.keys(step.transitions)) {
                    for (const endState of step.transitions[symbol]) {
                        this.addTransition(step.state, endState, symbol)
                    }
                }
            }

            return this.render()
        }

        case 'merge_states': {
            this.removeNode(`${step.states[0]}+${step.states[1]}`)
            this.addNode(step.states[0], step.locations[0])
            this.addNode(step.states[1], step.locations[1])

            if (dfa.startState === step.states[0]) {
                this.setStartState(step.states[0])
            } else if (dfa.startState === step.states[1]) {
                this.setStartState(step.states[1])
            }

            if (dfa.acceptStates.includes(step.states[0])) { this.addAcceptState(step.states[0]) }
            if (dfa.acceptStates.includes(step.states[1])) { this.addAcceptState(step.states[1]) }

            // Add external transitions between the two states
            for (const state of dfa.states) {
                for (const symbol of dfa.alphabet) {
                    if (!dfa.transitions[state][symbol]) continue

                    if (dfa.transitions[state][symbol].includes(step.states[0])) {
                        this.addTransition(state, step.states[0], symbol)
                    }

                    if (dfa.transitions[state][symbol].includes(step.states[1])) {
                        this.addTransition(state, step.states[1], symbol)
                    }
                }
            }

            return this.render()
        }
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
                        this.render()
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
                    font: 'Helvetica',
                    outline: { color: color === NODE_COLOR ? NODE_COLOR : 'green', width: 6 }
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
                        this.render()
                    })

                    editMenu.addEventListener('toggledaccept', () => {
                        if (!node.acceptState) {
                            this.addAcceptState(node.label)
                        } else {
                            this.removeAcceptState(node.label)
                        }
                        this.render()
                    })

                    editMenu.addEventListener('delete', () => {
                        this.removeNode(node.label)
                        this.render()
                    })
                })
            }

            circle.addEventListener('move', e => {
                node.loc = e.newLocation
                this.render()
            })

            this.draggableCanvas.addObject(circle)
        }
    }
}
