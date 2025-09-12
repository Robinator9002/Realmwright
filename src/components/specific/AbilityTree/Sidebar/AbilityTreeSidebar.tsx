// src/components/specific/AbilityTree/Sidebar/AbilityTreeSidebar.tsx

/**
 * COMMIT: refactor(ability-tree): simplify sidebar props after context update
 *
 * This commit updates the `AbilityTreeSidebar` to align with the new reactive
 * context.
 *
 * Rationale:
 * Since the `AbilityTreeTierControls` will now source its state and actions
 * directly from the context, the sidebar no longer needs to act as an
 * intermediary.
 *
 * Implementation Details:
 * - The `onAddTier` and `onRemoveTier` props have been removed from the
 * component's interface and its rendered child.
 * - This further decouples the sidebar and simplifies the component hierarchy.
 */
import type { FC } from 'react';
import type { AbilityTree } from '../../../../db/types';
import { useAbilityTreeEditor } from '../../../../context/feature/AbilityTreeEditorContext';

import { CreateAbilityPanel } from './CreateAbilityPanel';
import { EditAbilityPanel } from './EditAbilityPanel';
import { ManageAttachmentPanel } from './ManageAttachmentPanel';
import { AbilityTreeTierControls } from './AbilityTreeTierControls';

interface AbilityTreeSidebarProps {
    availableTrees: AbilityTree[];
}

export const AbilityTreeSidebar: FC<AbilityTreeSidebarProps> = ({ availableTrees }) => {
    const { selectedNode } = useAbilityTreeEditor();

    const renderPanel = () => {
        if (!selectedNode) {
            return <CreateAbilityPanel />;
        }
        if (selectedNode.type === 'attachmentNode') {
            return <ManageAttachmentPanel availableTrees={availableTrees} />;
        }
        return <EditAbilityPanel />;
    };

    return (
        <aside className="ability-editor-page__sidebar">
            <div className="sidebar__main-content">{renderPanel()}</div>
            {/* TierControls is now self-sufficient and requires no props */}
            <AbilityTreeTierControls />
        </aside>
    );
};
