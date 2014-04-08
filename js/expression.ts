/*-----------------------------------------------------------------------------
| Copyright (c) 2014, Nucleic Development Team.
|
| Distributed under the terms of the Modified BSD License.
|
| The full license is in the file COPYING.txt, distributed with this software.
|----------------------------------------------------------------------------*/
module kiwi {

    /**
     * An expression of terms and a constant.
     *
     * @class
     */
    export class Expression {

        /**
         * Construct a new Expression.
         */
        constructor(terms: Term[], constant: number = 0.0) {
            this._terms = terms.slice();
            this._constant = constant;
        }

        /**
         * Returns a copy of the terms in the expression.
         */
        terms(): Term[] {
            return this._terms.slice();
        }

        /**
         * Returns the constant of the expression.
         */
        constant(): number {
            return this._constant;
        }

        /**
         * Returns the computed value of the expression.
         */
        value(): number {
            var terms = this._terms;
            var result = this._constant;
            for (var i = 0, n = terms.length; i < n; ++i) {
                result += terms[i].value();
            }
            return result;
        }

        private _terms: Term[];
        private _constant: number;
    }

}
