// src/components/specific/SheetBlocks/content/RichTextBlock.tsx

import { useState, type FC } from 'react';
import { Edit, Save } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
// REWORK: Import the full SheetBlock type and the store hook.
import type { SheetBlock } from '../../../../db/types';
import { useClassSheetStore } from '../../../../stores/classSheetEditor.store';

// REWORK: The component now accepts the entire block object.
export interface RichTextBlockProps {
    block: SheetBlock;
}

/**
 * A sheet block for displaying and editing free-form rich text content.
 */
export const RichTextBlock: FC<RichTextBlockProps> = ({ block }) => {
    // --- ZUSTAND STORE ---
    // We need the update action to save changes.
    const updateBlockContent = useClassSheetStore((state) => state.updateBlockContent);

    // --- LOCAL UI STATE ---
    // This state is only for managing the edit mode, which is appropriate.
    const [isEditing, setIsEditing] = useState(false);
    // The text state is initialized from the block's main content.
    const [text, setText] = useState(block.content || '');

    // --- DERIVED STATE ---
    // The placeholder is now read from the block's configuration.
    const placeholder =
        block.config?.placeholder || '*Empty text block. Click edit to add content.*';

    // --- EVENT HANDLERS ---
    const handleSave = () => {
        updateBlockContent(block.id, text);
        setIsEditing(false);
    };

    // --- RENDER LOGIC ---
    if (isEditing) {
        return (
            <div className="rich-text-block rich-text-block--editing">
                <textarea
                    className="form__textarea"
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    rows={8}
                    // The textarea also uses the configured placeholder.
                    placeholder={placeholder}
                />
                <button
                    onClick={handleSave}
                    className="button button--primary rich-text-block__save-button"
                >
                    <Save size={16} /> Save
                </button>
            </div>
        );
    }

    return (
        <div className="rich-text-block">
            <div className="rich-text-block__display">
                <ReactMarkdown>{block.content || placeholder}</ReactMarkdown>
            </div>
            <button
                onClick={() => setIsEditing(true)}
                className="rich-text-block__edit-button"
                title="Edit Block"
            >
                <Edit size={16} />
            </button>
        </div>
    );
};
