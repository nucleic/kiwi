/*-----------------------------------------------------------------------------
| Copyright (c) 2014, Nucleic Development Team.
|
| Distributed under the terms of the Modified BSD License.
|
| The full license is in the file COPYING.txt, distributed with this software.
|----------------------------------------------------------------------------*/
var kiwi;
(function (kiwi) {
    

    

    

    /**
    * The associative map class used by the solver framework.
    */
    var Map = (function () {
        /**
        * Construct a new Map.
        *
        * @param lessThan The less-than comparitor function.
        * @param factory A default value factory function.
        */
        function Map(lessThan, valueFactory) {
            this._data = [];
            this._lessThan = lessThan;
            this._valueFactory = valueFactory;
            this._comparitor = makeComparitor(lessThan);
        }
        /**
        * Returns the number of items in the map.
        */
        Map.prototype.size = function () {
            return this._data.length;
        };

        /**
        * Returns true if the map is empty.
        */
        Map.prototype.empty = function () {
            return this._data.length === 0;
        };

        /**
        * Returns the pair associated with the given key.
        *
        * Returns undefined if the key is not present.
        *
        * The key of the returned pair *must not* be modified.
        */
        Map.prototype.find = function (key) {
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
        };

        /**
        * Returns the pair associated with the given key.
        *
        * A new pair is created if the key is not present.
        *
        * The key of the returned pair *must not* be modified.
        */
        Map.prototype.get = function (key) {
            var data = this._data;
            var index = lowerBound(data, key, this._comparitor);
            if (index === data.length) {
                var pair = { key: key, value: this._valueFactory() };
                data.push(pair);
                return pair;
            }
            var pair = data[index];
            if (this._lessThan(key, pair.key)) {
                pair = { key: key, value: this._valueFactory() };
                data.splice(index, 0, pair);
                return pair;
            }
            return pair;
        };

        /**
        * Insert a key value pair into the map and return the pair.
        *
        * This will create a new pair or modify an existing pair.
        */
        Map.prototype.insert = function (key, value) {
            var pair = this.get(key);
            pair.value = value;
            return pair;
        };

        /**
        * Erase the value associated with the given key.
        *
        * Returns true if the key exists and was erased.
        */
        Map.prototype.erase = function (key) {
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
        };

        /**
        * Returns an iterator over the items in the map.
        */
        Map.prototype.iter = function () {
            return new MapIterator(this._data);
        };

        /**
        * Clear the contents of the map.
        */
        Map.prototype.clear = function () {
            this._data = [];
        };
        return Map;
    })();
    kiwi.Map = Map;

    /**
    * The internal comparitor creation function.
    */
    function makeComparitor(keyComparitor) {
        function comparitor(pair, key) {
            return keyComparitor(pair.key, key);
        }
        return comparitor;
    }

    /**
    * The internal binary search function for the map.
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

    /**
    * The internal IMapIterator implementation.
    */
    var MapIterator = (function () {
        /**
        * Construct a new MapIterator.
        *
        * @param items The array of map item pairs.
        */
        function MapIterator(items) {
            this._index = 0;
            this._items = items;
        }
        /**
        * Advances the iterator and returns the new pair.
        *
        * Returns undefined when the pairs are exhausted.
        *
        * The key in the pair *must not* be modified.
        */
        MapIterator.prototype.next = function () {
            return this._items[this._index++];
        };
        return MapIterator;
    })();
})(kiwi || (kiwi = {}));
