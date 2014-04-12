/*-----------------------------------------------------------------------------
| Copyright (c) 2014, Nucleic Development Team.
|
| Distributed under the terms of the Modified BSD License.
|
| The full license is in the file COPYING.txt, distributed with this software.
|----------------------------------------------------------------------------*/
/// <reference path="i_factory.ts"/>
/// <reference path="i_pair.ts"/>
/*-----------------------------------------------------------------------------
| Copyright (c) 2014, Nucleic Development Team.
|
| Distributed under the terms of the Modified BSD License.
|
| The full license is in the file COPYING.txt, distributed with this software.
|----------------------------------------------------------------------------*/
/// <reference path="i_compare.ts"/>
var tsutils;
(function (tsutils) {
    /**
    * A function which performs a binary search on a sorted array.
    *
    * @param array The array of sorted items to search.
    * @param value The value to located in the array.
    * @param lessThan A function which returns true if an item in
    *                 the array compares less than the given value.
    * @returns The index of the first element in the array which
    *          compares greater than or equal to the given value.
    */
    function lowerBound(array, value, lessThan) {
        var begin = 0;
        var n = array.length;
        var half;
        var middle;
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
    tsutils.lowerBound = lowerBound;
})(tsutils || (tsutils = {}));
/*-----------------------------------------------------------------------------
| Copyright (c) 2013, Nucleic Development Team.
|
| Distributed under the terms of the Modified BSD License.
|
| The full license is in the file COPYING.txt, distributed with this software.
|----------------------------------------------------------------------------*/
/// <reference path="i_compare.ts"/>
/// <reference path="i_factory.ts"/>
/// <reference path="i_map.ts"/>
/// <reference path="binary_search.ts"/>
var tsutils;
(function (tsutils) {
    /**
    * A mapping container built on a sorted array.
    *
    * @class
    */
    var AssocArray = (function () {
        /**
        * Construct a new AssocArray.
        *
        * @param lessThan The less-than key comparitor function.
        */
        function AssocArray(lessThan) {
            this._array = [];
            this._lessThan = lessThan;
            this._compare = makeCmp(lessThan);
        }
        /**
        * Returns the number of items in the array.
        */
        AssocArray.prototype.size = function () {
            return this._array.length;
        };

        /**
        * Returns true if the array is empty.
        */
        AssocArray.prototype.empty = function () {
            return this._array.length === 0;
        };

        /**
        * Returns the pair associated with the given key or
        * undefined if the key is not present in the map.
        *
        * @param key The key to locate in the map.
        */
        AssocArray.prototype.find = function (key) {
            var array = this._array;
            var index = tsutils.lowerBound(array, key, this._compare);
            if (index === array.length) {
                return undefined;
            }
            var pair = array[index];
            if (this._lessThan(key, pair.first)) {
                return undefined;
            }
            return pair;
        };

        /**
        * Returns the pair associated with the key if it exists,
        * or creates and inserts a new pair with a value created
        * by the given factory.
        *
        * @param key The key to locate in the map.
        * @param factory The function which creates the default value.
        */
        AssocArray.prototype.setDefault = function (key, factory) {
            var array = this._array;
            var index = tsutils.lowerBound(array, key, this._compare);
            if (index === array.length) {
                var pair = { first: key, second: factory() };
                array.push(pair);
                return pair;
            }
            var pair = array[index];
            if (this._lessThan(key, pair.first)) {
                pair = { first: key, second: factory() };
                array.splice(index, 0, pair);
                return pair;
            }
            return pair;
        };

        /**
        * Insert the pair into the map and return the pair.
        *
        * This will overwrite any existing entry in the map.
        *
        * @param key The key portion of the pair.
        * @param value The value portion of the pair.
        */
        AssocArray.prototype.insert = function (key, value) {
            var array = this._array;
            var pair = { first: key, second: value };
            var index = tsutils.lowerBound(array, key, this._compare);
            array[index] = pair;
            return pair;
        };

        /**
        * Erase the pair associated with the given key.
        *
        * Returns true if the pair exists and was erased.
        */
        AssocArray.prototype.erase = function (key) {
            var array = this._array;
            var index = tsutils.lowerBound(array, key, this._compare);
            if (index === array.length) {
                return false;
            }
            var pair = array[index];
            if (this._lessThan(key, pair.first)) {
                return false;
            }
            array.splice(index, 1);
            return true;
        };

        /**
        * Clear the internal contents of map.
        *
        * The size of the map will be zero after clearing.
        */
        AssocArray.prototype.clear = function () {
            this._array = [];
        };

        /**
        * Returns an iterator to the pairs in the map.
        */
        AssocArray.prototype.iter = function () {
            return new AssocArrayIterator(this._array);
        };
        return AssocArray;
    })();
    tsutils.AssocArray = AssocArray;

    /**
    * The internal compare function factory.
    */
    function makeCmp(keyCmp) {
        function cmp(pair, key) {
            return keyCmp(pair.first, key);
        }
        return cmp;
    }

    /**
    * The internal IMapIterator implementation.
    */
    var AssocArrayIterator = (function () {
        /**
        * Construct a new MapIterator.
        *
        * @param array The array of map item pairs.
        */
        function AssocArrayIterator(array) {
            this._index = 0;
            this._array = array;
        }
        /**
        * Returns consecutive pairs from the map until the
        * pairs are exhausted, then returns undefined.
        */
        AssocArrayIterator.prototype.next = function () {
            return this._array[this._index++];
        };
        return AssocArrayIterator;
    })();
})(tsutils || (tsutils = {}));
