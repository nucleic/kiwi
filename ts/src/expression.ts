/*-----------------------------------------------------------------------------
| Copyright (c) 2014, Nucleic Development Team.
|
| Distributed under the terms of the Modified BSD License.
|
| The full license is in the file COPYING.txt, distributed with this software.
|----------------------------------------------------------------------------*/

/// <reference path="../thirdparty/tsutils.d.ts"/>
/// <reference path="variable.ts"/>

module kiwi {

    /**
     * An expression of terms and a constant.
     *
     * @class
     */
    export
    class Expression {

        /**
         * Construct a new Expression.
         *
         * The constructor accepts an arbitrary number of parameters,
         * each of which must be one of the following types:
         *  - number
         *  - Variable
         *  - 2-tuple of [number, Variable]
         *
         * The parameters are summed. The tuples are multiplied.
         */
        constructor(...args: any[]);
        constructor() {
            var parsed = parseArgs(arguments);
            this._terms = parsed.terms;
            this._constant = parsed.constant;
        }

        /**
         * Returns the mapping of terms in the expression.
         *
         * This *must* be treated as const.
         */
        terms(): tsutils.IMap<Variable, number> {
            return this._terms;
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
            var result = this._constant;
            var iter = this._terms.iter();
            var pair: tsutils.IPair<Variable, number>;
            while (pair = iter.next()) {
                result += pair.first.value() * pair.second;
            }
            return result;
        }

        private _terms: tsutils.IMap<Variable, number>;
        private _constant: number;
    }


    /**
     * An internal interface for argument parse results.
     */
    interface IParseResult {
        terms: tsutils.IMap<Variable, number>;
        constant: number;
    }


    /**
     * The map type used to create the term map.
     */
    var MapType = tsutils.AssocArray;


    /**
     * An internal argument parsing function.
     */
    function parseArgs(args: IArguments): IParseResult {
        var constant = 0.0;
        var factory = () => 0.0;
        var terms = new MapType<Variable, number>(Variable.Compare);
        for (var i = 0, n = args.length; i < n; ++i) {
            var item = args[i];
            if (typeof item === "number") {
                constant += <number>item;
            } else if (item instanceof Variable) {
                terms.setDefault(<Variable>item, factory).second += 1.0;
            } else if (item instanceof Array) {
                if (item.length !== 2) {
                    throw new Error("array must have length 2");
                }
                var value: number = item[0];
                var variable: Variable = item[1];
                if (typeof value !== "number") {
                    throw new Error("array item 0 must be a number");
                }
                if (!(variable instanceof Variable)) {
                    throw new Error("array item 1 must be a variable");
                }
                terms.setDefault(variable, factory).second += value;
            } else {
                throw new Error("invalid Expression argument: " + item);
            }
        }
        return { terms: terms, constant: constant };
    }

}
