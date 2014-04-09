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
var kiwi;
(function (kiwi) {
    /**
    * An enum defining the linear constraint operators.
    */
    (function (RelationalOperator) {
        /**
        * less than or equal to
        */
        RelationalOperator[RelationalOperator["OP_LE"] = 0] = "OP_LE";

        /**
        * greater than or equal to
        */
        RelationalOperator[RelationalOperator["OP_GE"] = 1] = "OP_GE";

        /**
        * strictly equal to (within reasonable eps)
        */
        RelationalOperator[RelationalOperator["OP_EQ"] = 2] = "OP_EQ";
    })(kiwi.RelationalOperator || (kiwi.RelationalOperator = {}));
    var RelationalOperator = kiwi.RelationalOperator;

    /**
    * A linear constraint equation.
    *
    * A constraint equation is composed of an expression, an operator,
    * and a strength. The RHS of the equation is implicitly zero.
    *
    * @class
    */
    var Constraint = (function () {
        /**
        * Construct a new Constraint.
        *
        * @param expression The constraint expression.
        * @param operator The equation operator.
        * @param strength The strength of the constraint.
        */
        function Constraint(expression, operator, strength) {
            if (typeof strength === "undefined") { strength = kiwi.strength.required; }
            this._operator = operator;
            this._expression = reduce(expression);
            this._strength = kiwi.strength.clip(strength);
            this._id = CnId++;
        }
        /**
        * Returns the unique id number of the constraint.
        */
        Constraint.prototype.id = function () {
            return this._id;
        };

        /**
        * Returns the expression of the constraint.
        */
        Constraint.prototype.expression = function () {
            return this._expression;
        };

        /**
        * Returns the relational operator of the constraint.
        */
        Constraint.prototype.op = function () {
            return this._operator;
        };

        /**
        * Returns the strength of the constraint.
        */
        Constraint.prototype.strength = function () {
            return this._strength;
        };
        return Constraint;
    })();
    kiwi.Constraint = Constraint;

    /**
    * The internal constraint id counter.
    */
    var CnId = 0;

    /**
    * The internal expression reduction function.
    */
    function reduce(expr) {
        var coeffMap = {};
        var variables = [];
        var terms = expr.terms();
        for (var i = 0, n = terms.length; i < n; ++i) {
            var term = terms[i];
            var variable = term.variable();
            var coefficient = term.coefficient();
            var id = variable.id();
            var coeff = coeffMap[id];
            if (typeof coeff !== "undefined") {
                coeffMap[id] = coeff + coefficient;
            } else {
                variables.push(variable);
                coeffMap[id] = coefficient;
            }
        }
        var newTerms = [];
        for (var i = 0, n = variables.length; i < n; ++i) {
            var variable = variables[i];
            var coefficient = coeffMap[variable.id()];
            newTerms.push(new kiwi.Term(variable, coefficient));
        }
        return new kiwi.Expression(newTerms, expr.constant());
    }
})(kiwi || (kiwi = {}));
