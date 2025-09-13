// src/components/specific/SheetBlocks/content/NotesBlock.tsx

/**
 * COMMIT: feat(class-sheet): create NotesBlock component
 *
 * Rationale:
 * As part of the final polishing stage of the Class Editor alpha, this commit
 * introduces a new, versatile "Notes" block. This provides users with a
 * generic, unformatted text area for private GM notes, flavor text, or any
 * other custom information they wish to include on a character sheet.
 *
 * Implementation Details:
 * - The component's structure is based on the existing RichTextBlock,
 * providing a familiar editing experience (display view with an edit button
 * that reveals a textarea).
 * - It uses the 'react-markdown' library to safely render user-provided text.
 * - A unique root class, `notes-block`, has been added to allow for distinct
 * styling to differentiate it from other text blocks.
 */
import { useState, type FC } from 'react';
import { Edit, Save } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

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
                    placeholder="Enter your notes here... Supports Markdown."
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
                <ReactMarkdown>
                    {content || '*Empty notes block. Click edit to add content.*'}
                </ReactMarkdown>
            </div>
            <button
                onClick={() => setIsEditing(true)}
                className="notes-block__edit-button"
                title="Edit Notes"
            >
                <Edit size={16} />
            </button>
        </div>
    );
};
