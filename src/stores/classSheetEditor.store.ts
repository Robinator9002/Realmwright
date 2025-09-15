// src/stores/classSheetEditor.store.ts

/**
 * COMMIT: fix(class-sheet): synchronize canvas scale via Zustand store to fix drag bug
 *
 * Rationale:
 * A persistent bug caused react-grid-layout's drag calculations to use a
 * stale scale value after zooming. The previous fix (using a React `key`)
 * was insufficient. This commit implements a more robust solution by making
 * the Zustand store the single source of truth for the canvas's scale.
 *
 * Implementation Details:
 * - A new `canvasScale` property has been added to the store's state,
 * initialized to 1.
 * - A corresponding `setCanvasScale` action has been added.
 * - The PageCanvas component will now use the `onTransformed` callback from
 * the zoom library to call `setCanvasScale`, ensuring the store is always
 * up-to-date. The grid layout will, in turn, read this value from the
 * store, guaranteeing perfect synchronization and correct drag calculations.
 */
import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import type { Layout } from 'react-grid-layout';
import {
    getStatDefinitionsForWorld,
    getAbilityTreesForWorld,
} from '../db/queries/character/ability.queries';
import type {
    CharacterClass,
    SheetBlock,
    SheetPage,
    StatDefinition,
    AbilityTree,
} from '../db/types';

// --- STATE ---
interface State {
    isSaving: boolean;
    activePageIndex: number;
    selectedBlockId: string | null;
    editableClass: CharacterClass | null;
    selectedBlock: SheetBlock | null;
    pageWidth: number;
    pageHeight: number;
    // Data fetched for the editor
    statDefinitions: StatDefinition[];
    allAbilityTrees: AbilityTree[];
    // NEW: Add canvas scale to the store for synchronization.
    canvasScale: number;
}

// --- ACTIONS ---
interface Actions {
    init: (characterClass: CharacterClass) => Promise<void>;
    addBlock: (blockType: SheetBlock['type']) => void;
    deleteBlock: (blockId: string) => void;
    handleLayoutChange: (newLayout: Layout[]) => void;
    updateBlockLayout: (blockId: string, newLayout: Partial<SheetBlock['layout']>) => void;
    updateBlockContent: (blockId: string, newContent: any) => void;
    updateBaseStat: (statId: number, value: number) => void;
    addPage: () => void;
    deletePage: (pageIndex: number) => void;
    renamePage: (pageIndex: number, newName: string) => void;
    setPageDimensions: (dimensions: { width: number; height: number }) => void;
    // NEW: Add an action to update the canvas scale.
    setCanvasScale: (scale: number) => void;
    setIsSaving: (isSaving: boolean) => void;
    setActivePageIndex: (index: number) => void;
    setSelectedBlockId: (blockId: string | null) => void;
}

// --- STORE ---
export const useClassSheetStore = create(
    immer<State & Actions>((set, get) => ({
        // --- INITIAL STATE ---
        isSaving: false,
        activePageIndex: 0,
        selectedBlockId: null,
        editableClass: null,
        pageWidth: 1000,
        pageHeight: 1414,
        statDefinitions: [],
        allAbilityTrees: [],
        // NEW: Initialize canvas scale.
        canvasScale: 1,
        // The derived selectedBlock is calculated from other state pieces.
        get selectedBlock() {
            const { editableClass, activePageIndex, selectedBlockId } = get();
            if (!editableClass || !selectedBlockId) return null;
            return (
                editableClass.characterSheet[activePageIndex]?.blocks.find(
                    (b) => b.id === selectedBlockId,
                ) || null
            );
        },

        // --- ACTIONS ---
        init: async (characterClass) => {
            const worldId = characterClass.worldId;
            const [stats, trees] = await Promise.all([
                getStatDefinitionsForWorld(worldId),
                getAbilityTreesForWorld(worldId),
            ]);

            set((state) => {
                state.editableClass = JSON.parse(JSON.stringify(characterClass));
                state.statDefinitions = stats;
                state.allAbilityTrees = trees;
                // Reset transient state
                state.activePageIndex = 0;
                state.selectedBlockId = null;
                state.pageWidth = 1000;
                state.pageHeight = 1414;
                state.canvasScale = 1;
            });
        },
        setIsSaving: (isSaving) => set({ isSaving }),
        setActivePageIndex: (index) => set({ activePageIndex: index, selectedBlockId: null }),
        setSelectedBlockId: (blockId) => set({ selectedBlockId: blockId }),
        setPageDimensions: (dimensions) => {
            set((state) => {
                state.pageWidth = dimensions.width;
                state.pageHeight = dimensions.height;
            });
        },
        // NEW: Implement the scale update action.
        setCanvasScale: (scale) => {
            set({ canvasScale: scale });
        },
        addBlock: (blockType) => {
            set((state) => {
                if (!state.editableClass) return;
                if (state.editableClass.characterSheet.length === 0) {
                    state.editableClass.characterSheet.push({
                        id: crypto.randomUUID(),
                        name: 'Main Page',
                        blocks: [],
                    });
                }
                const currentPageBlocks =
                    state.editableClass.characterSheet[state.activePageIndex].blocks;
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
            });
        },
        deleteBlock: (blockId) => {
            set((state) => {
                if (!state.editableClass) return;
                const currentPage = state.editableClass.characterSheet[state.activePageIndex];
                currentPage.blocks = currentPage.blocks.filter((b) => b.id !== blockId);
                state.selectedBlockId = null;
            });
        },
        handleLayoutChange: (newLayout) => {
            set((state) => {
                if (!state.editableClass) return;
                const currentPage = state.editableClass.characterSheet[state.activePageIndex];
                currentPage.blocks.forEach((block) => {
                    const layoutItem = newLayout.find((item) => item.i === block.id);
                    if (layoutItem) {
                        block.layout = { ...block.layout, ...layoutItem };
                    }
                });
            });
        },
        updateBlockLayout: (blockId, newLayout) => {
            set((state) => {
                if (!state.editableClass) return;
                const block = state.editableClass.characterSheet[
                    state.activePageIndex
                ]?.blocks.find((b) => b.id === blockId);
                if (block) {
                    block.layout = { ...block.layout, ...newLayout };
                }
            });
        },
        updateBlockContent: (blockId, newContent) => {
            set((state) => {
                if (!state.editableClass) return;
                const block = state.editableClass.characterSheet[
                    state.activePageIndex
                ]?.blocks.find((b) => b.id === blockId);
                if (block) {
                    block.content = newContent;
                }
            });
        },
        updateBaseStat: (statId, value) => {
            set((state) => {
                if (state.editableClass) {
                    state.editableClass.baseStats[statId] = value;
                }
            });
        },
        addPage: () => {
            set((state) => {
                if (!state.editableClass) return;
                const newPage: SheetPage = {
                    id: crypto.randomUUID(),
                    name: `Page ${state.editableClass.characterSheet.length + 1}`,
                    blocks: [],
                };
                state.editableClass.characterSheet.push(newPage);
                state.activePageIndex = state.editableClass.characterSheet.length - 1;
            });
        },
        deletePage: (pageIndex) => {
            set((state) => {
                if (!state.editableClass) return;
                state.editableClass.characterSheet = state.editableClass.characterSheet.filter(
                    (_, index) => index !== pageIndex,
                );
                if (state.activePageIndex >= pageIndex) {
                    state.activePageIndex = Math.max(0, state.activePageIndex - 1);
                }
            });
        },
        renamePage: (pageIndex, newName) => {
            set((state) => {
                if (state.editableClass) {
                    state.editableClass.characterSheet[pageIndex].name = newName;
                }
            });
        },
    })),
);
