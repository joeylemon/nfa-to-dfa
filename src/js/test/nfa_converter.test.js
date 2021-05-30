import should from 'should' // eslint-disable-line no-unused-vars
import FSA from '../fsa/fsa.js'
import NFAConverter from '../fsa/nfa_converter.js'

describe('NFA Conversion 1', () => {
    const nfa = new FSA(['1', '2', '3'], ['a', 'b'], {
        '1': {
            'a': undefined,
            'b': ['2'],
            'ε': ['3']
        },
        '2': {
            'a': ['2', '3'],
            'b': ['3'],
            'ε': undefined
        },
        '3': {
            'a': ['1'],
            'b': undefined,
            'ε': undefined
        }
    }, '1', ['1'])

    const conversion = new NFAConverter(nfa)

    it('should generate the initial DFA', done => {
        const [dfa] = conversion.stepForward()

        dfa.states.should.eql(['Ø', '1', '2', '1,2', '3', '1,3', '2,3', '1,2,3'])
        dfa.alphabet.should.eql(['a', 'b'])
        dfa.startState.should.eql('1,3')
        dfa.acceptStates.should.eql(['1', '1,2', '1,3', '1,2,3'])
        dfa.transitions.should.eql({
            '1': { a: undefined, b: undefined },
            '1,2': { a: undefined, b: undefined },
            '1,2,3': { a: undefined, b: undefined },
            '1,3': { a: undefined, b: undefined },
            '2': { a: undefined, b: undefined },
            '2,3': { a: undefined, b: undefined },
            '3': { a: undefined, b: undefined },
            'Ø': { a: undefined, b: undefined }
        })

        done()
    })

    it('should generate transitions', done => {
        const dfa = conversion.step(16)

        dfa.transitions.should.eql({
            '1': { a: ['Ø'], b: ['2'] },
            '1,2': { a: ['2,3'], b: ['2,3'] },
            '1,2,3': { a: ['1,2,3'], b: ['2,3'] },
            '1,3': { a: ['1,3'], b: ['2'] },
            '2': { a: ['2,3'], b: ['3'] },
            '2,3': { a: ['1,2,3'], b: ['3'] },
            '3': { a: ['1,3'], b: ['Ø'] },
            'Ø': { a: ['Ø'], b: ['Ø'] }
        })

        done()
    })

    it('should delete unreachable states', done => {
        const dfa = conversion.step(2)

        dfa.states.should.eql(['Ø', '2', '3', '1,3', '2,3', '1,2,3'])
        dfa.alphabet.should.eql(['a', 'b'])
        dfa.startState.should.eql('1,3')
        dfa.acceptStates.should.eql(['1,3', '1,2,3'])
        dfa.transitions.should.eql({
            '1,2,3': { a: ['1,2,3'], b: ['2,3'] },
            '1,3': { a: ['1,3'], b: ['2'] },
            '2': { a: ['2,3'], b: ['3'] },
            '2,3': { a: ['1,2,3'], b: ['3'] },
            '3': { a: ['1,3'], b: ['Ø'] },
            'Ø': { a: ['Ø'], b: ['Ø'] }
        })

        done()
    })
})

describe('NFA Conversion 2', () => {
    const nfa = new FSA(['q1', 'q2', 'q3'], ['0', '1'], {
        'q1': {
            '0': ['q3'],
            '1': ['q2', 'q3'],
            'ε': undefined
        },
        'q2': {
            '0': ['q2'],
            '1': ['q2'],
            'ε': ['q3']
        },
        'q3': {
            '0': ['q2'],
            '1': ['q1', 'q2'],
            'ε': undefined
        }
    }, 'q1', ['q1', 'q3'])

    const conversion = new NFAConverter(nfa)

    it('should generate the initial DFA', done => {
        const [dfa] = conversion.stepForward()

        dfa.states.should.eql(['Ø', 'q1', 'q2', 'q1,q2', 'q3', 'q1,q3', 'q2,q3', 'q1,q2,q3'])
        dfa.alphabet.should.eql(['0', '1'])
        dfa.startState.should.eql('q1')
        dfa.acceptStates.should.eql(['q1', 'q1,q2', 'q3', 'q1,q3', 'q2,q3', 'q1,q2,q3'])
        dfa.transitions.should.eql({
            'q1': { 0: undefined, 1: undefined },
            'q1,q2': { 0: undefined, 1: undefined },
            'q1,q2,q3': { 0: undefined, 1: undefined },
            'q1,q3': { 0: undefined, 1: undefined },
            'q2': { 0: undefined, 1: undefined },
            'q2,q3': { 0: undefined, 1: undefined },
            'q3': { 0: undefined, 1: undefined },
            'Ø': { 0: undefined, 1: undefined }
        })

        done()
    })

    it('should generate transitions', done => {
        const dfa = conversion.step(16)

        dfa.transitions.should.eql({
            'q1': { 0: ['q3'], 1: ['q2,q3'] },
            'q1,q2': { 0: ['q2,q3'], 1: ['q2,q3'] },
            'q1,q2,q3': { 0: ['q2,q3'], 1: ['q1,q2,q3'] },
            'q1,q3': { 0: ['q2,q3'], 1: ['q1,q2,q3'] },
            'q2': { 0: ['q2,q3'], 1: ['q2,q3'] },
            'q2,q3': { 0: ['q2,q3'], 1: ['q1,q2,q3'] },
            'q3': { 0: ['q2,q3'], 1: ['q1,q2,q3'] },
            'Ø': { 0: ['Ø'], 1: ['Ø'] }
        })

        done()
    })

    it('should delete unreachable states', done => {
        const dfa = conversion.step(4)

        dfa.states.should.eql(['q1', 'q3', 'q2,q3', 'q1,q2,q3'])
        dfa.alphabet.should.eql(['0', '1'])
        dfa.startState.should.eql('q1')
        dfa.acceptStates.should.eql(['q1', 'q3', 'q2,q3', 'q1,q2,q3'])
        dfa.transitions.should.eql({
            'q1': { 0: ['q3'], 1: ['q2,q3'] },
            'q1,q2,q3': { 0: ['q2,q3'], 1: ['q1,q2,q3'] },
            'q2,q3': { 0: ['q2,q3'], 1: ['q1,q2,q3'] },
            'q3': { 0: ['q2,q3'], 1: ['q1,q2,q3'] }
        })

        done()
    })
})

