/*-----------------------------------------------------------------------------
| Copyright (c) 2014, Nucleic Development Team.
|
| Distributed under the terms of the Modified BSD License.
|
| The full license is in the file COPYING.txt, distributed with this software.
|----------------------------------------------------------------------------*/

// <reference path="expression.ts">
// <reference path="strength.ts">

/**
 * Kiwi is an efficient implementation of the Cassowary constraint solving
 * algorithm, based on the seminal Cassowary paper.
 * It is *not* a refactoring or port of the original C++ solver, but
 * has been designed from the ground up to be lightweight and fast.
 *
 * **Example**
 * ```javascript
 * var kiwi = require('kiwi');
 *
 * // Create a solver
 * var solver = new kiwi.Solver();
 *
 * // Create and add some editable variables
 * var left = new kiwi.Variable();
 * var width = new kiwi.Variable();
 * solver.addEditVariable(left, kiwi.Strength.strong);
 * solver.addEditVariable(width, kiwi.Strength.strong);
 *
 * // Create a variable calculated through a constraint
 * var centerX = new kiwi.Variable();
 * var expr = new kiwi.Expression([-1, centerX], left, [0.5, width]);
 * solver.addConstraint(new kiwi.Constraint(expr, kiwi.Operator.Eq, kiwi.Strength.required));
 *
 * // Suggest some values to the solver
 * solver.suggestValue(left, 0);
 * solver.suggestValue(width, 500);
 *
 * // Lets solve the problem!
 * solver.updateVariables();
 * assert(centerX.value(), 250);
 * ```
 *
 * ##API Documentation
 * @module kiwi
 */
module kiwi
{
    /**
     * An enum defining the linear constraint operators.
     *
     * |Value|Operator|Description|
     * |----|-----|-----|
     * |`Le`|<=|Less than equal|
     * |`Ge`|>=|Greater than equal|
     * |`Eq`|==|Equal|
     *
     * @enum {Number}
     */
    export
    enum Operator
    {
        Le,  // <=
        Ge,  // >=
        Eq   // ==
    }


    /**
     * A linear constraint equation.
     *
     * A constraint equation is composed of an expression, an operator,
     * and a strength. The RHS of the equation is implicitly zero.
     *
     * @class
     * @param {Expression} expression The constraint expression (LHS).
     * @param {Operator} operator The equation operator.
     * @param {Expression} [rhs] Right hand side of the expression.
     * @param {Number} [strength=Strength.required] The strength of the constraint.
     */
    export
    class Constraint
    {
        constructor(
            expression: Expression|Variable,
            operator: Operator,
            rhs: Expression|Variable|number,
            strength: number = Strength.required) {
            this._operator = operator;
            this._strength = Strength.clip(strength);
            if ((rhs === undefined) && (expression instanceof Expression)) {
                this._expression = expression;
            }
            else {
                this._expression = expression.minus(rhs);
            }
        }

       /**
         * A static constraint comparison function.
         * @private
         */
        static Compare( a: Constraint, b: Constraint ): number
        {
            return a.id() - b.id();
        }
 
        /**
         * Returns the unique id number of the constraint.
         * @private
         */
        id(): number
        {
            return this._id;
        }

        /**
         * Returns the expression of the constraint.
         *
         * @return {Expression} expression
         */
        expression(): Expression
        {
            return this._expression;
        }

        /**
         * Returns the relational operator of the constraint.
         *
         * @return {Operator} linear constraint operator
         */
        op(): Operator
        {
            return this._operator;
        }

        /**
         * Returns the strength of the constraint.
         *
         * @return {Number} strength
         */
        strength(): number
        {
            return this._strength;
        }

        private _expression: Expression;
        private _operator: Operator;
        private _strength: number;
        private _id: number = CnId++;
    }


    /**
     * The internal constraint id counter.
     * @private
     */
    var CnId = 0;

}
