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
     * An enum defining the available symbol types.
     *
     * This enum is an implementation detail. It should not be
     * used directly by user code.
     */
    export
    enum SymbolType
    {
        Invalid,
        External,
        Slack,
        Error,
        Dummy
    }


    /**
     * A class representing a symbol in the solver.
     *
     * This class is an implementation detail. It should not be
     * used directly by user code.
     *
     * @class
     */
    export
    class Symbol
    {
        /**
         * The static Symbol comparison function.
         */
        static Compare( a: Symbol, b: Symbol ): number
        {
            return a.id() - b.id();
        }

        /**
         * Construct a new Symbol
         *
         * @param [type] The type of the symbol.
         * @param [id] The unique id number of the symbol.
         */
        constructor( type: SymbolType, id: number )
        {
            this._id = id;
            this._type = type;
        }

        /**
         * Returns the unique id number of the symbol.
         */
        id(): number
        {
            return this._id;
        }

        /**
         * Returns the type of the symbol.
         */
        type(): SymbolType
        {
            return this._type;
        }

        private _id: number;
        private _type: SymbolType;
    }

}
