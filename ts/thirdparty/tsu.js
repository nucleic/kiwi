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

    

    function asArray(object) {
        if (object instanceof Array) {
            return object.slice();
        }
        var value;
        var array = [];
        var it = object.__iter__();
        while ((value = it.__next__()) !== undefined) {
            array.push(value);
        }
        return array;
    }
    tsu.asArray = asArray;

    

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

    

    function map(object, callback) {
        var result = [];
        if (object instanceof Array) {
            for (var i = 0, n = object.length; i < n; ++i) {
                result.push(callback(object[i]));
            }
        } else {
            var value;
            var it = object.__iter__();
            while ((value = it.__next__()) !== undefined) {
                result.push(callback(value));
            }
        }
        return result;
    }
    tsu.map = map;

    

    function filter(object, callback) {
        var value;
        var result = [];
        if (object instanceof Array) {
            for (var i = 0, n = object.length; i < n; ++i) {
                value = object[i];
                if (callback(value)) {
                    result.push(value);
                }
            }
        } else {
            var it = object.__iter__();
            while ((value = it.__next__()) !== undefined) {
                if (callback(value)) {
                    result.push(value);
                }
            }
        }
        return result;
    }
    tsu.filter = filter;
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

    

    function asSet(items, compare) {
        var array = tsu.asArray(items);
        var n = array.length;
        if (n <= 1) {
            return array;
        }
        array.sort(compare);
        var result = [array[0]];
        for (var i = 1, j = 0; i < n; ++i) {
            var item = array[i];
            if (compare(result[j], item) !== 0) {
                result.push(item);
                ++j;
            }
        }
        return result;
    }
    tsu.asSet = asSet;

    /**
    * Test whether a two sorted arrays sets are disjoint.
    *
    * @param first The first sorted array set.
    * @param second The second sorted array set.
    * @param compare The value comparison function.
    * @returns true if the sets are disjoint, false otherwise.
    */
    function setIsDisjoint(first, second, compare) {
        var i = 0, j = 0;
        var len1 = first.length;
        var len2 = second.length;
        while (i < len1 && j < len2) {
            var v = compare(first[i], second[j]);
            if (v < 0) {
                ++i;
            } else if (v > 0) {
                ++j;
            } else {
                return false;
            }
        }
        return true;
    }
    tsu.setIsDisjoint = setIsDisjoint;

    /**
    * Test whether one sorted array set is the subset of another.
    *
    * @param first The potential subset.
    * @param second The potential superset.
    * @param compare The value comparison function.
    * @returns true if the first set is a subset of the second.
    */
    function setIsSubset(first, second, compare) {
        var len1 = first.length;
        var len2 = second.length;
        if (len1 > len2) {
            return false;
        }
        var i = 0, j = 0;
        while (i < len1 && j < len2) {
            var v = compare(first[i], second[j]);
            if (v < 0) {
                return false;
            } else if (v > 0) {
                ++j;
            } else {
                ++i;
                ++j;
            }
        }
        if (i < len1) {
            return false;
        }
        return true;
    }
    tsu.setIsSubset = setIsSubset;

    /**
    * Create the set union of two sorted set arrays.
    var j = 0;
    *
    * @param first The first sorted array set.
    * @param second The second sorted array set.
    * @param compare The value comparison function.
    * @returns The set union of the two arrays.
    */
    function setUnion(first, second, compare) {
        var i = 0, j = 0;
        var len1 = first.length;
        var len2 = second.length;
        var merged = [];
        while (i < len1 && j < len2) {
            var a = first[i];
            var b = second[j];
            var v = compare(a, b);
            if (v < 0) {
                merged.push(a);
                ++i;
            } else if (v > 0) {
                merged.push(b);
                ++j;
            } else {
                merged.push(a);
                ++i;
                ++j;
            }
        }
        while (i < len1) {
            merged.push(first[i]);
            ++i;
        }
        while (j < len2) {
            merged.push(second[j]);
            ++j;
        }
        return merged;
    }
    tsu.setUnion = setUnion;

    /**
    * Create a set intersection of two sorted set arrays.
    *
    * @param first The first sorted array set.
    * @param second The second sorted array set.
    * @param compare The value comparison function.
    * @returns The set intersection of the two arrays.
    */
    function setIntersection(first, second, compare) {
        var i = 0, j = 0;
        var len1 = first.length;
        var len2 = second.length;
        var merged = [];
        while (i < len1 && j < len2) {
            var a = first[i];
            var b = second[j];
            var v = compare(a, b);
            if (v < 0) {
                ++i;
            } else if (v > 0) {
                ++j;
            } else {
                merged.push(a);
                ++i;
                ++j;
            }
        }
        return merged;
    }
    tsu.setIntersection = setIntersection;

    /**
    * Create a set difference of two sorted set arrays.
    *
    * @param first The first sorted array set.
    * @param second The second sorted array set.
    * @param compare The value comparison function.
    * @returns The set difference of the two arrays.
    */
    function setDifference(first, second, compare) {
        var i = 0, j = 0;
        var len1 = first.length;
        var len2 = second.length;
        var merged = [];
        while (i < len1 && j < len2) {
            var a = first[i];
            var b = second[j];
            var v = compare(a, b);
            if (v < 0) {
                merged.push(a);
                ++i;
            } else if (v > 0) {
                ++j;
            } else {
                ++i;
                ++j;
            }
        }
        while (i < len1) {
            merged.push(first[i]);
            ++i;
        }
        return merged;
    }
    tsu.setDifference = setDifference;

    /**
    * Create a set symmetric difference of two sorted set arrays.
    *
    * @param first The first sorted array set.
    * @param second The second sorted array set.
    * @param compare The value comparison function.
    * @returns The set symmetric difference of the two arrays.
    */
    function setSymmetricDifference(first, second, compare) {
        var i = 0, j = 0;
        var len1 = first.length;
        var len2 = second.length;
        var merged = [];
        while (i < len1 && j < len2) {
            var a = first[i];
            var b = second[j];
            var v = compare(a, b);
            if (v < 0) {
                merged.push(a);
                ++i;
            } else if (v > 0) {
                merged.push(b);
                ++j;
            } else {
                ++i;
                ++j;
            }
        }
        while (i < len1) {
            merged.push(first[i]);
            ++i;
        }
        while (j < len2) {
            merged.push(second[j]);
            ++j;
        }
        return merged;
    }
    tsu.setSymmetricDifference = setSymmetricDifference;
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
/// <reference path="iterator.ts"/>
/// <reference path="utility.ts"/>
var tsu;
(function (tsu) {
    /**
    * A set container built on a sorted array.
    *
    * @class
    */
    var UniqueArray = (function (_super) {
        __extends(UniqueArray, _super);
        /**
        * Construct a new UniqueArray.
        *
        * @param compare The item comparison function.
        */
        function UniqueArray(compare) {
            _super.call(this);
            this._compare = compare;
        }
        /**
        * Returns the comparison function for this array.
        */
        UniqueArray.prototype.comparitor = function () {
            return this._compare;
        };

        /**
        * Return the array index of the given item, or -1.
        *
        * @param item The item to locate in the array.
        */
        UniqueArray.prototype.indexOf = function (item) {
            return tsu.binarySearch(this._array, item, this._compare);
        };

        /**
        * Returns true if the item is in the array, false otherwise.
        *
        * @param item The item to locate in the array.
        */
        UniqueArray.prototype.contains = function (item) {
            return tsu.binarySearch(this._array, item, this._compare) >= 0;
        };

        /**
        * Insert an item into the array.
        *
        * Returns true if the item is new to the set, false otherwise.
        *
        * @param item The item to insert into the array.
        */
        UniqueArray.prototype.insert = function (item) {
            var array = this._array;
            var index = tsu.lowerBound(array, item, this._compare);
            if (index === array.length) {
                array.push(item);
                return true;
            }
            if (this._compare(array[index], item) !== 0) {
                array.splice(index, 0, item);
                return true;
            }
            return false;
        };

        /**
        * Remove an item from the array.
        *
        * Returns true if the item was removed, false otherwise.
        *
        * @param item The item to remove from the array.
        */
        UniqueArray.prototype.erase = function (item) {
            var array = this._array;
            var index = tsu.binarySearch(array, item, this._compare);
            if (index < 0) {
                return false;
            }
            array.splice(index, 1);
            return true;
        };

        /**
        * Create a copy of this unique array.
        */
        UniqueArray.prototype.copy = function () {
            var theCopy = new UniqueArray(this._compare);
            theCopy._array = this._array.slice();
            return theCopy;
        };

        UniqueArray.prototype.isDisjoint = function (object) {
            var cmp = this._compare;
            var other = toSet(object, cmp);
            return tsu.setIsDisjoint(this._array, other, cmp);
        };

        UniqueArray.prototype.isSubset = function (object) {
            var cmp = this._compare;
            var other = toSet(object, cmp);
            return tsu.setIsSubset(this._array, other, cmp);
        };

        UniqueArray.prototype.isSuperset = function (object) {
            var cmp = this._compare;
            var other = toSet(object, cmp);
            return tsu.setIsSubset(other, this._array, cmp);
        };

        UniqueArray.prototype.union = function (object) {
            var cmp = this._compare;
            var res = new UniqueArray(cmp);
            var other = toSet(object, cmp);
            res._array = tsu.setUnion(this._array, other, cmp);
            return res;
        };

        UniqueArray.prototype.intersection = function (object) {
            var cmp = this._compare;
            var res = new UniqueArray(cmp);
            var other = toSet(object, cmp);
            res._array = tsu.setIntersection(this._array, other, cmp);
            return res;
        };

        UniqueArray.prototype.difference = function (object) {
            var cmp = this._compare;
            var res = new UniqueArray(cmp);
            var other = toSet(object, cmp);
            res._array = tsu.setDifference(this._array, other, cmp);
            return res;
        };

        UniqueArray.prototype.symmetricDifference = function (object) {
            var cmp = this._compare;
            var res = new UniqueArray(cmp);
            var other = toSet(object, cmp);
            res._array = tsu.setSymmetricDifference(this._array, other, cmp);
            return res;
        };

        UniqueArray.prototype.unionUpdate = function (object) {
            var cmp = this._compare;
            var other = toSet(object, cmp);
            this._array = tsu.setUnion(this._array, other, cmp);
        };

        UniqueArray.prototype.intersectionUpdate = function (object) {
            var cmp = this._compare;
            var other = toSet(object, cmp);
            this._array = tsu.setIntersection(this._array, other, cmp);
        };

        UniqueArray.prototype.differenceUpdate = function (object) {
            var cmp = this._compare;
            var other = toSet(object, cmp);
            this._array = tsu.setDifference(this._array, other, cmp);
        };

        UniqueArray.prototype.symmetricDifferenceUpdate = function (object) {
            var cmp = this._compare;
            var other = toSet(object, cmp);
            this._array = tsu.setSymmetricDifference(this._array, other, cmp);
        };
        return UniqueArray;
    })(tsu.ArrayBase);
    tsu.UniqueArray = UniqueArray;

    

    function toSet(arg, cmp) {
        if (arg instanceof UniqueArray) {
            return arg._array;
        }
        return tsu.asSet(arg, cmp);
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
