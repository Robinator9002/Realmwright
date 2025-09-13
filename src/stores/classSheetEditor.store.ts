// src/stores/classSheetEditor.store.ts

/**
 * COMMIT: feat(class-sheet): create Zustand store for editor state
 *
 * Rationale:
 * To centralize the complex state management of the ClassSheetEditor, this
 * commit introduces a dedicated Zustand store. This store will hold all the
 * editor's state (like the editable class object, active page, selected
 * block) and the actions that modify it.
 *
 * Implementation Details:
 * - Created a new file at `src/stores/classSheetEditor.store.ts`.
 * - Defined the `State` and `Actions` interfaces for the store.
 * - Used Zustand's `create` function with the `immer` middleware to
 * enable safe and efficient immutable updates.
 * - Migrated all state-mutating logic from the ClassSheetEditor component
 * into actions within this store (e.g., `addBlock`, `updateBlockContent`).
 * - This change is the cornerstone of the architectural refactor, paving the
 * way for a decoupled and more maintainable component structure.
 */
import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import type { Layout } from 'react-grid-layout';
import type { CharacterClass, SheetBlock, SheetPage } from '../db/types';

// --- STORE STATE ---
interface State {
    // The original class object, used to reset changes if needed.
    originalClass: CharacterClass | null;
    // The class object being actively edited by the user.
    editableClass: CharacterClass | null;
    // The index of the currently visible page in the character sheet.
    activePageIndex: number;
    // The ID of the currently selected block on the canvas.
    selectedBlockId: string | null;
    // Tracks the saving state for UI feedback.
    isSaving: boolean;
}

// --- STORE ACTIONS ---
interface Actions {
    // Initializes the store with a character class to edit.
    init: (characterClass: CharacterClass) => void;
    // Adds a new block of a specified type to the current page.
    addBlock: (blockType: SheetBlock['type']) => void;
    // Deletes a block from the current page.
    deleteBlock: (blockId: string) => void;
    // Handles bulk layout changes from the react-grid-layout component.
    handleLayoutChange: (newLayout: Layout[]) => void;
    // Updates the layout properties of a single block.
    updateBlockLayout: (blockId: string, newLayout: Partial<SheetBlock['layout']>) => void;
    // Updates the `content` property of a single block.
    updateBlockContent: (blockId: string, newContent: any) => void;
    // Updates a base stat value for the entire class.
    updateBaseStat: (statId: number, value: number) => void;
    // Adds a new, empty page to the character sheet.
    addPage: () => void;
    // Deletes a page from the character sheet by its index.
    deletePage: (indexToDelete: number) => void;
    // Renames a page.
    renamePage: (pageIndex: number, newName: string) => void;
    // Selects a block on the canvas.
    setSelectedBlockId: (blockId: string | null) => void;
    // Sets the active page index.
    setActivePageIndex: (index: number) => void;
    // Sets the saving state.
    setIsSaving: (isSaving: boolean) => void;
}

// --- STORE DEFINITION ---
export const useClassSheetStore = create<State & Actions>()(
    // Use the Immer middleware to allow for direct, "mutative" state updates.
    immer((set) => ({
        // --- INITIAL STATE ---
        originalClass: null,
        editableClass: null,
        activePageIndex: 0,
        selectedBlockId: null,
        isSaving: false,

        // --- ACTION IMPLEMENTATIONS ---
        init: (characterClass) =>
            set({
                originalClass: characterClass,
                editableClass: JSON.parse(JSON.stringify(characterClass)), // Deep clone for editing
                activePageIndex: 0,
                selectedBlockId: null,
            }),

        addBlock: (blockType) =>
            set((state) => {
                if (!state.editableClass) return;
                const sheet = state.editableClass.characterSheet;
                if (sheet.length === 0) {
                    sheet.push({ id: crypto.randomUUID(), name: 'Main Page', blocks: [] });
                }
                const currentPageBlocks = sheet[state.activePageIndex].blocks;
                const nextY =
                    currentPageBlocks.length > 0
                        ? Math.max(...currentPageBlocks.map((b) => b.layout.y + b.layout.h))
                        : 0;
                const newBlock: SheetBlock = {
                    id: crypto.randomUUID(),
                    type: blockType,
                    layout: { x: 0, y: nextY, w: 24, h: 8, zIndex: 1 },
                    content:
                        blockType === 'rich_text' || blockType === 'notes'
                            ? ''
                            : blockType === 'inventory'
                            ? []
                            : undefined,
                };
                currentPageBlocks.push(newBlock);
            }),

        deleteBlock: (blockId) =>
            set((state) => {
                if (!state.editableClass) return;
                const currentPage = state.editableClass.characterSheet[state.activePageIndex];
                currentPage.blocks = currentPage.blocks.filter((b) => b.id !== blockId);
                state.selectedBlockId = null; // Deselect after deleting
            }),

        handleLayoutChange: (newLayout) =>
            set((state) => {
                if (!state.editableClass) return;
                const currentPage = state.editableClass.characterSheet[state.activePageIndex];
                currentPage.blocks.forEach((block) => {
                    const layoutItem = newLayout.find((item) => item.i === block.id);
                    if (layoutItem) {
                        block.layout = { ...block.layout, ...layoutItem };
                    }
                });
            }),

        updateBlockLayout: (blockId, newLayout) =>
            set((state) => {
                if (!state.editableClass) return;
                const block = state.editableClass.characterSheet[state.activePageIndex].blocks.find(
                    (b) => b.id === blockId,
                );
                if (block) {
                    block.layout = { ...block.layout, ...newLayout };
                }
            }),

        updateBlockContent: (blockId, newContent) =>
            set((state) => {
                if (!state.editableClass) return;
                const block = state.editableClass.characterSheet[state.activePageIndex].blocks.find(
                    (b) => b.id === blockId,
                );
                if (block) {
                    block.content = newContent;
                }
            }),

        updateBaseStat: (statId, value) =>
            set((state) => {
                if (!state.editableClass) return;
                state.editableClass.baseStats[statId] = value;
            }),

        addPage: () =>
            set((state) => {
                if (!state.editableClass) return;
                const sheet = state.editableClass.characterSheet;
                const newPage: SheetPage = {
                    id: crypto.randomUUID(),
                    name: `Page ${sheet.length + 1}`,
                    blocks: [],
                };
                sheet.push(newPage);
                state.activePageIndex = sheet.length - 1; // Switch to the new page
            }),

        deletePage: (indexToDelete) =>
            set((state) => {
                if (!state.editableClass) return;
                state.editableClass.characterSheet = state.editableClass.characterSheet.filter(
                    (_, index) => index !== indexToDelete,
                );
                if (state.activePageIndex >= indexToDelete) {
                    state.activePageIndex = Math.max(0, state.activePageIndex - 1);
                }
            }),

        renamePage: (pageIndex, newName) =>
            set((state) => {
                if (!state.editableClass) return;
                const pageToRename = state.editableClass.characterSheet[pageIndex];
                if (pageToRename) {
                    pageToRename.name = newName;
                }
            }),

        setSelectedBlockId: (blockId) => set({ selectedBlockId: blockId }),
        setActivePageIndex: (index) => set({ activePageIndex: index }),
        setIsSaving: (isSaving) => set({ isSaving }),
    })),
);
