import { Trie } from './trie';

/**
 * A persistent (immutable) array implementation using a trie data structure.
 * All operations return new instances, preserving immutability.
 */
export class PersistentArray<T> {
    private readonly trie: Trie<string, T>;
    private readonly _size: number;

    private constructor(trie: Trie<string, T>, size: number) {
        this.trie = trie;
        this._size = size;
    }

    /**
     * Creates an empty PersistentArray
     */
    static empty<T>(): PersistentArray<T> {
        return new PersistentArray(new Trie(), 0);
    }

    /**
     * Creates a PersistentArray from an iterable
     */
    static from<T>(items: Iterable<T>): PersistentArray<T> {
        let trie = new Trie<string, T>();
        let size = 0;

        for (const item of items) {
            trie = trie.set([size.toString()], item);
            size++;
        }

        return new PersistentArray(trie, size);
    }

    /**
     * Returns the number of elements
     */
    get size(): number {
        return this._size;
    }

    /**
     * Returns the element at the given index, or undefined if not present
     */
    get(index: number): T | undefined {
        if (index < 0 || index >= this._size) {
            return undefined;
        }
        return this.trie.get([index.toString()]);
    }

    /**
     * Returns a new array with the element set at the given index
     */
    set(index: number, value: T): PersistentArray<T> {
        if (index < 0) {
            throw new Error('Index out of bounds');
        }
        const newTrie = this.trie.set([index.toString()], value);
        return new PersistentArray(newTrie, Math.max(this._size, index + 1));
    }

    /**
     * Returns a new array with the element appended
     */
    append(value: T): PersistentArray<T> {
        return this.set(this._size, value);
    }

    /**
     * Returns a new array with elements mapped using the given function
     */
    map<U>(fn: (value: T, index: number) => U): PersistentArray<U> {
        let result = PersistentArray.empty<U>();
        for (let i = 0; i < this._size; i++) {
            const value = this.get(i);
            if (value !== undefined) {
                result = result.set(i, fn(value, i));
            }
        }
        return result;
    }

    /**
     * Returns a new array containing only elements that satisfy the predicate
     */
    filter(predicate: (value: T, index: number) => boolean): PersistentArray<T> {
        let result = PersistentArray.empty<T>();
        let newIndex = 0;

        for (let i = 0; i < this._size; i++) {
            const value = this.get(i);
            if (value !== undefined && predicate(value, i)) {
                result = result.set(newIndex, value);
                newIndex++;
            }
        }

        return result;
    }

    /**
     * Reduces the array to a single value using the given function
     */
    reduce<U>(fn: (acc: U, value: T, index: number) => U, initial: U): U {
        let result = initial;
        for (let i = 0; i < this._size; i++) {
            const value = this.get(i);
            if (value !== undefined) {
                result = fn(result, value, i);
            }
        }
        return result;
    }

    /**
     * Returns a new array with elements between start and end indices
     */
    slice(start: number = 0, end: number = this._size): PersistentArray<T> {
        start = Math.max(0, start);
        end = Math.min(this._size, end);
        
        let result = PersistentArray.empty<T>();
        for (let i = start; i < end; i++) {
            const value = this.get(i);
            if (value !== undefined) {
                result = result.set(i - start, value);
            }
        }
        return result;
    }

    /**
     * Converts to a regular array
     */
    toArray(): T[] {
        const result: T[] = new Array(this._size);
        for (let i = 0; i < this._size; i++) {
            result[i] = this.get(i);
        }
        return result;
    }

    /**
     * Returns an iterator over the array's elements
     */
    [Symbol.iterator](): Iterator<T> {
        let index = 0;
        return {
            next: (): IteratorResult<T> => {
                if (index >= this._size) {
                    return { done: true, value: undefined };
                }
                return {
                    done: false,
                    value: this.get(index++)
                };
            }
        };
    }
}
