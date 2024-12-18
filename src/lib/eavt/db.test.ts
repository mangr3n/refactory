import { describe, it, expect } from 'vitest';
import {
    createDatabase,
    addFact,
    retractFact,
    getValue,
    getEntity,
    findEntities,
    getHistory,
    addFacts,
    retractEntity,
    asOf,
    entityExists
} from './db';

describe('EAVT Database', () => {
    describe('Basic Operations', () => {
        it('should add facts about an entity', () => {
            let db = createDatabase();
            
            // Add some facts about a person
            db = addFact(db, 'person1', 'name', 'Alice');
            db = addFact(db, 'person1', 'age', 30);
            
            expect(getValue(db, 'person1', 'name')).toBe('Alice');
            expect(getValue(db, 'person1', 'age')).toBe(30);
        });

        it('should retract facts about an entity', () => {
            let db = createDatabase();
            
            // Add and then retract a fact
            db = addFact(db, 'person1', 'name', 'Alice');
            db = retractFact(db, 'person1', 'name', 'Alice');
            
            expect(getValue(db, 'person1', 'name')).toBeNull();
        });

        it('should handle multiple values over time', () => {
            let db = createDatabase();
            
            // Change a value multiple times
            db = addFact(db, 'person1', 'name', 'Alice');
            db = addFact(db, 'person1', 'name', 'Alicia');
            
            expect(getValue(db, 'person1', 'name')).toBe('Alicia');
        });

        it('should add multiple facts in one transaction', () => {
            let db = createDatabase();
            
            // Add multiple facts about a person
            db = addFacts(db, 'person1', {
                name: 'Alice',
                age: 30,
                city: 'New York',
                active: true
            });
            
            // All facts should exist
            expect(getValue(db, 'person1', 'name')).toBe('Alice');
            expect(getValue(db, 'person1', 'age')).toBe(30);
            expect(getValue(db, 'person1', 'city')).toBe('New York');
            expect(getValue(db, 'person1', 'active')).toBe(true);
            
            // All facts should have the same transaction ID
            const entity = getEntity(db, 'person1');
            const facts = db.facts.filter(f => f.entity === 'person1');
            const txIds = new Set(facts.map(f => f.txId));
            expect(txIds.size).toBe(1); // All facts should share the same txId
        });
    });

    describe('Entity Operations', () => {
        it('should get all current facts about an entity', () => {
            let db = createDatabase();
            
            db = addFact(db, 'person1', 'name', 'Alice');
            db = addFact(db, 'person1', 'age', 30);
            db = addFact(db, 'person1', 'city', 'New York');
            
            const entity = getEntity(db, 'person1');
            
            expect(entity).toEqual({
                name: 'Alice',
                age: 30,
                city: 'New York'
            });
        });

        it('should handle retracted attributes in entity view', () => {
            let db = createDatabase();
            
            db = addFact(db, 'person1', 'name', 'Alice');
            db = addFact(db, 'person1', 'age', 30);
            db = retractFact(db, 'person1', 'age', 30);
            
            const entity = getEntity(db, 'person1');
            
            expect(entity).toEqual({
                name: 'Alice'
            });
        });

        it('should retract an entire entity', () => {
            let db = createDatabase();
            
            // Add facts about a person
            db = addFacts(db, 'person1', {
                name: 'Alice',
                age: 30,
                city: 'New York'
            });
            
            // Verify entity exists
            expect(entityExists(db, 'person1')).toBe(true);
            
            // Retract the entire entity
            db = retractEntity(db, 'person1');
            
            // Entity should no longer exist
            expect(entityExists(db, 'person1')).toBe(false);
            expect(getEntity(db, 'person1')).toEqual({});
            
            // All attributes should be null
            expect(getValue(db, 'person1', 'name')).toBeNull();
            expect(getValue(db, 'person1', 'age')).toBeNull();
            expect(getValue(db, 'person1', 'city')).toBeNull();
        });
    });

    describe('Query Operations', () => {
        it('should find entities matching a pattern', () => {
            let db = createDatabase();
            
            db = addFact(db, 'person1', 'city', 'New York');
            db = addFact(db, 'person2', 'city', 'New York');
            db = addFact(db, 'person3', 'city', 'Boston');
            
            const nyPeople = findEntities(db, {
                attribute: 'city',
                value: 'New York'
            });
            
            expect(nyPeople).toHaveLength(2);
            expect(nyPeople).toContain('person1');
            expect(nyPeople).toContain('person2');
        });

        it('should get history of an attribute', () => {
            let db = createDatabase();
            
            db = addFact(db, 'person1', 'name', 'Alice');
            db = addFact(db, 'person1', 'name', 'Alicia');
            db = retractFact(db, 'person1', 'name', 'Alicia');
            db = addFact(db, 'person1', 'name', 'Alice B.');
            
            const history = getHistory(db, 'person1', 'name');
            
            expect(history).toHaveLength(4);
            expect(history[0].value).toBe('Alice');
            expect(history[1].value).toBe('Alicia');
            expect(history[2].value).toBe('Alicia');
            expect(history[3].value).toBe('Alice B.');
        });

        it('should allow viewing database state at a point in time', () => {
            let db = createDatabase();
            
            // Add initial facts
            db = addFacts(db, 'person1', {
                name: 'Alice',
                age: 30
            });
            const tx1 = db.nextTx - 1;
            
            // Update some facts
            db = addFacts(db, 'person1', {
                age: 31,
                city: 'New York'
            });
            const tx2 = db.nextTx - 1;
            
            // Retract the entity
            db = retractEntity(db, 'person1');
            const tx3 = db.nextTx - 1;
            
            // Check state at different points in time
            const dbAtTx1 = asOf(db, tx1);
            expect(getEntity(dbAtTx1, 'person1')).toEqual({
                name: 'Alice',
                age: 30
            });
            
            const dbAtTx2 = asOf(db, tx2);
            expect(getEntity(dbAtTx2, 'person1')).toEqual({
                name: 'Alice',
                age: 31,
                city: 'New York'
            });
            
            const dbAtTx3 = asOf(db, tx3);
            expect(getEntity(dbAtTx3, 'person1')).toEqual({});
        });
    });
});
