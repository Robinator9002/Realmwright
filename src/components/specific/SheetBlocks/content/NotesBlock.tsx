// src/components/specific/SheetBlocks/content/NotesBlock.tsx

/**
 * COMMIT: feat(class-sheet): create NotesBlock component
 *
 * Rationale:
 * This commit introduces the actual `NotesBlock` component that will be
 * rendered on the character sheet canvas. It provides a simple and
 * effective way for users to add and edit text.
 *
 * Implementation Details:
 * - The component's structure is based on the existing RichTextBlock,
 * providing a familiar editing experience (display view with an edit button
 * that reveals a textarea).
 * - It uses local state (`isEditing`, `text`) to manage its own UI without
 * cluttering the global store.
 * - When the user saves their changes, the `onContentChange` prop is called,
 * which is connected to the central store's `updateBlockContent` action.
 * - A unique root class, `notes-block`, has been added to allow for distinct
 * styling.
 */
import { useState, type FC } from 'react';
import { Edit, Save } from 'lucide-react';

export interface NotesBlockProps {
    content: string | undefined;
    onContentChange: (newContent: string) => void;
}

export const NotesBlock: FC<NotesBlockProps> = ({ content, onContentChange }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [text, setText] = useState(content || '');

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
                    placeholder="Enter your notes here..."
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
            <div className="notes-block__display">
                {content || '*Empty note. Click edit to add content.*'}
            </div>
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
