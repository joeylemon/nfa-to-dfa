import FSA from './fsa/fsa.js'
import NFAConverter from './fsa/nfa_converter.js'

const nfaTest = new FSA(['1', '2', '3'], ['a', 'b'], {
    1: {
        a: undefined,
        b: ['2'],
        ε: ['3']
    },
    2: {
        a: ['2', '3'],
        b: ['3'],
        ε: undefined
    },
    3: {
        a: ['1'],
        b: undefined,
        ε: undefined
    }
}, '1', ['1'])

console.log(nfaTest)
console.log(nfaTest.getPowersetOfStates().map(e => e.join(',')))
console.log(nfaTest.getEpsilonReachableStates('1'))

const nfaConverter = new NFAConverter(nfaTest)
console.log(nfaConverter.stepForward())
console.log(nfaConverter)
