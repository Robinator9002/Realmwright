// src/stores/classSheetEditor.store.ts

/**
 * COMMIT: feat(store): add action to update block styles
 *
 * Rationale:
 * The `BlockAppearanceSettings` component requires a method to update the
 * visual style properties (e.g., text alignment, colors) of a specific
 * `SheetBlock`. The store lacked this functionality, causing a TypeScript
 * error when the component tried to access the undefined `updateBlockStyles`
 * action.
 *
 * Implementation Details:
 * - Added `updateBlockStyles` to the `Actions` interface, defining its
 * signature to accept a `blockId` and a partial `SheetBlockStyles` object.
 * - Implemented the `updateBlockStyles` function within the store's
 * actions. This new function safely locates the specified block and merges
 * the new styles with any existing styles.
 * - This resolves the compilation error and enables style editing functionality.
 */
import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import type { Layout } from 'react-grid-layout';
import { getStatDefinitionsForWorld } from '../db/queries/character/stat.queries';
import { getAbilityTreesForWorld } from '../db/queries/character/ability.queries';
import type {
    CharacterClass,
    SheetBlock,
    SheetPage,
    StatDefinition,
    AbilityTree,
    SheetBlockStyles,
} from '../db/types';

// --- STATE ---
interface State {
    isSaving: boolean;
    activePageIndex: number;
    selectedBlockId: string | null;
    editableClass: CharacterClass | null;
    pageWidth: number;
    pageHeight: number;
    // Data fetched for the editor
    statDefinitions: StatDefinition[];
    allAbilityTrees: AbilityTree[];
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
    updateBlockStyles: (blockId: string, newStyles: Partial<SheetBlockStyles>) => void;
    updateBaseStat: (statId: number, value: number) => void;
    addPage: () => void;
    deletePage: (pageIndex: number) => void;
    renamePage: (pageIndex: number, newName: string) => void;
    setPageDimensions: (dimensions: { width: number; height: number }) => void;
    setCanvasScale: (scale: number) => void;
    setIsSaving: (isSaving: boolean) => void;
    setActivePageIndex: (index: number) => void;
    setSelectedBlockId: (blockId: string | null) => void;
}

// --- STORE ---
export const useClassSheetStore = create(
    immer<State & Actions>((set) => ({
        // --- INITIAL STATE ---
        isSaving: false,
        activePageIndex: 0,
        selectedBlockId: null,
        editableClass: null,
        pageWidth: 1000,
        pageHeight: 1414,
        statDefinitions: [],
        allAbilityTrees: [],
        canvasScale: 1,

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
        updateBlockStyles: (blockId, newStyles) => {
            set((state) => {
                if (!state.editableClass) return;
                const block = state.editableClass.characterSheet[
                    state.activePageIndex
                ]?.blocks.find((b) => b.id === blockId);

                if (block) {
                    // Using spread to merge existing and new styles
                    block.styles = { ...block.styles, ...newStyles };
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
