import FSA from './fsa.js'

/**
 * NFAConverter provides the ability to convert the given NFA to a DFA in incremental steps
 */
export default class NFAConverter {
    constructor (nfa) {
        this.nfa = nfa
        this.dfa = undefined
        this.state_index = 0
        this.transition_index = 0
        this.unreachableStates = undefined
    }

    /**
     * Perform a single step in the conversion from NFA to DFA
     *
     * @returns {FSA} The new DFA after the step has been performed
     */
    stepForward () {
        // If this is the first step, the DFA hasn't been initialized. Let's create the basis of the new DFA
        if (this.dfa === undefined) {
            const powerset = this.nfa.getPowersetOfStates()

            // The new list of states is the powerset of the original states
            const states = powerset.map(e => e.join(','))

            // Build an empty map of transitions
            // e.g. {1: {a: undefined, b: undefined}, 2: {a: undefined, b: undefined}}
            const transitions = {}
            for (const s of states) {
                transitions[s] = {}
                for (const e of this.nfa.alphabet) {
                    transitions[s][e] = undefined
                }
            }

            // The new start state is the states that are reachable from the original start state
            // e.g. '1' has an ε-transition to '3'; therefore, the new start state is '1,3'
            const startState = this.nfa.getEpsilonClosureStates(this.nfa.startState).sort().join(',')

            // The new list of accept states are any states from the powerset with the original accept state in them
            // e.g. '1' is the accept state; therefore, '1', '1,2', '1,3', and '1,2,3' are accept states
            const acceptStates = powerset.filter(e => {
                for (const s of this.nfa.acceptStates) { if (e.includes(s)) return true }

                return false
            }).map(e => e.join(','))

            // For sanity, let's make sure the new start state is actually a member of the list of states
            if (!states.includes(startState)) { throw new Error(`startState ${startState} is not a member of state powerset [${states}]`) }

            this.dfa = new FSA(states, this.nfa.alphabet, transitions, startState, acceptStates)

            console.log('initialize DFA')
            return this.dfa
        }

        // If we've created all the transitions for the current state, move to the next state
        if (this.transition_index === this.dfa.alphabet.length) {
            this.state_index++
            this.transition_index = 0
        }

        // If we haven't generated all the transitions, generate the transitions for the current state at state_index
        if (this.state_index < this.dfa.states.length) {
            const state = this.dfa.states[this.state_index]
            const symbol = this.dfa.alphabet[this.transition_index]

            if (this.state_index === 0) {
                // If we're at state index 0, we're at Ø. We need an infinite loopback on Ø.
                console.log('add loopback on Ø')
                this.dfa.transitions['Ø'][symbol] = ['Ø']
            } else {
                let reachableStates = []

                // Get all reachable states for every individual state
                // e.g. '1,2' is the current state; therefore, we need to concatenate the reachable
                //      states from '1' with the reachable states from '2'
                state.split(',').forEach(s => {
                    reachableStates = reachableStates.concat(this.nfa.getReachableStates(s, symbol))
                })

                // Remove Ø if the state has other possibilites
                if (reachableStates.length > 1) {
                    reachableStates = reachableStates.filter(e => e !== 'Ø')
                }

                // Update the transition, remove any duplicates, and sort the end nodes alphabetically
                this.dfa.transitions[state][symbol] = [...new Set(reachableStates)].sort()
                console.log(`add transition from ${state} on input ${symbol} to ${this.dfa.transitions[state][symbol].join(',')}`)
            }

            this.transition_index++

            return this.dfa
        }

        // At this point, we have generated all transitions
        // Now we want to start deleting states that are unable to be reached
        if (!this.unreachableStates) {
            const nodesWithIncomingEdges = []

            // Iterate through all transitions and add the end nodes to the nodesWithIncomingEdges array
            for (const state of this.dfa.states) {
                for (const symbol of this.dfa.alphabet) {
                    const node = this.dfa.transitions[state][symbol].join(',')
                    if (node !== state) nodesWithIncomingEdges.push(node)
                }
            }

            // The list of unreachable states are those that don't exist in the nodesWithIncomingEdges array
            this.unreachableStates = this.dfa.states.filter(s => !nodesWithIncomingEdges.includes(s))

            // Make sure the start state is always in the final DFA
            this.unreachableStates = this.unreachableStates.filter(s => s !== this.dfa.startState)
        }

        if (this.unreachableStates.length > 0) {
            // Pop the first state from unreachableStates
            const stateToDelete = this.unreachableStates.shift()

            // Delete the state from the states array, the acceptStates array, and the transitions map
            this.dfa.states = this.dfa.states.filter(s => s !== stateToDelete)
            this.dfa.acceptStates = this.dfa.acceptStates.filter(s => s !== stateToDelete)
            delete this.dfa.transitions[stateToDelete]

            console.log(`delete state ${stateToDelete}`)
            return this.dfa
        }

        console.log('nothing more to do')
        return undefined
    }

    /**
     * Perform a specific number of steps in the conversion from NFA to DFA
     *
     * @param {number} n The number of steps to perform
     * @returns {FSA} The new DFA after all of the steps have been performed
     */
    step (n) {
        for (let i = 0; i < n; i++) { this.stepForward() }

        return this.dfa
    }
}
