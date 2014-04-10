/*-----------------------------------------------------------------------------
| Copyright (c) 2014, Nucleic Development Team.
|
| Distributed under the terms of the Modified BSD License.
|
| The full license is in the file COPYING.txt, distributed with this software.
|----------------------------------------------------------------------------*/

/// <reference path="variable.ts"/>
/// <reference path="term.ts"/>
/// <reference path="expression.ts"/>
/// <reference path="strength.ts"/>
/// <reference path="constraint.ts"/>

module kiwi {

    /**
     * The constraint solver class.
     *
     * @class
     */
    export class Solver {

        /**
         * Construct a new Solver.
         */
        constructor() { }

        /**
         * Add a constraint to the solver.
         */
        addConstraint(constraint: Constraint): void {
            var tag = this._cns[constraint.id()];
            if (typeof tag !== "undefined") {
                throw new Error("duplicate constraint");
            }

            // Creating a row causes symbols to reserved for the variables
            // in the constraint. If this method exits with an exception,
            // then its possible those variables will linger in the var map.
            // Since its likely that those variables will be used in other
            // constraints and since exceptional conditions are uncommon,
            // i'm not too worried about aggressive cleanup of the var map.
            var data = this._createRow(constraint);
            var row = data.row;
            var tag = data.tag;
            var subject = this._chooseSubject(row, tag);

            // If chooseSubject couldnt find a valid entering symbol, one
            // last option is available if the entire row is composed of
            // dummy variables. If the constant of the row is zero, then
            // this represents redundant constraints and the new dummy
            // marker can enter the basis. If the constant is non-zero,
            // then it represents an unsatisfiable constraint.
            if (this._symbolType(subject) === Symbol.Invalid && this._allDummies(row)) {
                if (!nearZero(row.constant())) {
                    throw new Error("unsatifiable constraint");
                } else {
                    subject = tag.marker;
                }
            }

            // If an entering symbol still isn't found, then the row must
            // be added using an artificial variable. If that fails, then
            // the row represents an unsatisfiable constraint.
            if (this._symbolType(subject) === Symbol.Invalid) {
                if (!this._addWithArtificialVariable(row)) {
                    throw new Error("unsatisfiable constraint");
                }
            } else {
                row.solveFor(subject);
                this._substitute(subject, row);
                this._rows[subject] = row;
            }

            this._cns[constraint.id()] = tag;

            // Optimizing after each constraint is added performs less
            // aggregate work due to a smaller average system size. It
            // also ensures the solver remains in a consistent state.
            this._optimize(this._objective);
        }

        /**
         * Remove a constraint from the solver.
         */
        removeConstraint(constraint: Constraint): void {
            var tag = this._cns[constraint.id()];
            if (typeof tag === "undefined") {
                throw new Error("unknown constraint");
            }

            delete this._cns[constraint.id()];

            // Remove the error effects from the objective function
            // *before* pivoting, or substitutions into the objective
            // will lead to incorrect solver results.
            this._removeConstraintEffects(constraint, tag);

            // If the marker is basic, simply drop the row. Otherwise,
            // pivot the marker into the basis and then drop the row.
            var marker = tag.marker;
            var row = this._rows[marker];
            if (typeof row !== "undefined") {
                delete this._rows[marker];
            } else {
                var leaving = this._getMarkerLeavingSymbol(marker);
                if (this._symbolType(leaving) === Symbol.Invalid) {
                    throw new Error("failed to find leaving row");
                }
                row = this._rows[leaving];
                delete this._rows[leaving];
                row.solveForEx(leaving, marker);
                this._substitute(marker, row);
            }

            // Optimizing after each constraint is removed ensures that the
            // solver remains consistent. It makes the solver api easier to
            // use at a small tradeoff for speed.
            this._optimize( this._objective );
        }

        /**
         * Test whether the solver contains the constraint.
         */
        hasConstraint(constraint: Constraint): boolean {
            var tag = this._cns[constraint.id()];
            return typeof tag !== "undefined";
        }

