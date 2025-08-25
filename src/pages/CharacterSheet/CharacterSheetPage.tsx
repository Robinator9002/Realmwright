// src/pages/CharacterSheet/CharacterSheetPage.tsx

/**
 * COMMIT: refactor(character-sheet): implement dynamic grid layout rendering
 *
 * Rationale:
 * This commit completes the "Persona Forge" overhaul by transforming the
 * CharacterSheetPage into a dynamic renderer. It now reads the grid-based
 * layout from a CharacterClass blueprint and populates it with live data
 * from a specific Character instance.
 *
 * Implementation Details:
 * - **Data Fetching:** The component now fetches both the character and their
 * associated class blueprint on mount.
 * - **Dynamic Layout:** The main content area is now a CSS grid that mirrors
 * the ClassSheetEditor's canvas. It reads the `width` property from each
 * block in the class blueprint to correctly apply `sheet-block--full-width`
 * or `sheet-block--half-width` classes, rendering the designed layout.
 * - **Data Hydration:** The page now passes the live `character` data down
 * to the `SheetBlockRenderer`, which correctly displays instance-specific
 * data (like inventory and notes) instead of the class defaults.
 * - **In-Place Editing:** Implemented `handleInstanceDataChange` to update the
 * component's state as the user edits fields, and a `handleSaveChanges`
 * function to persist this `instanceData` back to the database.
 */
import { useState, useEffect, type FC } from 'react';
import { ArrowLeft, Save } from 'lucide-react';
import { useView } from '../../context/ViewContext';
import { db } from '../../db/db';
import { updateCharacter } from '../../db/queries/character.queries';
import type { Character, CharacterClass } from '../../db/types';
import { SheetBlockRenderer } from '../../components/specific/Class/SheetBlockRenderer';

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

    // --- DATA FETCHING ---
    // This effect fetches the core character and class data when the page loads.
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

    // Updates the character's instanceData in the local state.
    const handleInstanceDataChange = (blockId: string, newContent: any) => {
        setCharacter((prevCharacter) => {
            if (!prevCharacter) return null;
            const newInstanceData = {
                ...prevCharacter.instanceData,
                [blockId]: newContent,
            };
            return { ...prevCharacter, instanceData: newInstanceData };
        });
    };

    // Persists changes made to the character sheet to the database.
    const handleSaveChanges = async () => {
        if (!character) return;
        setIsSaving(true);
        try {
            await updateCharacter(character.id!, {
                instanceData: character.instanceData,
                stats: character.stats, // Also save stats in case they become editable
            });
            // In a real app, you would show a success toast notification here.
        } catch (err) {
            setError('Failed to save changes.');
        } finally {
            setIsSaving(false);
        }
    };

    // Navigates back to the main world dashboard.
    const handleGoBack = () => {
        setCurrentView('world_dashboard');
    };

    // --- RENDER LOGIC ---

    if (isLoading) {
        return <div className="character-sheet-page">Loading character sheet...</div>;
    }

    if (error) {
        return <div className="character-sheet-page error-message">{error}</div>;
    }

    if (!character || !characterClass) {
        return <div className="character-sheet-page">No data to display.</div>;
    }

    // Get the first page of the character sheet blueprint.
    const currentPage = characterClass.characterSheet?.[0];

    // --- JSX ---
    return (
        <div className="character-sheet-page">
            <header className="character-sheet-page__header">
                <button onClick={handleGoBack} className="button">
                    <ArrowLeft size={16} /> Back to Dashboard
                </button>
                <h1 className="character-sheet-page__title">{character.name}</h1>
                <div className="character-sheet-page__actions">
                    <span className={`status-badge`}>{character.type}</span>
                    <button
                        onClick={handleSaveChanges}
                        className="button button--primary"
                        disabled={isSaving}
                    >
                        <Save size={16} /> {isSaving ? 'Saving...' : 'Save Changes'}
                    </button>
                </div>
            </header>

            {/* REWORK: The content area is now a grid that mimics the editor's canvas. */}
            <main className="character-sheet-page__content">
                {currentPage &&
                    currentPage.blocks.map((block) => {
                        // Determine the grid class based on the blueprint's layout property.
                        const blockWidthClass =
                            block.width === 'full'
                                ? 'sheet-block--full-width'
                                : 'sheet-block--half-width';

                        return (
                            <div key={block.id} className={`sheet-block ${blockWidthClass}`}>
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
            </main>
        </div>
    );
};
