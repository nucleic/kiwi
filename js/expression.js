/*-----------------------------------------------------------------------------
| Copyright (c) 2014, Nucleic Development Team.
|
| Distributed under the terms of the Modified BSD License.
|
| The full license is in the file COPYING.txt, distributed with this software.
|----------------------------------------------------------------------------*/
/// <reference path="term.ts"/>
var kiwi;
(function (kiwi) {
    /**
    * An expression of terms and a constant.
    *
    * @class
    */
    var Expression = (function () {
        /**
        * Construct a new Expression.
        */
        function Expression(terms, constant) {
            if (typeof constant === "undefined") { constant = 0.0; }
            this._terms = terms.slice();
            this._constant = constant;
        }
        /**
        * Returns the array of terms in the expression.
        *
        * This *must* be treated as const.
        */
        Expression.prototype.terms = function () {
            return this._terms;
        };

        /**
        * Returns the constant of the expression.
        */
        Expression.prototype.constant = function () {
            return this._constant;
        };

        /**
        * Returns the computed value of the expression.
        */
        Expression.prototype.value = function () {
            var terms = this._terms;
            var result = this._constant;
            for (var i = 0, n = terms.length; i < n; ++i) {
                result += terms[i].value();
            }
            return result;
        };
        return Expression;
    })();
    kiwi.Expression = Expression;
})(kiwi || (kiwi = {}));
