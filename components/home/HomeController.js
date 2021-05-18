app.controller('HomeController',
    function ($scope, $timeout) {
        /**
             * declare variables shared within the HomeController.
             */
        let NFA = null
        let NFAVisual = null
        let DFAVisual = null
        const converter = new Converter()
        let converting = false

        $scope.nfaInput = ' ' // Used in $scope.update

        /**
         * called once the div with id 'NFA' has been initialized.
         *
         * Creates a new instance of ForceGraph called NFAVisual,
         * appending it to the div with id 'NFA'
         *
         * Then applies some sample states and transitions.
         */
        $scope.initializeNFA = function () {
            const width = $('#NFA').innerWidth()
            const height = $('#NFA').parent().innerHeight()
            NFAVisual = new ForceGraph('#NFA', width, height)

            NFA = new FSA()
            converter.nfa = NFA

            $scope.sampleNFA1()
            syncNFA()
        }

        /**
         * analagous to initialize NFA, but with no sample states and transitions.
         */
        $scope.initializeDFA = function () {
            const width = $('#DFA').innerWidth()
            const height = $('#DFA').parent().innerHeight()

            DFAVisual = new ForceGraph('#DFA', width, height)
            DFAVisual.forceRenderSpeed = 100
            DFAVisual.nodeRadius = 20
            syncDFA()
        }

        /**
         * Clear the NFA states array and transitions map.
         * Recreate them from the current NFAVisual nodes and links.
         * Parse the transitions in NFAVisual to deduce what the alphabet is.
         * Find the start and accept states in NFAVisual and set them in NFA.
         *
         * This is admittedly a wasteful implementation, as it completely
         * re-creates the array and map on every call.
         */
        function syncNFA () {
            let i; let j; let key; let reachableStates; const visualStates = NFAVisual.getNodes()
            const visualTransitions = NFAVisual.getLinks()
            let tmp

            // Clear and recreate the states
            NFA.states = []
            for (i = 0; i < visualStates.length; i++) {
                NFA.states.push(visualStates[i].id)
            }
            // Clear and recreate the transitions.
            NFA.transitions.clear()
            for (i = 0; i < visualTransitions.length; i++) {
                const sourceState = (visualTransitions[i].id.split('-'))[0]
                const targetState = (visualTransitions[i].id.split('-'))[1]
                const symbols = (visualTransitions[i].label.split(','))

                for (j = 0; j < symbols.length; j++) {
                    key = [sourceState, symbols[j]].join('-')
                    reachableStates = NFA.transitions.find(key)
                    if (!reachableStates) {
                        NFA.transitions.put(key, [targetState])
                    } else {
                        NFA.transitions.put(key, reachableStates.concat(targetState).sort())
                    }
                }
            }
            // Iterate over the transitions to deduce the NFA alphabet
            const alphabet = new Map()
            for (i = 0; i < visualTransitions.length; i++) {
                tmp = visualTransitions[i].label
                if (tmp === 'E') continue
                tmp = tmp.replace(',E', '').replace('E,', '')
                tmp = tmp.split(',').sort()
                alphabet.putArray(tmp)
            }
            NFA.alphabet = alphabet.toArray().sort()
            // Clear and specify the start states.
            d3.selectAll('.start').each(function (d, i) {
                NFA.startState = d.id
            })
            // Clear and specifcy the accept states.
            NFA.acceptStates = []
            d3.selectAll('.accept').each(function (d, i) {
                NFA.acceptStates.push(d.id)
            })

            $scope.updateNFAInput()
        }

        /**
         * Determine an appropriate number of nodes per row, horizontal difference,
         * and vertial difference.
         *
         * Iteratively add states from the DFA object to the DFAVisual object in a
         * grid pattern.
         *
         * Add all transitions from the DFA object to the DFAVisual object. Do not
         * worry about duplicate transitions, as the ForceGraph handles them internally.
         *
         * Update the start and accept states from the DFA object ot the DFAVisual object.
         */
        function syncDFA () {
            if (converter.dfa === null || converter.dfa === undefined) return

            console.log('sync dfa')

            let i
            let tmp
            const visualStates = new Map()
            const visualTransitions = new Map()
            let cols = 2
            let id
            let lastTransition

            if (DFAVisual.width > 500) cols = 4
            else if (DFAVisual.width > 200) cols = 3

            const rows = Math.floor(converter.dfa.states.length / cols)
            const xDist = Math.floor(DFAVisual.width / cols)
            const yDist = Math.floor(DFAVisual.height / (rows))
            const xPad = 100
            const yPad = 4 * DFAVisual.nodeRadius

            console.log(yPad)

            // Add any states that exist in DFA and not in DFAVisual to DFAVisual
            visualStates.putArray(DFAVisual.getNodes(), 'id')
            for (i = 0; i < converter.dfa.states.length; i++) {
                const label = converter.dfa.states[i]
                const state = visualStates.find(label)
                if (!state) {
                    const x = xDist * (i % cols) + xPad
                    const y = yDist * Math.floor(i / cols) + yPad
                    visualStates.put(label, label)
                    DFAVisual.addNode(label, x, y)
                }
            }

            // Remove any states that exist in DFAVisual and not in DFA
            const nodes = DFAVisual.getNodes()
            for (i = 0; i < nodes.length; i++) {
                if (!converter.dfa.states.includes(nodes[i].label)) {
                    DFAVisual.removeNode(nodes[i].label)
                }
            }

            // Add any transitions that exist in DFA and not in DFAVisual to DFAVisual
            // ForceGraph handles redundancy in links, so no check is necessary here.
            visualTransitions.putArray(DFAVisual.getLinks(), 'id')
            tmp = converter.dfa.transitions.contents
            for (const k in tmp) {
                const source = k.split('-')[0]
                const label = k.split('-')[1]
                const target = tmp[k]

                DFAVisual.addLink(label, source, target)
            }

            // Set DFAVisual start state
            if (converter.dfa.startState !== undefined) {
                id = '#DFA-N' + converter.dfa.startState.replace(',', '_')
                d3.select(id).classed('start', true)
            }

            // Set DFAVisual accept state
            if (converter.dfa.acceptStates !== undefined) {
                tmp = converter.dfa.acceptStates
                for (i = 0; i < tmp.length; i++) {
                    id = '#DFA-N' + tmp[i].replace(/,/g, '_')
                    d3.select(id).classed('accept', true)
                }
            }

            // Add 'last-added' class to the last element in the links array
            tmp = DFAVisual.getLinks()
            if (tmp.length > 0) {
                lastTransition = tmp[tmp.length - 1]
                id = '#' + lastTransition.elementId
                d3.select('.last').classed('last', false)
                d3.select(id).classed('last', true)
            }
        }

        /**
         * prompts the user for a name for this state and calls
         * addNode for the NFAVisual object.
         */
        $scope.addState = function () {
            let id = ''
            while (id.trim().length === 0 || id.trim().length > 3) {
                id = prompt('State Id? (1 to 3 characters)', '')
            }
            if (id === null) return
            NFAVisual.addNode(id)
            syncNFA()
        }

        /**
         * prompts the user for a name, source, and target transition.
         */
        $scope.addTransition = function () {
            let symbols = ''
            let source = ''
            let target = ''
            while (symbols.trim().length === 0) {
                symbols = prompt('(1/3): Symbols? (Separated by commas)', '')
            }
            while (source.trim().length === 0) {
                source = prompt('(2/3): Source state?', '')
            }
            while (target.trim().length === 0) {
                target = prompt('(3/3): Target state?', '')
            }

            NFAVisual.addLink(symbols, source, target)
            syncNFA()
        }

        /**
         * deletes any nodes elements that have the selected
         * class and deletes any corresponding links.
         */
        $scope.deleteSelected = function () {
            d3.selectAll('.selected').each(function (d) {
                NFAVisual.removeNode(d.id)
            })
            syncNFA()
        }

        /**
         * Adds the 'start' class to any nodes of the 'selected' class.
         * Deselects the node.
         * Sets the fixedPosition property for the node to lock it in place.
         */
        $scope.setStartState = function () {
            NFAVisual.toggleClass('.selected', 'start', false)
            const id = d3.select('.selected.start').attr('id').replace('NFA-N', '')

            NFAVisual.toggleClass('.selected.start', 'selected', false)
            NFAVisual.setNodeProperty(id, 'fixedPosition', {
                x: NFAVisual.nodeRadius * 4,
                y: NFAVisual.nodeRadius * 4
            })
            syncNFA()
        }

        $scope.setAcceptStates = function () {
            NFAVisual.toggleClass('.selected', 'accept', true)
            NFAVisual.toggleClass('.selected.accept', 'selected', true)
            syncNFA()
        }

        $scope.reset = function () {
            NFAVisual.reset()
            if (DFAVisual !== null) {
                DFAVisual.reset()
                converter.reset()
            }
            syncNFA()
        }

        /**
         * steps forward in the conversion from NFA to DFA.
         */
        $scope.stepForward = function () {
            converter.stepForward()
            syncDFA()
        }

        /**
         * runs the complete conversion once through
         */
        $scope.completeConversion = function () {
            while (converter.stepForward());
            console.log('resulting dfa', converter.dfa)
            syncDFA()
        }

        /**
         * runs the conversion from NFA to DFA until
         * at 1 second intervals until pauseConversion is called.
         */
        $scope.incrementalConversion = function () {
            converting = true
            var step = function () {
                if (converter.stepForward() && converting) {
                    syncDFA()
                    $timeout(step, 1000)
                }
            }
            $timeout(step, 0)
        }

        /**
         * pauses the incremental conversion
         */
        $scope.pauseIncrementalConversion = function () {
            converting = false
        }

        /**
         * Build a user-friendly JSON object that will be displayed
         * in the NFA JSON input field.
         */
        $scope.updateNFAInput = function () {
            const userNFA = {
                states: [],
                transitions: [],
                start: '',
                accept: []
            }; let tmp; let i

            tmp = NFAVisual.getNodes()
            for (i = 0; i < tmp.length; i++) {
                userNFA.states.push(tmp[i].label)
            }

            tmp = NFAVisual.getLinks()
            for (i = 0; i < tmp.length; i++) {
                userNFA.transitions.push({
                    symbol: tmp[i].label,
                    source: tmp[i].source.label,
                    target: tmp[i].target.label
                })
            }

            userNFA.start = NFA.startState
            tmp = NFA.acceptStates
            for (i = 0; i < tmp.length; i++) {
                userNFA.accept.push(tmp[i])
            }

            this.nfaInput = JSON.stringify(userNFA, null, 2)
        }

        /**
         * Parse the JSON NFA input and reflect the changes
         * in NFAVisual
         */
        $scope.parseNFAInput = function () {
            const userNFA = JSON.parse(this.nfaInput)
            let tmp; let i; let id
            // Add the nodes
            tmp = userNFA.states
            for (i = 0; i < tmp.length; i++) {
                NFAVisual.addNode(tmp[i])
            }
            // Add the links
            tmp = userNFA.transitions
            for (i = 0; i < tmp.length; i++) {
                NFAVisual.addLink(tmp[i].symbol, tmp[i].source, tmp[i].target)
            }
            // Set the start state
            d3.selectAll('.start').each(function (d) {
                d3.select(d.elementId).classed('start', false)
            })
            id = '#NFA-N' + userNFA.start
            d3.select(id).classed('selected', true)
            $scope.setStartState()
            // Set the accept states
            tmp = userNFA.accept
            for (i = 0; i < tmp.length; i++) {
                id = '#NFA-N' + tmp[i]
                d3.select(id).classed('accept', true)
            }
            $scope.setAcceptStates()
            syncNFA()
        }

        $scope.sampleNFA1 = function () {
            $scope.reset()
            // add the sample NFA states
            NFAVisual.addNode('1')
            NFAVisual.addNode('2')
            NFAVisual.addNode('3')

            // add the sample NFA transitions
            NFAVisual.addLink('E', '1', '3')
            NFAVisual.addLink('a,b', '2', '3')
            NFAVisual.addLink('a', '3', '1')
            NFAVisual.addLink('a', '2', '2')
            NFAVisual.addLink('b', '1', '2')

            d3.select('#NFA-N1').classed('selected', true)
            $scope.setStartState()
            d3.select('#NFA-N1').classed('selected', true)
            $scope.setAcceptStates()
        }

        $scope.sampleNFA2 = function () {
            $scope.reset()

            NFAVisual.addNode('1')
            NFAVisual.addNode('2')
            NFAVisual.addNode('3')

            NFAVisual.addLink('E', '1', '2')
            NFAVisual.addLink('a', '1', '3')
            NFAVisual.addLink('a,b', '3', '2')

            d3.select('#NFA-N1').classed('selected', true)
            $scope.setStartState()
            d3.select('#NFA-N2').classed('selected', true)
            $scope.setAcceptStates()
        }

        $scope.sampleNFA3 = function () {
            $scope.reset()
            let i
            for (i = 0; i < 6; i++) {
                NFAVisual.addNode(i.toString())
            }
            for (i = 0; i < 5; i++) {
                NFAVisual.addLink(i.toString(), i.toString(), (i + 1).toString())
            }
            d3.select('#NFA-N0').classed('selected', true)
            $scope.setStartState()
            d3.select('#NFA-N5').classed('selected', true)
            $scope.setAcceptStates()
        }
    })
