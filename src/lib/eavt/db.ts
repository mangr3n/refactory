import type { Database, Fact, EntityId, Attribute, Value } from './types';

export function createDatabase(): Database {
    return {
        facts: [],
        nextTx: 1
    };
}

export function addFact(
    db: Database,
    entity: EntityId,
    attribute: Attribute,
    value: Value
): Database {
    const txId = db.nextTx;
    const fact: Fact = {
        entity,
        attribute,
        value,
        txId,
        added: true,
    };

    return {
        facts: [...db.facts, fact],
        nextTx: txId + 1,
    };
}

export function retractFact(
    db: Database,
    entity: EntityId,
    attribute: Attribute,
    value: Value
): Database {
    const txId = db.nextTx;
    const fact: Fact = {
        entity,
        attribute,
        value,
        txId,
        added: false
    };

    return {
        facts: [...db.facts, fact],
        nextTx: txId + 1
    };
}

// Query the current value of an attribute for an entity
export function getValue(
    db: Database,
    entity: EntityId,
    attribute: Attribute
): Value | null {
    // Get all facts for this entity-attribute pair
    const relevantFacts = db.facts.filter(f => 
        f.entity === entity && 
        f.attribute === attribute
    );

    // Sort by transaction ID descending
    relevantFacts.sort((a, b) => b.txId - a.txId);

    // Return the most recent value that wasn't retracted
    const mostRecent = relevantFacts[0];
    return mostRecent?.added ? mostRecent.value : null;
}

// Get all current facts for an entity
export function getEntity(
    db: Database,
    entity: EntityId
): Record<Attribute, Value> {
    const result: Record<Attribute, Value> = {};
    
    // Group facts by attribute
    const factsByAttribute = new Map<Attribute, Fact[]>();
    
    for (const fact of db.facts) {
        if (fact.entity === entity) {
            const facts = factsByAttribute.get(fact.attribute) || [];
            facts.push(fact);
            factsByAttribute.set(fact.attribute, facts);
        }
    }
    
    // For each attribute, get the most recent value
    for (const [attr, facts] of factsByAttribute) {
        facts.sort((a, b) => b.txId - a.txId);
        const mostRecent = facts[0];
        if (mostRecent?.added) {
            result[attr] = mostRecent.value;
        }
    }
    
    return result;
}

// Find entities matching a pattern
export function findEntities(
    db: Database,
    pattern: {
        attribute: Attribute;
        value: Value;
    }
): EntityId[] {
    const matches = new Set<EntityId>();
    
    // Find all entities that have ever had this attribute-value pair
    for (const fact of db.facts) {
        if (fact.attribute === pattern.attribute && 
            fact.value === pattern.value && 
            fact.added) {
            matches.add(fact.entity);
        }
    }
    
    // Filter out entities where this was later retracted
    return Array.from(matches).filter(entity => 
        getValue(db, entity, pattern.attribute) === pattern.value
    );
}

// Get history of an attribute for an entity
export function getHistory(
    db: Database,
    entity: EntityId,
    attribute: Attribute
): Array<{ value: Value; transaction: number; added: boolean }> {
    return db.facts
        .filter(f => f.entity === entity && f.attribute === attribute)
        .sort((a, b) => a.txId - b.txId)
        .map(({ value, txId, added }) => ({ value, transaction: txId, added }));
}

export function addFacts(
    db: Database,
    entity: EntityId,
    avMap: Record<Attribute, Value>
): Database {
    const txId = db.nextTx;
    const facts: Fact[] = Object.entries(avMap).map(([attribute, value]) => ({
        entity,
        attribute,
        value,
        txId,
        added: true
    }));

    return {
        facts: [...db.facts, ...facts],
        nextTx: txId + 1
    };
}

// Retract an entire entity and all its facts
export function retractEntity(
    db: Database,
    entity: EntityId
): Database {
    const currentFacts = getEntity(db, entity);
    const txId = db.nextTx;
    
    // Create retraction facts for all current attributes
    const retractionFacts: Fact[] = Object.entries(currentFacts).map(([attribute, value]) => ({
        entity,
        attribute,
        value,
        txId,
        added: false
    }));

    return {
        facts: [...db.facts, ...retractionFacts],
        nextTx: txId + 1
    };
}

// Get database state as of a specific transaction
export function asOf(
    db: Database,
    txId: number
): Database {
    // Only include facts up to and including this transaction
    const facts = db.facts.filter(f => f.txId <= txId);
    
    return {
        facts,
        nextTx: txId + 1
    };
}

// Check if an entity exists (has any valid facts)
export function entityExists(
    db: Database,
    entity: EntityId
): boolean {
    return Object.keys(getEntity(db, entity)).length > 0;
}
