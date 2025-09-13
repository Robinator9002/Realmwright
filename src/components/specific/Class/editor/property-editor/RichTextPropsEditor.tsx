// src/components/specific/Class/editor/property-editors/RichTextPropsEditor.tsx

/**
 * COMMIT: feat(class-sheet): extract RichTextPropsEditor component
 *
 * Rationale:
 * This commit extracts the UI for editing the properties of a RichTextBlock
 * into its own dedicated component, as part of the ongoing modularization of
 * the PropertiesSidebar.
 *
 * Implementation Details:
 * - The component renders a simple textarea for editing the Markdown-enabled
 * content of the block.
 * - It receives the `selectedBlock` and the `onUpdateBlockContent` callback
 * as props to manage its state.
 */
import type { FC } from 'react';
import type { SheetBlock } from '../../../../../db/types';

interface RichTextPropsEditorProps {
    selectedBlock: SheetBlock;
    onUpdateBlockContent: (blockId: string, content: any) => void;
}

export const RichTextPropsEditor: FC<RichTextPropsEditorProps> = ({
    selectedBlock,
    onUpdateBlockContent,
}) => (
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
