// src/pages/views/CharacterSheetPage.tsx

/**
 * COMMIT: fix(character-sheet): resolve TypeScript error for style prop
 *
 * Rationale:
 * A TypeScript error (ts2322) was occurring because the `style` object for
 * absolutely positioned blocks was not explicitly typed. TypeScript's inferred
 * type for `position: 'absolute'` was `string`, which is not specific
 * enough for React's CSSProperties type.
 *
 * Implementation Details:
 * - Imported the `CSSProperties` type from React.
 * - Explicitly cast the `style` object for each rendered block as
 * `CSSProperties`. This informs TypeScript that the provided values (like
 * 'absolute') are valid, resolving the type mismatch error.
 */
import { useState, useEffect, type FC, type CSSProperties } from 'react';
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

            <main className="page-canvas__container">
                <div className="page-canvas__page">
                    {currentPage?.blocks.map((block) => {
                        // FIX: Explicitly type the style object as CSSProperties.
                        const style: CSSProperties = {
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

            {sheet.length > 1 && (
                <PageControls
                    pages={sheet}
                    activePageIndex={activePageIndex}
                    onSelectPage={setActivePageIndex}
                    onAddPage={() => {}}
                    onDeletePage={() => {}}
                />
            )}
        </div>
    );
};
