// src/components/specific/Character/CharacterSheetPageControls.tsx

/**
 * COMMIT: feat(character-sheet): create dedicated page controls for viewer
 *
 * Rationale:
 * A major bug was caused by the CharacterSheetPage (the live viewer)
 * incorrectly using the PageControls component from the editor. The editor's
 * controls are a \"smart\" component connected to a Zustand store, while the
 * live viewer needs a simple, \"dumb\" component that accepts props.
 *
 * Implementation Details:
 * - This new component, `CharacterSheetPageControls`, is a simplified,
 * prop-driven version of the editor's controls.
 * - It takes `pages`, `activePageIndex`, and `onSelectPage` as props and has
 * no connection to any external state management.
 * - This decouples the live character sheet viewer from the class editor's
 * internal state, fixing the bug and creating a more robust architecture.
 */
import type { FC } from 'react';
import type { SheetPage } from '../../../db/types';

interface CharacterSheetPageControlsProps {
    pages: SheetPage[];
    activePageIndex: number;
    onSelectPage: (index: number) => void;
}

export const CharacterSheetPageControls: FC<CharacterSheetPageControlsProps> = ({
    pages,
    activePageIndex,
    onSelectPage,
}) => {
    // This component is purely presentational. It has no add/delete/rename functionality.
    return (
        <div className="page-controls">
            <div className="page-controls__tabs">
                {pages.map((page, index) => (
                    <button
                        key={page.id}
                        onClick={() => onSelectPage(index)}
                        className={`page-controls__tab ${
                            index === activePageIndex ? 'page-controls__tab--active' : ''
                        }`}
                    >
                        {page.name || `Page ${index + 1}`}
                    </button>
                ))}
            </div>
        </div>
    );
};
