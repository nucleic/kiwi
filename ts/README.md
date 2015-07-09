![Logo](logo.png)

[![Build Status](https://travis-ci.org/nucleic/kiwi.svg?branch=master)](https://travis-ci.org/nucleic/kiwi)
[![view on npm](http://img.shields.io/npm/v/kiwi-solver.svg)](https://www.npmjs.org/package/kiwi-solver)

Kiwi is an efficient implementation of the Cassowary constraint solving
algorithm, based on the seminal Cassowary paper.
It is *not* a refactoring or port of the original C++ solver, but
has been designed from the ground up to be lightweight and fast. Kiwi is
about **8x faster** than [Cassowary.js](https://github.com/slightlyoff/cassowary.js).


## Index
- [Getting started](#getting-started)
- [Documentation](#documentation)
- [Benchmark](#benchmark)

## Getting started

Install using NPM or bowser:

	npm install kiwi-solver

	bower install kiwi-solver

Include kiwi in your html and javascript file:

```html
<head>
  <script type="text/javascript" src="node_modules/kiwi-solver/bin/kiwi.js"></script>
</head>
```

```javascript
var kiwi = window.kiwi;
```

Or when using requirejs or a bundler like browserify or webpack, use:

```javascript
var kiwi = require('kiwi-solver');
```

The following example creates a solver which automatically calculates the width:

```javascript
// Create a solver
var solver = new kiwi.Solver();

// Create edit variables
var left = new kiwi.Variable();
var width = new kiwi.Variable();
solver.addEditVariable(left, kiwi.Strength.strong);
solver.addEditVariable(width, kiwi.Strength.strong);
solver.suggestValue(left, 100);
solver.suggestValue(width, 400);

// Create and add a constraint
var right = new kiwi.Variable();
solver.addConstraint(new kiwi.Constraint(new kiwi.Expression([-1, right], left, width), kiwi.Operator.Eq));

// Solve the constraints
solver.updateVariables();
assert(right, 500);
```

## Documentation

- [API Reference](docs/Kiwi.md)


## Benchmarks

To run the benchmark in the browser, [just visit this page](https://rawgit.com/IjzerenHein/kiwi/feature-js/ts/bench/index.html).

To run the benchmark locally using nodejs, *clone or download this repository* and execute the following steps:

	npm install
	grunt bench


## Contribute

If you like this project and want to support it, show some love
and give it a star.
