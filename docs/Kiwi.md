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


* [kiwi](#module_kiwi)
  * [~Constraint](#module_kiwi..Constraint)
    * [new Constraint(expression, operator, [rhs], [strength])](#new_module_kiwi..Constraint_new)
    * [.expression()](#module_kiwi..Constraint+expression) ⇒ <code>Expression</code>
    * [.op()](#module_kiwi..Constraint+op) ⇒ <code>Operator</code>
    * [.strength()](#module_kiwi..Constraint+strength) ⇒ <code>Number</code>
  * [~Variable](#module_kiwi..Variable)
    * [new Variable([name])](#new_module_kiwi..Variable_new)
    * [.name()](#module_kiwi..Variable+name) ⇒ <code>String</code>
    * [.setName(name)](#module_kiwi..Variable+setName)
    * [.value()](#module_kiwi..Variable+value) ⇒ <code>Number</code>
    * [.plus(value)](#module_kiwi..Variable+plus) ⇒ <code>Expression</code>
    * [.minus(value)](#module_kiwi..Variable+minus) ⇒ <code>Expression</code>
    * [.multiply(coefficient)](#module_kiwi..Variable+multiply) ⇒ <code>Expression</code>
    * [.divide(coefficient)](#module_kiwi..Variable+divide) ⇒ <code>Expression</code>
  * [~Expression](#module_kiwi..Expression)
    * [new Expression(...args)](#new_module_kiwi..Expression_new)
    * [.plus(value)](#module_kiwi..Expression+plus) ⇒ <code>Expression</code>
    * [.minus(value)](#module_kiwi..Expression+minus) ⇒ <code>Expression</code>
    * [.multiply(coefficient)](#module_kiwi..Expression+multiply) ⇒ <code>Expression</code>
    * [.divide(coefficient)](#module_kiwi..Expression+divide) ⇒ <code>Expression</code>
  * [~Strength](#module_kiwi..Strength)
    * [.required](#module_kiwi..Strength.required)
    * [.strong](#module_kiwi..Strength.strong)
    * [.medium](#module_kiwi..Strength.medium)
    * [.weak](#module_kiwi..Strength.weak)
    * [.create(a, b, c, [w])](#module_kiwi..Strength.create) ⇒ <code>Number</code>
  * [~Solver](#module_kiwi..Solver)
    * [new Solver()](#new_module_kiwi..Solver_new)
    * [.createConstraint(lhs, operator, rhs, [strength])](#module_kiwi..Solver+createConstraint)
    * [.addConstraint(constraint)](#module_kiwi..Solver+addConstraint)
    * [.removeConstraint(constraint)](#module_kiwi..Solver+removeConstraint)
    * [.hasConstraint(constraint)](#module_kiwi..Solver+hasConstraint) ⇒ <code>Bool</code>
    * [.addEditVariable(variable, strength)](#module_kiwi..Solver+addEditVariable)
    * [.removeEditVariable(variable)](#module_kiwi..Solver+removeEditVariable)
    * [.hasEditVariable(variable)](#module_kiwi..Solver+hasEditVariable) ⇒ <code>Bool</code>
    * [.suggestValue(variable, value)](#module_kiwi..Solver+suggestValue)
    * [.updateVariables()](#module_kiwi..Solver+updateVariables)
  * [~Operator](#module_kiwi..Operator) : <code>enum</code>

<a name="module_kiwi..Constraint"></a>
### kiwi~Constraint
**Kind**: inner class of <code>[kiwi](#module_kiwi)</code>  

* [~Constraint](#module_kiwi..Constraint)
  * [new Constraint(expression, operator, [rhs], [strength])](#new_module_kiwi..Constraint_new)
  * [.expression()](#module_kiwi..Constraint+expression) ⇒ <code>Expression</code>
  * [.op()](#module_kiwi..Constraint+op) ⇒ <code>Operator</code>
  * [.strength()](#module_kiwi..Constraint+strength) ⇒ <code>Number</code>

<a name="new_module_kiwi..Constraint_new"></a>
#### new Constraint(expression, operator, [rhs], [strength])
A linear constraint equation.

A constraint equation is composed of an expression, an operator,
and a strength. The RHS of the equation is implicitly zero.


| Param | Type | Default | Description |
| --- | --- | --- | --- |
| expression | <code>Expression</code> |  | The constraint expression (LHS). |
| operator | <code>Operator</code> |  | The equation operator. |
| [rhs] | <code>Expression</code> |  | Right hand side of the expression. |
| [strength] | <code>Number</code> | <code>Strength.required</code> | The strength of the constraint. |

<a name="module_kiwi..Constraint+expression"></a>
#### constraint.expression() ⇒ <code>Expression</code>
Returns the expression of the constraint.

**Kind**: instance method of <code>[Constraint](#module_kiwi..Constraint)</code>  
**Returns**: <code>Expression</code> - expression  
<a name="module_kiwi..Constraint+op"></a>
#### constraint.op() ⇒ <code>Operator</code>
Returns the relational operator of the constraint.

**Kind**: instance method of <code>[Constraint](#module_kiwi..Constraint)</code>  
**Returns**: <code>Operator</code> - linear constraint operator  
<a name="module_kiwi..Constraint+strength"></a>
#### constraint.strength() ⇒ <code>Number</code>
Returns the strength of the constraint.

**Kind**: instance method of <code>[Constraint](#module_kiwi..Constraint)</code>  
**Returns**: <code>Number</code> - strength  
<a name="module_kiwi..Variable"></a>
### kiwi~Variable
**Kind**: inner class of <code>[kiwi](#module_kiwi)</code>  

* [~Variable](#module_kiwi..Variable)
  * [new Variable([name])](#new_module_kiwi..Variable_new)
  * [.name()](#module_kiwi..Variable+name) ⇒ <code>String</code>
  * [.setName(name)](#module_kiwi..Variable+setName)
  * [.value()](#module_kiwi..Variable+value) ⇒ <code>Number</code>
  * [.plus(value)](#module_kiwi..Variable+plus) ⇒ <code>Expression</code>
  * [.minus(value)](#module_kiwi..Variable+minus) ⇒ <code>Expression</code>
  * [.multiply(coefficient)](#module_kiwi..Variable+multiply) ⇒ <code>Expression</code>
  * [.divide(coefficient)](#module_kiwi..Variable+divide) ⇒ <code>Expression</code>

<a name="new_module_kiwi..Variable_new"></a>
#### new Variable([name])
The primary user constraint variable.


| Param | Type | Default | Description |
| --- | --- | --- | --- |
| [name] | <code>String</code> | <code>&quot;&quot;</code> | The name to associated with the variable. |

<a name="module_kiwi..Variable+name"></a>
#### variable.name() ⇒ <code>String</code>
Returns the name of the variable.

**Kind**: instance method of <code>[Variable](#module_kiwi..Variable)</code>  
**Returns**: <code>String</code> - name of the variable  
<a name="module_kiwi..Variable+setName"></a>
#### variable.setName(name)
Set the name of the variable.

**Kind**: instance method of <code>[Variable](#module_kiwi..Variable)</code>  

| Param | Type | Description |
| --- | --- | --- |
| name | <code>String</code> | Name of the variable |

<a name="module_kiwi..Variable+value"></a>
#### variable.value() ⇒ <code>Number</code>
Returns the value of the variable.

**Kind**: instance method of <code>[Variable](#module_kiwi..Variable)</code>  
**Returns**: <code>Number</code> - Calculated value  
<a name="module_kiwi..Variable+plus"></a>
#### variable.plus(value) ⇒ <code>Expression</code>
Creates a new Expression by adding a number, variable or expression
to the variable.

**Kind**: instance method of <code>[Variable](#module_kiwi..Variable)</code>  
**Returns**: <code>Expression</code> - expression  

| Param | Type | Description |
| --- | --- | --- |
| value | <code>Number</code> &#124; <code>Variable</code> &#124; <code>Expression</code> | Value to add. |

<a name="module_kiwi..Variable+minus"></a>
#### variable.minus(value) ⇒ <code>Expression</code>
Creates a new Expression by substracting a number, variable or expression
from the variable.

**Kind**: instance method of <code>[Variable](#module_kiwi..Variable)</code>  
**Returns**: <code>Expression</code> - expression  

| Param | Type | Description |
| --- | --- | --- |
| value | <code>Number</code> &#124; <code>Variable</code> &#124; <code>Expression</code> | Value to substract. |

<a name="module_kiwi..Variable+multiply"></a>
#### variable.multiply(coefficient) ⇒ <code>Expression</code>
Creates a new Expression by multiplying with a fixed number.

**Kind**: instance method of <code>[Variable](#module_kiwi..Variable)</code>  
**Returns**: <code>Expression</code> - expression  

| Param | Type | Description |
| --- | --- | --- |
| coefficient | <code>Number</code> | Coefficient to multiply with. |

<a name="module_kiwi..Variable+divide"></a>
#### variable.divide(coefficient) ⇒ <code>Expression</code>
Creates a new Expression by dividing with a fixed number.

**Kind**: instance method of <code>[Variable](#module_kiwi..Variable)</code>  
**Returns**: <code>Expression</code> - expression  

| Param | Type | Description |
| --- | --- | --- |
| coefficient | <code>Number</code> | Coefficient to divide by. |

<a name="module_kiwi..Expression"></a>
### kiwi~Expression
**Kind**: inner class of <code>[kiwi](#module_kiwi)</code>  

* [~Expression](#module_kiwi..Expression)
  * [new Expression(...args)](#new_module_kiwi..Expression_new)
  * [.plus(value)](#module_kiwi..Expression+plus) ⇒ <code>Expression</code>
  * [.minus(value)](#module_kiwi..Expression+minus) ⇒ <code>Expression</code>
  * [.multiply(coefficient)](#module_kiwi..Expression+multiply) ⇒ <code>Expression</code>
  * [.divide(coefficient)](#module_kiwi..Expression+divide) ⇒ <code>Expression</code>

<a name="new_module_kiwi..Expression_new"></a>
#### new Expression(...args)
An expression of variable terms and a constant.

The constructor accepts an arbitrary number of parameters,
each of which must be one of the following types:
 - number
 - Variable
 - Expression
 - 2-tuple of [number, Variable|Expression]

The parameters are summed. The tuples are multiplied.


| Param | Type |
| --- | --- |
| ...args | <code>number</code> &#124; <code>Variable</code> &#124; <code>Expression</code> &#124; <code>Array</code> | 

<a name="module_kiwi..Expression+plus"></a>
#### expression.plus(value) ⇒ <code>Expression</code>
Creates a new Expression by adding a number, variable or expression
to the expression.

**Kind**: instance method of <code>[Expression](#module_kiwi..Expression)</code>  
**Returns**: <code>Expression</code> - expression  

| Param | Type | Description |
| --- | --- | --- |
| value | <code>Number</code> &#124; <code>Variable</code> &#124; <code>Expression</code> | Value to add. |

<a name="module_kiwi..Expression+minus"></a>
#### expression.minus(value) ⇒ <code>Expression</code>
Creates a new Expression by substracting a number, variable or expression
from the expression.

**Kind**: instance method of <code>[Expression](#module_kiwi..Expression)</code>  
**Returns**: <code>Expression</code> - expression  

| Param | Type | Description |
| --- | --- | --- |
| value | <code>Number</code> &#124; <code>Variable</code> &#124; <code>Expression</code> | Value to substract. |

<a name="module_kiwi..Expression+multiply"></a>
#### expression.multiply(coefficient) ⇒ <code>Expression</code>
Creates a new Expression by multiplying with a fixed number.

**Kind**: instance method of <code>[Expression](#module_kiwi..Expression)</code>  
**Returns**: <code>Expression</code> - expression  

| Param | Type | Description |
| --- | --- | --- |
| coefficient | <code>Number</code> | Coefficient to multiply with. |

<a name="module_kiwi..Expression+divide"></a>
#### expression.divide(coefficient) ⇒ <code>Expression</code>
Creates a new Expression by dividing with a fixed number.

**Kind**: instance method of <code>[Expression](#module_kiwi..Expression)</code>  
**Returns**: <code>Expression</code> - expression  

| Param | Type | Description |
| --- | --- | --- |
| coefficient | <code>Number</code> | Coefficient to divide by. |

<a name="module_kiwi..Strength"></a>
### kiwi~Strength
**Kind**: inner class of <code>[kiwi](#module_kiwi)</code>  

* [~Strength](#module_kiwi..Strength)
  * [.required](#module_kiwi..Strength.required)
  * [.strong](#module_kiwi..Strength.strong)
  * [.medium](#module_kiwi..Strength.medium)
  * [.weak](#module_kiwi..Strength.weak)
  * [.create(a, b, c, [w])](#module_kiwi..Strength.create) ⇒ <code>Number</code>

<a name="module_kiwi..Strength.required"></a>
#### Strength.required
The 'required' symbolic strength.

**Kind**: static property of <code>[Strength](#module_kiwi..Strength)</code>  
<a name="module_kiwi..Strength.strong"></a>
#### Strength.strong
The 'strong' symbolic strength.

**Kind**: static property of <code>[Strength](#module_kiwi..Strength)</code>  
<a name="module_kiwi..Strength.medium"></a>
#### Strength.medium
The 'medium' symbolic strength.

**Kind**: static property of <code>[Strength](#module_kiwi..Strength)</code>  
<a name="module_kiwi..Strength.weak"></a>
#### Strength.weak
The 'weak' symbolic strength.

**Kind**: static property of <code>[Strength](#module_kiwi..Strength)</code>  
<a name="module_kiwi..Strength.create"></a>
#### Strength.create(a, b, c, [w]) ⇒ <code>Number</code>
Create a new symbolic strength.

**Kind**: static method of <code>[Strength](#module_kiwi..Strength)</code>  
**Returns**: <code>Number</code> - strength  

| Param | Type | Description |
| --- | --- | --- |
| a | <code>Number</code> | strong |
| b | <code>Number</code> | medium |
| c | <code>Number</code> | weak |
| [w] | <code>Number</code> | weight |

<a name="module_kiwi..Solver"></a>
### kiwi~Solver
**Kind**: inner class of <code>[kiwi](#module_kiwi)</code>  

* [~Solver](#module_kiwi..Solver)
  * [new Solver()](#new_module_kiwi..Solver_new)
  * [.createConstraint(lhs, operator, rhs, [strength])](#module_kiwi..Solver+createConstraint)
  * [.addConstraint(constraint)](#module_kiwi..Solver+addConstraint)
  * [.removeConstraint(constraint)](#module_kiwi..Solver+removeConstraint)
  * [.hasConstraint(constraint)](#module_kiwi..Solver+hasConstraint) ⇒ <code>Bool</code>
  * [.addEditVariable(variable, strength)](#module_kiwi..Solver+addEditVariable)
  * [.removeEditVariable(variable)](#module_kiwi..Solver+removeEditVariable)
  * [.hasEditVariable(variable)](#module_kiwi..Solver+hasEditVariable) ⇒ <code>Bool</code>
  * [.suggestValue(variable, value)](#module_kiwi..Solver+suggestValue)
  * [.updateVariables()](#module_kiwi..Solver+updateVariables)

<a name="new_module_kiwi..Solver_new"></a>
#### new Solver()
The constraint solver class.

<a name="module_kiwi..Solver+createConstraint"></a>
#### solver.createConstraint(lhs, operator, rhs, [strength])
Creates and add a constraint to the solver.

**Kind**: instance method of <code>[Solver](#module_kiwi..Solver)</code>  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| lhs | <code>Expression</code> &#124; <code>Variable</code> |  | Left hand side of the expression |
| operator | <code>Operator</code> |  | Operator |
| rhs | <code>Expression</code> &#124; <code>Variable</code> &#124; <code>Number</code> |  | Right hand side of the expression |
| [strength] | <code>Number</code> | <code>Strength.required</code> | Strength |

<a name="module_kiwi..Solver+addConstraint"></a>
#### solver.addConstraint(constraint)
Add a constraint to the solver.

**Kind**: instance method of <code>[Solver](#module_kiwi..Solver)</code>  

| Param | Type | Description |
| --- | --- | --- |
| constraint | <code>Constraint</code> | Constraint to add to the solver |

<a name="module_kiwi..Solver+removeConstraint"></a>
#### solver.removeConstraint(constraint)
Remove a constraint from the solver.

**Kind**: instance method of <code>[Solver](#module_kiwi..Solver)</code>  

| Param | Type | Description |
| --- | --- | --- |
| constraint | <code>Constraint</code> | Constraint to remove from the solver |

<a name="module_kiwi..Solver+hasConstraint"></a>
#### solver.hasConstraint(constraint) ⇒ <code>Bool</code>
Test whether the solver contains the constraint.

**Kind**: instance method of <code>[Solver](#module_kiwi..Solver)</code>  
**Returns**: <code>Bool</code> - true or false  

| Param | Type | Description |
| --- | --- | --- |
| constraint | <code>Constraint</code> | Constraint to test for |

<a name="module_kiwi..Solver+addEditVariable"></a>
#### solver.addEditVariable(variable, strength)
Add an edit variable to the solver.

**Kind**: instance method of <code>[Solver](#module_kiwi..Solver)</code>  

| Param | Type | Description |
| --- | --- | --- |
| variable | <code>Variable</code> | Edit variable to add to the solver |
| strength | <code>Number</code> | Strength, should be less than `Strength.required` |

<a name="module_kiwi..Solver+removeEditVariable"></a>
#### solver.removeEditVariable(variable)
Remove an edit variable from the solver.

**Kind**: instance method of <code>[Solver](#module_kiwi..Solver)</code>  

| Param | Type | Description |
| --- | --- | --- |
| variable | <code>Variable</code> | Edit variable to remove from the solver |

<a name="module_kiwi..Solver+hasEditVariable"></a>
#### solver.hasEditVariable(variable) ⇒ <code>Bool</code>
Test whether the solver contains the edit variable.

**Kind**: instance method of <code>[Solver](#module_kiwi..Solver)</code>  
**Returns**: <code>Bool</code> - true or false  

| Param | Type | Description |
| --- | --- | --- |
| variable | <code>Variable</code> | Edit variable to test for |

<a name="module_kiwi..Solver+suggestValue"></a>
#### solver.suggestValue(variable, value)
Suggest the value of an edit variable.

**Kind**: instance method of <code>[Solver](#module_kiwi..Solver)</code>  

| Param | Type | Description |
| --- | --- | --- |
| variable | <code>Variable</code> | Edit variable to suggest a value for |
| value | <code>Number</code> | Suggested value |

<a name="module_kiwi..Solver+updateVariables"></a>
#### solver.updateVariables()
Update the values of the variables.

**Kind**: instance method of <code>[Solver](#module_kiwi..Solver)</code>  
<a name="module_kiwi..Operator"></a>
### kiwi~Operator : <code>enum</code>
An enum defining the linear constraint operators.

|Value|Operator|Description|
|----|-----|-----|
|`Le`|<=|Less than equal|
|`Ge`|>=|Greater than equal|
|`Eq`|==|Equal|

**Kind**: inner enum property of <code>[kiwi](#module_kiwi)</code>  