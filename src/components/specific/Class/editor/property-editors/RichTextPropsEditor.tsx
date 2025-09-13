// src/components/specific/Class/editor/property-editors/RichTextPropsEditor.tsx

/**
 * COMMIT: refactor(class-sheet): connect RichTextPropsEditor to Zustand store
 *
 * Rationale:
 * Continuing Phase 3.2, this commit refactors the RichTextPropsEditor to
 * connect directly to the `useClassSheetStore`, eliminating its props.
 *
 * Implementation Details:
 * - The component's props interface has been removed.
 * - It now uses the `useClassSheetStore` hook to select the `selectedBlock`
 * and the `updateBlockContent` action.
 * - This decouples the component and resolves the corresponding TypeScript
 * error in the parent `BlockSpecificPropertiesEditor`.
 */
import type { FC } from 'react';
// NEW: Import the Zustand store.
import { useClassSheetStore } from '../../../../../stores/classSheetEditor.store';

// This component no longer needs props.
export const RichTextPropsEditor: FC = () => {
    // --- ZUSTAND STORE ---
    const { selectedBlock, updateBlockContent } = useClassSheetStore((state) => ({
        // Select the specific state and actions needed.
        selectedBlock: state.selectedBlock,
        updateBlockContent: state.updateBlockContent,
    }));

    // If no block is selected (which shouldn't happen if this component is rendered),
    // we can return null as a safeguard.
    if (!selectedBlock) {
        return null;
    }

    return (
        <div className="form__group">
            <label className="form__label">Content (Markdown)</label>
            <textarea
                className="form__textarea"
                rows={10}
                value={selectedBlock.content || ''}
                onChange={(e) => updateBlockContent(selectedBlock.id, e.target.value)}
            />
        </div>
    );
};
