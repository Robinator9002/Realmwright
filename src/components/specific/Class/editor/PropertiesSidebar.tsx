// src/components/specific/Class/editor/PropertiesSidebar.tsx

/**
 * COMMIT: feat(class-sheet): implement dynamic component properties sidebar
 *
 * Rationale:
 * To transform the editor into a fully functional content authoring tool, this
 * commit replaces the static placeholder in the PropertiesSidebar with a
 * dynamic, context-aware component. The sidebar now renders specific editing
 * controls based on the type of the selected sheet block.
 *
 * Implementation Details:
 * - The component's props have been updated to accept the new state management
 * handlers from ClassSheetEditor (`onUpdateBlockContent`, `onUpdateBaseStat`).
 * - A new internal sub-component, `BlockSpecificProperties`, has been created.
 * This component contains a `switch` statement that renders the appropriate
 * editor UI for the selected block's type.
 * - **StatsBlock Editor:** Fetches stat definitions and renders number inputs to
 * modify the class's `baseStats`.
 * - **AbilityTreeBlock Editor:** Fetches available ability trees and renders a
 * dropdown to link a tree to the block.
 * - **RichTextBlock Editor:** Renders a textarea for Markdown content.
 * - **InventoryBlock Editor:** Provides a UI to define a class's starting inventory.
 * - This change resolves the previous TypeScript error and completes the core
 * content authoring functionality for the Class Editor.
 */
import { useState, useEffect, type FC } from 'react';
import { useWorld } from '../../../../context/feature/WorldContext';
import { getStatDefinitionsForWorld } from '../../../../db/queries/character/stat.queries';
import { getAbilityTreesForWorld } from '../../../../db/queries/character/ability.queries';
import type {
    SheetBlock,
    CharacterClass,
    StatDefinition,
    AbilityTree,
    SheetBlockLayout,
} from '../../../../db/types';
import type { InventoryItem } from '../../SheetBlocks/character/InventoryBlock';
import { Plus, Trash2 } from 'lucide-react';

// --- SUB-COMPONENT FOR STATS BLOCK PROPERTIES ---
const StatsPropsEditor: FC<{
    characterClass: CharacterClass;
    onUpdateBaseStat: (statId: number, value: number) => void;
}> = ({ characterClass, onUpdateBaseStat }) => {
    const { selectedWorld } = useWorld();
    const [statDefs, setStatDefs] = useState<StatDefinition[]>([]);

    useEffect(() => {
        if (selectedWorld?.id) {
            getStatDefinitionsForWorld(selectedWorld.id).then(setStatDefs);
        }
    }, [selectedWorld]);

    return (
        <div className="properties-sidebar__grid">
            {statDefs.map((def) => (
                <div key={def.id} className="form__group">
                    <label className="form__label">{def.name}</label>
                    <input
                        type="number"
                        className="form__input"
                        value={characterClass.baseStats[def.id!] ?? def.defaultValue}
                        onChange={(e) =>
                            onUpdateBaseStat(def.id!, parseInt(e.target.value, 10) || 0)
                        }
                    />
                </div>
            ))}
        </div>
    );
};

// --- SUB-COMPONENT FOR ABILITY TREE BLOCK PROPERTIES ---
const AbilityTreePropsEditor: FC<{
    selectedBlock: SheetBlock;
    onUpdateBlockContent: (blockId: string, content: any) => void;
}> = ({ selectedBlock, onUpdateBlockContent }) => {
    const { selectedWorld } = useWorld();
    const [allTrees, setAllTrees] = useState<AbilityTree[]>([]);

    useEffect(() => {
        if (selectedWorld?.id) {
            getAbilityTreesForWorld(selectedWorld.id).then(setAllTrees);
        }
    }, [selectedWorld]);

    return (
        <div className="form__group">
            <label className="form__label">Ability Tree</label>
            <select
                className="form__select"
                value={selectedBlock.content ?? ''}
                onChange={(e) =>
                    onUpdateBlockContent(
                        selectedBlock.id,
                        e.target.value ? parseInt(e.target.value, 10) : undefined,
                    )
                }
            >
                <option value="">-- Select a Tree --</option>
                {allTrees.map((tree) => (
                    <option key={tree.id} value={tree.id}>
                        {tree.name}
                    </option>
                ))}
            </select>
        </div>
    );
};

// --- SUB-COMPONENT FOR RICH TEXT BLOCK PROPERTIES ---
const RichTextPropsEditor: FC<{
    selectedBlock: SheetBlock;
    onUpdateBlockContent: (blockId: string, content: any) => void;
}> = ({ selectedBlock, onUpdateBlockContent }) => (
    <div className="form__group">
        <label className="form__label">Content (Markdown)</label>
        <textarea
            className="form__textarea"
            rows={10}
            value={selectedBlock.content || ''}
            onChange={(e) => onUpdateBlockContent(selectedBlock.id, e.target.value)}
        />
    </div>
);

