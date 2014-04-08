/*-----------------------------------------------------------------------------
| Copyright (c) 2014, Nucleic Development Team.
|
| Distributed under the terms of the Modified BSD License.
|
| The full license is in the file COPYING.txt, distributed with this software.
|----------------------------------------------------------------------------*/
module kiwi {

    /**
     * The interface which defines a comparitor function.
     */
    export interface IComparitor<T> {
        (first: T, second: T): boolean;
    }


    /**
     * The interface which defines a map pair.
     */
    export interface IPair<T, U> {
        key: T;
        value: U;
    }


    /**
     * The associative map class used by the framework.
     */
    export class Map<T, U> {

        /**
         * Construct a new Map.
         *
         * @param lessThan The less-than comparitor function.
         * @param factory A default value factory function.
         */
        constructor(lessThan: IComparitor<T>, valueFactory: () => U) {
            this._lessThan = lessThan;
            this._valueFactory = valueFactory;
        }

        /**
         * Returns the number of items in the map.
         */
        size(): number {
            return this._data.length;
        }

        /**
         * Returns true if the map is empty.
         */
        empty(): boolean {
            return this._data.length === 0;
        }

        /**
         * Returns the pair associated with the given key.
         *
         * Returns undefined if the key is not present.
         *
         * The key of the returned pair *must not* be modified.
         */
        find(key: T): IPair<T, U> {
            var data = this._data;
            var less = this._lessThan;
            var index = lowerBound(data, key, less);
            if (index === data.length) {
                return undefined;
            }
            var pair = data[index];
            if (less(key, pair.key)) {
                return undefined;
            }
            return pair;
        }

        /**
         * Returns the pair associated with the given key.
         *
         * A new pair is created if the key is not present.
         *
         * The key of the returned pair *must not* be modified.
         */
        get(key: T): IPair<T, U> {
            var pair: IPair<T, U>;
            var data = this._data;
            var less = this._lessThan;
            var index = lowerBound(data, key, less);
            if (index === data.length) {
                pair = { key: key, value: this._valueFactory() };
                data.push(pair);
                return pair;
            }
            var pair = data[index];
            if (less(key, pair.key)) {
                pair = { key: key, value: this._valueFactory() }
                data.splice(index, 0, pair);
                return pair;
            }
            return pair;
        }

        /**
         * Erase the value associated with the given key.
         *
         * Returns true if the key exists and was erased.
         */
        erase(key: T): boolean {
            var data = this._data;
            var less = this._lessThan;
            var index = lowerBound(data, key, less);
            if (index === data.length) {
                return false;
            }
            var pair = data[index];
            if (less(key, pair.key)) {
                return false;
            }
            data.splice(index, 1);
            return true;
        }

        /**
         * Get a copy of the items in the map.
         */
        items(): IPair<T, U>[] {
            var data = this._data;
            var result: IPair<T, U>[] = [];
            for (var i = 0, n = data.length; i < n; ++i) {
                var pair = data[i];
                result.push({ key: pair.key, value: pair.value });
            }
            return result;
        }

        /**
         * Clear the contents of the map.
         */
        clear(): void {
            this._data = [];
        }

        private _lessThan: IComparitor<T>;
        private _valueFactory: () => U;
        private _data: IPair<T, U>[] = [];
    }


    /**
     * The internal binary search function for the map.
     */
    function lowerBound<T, U>(array: IPair<T, U>[], key: T, less: IComparitor<T>): number {
        var begin = 0;
        var n = array.length;
        var half: number;
        var middle: number;
        while (n > 0) {
            half = n >> 1;
            middle = begin + half;
            if (less(array[middle].key, key)) {
                begin = middle + 1;
                n -= half + 1;
            } else {
                n = half;
            }
        }
        return begin;
    }

}
