# Visual NFA to DFA Converter
![Lint and Test](https://github.com/joeylemon/nfa-to-dfa/workflows/Lint%20and%20Test/badge.svg)

https://joeylemon.github.io/nfa-to-dfa/

_Originally created by Alex Klibisz and Connor Minton, COSC 312, Spring 2015, University of Tennessee, Knoxville._

_Rewritten and enhanced by Camille Williford, Joey Lemon, and Lauren Proctor, COSC 493, Fall 2021, University of Tennessee, Knoxville._

## Overview

<img alt="Screenshot of the main application interface" src="https://user-images.githubusercontent.com/8845512/125208072-67ba5500-e25e-11eb-8b6e-c798ece6caf1.png">

This tool is used to convert [non-deterministic finite automata](https://en.wikipedia.org/wiki/Nondeterministic_finite_automaton) (NFA) to [deterministic finite automata](https://en.wikipedia.org/wiki/Deterministic_finite_automaton) (DFA) through an interactive and visual interface. More specifically, you can:
- Create an NFA interactively or from a saved JSON file
- Export an NFA to a JSON file
- View the description of both the NFA and the DFA, including a full delta transition table
- Convert the NFA to an equivalent DFA in three possible ways:
    - **Step-by-step**: the DFA is constructed in controlled increments
    - **All at once**: completely convert the NFA to the DFA in one leap
    - **Animated**: watch the conversion process take place automatically

### Technology

![image](https://user-images.githubusercontent.com/8845512/121960347-f907db80-cd33-11eb-9ec1-f249496ae452.png)

## Getting Started

### Prerequisites

You must have [Node.js v12.19.0+ and npm](https://nodejs.org/en/) installed to run the application locally. Node versions below v12.19.0 are unable to run the unit tests.

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

Running this script should give an output similar to below:
```shell
> nfa-to-dfa@0.0.2 start ~/Desktop/nfa-to-dfa
> browser-sync start -s -f . --no-notify --host localhost --port 8000

[Browsersync] Access URLs:
 --------------------------------------
       Local: http://localhost:8000
    External: http://192.168.1.127:8000
 --------------------------------------
          UI: http://localhost:3001
 UI External: http://localhost:3001
 --------------------------------------
[Browsersync] Serving files from: ./
[Browsersync] Watching files...
```

You can now navigate to `http://localhost:8000` in the browser to view the application. The website will automatically reload upon changes to the code.

## Contributing

### Linting
Prior to adding changes to the repository, you should run the linter on the code to ensure there are no syntax errors and to maintain a uniform coding style:
```shell
> npm run lint
```

To automatically lint files before committing them, you should add a pre-commit hook. Copy the `pre-commit.sample` file to `.git/hooks/pre-commit`:
```shell
> cp pre-commit.sample .git/hooks/pre-commit
```

Now, git will automatically lint all changed files before committing them to the repository.

### Testing
You should also test your changes before committing them to the repository:
```shell
> npm test
```

This will run all unit tests in the `src/js/test` directory and report any errors.
