// src/components/specific/SheetBlocks/content/RichTextBlock.tsx

import { useState, type FC } from 'react';
import { Edit, Save } from 'lucide-react';
// NEW: Import the safe Markdown renderer.
// In a real project, you would add this with `npm install react-markdown`.
import ReactMarkdown from 'react-markdown';

export interface RichTextBlockProps {
    content: string | undefined;
    onContentChange: (newContent: string) => void;
}

/**
 * A sheet block for displaying and editing free-form rich text content.
 */
export const RichTextBlock: FC<RichTextBlockProps> = ({ content, onContentChange }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [text, setText] = useState(content || '');

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
                    placeholder="Enter your text here... Supports Markdown."
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
            {/* FIX: Replaced dangerouslySetInnerHTML with the safe ReactMarkdown component. */}
            <div className="rich-text-block__display">
                <ReactMarkdown>
                    {content || '*Empty text block. Click edit to add content.*'}
                </ReactMarkdown>
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
