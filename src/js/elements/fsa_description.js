export default class FSADescription {
    constructor (selector) {
        this.selector = selector

        this.tableSelector = `${selector} .table`
        this.statesSelector = `${selector} .states`
        this.alphabetSelector = `${selector} .alphabet`
        this.acceptStatesSelector = `${selector} .acceptStates`
        this.startStateSelector = `${selector} .startState`

        this.reset()
    }

    reset () {
        document.querySelector(this.statesSelector).innerHTML = ''
        document.querySelector(this.alphabetSelector).innerHTML = ''
        document.querySelector(this.acceptStatesSelector).innerHTML = ''
        document.querySelector(this.startStateSelector).innerHTML = ''
        document.querySelector(this.tableSelector).innerHTML = `
            <thead>
                <tr>
                    <th style='height: 40px;'></th>
                    <th></th>
                    <th></th>
                    <th></th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <th style='height: 40px'></th>
                    <td></td>
                    <td></td>
                    <td></td>
                </tr>
                <tr>
                    <th style='height: 40px'></th>
                    <td></td>
                    <td></td>
                    <td></td>
                </tr>
                <tr>
                    <th style='height: 40px'></th>
                    <td></td>
                    <td></td>
                    <td></td>
                </tr>
            </tbody>`
    }

    update (fsa, isNFA) {
        const fsaCopy = JSON.parse(JSON.stringify(fsa))
        let states = fsaCopy.states
        let startState = fsaCopy.startState
        let acceptStates = fsaCopy.acceptStates

        if (!isNFA) {
            states = fsaCopy.states.map(e => `{${e}}`)
            startState = `{${fsaCopy.startState}}`
            acceptStates = fsaCopy.acceptStates.map(e => `{${e}}`)
        }

        document.querySelector(this.statesSelector).innerHTML = `{${states.join(', ')}}`
        document.querySelector(this.alphabetSelector).innerHTML = `{${fsaCopy.alphabet.filter(e => e !== 'ε').join(', ')}}`
        document.querySelector(this.acceptStatesSelector).innerHTML = `{${acceptStates.join(', ')}}`
        document.querySelector(this.startStateSelector).innerHTML = startState || ''

        const rows = []
        const alphabet = fsaCopy.alphabet
        if (isNFA) {
            alphabet.push('ε')
        }

        for (const state of fsaCopy.states) {
            const transitions = [state]
            for (let i = 0; i < alphabet.length; i++) {
                const symbol = alphabet[i]
                if (fsaCopy.transitions[state] && fsaCopy.transitions[state][symbol]) {
                    transitions.push(fsaCopy.transitions[state][symbol].join(', '))
                } else {
                    transitions.push('')
                }
            }
            rows.push(transitions)
        }

        document.querySelector(this.tableSelector).innerHTML = `
        <thead>
            <tr>
                <th></th>
                ${alphabet.map(e => `<th>${e}</th>`).join('')}
            </tr>
        </thead>
        <tbody>
        ${rows.map(r => {
        return `<tr>${r.map(t => `<td>${t}</td>`).join('')}</tr>`
    }).join('')}
        </tbody>`
    }
}
