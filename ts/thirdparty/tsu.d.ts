declare module tsu {
    /**
    * An interface for defining an iterator.
    */
    interface IIterator<T> {
        /**
        * Returns the next item from the iterator or undefined.
        */
        __next__(): T;
        /**
        * Returns this same iterator.
        */
        __iter__(): IIterator<T>;
    }
    /**
    * An interface defining an iterable object.
    */
    interface IIterable<T> {
        /**
        * Returns an iterator over the object contents.
        */
        __iter__(): IIterator<T>;
    }
    /**
    * An interface which defines a reversible object.
    */
    interface IReversible<T> {
        /**
        * Returns a iterator over the reversed object contents.
        */
        __reversed__(): IIterator<T>;
    }
    /**
    * An iterator for an array of items.
    */
    class ArrayIterator<T> implements IIterator<T> {
        constructor(array: T[], index?: number);
        /**
        * Returns the next item from the iterator or undefined.
        */
        public __next__(): T;
        /**
        * Returns this same iterator.
        */
        public __iter__(): ArrayIterator<T>;
        private _array;
        private _index;
    }
    /**
    * A reverse iterator for an array of items.
    */
    class ReverseArrayIterator<T> implements IIterator<T> {
        /**
        * Construct a new ReverseArrayIterator.
        *
        * @param array The array of items to iterate.
        * @param [index] The index at which to start iteration.
        */
        constructor(array: T[], index?: number);
        /**
        * Returns the next item from the iterator or undefined.
        */
        public __next__(): T;
        /**
        * Returns this same iterator.
        */
        public __iter__(): ReverseArrayIterator<T>;
        private _array;
        private _index;
    }
    /**
    * Returns an iterator for the given object.
    *
    * @param object The array or iterable to iterate.
    * @returns An iterator over the given object.
    */
    function iter<T>(object: T[]): ArrayIterator<T>;
    function iter<T>(object: IIterable<T>): IIterator<T>;
    /**
    * Returns a reverse iterator for the given object.
    *
    * @param object The array or iterable to iterate.
    * @returns A reverse iterator over the given object.
    */
    function reversed<T>(object: T[]): ReverseArrayIterator<T>;
    function reversed<T>(object: IReversible<T>): IIterator<T>;
    /**
    * Returns the next value from an iterator, or undefined.
    */
    function next<T>(iterator: IIterator<T>): T;
    /**
    * Execute a function for every item in an iterable.
    *
    * @param object The array or iterable of items.
    * @param callback The function to execute for each item.
    */
    function forEach<T>(object: T[], callback: (value: T) => any): void;
    function forEach<T>(object: IIterable<T>, callback: (value: T) => any): void;
}
declare module tsu {
    /**
    * An interface which defines a binary comparison function.
    *
    * Returns:
    *   - zero if first = second
    *   - negative if first < second
    *   - positive if first > second.
    */
    interface ICompare<T, U> {
        (first: T, second: U): number;
    }
    /**
    * A class which defines a generic pair object.
    */
    class Pair<T, U> {
        public first: T;
        public second: U;
        /**
        * Construct a new Pair object.
        *
        * @param first The first item of the pair.
        * @param second The second item of the pair.
        */
        constructor(first: T, second: U);
        /**
        * Create a copy of the pair.
        */
        public copy(): Pair<T, U>;
    }
}
declare module tsu {
    /**
    * Perform a lower bound search on a sorted array.
    *
    * @param array The array of sorted items to search.
    * @param value The value to located in the array.
    * @param compare The value comparison function.
    * @returns The index of the first element in the array which
    *          compares greater than or equal to the given value.
    */
    function lowerBound<T, U>(array: T[], value: U, compare: ICompare<T, U>): number;
    /**
    * Perform a binary search on a sorted array.
    *
    * @param array The array of sorted items to search.
    * @param value The value to located in the array.
    * @param compare The value comparison function.
    * @returns The index of the found item, or -1.
    */
    function binarySearch<T, U>(array: T[], value: U, compare: ICompare<T, U>): number;
    /**
    * Perform a binary find on a sorted array.
    *
    * @param array The array of sorted items to search.
    * @param value The value to located in the array.
    * @param compare The value comparison function.
    * @returns The found item in the array, or undefined.
    */
    function binaryFind<T, U>(array: T[], value: U, compare: ICompare<T, U>): T;
}
declare module tsu {
    /**
    * A base class for implementing array-based data structures.
    *
    * @class
    */
    class ArrayBase<T> implements IIterable<T>, IReversible<T> {
        /**
        * Returns the number of items in the array.
        */
        public size(): number;
        /**
        * Returns true if the array is empty.
        */
        public empty(): boolean;
        /**
        * Returns the item at the given array index.
        *
        * @param index The integer index of the desired item.
        */
        public itemAt(index: number): T;
        /**
        * Removes and returns the item at the given index.
        *
        * @param index The integer index of the desired item.
        */
        public takeAt(index: number): T;
        /**
        * Clear the internal contents of array.
        */
        public clear(): void;
        /**
        * Swap this array's contents with another array.
        *
        * @param other The array base to use for the swap.
        */
        public swap(other: ArrayBase<T>): void;
        /**
        * Returns an iterator over the array of items.
        */
        public __iter__(): ArrayIterator<T>;
        /**
        * Returns a reverse iterator over the array of items.
        */
        public __reversed__(): ReverseArrayIterator<T>;
        public _array: T[];
    }
}
declare module tsu {
    /**
    * A mapping container build on a sorted array.
    *
    * @class
    */
    class AssociativeArray<T, U> extends ArrayBase<Pair<T, U>> {
        /**
        * Construct a new AssociativeArray.
        *
        * @param compare The key comparison function.
        */
        constructor(compare: ICompare<T, T>);
        /**
        * Returns the key comparison function used by this array.
        */
        public comparitor(): ICompare<T, T>;
        /**
        * Return the array index of the given key, or -1.
        *
        * @param key The key to locate in the array.
        */
        public indexOf(key: T): number;
        /**
        * Returns true if the key is in the array, false otherwise.
        *
        * @param key The key to locate in the array.
        */
        public contains(key: T): boolean;
        /**
        * Returns the pair associated with the given key, or undefined.
        *
        * @param key The key to locate in the array.
        */
        public find(key: T): Pair<T, U>;
        /**
        * Returns the pair associated with the key if it exists.
        *
        * If the key does not exist, a new pair will be created and
        * inserted using the value created by the given factory.
        *
        * @param key The key to locate in the array.
        * @param factory The function which creates the default value.
        */
        public setDefault(key: T, factory: () => U): Pair<T, U>;
        /**
        * Insert the pair into the array and return the pair.
        *
        * This will overwrite any existing entry in the array.
        *
        * @param key The key portion of the pair.
        * @param value The value portion of the pair.
        */
        public insert(key: T, value: U): Pair<T, U>;
        /**
        * Update the array from a collection of pairs.
        *
        * This will overwrite existing entries in the array.
        *
        * @param object The collection of pairs to add.
        */
        public update(object: AssociativeArray<T, U>): void;
        public update(object: IIterable<Pair<T, U>>): void;
        public update(object: Pair<T, U>[]): void;
        /**
        * Removes and returns the pair for the given key, or undefined.
        *
        * @param key The key to remove from the map.
        */
        public erase(key: T): Pair<T, U>;
        /**
        * Create a copy of this associative array.
        */
        public copy(): AssociativeArray<T, U>;
        private _wrapped;
        private _compare;
    }
}
declare module tsu {
}
