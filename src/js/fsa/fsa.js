export default class FSA {
    constructor (states, alphabet, transitions, startState, acceptStates) {
        this.states = states
        this.alphabet = alphabet
        this.transitions = transitions
        this.startState = startState
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
     * Define E(R) to be the collection of states that can be reached from R by going along
     * ε transitions, including members of R themselves
     *
     * @param {String} fromState The label of the state to find epsilon-reachable states from
     */
    getEpsilonReachableStates (fromState) {
        return [fromState, ...this.transitions[fromState]['ε']]
    }
}
