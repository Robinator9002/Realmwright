# Realmwright 🚀

![React](https://img.shields.io/badge/React-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![CSS](https://img.shields.io/badge/CSS-239120?&style=for-the-badge&logo=css3&logoColor=white)
![Dexie.js](https://img.shields.io/badge/Dexie.js-FFDF00?style=for-the-badge&logo=dexie-dot-js&logoColor=black)
![Status](https://img.shields.io/badge/Status-Foundation%20Complete-brightgreen)

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

### ✅ **Phase 1: The Skill Web Weaver (Completed)**

The foundational `Ability Tree Creator` was a monumental undertaking, establishing many of the core patterns for the application.

-   **1. Core Canvas & Node System:** Implemented the fundamental React Flow canvas, custom nodes (`AbilityNode`, `AttachmentNode`), and the grid-based tier layout.

-   **2. Reactive State Management:** Developed the `AbilityTreeEditorContext` to handle all state changes, from adding/deleting nodes to managing tiers, ensuring the UI is always in sync with the data.

-   **3. Advanced Prerequisite & Socket Logic:** Engineered the system for creating complex prerequisites between abilities (AND/OR logic) and the innovative "socketing" feature, allowing entire skill trees to be attached to designated nodes.

-   **4. UI/UX Polish & Ergonomics:** Refined the user experience with features like drag-and-snap, interactive edge labels, tier highlighting, and a dedicated sidebar for a smooth, intuitive editing workflow.

### ➡️ **Phase 2: The Persona Forge (Next Up)**

The next major initiative is a complete overhaul of the **Class and Character Sheet System**. The goal is to move beyond simple data entry and create a truly modular and customizable character creation experience.

-   **Objective:** Refactor the `ClassManager` and `CharacterManager` to support a new `ClassSheetEditor` where GMs can design character sheet layouts using draggable blocks (`Stats`, `Inventory`, `RichText`, `AbilityTree`, etc.). Characters will then be instantiated from these class blueprints.

### **Future Milestones**

-   **World & Campaign Managers:** Build out the top-level containers for organizing all game content.

-   **Lore & Rules Creators:** Develop the tools for writing and cross-referencing all narrative and mechanical information.

-   **The DM's Live Console:** Implement the "Active Play Mode" with modules for tracking quests, journeys, combat, and session notes.

-   **Import/Export Functionality:** Create the system for saving, sharing, and loading entire worlds.
