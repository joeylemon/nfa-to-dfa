/**
 * Class constructor.
 */
function Converter(nfa) {
  this.nfa = nfa;
  this.dfa = undefined;
  this.curstep = 0;
  this.i = 1;
  this.j = 0;
}


/**
 * Class Functions
 */

/**
 * Generic print function for debugging purposes.
 */
Converter.prototype.print = function() {
	console.log('nfa: ', JSON.stringify(this.nfa));
	console.log('dfa: ', JSON.stringify(this.dfa));
}

/**
 * Completes the entire NFA to DFA conversion
 */
Converter.prototype.convert = function() {
  /* ALGORITHM: convert()

     define dfa to be the fsa such that
       dfa.states = power set of nfa.states
       dfa.alphabet = nfa.alphabet
       dfa.transitions = empty
       dfa.startState = epsilon_closure(nfa.startState)
       dfa.acceptStates = any state in dfa.states whose label contains an element
                         of nfa.acceptStates
     set dfa.transitions[[],x] := [[]], for each symbol x

     for each state S in (dfa.states - []):
       for each symbol sym in dfa.alphabet:
         set the transitions function on sym to the list
           of the epsilon_closures of all the states S
           can go to on sym
  */

  var i, j;
  var tmp_array = [];

  console.log('nfa', this.nfa);
  console.log('nfa.power_set', this.nfa.power_set);

  var states = this.nfa.power_set(this.nfa.states);
  var sigma = this.nfa.alphabet;
  var delta = new Map();  // undefined transition function
  var initState = this.nfa.epsilon_closure([this.nfa.startState]).toArray();
  var acceptStates = [];   // undefined

  // flatten initState array
  initState = initState.join(',');

  // define delta's 'null', or 'error', state: loop back on all symbols
  for (i = 0; i < sigma.length; i++) {
    delta.put('ES-'+sigma[i], 'ES');
  }

  // compute acceptStates
  for (i = 0; i < states.length; i++) {
    for (j = 0; j < this.nfa.acceptStates.length; j++) {
      tmp_array = states[i].split(',');
      if (tmp_array.indexOf(this.nfa.acceptStates[j]) >= 0) {
        acceptStates.push(states[i]);
        break;
      }
    }
  }

  /* begin looping through the states in the DFA to add transitions */
  for (i = 1; i < states.length; i++) {
    for (j = 0; j < sigma.length; j++) {
      tmp_array = this.nfa.eclosed_transitions(states[i],sigma[j]);
      console.log("eclosed_transitions = ", tmp_array);
      if (tmp_array.length === 0) {
        delta.put(states[i]+'-'+sigma[j], 'ES');
        console.log("adding transition: "+states[i]+'-'+sigma[j]+" --> ES'");
        continue;
      }
      delta.put(states[i]+'-'+sigma[j], tmp_array.sort().join(','));
      console.log("adding transition: "+states[i]+'-'+sigma[j]+' --> '+tmp_array.sort().join(','));
    }
  }

  this.dfa = new FSA(states, sigma, delta, initState, acceptStates);
}

/**
 * One step forward in the conversion.
 */
Converter.prototype.stepForward = function() {
  var states, sigma, delta, initState, acceptStates;
  var tmp_array = [];

    /* ALGORITHM: convert()

       define dfa to be the fsa such that
         dfa.states = power set of nfa.states
         dfa.alphabet = nfa.alphabet
         dfa.transitions = empty
         dfa.startState = epsilon_closure(nfa.startState)
         dfa.acceptStates = any state in dfa.states whose label contains an element
                           of nfa.acceptStates
       set dfa.transitions[[],x] := [[]], for each symbol x

       for each state S in (dfa.states - []):
         for each symbol sym in dfa.alphabet:
           set the transitions function on sym to the list
             of the epsilon_closures of all the states S
             can go to on sym
    */

  /* If the algorithm has not stepped yet, initialize the
     DFA with no transitions, but calculated powerset states,
     final set states, and start states */
  if (this.curstep === 0) {
    console.log("curstep is zero. initializing...");
    var i, j;

    states = this.nfa.power_set(this.nfa.states);
    sigma = this.nfa.alphabet;
    delta = new Map(); // undefined transition function
    initState = this.nfa.epsilon_closure([this.nfa.startState]).toArray();
    acceptStates = []; // undefined

    // flatten initState array
    initState = initState.join(',');

    // define delta's 'null', or 'error', state: loop back on all symbols
    for (i = 0; i < sigma.length; i++) {
      delta.put('ES-'+sigma[i], 'ES');
    }

    // compute acceptStates
    for (i = 0; i < states.length; i++) {
      for (j = 0; j < this.nfa.acceptStates.length; j++) {
        tmp_array = states[i].split(',');
        if (tmp_array.indexOf(this.nfa.acceptStates[j]) >= 0) {
          acceptStates.push(states[i]);
          break;
        }
      }
    }

    this.curstep = 1;
  }

  else {
    states = this.dfa.states;
    sigma = this.dfa.alphabet;
    delta = this.dfa.transitions;
    initState = this.dfa.startState;
    acceptStates = this.dfa.acceptStates;

    /* begin looping through the states in the DFA to add transitions */
    if (this.j === sigma.length) {
      this.i++;
      this.j = 0;
    }
    if (this.i === states.length)
      return false;
    tmp_array = this.nfa.eclosed_transitions(states[this.i],sigma[this.j]);
    console.log("eclosed_transitions = ", tmp_array);
    if (tmp_array.length === 0) {
      delta.put(states[this.i]+'-'+sigma[this.j], 'ES');
      console.log("adding transition: "+states[this.i]+'-'+sigma[this.j]+" --> ES'");
    } else {
      delta.put(states[this.i]+'-'+sigma[this.j], tmp_array.sort().join(','));
      console.log("adding transition: "+states[this.i]+'-'+sigma[this.j]+' --> '+tmp_array.sort().join(','));
    }
    this.j++;
    /*
    for (this.i = 0; i < states.length; i++) {
      for (j = 0; j < sigma.length; j++) {
        tmp_array = this.nfa.eclosed_transitions(states[i], sigma[j]);
        delta.put(states[i] + '-' + sigma[j], tmp_array.sort().join(','));
      }
    }
    */
  }

  /* update the dfa */
  this.dfa = new FSA(states, sigma, delta, initState, acceptStates);
  return true;
}

/**
 * One step backward in the conversion.
 */
Converter.prototype.stepBackward = function() {

}

/**
 * Performs *n* conversion steps.
 * if n > 0, calls stepForward() *n* times.
 * if n < 0, calls stepBackward() *n* times.
 *
 * this should somehow indicate which states were updated
 * so that I can add the appropriate new nodes and arrows
 * on the front-end. The goal is to avoid completely re-drawing
 * the DFA on every iteration. That would work, but 
 * would become slow for larger NFA/DFAs - AK
 */
Converter.prototype.step = function(n) {
	if(arguments.length === 0) {
		n = 1;
	}

  var i;
  for (i = 0; i < n; i++) {
    if (!this.stepForward())
      return i;
  }
  return i;
}

Converter.prototype.reset = function () {
  this.i = 1;
  this.j = 0;
  this.curstep = 0;
  this.nfa.reset();
  if(this.dfa !== undefined) this.dfa.reset();
};
