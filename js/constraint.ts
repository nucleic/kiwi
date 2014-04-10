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

module kiwi {

    /**
     * An enum defining the linear constraint operators.
     */
    export enum Operator {
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
     */
    export class Constraint {

        /**
         * Construct a new Constraint.
         *
         * @param expression The constraint expression.
         * @param operator The equation operator.
         * @param strength The strength of the constraint.
         */
        constructor(
            expression: Expression,
            operator: Operator,
            strength: number = Strength.required)
        {
            this._operator = operator;
            this._expression = reduce(expression);
            this._strength = Strength.clip(strength);
            this._id = CnId++;
        }

        /**
         * Returns the unique id number of the constraint.
         */
        id(): number {
            return this._id;
        }

        /**
         * Returns the expression of the constraint.
         */
        expression(): Expression {
            return this._expression;
        }

        /**
         * Returns the relational operator of the constraint.
         */
        op(): Operator {
            return this._operator;
        }

        /**
         * Returns the strength of the constraint.
         */
        strength(): number {
            return this._strength;
        }

        private _id: number;
        private _expression: Expression;
        private _operator: Operator;
        private _strength: number;
    }


    /**
     * The internal constraint id counter.
     */
    var CnId = 0;


    /**
     * The internal expression reduction function.
     */
    function reduce(expr: Expression): Expression {
        var coeffMap: { [key: number]: number } = {};
        var variables: Variable[] = [];
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
        var newTerms: Term[] = [];
        for (var i = 0, n = variables.length; i < n; ++i) {
            var variable = variables[i];
            var coefficient = coeffMap[variable.id()];
            newTerms.push(new Term(variable, coefficient));
        }
        return new Expression(newTerms, expr.constant());
    }

}
