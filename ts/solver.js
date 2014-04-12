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
/// <reference path="tsutils.d.ts"/>
var kiwi;
(function (kiwi) {
    /**
    * The constraint solver class.
    *
    * @class
    */
    var Solver = (function () {
        /**
        * Construct a new Solver.
        */
        function Solver() {
            this._cns = {};
            this._rows = {};
            this._vars = new tsutils.AssocArray(kiwi.Variable.LessThan);
            this._edits = {};
            this._infeasible_rows = [];
            this._objective = new Row();
            this._artificial = null;
            this._symbolTick = 0;
        }
        /**
        * Add a constraint to the solver.
        */
        Solver.prototype.addConstraint = function (constraint) {
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
            if (this._symbolType(subject) === 0 /* Invalid */ && this._allDummies(row)) {
                if (!nearZero(row.constant())) {
                    throw new Error("unsatifiable constraint");
                } else {
                    subject = tag.marker;
                }
            }

            // If an entering symbol still isn't found, then the row must
            // be added using an artificial variable. If that fails, then
            // the row represents an unsatisfiable constraint.
            if (this._symbolType(subject) === 0 /* Invalid */) {
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
        };

        /**
        * Remove a constraint from the solver.
        */
        Solver.prototype.removeConstraint = function (constraint) {
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
                if (this._symbolType(leaving) === 0 /* Invalid */) {
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
            this._optimize(this._objective);
        };

        /**
        * Test whether the solver contains the constraint.
        */
        Solver.prototype.hasConstraint = function (constraint) {
            var tag = this._cns[constraint.id()];
            return typeof tag !== "undefined";
        };

        /**
        * Add an edit variable to the solver.
        */
        Solver.prototype.addEditVariable = function (variable, strength) {
            var info = this._edits[variable.id()];
            if (typeof info !== "undefined") {
                throw new Error("duplicate edit variable");
            }
            strength = kiwi.Strength.clip(strength);
            if (strength === kiwi.Strength.required) {
                throw new Error("bad required strength");
            }
            var term = new kiwi.Term(variable);
            var expr = new kiwi.Expression([term]);
            var cn = new kiwi.Constraint(expr, 2 /* Eq */, strength);
            this.addConstraint(cn);
            info = {
                tag: this._cns[cn.id()],
                constraint: cn,
                constant: 0.0
            };
            this._edits[variable.id()] = info;
        };

        /**
        * Remove an edit variable from the solver.
        */
        Solver.prototype.removeEditVariable = function (variable) {
            var info = this._edits[variable.id()];
            if (typeof info === "undefined") {
                throw new Error("unknown edit variable");
            }
            this.removeConstraint(info.constraint);
            delete this._edits[variable.id()];
        };

        /**
        * Test whether the solver contains the edit variable.
        */
        Solver.prototype.hasEditVariable = function (variable) {
            var info = this._edits[variable.id()];
            return typeof info !== "undefined";
        };

        /**
        * Suggest the value of an edit variable.
        */
        Solver.prototype.suggestValue = function (variable, value) {
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
                if (coeff !== 0.0 && row.add(delta * coeff) < 0.0 && this._symbolType(sym) !== 1 /* External */) {
                    this._infeasible_rows.push(sym);
                }
            }
            this._dualOptimize();
        };

        /**
        * Update the values of the variables.
        */
        Solver.prototype.updateVariables = function () {
            var theseRows = this._rows;
            var iter = this._vars.iter();
            var pair;
            while (pair = iter.next()) {
                var row = theseRows[pair.second];
                if (typeof row === "undefined") {
                    pair.first.setValue(0.0);
                } else {
                    pair.first.setValue(row.constant());
                }
            }
        };

        /**
        * Get the symbol for the given variable.
        *
        * If a symbol does not exist for the variable, one will be created.
        */
        Solver.prototype._getVarSymbol = function (variable) {
            var self = this;
            var factory = function () {
                return self._newSymbol(1 /* External */);
            };
            return this._vars.setDefault(variable, factory).second;
        };

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
        Solver.prototype._createRow = function (constraint) {
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
            var tag = { marker: 0 /* Invalid */, other: 0 /* Invalid */ };
            switch (constraint.op()) {
                case 0 /* Le */:
                case 1 /* Ge */: {
                    var coeff = constraint.op() === 0 /* Le */ ? 1.0 : -1.0;
                    var slack = this._newSymbol(2 /* Slack */);
                    tag.marker = slack;
                    row.insertSymbol(slack, coeff);
                    if (strength < kiwi.Strength.required) {
                        var error = this._newSymbol(3 /* Error */);
                        tag.other = error;
                        row.insertSymbol(error, -coeff);
                        objective.insertSymbol(error, strength);
                    }
                    break;
                }
                case 2 /* Eq */: {
                    if (strength < kiwi.Strength.required) {
                        var errplus = this._newSymbol(3 /* Error */);
                        var errminus = this._newSymbol(3 /* Error */);
                        tag.marker = errplus;
                        tag.other = errminus;
                        row.insertSymbol(errplus, -1.0); // v = eplus - eminus
                        row.insertSymbol(errminus, 1.0); // v - eplus + eminus = 0
                        objective.insertSymbol(errplus, strength);
                        objective.insertSymbol(errminus, strength);
                    } else {
                        var dummy = this._newSymbol(4 /* Dummy */);
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
        };

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
        Solver.prototype._chooseSubject = function (row, tag) {
            var rowCells = row.cells();
            for (var symbol in rowCells) {
                if (this._symbolType(symbol) === 1 /* External */) {
                    return symbol;
                }
            }
            var marker = tag.marker;
            var mtype = this._symbolType(marker);
            if (mtype === 2 /* Slack */ || mtype === 3 /* Error */) {
                if (row.coefficientFor(marker) < 0.0) {
                    return marker;
                }
            }
            var other = tag.other;
            var otype = this._symbolType(other);
            if (otype === 2 /* Slack */ || otype === 3 /* Error */) {
                if (row.coefficientFor(other) < 0.0) {
                    return other;
                }
            }
            return 0 /* Invalid */;
        };

        /**
        * Add the row to the tableau using an artificial variable.
        *
        * This will return false if the constraint cannot be satisfied.
        */
        Solver.prototype._addWithArtificialVariable = function (row) {
            // Create and add the artificial variable to the tableau
            var art = this._newSymbol(2 /* Slack */);
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
                if (this._symbolType(entering) === 0 /* Invalid */) {
                    return false;
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
        };

        /**
        * Substitute the parametric symbol with the given row.
        *
        * This method will substitute all instances of the parametric symbol
        * in the tableau and the objective function with the given row.
        */
        Solver.prototype._substitute = function (symbol, row) {
            var theseRows = this._rows;
            for (var itSym in theseRows) {
                var itRow = theseRows[itSym];
                itRow.substitute(symbol, row);
                var c = itRow.constant();
                if (c < 0.0 && this._symbolType(itSym) !== 1 /* External */) {
                    this._infeasible_rows.push(itSym);
                }
            }
            this._objective.substitute(symbol, row);
            if (this._artificial) {
                this._artificial.substitute(symbol, row);
            }
        };

        /**
        * Optimize the system for the given objective function.
        *
        * This method performs iterations of Phase 2 of the simplex method
        * until the objective function reaches a minimum.
        */
        Solver.prototype._optimize = function (objective) {
            while (true) {
                var entering = this._getEnteringSymbol(objective);
                if (this._symbolType(entering) === 0 /* Invalid */) {
                    return;
                }
                var leaving = this._getLeavingSymbol(entering);
                if (this._symbolType(leaving) === 0 /* Invalid */) {
                    throw new Error("the object is unbounded");
                }
                var row = this._rows[leaving];
                delete this._rows[leaving];
                row.solveForEx(leaving, entering);
                this._substitute(entering, row);
                this._rows[entering] = row;
            }
        };

        /**
        * Optimize the system using the dual of the simplex method.
        *
        * The current state of the system should be such that the objective
        * function is optimal, but not feasible. This method will perform
        * an iteration of the dual simplex method to make the solution both
        * optimal and feasible.
        */
        Solver.prototype._dualOptimize = function () {
            var theseRows = this._rows;
            var infeasible = this._infeasible_rows;
            while (infeasible.length !== 0) {
                var leaving = infeasible.pop();
                var row = theseRows[leaving];
                if (typeof row !== "undefined" && row.constant() < 0.0) {
                    var entering = this._getDualEnteringSymbol(row);
                    if (this._symbolType(entering) === 0 /* Invalid */) {
                        throw new Error("dual optimize failed");
                    }
                    delete theseRows[leaving];
                    row.solveForEx(leaving, entering);
                    this._substitute(entering, row);
                    theseRows[entering] = row;
                }
            }
        };

        /**
        * Compute the entering variable for a pivot operation.
        *
        * This method will return first symbol in the objective function which
        * is non-dummy and has a coefficient less than zero. If no symbol meets
        * the criteria, it means the objective function is at a minimum, and an
        * invalid symbol is returned.
        */
        Solver.prototype._getEnteringSymbol = function (objective) {
            var cells = objective.cells();
            for (var sym in cells) {
                if (cells[sym] < 0.0 && this._symbolType(sym) !== 4 /* Dummy */) {
                    return sym;
                }
            }
            return 0 /* Invalid */;
        };

        /**
        * Compute the entering symbol for the dual optimize operation.
        *
        * This method will return the symbol in the row which has a positive
        * coefficient and yields the minimum ratio for its respective symbol
        * in the objective function. The provided row *must* be infeasible.
        * If no symbol is found which meats the criteria, an invalid symbol
        * is returned.
        */
        Solver.prototype._getDualEnteringSymbol = function (row) {
            var ratio = Number.MAX_VALUE;
            var entering = 0 /* Invalid */;
            var cells = row.cells();
            for (var sym in cells) {
                var c = cells[sym];
                if (c > 0.0 && this._symbolType(sym) !== 4 /* Dummy */) {
                    var coeff = this._objective.coefficientFor(sym);
                    var r = coeff / c;
                    if (r < ratio) {
                        ratio = r;
                        entering = sym;
                    }
                }
            }
            return entering;
        };

        /**
        * Compute the symbol for pivot exit row.
        *
        * This method will return the symbol for the exit row in the row
        * map. If no appropriate exit symbol is found, an invalid symbol
        * will be returned. This indicates that the objective function is
        * unbounded.
        */
        Solver.prototype._getLeavingSymbol = function (entering) {
            var found = 0 /* Invalid */;
            var ratio = Number.MAX_VALUE;
            var theseRows = this._rows;
            for (var sym in theseRows) {
                if (this._symbolType(sym) !== 1 /* External */) {
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
        };

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
        Solver.prototype._getMarkerLeavingSymbol = function (marker) {
            var dmax = Number.MAX_VALUE;
            var r1 = dmax;
            var r2 = dmax;
            var first = 0 /* Invalid */;
            var second = 0 /* Invalid */;
            var third = 0 /* Invalid */;
            var theseRows = this._rows;
            for (var sym in theseRows) {
                var row = theseRows[sym];
                var c = row.coefficientFor(marker);
                if (c === 0.0) {
                    continue;
                }
                if (this._symbolType(sym) === 1 /* External */) {
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
            if (first !== 0 /* Invalid */) {
                return first;
            }
            if (second !== 0 /* Invalid */) {
                return second;
            }
            return third;
        };

        /**
        * Remove the effects of a constraint on the objective function.
        */
        Solver.prototype._removeConstraintEffects = function (cn, tag) {
            if (this._symbolType(tag.marker) === 3 /* Error */) {
                this._removeMarkerEffects(tag.marker, cn.strength());
            }
            if (this._symbolType(tag.other) === 3 /* Error */) {
                this._removeMarkerEffects(tag.other, cn.strength());
            }
        };

        /**
        * Remove the effects of an error marker on the objective function.
        */
        Solver.prototype._removeMarkerEffects = function (marker, strength) {
            var row = this._rows[marker];
            if (typeof row !== "undefined") {
                this._objective.insertRow(row, -strength);
            } else {
                this._objective.insertSymbol(marker, -strength);
            }
        };

        /**
        * Get the first Slack or Error symbol in the row.
        *
        * If no such symbol is present, an Invalid symbol will be returned.
        */
        Solver.prototype._anyPivotableSymbol = function (row) {
            for (var sym in row.cells()) {
                var type = this._symbolType(sym);
                if (type === 2 /* Slack */ || type === 3 /* Error */) {
                    return sym;
                }
            }
            return 0 /* Invalid */;
        };

        /**
        * Returns true if a Row has all dummy symbols.
        */
        Solver.prototype._allDummies = function (row) {
            var cells = row.cells();
            for (var symbol in cells) {
                if (this._symbolType(symbol) !== 4 /* Dummy */) {
                    return false;
                }
            }
            return true;
        };

        /**
        * Returns a new symbol of the given type.
        */
        Solver.prototype._newSymbol = function (type) {
            var symbol = this._symbolTick + type;
            this._symbolTick += 5 /* Last */;
            return symbol;
        };

        /**
        * Returns the type of the given symbol.
        */
        Solver.prototype._symbolType = function (symbol) {
            return symbol % 5 /* Last */;
        };
        return Solver;
    })();
    kiwi.Solver = Solver;

    /**
    * The internal solver symbol types.
    */
    var Symbol;
    (function (Symbol) {
        Symbol[Symbol["Invalid"] = 0] = "Invalid";
        Symbol[Symbol["External"] = 1] = "External";
        Symbol[Symbol["Slack"] = 2] = "Slack";
        Symbol[Symbol["Error"] = 3] = "Error";
        Symbol[Symbol["Dummy"] = 4] = "Dummy";
        Symbol[Symbol["Last"] = 5] = "Last";
    })(Symbol || (Symbol = {}));

    

    

    

    

    

    

    

    

    

    /**
    * An internal table row class used by the solver.
    */
    var Row = (function () {
        /**
        * Construct a new Row.
        */
        function Row(constant) {
            if (typeof constant === "undefined") { constant = 0.0; }
            this._cells = {};
            this._constant = constant;
        }
        /**
        * Returns the cell map of the row.
        *
        * This *must* be treated as const.
        */
        Row.prototype.cells = function () {
            return this._cells;
        };

        /**
        * Returns the constant for the row.
        */
        Row.prototype.constant = function () {
            return this._constant;
        };

        /**
        * Returns true if the row is a constant value.
        */
        Row.prototype.isConstant = function () {
            for (var symbol in this._cells) {
                return false;
            }
            return true;
        };

        /**
        * Create a clone of the Row.
        */
        Row.prototype.clone = function () {
            var row = new Row(this._constant);
            var cells = {};
            var theseCells = this._cells;
            for (var symbol in theseCells) {
                cells[symbol] = theseCells[symbol];
            }
            row._cells = cells;
            return row;
        };

        /**
        * Add a constant value to the row constant.
        *
        * Returns the new value of the constant.
        */
        Row.prototype.add = function (value) {
            return this._constant += value;
        };

        /**
        * Insert the symbol into the row with the given coefficient.
        *
        * If the symbol already exists in the row, the coefficient
        * will be added to the existing coefficient. If the resulting
        * coefficient is zero, the symbol will be removed from the row.
        */
        Row.prototype.insertSymbol = function (symbol, coefficient) {
            if (typeof coefficient === "undefined") { coefficient = 1.0; }
            var value = (this._cells[symbol] || 0.0) + coefficient;
            if (nearZero(value)) {
                delete this._cells[symbol];
            } else {
                this._cells[symbol] = value;
            }
        };

        /**
        * Insert a row into this row with a given coefficient.
        *
        * The constant and the cells of the other row will be
        * multiplied by the coefficient and added to this row. Any
        * cell with a resulting coefficient of zero will be removed
        * from the row.
        */
        Row.prototype.insertRow = function (other, coefficient) {
            if (typeof coefficient === "undefined") { coefficient = 1.0; }
            this._constant += other._constant * coefficient;
            var theseCells = this._cells;
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
        };

        /**
        * Remove a symbol from the row.
        */
        Row.prototype.removeSymbol = function (symbol) {
            delete this._cells[symbol];
        };

        /**
        * Reverse the sign of the constant and cells in the row.
        */
        Row.prototype.reverseSign = function () {
            this._constant = -this._constant;
            var theseCells = this._cells;
            for (var symbol in theseCells) {
                theseCells[symbol] = -theseCells[symbol];
            }
        };

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
        Row.prototype.solveFor = function (symbol) {
            var theseCells = this._cells;
            var coeff = -1.0 / theseCells[symbol];
            delete theseCells[symbol];
            this._constant *= coeff;
            for (var symbol in theseCells) {
                theseCells[symbol] *= coeff;
            }
        };

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
        Row.prototype.solveForEx = function (lhs, rhs) {
            this.insertSymbol(lhs, -1.0);
            this.solveFor(rhs);
        };

        /**
        * Returns the coefficient for the given symbol.
        */
        Row.prototype.coefficientFor = function (symbol) {
            return this._cells[symbol] || 0.0;
        };

        /**
        * Substitute a symbol with the data from another row.
        *
        * Given a row of the form a * x + b and a substitution of the
        * form x = 3 * y + c the row will be updated to reflect the
        * expression 3 * a * y + a * c + b.
        *
        * If the symbol does not exist in the row, this is a no-op.
        */
        Row.prototype.substitute = function (symbol, row) {
            var theseCells = this._cells;
            var coefficient = theseCells[symbol];
            if (typeof coefficient !== "undefined") {
                delete theseCells[symbol];
                this.insertRow(row, coefficient);
            }
        };
        return Row;
    })();

    /**
    * An internal function to test whether a value is near zero.
    */
    function nearZero(value) {
        var eps = 1.0e-8;
        return value < 0.0 ? -value < eps : value < eps;
    }
})(kiwi || (kiwi = {}));
