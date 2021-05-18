# Visual NFA to DFA Converter

Originally created by Alex Klibisz and Connor Minton, COSC 312, Spring 2015, University of Tennessee, Knoxville.

Enhanced by Camille Williford, Joey Lemon, and Lauren Proctor, COSC 493, Fall 2021, University of Tennessee, Knoxville.

## Overview

This tool is used to convert nondeterministic finite automata (NFA) to deterministic finite automata (DFA) through an interactive and visual interface. More specifically, you can:
- Create an NFA interactively or from a saved JSON input form
- Convert the NFA to an equivalent DFA in three possible ways:
    - **Step-by-step**: where the addition of a transition to the DFA is one step
    - **All at once**: go from NFA to DFA in one click
    - **Incrementally**: at one second intervals, with the option to pause the conversion

### Technology

- Angular.js: an MVC structure to sync the visualization with the conversion in the background
- D3.js: the basis for the NFA and DFA visualization
