/*-----------------------------------------------------------------------------
| Copyright (c) 2014, Nucleic Development Team.
|
| Distributed under the terms of the Modified BSD License.
|
| The full license is in the file COPYING.txt, distributed with this software.
|----------------------------------------------------------------------------*/
var tsu;
(function (tsu) {

    /**
    * An iterator for an array of items.
    */
    var ArrayIterator = (function () {
        /*
        * Construct a new ArrayIterator.
        *
        * @param array The array of items to iterate.
        * @param [index] The index at which to start iteration.
        */
        function ArrayIterator(array, index) {
            if (typeof index === "undefined") { index = 0; }
            this._array = array;
            this._index = Math.max(0, Math.min(index, array.length));
        }
        /**
        * Returns the next item from the iterator or undefined.
        */
        ArrayIterator.prototype.__next__ = function () {
            return this._array[this._index++];
        };

        /**
        * Returns this same iterator.
        */
        ArrayIterator.prototype.__iter__ = function () {
            return this;
        };
        return ArrayIterator;
    })();
    tsu.ArrayIterator = ArrayIterator;

    /**
    * A reverse iterator for an array of items.
    */
    var ReverseArrayIterator = (function () {
        /**
        * Construct a new ReverseArrayIterator.
        *
        * @param array The array of items to iterate.
        * @param [index] The index at which to start iteration.
        */
        function ReverseArrayIterator(array, index) {
            if (typeof index === "undefined") { index = array.length; }
            this._array = array;
            this._index = Math.max(0, Math.min(index, array.length));
        }
        /**
        * Returns the next item from the iterator or undefined.
        */
        ReverseArrayIterator.prototype.__next__ = function () {
            return this._array[--this._index];
        };

        /**
        * Returns this same iterator.
        */
        ReverseArrayIterator.prototype.__iter__ = function () {
            return this;
        };
        return ReverseArrayIterator;
    })();
    tsu.ReverseArrayIterator = ReverseArrayIterator;

    

    function iter(object) {
        if (object instanceof Array) {
            return new ArrayIterator(object);
        }
        return object.__iter__();
    }
    tsu.iter = iter;

    

    function reversed(object) {
        if (object instanceof Array) {
            return new ReverseArrayIterator(object);
        }
        return object.__reversed__();
    }
    tsu.reversed = reversed;

    /**
    * Returns the next value from an iterator, or undefined.
    */
    function next(iterator) {
        return iterator.__next__();
    }
    tsu.next = next;


    function forEach(object, callback) {
        if (object instanceof Array) {
            for (var i = 0, n = object.length; i < n; ++i) {
                if (callback(object[i]) === false) {
                    return;
                }
            }
        } else {
            var value;
            var it = object.__iter__();
            while ((value = it.__next__()) !== undefined) {
                if (callback(value) === false) {
                    return;
                }
            }
        }
    }
    tsu.forEach = forEach;

})(tsu || (tsu = {}));
/*-----------------------------------------------------------------------------
| Copyright (c) 2014, Nucleic Development Team.
|
| Distributed under the terms of the Modified BSD License.
|
| The full license is in the file COPYING.txt, distributed with this software.
|----------------------------------------------------------------------------*/
var tsu;
(function (tsu) {
    

    /**
    * A class which defines a generic pair object.
    */
    var Pair = (function () {
        /**
        * Construct a new Pair object.
        *
        * @param first The first item of the pair.
        * @param second The second item of the pair.
        */
        function Pair(first, second) {
            this.first = first;
            this.second = second;
        }
        /**
        * Create a copy of the pair.
        */
        Pair.prototype.copy = function () {
            return new Pair(this.first, this.second);
        };
        return Pair;
    })();
    tsu.Pair = Pair;
})(tsu || (tsu = {}));
/*-----------------------------------------------------------------------------
| Copyright (c) 2014, Nucleic Development Team.
|
| Distributed under the terms of the Modified BSD License.
|
| The full license is in the file COPYING.txt, distributed with this software.
|----------------------------------------------------------------------------*/
/// <reference path="iterator.ts"/>
/// <reference path="utility.ts"/>
var tsu;
(function (tsu) {
    /**
    * Perform a lower bound search on a sorted array.
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
    tsu.lowerBound = lowerBound;

    /**
    * Perform a binary search on a sorted array.
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
    tsu.binarySearch = binarySearch;

    /**
    * Perform a binary find on a sorted array.
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
    tsu.binaryFind = binaryFind;

})(tsu || (tsu = {}));
/*-----------------------------------------------------------------------------
| Copyright (c) 2014, Nucleic Development Team.
|
| Distributed under the terms of the Modified BSD License.
|
| The full license is in the file COPYING.txt, distributed with this software.
|----------------------------------------------------------------------------*/
/// <reference path="iterator.ts"/>
var tsu;
(function (tsu) {
    /**
    * A base class for implementing array-based data structures.
    *
    * @class
    */
    var ArrayBase = (function () {
        function ArrayBase() {
            /*
            * The internal data array.
            *
            * @protected
            */
            this._array = [];
        }
        /**
        * Returns the number of items in the array.
        */
        ArrayBase.prototype.size = function () {
            return this._array.length;
        };

        /**
        * Returns true if the array is empty.
        */
        ArrayBase.prototype.empty = function () {
            return this._array.length === 0;
        };

        /**
        * Returns the item at the given array index.
        *
        * @param index The integer index of the desired item.
        */
        ArrayBase.prototype.itemAt = function (index) {
            return this._array[index];
        };

        /**
        * Removes and returns the item at the given index.
        *
        * @param index The integer index of the desired item.
        */
        ArrayBase.prototype.takeAt = function (index) {
            return this._array.splice(index, 1)[0];
        };

        /**
        * Clear the internal contents of array.
        */
        ArrayBase.prototype.clear = function () {
            this._array = [];
        };

        /**
        * Swap this array's contents with another array.
        *
        * @param other The array base to use for the swap.
        */
        ArrayBase.prototype.swap = function (other) {
            var array = this._array;
            this._array = other._array;
            other._array = array;
        };

        /**
        * Returns an iterator over the array of items.
        */
        ArrayBase.prototype.__iter__ = function () {
            return tsu.iter(this._array);
        };

        /**
        * Returns a reverse iterator over the array of items.
        */
        ArrayBase.prototype.__reversed__ = function () {
            return tsu.reversed(this._array);
        };
        return ArrayBase;
    })();
    tsu.ArrayBase = ArrayBase;
})(tsu || (tsu = {}));
/*-----------------------------------------------------------------------------
| Copyright (c) 2014, Nucleic Development Team.
|
| Distributed under the terms of the Modified BSD License.
|
| The full license is in the file COPYING.txt, distributed with this software.
|----------------------------------------------------------------------------*/
var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
/// <reference path="algorithm.ts"/>
/// <reference path="array_base.ts"/>
/// <reference path="iterator.ts"/>
/// <reference path="utility.ts"/>
var tsu;
(function (tsu) {
    /**
    * A mapping container build on a sorted array.
    *
    * @class
    */
    var AssociativeArray = (function (_super) {
        __extends(AssociativeArray, _super);
        /**
        * Construct a new AssociativeArray.
        *
        * @param compare The key comparison function.
        */
        function AssociativeArray(compare) {
            _super.call(this);
            this._compare = compare;
            this._wrapped = wrapCompare(compare);
        }
        /**
        * Returns the key comparison function used by this array.
        */
        AssociativeArray.prototype.comparitor = function () {
            return this._compare;
        };

        /**
        * Return the array index of the given key, or -1.
        *
        * @param key The key to locate in the array.
        */
        AssociativeArray.prototype.indexOf = function (key) {
            return tsu.binarySearch(this._array, key, this._wrapped);
        };

        /**
        * Returns true if the key is in the array, false otherwise.
        *
        * @param key The key to locate in the array.
        */
        AssociativeArray.prototype.contains = function (key) {
            return tsu.binarySearch(this._array, key, this._wrapped) >= 0;
        };

        /**
        * Returns the pair associated with the given key, or undefined.
        *
        * @param key The key to locate in the array.
        */
        AssociativeArray.prototype.find = function (key) {
            return tsu.binaryFind(this._array, key, this._wrapped);
        };

        /**
        * Returns the pair associated with the key if it exists.
        *
        * If the key does not exist, a new pair will be created and
        * inserted using the value created by the given factory.
        *
        * @param key The key to locate in the array.
        * @param factory The function which creates the default value.
        */
        AssociativeArray.prototype.setDefault = function (key, factory) {
            var array = this._array;
            var index = tsu.lowerBound(array, key, this._wrapped);
            if (index === array.length) {
                var pair = new tsu.Pair(key, factory());
                array.push(pair);
                return pair;
            }
            var currPair = array[index];
            if (this._compare(currPair.first, key) !== 0) {
                var pair = new tsu.Pair(key, factory());
                array.splice(index, 0, pair);
                return pair;
            }
            return currPair;
        };

        /**
        * Insert the pair into the array and return the pair.
        *
        * This will overwrite any existing entry in the array.
        *
        * @param key The key portion of the pair.
        * @param value The value portion of the pair.
        */
        AssociativeArray.prototype.insert = function (key, value) {
            var array = this._array;
            var index = tsu.lowerBound(array, key, this._wrapped);
            if (index === array.length) {
                var pair = new tsu.Pair(key, value);
                array.push(pair);
                return pair;
            }
            var currPair = array[index];
            if (this._compare(currPair.first, key) !== 0) {
                var pair = new tsu.Pair(key, value);
                array.splice(index, 0, pair);
                return pair;
            }
            currPair.second = value;
            return currPair;
        };

        AssociativeArray.prototype.update = function (object) {
            var _this = this;
            if (object instanceof AssociativeArray) {
                var obj = object;
                this._array = merge(this._array, obj._array, this._compare);
            } else {
                tsu.forEach(object, function (pair) {
                    _this.insert(pair.first, pair.second);
                });
            }
        };

        /**
        * Removes and returns the pair for the given key, or undefined.
        *
        * @param key The key to remove from the map.
        */
        AssociativeArray.prototype.erase = function (key) {
            var array = this._array;
            var index = tsu.binarySearch(array, key, this._wrapped);
            if (index < 0) {
                return undefined;
            }
            return array.splice(index, 1)[0];
        };

        /**
        * Create a copy of this associative array.
        */
        AssociativeArray.prototype.copy = function () {
            var theCopy = new AssociativeArray(this._compare);
            var copyArray = theCopy._array;
            var thisArray = this._array;
            for (var i = 0, n = thisArray.length; i < n; ++i) {
                copyArray.push(thisArray[i].copy());
            }
            return theCopy;
        };
        return AssociativeArray;
    })(tsu.ArrayBase);
    tsu.AssociativeArray = AssociativeArray;

    /**
    * An internal which wraps a comparison key function.
    */
    function wrapCompare(cmp) {
        return function (pair, value) {
            return cmp(pair.first, value);
        };
    }

    /**
    * An internal function which merges two ordered pair arrays.
    */
    function merge(first, second, compare) {
        var i = 0, j = 0;
        var len1 = first.length;
        var len2 = second.length;
        var merged = [];
        while (i < len1 && j < len2) {
            var a = first[i];
            var b = second[j];
            var v = compare(a.first, b.first);
            if (v < 0) {
                merged.push(a.copy());
                ++i;
            } else if (v > 0) {
                merged.push(b.copy());
                ++j;
            } else {
                merged.push(b.copy());
                ++i;
                ++j;
            }
        }
        while (i < len1) {
            merged.push(first[i].copy());
            ++i;
        }
        while (j < len2) {
            merged.push(second[j].copy());
            ++j;
        }
        return merged;
    }
})(tsu || (tsu = {}));
/*-----------------------------------------------------------------------------
| Copyright (c) 2014, Nucleic Development Team.
|
| Distributed under the terms of the Modified BSD License.
|
| The full license is in the file COPYING.txt, distributed with this software.
|----------------------------------------------------------------------------*/
/// <reference path="algorithm.ts"/>
/// <reference path="array_base.ts"/>
/// <reference path="associative_array.ts"/>
/// <reference path="iterator.ts"/>
/// <reference path="unique_array.ts"/>
/// <reference path="utility.ts"/>
