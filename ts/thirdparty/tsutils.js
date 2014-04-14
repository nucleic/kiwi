/*-----------------------------------------------------------------------------
| Copyright (c) 2014, Nucleic Development Team.
|
| Distributed under the terms of the Modified BSD License.
|
| The full license is in the file COPYING.txt, distributed with this software.
|----------------------------------------------------------------------------*/
var tsutils;
(function (tsutils) {
    /**
    * A function which performs a binary search on a sorted array.
    *
    * @param array The array of sorted items to search.
    * @param value The value to located in the array.
    * @param compare The value comparison function.
    * @returns The index of the first element in the array which
    *          compares greater than or equal to the given value.
    */
    function lowerBound(array, value, compare) {
        var begin = 0;
        var n = array.length;
        var half;
        var middle;
        while (n > 0) {
            half = n >> 1;
            middle = begin + half;
            if (compare(array[middle], value) < 0) {
                begin = middle + 1;
                n -= half + 1;
            } else {
                n = half;
            }
        }
        return begin;
    }
    tsutils.lowerBound = lowerBound;

    /**
    * A function which performs a binary search on a sorted array.
    *
    * @param array The array of sorted items to search.
    * @param value The value to located in the array.
    * @param compare The value comparison function.
    * @returns The index of the found item, or -1.
    */
    function binarySearch(array, value, compare) {
        var index = lowerBound(array, value, compare);
        if (index === array.length) {
            return -1;
        }
        var item = array[index];
        if (compare(item, value) !== 0) {
            return -1;
        }
        return index;
    }
    tsutils.binarySearch = binarySearch;

    /**
    * A function which performs a binary search on a sorted array.
    *
    * @param array The array of sorted items to search.
    * @param value The value to located in the array.
    * @param compare The value comparison function.
    * @returns The found item in the array, or undefined.
    */
    function binaryFind(array, value, compare) {
        var index = lowerBound(array, value, compare);
        if (index === array.length) {
            return undefined;
        }
        var item = array[index];
        if (compare(item, value) !== 0) {
            return undefined;
        }
        return item;
    }
    tsutils.binaryFind = binaryFind;
})(tsutils || (tsutils = {}));
/*-----------------------------------------------------------------------------
| Copyright (c) 2013, Nucleic Development Team.
|
| Distributed under the terms of the Modified BSD License.
|
| The full license is in the file COPYING.txt, distributed with this software.
|----------------------------------------------------------------------------*/
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
        * @param compare The key comparison function.
        */
        function AssocArray(compare) {
            this._array = [];
            this._compare = wrapCompare(compare);
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
        * Returns a copy of the associative array.
        */
        AssocArray.prototype.copy = function () {
            var clone = new AssocArray(null);
            clone._compare = this._compare; // < ^ == less than ideal
            var array = this._array;
            var cloneArray = clone._array;
            for (var i = 0, n = array.length; i < n; ++i) {
                var item = array[i];
                var pair = { first: item.first, second: item.second };
                cloneArray.push(pair);
            }
            return clone;
        };

        /**
        * Returns the pair associated with the given key or undefined
        * if the key is not present in the map.
        *
        * @param key The key to locate in the map.
        */
        AssocArray.prototype.find = function (key) {
            return tsutils.binaryFind(this._array, key, this._compare);
        };

        /**
        * Returns the pair associated with the key if it exists, or
        * creates and inserts a new pair with a value created by the
        * given factory.
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
            var item = array[index];
            if (this._compare(item, key) !== 0) {
                var pair = { first: key, second: factory() };
                array.splice(index, 0, pair);
                return pair;
            }
            return item;
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
            var index = tsutils.lowerBound(array, key, this._compare);
            if (index === array.length) {
                var pair = { first: key, second: value };
                array.push(pair);
                return pair;
            }
            var item = array[index];
            if (this._compare(item, key) !== 0) {
                var pair = { first: key, second: value };
                array.splice(index, 0, pair);
                return pair;
            }
            item.second = value;
            return item;
        };

        /**
        * Remove and return the pair associated with the given key
        * or undefined if the key is not present in the map.
        *
        * @param key The key to remove from the map.
        */
        AssocArray.prototype.erase = function (key) {
            var array = this._array;
            var index = tsutils.binarySearch(array, key, this._compare);
            if (index < 0) {
                return undefined;
            }
            return array.splice(index, 1)[0];
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
    * The internal wrapped compare function factory.
    */
    function wrapCompare(cmp) {
        function wrapped(pair, value) {
            return cmp(pair.first, value);
        }
        return wrapped;
    }

    /**
    * The internal IMapIterator implementation.
    */
    var AssocArrayIterator = (function () {
        /**
        * Construct a new AssocArrayIterator.
        *
        * @param array The array of map item pairs.
        */
        function AssocArrayIterator(array) {
            this._index = 0;
            this._array = array;
        }
        /**
        * Returns consecutive pairs from the map until the pairs are
        * exhausted, then returns undefined.
        */
        AssocArrayIterator.prototype.next = function () {
            return this._array[this._index++];
        };
        return AssocArrayIterator;
    })();
})(tsutils || (tsutils = {}));
/*-----------------------------------------------------------------------------
| Copyright (c) 2014, Nucleic Development Team.
|
| Distributed under the terms of the Modified BSD License.
|
| The full license is in the file COPYING.txt, distributed with this software.
|----------------------------------------------------------------------------*/
/// <reference path="i_compare.ts"/>
/// <reference path="i_factory.ts"/>
/// <reference path="i_pair.ts"/>
/// <reference path="i_map.ts"/>
/// <reference path="binary_search.ts"/>
/// <reference path="assoc_array.ts"/>