        /**
         * Add an edit variable to the solver.
         */
        addEditVariable(variable: Variable, strength: number): void {
            var info = this._edits[variable.id()];
            if (typeof info !== "undefined") {
                throw new Error("duplicate edit variable");
            }
            strength = Strength.clip(strength);
            if (strength === Strength.required) {
                throw new Error("bad required strength");
            }
            var term = new Term(variable);
            var expr = new Expression([term]);
            var cn = new Constraint(expr, Operator.Eq, strength);
            this.addConstraint(cn);
            info = {
                tag: this._cns[cn.id()],
                constraint: cn,
                constant: 0.0
            }
            this._edits[variable.id()] = info;
        }

        /**
         * Remove an edit variable from the solver.
         */
        removeEditVariable(variable: Variable): void {
            var info = this._edits[variable.id()];
            if (typeof info === "undefined") {
                throw new Error("unknown edit variable");
            }
            this.removeConstraint(info.constraint);
            delete this._edits[variable.id()];
        }

        /**
         * Test whether the solver contains the edit variable.
         */
        hasEditVariable(variable: Variable): boolean {
            var info = this._edits[variable.id()];
            return typeof info !== "undefined";
        }

        /**
         * Suggest the value of an edit variable.
         */
        suggestValue(variable: Variable, value: number): void {
            var info = this._edits[variable.id()];
            if (typeof info === "undefined") {
                throw new Error("unknown edit variable");
            }

            var marker = info.tag.marker;
            var other = info.tag.other;
            var delta = value - info.constant;
            info.constant = value;

            // Check first if the positive error variable is basic.
            var row = this._rows[marker];
            if (typeof row !== "undefined") {
                if (row.add(-delta) < 0.0) {
                    this._infeasible_rows.push(marker);
                }
                this._dualOptimize();
                return;
            }

            // Check next if the negative error variable is basic.
            row = this._rows[other];
            if (typeof row !== "undefined") {
                if (row.add(delta) < 0.0) {
                    this._infeasible_rows.push(other);
                }
                this._dualOptimize();
                return;
            }

            // Otherwise update each row where the error variables exist.
            var theseRows = this._rows;
            for (var sym in theseRows) {
                row = theseRows[sym];
                var coeff = row.coefficientFor(marker);
                if (coeff !== 0.0 && row.add(delta * coeff) < 0.0 &&
                    this._symbolType(sym) !== Symbol.External) {
                    this._infeasible_rows.push(sym);
                }
            }
            this._dualOptimize();
        }

        /**
         * Update the values of the variables.
         */
        updateVariables(): void {
            var theseVars = this._vars;
            var theseRows = this._rows;
            for (var id in theseVars) {
                var pair = theseVars[id];
                var row = theseRows[pair.symbol];
                if (typeof row === "undefined") {
                    pair.variable.setValue(0.0);
                } else {
                    pair.variable.setValue(row.constant());
                }
            }
        }

