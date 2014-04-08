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
    * The associative map class used by the framework.
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
        };

        /**
        * Returns the pair associated with the given key.
        *
        * A new pair is created if the key is not present.
        *
        * The key of the returned pair *must not* be modified.
        */
        Map.prototype.get = function (key) {
            var pair;
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
                pair = { key: key, value: this._valueFactory() };
                data.splice(index, 0, pair);
                return pair;
            }
            return pair;
        };

        /**
        * Erase the value associated with the given key.
        *
        * Returns true if the key exists and was erased.
        */
        Map.prototype.erase = function (key) {
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
        };

        /**
        * Get a copy of the items in the map.
        */
        Map.prototype.items = function () {
            var data = this._data;
            var result = [];
            for (var i = 0, n = data.length; i < n; ++i) {
                var pair = data[i];
                result.push({ key: pair.key, value: pair.value });
            }
            return result;
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
    * The internal binary search function for the map.
    */
    function lowerBound(array, key, less) {
        var begin = 0;
        var n = array.length;
        var half;
        var middle;
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
})(kiwi || (kiwi = {}));
