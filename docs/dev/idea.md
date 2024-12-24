# Change Management System

## Project State
- Local-first change management system
- Designed for lightweight, efficient operation
- Focused on developer-friendly interfaces (GUI + CLI)
- AI/LLM integration ready

## System Architecture
- Frontend: Tauri-based GUI for desktop application
- Backend: 
  - SQLite for local-first data storage
  - GraphQL API for flexible data querying
  - CLI interface for automation and LLM interaction

### Data Layer Architecture
1. Local Storage Layers:
   - SQLite: Core domain data persistence
   - Git: Change tracking and sync history
   - Browser Storage: UI state and offline capability
   
2. Sync Architecture:
   - CRDT-based synchronization for conflict resolution
   - Git-based change history tracking
   - Offline-first operation with change journaling
   - Connection state tracking for sync decisions

3. GraphQL Federation:
   - Unified interface across all data sources
   - Layer-specific resolvers:
     - Transient UI state
     - Persistent user preferences
     - Local domain data
     - Remote synchronized data
   - Real-time subscriptions for connected state

## Technical Stack
- Tauri (GUI framework)
- SQLite (Database)
- GraphQL (API layer)
  - Federation for multi-source data
  - Subscriptions for real-time updates
- Git (Change tracking)
- CRDT implementation for sync
- Rust (CLI implementation)
- TypeScript/React (Frontend)

## Key Features
- Offline-first operation
- Git-based change tracking
- CRDT-based synchronization
- Federated GraphQL API
- Browser/CLI standalone capability
- Connection state awareness
- Sync history tracking
- Multi-layer data management

## Key Requirements
- Local-first architecture for data sovereignty
- Offline operation with full functionality
- Seamless sync when connection restored
- Version control integration
- Conflict resolution via CRDTs
- Real-time updates when connected
- Change history preservation

## Known Limitations
- Initial version will be single-user focused
- Sync complexity with large change sets
- Git storage overhead for change tracking
- CRDT space complexity considerations

## Project Vision: Refactory

## Overview
Refactory implements a CRDT-based state management system using tries as the underlying data structure. The key innovation is the concept of "state boundaries" - containers that represent independent agents or entities in a distributed system, each maintaining their own versioned view of shared state.

## Core Concepts

### 1. State Boundaries
- Containers as root state management units
- Each container represents an independent agent's view
- Clean merge semantics between boundaries
- Version tracking via vector clocks
- Natural mapping to real-world entities (users, devices, services)

### 2. Trie Structure
- Path-based state organization
- Efficient partial updates
- Hierarchical namespace management
- Structural sharing for efficiency

### 3. CRDT Properties
- Strong eventual consistency
- Automatic conflict resolution
- Causality tracking
- Distributed operation without central coordination

## Design Philosophy

### 1. Model Reality
- State boundaries mirror real-world independence
- Changes flow naturally between boundaries
- Explicit representation of causality and time

### 2. Simplicity
- Minimal core concepts (boundary, value, branch)
- Clean, predictable merge semantics
- Intuitive path-based API

### 3. Correctness
- Provable CRDT properties
- Clear consistency guarantees
- Comprehensive testing

### 4. Performance
- Efficient memory usage through structural sharing
- Fast operations on large state trees
- Scalable for real-world applications

## Use Cases

### 1. Multi-Agent Systems
- Independent agents with local state
- Natural conflict resolution
- Causality tracking between agents

### 2. Distributed Applications
- Edge computing state management
- Offline-first applications
- Peer-to-peer synchronization

### 3. Collaborative Software
- Real-time collaboration
- Versioned state management
- Conflict-free updates
