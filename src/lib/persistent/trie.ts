/**
 * Vector clock for tracking causality across state changes
 */
export type VectorClock = {
    [nodeId: string]: number;
};

/**
 * A node in the trie can be a value or a branch
 */
export type NodeType = 
    | { type: 'value'; value: any; version: VectorClock }  // Any value with versioning
    | { type: 'branch'; children: Map<string, TrieNode> }; // Structure

export type TrieNode = {
    nodeType: NodeType;
    isLeaf: boolean;
};

export type Trie = TrieNode;

/**
 * A container represents a root state boundary where changes are reconciled
 */
export type Container = {
    root: Trie;
    id: string;  // Unique identifier for this state container
    version: VectorClock;
};

/**
 * Creates a new container with an empty trie
 */
export const createContainer = (id: string): Container => ({
    root: empty(),
    id,
    version: { [id]: 0 }
});

/**
 * Creates an empty trie
 */
export const empty = (): Trie => ({
    nodeType: { type: 'branch', children: new Map() },
    isLeaf: false
});

/**
 * Gets a node from a path in the trie
 */
export const get = (path: string[], trie: Trie): Trie | undefined => {
    let node = trie;
    for (const key of path) {
        if (node.nodeType.type !== 'branch') {
            return undefined;
        }
        const next = node.nodeType.children.get(key);
        if (!next) return undefined;
        node = next;
    }
    return node;
};

/**
 * Sets a value at a path in the container, creating a new version
 */
export const set = (path: string[], value: any, container: Container): Container => {
    const newVersion = {
        ...container.version,
        [container.id]: container.version[container.id] + 1
    };
    
    return {
        ...container,
        root: setInTrie(path, value, newVersion, container.root),
        version: newVersion
    };
};

/**
 * Internal helper to set a value in a trie
 */
const setInTrie = (path: string[], value: any, version: VectorClock, trie: Trie): Trie => {
    if (path.length === 0) {
        return {
            nodeType: { type: 'value', value, version },
            isLeaf: true
        };
    }

    const [key, ...rest] = path;
    if (trie.nodeType.type !== 'branch') {
        throw new Error('Cannot set path on value node');
    }

    const children = new Map(trie.nodeType.children);
    const child = children.get(key) || empty();
    children.set(key, setInTrie(rest, value, version, child));

    return {
        nodeType: { type: 'branch', children },
        isLeaf: false
    };
};

/**
 * Checks if one vector clock happens before another
 */
export const happensBefore = (a: VectorClock, b: VectorClock): boolean => {
    let hasStrictlyLess = false;
    for (const nodeId in b) {
        const aVersion = a[nodeId] || 0;
        const bVersion = b[nodeId];
        if (aVersion > bVersion) return false;
        if (aVersion < bVersion) hasStrictlyLess = true;
    }
    return hasStrictlyLess;
};

/**
 * Merges two containers, reconciling their states
 */
export const merge = (a: Container, b: Container): Container => {
    if (a.id === b.id) {
        // Same container, take the newer version
        return happensBefore(a.version, b.version) ? b : a;
    }

    // Merge versions
    const newVersion = mergeClocks(a.version, b.version);
    
    return {
        id: a.id,  // Keep original identity
        root: mergeTries(a.root, b.root),
        version: newVersion
    };
};

/**
 * Merges two tries, reconciling their states
 */
const mergeTries = (a: Trie, b: Trie): Trie => {
    // If either is undefined, take the other
    if (!a) return b;
    if (!b) return a;

    // If both are values, take the newer one
    if (a.nodeType.type === 'value' && b.nodeType.type === 'value') {
        return happensBefore(a.nodeType.version, b.nodeType.version) ? b : a;
    }

    // If both are branches, merge their children
    if (a.nodeType.type === 'branch' && b.nodeType.type === 'branch') {
        const children = new Map(a.nodeType.children);
        
        for (const [key, bChild] of b.nodeType.children) {
            const aChild = children.get(key);
            children.set(key, aChild ? mergeTries(aChild, bChild) : bChild);
        }

        return {
            nodeType: { type: 'branch', children },
            isLeaf: false
        };
    }

    // Mixed types - take the newer one based on container version
    return b;
};

/**
 * Merges vector clocks
 */
const mergeClocks = (a: VectorClock, b: VectorClock): VectorClock => {
    const result = { ...a };
    for (const nodeId in b) {
        result[nodeId] = Math.max(result[nodeId] || 0, b[nodeId]);
    }
    return result;
};

/**
 * Extracts the raw value from a trie
 */
export const toValue = (trie: Trie | undefined): any => {
    if (!trie) return undefined;

    const { nodeType } = trie;
    switch (nodeType.type) {
        case 'value':
            return nodeType.value;
        case 'branch': {
            const result: { [key: string]: any } = {};
            nodeType.children.forEach((child, key) => {
                const value = toValue(child);
                if (value !== undefined) {
                    result[key] = value;
                }
            });
            return Object.keys(result).length > 0 ? result : undefined;
        }
    }
};
