/*-----------------------------------------------------------------------------
| Copyright (c) 2014, Nucleic Development Team.
|
| Distributed under the terms of the Modified BSD License.
|
| The full license is in the file COPYING.txt, distributed with this software.
|----------------------------------------------------------------------------*/
module kiwi {

    /**
     * The internal constraint id counter.
     */
    var CnId = 0;


    /**
     * The internal expression reduction function.
     */
    function reduceExpr(expr: Expression): Expression {
        return expr; // XXX implement me!
    }


    /**
     * An enum defining the linear constraint operators.
     */
    export enum RelationalOperator {

        /**
         * less than or equal to
         */
        OP_LE,

        /**
         * greater than or equal to
         */
        OP_GE,

        /**
         * strictly equal to (within reasonable eps)
         */
        OP_EQ
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
         * A Constraint comparison function.
         */
        static LessThan(first: Constraint, second: Constraint): boolean {
            return first.id() < second.id();
        }

        /**
         * Construct a new Constraint.
         *
         * @param expression The constraint expression.
         * @param operator The equation operator.
         * @param strength The strength of the constraint.
         */
        constructor(
            expression: Expresion,
            operator: RelationalOperator,
            strength: number = strength.required)
        {
            this._operator = operator;
            this._expression = reduceExpr(expression);
            this._strength = kiwi.strength.clip(strength);
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
        op(): RelationalOperator {
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
        private _operator: RelationalOperator;
        private _strength: number;
    }

}
