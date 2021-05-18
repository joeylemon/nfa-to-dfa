# Visual NFA to DFA Converter
![ESLint](https://github.com/joeylemon/nfa-to-dfa/workflows/ESLint/badge.svg)

https://joeylemon.github.io/nfa-to-dfa/

_Originally created by Alex Klibisz and Connor Minton, COSC 312, Spring 2015, University of Tennessee, Knoxville._

_Enhanced by Camille Williford, Joey Lemon, and Lauren Proctor, COSC 493, Fall 2021, University of Tennessee, Knoxville._

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

## Getting Started

### Prerequisites

You must have [Node.js and npm](https://nodejs.org/en/) installed to run the application locally.

My environment works with Node.js at v12.19.0 and npm at v6.14.8. However, it should work with later versions as well.

### Running Application

To set up the application locally, first clone this repository:
```shell
> git clone https://github.com/joeylemon/nfa-to-dfa.git
```

Then, install the dependencies:
```shell
> cd nfa-to-dfa
> npm install
```

Then, simply run the start script to create a local webserver:
```shell
> npm start
```

This should give an output similar to below:
```shell
> nfa-to-dfa@0.0.2 start ~/Desktop/nfa-to-dfa
> gulp

[15:13:19] Using gulpfile ~/Desktop/nfa-to-dfa/gulpfile.js
[15:13:19] Starting 'default'...
[15:13:19] Starting 'watch'...
[15:13:19] Finished 'watch' after 18 ms
[15:13:19] Starting 'html'...
[15:13:19] Finished 'html' after 5.38 ms
[15:13:19] Starting 'js'...
[15:13:19] Finished 'js' after 1.63 ms
[15:13:19] Starting 'css'...
[15:13:19] Finished 'css' after 1.46 ms
[15:13:19] Starting 'webserver'...
[15:13:19] Webserver started at http://localhost:8000
[15:13:19] Finished 'webserver' after 12 ms
[15:13:19] Finished 'default' after 41 ms

```

You can now navigate to `localhost:8000` in the browser to view the application. The website will automatically reload upon changes to the code.

### Contributing

Prior to adding changes to the repository, you should run the linter on the code to ensure there are no syntax errors and to maintain a uniform coding style:
```shell
> npm run lint
```

To automatically lint files before committing them, you should add a pre-commit hook. Copy the `pre-commit.sample` file to `.git/hooks/pre-commit`:
```shell
> cp pre-commit.sample .git/hooks/pre-commit
```

Now, git will automatically lint all changed files before committing them to the repository.
