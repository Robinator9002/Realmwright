// src/pages/CharacterSheet/CharacterSheetPage.tsx
import { useState, useEffect, type FC } from 'react';
import { ArrowLeft } from 'lucide-react';
import { useView } from '../../context/ViewContext';
import { db } from '../../db/db';
import type { Character, CharacterClass, SheetBlock } from '../../db/types';
import { DetailsBlock } from '../../components/specific/SheetBlocks/DetailsBlock';
import { StatsBlock } from '../../components/specific/SheetBlocks/StatsBlock';
import { AbilityTreeBlock } from '../../components/specific/SheetBlocks/AbilityTreeBlock';
import { RichTextBlock } from '../../components/specific/SheetBlocks/RichTextBlock';
import { InventoryBlock } from '../../components/specific/SheetBlocks/InventoryBlock';

// A simple renderer component to display the correct block based on its type.
const BlockRenderer: FC<{
    block: SheetBlock;
    character: Character;
    characterClass: CharacterClass;
}> = ({ block, character, characterClass }) => {
    // In a real sheet, you'd also pass functions to update character.instanceData
    const onContentChange = (newContent: any) => {
        console.log(`Block ${block.id} content changed:`, newContent);
        // Here you would update the character's instanceData in the database.
    };

    switch (block.type) {
        case 'details':
            // Details block uses data from the class blueprint.
            return <DetailsBlock characterClass={characterClass} />;
        case 'stats':
            // Stats block uses the character's own stat values.
            return <StatsBlock baseStats={character.stats} />;
        case 'ability_tree':
            return <AbilityTreeBlock content={block.content} onContentChange={onContentChange} />;
        case 'rich_text':
            return <RichTextBlock content={block.content} onContentChange={onContentChange} />;
        case 'inventory':
            // Inventory gets its data from the character's instanceData.
            return (
                <InventoryBlock
                    content={character.instanceData?.[block.id] || []}
                    onContentChange={onContentChange}
                />
            );
        default:
            return (
                <div className="sheet-block__header">
                    <span className="sheet-block__type">Unknown Block: {block.type}</span>
                </div>
            );
    }
};

// The main component for the character sheet view.
export const CharacterSheetPage: FC = () => {
    const { characterIdForSheet, setCurrentView } = useView();
    const [character, setCharacter] = useState<Character | null>(null);
    const [characterClass, setCharacterClass] = useState<CharacterClass | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!characterIdForSheet) {
            setError('No character selected.');
            setIsLoading(false);
            return;
        }

        const fetchData = async () => {
            try {
                const char = await db.characters.get(characterIdForSheet);
                if (!char) {
                    throw new Error('Character not found.');
                }
                const charClass = await db.characterClasses.get(char.classId);
                if (!charClass) {
                    throw new Error('Character class blueprint not found.');
                }
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

    const handleGoBack = () => {
        setCurrentView('world_dashboard');
    };

    if (isLoading) {
        return <div className="character-sheet-page">Loading character sheet...</div>;
    }

    if (error) {
        return <div className="character-sheet-page error-message">{error}</div>;
    }

    if (!character || !characterClass) {
        return <div className="character-sheet-page">No data to display.</div>;
    }

    const currentPage = characterClass.characterSheet?.[0];

    return (
        <div className="character-sheet-page">
            <div className="character-sheet-page__header">
                <button onClick={handleGoBack} className="button">
                    <ArrowLeft size={16} /> Back to Dashboard
                </button>
                <h1 className="character-sheet-page__title">{character.name}</h1>
                <span className={`status-badge`}>{character.type}</span>
            </div>
            <div className="character-sheet-page__content">
                {currentPage &&
                    currentPage.blocks.map((block) => (
                        <div key={block.id} className="sheet-block">
                            <BlockRenderer
                                block={block}
                                character={character}
                                characterClass={characterClass}
                            />
                        </div>
                    ))}
            </div>
        </div>
    );
};
