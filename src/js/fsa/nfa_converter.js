import FSA from './fsa.js'

export default class NFAConverter {
    constructor (nfa) {
        this.nfa = nfa
        this.dfa = undefined
        this.state_index = 0
        this.transition_index = 0
    }

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
            const startState = this.nfa.getEpsilonReachableStates(this.nfa.startState).sort().join(',')

            // The new list of accept states are any states from the powerset with the original accept state in them
            // e.g. '1' was the accept state; therefore, '1', '1,2', '1,3', and '1,2,3' are accept states
            const acceptStates = powerset.filter(e => {
                for (const s of this.nfa.acceptStates) { if (e.includes(s)) return true }

                return false
            }).map(e => e.join(','))

            // For sanity, let's make sure the new start state is actually a member of the list of states
            if (!states.includes(startState)) { throw new Error(`startState ${startState} is not a member of state powerset [${states}]`) }

            this.dfa = new FSA(states, this.nfa.alphabet, transitions, startState, acceptStates)
            return this.dfa
        }

        // If we've created all the transitions for the current state, move to the next state
        if (this.transition_index >= this.dfa.alphabet.length) {
            this.state_index++
            this.transition_index = 0
        }

        const symbol = this.dfa.alphabet[this.transition_index]

        // If we're at state index 0, we're at Ø. We need an infinite loopback on Ø.
        if (this.state_index === 0) {
            this.dfa.transitions['Ø'][symbol] = 'Ø'
        } else {
            // const state = this.dfa.states[this.state_index]
            // this.dfa.transitions[state][symbol] = getReachableStates
        }

        this.transition_index++

        return this.dfa
    }
}
