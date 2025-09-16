// src/components/specific/SheetBlocks/content/NotesBlock.tsx

import { useState, type FC } from 'react';
import { Edit, Save } from 'lucide-react';
// REWORK: Import the full SheetBlock type and the store hook.
import type { SheetBlock } from '../../../../db/types';
import { useClassSheetStore } from '../../../../stores/classSheetEditor.store';

// REWORK: The component now accepts the entire block object.
export interface NotesBlockProps {
    block: SheetBlock;
}

export const NotesBlock: FC<NotesBlockProps> = ({ block }) => {
    // --- ZUSTAND STORE ---
    const updateBlockContent = useClassSheetStore((state) => state.updateBlockContent);

    // --- LOCAL UI STATE ---
    const [isEditing, setIsEditing] = useState(false);
    const [text, setText] = useState(block.content || '');

    // --- DERIVED STATE ---
    // The placeholder is now read from the block's configuration.
    const placeholder = block.config?.placeholder || '*Empty note. Click edit to add content.*';

    // --- EVENT HANDLERS ---
    const handleSave = () => {
        updateBlockContent(block.id, text);
        setIsEditing(false);
    };

    // --- RENDER LOGIC ---
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
            <div className="notes-block__display">{block.content || placeholder}</div>
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