        /**
         * Get the symbol for the given variable.
         *
         * If a symbol does not exist for the variable, one will be created.
         */
        private _getVarSymbol(variable: Variable): number {
            var id = variable.id();
            var pair = this._vars[id];
            if (typeof pair !== "undefined") {
                return pair.symbol;
            }
            var symbol = this._newSymbol(Symbol.External);
            this._vars[id] = { variable: variable, symbol: symbol };
            return symbol;
        }

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
        private _createRow(constraint: Constraint): IRowCreation {
            var expr = constraint.expression();
            var row = new Row(expr.constant());

            // Substitute the current basic variables into the row.
            var terms = expr.terms();
            for (var i = 0, n = terms.length; i < n; ++i) {
                var term = terms[i];
                var coefficient = term.coefficient();
                if (!nearZero(coefficient)) {
                    var symbol = this._getVarSymbol(term.variable());
                    var basicRow = this._rows[symbol];
                    if (typeof basicRow !== "undefined") {
                        row.insertRow(basicRow, coefficient);
                    } else {
                        row.insertSymbol(symbol, coefficient);
                    }
                }
            }

            // Add the necessary slack, error, and dummy variables.
            var objective = this._objective;
            var strength = constraint.strength();
            var tag = { marker: Symbol.Invalid, other: Symbol.Invalid };
            switch (constraint.op()) {
                case Operator.Le:
                case Operator.Ge:
                {
                    var coeff = constraint.op() === Operator.Le ? 1.0 : -1.0;
                    var slack = this._newSymbol(Symbol.Slack);
                    tag.marker = slack;
                    row.insertSymbol(slack, coeff);
                    if (strength < Strength.required) {
                        var error = this._newSymbol(Symbol.Error);
                        tag.other = error;
                        row.insertSymbol(error, -coeff);
                        objective.insertSymbol(error, strength);
                    }
                    break;
                }
                case Operator.Eq:
                {
                    if (strength < Strength.required) {
                        var errplus = this._newSymbol(Symbol.Error);
                        var errminus = this._newSymbol(Symbol.Error);
                        tag.marker = errplus;
                        tag.other = errminus;
                        row.insertSymbol(errplus, -1.0); // v = eplus - eminus
                        row.insertSymbol(errminus, 1.0); // v - eplus + eminus = 0
                        objective.insertSymbol(errplus, strength);
                        objective.insertSymbol(errminus, strength);
                    } else {
                        var dummy = this._newSymbol(Symbol.Dummy);
                        tag.marker = dummy;
                        row.insertSymbol(dummy);
                    }
                    break;
                }
            }

            // Ensure the row has a positive constant.
            if (row.constant() < 0.0) {
                row.reverseSign();
            }

            return { row: row, tag: tag };
        }

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
        private _chooseSubject(row: Row, tag: ITag): number {
            var rowCells = row.cells();
            for (var symbol in rowCells) {
                if (this._symbolType(symbol) === Symbol.External) {
                    return symbol;
                }
            }
            var marker = tag.marker;
            var mtype = this._symbolType(marker);
            if (mtype === Symbol.Slack || mtype === Symbol.Error) {
                if (row.coefficientFor(marker) < 0.0) {
                    return marker;
                }
            }
            var other = tag.other;
            var otype = this._symbolType(other);
            if (otype === Symbol.Slack || otype === Symbol.Error) {
                if (row.coefficientFor(other) < 0.0) {
                    return other;
                }
            }
            return Symbol.Invalid;
        }

        /**
         * Add the row to the tableau using an artificial variable.
         *
         * This will return false if the constraint cannot be satisfied.
         */
        private _addWithArtificialVariable(row: Row): boolean {
            // Create and add the artificial variable to the tableau
            var art = this._newSymbol(Symbol.Slack);
            this._rows[art] = row.clone();
            this._artificial = row.clone();

            // Optimize the artificial objective. This is successful
            // only if the artificial objective is optimized to zero.
            this._optimize(this._artificial);
            var success = nearZero(this._artificial.constant());
            this._artificial = null;

            // If the artificial variable is basic, pivot the row so that
            // it becomes non-basic. If the row is constant, exit early.
            var basicRow = this._rows[art];
            if (typeof basicRow !== "undefined") {
                delete this._rows[art];
                if (basicRow.isConstant()) {
                    return success;
                }
                var entering = this._anyPivotableSymbol(basicRow);
                if (this._symbolType(entering) === Symbol.Invalid) {
                    return false;  // unsatisfiable (will this ever happen?)
                }
                basicRow.solveForEx(art, entering);
                this._substitute(entering, basicRow);
                this._rows[entering] = basicRow;
            }

            // Remove the artificial variable from the tableau.
            var theseRows = this._rows;
            for (var sym in theseRows) {
                theseRows[sym].removeSymbol(art);
            }
            this._objective.removeSymbol(art);
            return success;
        }

        /**
         * Substitute the parametric symbol with the given row.
         *
         * This method will substitute all instances of the parametric symbol
         * in the tableau and the objective function with the given row.
         */
        private _substitute(symbol: number, row: Row): void {
            var theseRows = this._rows;
            for (var itSym in theseRows) {
                var itRow = theseRows[itSym];
                itRow.substitute(symbol, row);
                var c = itRow.constant();
                if (c < 0.0 && this._symbolType(itSym) !== Symbol.External) {
                    this._infeasible_rows.push(itSym);
                }
            }
            this._objective.substitute(symbol, row);
            if (this._artificial) {
                this._artificial.substitute(symbol, row);
            }
        }

