import Circle from '../canvas/drawables/circle.js'
import Text from '../canvas/drawables/text.js'
import FSA from './fsa.js'
import CurvedLine from '../canvas/drawables/curved_line.js'

const NODE_RADIUS = 20
const NODE_COLOR = '#34b1eb'
const NODE_LABEL_SIZE = 24

const TRANSITION_WIDTH = 3
const TRANSITION_COLOR = '#000'
const TRANSITION_ARROW_RADIUS = 6

export default class VisualFSA {
    constructor (isNFA) {
        this.fsa = new FSA([], [], {}, undefined, [])
        this.isNFA = isNFA
        this.nodes = []
    }

    setAlphabet (alphabet) {
        this.fsa.alphabet = alphabet
    }

    addNode (label, loc) {
        this.fsa.states.push(label)
        this.nodes.push({
            label: label,
            loc: loc
        })
    }

    getNode (label) {
        return this.nodes.find(e => e.label === label)
    }

    addTransition (from, to, symbol) {
        if (!this.fsa.transitions[from]) this.fsa.transitions[from] = {}
        if (!this.fsa.transitions[from][symbol]) this.fsa.transitions[from][symbol] = []

        this.fsa.transitions[from][symbol].push(to)

        // Remove duplicates in case the user somehow added two of the same transitions
        this.fsa.transitions[from][symbol] = [...new Set(this.fsa.transitions[from][symbol])].sort()
        console.log('post addTransition', this.fsa)
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
        for (const startState of this.fsa.states) {
            for (const symbol of this.fsa.alphabet) {
                if (!this.fsa.transitions[startState]) continue
                const transitions = this.fsa.transitions[startState][symbol]
                if (!transitions) continue

                for (const endState of transitions) {
                    const fromNode = this.getNode(startState)
                    if (!fromNode) { throw new Error(`could not find from node with label ${startState}`) }
                    const toNode = this.getNode(endState)
                    if (!toNode) { throw new Error(`could not find from node with label ${endState}`) }

                    // Get the angle between the fromNode and the toNode
                    const angleFromTo = Math.atan2(toNode.loc.y - fromNode.loc.y, toNode.loc.x - fromNode.loc.x)

                    // Get the midpoint between the fromNode and the toNode
                    const midpoint = { x: (fromNode.loc.x + toNode.loc.x) / 2, y: (fromNode.loc.y + toNode.loc.y) / 2 }

                    // Get the perpendicular angle to the angle between the fromNode and the toNode
                    const perpendicularAngle = angleFromTo + (Math.PI / 2)

                    // Set the control point of the quadratic curve to 100px towards the perpendicular angle
                    const controlPoint = { x: midpoint.x + Math.cos(perpendicularAngle) * 100, y: midpoint.y + Math.sin(perpendicularAngle) * 100 }

                    // Get the angle between the control point and the toNode
                    const angleControlTo = Math.atan2(toNode.loc.y - controlPoint.y, toNode.loc.x - controlPoint.x)

                    // Calculate the location of the outermost point of the toNode so the arrowhead perfectly points to the circle
                    const toOutsideRadius = {
                        x: toNode.loc.x - Math.cos(angleControlTo) * (NODE_RADIUS + TRANSITION_ARROW_RADIUS),
                        y: toNode.loc.y - Math.sin(angleControlTo) * (NODE_RADIUS + TRANSITION_ARROW_RADIUS)
                    }

                    draggableCanvas.addObject(new CurvedLine(fromNode.loc, toOutsideRadius, controlPoint, {
                        width: TRANSITION_WIDTH,
                        color: TRANSITION_COLOR,
                        arrowRadius: TRANSITION_ARROW_RADIUS
                    }))
                }
            }
        }

        // Draw node circles
        for (const node of this.nodes) {
            const circle = new Circle(node.loc, {
                radius: NODE_RADIUS,
                color: NODE_COLOR,
                text: new Text(null, {
                    text: node.label,
                    size: NODE_LABEL_SIZE,
                    color: '#fff',
                    font: 'Helvetica'
                }),
                borderOptions: { color: '#000', width: 2 }
            })

            circle.onmove = newLoc => {
                node.loc = newLoc
                this.render(draggableCanvas)
            }

            draggableCanvas.addObject(circle)
        }
    }
}
