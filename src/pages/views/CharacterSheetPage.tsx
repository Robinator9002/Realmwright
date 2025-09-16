// src/pages/views/CharacterSheetPage.tsx

import { useState, useEffect, type FC, type CSSProperties } from 'react';
import { ArrowLeft, Save } from 'lucide-react';
import { useView } from '../../context/global/ViewContext';
import { db } from '../../db/db';
import { updateCharacter } from '../../db/queries/character/character.queries';
import { getStatDefinitionsForWorld } from '../../db/queries/character/stat.queries';
import { getAbilityTreesForWorld } from '../../db/queries/character/ability.queries';
// REWORK: Add InventoryItem to imports
import type {
    Character,
    CharacterClass,
    StatDefinition,
    AbilityTree,
    InventoryItem,
} from '../../db/types';
// FIX: Correct and standardize all import paths for sheet blocks.
import { DetailsBlock } from '../../components/specific/SheetBlocks/character/DetailsBlock';
import { StatsBlock } from '../../components/specific/SheetBlocks/character/StatsBlock';
import { AbilityTreeBlock } from '../../components/specific/SheetBlocks/content/AbilityTreeBlock';
import { RichTextBlock } from '../../components/specific/SheetBlocks/content/RichTextBlock';
import { InventoryBlock } from '../../components/specific/SheetBlocks/character/InventoryBlock';
import { NotesBlock } from '../../components/specific/SheetBlocks/content/NotesBlock';
import { CharacterSheetPageControls } from '../../components/specific/Character/CharacterSheetPageControls';

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
    const [statDefinitions, setStatDefinitions] = useState<StatDefinition[]>([]);
    const [allAbilityTrees, setAllAbilityTrees] = useState<AbilityTree[]>([]);
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
                const [stats, trees] = await Promise.all([
                    getStatDefinitionsForWorld(char.worldId),
                    getAbilityTreesForWorld(char.worldId),
                ]);
                setCharacter(char);
                setCharacterClass(charClass);
                setStatDefinitions(stats);
                setAllAbilityTrees(trees);
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
                        const style: CSSProperties = {
                            position: 'absolute',
                            left: `${(block.layout.x / PAGE_COLUMNS) * 100}%`,
                            top: `${block.layout.y * PAGE_ROW_HEIGHT}px`,
                            width: `${(block.layout.w / PAGE_COLUMNS) * 100}%`,
                            height: `${block.layout.h * PAGE_ROW_HEIGHT}px`,
                            zIndex: block.layout.zIndex,
                        };

                        const renderBlockContent = () => {
                            const liveBlock = {
                                ...block,
                                content: character.instanceData[block.id] ?? block.content,
                            };

                            switch (liveBlock.type) {
                                case 'details':
                                    return <DetailsBlock characterClass={characterClass} />;
                                case 'stats':
                                    return (
                                        <StatsBlock
                                            baseStats={character.stats}
                                            statDefinitions={statDefinitions}
                                        />
                                    );
                                case 'ability_tree':
                                    return (
                                        <AbilityTreeBlock
                                            block={liveBlock}
                                            allTrees={allAbilityTrees}
                                        />
                                    );
                                case 'rich_text':
                                    // FIX: Pass the change handler for consistency.
                                    return (
                                        <RichTextBlock
                                            block={liveBlock}
                                            onContentChange={(newContent: string) =>
                                                handleInstanceDataChange(liveBlock.id, newContent)
                                            }
                                        />
                                    );
                                case 'notes':
                                    // FIX: Explicitly type the newContent parameter.
                                    return (
                                        <NotesBlock
                                            block={liveBlock}
                                            onContentChange={(newContent: string) =>
                                                handleInstanceDataChange(liveBlock.id, newContent)
                                            }
                                        />
                                    );
                                case 'inventory':
                                    // FIX: Explicitly type the newContent parameter.
                                    return (
                                        <InventoryBlock
                                            block={liveBlock}
                                            onContentChange={(newContent: InventoryItem[]) =>
                                                handleInstanceDataChange(liveBlock.id, newContent)
                                            }
                                        />
                                    );

                                default:
                                    return null;
                            }
                        };

                        return (
                            <div key={block.id} style={style} className="sheet-block">
                                <div className="sheet-block__content">{renderBlockContent()}</div>
                            </div>
                        );
                    })}
                </div>
            </main>

            {sheet.length > 1 && (
                <CharacterSheetPageControls
                    pages={sheet}
                    activePageIndex={activePageIndex}
                    onSelectPage={setActivePageIndex}
                />
            )}
        </div>
    );
};