        /**
         * Optimize the system for the given objective function.
         *
         * This method performs iterations of Phase 2 of the simplex method
         * until the objective function reaches a minimum.
         */
        private _optimize(objective: Row): void {
            while (true) {
                var entering = this._getEnteringSymbol(objective);
                if (this._symbolType(entering) === Symbol.Invalid) {
                    return;
                }
                var leaving = this._getLeavingSymbol(entering);
                if (this._symbolType(leaving) === Symbol.Invalid) {
                    throw new Error("the object is unbounded");
                }
                var row = this._rows[leaving];
                delete this._rows[leaving];
                row.solveForEx(leaving, entering);
                this._substitute(entering, row);
                this._rows[entering] = row;
            }
        }

        /**
         * Optimize the system using the dual of the simplex method.
         *
         * The current state of the system should be such that the objective
         * function is optimal, but not feasible. This method will perform
         * an iteration of the dual simplex method to make the solution both
         * optimal and feasible.
         */
        private _dualOptimize() {
            var theseRows = this._rows;
            var infeasible = this._infeasible_rows;
            while (infeasible.length !== 0) {
                var leaving = infeasible.pop();
                var row = theseRows[leaving];
                if (typeof row !== "undefined" && row.constant() < 0.0) {
                    var entering = this._getDualEnteringSymbol(row);
                    if (this._symbolType(entering) === Symbol.Invalid) {
                        throw new Error("dual optimize failed");
                    }
                    delete theseRows[leaving];
                    row.solveForEx(leaving, entering);
                    this._substitute(entering, row);
                    theseRows[entering] = row;
                }
            }
        }

        /**
         * Compute the entering variable for a pivot operation.
         *
         * This method will return first symbol in the objective function which
         * is non-dummy and has a coefficient less than zero. If no symbol meets
         * the criteria, it means the objective function is at a minimum, and an
         * invalid symbol is returned.
         */
        private _getEnteringSymbol(objective: Row): number {
            var cells = objective.cells();
            for (var sym in cells) {
                if (cells[sym] < 0.0 && this._symbolType(sym) !== Symbol.Dummy) {
                    return sym;
                }
            }
            return Symbol.Invalid;
        }

        /**
         * Compute the entering symbol for the dual optimize operation.
         *
         * This method will return the symbol in the row which has a positive
         * coefficient and yields the minimum ratio for its respective symbol
         * in the objective function. The provided row *must* be infeasible.
         * If no symbol is found which meats the criteria, an invalid symbol
         * is returned.
         */
        private _getDualEnteringSymbol(row: Row): number {
            var ratio = Number.MAX_VALUE;
            var entering = Symbol.Invalid;
            var cells = row.cells();
            for (var sym in cells) {
                var c = cells[sym];
                if (c > 0.0 && this._symbolType(sym) !== Symbol.Dummy) {
                    var coeff = this._objective.coefficientFor(sym);
                    var r = coeff / c;
                    if (r < ratio) {
                        ratio = r;
                        entering = sym;
                    }
                }
            }
            return entering;
        }

        /**
         * Compute the symbol for pivot exit row.
         *
         * This method will return the symbol for the exit row in the row
         * map. If no appropriate exit symbol is found, an invalid symbol
         * will be returned. This indicates that the objective function is
         * unbounded.
         */
        private _getLeavingSymbol(entering: number): number {
            var found = Symbol.Invalid;
            var ratio = Number.MAX_VALUE;
            var theseRows = this._rows;
            for (var sym in theseRows) {
                if (this._symbolType(sym) !== Symbol.External) {
                    var row = theseRows[sym];
                    var temp = row.coefficientFor(entering);
                    if (temp < 0.0) {
                        var temp_ratio = -row.constant() / temp;
                        if (temp_ratio < ratio) {
                            ratio = temp_ratio;
                            found = sym;
                        }
                    }
                }
            }
            return found;
        }

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
        private _getMarkerLeavingSymbol(marker: number): number {
            var dmax = Number.MAX_VALUE;
            var r1 = dmax;
            var r2 = dmax;
            var first = Symbol.Invalid;
            var second = Symbol.Invalid;
            var third = Symbol.Invalid;
            var theseRows = this._rows;
            for (var sym in theseRows) {
                var row = theseRows[sym];
                var c = row.coefficientFor(marker);
                if (c === 0.0) {
                    continue;
                }
                if (this._symbolType(sym) === Symbol.External) {
                    third = sym;
                } else if (c < 0.0) {
                    var r = -row.constant() / c;
                    if (r < r1) {
                        r1 = r;
                        first = sym;
                    }
                } else {
                    var r = row.constant() / c;
                    if (r < r2) {
                        r2 = r;
                        second = sym;
                    }
                }
            }
            if (first !== Symbol.Invalid) {
                return first;
            }
            if (second !== Symbol.Invalid) {
                return second;
            }
            return third;
        }

