/*-----------------------------------------------------------------------------
| Copyright (c) 2014, Nucleic Development Team.
|
| Distributed under the terms of the Modified BSD License.
|
| The full license is in the file COPYING.txt, distributed with this software.
|----------------------------------------------------------------------------*/

// <reference path="expression.ts">
// <reference path="strength.ts">

module kiwi
{

    /**
     * An enum defining the linear constraint operators.
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
     */
    export
    class Constraint
    {
        /**
         * A static constraint comparison function.
         */
        static Compare( a: Constraint, b: Constraint ): number
        {
            return a.id() - b.id();
        }

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
            strength: number = Strength.required )
        {
            this._operator = operator;
            this._expression = expression;
            this._strength = Strength.clip( strength );
        }

        /**
         * Returns the unique id number of the constraint.
         */
        id(): number
        {
            return this._id;
        }

        /**
         * Returns the expression of the constraint.
         */
        expression(): Expression
        {
            return this._expression;
        }

        /**
         * Returns the relational operator of the constraint.
         */
        op(): Operator
        {
            return this._operator;
        }

        /**
         * Returns the strength of the constraint.
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
     */
    var CnId = 0;

}
