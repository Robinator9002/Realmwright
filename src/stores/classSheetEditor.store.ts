// src/stores/classSheetEditor.store.ts

/**
 * COMMIT: fix(class-sheet): add missing allAbilityTrees property to store state
 *
 * Rationale:
 * A TypeScript error was occurring in consuming components because the
 * `allAbilityTrees` property, while fetched and set in the `init` action, was
 * never formally declared in the store's `State` interface.
 *
 * Implementation Details:
 * - Added `allAbilityTrees: AbilityTree[]` to the `State` interface.
 * - Initialized `allAbilityTrees` to an empty array in the initial state.
 * - This change ensures the store's type definition accurately reflects its
 * shape, resolving the downstream TypeScript error.
 */
import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import type { Layout } from 'react-grid-layout';
import type {
    CharacterClass,
    SheetBlock,
    SheetPage,
    StatDefinition,
    AbilityTree,
} from '../db/types';
import { getStatDefinitionsForWorld } from '../db/queries/character/stat.queries';
import { getAbilityTreesForWorld } from '../db/queries/character/ability.queries';

// --- STATE ---
interface State {
    isSaving: boolean;
    activePageIndex: number;
    selectedBlockId: string | null;
    editableClass: CharacterClass | null;
    selectedBlock: SheetBlock | null;
    pageWidth: number;
    pageHeight: number;
    // Data pre-fetched for the editor to use.
    statDefinitions: StatDefinition[];
    // FIX: Declare the missing property.
    allAbilityTrees: AbilityTree[];
}

// --- ACTIONS ---
interface Actions {
    init: (characterClass: CharacterClass) => void;
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
        // FIX: Initialize the new property.
        allAbilityTrees: [],
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

            // Pre-fetch all necessary data for the editor session.
            const [statDefinitions, allAbilityTrees] = await Promise.all([
                getStatDefinitionsForWorld(worldId),
                getAbilityTreesForWorld(worldId),
            ]);

            set((state) => {
                state.editableClass = JSON.parse(JSON.stringify(characterClass));
                state.activePageIndex = 0;
                state.selectedBlockId = null;
                state.pageWidth = 1000;
                state.pageHeight = 1414;
                // Set the fetched data into the store.
                state.statDefinitions = statDefinitions;
                state.allAbilityTrees = allAbilityTrees;
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