// --- SUB-COMPONENT FOR INVENTORY BLOCK PROPERTIES ---
const InventoryPropsEditor: FC<{
    selectedBlock: SheetBlock;
    onUpdateBlockContent: (blockId: string, content: any) => void;
}> = ({ selectedBlock, onUpdateBlockContent }) => {
    const items = (selectedBlock.content as InventoryItem[]) || [];

    const handleItemChange = (
        index: number,
        field: keyof InventoryItem,
        value: string | number,
    ) => {
        const newItems = [...items];
        // @ts-ignore
        newItems[index][field] = value;
        onUpdateBlockContent(selectedBlock.id, newItems);
    };

    const handleAddItem = () => {
        const newItem: InventoryItem = {
            id: crypto.randomUUID(),
            name: '',
            quantity: 1,
            description: '',
        };
        onUpdateBlockContent(selectedBlock.id, [...items, newItem]);
    };

    const handleRemoveItem = (index: number) => {
        const newItems = items.filter((_, i) => i !== index);
        onUpdateBlockContent(selectedBlock.id, newItems);
    };

    return (
        <div className="inventory-editor">
            <label className="form__label">Starting Items</label>
            {items.map((item, index) => (
                <div key={item.id} className="inventory-editor__item">
                    <input
                        type="number"
                        placeholder="Qty"
                        className="form__input inventory-editor__qty"
                        value={item.quantity}
                        onChange={(e) =>
                            handleItemChange(index, 'quantity', parseInt(e.target.value, 10) || 1)
                        }
                    />
                    <input
                        type="text"
                        placeholder="Item Name"
                        className="form__input"
                        value={item.name}
                        onChange={(e) => handleItemChange(index, 'name', e.target.value)}
                    />
                    <button
                        onClick={() => handleRemoveItem(index)}
                        className="button button--danger button--icon"
                    >
                        <Trash2 size={16} />
                    </button>
                </div>
            ))}
            <button onClick={handleAddItem} className="button mt-2">
                <Plus size={16} /> Add Item
            </button>
        </div>
    );
};

// --- DYNAMIC SWITCH COMPONENT FOR BLOCK-SPECIFIC PROPERTIES ---
const BlockSpecificProperties: FC<
    Omit<PropertiesSidebarProps, 'onUpdateBlockLayout' | 'onDeselect'>
> = (props) => {
    if (!props.selectedBlock) return null;

    switch (props.selectedBlock.type) {
        case 'stats':
            return (
                <StatsPropsEditor
                    characterClass={props.characterClass}
                    onUpdateBaseStat={props.onUpdateBaseStat}
                />
            );
        case 'ability_tree':
            return (
                <AbilityTreePropsEditor
                    selectedBlock={props.selectedBlock}
                    onUpdateBlockContent={props.onUpdateBlockContent}
                />
            );
        case 'rich_text':
            return (
                <RichTextPropsEditor
                    selectedBlock={props.selectedBlock}
                    onUpdateBlockContent={props.onUpdateBlockContent}
                />
            );
        case 'inventory':
            return (
                <InventoryPropsEditor
                    selectedBlock={props.selectedBlock}
                    onUpdateBlockContent={props.onUpdateBlockContent}
                />
            );
        default:
            return (
                <p className="panel__empty-message--small">
                    This block type has no specific properties to edit.
                </p>
            );
    }
};

// --- MAIN SIDEBAR COMPONENT ---
export interface PropertiesSidebarProps {
    selectedBlock: SheetBlock | null;
    characterClass: CharacterClass;
    onUpdateBlockLayout: (blockId: string, newLayout: Partial<SheetBlockLayout>) => void;
    onUpdateBlockContent: (blockId: string, newContent: any) => void;
    onUpdateBaseStat: (statId: number, value: number) => void;
    onDeselect: () => void;
}

export const PropertiesSidebar: FC<PropertiesSidebarProps> = ({
    selectedBlock,
    onUpdateBlockLayout,
    onDeselect,
    ...rest // Pass remaining props to the specific editor
}) => {
    if (!selectedBlock) {
        return null;
    }

    const handleLayoutChange = (field: keyof SheetBlockLayout, value: string) => {
        const numericValue = parseInt(value, 10) || 0;
        onUpdateBlockLayout(selectedBlock.id, { [field]: numericValue });
    };

    return (
        <div className="properties-sidebar">
            <div className="properties-sidebar__header">
                <h3 className="sidebar__title">Properties</h3>
                <button onClick={onDeselect} className="properties-sidebar__close-button">
                    &times;
                </button>
            </div>

            <div className="properties-sidebar__content">
                <div className="properties-sidebar__section">
                    <h4 className="properties-sidebar__section-title">Layout</h4>
                    <div className="properties-sidebar__grid">
                        <div className="form__group">
                            <label className="form__label">X</label>
                            <input
                                type="number"
                                className="form__input"
                                value={selectedBlock.layout.x}
                                onChange={(e) => handleLayoutChange('x', e.target.value)}
                            />
                        </div>
                        <div className="form__group">
                            <label className="form__label">Y</label>
                            <input
                                type="number"
                                className="form__input"
                                value={selectedBlock.layout.y}
                                onChange={(e) => handleLayoutChange('y', e.target.value)}
                            />
                        </div>
                        <div className="form__group">
                            <label className="form__label">Width</label>
                            <input
                                type="number"
                                className="form__input"
                                value={selectedBlock.layout.w}
                                onChange={(e) => handleLayoutChange('w', e.target.value)}
                            />
                        </div>
                        <div className="form__group">
                            <label className="form__label">Height</label>
                            <input
                                type="number"
                                className="form__input"
                                value={selectedBlock.layout.h}
                                onChange={(e) => handleLayoutChange('h', e.target.value)}
                            />
                        </div>
                    </div>
                </div>

                <div className="properties-sidebar__section">
                    <h4 className="properties-sidebar__section-title">Component Properties</h4>
                    <BlockSpecificProperties selectedBlock={selectedBlock} {...rest} />
                </div>
            </div>
        </div>
    );
};
