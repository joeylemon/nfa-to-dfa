import Circle from '../canvas/drawables/circle.js'
import Text from '../canvas/drawables/text.js'
import FSA from './fsa.js'
import Location from '../canvas/location.js'
import CurvedLine from '../canvas/drawables/curved_line.js'
import ArrowedStraightLine from '../canvas/drawables/arrowed_straight_line.js'
import EditNodeMenu from '../elements/edit_node_menu.js'

const NODE_RADIUS = 20
const NODE_COLOR = '#34b1eb'
const NODE_LABEL_SIZE = 24
const NODE_OUTLINE_RADIUS = 5

const START_NODE_ARROW_ANGLE = -135 * (Math.PI / 180)

const TRANSITION_WIDTH = 3
const TRANSITION_COLOR = 'rgba(0,0,0,1)'
const TRANSITION_ARROW_RADIUS = 10
const TRANSITION_CONTROL_RADIUS = 60
const TRANSITION_TEXT_RADIUS = 25

export default class VisualFSA {
    constructor (isNFA) {
        this.fsa = new FSA([], [], {}, undefined, [])
        this.isNFA = isNFA
        this.nodes = []
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

    removeState (label) {
        this.fsa.removeState(label)
        this.nodes = this.nodes.filter(e => e.label !== label)
        for (const node of this.nodes) {
            if (node.transitionText[label]) delete node.transitionText[label]
        }
    }

    setAlphabet (alphabet) {
        this.fsa.alphabet = alphabet
    }

    addNode (label, loc) {
        this.fsa.states.push(label)
        this.nodes.push({
            label: label,
            loc: loc,
            transitionText: {}
        })
    }

    getNode (label) {
        const node = this.nodes.find(e => e.label === label)
        if (!node) { throw new Error(`could not find node with label ${label}`) }

        return node
    }

    addTransition (from, to, symbol) {
        if (!this.fsa.alphabet.concat('ε').includes(symbol)) { throw new Error(`could not add transition of symbol ${symbol} since it is not in the alphabet`) }

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
        console.log('post addTransition', this.fsa, this)
    }

    /**
     * Create a visual DFA from the given FSA. This involves automatically laying out nodes
     * into a grid instead of relying on the user to position the nodes
     */
    generateDFA () {

    }

    /**
     * Render the FSA onto a canvas
     * @param {DraggableCanvas} draggableCanvas The canvas to render the FSA onto
     */
    render (draggableCanvas) {
        draggableCanvas.clear()

        // Draw transition lines
        for (const fromNode of this.nodes) {
            for (const endState of Object.keys(fromNode.transitionText)) {
                const toNode = this.getNode(endState)

                // Get the angle between the fromNode and the toNode
                const angleFromTo = fromNode.loc.angleTo(toNode.loc)

                // Get the midpoint between the fromNode and the toNode
                const midpoint = new Location((fromNode.loc.x + toNode.loc.x) / 2, (fromNode.loc.y + toNode.loc.y) / 2)

                // Get the perpendicular angle to the angle between the fromNode and the toNode
                const perpendicularAngle = angleFromTo + (Math.PI / 2)

                // Set the control point of the quadratic curve to TRANSITION_CONTROL_RADIUS towards the perpendicular angle
                const controlPoint = midpoint.moveToAngle(perpendicularAngle, TRANSITION_CONTROL_RADIUS)

                // Calculate the outermost point of the fromNode so the beginning of the line extends perfectly from outside the circle
                const fromOutsideRadius = fromNode.loc.moveToAngle(fromNode.loc.angleTo(controlPoint), NODE_RADIUS + (fromNode.acceptState ? NODE_OUTLINE_RADIUS : 0))

                // Calculate the outermost point of the toNode so the arrowhead perfectly points to the circle
                const toOutsideRadius = toNode.loc.moveFromAngle(controlPoint.angleTo(toNode.loc), NODE_RADIUS + TRANSITION_ARROW_RADIUS + (toNode.acceptState ? NODE_OUTLINE_RADIUS : 0))

                const transitionLine = new CurvedLine(fromOutsideRadius, toOutsideRadius, controlPoint, {
                    width: TRANSITION_WIDTH,
                    color: TRANSITION_COLOR,
                    arrowRadius: TRANSITION_ARROW_RADIUS
                })

                draggableCanvas.addObject(transitionLine)

                // Get the midpoint of the curved line
                const textLocation = transitionLine.midpoint().moveToAngle(perpendicularAngle, TRANSITION_TEXT_RADIUS)
                const textRotation = Math.abs(angleFromTo) > (Math.PI / 2) ? angleFromTo + Math.PI : angleFromTo

                // Add the transition symbols to the center of the transition line, joined by commas
                // console.log(`angle between ${fromNode.label} and ${toNode.label} is ${angleFromTo} (adjusted: ${textRotation})`)
                draggableCanvas.addObject(new Text(textLocation, {
                    text: fromNode.transitionText[endState].join(', '),
                    rotation: textRotation,
                    color: '#000',
                    size: 24,
                    font: 'Roboto'
                }))
            }
        }

        // Draw node circles
        for (const node of this.nodes) {
            let color = NODE_COLOR
            let outline

            if (this.fsa.startState === node.label) {
                color = '#4162d1'

                // Add incoming arrow to the start state
                const from = new Location(
                    node.loc.x + Math.cos(START_NODE_ARROW_ANGLE) * 100,
                    node.loc.y + Math.sin(START_NODE_ARROW_ANGLE) * 100
                )
                const to = new Location(
                    node.loc.x + Math.cos(START_NODE_ARROW_ANGLE) * (NODE_RADIUS + TRANSITION_ARROW_RADIUS + (node.acceptState ? NODE_OUTLINE_RADIUS : 0)),
                    node.loc.y + Math.sin(START_NODE_ARROW_ANGLE) * (NODE_RADIUS + TRANSITION_ARROW_RADIUS + (node.acceptState ? NODE_OUTLINE_RADIUS : 0))
                )
                draggableCanvas.addObject(new ArrowedStraightLine(from, to, {
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

            circle.addEventListener('edit', e => {
                const editMenu = new EditNodeMenu(e.clientX, e.clientY)
                editMenu.addEventListener('selectedstart', () => {
                    this.setStartState(node.label)
                    this.render(draggableCanvas)
                })

                editMenu.addEventListener('toggledaccept', () => {
                    if (!node.acceptState) {
                        this.addAcceptState(node.label)
                    } else {
                        this.removeAcceptState(node.label)
                    }
                    this.render(draggableCanvas)
                })

                editMenu.addEventListener('delete', () => {
                    this.removeState(node.label)
                    this.render(draggableCanvas)
                })
            })

            circle.addEventListener('move', e => {
                node.loc = e.newLocation
                this.render(draggableCanvas)
            })

            draggableCanvas.addObject(circle)
        }
    }
}
