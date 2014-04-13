/*-----------------------------------------------------------------------------
| Copyright (c) 2014, Nucleic Development Team.
|
| Distributed under the terms of the Modified BSD License.
|
| The full license is in the file COPYING.txt, distributed with this software.
|----------------------------------------------------------------------------*/
module kiwi {

    /**
     * The primary user constraint variable.
     *
     * @class
     */
    export
    class Variable {

        /**
         * A static variable comparison function.
         */
        static Compare(a: Variable, b: Variable): number {
            return a.id() - b.id();
        }

        /**
         * Construct a new Variable
         *
         * @param [name] The name to associated with the variable.
         */
        constructor(name?: string) {
            this._name = name || "";
            this._id = VarId++;
        }

        /**
         * Returns the unique id number of the variable.
         */
        id(): number {
            return this._id;
        }

        /**
         * Returns the name of the variable.
         */
        name(): string {
            return this._name;
        }

        /**
         * Set the name of the variable.
         */
        setName(name: string): void {
            this._name = name;
        }

        /**
         * Returns the user context object of the variable.
         */
        context(): any {
            return this._context;
        }

        /**
         * Set the user context object of the variable.
         */
        setContext(context: any): void {
            this._context = context;
        }

        /**
         * Returns the value of the variable.
         */
        value(): number {
            return this._value;
        }

        /**
         * Set the value of the variable.
         */
        setValue(value: number): void {
            this._value = value;
        }

        /**
         * Returns an expression of the variable plus the value.
         */
        plus(value: number): Expression;
        plus(value: Variable): Expression;
        plus(value: Term): Expression;
        plus(value: Expression): Expression;
        plus(value: any): Expression {
            return new Term(this).plus(value);
        }

        /**
         * Returns an expression of the variable minus the value.
         */
        minus(value: number): Expression;
        minus(value: Variable): Expression;
        minus(value: Term): Expression;
        minus(value: Expression): Expression;
        minus(value: any): Expression {
            return new Term(this).minus(value);
        }

        /**
         * Returns an expression of the variable times the value.
         */
        times(value: number): Expression {
            var term = new Term(this, value);
            return new Expression([term]);
        }

        /**
         * Returns an expression of the variable divided by the value.
         */
        dividedBy(value: number): Expression {
            var term = new Term(this, 1 / value);
            return new Expression([term]);
        }

        private _id: number;
        private _name: string;
        private _value: number = 0.0;
        private _context: any = null;
    }


    /**
     * The internal variable id counter.
     */
    var VarId = 0;

}
