import { describe, it, expect } from 'vitest';
import { 
    empty, get, set, setValue, setContainer, updateValue, removeValue, removePath, has, toValue, happensBefore, mergeClocks 
} from './trie';

describe('Trie', () => {
    it('should create empty trie', () => {
        const trie = empty();
        expect(toValue(trie)).toBeUndefined();
        expect(has([], trie)).toBe(false);
    });

    it('should get and set values', () => {
        const trie1 = empty();
        const path = ['a', 'b', 'c'];
        const trie2 = set(path, 42, trie1);
        const node = get(path, trie2);
        
        expect(node).toBeDefined();
        expect(toValue(node)).toBe(42);
        expect(toValue(trie2)).toStrictEqual({a:{b:{c:42}}});
        expect(toValue(get(path, trie1))).toBeUndefined(); // Original unchanged
    });

    it('should handle multiple paths', () => {
        const trie1 = empty();
        const trie2 = set(['a', 'b'], 1, trie1);
        const trie3 = set(['a', 'c'], 2, trie2);
        
        expect(toValue(get(['a', 'b'], trie3))).toBe(1);
        expect(toValue(get(['a', 'c'], trie3))).toBe(2);
        expect(get(['a', 'c'], trie2)).toBeUndefined(); // Original unchanged
    });

    it('should handle removeValue and removePath differently', () => {
        const trie1 = empty();
        const trie2 = set(['a', 'b'], 1, trie1);
        const trie3 = set(['a', 'c'], 2, trie2);
        
        // removeValue leaves empty structure
        const trieAfterValue = removeValue(['a', 'b'], trie3);
        expect(toValue(trieAfterValue)).toStrictEqual({a:{c:2, b: undefined}}); // c value remains
        expect(get(['a', 'b'], trieAfterValue)).toBeDefined(); // path exists
        expect(toValue(get(['a', 'b'], trieAfterValue))).toBeUndefined(); // but no value
        
        // removePath cleans up empty branches
        const trieAfterPath = removePath(['a', 'b'], trie3);
        expect(toValue(trieAfterPath)).toStrictEqual({a:{c:2}}); // c value remains
        expect(get(['a', 'b'], trieAfterPath)).toBeUndefined(); // path is gone
        
        // removing last value in a branch
        const trieAfterLastValue = removeValue(['a', 'c'], trieAfterValue);
        expect(toValue(trieAfterLastValue)).toStrictEqual({a:{}}); // empty structure remains
        
        const trieAfterLastPath = removePath(['a', 'c'], trieAfterPath);
        expect(toValue(trieAfterLastPath)).toBeUndefined(); // everything is cleaned up
    });

    it('should automatically handle arrays', () => {
        const trie1 = empty();
        const array = [1, 2, [3, 4], 5];
        const trie2 = set(['data'], array, trie1);
        const dataTrie = get(['data'], trie2);
        
        expect(toValue(dataTrie)).toStrictEqual(array);
        expect(get(['data'], trie1)).toBeUndefined();
        
        // We can also access individual elements
        expect(toValue(get(['data', '0'], trie2))).toBe(1);
        expect(toValue(get(['data', '2', '0'], trie2))).toBe(3);
    });

    it('should automatically handle objects', () => {
        const trie1 = empty();
        const obj = {
            name: 'test',
            nested: {
                value: 42,
                array: [1, 2, 3]
            }
        };
        const trie2 = set(['data'], obj, trie1);
        
        expect(toValue(get(['data'], trie2))).toStrictEqual(obj);
        expect(toValue(get(['data', 'name'], trie2))).toBe('test');
        expect(toValue(get(['data', 'nested', 'value'], trie2))).toBe(42);
        expect(toValue(get(['data', 'nested', 'array', '1'], trie2))).toBe(2);
    });

    it('should handle mixed nested structures', () => {
        const trie1 = empty();
        const complex = {
            array: [1, { x: 2 }, [3, { y: 4 }]],
            map: {
                a: [1, 2],
                b: { c: 3 }
            }
        };
        const trie2 = set(['data'], complex, trie1);
        
        expect(toValue(get(['data'], trie2))).toStrictEqual(complex);
        expect(toValue(get(['data', 'array', '1', 'x'], trie2))).toBe(2);
        expect(toValue(get(['data', 'array', '2', '1', 'y'], trie2))).toBe(4);
        expect(toValue(get(['data', 'map', 'a', '0'], trie2))).toBe(1);
        expect(toValue(get(['data', 'map', 'b', 'c'], trie2))).toBe(3);
    });

    it('should maintain immutability with structured data', () => {
        const trie1 = empty();
        const data = { array: [1, 2, 3], value: 42 };
        const trie2 = set(['data'], data, trie1);
        const trie3 = set(['data', 'array', '1'], 99, trie2);
        
        expect(toValue(get(['data'], trie2))).toStrictEqual(data);  // Original structure unchanged
        expect(toValue(get(['data', 'array'], trie3))).toStrictEqual([1, 99, 3]);  // New structure with modification
        expect(toValue(get(['data', 'value'], trie3))).toBe(42);  // Rest of structure preserved
    });

    it('should handle empty arrays and objects', () => {
        const trie1 = empty();
        const trie2 = set(['a'], [], trie1);
        const trie3 = set(['b'], {}, trie1);
        
        expect(toValue(get(['a'], trie2))).toStrictEqual([]);
        expect(toValue(get(['b'], trie3))).toStrictEqual({});
    });

    it('should handle immutable values', () => {
        const trie1 = empty();
        const trie2 = setValue(['temperature'], 72, trie1);
        
        // Value is immutable
        expect(toValue(get(['temperature'], trie2))).toBe(72);
        expect(toValue(get(['temperature'], trie1))).toBeUndefined();
    });

    it('should handle mutable containers with versioning', () => {
        const trie1 = empty();
        const nodeId = 'sensor1';
        
        // Create container
        const trie2 = setContainer(['temperature'], 72, nodeId, trie1);
        const temp1 = get(['temperature'], trie2);
        expect(temp1?.nodeType.type).toBe('container');
        expect(toValue(temp1)).toBe(72);
        
        // Update container
        const trie3 = updateValue(['temperature'], 73, nodeId, trie2);
        const temp2 = get(['temperature'], trie3);
        expect(temp2?.nodeType.type).toBe('container');
        expect(toValue(temp2)).toBe(73);
        
        // Original container unchanged
        expect(toValue(get(['temperature'], trie2))).toBe(72);
    });

    it('should track causality with vector clocks', () => {
        const trie1 = empty();
        const sensor1 = 'sensor1';
        const sensor2 = 'sensor2';
        
        // Two sensors update temperature
        const trie2 = setContainer(['temperature'], 72, sensor1, trie1);
        const trie3 = updateValue(['temperature'], 73, sensor2, trie2);
        
        const temp1 = get(['temperature'], trie2);
        const temp2 = get(['temperature'], trie3);
        
        if (temp1?.nodeType.type !== 'container' || temp2?.nodeType.type !== 'container') {
            throw new Error('Expected container nodes');
        }
        
        // temp1 happens before temp2
        expect(happensBefore(temp1.nodeType.value.version, temp2.nodeType.value.version)).toBe(true);
        expect(happensBefore(temp2.nodeType.value.version, temp1.nodeType.value.version)).toBe(false);
    });

    it('should support nested structures with mixed types', () => {
        const trie1 = empty();
        const nodeId = 'sensor1';
        
        // Immutable config
        const trie2 = setValue(['config'], { units: 'F', name: 'Temp1' }, trie1);
        
        // Mutable readings
        const trie3 = setContainer(['readings', 'current'], 72, nodeId, trie2);
        const trie4 = setContainer(['readings', 'previous'], 71, nodeId, trie3);
        
        expect(toValue(trie4)).toStrictEqual({
            config: { units: 'F', name: 'Temp1' },
            readings: {
                current: 72,
                previous: 71
            }
        });
        
        // Update just the current reading
        const trie5 = updateValue(['readings', 'current'], 73, nodeId, trie4);
        expect(toValue(get(['readings', 'current'], trie5))).toBe(73);
        expect(toValue(get(['readings', 'previous'], trie5))).toBe(71);
        expect(toValue(get(['config'], trie5))).toStrictEqual({ units: 'F', name: 'Temp1' });
    });

    it('should handle vector clock merges', () => {
        const clock1 = { sensor1: 1, sensor2: 2 };
        const clock2 = { sensor2: 3, sensor3: 1 };
        
        const merged = mergeClocks(clock1, clock2);
        expect(merged).toStrictEqual({
            sensor1: 1,
            sensor2: 3,
            sensor3: 1
        });
    });
});
