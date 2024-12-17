# Refactory

A local-first change management system built with Tauri + SvelteKit + TypeScript. Refactory provides an efficient, developer-friendly interface for managing code changes with built-in AI/LLM integration capabilities.

## Features
- 🏠 Local-first architecture with SQLite storage
- 🔄 CRDT-based synchronization for conflict resolution
- 🌐 GraphQL API for flexible data querying
- 🤖 AI/LLM integration ready
- 🖥️ Desktop GUI + CLI interfaces
- 📡 Offline-first operation with change journaling

## Development Documentation
Our technical documentation covers various aspects of the system:

- [Architecture Overview](docs/dev/architecture.md) - System architecture and component interactions
- [Storage Patterns](docs/dev/storage-patterns.md) - Data persistence and caching strategies
- [Vector Clocks](docs/dev/vector-clocks.md) - Implementation of distributed synchronization
- [Query Analysis](docs/dev/query-analysis.md) - GraphQL query optimization and analysis
- [Business Rules](docs/dev/business-rules-validation.md) - Domain rules and validation patterns
- [Compression Strategies](docs/dev/compression-strategies.md) - Data compression and optimization

This template should help get you started developing with Tauri, SvelteKit and TypeScript in Vite.

## Recommended IDE Setup

[VS Code](https://code.visualstudio.com/) + [Svelte](https://marketplace.visualstudio.com/items?itemName=svelte.svelte-vscode) + [Tauri](https://marketplace.visualstudio.com/items?itemName=tauri-apps.tauri-vscode) + [rust-analyzer](https://marketplace.visualstudio.com/items?itemName=rust-lang.rust-analyzer).

## License

This project is proprietary software. All rights reserved. See [LICENSE](LICENSE) for details.

⚠️ **IMPORTANT**: This software is protected by copyright law. Unauthorized copying, modification, or distribution is strictly prohibited.
