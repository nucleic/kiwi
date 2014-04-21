/// <reference path="../thirdparty/tsu.d.ts" />
declare module kiwi {
    /**
    * An enum defining the linear constraint operators.
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
    */
    class Constraint {
        /**
        * A static constraint comparison function.
        */
        static Compare(a: Constraint, b: Constraint): number;
        /**
        * Construct a new Constraint.
        *
        * @param expression The constraint expression.
        * @param operator The equation operator.
        * @param strength The strength of the constraint.
        */
        constructor(expression: Expression, operator: Operator, strength?: number);
        /**
        * Returns the unique id number of the constraint.
        */
        public id(): number;
        /**
        * Returns the expression of the constraint.
        */
        public expression(): Expression;
        /**
        * Returns the relational operator of the constraint.
        */
        public op(): Operator;
        /**
        * Returns the strength of the constraint.
        */
        public strength(): number;
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
    */
    class Variable {
        /**
        * A static variable comparison function.
        */
        static Compare(a: Variable, b: Variable): number;
        /**
        * Construct a new Variable
        *
        * @param [name] The name to associated with the variable.
        */
        constructor(name?: string);
        /**
        * Returns the unique id number of the variable.
        */
        public id(): number;
        /**
        * Returns the name of the variable.
        */
        public name(): string;
        /**
        * Set the name of the variable.
        */
        public setName(name: string): void;
        /**
        * Returns the user context object of the variable.
        */
        public context(): any;
        /**
        * Set the user context object of the variable.
        */
        public setContext(context: any): void;
        /**
        * Returns the value of the variable.
        */
        public value(): number;
        /**
        * Set the value of the variable.
        */
        public setValue(value: number): void;
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
    * @class
    */
    class Expression {
        /**
        * Construct a new Expression.
        *
        * The constructor accepts an arbitrary number of parameters,
        * each of which must be one of the following types:
        *  - number
        *  - Variable
        *  - 2-tuple of [number, Variable]
        *
        * The parameters are summed. The tuples are multiplied.
        */
        constructor(...args: any[]);
        /**
        * Returns the mapping of terms in the expression.
        *
        * This *must* be treated as const.
        */
        public terms(): IMap<Variable, number>;
        /**
        * Returns the constant of the expression.
        */
        public constant(): number;
        /**
        * Returns the computed value of the expression.
        */
        public value(): number;
        private _terms;
        private _constant;
    }
}
declare module kiwi {
    /**
    * An enum defining the available symbol types.
    *
    * This enum is an implementation detail. It should not be
    * used directly by user code.
    */
    enum SymbolType {
        Invalid = 0,
        External = 1,
        Slack = 2,
        Error = 3,
        Dummy = 4,
    }
    /**
    * A class representing a symbol in the solver.
    *
    * This class is an implementation detail. It should not be
    * used directly by user code.
    *
    * @class
    */
    class Symbol {
        /**
        * The static Symbol comparison function.
        */
        static Compare(a: Symbol, b: Symbol): number;
        /**
        * Construct a new Symbol
        *
        * @param [type] The type of the symbol.
        * @param [id] The unique id number of the symbol.
        */
        constructor(type: SymbolType, id: number);
        /**
        * Returns the unique id number of the symbol.
        */
        public id(): number;
        /**
        * Returns the type of the symbol.
        */
        public type(): SymbolType;
        private _id;
        private _type;
    }
}
declare module kiwi {
    /**
    * Tests whether a value is approximately zero.
    */
    function nearZero(value: number): boolean;
}
declare module kiwi {
    /**
    * An internal row class used by the solver.
    *
    * This class is an implementation detail. It should not be
    * used directly by user code.
    *
    * @class
    */
    class Row {
        /**
        * Construct a new Row.
        */
        constructor(constant?: number);
        /**
        * Returns the mapping of symbols to coefficients.
        */
        public cells(): IMap<Symbol, number>;
        /**
        * Returns the constant for the row.
        */
        public constant(): number;
        /**
        * Returns true if the row is a constant value.
        */
        public isConstant(): boolean;
        /**
        * Returns true if the Row has all dummy symbols.
        */
        public allDummies(): boolean;
        /**
        * Create a copy of the row.
        */
        public copy(): Row;
        /**
        * Add a constant value to the row constant.
        *
        * Returns the new value of the constant.
        */
        public add(value: number): number;
        /**
        * Insert the symbol into the row with the given coefficient.
        *
        * If the symbol already exists in the row, the coefficient
        * will be added to the existing coefficient. If the resulting
        * coefficient is zero, the symbol will be removed from the row.
        */
        public insertSymbol(symbol: Symbol, coefficient?: number): void;
        /**
        * Insert a row into this row with a given coefficient.
        *
        * The constant and the cells of the other row will be
        * multiplied by the coefficient and added to this row. Any
        * cell with a resulting coefficient of zero will be removed
        * from the row.
        */
        public insertRow(other: Row, coefficient?: number): void;
        /**
        * Remove a symbol from the row.
        */
        public removeSymbol(symbol: Symbol): void;
        /**
        * Reverse the sign of the constant and cells in the row.
        */
        public reverseSign(): void;
        /**
        * Solve the row for the given symbol.
        *
        * This method assumes the row is of the form
        * a * x + b * y + c = 0 and (assuming solve for x) will modify
        * the row to represent the right hand side of
        * x = -b/a * y - c / a. The target symbol will be removed from
        * the row, and the constant and other cells will be multiplied
        * by the negative inverse of the target coefficient.
        *
        * The given symbol *must* exist in the row.
        */
        public solveFor(symbol: Symbol): void;
        /**
        * Solve the row for the given symbols.
        *
        * This method assumes the row is of the form
        * x = b * y + c and will solve the row such that
        * y = x / b - c / b. The rhs symbol will be removed from the
        * row, the lhs added, and the result divided by the negative
        * inverse of the rhs coefficient.
        *
        * The lhs symbol *must not* exist in the row, and the rhs
        * symbol must* exist in the row.
        */
        public solveForEx(lhs: Symbol, rhs: Symbol): void;
        /**
        * Returns the coefficient for the given symbol.
        */
        public coefficientFor(symbol: Symbol): number;
        /**
        * Substitute a symbol with the data from another row.
        *
        * Given a row of the form a * x + b and a substitution of the
        * form x = 3 * y + c the row will be updated to reflect the
        * expression 3 * a * y + a * c + b.
        *
        * If the symbol does not exist in the row, this is a no-op.
        */
        public substitute(symbol: Symbol, row: Row): void;
        private _cellMap;
        private _constant;
    }
}
declare module kiwi {
    module Strength {
        /**
        * Create a new symbolic strength.
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
        * Add a constraint to the solver.
        */
        public addConstraint(constraint: Constraint): void;
        /**
        * Remove a constraint from the solver.
        */
        public removeConstraint(constraint: Constraint): void;
        /**
        * Test whether the solver contains the constraint.
        */
        public hasConstraint(constraint: Constraint): boolean;
        /**
        * Add an edit variable to the solver.
        */
        public addEditVariable(variable: Variable, strength: number): void;
        /**
        * Remove an edit variable from the solver.
        */
        public removeEditVariable(variable: Variable): void;
        /**
        * Test whether the solver contains the edit variable.
        */
        public hasEditVariable(variable: Variable): boolean;
        /**
        * Suggest the value of an edit variable.
        */
        public suggestValue(variable: Variable, value: number): void;
        /**
        * Update the values of the variables.
        */
        public updateVariables(): void;
        /**
        * Get the symbol for the given variable.
        *
        * If a symbol does not exist for the variable, one will be created.
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
        */
        private _chooseSubject(row, tag);
        /**
        * Add the row to the tableau using an artificial variable.
        *
        * This will return false if the constraint cannot be satisfied.
        */
        private _addWithArtificialVariable(row);
        /**
        * Substitute the parametric symbol with the given row.
        *
        * This method will substitute all instances of the parametric symbol
        * in the tableau and the objective function with the given row.
        */
        private _substitute(symbol, row);
        /**
        * Optimize the system for the given objective function.
        *
        * This method performs iterations of Phase 2 of the simplex method
        * until the objective function reaches a minimum.
        */
        private _optimize(objective);
        /**
        * Optimize the system using the dual of the simplex method.
        *
        * The current state of the system should be such that the objective
        * function is optimal, but not feasible. This method will perform
        * an iteration of the dual simplex method to make the solution both
        * optimal and feasible.
        */
        private _dualOptimize();
        /**
        * Compute the entering variable for a pivot operation.
        *
        * This method will return first symbol in the objective function which
        * is non-dummy and has a coefficient less than zero. If no symbol meets
        * the criteria, it means the objective function is at a minimum, and an
        * invalid symbol is returned.
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
        */
        private _getDualEnteringSymbol(row);
        /**
        * Compute the symbol for pivot exit row.
        *
        * This method will return the symbol for the exit row in the row
        * map. If no appropriate exit symbol is found, an invalid symbol
        * will be returned. This indicates that the objective function is
        * unbounded.
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
        */
        private _getMarkerLeavingSymbol(marker);
        /**
        * Remove the effects of a constraint on the objective function.
        */
        private _removeConstraintEffects(cn, tag);
        /**
        * Remove the effects of an error marker on the objective function.
        */
        private _removeMarkerEffects(marker, strength);
        /**
        * Get the first Slack or Error symbol in the row.
        *
        * If no such symbol is present, an invalid symbol will be returned.
        */
        private _anyPivotableSymbol(row);
        /**
        * Returns a new Symbol of the given type.
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
