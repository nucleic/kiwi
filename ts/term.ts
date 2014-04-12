/*-----------------------------------------------------------------------------
| Copyright (c) 2014, Nucleic Development Team.
|
| Distributed under the terms of the Modified BSD License.
|
| The full license is in the file COPYING.txt, distributed with this software.
|----------------------------------------------------------------------------*/

/// <reference path="variable.ts"/>

module kiwi {

    /**
     * A term in a constraint expression.
     *
     * @class
     */
    export class Term {

        /**
         * Construct a new Term.
         *
         * @param variable The variable of the term.
         * @param [coefficient] The coefficient of the term.
         */
        constructor(variable: Variable, coefficient: number = 1.0) {
            this._variable = variable;
            this._coefficient = coefficient;
        }

        /**
         * Returns the variable of the term.
         */
        variable(): Variable {
            return this._variable;
        }

        /**
         * Returns the coefficient of the term.
         */
        coefficient(): number {
            return this._coefficient;
        }

        /**
         * Returns the computed value of the term.
         */
        value(): number {
            return this._coefficient * this._variable.value();
        }

        private _variable: Variable;
        private _coefficient: number;
    }

}
