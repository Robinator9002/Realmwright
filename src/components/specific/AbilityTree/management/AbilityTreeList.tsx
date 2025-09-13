// src/components/specific/AbilityTree/management/AbilityTreeList.tsx

/**
 * COMMIT: feat(abilities): extract AbilityTreeList component
 *
 * Rationale:
 * To continue the refactoring of the AbilityManager, the logic for displaying
 * the list of existing ability trees has been extracted into this dedicated
 * presentational component.
 *
 * Implementation Details:
 * - This component is responsible for rendering the loading, error, empty,
 * and populated states of the ability tree list.
 * - It receives the array of trees and the necessary event handlers
 * (`onManage`, `onOpenEditor`) as props from its parent.
 * - This simplifies the main AbilityManager by offloading all display
 * logic, making the parent's role purely state management.
 */
import type { FC } from 'react';
import { Settings } from 'lucide-react';
import type { AbilityTree } from '../../../../db/types';

interface AbilityTreeListProps {
    trees: AbilityTree[];
    isLoading: boolean;
    error: string | null;
    onManage: (tree: AbilityTree) => void;
    onOpenEditor: (tree: AbilityTree) => void;
}

export const AbilityTreeList: FC<AbilityTreeListProps> = ({
    trees,
    isLoading,
    error,
    onManage,
    onOpenEditor,
}) => {
    const renderContent = () => {
        if (isLoading) {
            return <p>Loading...</p>;
        }
        if (error) {
            return <p className="error-message">{error}</p>;
        }
        if (trees.length === 0) {
            return <p className="panel__empty-message">No ability trees have been created yet.</p>;
        }
        return (
            <ul className="panel__list">
                {trees.map((tree) => (
                    <li key={tree.id} className="panel__list-item">
                        <div className="panel__item-details">
                            <h4 className="panel__item-title">{tree.name}</h4>
                            <p className="panel__item-description">{tree.description}</p>
                        </div>
                        <div className="panel__item-actions">
                            <button onClick={() => onManage(tree)} className="button">
                                <Settings size={16} /> Manage
                            </button>
                            <button
                                onClick={() => onOpenEditor(tree)}
                                className="button button--primary"
                            >
                                Open Editor &rarr;
                            </button>
                        </div>
                    </li>
                ))}
            </ul>
        );
    };

    return (
        <div className="panel__list-section">
            <h3 className="panel__list-title">Existing Trees</h3>
            {renderContent()}
        </div>
    );
};
