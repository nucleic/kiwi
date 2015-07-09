/*-----------------------------------------------------------------------------
| Copyright (c) 2014, Nucleic Development Team.
|
| Distributed under the terms of the Modified BSD License.
|
| The full license is in the file COPYING.txt, distributed with this software.
|----------------------------------------------------------------------------*/
module kiwi
{

    /**
     * The primary user constraint variable.
     *
     * @class
     * @param {String} [name=""] The name to associated with the variable.
     */
    export
    class Variable
    {
        constructor(name: string = "") {
            this._name = name;
        }

        /**
         * A static variable comparison function.
         * @private
         */
        static Compare( a: Variable, b: Variable ): number
        {
            return a.id() - b.id();
        }

        /**
         * Returns the unique id number of the variable.
         * @private
         */
        id(): number
        {
            return this._id;
        }

        /**
         * Returns the name of the variable.
         *
         * @return {String} name of the variable
         */
        name(): string
        {
            return this._name;
        }

        /**
         * Set the name of the variable.
         *
         * @param {String} name Name of the variable
         */
        setName( name: string ): void
        {
            this._name = name;
        }

        /**
         * Returns the user context object of the variable.
         * @private
         */
        context(): any
        {
            return this._context;
        }

        /**
         * Set the user context object of the variable.
         * @private
         */
        setContext( context: any ): void
        {
            this._context = context;
        }

        /**
         * Returns the value of the variable.
         *
         * @return {Number} Calculated value
         */
        value(): number
        {
            return this._value;
        }

        /**
         * Set the value of the variable.
         * @private
         */
        setValue( value: number ): void
        {
            this._value = value;
        }

        /**
         * Creates a new Expression by adding a number, variable or expression
         * to the variable.
         *
         * @param {Number|Variable|Expression} value Value to add.
         * @return {Expression} expression
         */
        plus( value: number|Variable|Expression ): Expression
        {
            return new Expression(this, value);
        }

        /**
         * Creates a new Expression by substracting a number, variable or expression
         * from the variable.
         *
         * @param {Number|Variable|Expression} value Value to substract.
         * @return {Expression} expression
         */
        minus( value: number|Variable|Expression ): Expression
        {
            return new Expression(this, typeof value === 'number' ? -value : [-1, value]);
        }

        /**
         * Creates a new Expression by multiplying with a fixed number.
         *
         * @param {Number} coefficient Coefficient to multiply with.
         * @return {Expression} expression
         */
        multiply( coefficient: number ): Expression
        {
            return new Expression([coefficient, this]);
        }

        /**
         * Creates a new Expression by dividing with a fixed number.
         *
         * @param {Number} coefficient Coefficient to divide by.
         * @return {Expression} expression
         */
        divide( coefficient: number ): Expression
        {
            return new Expression([1 / coefficient, this]);
        }

        /**
         * Returns the JSON representation of the variable.
         * @private
         */
        toJSON(): any
        {
            return {
                name: this._name,
                value: this._value
            };
        }

        private _name: string;
        private _value: number = 0.0;
        private _context: any = null;
        private _id: number = VarId++;
    }


    /**
     * The internal variable id counter.
     * @private
     */
    var VarId = 0;

}
