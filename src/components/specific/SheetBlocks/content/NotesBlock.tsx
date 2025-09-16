// src/components/specific/SheetBlocks/content/NotesBlock.tsx

import { useState, type FC } from 'react';
import { Edit, Save } from 'lucide-react';
// REWORK: Import the full block type.
import type { SheetBlock } from '../../../../db/types';

// REWORK: The component now accepts the entire block object and a change handler.
export interface NotesBlockProps {
    block: SheetBlock;
    onContentChange: (newContent: string) => void;
}

export const NotesBlock: FC<NotesBlockProps> = ({ block, onContentChange }) => {
    // --- DERIVED STATE & PROPS ---
    const content = block.content || '';
    const placeholder = block.config?.placeholder || '*Empty note. Click edit to add content.*';

    // --- LOCAL UI STATE ---
    const [isEditing, setIsEditing] = useState(false);
    const [text, setText] = useState(content);

    const handleSave = () => {
        onContentChange(text);
        setIsEditing(false);
    };

    if (isEditing) {
        return (
            <div className="notes-block notes-block--editing">
                <textarea
                    className="form__textarea"
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    rows={8}
                    placeholder={placeholder}
                />
                <button
                    onClick={handleSave}
                    className="button button--primary notes-block__save-button"
                >
                    <Save size={16} /> Save
                </button>
            </div>
        );
    }

    return (
        <div className="notes-block">
            <div className="notes-block__display">{content || placeholder}</div>
            <button
                onClick={() => setIsEditing(true)}
                className="notes-block__edit-button"
                title="Edit Note"
            >
                <Edit size={16} />
            </button>
        </div>
    );
};
