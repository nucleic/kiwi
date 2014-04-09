/*-----------------------------------------------------------------------------
| Copyright (c) 2014, Nucleic Development Team.
|
| Distributed under the terms of the Modified BSD License.
|
| The full license is in the file COPYING.txt, distributed with this software.
|----------------------------------------------------------------------------*/
/// <reference path="variable.ts"/>
var kiwi;
(function (kiwi) {
    /**
    * A term in a constraint expression.
    *
    * @class
    */
    var Term = (function () {
        /**
        * Construct a new Term.
        *
        * @param variable The variable of the term.
        * @param [coefficient] The coefficient of the term.
        */
        function Term(variable, coefficient) {
            if (typeof coefficient === "undefined") { coefficient = 1.0; }
            this._variable = variable;
            this._coefficient = coefficient;
        }
        /**
        * Returns the variable of the term.
        */
        Term.prototype.variable = function () {
            return this._variable;
        };

        /**
        * Returns the coefficient of the term.
        */
        Term.prototype.coefficient = function () {
            return this._coefficient;
        };

        /**
        * Returns the computed value of the term.
        */
        Term.prototype.value = function () {
            return this._coefficient * this._variable.value();
        };
        return Term;
    })();
    kiwi.Term = Term;
})(kiwi || (kiwi = {}));
