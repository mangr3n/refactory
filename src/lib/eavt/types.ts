/**
 * Core EAVT (Entity-Attribute-Value-Time) types
 */

export type EntityId = string;
export type Attribute = string;
export type Value = string | number | boolean | EntityId; // Start simple, expand later

export interface Fact {
    entity: EntityId;
    attribute: Attribute;
    value: Value;
    txId: number;      // Simple monotonic transaction ID for now
    added: boolean;    // true for assert, false for retract
}

export interface Database {
    facts: Fact[];
    nextTx: number;     // Monotonically increasing transaction counter
}

// Index types for efficient querying
export type EAVIndex = Map<EntityId, Map<Attribute, Map<Value, Set<number>>>>;
export type AVEIndex = Map<Attribute, Map<Value, Map<EntityId, Set<number>>>>;
export type AEVIndex = Map<Attribute, Map<EntityId, Map<Value, Set<number>>>>;
