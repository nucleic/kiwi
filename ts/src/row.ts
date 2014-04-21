/*-----------------------------------------------------------------------------
| Copyright (c) 2014, Nucleic Development Team.
|
| Distributed under the terms of the Modified BSD License.
|
| The full license is in the file COPYING.txt, distributed with this software.
|----------------------------------------------------------------------------*/

/// <reference path="maptype.ts"/>
/// <reference path="symbol.ts"/>
/// <reference path="util.ts"/>

module kiwi
{

    /**
     * An internal row class used by the solver.
     *
     * This class is an implementation detail. It should not be
     * used directly by user code.
     *
     * @class
     */
    export
    class Row
    {
        /**
         * Construct a new Row.
         */
        constructor( constant: number = 0.0 )
        {
            this._constant = constant;
        }

        /**
         * Returns the mapping of symbols to coefficients.
         */
        cells(): IMap<Symbol, number>
        {
            return this._cellMap;
        }

        /**
         * Returns the constant for the row.
         */
        constant(): number
        {
            return this._constant;
        }

        /**
         * Returns true if the row is a constant value.
         */
        isConstant(): boolean
        {
            return this._cellMap.empty();
        }

        /**
         * Returns true if the Row has all dummy symbols.
         */
        allDummies(): boolean
        {
            var cells = this._cellMap;
            for( var i = 0, n = cells.size(); i < n; ++i )
            {
                var pair = cells.itemAt( i );
                if( pair.first.type() !== SymbolType.Dummy )
                {
                    return false;
                }
            }
            return true;
        }

        /**
         * Create a copy of the row.
         */
        copy(): Row
        {
            var theCopy = new Row( this._constant );
            theCopy._cellMap = this._cellMap.copy();
            return theCopy;
        }

        /**
         * Add a constant value to the row constant.
         *
         * Returns the new value of the constant.
         */
        add( value: number ): number
        {
            return this._constant += value;
        }

        /**
         * Insert the symbol into the row with the given coefficient.
         *
         * If the symbol already exists in the row, the coefficient
         * will be added to the existing coefficient. If the resulting
         * coefficient is zero, the symbol will be removed from the row.
         */
        insertSymbol( symbol: Symbol, coefficient: number = 1.0 ): void
        {
            var pair = this._cellMap.setDefault( symbol, () => 0.0 );
            if( nearZero( pair.second += coefficient ) )
            {
                this._cellMap.erase( symbol );
            }
        }

        /**
         * Insert a row into this row with a given coefficient.
         *
         * The constant and the cells of the other row will be
         * multiplied by the coefficient and added to this row. Any
         * cell with a resulting coefficient of zero will be removed
         * from the row.
         */
        insertRow( other: Row, coefficient: number = 1.0 ): void
        {
            this._constant += other._constant * coefficient;
            var cells = other._cellMap;
            for( var i = 0, n = cells.size(); i < n; ++i )
            {
                var pair = cells.itemAt( i );
                this.insertSymbol( pair.first, pair.second * coefficient );
            }
        }

        /**
         * Remove a symbol from the row.
         */
        removeSymbol( symbol: Symbol ): void
        {
            this._cellMap.erase( symbol );
        }

        /**
         * Reverse the sign of the constant and cells in the row.
         */
        reverseSign(): void
        {
            this._constant = -this._constant;
            var cells = this._cellMap;
            for( var i = 0, n = cells.size(); i < n; ++i )
            {
                var pair = cells.itemAt( i );
                pair.second = -pair.second;
            }
        }

        /**
         * Solve the row for the given symbol.
         *
         * This method assumes the row is of the form
         * a * x + b * y + c = 0 and (assuming solve for x) will modify
         * the row to represent the right hand side of
         * x = -b/a * y - c / a. The target symbol will be removed from
         * the row, and the constant and other cells will be multiplied
         * by the negative inverse of the target coefficient.
         *
         * The given symbol *must* exist in the row.
         */
        solveFor( symbol: Symbol ): void
        {
            var cells = this._cellMap;
            var pair = cells.erase( symbol );
            var coeff = -1.0 / pair.second;
            this._constant *= coeff;
            for( var i = 0, n = cells.size(); i < n; ++i )
            {
                cells.itemAt( i ).second *= coeff;
            }
        }

        /**
         * Solve the row for the given symbols.
         *
         * This method assumes the row is of the form
         * x = b * y + c and will solve the row such that
         * y = x / b - c / b. The rhs symbol will be removed from the
         * row, the lhs added, and the result divided by the negative
         * inverse of the rhs coefficient.
         *
         * The lhs symbol *must not* exist in the row, and the rhs
         * symbol must* exist in the row.
         */
        solveForEx( lhs: Symbol, rhs: Symbol ): void
        {
            this.insertSymbol( lhs, -1.0 );
            this.solveFor( rhs );
        }

        /**
         * Returns the coefficient for the given symbol.
         */
        coefficientFor( symbol: Symbol ): number
        {
            var pair = this._cellMap.find( symbol );
            return pair !== undefined ? pair.second : 0.0;
        }

        /**
         * Substitute a symbol with the data from another row.
         *
         * Given a row of the form a * x + b and a substitution of the
         * form x = 3 * y + c the row will be updated to reflect the
         * expression 3 * a * y + a * c + b.
         *
         * If the symbol does not exist in the row, this is a no-op.
         */
        substitute( symbol: Symbol, row: Row ): void
        {
            var pair = this._cellMap.erase( symbol );
            if( pair !== undefined )
            {
                this.insertRow( row, pair.second );
            }
        }

        private _cellMap = createMap<Symbol, number>( Symbol.Compare );
        private _constant: number;
    }

}
