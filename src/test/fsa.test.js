import should from 'should' // eslint-disable-line no-unused-vars
import FSA from '../js/fsa/fsa.js'

describe('FSA 1', () => {
    const fsa = new FSA(['1', '2', '3'], ['a', 'b'], {
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

    it('should get the power set of states', done => {
        const powerset = fsa.getPowersetOfStates()
        powerset.length.should.eql(1 << fsa.states.length)
        powerset.should.eql([['Ø'], ['1'], ['2'], ['1', '2'], ['3'], ['1', '3'], ['2', '3'], ['1', '2', '3']])
        done()
    })

    it('should get epsilon closure states', done => {
        fsa.getEpsilonClosureStates('1').should.eql(['1', '3'])
        fsa.getEpsilonClosureStates('2').should.eql(['2'])
        fsa.getEpsilonClosureStates('3').should.eql(['3'])
        done()
    })

    it('should get reachable states', done => {
        fsa.getReachableStates('1', 'a').should.eql(['Ø'])
        fsa.getReachableStates('1', 'b').should.eql(['2'])
        fsa.getReachableStates('2', 'a').should.eql(['2', '3'])
        fsa.getReachableStates('2', 'b').should.eql(['3'])
        fsa.getReachableStates('3', 'a').should.eql(['1', '3'])
        fsa.getReachableStates('3', 'b').should.eql(['Ø'])
        done()
    })

    it('should not get epsilon closure states from an invalid state', done => {
        should(() => { fsa.getEpsilonClosureStates('4') }).throw('FSA does not have a state named 4')
        done()
    })

    it('should not get reachable states from an invalid state', done => {
        should(() => { fsa.getReachableStates('4', 'a') }).throw('FSA does not have a state named 4')
        should(() => { fsa.getReachableStates('1', 'z') }).throw('FSA alphabet does not contain symbol z')
        done()
    })
})

describe('FSA 2', () => {
    const fsa = new FSA(['q1', 'q2', 'q3'], ['0', '1'], {
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

    it('should get the power set of states', done => {
        const powerset = fsa.getPowersetOfStates()
        powerset.length.should.eql(1 << fsa.states.length)
        powerset.should.eql([['Ø'], ['q1'], ['q2'], ['q1', 'q2'], ['q3'], ['q1', 'q3'], ['q2', 'q3'], ['q1', 'q2', 'q3']])
        done()
    })

    it('should get epsilon closure states', done => {
        fsa.getEpsilonClosureStates('q1').should.eql(['q1'])
        fsa.getEpsilonClosureStates('q2').should.eql(['q2', 'q3'])
        fsa.getEpsilonClosureStates('q3').should.eql(['q3'])
        done()
    })

    it('should get reachable states', done => {
        fsa.getReachableStates('q1', '0').should.eql(['q3'])
        fsa.getReachableStates('q1', '1').should.eql(['q2', 'q3'])
        fsa.getReachableStates('q2', '0').should.eql(['q2', 'q3'])
        fsa.getReachableStates('q2', '1').should.eql(['q2', 'q3'])
        fsa.getReachableStates('q3', '0').should.eql(['q2', 'q3'])
        fsa.getReachableStates('q3', '1').should.eql(['q1', 'q2', 'q3'])
        done()
    })

    it('should not get epsilon closure states from an invalid state', done => {
        should(() => { fsa.getEpsilonClosureStates('q4') }).throw('FSA does not have a state named q4')
        done()
    })

    it('should not get reachable states from an invalid state', done => {
        should(() => { fsa.getReachableStates('q4', '0') }).throw('FSA does not have a state named q4')
        should(() => { fsa.getReachableStates('q1', '2') }).throw('FSA alphabet does not contain symbol 2')
        done()
    })
})
