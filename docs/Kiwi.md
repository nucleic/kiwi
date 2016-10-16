<a name="module_kiwi"></a>

## kiwi
Kiwi is an efficient implementation of the Cassowary constraint solving
algorithm, based on the seminal Cassowary paper.
It is *not* a refactoring or port of the original C++ solver, but
has been designed from the ground up to be lightweight and fast.

**Example**
```javascript
var kiwi = require('kiwi');

// Create a solver
var solver = new kiwi.Solver();

// Create and add some editable variables
var left = new kiwi.Variable();
var width = new kiwi.Variable();
solver.addEditVariable(left, kiwi.Strength.strong);
solver.addEditVariable(width, kiwi.Strength.strong);

// Create a variable calculated through a constraint
var centerX = new kiwi.Variable();
var expr = new kiwi.Expression([-1, centerX], left, [0.5, width]);
solver.addConstraint(new kiwi.Constraint(expr, kiwi.Operator.Eq, kiwi.Strength.required));

// Suggest some values to the solver
solver.suggestValue(left, 0);
solver.suggestValue(width, 500);

// Lets solve the problem!
solver.updateVariables();
assert(centerX.value(), 250);
```

##API Documentation

<a name="module_kiwi..Strength"></a>

### kiwi~Strength
**Kind**: inner class of <code>[kiwi](#module_kiwi)</code>  
