// src/components/specific/Class/editor/property-editors/AbilityTreePropsEditor.tsx

/**
 * COMMIT: feat(class-sheet): extract AbilityTreePropsEditor component
 *
 * Rationale:
 * To continue the modularization of the PropertiesSidebar, this commit
 * extracts the UI for editing the properties of an AbilityTreeBlock into
 * its own dedicated component.
 *
 * Implementation Details:
 * - This component is responsible for fetching all available ability trees
 * in the current world.
 * - It renders a dropdown select menu, allowing the user to link a specific
 * ability tree to the sheet block by saving the tree's ID to the block's
 * `content` property.
 */
import { useState, useEffect, type FC } from 'react';
import { useWorld } from '../../../../../context/feature/WorldContext';
import { getAbilityTreesForWorld } from '../../../../../db/queries/character/ability.queries';
import type { SheetBlock, AbilityTree } from '../../../../../db/types';

interface AbilityTreePropsEditorProps {
    selectedBlock: SheetBlock;
    onUpdateBlockContent: (blockId: string, content: any) => void;
}

export const AbilityTreePropsEditor: FC<AbilityTreePropsEditorProps> = ({
    selectedBlock,
    onUpdateBlockContent,
}) => {
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
