// src/components/specific/AbilityTree/Sidebar/AbilityTreeSidebar.tsx

/**
 * COMMIT: refactor(ability-tree): assemble modular sidebar with panel router
 *
 * This commit refactors the main `AbilityTreeSidebar` component, completing
 * the planned decomposition of the sidebar module.
 *
 * Rationale:
 * The original sidebar was a monolithic component containing all presentation
 * and business logic for creation, editing, and attachment management. This
- * violated the single-responsibility principle and was difficult to maintain.
 *
 * Implementation Details:
 * - The component's props interface has been drastically simplified. It now
 * only accepts props that are managed by its parent page component.
 * - It imports the three new, specialized panel components: `CreateAbilityPanel`,
 * `EditAbilityPanel`, and `ManageAttachmentPanel`.
 * - It uses the `useAbilityTreeEditor` hook to get the `selectedNode`.
 * - A `renderPanel` function acts as a simple router, conditionally rendering
 * the correct panel based on whether a node is selected and what its type is.
 * - This new structure is clean, declarative, and easy to extend with new
 * panel types in the future.
 */
import type { FC } from 'react';
import type { AbilityTree } from '../../../../db/types';
import { useAbilityTreeEditor } from '../../../../context/AbilityTreeEditorContext';

// Import the newly created, focused panel components.
import { CreateAbilityPanel } from './CreateAbilityPanel';
import { EditAbilityPanel } from './EditAbilityPanel';
import { ManageAttachmentPanel } from './ManageAttachmentPanel';
import { AbilityTreeTierControls } from './AbilityTreeTierControls';

// The new props interface is much smaller and more manageable.
interface AbilityTreeSidebarProps {
    availableTrees: AbilityTree[];
    onAddTier: () => void;
    onRemoveTier: () => void;
}

export const AbilityTreeSidebar: FC<AbilityTreeSidebarProps> = ({
    availableTrees,
    onAddTier,
    onRemoveTier,
}) => {
    // The sidebar now gets the data it needs to make decisions from the context.
    const { selectedNode, tree } = useAbilityTreeEditor();

    // This function acts as a "router" for the sidebar's main content area.
    const renderPanel = () => {
        // If no node is selected, show the creation panel.
        if (!selectedNode) {
            return <CreateAbilityPanel />;
        }
        // If the selected node is a socket, show the attachment manager.
        if (selectedNode.type === 'attachmentNode') {
            return <ManageAttachmentPanel availableTrees={availableTrees} />;
        }
        // Otherwise, for any other node type, show the standard edit panel.
        return <EditAbilityPanel />;
    };

    return (
        <aside className="ability-editor-page__sidebar">
            <div className="sidebar__main-content">{renderPanel()}</div>
            {/* The tier controls are a permanent fixture at the bottom of the sidebar. */}
            <AbilityTreeTierControls
                tierCount={tree.tierCount}
                onAddTier={onAddTier}
                onRemoveTier={onRemoveTier}
            />
        </aside>
    );
};