        /**
         * Remove the effects of a constraint on the objective function.
         */
        private _removeConstraintEffects(cn: Constraint, tag: ITag): void {
            if (this._symbolType(tag.marker) === Symbol.Error) {
                this._removeMarkerEffects(tag.marker, cn.strength());
            }
            if (this._symbolType(tag.other) === Symbol.Error) {
                this._removeMarkerEffects(tag.other, cn.strength());
            }
        }

        /**
         * Remove the effects of an error marker on the objective function.
         */
        private _removeMarkerEffects(marker: number, strength: number): void {
            var row = this._rows[marker];
            if (typeof row !== "undefined") {
                this._objective.insertRow(row, -strength);
            } else {
                this._objective.insertSymbol(marker, -strength);
            }
        }

        /**
         * Get the first Slack or Error symbol in the row.
         *
         * If no such symbol is present, an Invalid symbol will be returned.
         */
        private _anyPivotableSymbol(row: Row): number {
            for (var sym in row.cells()) {
                var type = this._symbolType(sym);
                if (type === Symbol.Slack || type === Symbol.Error) {
                    return sym;
                }
            }
            return Symbol.Invalid;
        }

        /**
         * Returns true if a Row has all dummy symbols.
         */
        private _allDummies(row: Row): boolean {
            var cells = row.cells();
            for (var symbol in cells) {
                if (this._symbolType(symbol) !== Symbol.Dummy) {
                    return false;
                }
            }
            return true;
        }

        /**
         * Returns a new symbol of the given type.
         */
        private _newSymbol(type: Symbol): number {
            var symbol = this._symbolTick + type;
            this._symbolTick += Symbol.Last;
            return symbol;
        }

        /**
         * Returns the type of the given symbol.
         */
        private _symbolType(symbol: number): Symbol {
            return symbol % Symbol.Last;
        }

        private _cns: ICnMap = {};
        private _rows: IRowMap = {};
        private _vars: IVarMap = {};
        private _edits: IEditMap = {};
        private _infeasible_rows: number[] = [];
        private _objective: Row = new Row();
        private _artificial: Row = null;
        private _symbolTick: number = 0;
    }


    /**
     * The internal solver symbol types.
     */
    enum Symbol {
        Invalid,
        External,
        Slack,
        Error,
        Dummy,
        Last  // sentinel
    }


    /**
     * The internal interface of a tag value.
     */
    interface ITag {
        marker: number;
        other: number;
    }


    /**
     * The internal interface of an edit info object.
     */
    interface IEditInfo {
        tag: ITag;
        constraint: Constraint;
        constant: number;
    }


    /**
     * The internal interface for a variable pair.
     */
    interface IVarPair {
        variable: Variable;
        symbol: number;
    }


    /**
     * The internal interface for the solver variable map.
     */
    interface IVarMap {
        [variableId: number]: IVarPair;
    }


    /**
     * The internal interface for the solver row map.
     */
    interface IRowMap {
        [symbol: number]: Row;
    }


    /**
     * The internal interface for the solver constraint map.
     */
    interface ICnMap {
        [constraintId: number]: ITag;
    }


    /**
     * The internal interface for the solver edit map.
     */
    interface IEditMap {
        [variableId: number]: IEditInfo;
    }


    /**
     * The internal interface for returning created row data.
     */
    interface IRowCreation {
        row: Row;
        tag: ITag;
    }


    /**
     * An internal interface defining a row cell map.
     */
    interface ICellMap {
        [symbol: number]: number;
    }


