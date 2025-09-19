# Realmwright 🚀

![React](https://img.shields.io/badge/React-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![CSS](https://img.shields.io/badge/CSS-239120?&style=for-the-badge&logo=css3&logoColor=white)
![Dexie.js](https://img.shields.io/badge/Dexie.js-FFDF00?style=for-the-badge&logo=dexie-dot-js&logoColor=black)
![Status](https://img.shields.io/badge/Status-Map%20Creator%20In%20Progress-blue)

---

Welcome to Realmwright, an ambitious, offline-first desktop application designed to be the ultimate tool for Pen & Paper Game Masters. Built with flexibility and power at its core, Realmwright empowers GMs to craft, manage, and run their campaigns with unparalleled detail and efficiency, whether they are meticulous world-builders or on-the-fly improvisers.

This application is built for the storyteller who needs a tool that adapts to their style, not the other way around.

---

## Core Philosophy

-   **Speed and Responsiveness**: Immediate access to information is critical. Realmwright is built for performance, ensuring no distracting lag during a live session.

-   **Intuitive Design**: A clean, immersive UI that supports the fantasy theme without getting in the way. The goal is to minimize cognitive load so the GM can focus on the story.

-   **Offline First**: Leveraging IndexedDB, the app works seamlessly with or without an internet connection. Your worlds are always with you.

-   **Deep Flexibility**: From custom character sheet layouts to intricate ability trees with logical prerequisites, the tool is designed to handle complex, unique game systems.

---

## Tech Stack

-   **Framework**: React with TypeScript

-   **Desktop Shell**: Electron

-   **Styling**: A custom BEM-style CSS system (no utility-first frameworks)

-   **Data Persistence**: Dexie.js (a wrapper for IndexedDB) for robust offline storage.

-   **Diagramming/Canvas**: React Flow for the Ability Tree editor.

-   **Drag & Drop**: dnd-kit for the Class Sheet editor.

---

## Project Roadmap

### ✅ **Phase 1: The Architect's Foundation (Completed)**

The top-level `World` and `Campaign` managers have been implemented, providing the core organizational structure for all game content. This established the foundational patterns for data management and UI layout.

### ✅ **Phase 2: The Persona Forge (Completed)**

The `Class and Character Sheet System` has been built, allowing GMs to design custom character sheet layouts using a modular, drag-and-drop editor. This is a cornerstone feature for character creation and management.

### ✅ **Phase 3: The Skill Web Weaver (Completed)**

The foundational `Ability Tree Creator` was a monumental undertaking, establishing many of the core patterns for complex visual editors within the application.

-   **1. Core Canvas & Node System:** Implemented the fundamental React Flow canvas, custom nodes (`AbilityNode`, `AttachmentNode`), and the grid-based tier layout.

-   **2. Reactive State Management:** Developed the `AbilityTreeEditorContext` to handle all state changes, from adding/deleting nodes to managing tiers, ensuring the UI is always in sync with the data.

-   **3. Advanced Prerequisite & Socket Logic:** Engineered the system for creating complex prerequisites between abilities (AND/OR logic) and the innovative "socketing" feature, allowing entire skill trees to be attached to designated nodes.

-   **4. UI/UX Polish & Ergonomics:** Refined the user experience with features like drag-and-snap, interactive edge labels, tier highlighting, and a dedicated sidebar for a smooth, intuitive editing workflow.

### ➡️ **Phase 4: The World Builder's Canvas (In Progress)**

The `Map Creator` is the current major initiative. A robust foundation has been laid, establishing a powerful and interactive cartography tool.

-   **1. Interactive Canvas:** The core map viewer is fully functional, supporting pan, zoom, and both image-based and blank, theme-aware canvases.

-   **2. Dynamic Layer System:** A complete UI and data model for creating, deleting, and managing the visibility of map layers has been implemented.

-   **3. Tool System & Marker Workflow:** A context-aware tool system (`pan`, `select`, `add-location`) is in place. Users can now perform a complete Create, Read, Update, and Delete (CRUD) workflow for location markers, including linking them to lore data via a specialized modal.

-   **4. Data Integrity:** Implemented a robust, transactional `deleteLocation` query that automatically finds and unlinks markers across all maps, preventing orphaned data.

### **Future Milestones**

-   **Map Editor Enhancements:** Implement the Zone Drawing Tool, integrate the Quest system with dedicated markers, and add object manipulation (drag & drop, resizing).

-   **Lore, Quest, & Location Editors:** Evolve the current placeholder managers into full-featured editors for creating and cross-referencing all narrative data.

-   **The DM's Live Console:** Implement the "Active Play Mode" with modules for tracking quests, journeys, combat, and session notes.

-   **Import/Export Functionality:** Create the system for saving, sharing, and loading entire worlds.
