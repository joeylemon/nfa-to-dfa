/**
 * FSA represents a finite state automaton. This can be either an NFA or a DFA.
 */
export default class FSA {
    constructor (states, alphabet, transitions, startState, acceptStates) {
        // states is the array of states in this FSA
        // e.g. states => ['1', '2', '3']
        this.states = states

        // alphabet is the array of symbols in this FSA
        // e.g. alphabet => ['a', 'b']
        this.alphabet = alphabet

        // transitions is a map of states and symbols to other states
        // e.g. transitions['1']['a'] => ['2', '3'] means upon the input of symbol a at state 1, an NFA
        //      can transition to state 2 or state 3
        this.transitions = transitions

        // startState is the name of the start state for this FSA
        // e.g. startState => '1'
        this.startState = startState

        // acceptStates is the array of states that an input can be accepted on
        // e.g. acceptStates => ['1', '3']
        this.acceptStates = acceptStates
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
        if (!this.states.includes(fromState)) throw new Error(`FSA does not have a state named ${fromState}`)

        if (!this.transitions[fromState]['ε']) {
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
        if (!this.states.includes(fromState)) throw new Error(`FSA does not have a state named ${fromState}`)
        if (symbol !== 'ε' && !this.alphabet.includes(symbol)) throw new Error(`FSA alphabet does not contain symbol ${symbol}`)

        if (!this.transitions[fromState][symbol]) {
            return symbol === 'ε' ? [] : ['Ø']
        }

        // Add the state's transitions on the given label to the list
        list = list.concat(this.transitions[fromState][symbol])

        // Check ε-transitions of the states that can be directly reached
        for (const s of this.transitions[fromState][symbol]) {
            if (this.transitions[s]['ε'] !== undefined) {
                // Recursively search for ε-transitions and add them to the list
                list = this.getReachableStates(s, 'ε', list)
            }
        }

        // Remove duplicate entries by spreading a set
        return [...new Set(list)].sort()
    }
}