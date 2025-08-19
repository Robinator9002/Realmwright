// src/components/specific/SheetBlocks/AbilityTreeBlock.tsx
import { useState, useEffect, type FC } from 'react';
import { useWorld } from '../../../context/WorldContext';
import { getAbilityTreesForWorld } from '../../../db/queries/ability.queries';
import type { AbilityTree } from '../../../db/types';
import { Settings } from 'lucide-react';

export interface AbilityTreeBlockProps {
    // The content property will hold the ID of the selected tree.
    content: number | undefined;
    // A function to save the selected tree ID back to the parent editor.
    onContentChange: (abilityTreeId: number | undefined) => void;
}

/**
 * A sheet block for displaying a selected Ability Tree.
 * Includes a configuration mode to choose which tree to display.
 */
export const AbilityTreeBlock: FC<AbilityTreeBlockProps> = ({ content, onContentChange }) => {
    const { selectedWorld } = useWorld();
    const [allTrees, setAllTrees] = useState<AbilityTree[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isConfiguring, setIsConfiguring] = useState(false);

    useEffect(() => {
        if (selectedWorld?.id) {
            getAbilityTreesForWorld(selectedWorld.id).then((trees) => {
                setAllTrees(trees);
                setIsLoading(false);
            });
        }
    }, [selectedWorld]);

    const selectedTree = allTrees.find((tree) => tree.id === content);

    const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const id = e.target.value ? parseInt(e.target.value, 10) : undefined;
        onContentChange(id);
        setIsConfiguring(false); // Close config mode after selection
    };

    // --- Render Logic ---

    if (isLoading) {
        return <p>Loading ability trees...</p>;
    }

    if (isConfiguring) {
        return (
            <div className="ability-tree-block__config">
                <label htmlFor="tree-select" className="form__label">
                    Select Ability Tree
                </label>
                <select
                    id="tree-select"
                    className="form__select"
                    value={content ?? ''}
                    onChange={handleSelectChange}
                >
                    <option value="">-- None --</option>
                    {allTrees.map((tree) => (
                        <option key={tree.id} value={tree.id}>
                            {tree.name}
                        </option>
                    ))}
                </select>
            </div>
        );
    }

    return (
        <div className="ability-tree-block">
            <div className="ability-tree-block__header">
                <h4 className="ability-tree-block__title">
                    {selectedTree ? selectedTree.name : 'No Tree Selected'}
                </h4>
                <button
                    onClick={() => setIsConfiguring(true)}
                    className="ability-tree-block__config-button"
                    title="Configure Block"
                >
                    <Settings size={16} />
                </button>
            </div>
            <div className="ability-tree-block__content">
                {/* In the future, this will render a read-only view of the tree. */}
                <p className="placeholder-text">
                    {selectedTree
                        ? `Visual display for "${selectedTree.name}" will be rendered here.`
                        : 'Click the gear icon to select an ability tree to display.'}
                </p>
            </div>
        </div>
    );
};
