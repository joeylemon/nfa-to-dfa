import { UnknownStateError, UnknownSymbolError } from '../util/errors.js'

export default class FSA {
    /**
     * FSA represents a finite state automaton. This can be either an NFA or a DFA.
     *
     * @param {Array} states The array of states in this FSA (e.g. ['1', '2', '3'])
     * @param {Array} alphabet The array of symbols in this FSA (e.g. ['a', 'b'])
     * @param {Object} transitions A map of states and symbols to other states (e.g. transitions['1']['a'] => ['2', '3'] means upon the input of symbol a at state 1, an NFA can transition to state 2 or state 3)
     * @param {String} startState The name of the start state for this FSA (e.g. '1')
     * @param {Array} acceptStates The array of states that an input can be accepted on (e.g. ['1', '3'])
     */
    constructor (states, alphabet, transitions, startState, acceptStates) {
        this.states = states
        this.alphabet = alphabet
        this.transitions = transitions
        this.startState = startState
        this.acceptStates = acceptStates
    }

    /**
     * Remove all of a state's references from the FSA
     *
     * @param {String} state The name of the state
     */
    removeState (state) {
        this.states = this.states.filter(s => s !== state)
        this.acceptStates = this.acceptStates.filter(s => s !== state)
        if (this.startState === state) this.startState = undefined
        delete this.transitions[state]

        // Remove all transitions that lead to the state
        for (const fromState of Object.keys(this.transitions)) {
            for (const symbol of Object.keys(this.transitions[fromState])) {
                if (this.transitions[fromState][symbol]) {
                    this.transitions[fromState][symbol] = this.transitions[fromState][symbol].filter(e => e !== state)
                    if (this.transitions[fromState][symbol].length === 0) { delete this.transitions[fromState][symbol] }
                }
            }
        }
    }

    /**
     * Merge two states into a single state
     *
     * @param {String} s1 The first state
     * @param {String} s2 The second state
     */
    mergeStates (s1, s2) {
        // Create the new state
        const newState = `${s1}+${s2}`
        this.states.push(newState)
        if (this.acceptStates.includes(s1)) { this.acceptStates.push(newState) }
        if (this.startState === s1 || this.startState === s2) { this.startState = newState }

        // Add loopback on the new state for every symbol
        this.transitions[newState] = {}
        for (const symbol of this.alphabet) {
            this.transitions[newState][symbol] = [newState]
        }

        // Add incoming transitions to the new state using the old states' incoming transitions
        for (const state of this.states.filter(e => e !== s1 && e !== s2)) {
            for (const symbol of this.alphabet) {
                if (this.transitions[state][symbol][0] === s1 || this.transitions[state][symbol][0] === s2) {
                    this.transitions[state][symbol] = [newState]
                }
            }
        }

        // Remove the old states
        this.removeState(s1)
        this.removeState(s2)
    }

    /**
     * Get the array of arrays that describes the powerset of this FSA's states
     *
     * @example
     *     console.log(fsa.states)
     *     // => ['1', '2', '3']
     *
     *     console.log(fsa.getPowersetOfStates())
     *     // => [['Ø'], ['1'], ['2'], ['1', '2'], ['3'], ['1', '3'], ['2', '3'], ['1', '2', '3']]
     */
    getPowersetOfStates () {
        const result = []
        result.push(['Ø'])

        // https://stackoverflow.com/a/42774138 How to find all subsets of a set in JavaScript?
        for (let i = 1; i < (1 << this.states.length); i++) {
            const subset = []
            for (let j = 0; j < this.states.length; j++) { if (i & (1 << j)) subset.push(this.states[j]) }

            result.push(subset.sort())
        }

        return result
    }

    /**
     * This function implements E(R) from the NFA to DFA conversion description:
     *
     * E(R) = R ∪ { q | there is an r in R with an ε transition to q }
     *
     * @param {String} fromState The label of the state to find epsilon-reachable states from
     * @returns {Array} The array of states that can be reached via an ε-transition
     */
    getEpsilonClosureStates (fromState) {
        if (!this.states.includes(fromState)) throw new UnknownStateError(fromState)

        if (!this.transitions[fromState] || !this.transitions[fromState]['ε']) {
            return [fromState]
        } else {
            return [fromState, ...this.transitions[fromState]['ε']]
        }
    }

    /**
     * Find the array of states that are able to be reached by the given state. This includes via ε-transitions
     *
     * @param {String} fromState The label of the state to find reachable states from
     * @param {String} symbol The symbol on which to search the transitions
     * @returns {Array} The list of states that can be reached from the given state
     */
    getReachableStates (fromState, symbol, list = []) {
        if (!this.states.includes(fromState)) throw new UnknownStateError(fromState)
        if (symbol !== 'ε' && !this.alphabet.includes(symbol)) throw new UnknownSymbolError(symbol)
        if (list.length > 200) throw new Error('There is an infinite transition loop apparent in the NFA')

        if (!this.transitions[fromState] || !this.transitions[fromState][symbol]) {
            return symbol === 'ε' ? [] : ['Ø']
        }

        // Add the state's transitions on the given label to the list
        list = list.concat(this.transitions[fromState][symbol])

        // Check ε-transitions of the states that can be directly reached
        for (const s of this.transitions[fromState][symbol]) {
            if (this.transitions[s] && this.transitions[s]['ε'] !== undefined) {
                // Recursively search for ε-transitions and add them to the list
                list = this.getReachableStates(s, 'ε', list)
            }
        }

        // Remove duplicate entries by spreading a set
        return [...new Set(list)].sort()
    }
}
