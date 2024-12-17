# Change Management System Architecture

## Core Data Model

### Extended Fact Structure
```
┌──────────────────────────────────────────┐
│               Fact Structure             │
├──────────┬──────────┬──────────┬────────┤
│Entity ID │Attribute │ Value    │Vector  │
│Time      │Operation │ Metadata │Clock   │
└──────────┴──────────┴──────────┴────────┘
```

### Vector Clock Integration
```
┌──────────────────────────────────────────┐
│             Timeline Structure           │
├──────────┬──────────┬──────────┬────────┤
│Local Time│Vector    │Causal    │Merge   │
│          │Clock     │History   │Strategy│
└──────────┴──────────┴──────────┴────────┘
```

## Temporal-CRDT Hybrid Model

### 1. Fact Representation
- Facts are immutable and temporally ordered locally
- Each fact includes:
  - Core Datomic-style tuple: [entity-id, attribute, value, tx-id]
  - CRDT metadata: [vector-clock, causal-history]
  - Convergence data: [merge-strategy, conflict-resolution]

### 2. Timeline Management
- Multiple concurrent timelines can exist
- Each timeline maintains:
  - Local temporal order
  - Vector clock for concurrent operations
  - Causal history for dependencies
  - Merge points for convergence

### 3. Convergence Strategy
```
Timeline A:  F1 -> F2 -> F3
                    \
Timeline B:          B1 -> B2
                           \
Merged:     F1 -> F2 -> F3 -> B1' -> B2'
```

## Implementation Components

### 1. Fact Manager
- Maintains local fact log
- Assigns vector clocks
- Tracks causal dependencies
- Ensures local temporal order

### 2. Timeline Controller
- Manages multiple timelines
- Tracks divergence points
- Maintains vector clocks
- Coordinates convergence

### 3. Merge Engine
- CRDT-based fact merging
- Causal history resolution
- Conflict detection
- Timeline reconciliation

## Operational Modes

### 1. Local Operation
```
New Fact -> Vector Clock Update -> Local Timeline
         -> Causal History Update
         -> Convergence Metadata
```

### 2. Concurrent Operation
```
Timeline A: Fact[VC-A1] -> Fact[VC-A2]
Timeline B: Fact[VC-B1] -> Fact[VC-B2]
```

### 3. Convergence Operation
```
Detect Divergence -> Apply CRDT Rules
                  -> Merge Timelines
                  -> Update Vector Clocks
```

## Query Capabilities

### 1. Temporal Queries
- As-of-time queries (single timeline)
- As-of-vector-clock queries (across timelines)
- Timeline-specific queries
- Convergence point queries

### 2. Causal Queries
- Dependency tracking
- Causal history exploration
- Convergence analysis
- Branch point identification

### 3. Merged Views
- Point-in-time across timelines
- Convergence status views
- Conflict visualization
- Merge simulation

## Consistency Model

### 1. Local Consistency
- Strict temporal ordering
- Causal consistency
- Vector clock monotonicity
- Fact immutability

### 2. Global Consistency
- Eventually consistent
- CRDT convergence guarantees
- Causal history preservation
- Merge commutativity

### 3. Timeline Consistency
- Independent progress
- Controlled convergence
- Deterministic merging
- History preservation

## Implementation Strategy

### 1. Fact Storage
```
{
  "entity-id": "e123",
  "attribute": "name",
  "value": "project-x",
  "tx-id": "t456",
  "vector-clock": {"A": 1, "B": 2},
  "causal-history": ["t123", "t234"],
  "merge-strategy": "last-write-wins"
}
```

### 2. Timeline Storage
```
{
  "timeline-id": "timeline-A",
  "vector-clock": {"A": 42, "B": 17},
  "divergence-point": "t789",
  "convergence-status": "diverged",
  "merge-points": ["t890", "t891"]
}
```

### 3. Merge Process
1. Detect divergence points
2. Compare vector clocks
3. Apply CRDT rules
4. Preserve causal history
5. Update convergence metadata

## Synchronization Protocol

### 1. Timeline Exchange
```
Timeline A -> Vector Clock Exchange -> Timeline B
           -> Causal History Check
           -> Divergence Detection
```

### 2. Fact Exchange
```
Missing Facts -> CRDT Merge Rules -> Timeline Update
              -> Vector Clock Sync
              -> Convergence Check
```

### 3. Convergence Process
```
Diverged Timelines -> Merge Point Creation
                   -> CRDT Resolution
                   -> History Preservation
                   -> Vector Clock Update
```