describe('NFA Conversion 3', () => {
    const nfa = new FSA(['1', '2', '3'], ['a', 'b'], {
        '1': {
            'a': undefined,
            'b': ['2'],
            'ε': ['3']
        },
        '2': {
            'a': ['1'],
            'b': ['2'],
            'ε': undefined
        },
        '3': {
            'a': ['2', '3'],
            'b': ['3'],
            'ε': undefined
        }
    }, '1', ['2'])

    const conversion = new NFAConverter(nfa)

    it('should generate the initial DFA', done => {
        const [dfa] = conversion.stepForward()

        dfa.states.should.eql(['Ø', '1', '2', '1,2', '3', '1,3', '2,3', '1,2,3'])
        dfa.alphabet.should.eql(['a', 'b'])
        dfa.startState.should.eql('1,3')
        dfa.acceptStates.should.eql(['2', '1,2', '2,3', '1,2,3'])
        dfa.transitions.should.eql({
            '1': { a: undefined, b: undefined },
            '1,2': { a: undefined, b: undefined },
            '1,2,3': { a: undefined, b: undefined },
            '1,3': { a: undefined, b: undefined },
            '2': { a: undefined, b: undefined },
            '2,3': { a: undefined, b: undefined },
            '3': { a: undefined, b: undefined },
            'Ø': { a: undefined, b: undefined }
        })

        done()
    })

    it('should generate transitions', done => {
        const dfa = conversion.step(16)

        dfa.transitions.should.eql({
            '1': { a: ['Ø'], b: ['2'] },
            '1,2': { a: ['1,3'], b: ['2'] },
            '1,2,3': { a: ['1,2,3'], b: ['2,3'] },
            '1,3': { a: ['2,3'], b: ['2,3'] },
            '2': { a: ['1,3'], b: ['2'] },
            '2,3': { a: ['1,2,3'], b: ['2,3'] },
            '3': { a: ['2,3'], b: ['3'] },
            'Ø': { a: ['Ø'], b: ['Ø'] }
        })

        done()
    })

    it('should delete unreachable states', done => {
        const dfa = conversion.step(5)

        dfa.states.should.eql(['1,3', '2,3', '1,2,3'])
        dfa.alphabet.should.eql(['a', 'b'])
        dfa.startState.should.eql('1,3')
        dfa.acceptStates.should.eql(['2,3', '1,2,3'])
        dfa.transitions.should.eql({
            '1,2,3': { a: ['1,2,3'], b: ['2,3'] },
            '1,3': { a: ['2,3'], b: ['2,3'] },
            '2,3': { a: ['1,2,3'], b: ['2,3'] }
        })

        done()
    })

    it('should delete redundant states', done => {
        const dfa = conversion.step(1)

        dfa.states.should.eql(['1,3', '2,3+1,2,3'])
        dfa.alphabet.should.eql(['a', 'b'])
        dfa.startState.should.eql('1,3')
        dfa.acceptStates.should.eql(['2,3+1,2,3'])
        dfa.transitions.should.eql({
            '1,3': { a: ['2,3+1,2,3'], b: ['2,3+1,2,3'] },
            '2,3+1,2,3': { a: ['2,3+1,2,3'], b: ['2,3+1,2,3'] }
        })

        done()
    })
})
