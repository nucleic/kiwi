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
    export interface IComparitor<T, U> {
        (first: T, second: U): boolean;
    }


    /**
     * The interface which defines a map pair.
     */
    export interface IPair<T, U> {
        key: T;
        value: U;
    }


    /**
     * The interface which defines a map iterator.
     */
    export interface IMapIterator<T, U> {

        /**
         * Returns the next pair in the map or undefined
         * when the iterator is exhausted.
         *
         * The key in the pair *must not* be modified.
         */
        next(): IPair<T, U>;
    }


    /**
     * The associative map class used by the solver framework.
     */
    export class Map<T, U> {

        /**
         * Construct a new Map.
         *
         * @param lessThan The less-than comparitor function.
         * @param factory A default value factory function.
         */
        constructor(lessThan: IComparitor<T, T>, valueFactory: () => U) {
            this._lessThan = lessThan;
            this._valueFactory = valueFactory;
            this._comparitor = makeComparitor<T, U>(lessThan);
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
            var index = lowerBound(data, key, this._comparitor);
            if (index === data.length) {
                return undefined;
            }
            var pair = data[index];
            if (this._lessThan(key, pair.key)) {
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
            var data = this._data;
            var index = lowerBound(data, key, this._comparitor);
            if (index === data.length) {
                var pair = { key: key, value: this._valueFactory() };
                data.push(pair);
                return pair;
            }
            var pair = data[index];
            if (this._lessThan(key, pair.key)) {
                pair = { key: key, value: this._valueFactory() }
                data.splice(index, 0, pair);
                return pair;
            }
            return pair;
        }

        /**
         * Insert a key value pair into the map and return the pair.
         *
         * This will create a new pair or modify an existing pair.
         */
        insert(key: T, value: U): IPair<T, U> {
            var pair = this.get(key);
            pair.value = value;
            return pair;
        }

        /**
         * Erase the value associated with the given key.
         *
         * Returns true if the key exists and was erased.
         */
        erase(key: T): boolean {
            var data = this._data;
            var index = lowerBound(data, key, this._comparitor);
            if (index === data.length) {
                return false;
            }
            var pair = data[index];
            if (this._lessThan(key, pair.key)) {
                return false;
            }
            data.splice(index, 1);
            return true;
        }

        /**
         * Returns an iterator over the items in the map.
         */
        iter(): IMapIterator<T, U> {
            return new MapIterator(this._data);
        }

        /**
         * Clear the contents of the map.
         */
        clear(): void {
            this._data = [];
        }

        private _lessThan: IComparitor<T, T>;
        private _valueFactory: () => U;
        private _comparitor: IComparitor<IPair<T, U>, T>;
        private _data: IPair<T, U>[] = [];
    }


    /**
     * The internal comparitor creation function.
     */
    function makeComparitor<T, U>(keyComparitor: IComparitor<T, T>): IComparitor<IPair<T, U>, T> {
        function comparitor(pair: IPair<T, U>, key: T): boolean {
            return keyComparitor(pair.key, key);
        }
        return comparitor;
    }


    /**
     * The internal binary search function for the map.
     */
    function lowerBound<T, U>(array: T[], value: U, lessThan: IComparitor<T, U>): number {
        var begin = 0;
        var n = array.length;
        var half: number;
        var middle: number;
        while (n > 0) {
            half = n >> 1;
            middle = begin + half;
            if (lessThan(array[middle], value)) {
                begin = middle + 1;
                n -= half + 1;
            } else {
                n = half;
            }
        }
        return begin;
    }


    /**
     * The internal IMapIterator implementation.
     */
    class MapIterator<T, U> implements IMapIterator<T, U> {

        /**
         * Construct a new MapIterator.
         *
         * @param items The array of map item pairs.
         */
        constructor(items: IPair<T, U>[]) {
            this._items = items;
        }

        /**
         * Advances the iterator and returns the new pair.
         *
         * Returns undefined when the pairs are exhausted.
         *
         * The key in the pair *must not* be modified.
         */
        next(): IPair<T, U> {
            return this._items[this._index++];
        }

        private _items: IPair<T, U>[];
        private _index: number = 0;
    }

}
