import { describe, it, expect } from 'vitest';
import { PersistentArray } from './array';

describe('PersistentArray', () => {
    it('should create empty array', () => {
        const arr = PersistentArray.empty<number>();
        expect(arr.size).toBe(0);
        expect([...arr]).toEqual([]);
    });

    it('should create array from iterable', () => {
        const arr = PersistentArray.from([1, 2, 3]);
        expect(arr.size).toBe(3);
        expect([...arr]).toEqual([1, 2, 3]);
    });

    it('should get values by index', () => {
        const arr = PersistentArray.from([1, 2, 3]);
        
        expect(arr.get(0)).toBe(1);
        expect(arr.get(1)).toBe(2);
        expect(arr.get(2)).toBe(3);
        expect(arr.get(3)).toBeUndefined();
        expect(arr.get(-1)).toBeUndefined();
    });

    it('should maintain immutability when setting values', () => {
        const arr1 = PersistentArray.from([1, 2, 3]);
        const arr2 = arr1.set(1, 42);
        
        expect(arr1.get(1)).toBe(2);    // Original unchanged
        expect(arr2.get(1)).toBe(42);   // New array has new value
        expect([...arr1]).toEqual([1, 2, 3]);
        expect([...arr2]).toEqual([1, 42, 3]);
    });

    it('should maintain immutability when appending values', () => {
        const arr1 = PersistentArray.from([1, 2]);
        const arr2 = arr1.append(3);
        
        expect(arr1.size).toBe(2);
        expect(arr2.size).toBe(3);
        expect([...arr1]).toEqual([1, 2]);
        expect([...arr2]).toEqual([1, 2, 3]);
    });

    it('should support immutable transformations', () => {
        const arr1 = PersistentArray.from([1, 2, 3]);
        const arr2 = arr1.map(x => x * 2);
        const arr3 = arr1.filter(x => x > 1);
        
        expect([...arr1]).toEqual([1, 2, 3]);     // Original unchanged
        expect([...arr2]).toEqual([2, 4, 6]);     // New array from map
        expect([...arr3]).toEqual([2, 3]);        // New array from filter
        
        const sum = arr1.reduce((acc, val) => acc + val, 0);
        expect(sum).toBe(6);
    });

    it('should handle sparse arrays', () => {
        const arr1 = PersistentArray.empty<number>();
        const arr2 = arr1.set(2, 42);
        
        expect(arr2.size).toBe(3);
        expect(arr2.get(0)).toBeUndefined();
        expect(arr2.get(1)).toBeUndefined();
        expect(arr2.get(2)).toBe(42);
    });

    it('should support slicing', () => {
        const arr = PersistentArray.from([1, 2, 3, 4, 5]);
        const slice1 = arr.slice(1, 4);
        const slice2 = arr.slice(2);
        const slice3 = arr.slice(0, 2);
        
        expect([...slice1]).toEqual([2, 3, 4]);
        expect([...slice2]).toEqual([3, 4, 5]);
        expect([...slice3]).toEqual([1, 2]);
    });

    it('should maintain separate versions through multiple operations', () => {
        const arr1 = PersistentArray.from([1, 2, 3]);
        const arr2 = arr1.set(1, 42);
        const arr3 = arr2.set(2, 100);
        const arr4 = arr1.append(4);
        
        expect([...arr1]).toEqual([1, 2, 3]);      // Original unchanged
        expect([...arr2]).toEqual([1, 42, 3]);     // After first set
        expect([...arr3]).toEqual([1, 42, 100]);   // After second set
        expect([...arr4]).toEqual([1, 2, 3, 4]);   // Independent append
    });
});
