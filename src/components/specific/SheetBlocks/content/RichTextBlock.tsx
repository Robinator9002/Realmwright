// src/components/specific/SheetBlocks/content/RichTextBlock.tsx

import { useState, type FC } from 'react';
import { Edit, Save } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
// REWORK: Import the full block type.
import type { SheetBlock } from '../../../../db/types';

// REWORK: The component now accepts an onContentChange prop and is store-agnostic.
export interface RichTextBlockProps {
    block: SheetBlock;
    onContentChange: (newContent: string) => void;
}

/**
 * A sheet block for displaying and editing free-form rich text content.
 */
export const RichTextBlock: FC<RichTextBlockProps> = ({ block, onContentChange }) => {
    // --- DERIVED STATE & PROPS ---
    const content = block.content || '';
    const placeholder =
        block.config?.placeholder || '*Empty text block. Click edit to add content.*';

    // --- LOCAL UI STATE ---
    const [isEditing, setIsEditing] = useState(false);
    const [text, setText] = useState(content);

    const handleSave = () => {
        onContentChange(text);
        setIsEditing(false);
    };

    if (isEditing) {
        return (
            <div className="rich-text-block rich-text-block--editing">
                <textarea
                    className="form__textarea"
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    rows={8}
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
                <ReactMarkdown>{content || placeholder}</ReactMarkdown>
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
