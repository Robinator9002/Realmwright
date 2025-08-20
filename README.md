# Realmwright 🚀

![React](https://img.shields.io/badge/React-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![CSS](https://img.shields.io/badge/CSS-239120?&style=for-the-badge&logo=css3&logoColor=white)
![Dexie.js](https://img.shields.io/badge/Dexie.js-FFDF00?style=for-the-badge&logo=dexie-dot-js&logoColor=black)
![Status](https://img.shields.io/badge/Status-Foundation%20Complete-brightgreen)

---

### Project Overview

**Realmwright** is an ambitious, offline-first Pen & Paper command center designed to be the ultimate tool for Dungeon Masters. Built with React, TypeScript, and a semantic CSS architecture, it serves as an indispensable digital companion for crafting, managing, and running deeply immersive campaigns. Whether you are a meticulous world-builder or a quick-thinking improviser, Realmwright aims to streamline your workflow and amplify your storytelling.

### 🎯 Core Concept

Realmwright is founded on the philosophy of being an **Adaptive Command Center**. It's a powerful, non-distracting tool that enhances the TTRPG experience by prioritizing speed, intuitive design, and flexibility. The core of the application is its robust **offline-first architecture** using IndexedDB (via Dexie.js), ensuring that your entire world is always available, fast, and reliable, regardless of internet connectivity.

### ✨ Key Features

-   **🏛️ Foundational World Management:** Create, manage, and delete self-contained worlds, each serving as a container for its own campaigns and characters.
-   **📚 Dynamic Campaign & Character Creation:** Full CRUD (Create, Read, Update, Delete) functionality for campaigns and characters within a selected world.
-   **🎨 Robust Theming Engine:** A clean, immersive UI with four distinct, user-selectable themes (Modern/Ancient, Light/Dark) powered by a semantic CSS variable system.
-   **⚡ Two-Mode Interface (Planned):** Seamlessly switch between **Creation/Management Mode** for deep world-building and **Active Play Mode**—a live DM console for running sessions.
-   **📦 Robust Data Handling:** All data is stored locally in your browser, providing lightning-fast access and full offline functionality. Includes plans for proprietary text-based import/export for sharing entire worlds.

### 💡 The "Why": A Tool Forged from Experience

As a Dungeon Master who has run countless sessions, I've always yearned for a single, cohesive tool that could handle the sprawling complexity of a homebrew world without getting in the way. Existing solutions are often too rigid, too slow, or too focused on a single ruleset. Realmwright is born from that need—an opinionated, yet flexible, system designed by a DM, for DMs. It's an experiment to see if we can create a digital tool that feels less like software and more like an extension of the storyteller's mind.

### 🗺️ Project Roadmap

The initial architectural phase is complete. The foundational UI, data structures, and core CRUD operations are stable and consistent. Development will now proceed by implementing the core "Creation Mode" modules.

1.  **✓ Base Camp 1: The Foundation**

    -   [x] Establish the Dexie.js database schema for Worlds, Campaigns, & Characters.
    -   [x] Implement a fully type-safe, generic modal for managing data.
    -   [x] Build consistent, full CRUD panels for Worlds, Campaigns, & Characters.
    -   [x] Finalize the semantic CSS architecture and theming engine.

2.  **► Base Camp 2: The Chronicle Keeper (Current Focus)**

    -   [x] Design and implement the **Lore Creator** module.
    -   [x] Develop a rich text editor for detailed lore entries.
    -   [ ] Implement categorization (Factions, Locations, etc.) and cross-linking/tagging.
    -   [ ] Integrate a chronological timeline view for historical events.

3.  **Base Camp 3: The Persona Forge**

    -   [x] Build the **Character Template Creator** with modular components.
    -   [x] Integrate stats and abilities from a future Rule Creator.
    -   [x] Allow for custom, free-form pages within a character sheet.

4.  **Base Camp 4: The System Architect & The Skill Weaver**

    -   [x] Build the **Rule Creator** to define game mechanics and rule packs.
    -   [x] Design and implement the node-based **Ability Tree Creator**.

5.  **The Summit Push: The Live Console & World Canvas**
    -   [ ] Develop the **"Active Play Mode"** with its various trackers (Quests, Combat, etc.).
    -   [ ] Implement the interactive **Map Creator**.

_(The full, detailed development plan can be found in our collaborative development log.)_
