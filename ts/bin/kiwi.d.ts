/// <reference path="../thirdparty/tsu.d.ts" />
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
declare module kiwi {
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
    enum Operator {
        Le = 0,
        Ge = 1,
        Eq = 2,
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
    class Constraint {
        constructor(expression: Expression | Variable, operator: Operator, rhs: Expression | Variable | number, strength?: number);
        /**
          * A static constraint comparison function.
          * @private
          */
        static Compare(a: Constraint, b: Constraint): number;
        /**
         * Returns the unique id number of the constraint.
         * @private
         */
        id(): number;
        /**
         * Returns the expression of the constraint.
         *
         * @return {Expression} expression
         */
        expression(): Expression;
        /**
         * Returns the relational operator of the constraint.
         *
         * @return {Operator} linear constraint operator
         */
        op(): Operator;
        /**
         * Returns the strength of the constraint.
         *
         * @return {Number} strength
         */
        strength(): number;
        private _expression;
        private _operator;
        private _strength;
        private _id;
    }
}
declare module kiwi {
    interface IMap<T, U> extends tsu.AssociativeArray<T, U> {
    }
    function createMap<T, U>(compare: tsu.ICompare<T, T>): IMap<T, U>;
}
declare module kiwi {
    /**
     * The primary user constraint variable.
     *
     * @class
     * @param {String} [name=""] The name to associated with the variable.
     */
    class Variable {
        constructor(name?: string);
        /**
         * A static variable comparison function.
         * @private
         */
        static Compare(a: Variable, b: Variable): number;
        /**
         * Returns the unique id number of the variable.
         * @private
         */
        id(): number;
        /**
         * Returns the name of the variable.
         *
         * @return {String} name of the variable
         */
        name(): string;
        /**
         * Set the name of the variable.
         *
         * @param {String} name Name of the variable
         */
        setName(name: string): void;
        /**
         * Returns the user context object of the variable.
         * @private
         */
        context(): any;
        /**
         * Set the user context object of the variable.
         * @private
         */
        setContext(context: any): void;
        /**
         * Returns the value of the variable.
         *
         * @return {Number} Calculated value
         */
        value(): number;
        /**
         * Set the value of the variable.
         * @private
         */
        setValue(value: number): void;
        /**
         * Creates a new Expression by adding a number, variable or expression
         * to the variable.
         *
         * @param {Number|Variable|Expression} value Value to add.
         * @return {Expression} expression
         */
        plus(value: number | Variable | Expression): Expression;
        /**
         * Creates a new Expression by substracting a number, variable or expression
         * from the variable.
         *
         * @param {Number|Variable|Expression} value Value to substract.
         * @return {Expression} expression
         */
        minus(value: number | Variable | Expression): Expression;
        /**
         * Creates a new Expression by multiplying with a fixed number.
         *
         * @param {Number} coefficient Coefficient to multiply with.
         * @return {Expression} expression
         */
        multiply(coefficient: number): Expression;
        /**
         * Creates a new Expression by dividing with a fixed number.
         *
         * @param {Number} coefficient Coefficient to divide by.
         * @return {Expression} expression
         */
        divide(coefficient: number): Expression;
        /**
         * Returns the JSON representation of the variable.
         * @private
         */
        toJSON(): any;
        private _name;
        private _value;
        private _context;
        private _id;
    }
}
declare module kiwi {
    /**
     * An expression of variable terms and a constant.
     *
     * The constructor accepts an arbitrary number of parameters,
     * each of which must be one of the following types:
     *  - number
     *  - Variable
     *  - Expression
     *  - 2-tuple of [number, Variable|Expression]
     *
     * The parameters are summed. The tuples are multiplied.
     *
     * @class
     * @param {...(number|Variable|Expression|Array)} args
     */
    class Expression {
        constructor(...args: any[]);
        /**
         * Returns the mapping of terms in the expression.
         *
         * This *must* be treated as const.
         * @private
         */
        terms(): IMap<Variable, number>;
        /**
         * Returns the constant of the expression.
         * @private
         */
        constant(): number;
        /**
         * Returns the computed value of the expression.
         *
         * @private
         * @return {Number} computed value of the expression
         */
        value(): number;
        /**
         * Creates a new Expression by adding a number, variable or expression
         * to the expression.
         *
         * @param {Number|Variable|Expression} value Value to add.
         * @return {Expression} expression
         */
        plus(value: number | Variable | Expression): Expression;
        /**
         * Creates a new Expression by substracting a number, variable or expression
         * from the expression.
         *
         * @param {Number|Variable|Expression} value Value to substract.
         * @return {Expression} expression
         */
        minus(value: number | Variable | Expression): Expression;
        /**
         * Creates a new Expression by multiplying with a fixed number.
         *
         * @param {Number} coefficient Coefficient to multiply with.
         * @return {Expression} expression
         */
        multiply(coefficient: number): Expression;
        /**
         * Creates a new Expression by dividing with a fixed number.
         *
         * @param {Number} coefficient Coefficient to divide by.
         * @return {Expression} expression
         */
        divide(coefficient: number): Expression;
        private _terms;
        private _constant;
    }
}
declare module kiwi {
    /**
     * @class Strength
     */
    module Strength {
        /**
         * Create a new symbolic strength.
         *
         * @param {Number} a strong
         * @param {Number} b medium
         * @param {Number} c weak
         * @param {Number} [w] weight
         * @return {Number} strength
         */
        function create(a: number, b: number, c: number, w?: number): number;
        /**
         * The 'required' symbolic strength.
         */
        var required: number;
        /**
         * The 'strong' symbolic strength.
         */
        var strong: number;
        /**
         * The 'medium' symbolic strength.
         */
        var medium: number;
        /**
         * The 'weak' symbolic strength.
         */
        var weak: number;
        /**
         * Clip a symbolic strength to the allowed min and max.
         * @private
         */
        function clip(value: number): number;
    }
}
declare module kiwi {
    /**
     * The constraint solver class.
     *
     * @class
     */
    class Solver {
        /**
         * Construct a new Solver.
         */
        constructor();
        /**
         * Creates and add a constraint to the solver.
         *
         * @param {Expression|Variable} lhs Left hand side of the expression
         * @param {Operator} operator Operator
         * @param {Expression|Variable|Number} rhs Right hand side of the expression
         * @param {Number} [strength=Strength.required] Strength
         */
        createConstraint(lhs: Expression | Variable, operator: Operator, rhs: Expression | Variable | number, strength?: number): Constraint;
        /**
         * Add a constraint to the solver.
         *
         * @param {Constraint} constraint Constraint to add to the solver
         */
        addConstraint(constraint: Constraint): void;
        /**
         * Remove a constraint from the solver.
         *
         * @param {Constraint} constraint Constraint to remove from the solver
         */
        removeConstraint(constraint: Constraint): void;
        /**
         * Test whether the solver contains the constraint.
         *
         * @param {Constraint} constraint Constraint to test for
         * @return {Bool} true or false
         */
        hasConstraint(constraint: Constraint): boolean;
        /**
         * Add an edit variable to the solver.
         *
         * @param {Variable} variable Edit variable to add to the solver
         * @param {Number} strength Strength, should be less than `Strength.required`
         */
        addEditVariable(variable: Variable, strength: number): void;
        /**
         * Remove an edit variable from the solver.
         *
         * @param {Variable} variable Edit variable to remove from the solver
         */
        removeEditVariable(variable: Variable): void;
        /**
         * Test whether the solver contains the edit variable.
         *
         * @param {Variable} variable Edit variable to test for
         * @return {Bool} true or false
         */
        hasEditVariable(variable: Variable): boolean;
        /**
         * Suggest the value of an edit variable.
         *
         * @param {Variable} variable Edit variable to suggest a value for
         * @param {Number} value Suggested value
         */
        suggestValue(variable: Variable, value: number): void;
        /**
         * Update the values of the variables.
         */
        updateVariables(): void;
        /**
         * Get the symbol for the given variable.
         *
         * If a symbol does not exist for the variable, one will be created.
         * @private
         */
        private _getVarSymbol(variable);
        /**
         * Create a new Row object for the given constraint.
         *
         * The terms in the constraint will be converted to cells in the row.
         * Any term in the constraint with a coefficient of zero is ignored.
         * This method uses the `_getVarSymbol` method to get the symbol for
         * the variables added to the row. If the symbol for a given cell
         * variable is basic, the cell variable will be substituted with the
         * basic row.
         *
         * The necessary slack and error variables will be added to the row.
         * If the constant for the row is negative, the sign for the row
         * will be inverted so the constant becomes positive.
         *
         * Returns the created Row and the tag for tracking the constraint.
         * @private
         */
        private _createRow(constraint);
        /**
         * Choose the subject for solving for the row.
         *
         * This method will choose the best subject for using as the solve
         * target for the row. An invalid symbol will be returned if there
         * is no valid target.
         *
         * The symbols are chosen according to the following precedence:
         *
         * 1) The first symbol representing an external variable.
         * 2) A negative slack or error tag variable.
         *
         * If a subject cannot be found, an invalid symbol will be returned.
         *
         * @private
         */
        private _chooseSubject(row, tag);
        /**
         * Add the row to the tableau using an artificial variable.
         *
         * This will return false if the constraint cannot be satisfied.
         *
         * @private
         */
        private _addWithArtificialVariable(row);
        /**
         * Substitute the parametric symbol with the given row.
         *
         * This method will substitute all instances of the parametric symbol
         * in the tableau and the objective function with the given row.
         *
         * @private
         */
        private _substitute(symbol, row);
        /**
         * Optimize the system for the given objective function.
         *
         * This method performs iterations of Phase 2 of the simplex method
         * until the objective function reaches a minimum.
         *
         * @private
         */
        private _optimize(objective);
        /**
         * Optimize the system using the dual of the simplex method.
         *
         * The current state of the system should be such that the objective
         * function is optimal, but not feasible. This method will perform
         * an iteration of the dual simplex method to make the solution both
         * optimal and feasible.
         *
         * @private
         */
        private _dualOptimize();
        /**
         * Compute the entering variable for a pivot operation.
         *
         * This method will return first symbol in the objective function which
         * is non-dummy and has a coefficient less than zero. If no symbol meets
         * the criteria, it means the objective function is at a minimum, and an
         * invalid symbol is returned.
         *
         * @private
         */
        private _getEnteringSymbol(objective);
        /**
         * Compute the entering symbol for the dual optimize operation.
         *
         * This method will return the symbol in the row which has a positive
         * coefficient and yields the minimum ratio for its respective symbol
         * in the objective function. The provided row *must* be infeasible.
         * If no symbol is found which meats the criteria, an invalid symbol
         * is returned.
         *
         * @private
         */
        private _getDualEnteringSymbol(row);
        /**
         * Compute the symbol for pivot exit row.
         *
         * This method will return the symbol for the exit row in the row
         * map. If no appropriate exit symbol is found, an invalid symbol
         * will be returned. This indicates that the objective function is
         * unbounded.
         *
         * @private
         */
        private _getLeavingSymbol(entering);
        /**
         * Compute the leaving symbol for a marker variable.
         *
         * This method will return a symbol corresponding to a basic row
         * which holds the given marker variable. The row will be chosen
         * according to the following precedence:
         *
         * 1) The row with a restricted basic varible and a negative coefficient
         *    for the marker with the smallest ratio of -constant / coefficient.
         *
         * 2) The row with a restricted basic variable and the smallest ratio
         *    of constant / coefficient.
         *
         * 3) The last unrestricted row which contains the marker.
         *
         * If the marker does not exist in any row, an invalid symbol will be
         * returned. This indicates an internal solver error since the marker
         * *should* exist somewhere in the tableau.
         *
         * @private
         */
        private _getMarkerLeavingSymbol(marker);
        /**
         * Remove the effects of a constraint on the objective function.
         *
         * @private
         */
        private _removeConstraintEffects(cn, tag);
        /**
         * Remove the effects of an error marker on the objective function.
         *
         * @private
         */
        private _removeMarkerEffects(marker, strength);
        /**
         * Get the first Slack or Error symbol in the row.
         *
         * If no such symbol is present, an invalid symbol will be returned.
         *
         * @private
         */
        private _anyPivotableSymbol(row);
        /**
         * Returns a new Symbol of the given type.
         *
         * @private
         */
        private _makeSymbol(type);
        private _cnMap;
        private _rowMap;
        private _varMap;
        private _editMap;
        private _infeasibleRows;
        private _objective;
        private _artificial;
        private _idTick;
    }
}
declare module kiwi {
}
