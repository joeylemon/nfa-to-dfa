/**
 * Protected variables.
 * Can be accessed by any functions in this script,
 * but can't be accessed without a getter function 
 * externally.
 *
 * Don't use this for now as it turns things into 
 * singletons that we don't necessarily want to be
 * singletons.
 */

/**
 * Constructor for FSA class instances.
 * Any public variables for an FSA instance 
 * should be declared here.
 *
 * Giving more descriptive names for the
 * formal (Q, sigma, delta, q_o, F)
 * 
 */

function FSA(states, alphabet, transitions, startState, acceptStates) {
    if (arguments.length !== 5) {
        this.states = [];               /* we will use this as a convenience for iterating
                                           through all the states in the machine */
        this.alphabet = [];             /* changed from {} to []. We just need to be able to
                                           iterate through a list of possible symbols */
        this.transitions = new Map();
        this.startState = undefined;           /* a state ID should always be represented as
                                           a sorted array of integers. */
        this.acceptStates = [];          /* In accordance with the above definition, 
                                           the set of acceptStates should always be
                                           a Set of sorted arrays of integers */
    } else {
    	this.states = states;
	    this.alphabet = alphabet;
	    this.transitions = transitions;
	    this.startState = startState;
	    this.acceptStates = acceptStates;
    }
}

/**
 * Class functions.
 * Available externally.
 */

/*
   power_set(states, inc_null)

   *states*  List of strings which represent state IDs
   *inc_null*  If true, the returned list includes an empty
     list as an element.
   
   RETURN VALUE.  Returns a list of strings of comma separated
     state IDs. This list is the power set of *states*.
*/

FSA.prototype.power_set = function (states, inc_null) {
  var powerset = states.slice(0); // start with the list of states
  var i, iter;
  var tmp_list; // holds a list for processing

  if (!states) return [];
  if (arguments.length === 1) inc_null = true;

  /* While it is possible to construct unique combinations
     by adding to the elements of powerset from the elements of
     flat_states, do so by cloning the list we want to add to,
     adding a single element of flat_states that is greater than
     all of the new list's elements, and then adding the cloned
     list to powerset. We do this for each element in and added
     to powerset until no more unique combinations can be added. */

  iter = 0;  // the index of the powerset elem under consideration
  while (iter < powerset.length) {
    /* iterate through states, looking for an element of
       states that can be added to powerset[iter] to form a
       unique combination. This is true when flat_states[i] is
       greater than the largest element of powerset[iter], which
       is always the last element of powerset[iter]. This
       guarantees that every list added to powerset is a unique
       combination, where the permutation is the one in which
       the elements are ordered least to greatest. */
    for (i = 0; i < states.length; i++) {
      var pset_list = powerset[iter].split(',');
      if (states[i] > pset_list[pset_list.length-1]) {
        pset_list.push(states[i]);
        powerset.push(pset_list.join(','));
      }
    }
    iter++;
  }

  // add the null set if requested
  if (inc_null) powerset.unshift('ES');

  return powerset;
};

/**
  epsilon_closure(states)
  
  *states* is an array of state IDs. (e.g., states = ['1','2','3'])
*/
FSA.prototype.epsilon_closure = function(states) {
  if (!(states instanceof Array)) {
    console.err("epsilon_closure called without an Array argument.");
    return false;
  }

  var eclosed_states = new Set(states);
  var queue = new Set(states);
  var delta = this.transitions;

  while (queue.size() !== 0) {
    /* add all states reachable on an epsilon transition to the queue
       and the list of eclosed states */
    var src = queue.data.shift();
    var dst = delta.find(src+'-E');
    if (dst) {
      for (var i = 0; i < dst.length; i++) {
        if (eclosed_states.insert(dst[i]))
          queue.insert(dst[i]);
      }
    }
  }

  return eclosed_states;
};

/**
  eclosed_transitions(states, symb)

  <states> is an array of integers, each of which represents a single
  NFA state (e.g., 1 in <states> is [1] in the NFA). <symb> is a char
  that denotes the symbol on which the transition takes place.

  Returns an array of states similar to the input <states>. The output
  states represent the epsilon-closed set of states reachable from
  <states> on input <symb>.
*/

/**
  eclosed_transitions(states, symb)

  *states* is an array of state IDs from the NFA.
  *symb* is the symbol string on which the transition takes place.

  RETURN VALUE.  Returns an array of states similar to the input
  *states*. The output set of states represents the epsilon-closed 
  set of states reachable from *states* on input *symb*.
*/

FSA.prototype.eclosed_transitions = function (states, symb) {
  var i, j;
  var trans_set = new Set();
  var trans_array;
  var post_eclose;

  /* find the set of states reachable from *states* on *symb* */
  for (i = 0; i < states.length; i++) {
    trans_array = this.transitions.find(states[i]+'-'+symb);
    if (trans_array) {
      for (j = 0; j < trans_array.length; j++)
        trans_set.insert(trans_array[j]);
    }
  }

  /* calculate the epsilon closure of these states */
  post_eclose = this.epsilon_closure(trans_set.toArray()).toArray();

  post_eclose.sort();
  return post_eclose;
};

FSA.prototype.reset = function() {
  this.states = [];
  this.alphabet = [];
  this.transitions = new Map();
  this.startState = undefined;
  this.acceptStates = [];
}
