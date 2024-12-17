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
