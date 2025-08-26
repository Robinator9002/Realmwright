// src/pages/CharacterSheet/CharacterSheetPage.tsx

/**
 * COMMIT: refactor(character-sheet): implement multi-page canvas rendering
 *
 * Rationale:
 * To complete the WYSIWYG editor feature, the live character sheet must now
 * render the multi-page, free-form layouts designed in the ClassSheetEditor.
 * This commit overhauls the page to function as a read-only canvas renderer.
 *
 * Implementation Details:
 * - The component now manages an `activePageIndex` state to track the visible page.
 * - It renders the `<PageControls />` component, providing the UI for page navigation.
 * - The main content area has been replaced with a `.page-canvas__page` container.
 * - Blocks are now rendered using absolute positioning, with their `top`, `left`,
 * `width`, and `height` styles calculated directly from the `layout` object
 * stored in the class blueprint. This perfectly recreates the designed layout.
 * - The `SheetBlockRenderer` continues to hydrate these positioned blocks with
 * live character data.
 */
import { useState, useEffect, type FC } from 'react';
import { ArrowLeft, Save } from 'lucide-react';
import { useView } from '../../context/ViewContext';
import { db } from '../../db/db';
import { updateCharacter } from '../../db/queries/character.queries';
import type { Character, CharacterClass } from '../../db/types';
import { SheetBlockRenderer } from '../../components/specific/Class/SheetBlockRenderer';
import { PageControls } from '../../components/specific/Class/PageControls';

// Constants for converting grid units to pixels, matching the editor's canvas.
const PAGE_COLUMNS = 48;
const PAGE_ROW_HEIGHT = 10;
const PAGE_WIDTH = 1000;

// The main component for the character sheet view.
export const CharacterSheetPage: FC = () => {
    // --- HOOKS ---
    const { characterIdForSheet, setCurrentView } = useView();

    // --- STATE ---
    const [character, setCharacter] = useState<Character | null>(null);
    const [characterClass, setCharacterClass] = useState<CharacterClass | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    // NEW: State to track the currently visible page.
    const [activePageIndex, setActivePageIndex] = useState(0);

    // --- DATA FETCHING ---
    useEffect(() => {
        if (!characterIdForSheet) {
            setError('No character selected.');
            setIsLoading(false);
            return;
        }
        const fetchData = async () => {
            try {
                const char = await db.characters.get(characterIdForSheet);
                if (!char) throw new Error('Character not found.');
                const charClass = await db.characterClasses.get(char.classId);
                if (!charClass) throw new Error('Character class blueprint not found.');
                setCharacter(char);
                setCharacterClass(charClass);
            } catch (err) {
                setError((err as Error).message);
            } finally {
                setIsLoading(false);
            }
        };
        fetchData();
    }, [characterIdForSheet]);

    // --- EVENT HANDLERS ---
    const handleInstanceDataChange = (blockId: string, newContent: any) => {
        setCharacter((prev) => {
            if (!prev) return null;
            return {
                ...prev,
                instanceData: { ...prev.instanceData, [blockId]: newContent },
            };
        });
    };

    const handleSaveChanges = async () => {
        if (!character) return;
        setIsSaving(true);
        try {
            await updateCharacter(character.id!, {
                instanceData: character.instanceData,
                stats: character.stats,
            });
        } catch (err) {
            setError('Failed to save changes.');
        } finally {
            setIsSaving(false);
        }
    };

    const handleGoBack = () => setCurrentView('world_dashboard');

    // --- RENDER LOGIC ---
    if (isLoading) return <div className="character-sheet-page">Loading...</div>;
    if (error) return <div className="character-sheet-page error-message">{error}</div>;
    if (!character || !characterClass) return <div className="character-sheet-page">No data.</div>;

    const sheet = characterClass.characterSheet || [];
    const currentPage = sheet[activePageIndex];

    return (
        <div className="character-sheet-page">
            <header className="character-sheet-page__header">
                <button onClick={handleGoBack} className="button">
                    <ArrowLeft size={16} /> Back
                </button>
                <h1 className="character-sheet-page__title">{character.name}</h1>
                <div className="character-sheet-page__actions">
                    <span className="status-badge">{character.type}</span>
                    <button
                        onClick={handleSaveChanges}
                        className="button button--primary"
                        disabled={isSaving}
                    >
                        <Save size={16} /> {isSaving ? 'Saving...' : 'Save'}
                    </button>
                </div>
            </header>

            {/* REWORK: Render a read-only canvas for the current page */}
            <main className="page-canvas__container">
                <div className="page-canvas__page">
                    {currentPage?.blocks.map((block) => {
                        // Convert grid units to pixel values for absolute positioning.
                        const style = {
                            position: 'absolute',
                            left: `${(block.layout.x / PAGE_COLUMNS) * 100}%`,
                            top: `${block.layout.y * PAGE_ROW_HEIGHT}px`,
                            width: `${(block.layout.w / PAGE_COLUMNS) * 100}%`,
                            height: `${block.layout.h * PAGE_ROW_HEIGHT}px`,
                            zIndex: block.layout.zIndex,
                        };
                        return (
                            <div key={block.id} style={style} className="sheet-block">
                                <div className="sheet-block__content">
                                    <SheetBlockRenderer
                                        block={block}
                                        character={character}
                                        characterClass={characterClass}
                                        onContentChange={handleInstanceDataChange}
                                    />
                                </div>
                            </div>
                        );
                    })}
                </div>
            </main>

            {/* Render page controls if there is more than one page */}
            {sheet.length > 1 && (
                <PageControls
                    pages={sheet}
                    activePageIndex={activePageIndex}
                    onSelectPage={setActivePageIndex}
                    // Add/Delete are disabled in the read-only view
                    onAddPage={() => {}}
                    onDeletePage={() => {}}
                />
            )}
        </div>
    );
};