    /**
     * An internal table row class used by the solver.
     */
    class Row {

        /**
         * Construct a new Row.
         */
        constructor(constant: number = 0.0) {
            this._constant = constant;
        }

        /**
         * Returns the cell map of the row.
         *
         * This *must* be treated as const.
         */
        cells(): ICellMap {
            return this._cells;
        }

        /**
         * Returns the constant for the row.
         */
        constant(): number {
            return this._constant;
        }

        /**
         * Returns true if the row is a constant value.
         */
        isConstant(): boolean {
            for (var symbol in this._cells) {
                return false;
            }
            return true;
        }

        /**
         * Create a clone of the Row.
         */
        clone(): Row {
            var row = new Row(this._constant);
            var cells: ICellMap = {};
            var theseCells = this._cells;
            for (var symbol in theseCells) {
                cells[symbol] = theseCells[symbol];
            }
            row._cells = cells;
            return row;
        }

        /**
         * Add a constant value to the row constant.
         *
         * Returns the new value of the constant.
         */
        add(value: number): number {
            return this._constant += value;
        }

        /**
         * Insert the symbol into the row with the given coefficient.
         *
         * If the symbol already exists in the row, the coefficient
         * will be added to the existing coefficient. If the resulting
         * coefficient is zero, the symbol will be removed from the row.
         */
        insertSymbol(symbol: number, coefficient: number = 1.0): void {
            var value = (this._cells[symbol] || 0.0) + coefficient;
            if (nearZero(value)) {
                delete this._cells[symbol];
            } else {
                this._cells[symbol] = value;
            }
        }

        /**
         * Insert a row into this row with a given coefficient.
         *
         * The constant and the cells of the other row will be
         * multiplied by the coefficient and added to this row. Any
         * cell with a resulting coefficient of zero will be removed
         * from the row.
         */
        insertRow(other: Row, coefficient: number = 1.0): void {
            this._constant += other._constant * coefficient;
            var theseCells =  this._cells;
            var otherCells = other._cells;
            for (var symbol in otherCells) {
                var coeff = otherCells[symbol] * coefficient;
                coeff += theseCells[symbol] || 0.0;
                if (nearZero(coeff)) {
                    delete theseCells[symbol];
                } else {
                    theseCells[symbol] = coeff;
                }
            }
        }

        /**
         * Remove a symbol from the row.
         */
        removeSymbol(symbol: number): void {
            delete this._cells[symbol];
        }

        /**
         * Reverse the sign of the constant and cells in the row.
         */
        reverseSign(): void {
            this._constant = -this._constant;
            var theseCells = this._cells;
            for (var symbol in theseCells) {
                theseCells[symbol] = -theseCells[symbol];
            }
        }

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
        solveFor(symbol: number): void {
            var theseCells = this._cells;
            var coeff = -1.0 / theseCells[symbol];
            delete theseCells[symbol];
            this._constant *= coeff;
            for (var symbol in theseCells) {
                theseCells[symbol] *= coeff;
            }
        }

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
        solveForEx(lhs: number, rhs: number): void {
            this.insertSymbol(lhs, -1.0);
            this.solveFor(rhs);
        }

        /**
         * Returns the coefficient for the given symbol.
         */
        coefficientFor(symbol: number): number {
            return this._cells[symbol] || 0.0;
        }

        /**
         * Substitute a symbol with the data from another row.
         *
         * Given a row of the form a * x + b and a substitution of the
         * form x = 3 * y + c the row will be updated to reflect the
         * expression 3 * a * y + a * c + b.
         *
         * If the symbol does not exist in the row, this is a no-op.
         */
        substitute(symbol: number, row: Row): void {
            var theseCells = this._cells;
            var coefficient = theseCells[symbol];
            if (typeof coefficient !== "undefined") {
                delete theseCells[symbol];
                this.insertRow(row, coefficient);
            }
        }

        private _cells: ICellMap = {};
        private _constant: number;
    }


    /**
     * An internal function to test whether a value is near zero.
     */
    function nearZero(value: number): boolean {
        var eps = 1.0e-8;
        return value < 0.0 ? -value < eps : value < eps;
    }

}
