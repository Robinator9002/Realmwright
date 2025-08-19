// src/components/specific/Class/ClassSheetEditor.tsx
import { type FC } from 'react';
import { ArrowLeft } from 'lucide-react';
import type { CharacterClass } from '../../../db/types';

export interface ClassSheetEditorProps {
    characterClass: CharacterClass;
    onBack: () => void; // Function to return to the ClassManager list
}

/**
 * A full-page editor for designing the character sheet layout for a specific class.
 */
export const ClassSheetEditor: FC<ClassSheetEditorProps> = ({ characterClass, onBack }) => {
    // We will add state here to manage the sheet layout (pages, blocks, etc.)
    // For now, it's just a placeholder.

    return (
        <div className="panel sheet-editor">
            <div className="panel__header-actions">
                <button onClick={onBack} className="button">
                    <ArrowLeft size={16} /> Back to Class List
                </button>
                <h2 className="panel__title" style={{ border: 'none', padding: 0 }}>
                    Designing Sheet for: {characterClass.name}
                </h2>
                <button className="button button--primary">Save Sheet Layout</button>
            </div>

            <div className="sheet-editor__content">
                <div className="sheet-editor__canvas">
                    {/* The main area where pages and blocks will be rendered */}
                    <p>Character Sheet Canvas Area - Coming Soon!</p>
                </div>
                <div className="sheet-editor__sidebar">
                    {/* The sidebar for adding new blocks to the sheet */}
                    <h3 className="sidebar__title">Add Blocks</h3>
                    <p>Block selection UI - Coming Soon!</p>
                </div>
            </div>
        </div>
    );
};
