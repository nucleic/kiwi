declare module tsutils {
    /**
    * An interface defining a binary comparison function.
    *
    * Returns:
    *   - zero if first = second
    *   - negative if first < second
    *   - positive if first > second.
    */
    interface ICompare<T, U> {
        (first: T, second: U): number;
    }
}
declare module tsutils {
    /**
    * An interface for defining factory functions.
    */
    interface IFactory<T> {
        (): T;
    }
}
declare module tsutils {
    /**
    * An interface which defines a generic container pair.
    */
    interface IPair<T, U> {
        first: T;
        second: U;
    }
}
declare module tsutils {
    /**
    * An interface defining a map iterator.
    */
    interface IMapIterator<T, U> {
        /**
        * Returns consecutive pairs from the map until the
        * pairs are exhausted, then returns undefined.
        */
        next(): IPair<T, U>;
    }
    /**
    * An interface defining an associative mapping container.
    *
    * The key values of the map pairs must always be treated
    * as "const" in order guarantee integrity of the map.
    */
    interface IMap<T, U> {
        /**
        * Returns the number of items in the map.
        */
        size(): number;
        /**
        * Returns true if the map is empty.
        */
        empty(): boolean;
        /**
        * Returns a copy of the map.
        */
        copy(): IMap<T, U>;
        /**
        * Returns the pair associated with the given key or
        * undefined if the key is not present in the map.
        *
        * @param key The key to locate in the map.
        */
        find(key: T): IPair<T, U>;
        /**
        * Returns the pair associated with the key if it exists,
        * or creates and inserts a new pair with a value created
        * by the given factory.
        *
        * @param key The key to locate in the map.
        * @param factory The function which creates the default value.
        */
        setDefault(key: T, factory: IFactory<U>): IPair<T, U>;
        /**
        * Insert the pair into the map and return the pair.
        *
        * This will overwrite any existing entry in the map.
        *
        * @param key The key portion of the pair.
        * @param value The value portion of the pair.
        */
        insert(key: T, value: U): IPair<T, U>;
        /**
        * Remove and return the pair associated with the given key
        * or undefined if the key is not present in the map.
        *
        * @param key The key to remove from the map.
        */
        erase(key: T): IPair<T, U>;
        /**
        * Clear the internal contents of map.
        *
        * The size of the map will be zero after clearing.
        */
        clear(): void;
        /**
        * Returns an iterator to the pairs in the map.
        */
        iter(): IMapIterator<T, U>;
    }
}
declare module tsutils {
    /**
    * A function which performs a binary search on a sorted array.
    *
    * @param array The array of sorted items to search.
    * @param value The value to located in the array.
    * @param compare The value comparison function.
    * @returns The index of the first element in the array which
    *          compares greater than or equal to the given value.
    */
    function lowerBound<T, U>(array: T[], value: U, compare: ICompare<T, U>): number;
    /**
    * A function which performs a binary search on a sorted array.
    *
    * @param array The array of sorted items to search.
    * @param value The value to located in the array.
    * @param compare The value comparison function.
    * @returns The index of the found item, or -1.
    */
    function binarySearch<T, U>(array: T[], value: U, compare: ICompare<T, U>): number;
    /**
    * A function which performs a binary search on a sorted array.
    *
    * @param array The array of sorted items to search.
    * @param value The value to located in the array.
    * @param compare The value comparison function.
    * @returns The found item in the array, or undefined.
    */
    function binaryFind<T, U>(array: T[], value: U, compare: ICompare<T, U>): T;
}
declare module tsutils {
    /**
    * A mapping container built on a sorted array.
    *
    * @class
    */
    class AssocArray<T, U> implements IMap<T, U> {
        /**
        * Construct a new AssocArray.
        *
        * @param compare The key comparison function.
        */
        constructor(compare: ICompare<T, T>);
        /**
        * Returns the number of items in the array.
        */
        public size(): number;
        /**
        * Returns true if the array is empty.
        */
        public empty(): boolean;
        /**
        * Returns a copy of the associative array.
        */
        public copy(): AssocArray<T, U>;
        /**
        * Returns the pair associated with the given key or undefined
        * if the key is not present in the map.
        *
        * @param key The key to locate in the map.
        */
        public find(key: T): IPair<T, U>;
        /**
        * Returns the pair associated with the key if it exists, or
        * creates and inserts a new pair with a value created by the
        * given factory.
        *
        * @param key The key to locate in the map.
        * @param factory The function which creates the default value.
        */
        public setDefault(key: T, factory: IFactory<U>): IPair<T, U>;
        /**
        * Insert the pair into the map and return the pair.
        *
        * This will overwrite any existing entry in the map.
        *
        * @param key The key portion of the pair.
        * @param value The value portion of the pair.
        */
        public insert(key: T, value: U): IPair<T, U>;
        /**
        * Remove and return the pair associated with the given key
        * or undefined if the key is not present in the map.
        *
        * @param key The key to remove from the map.
        */
        public erase(key: T): IPair<T, U>;
        /**
        * Clear the internal contents of map.
        *
        * The size of the map will be zero after clearing.
        */
        public clear(): void;
        /**
        * Returns an iterator to the pairs in the map.
        */
        public iter(): IMapIterator<T, U>;
        private _compare;
        private _array;
    }
}
declare module tsutils {
}
