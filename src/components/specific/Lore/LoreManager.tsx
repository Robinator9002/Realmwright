// src/components/specific/LoreManager/LoreManager.tsx
import { useState, useEffect, useCallback } from 'react';
import type { FC } from 'react';
import { Settings } from 'lucide-react';
import { useWorld } from '../../../context/feature/WorldContext';
import { useModal } from '../../../context/global/ModalContext';
import {
    addLoreEntry,
    getLoreForWorld,
    updateLoreEntry,
    deleteLoreEntry,
} from '../../../db/queries/lore.queries';
import type { LoreEntry } from '../../../db/types';
import { ManageModal } from '../../modal/ManageModal';

/**
 * A component for creating, listing, and managing lore entries for the active world.
 */
export const LoreManager: FC = () => {
    const { selectedWorld } = useWorld();
    const { showModal } = useModal();

    // State for the list of lore entries
    const [loreEntries, setLoreEntries] = useState<LoreEntry[]>([]);

    // State for the creation form fields
    const [newLoreName, setNewLoreName] = useState('');
    const [newLoreDescription, setNewLoreDescription] = useState('');
    const [newLoreCategory, setNewLoreCategory] = useState('');
    const [newLoreContent, setNewLoreContent] = useState('');

    // Standard loading and error states
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // State for the ManageModal
    const [managingLoreEntry, setManagingLoreEntry] = useState<LoreEntry | null>(null);
    const isManageModalOpen = !!managingLoreEntry;

    // Fetches all lore entries for the currently selected world.
    const fetchLore = useCallback(async () => {
        if (!selectedWorld?.id) return;
        try {
            setError(null);
            setIsLoading(true);
            const worldLore = await getLoreForWorld(selectedWorld.id);
            setLoreEntries(worldLore);
        } catch (err) {
            setError('Failed to load lore entries.');
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    }, [selectedWorld]);

    useEffect(() => {
        fetchLore();
    }, [fetchLore]);

    // Handles the submission of the new lore entry form.
    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();
        if (!newLoreName.trim() || !selectedWorld?.id) {
            showModal('alert', {
                title: 'Invalid Input',
                message: 'Lore entry title cannot be empty.',
            });
            return;
        }

        try {
            await addLoreEntry({
                name: newLoreName,
                description: newLoreDescription,
                category: newLoreCategory,
                content: newLoreContent,
                worldId: selectedWorld.id,
            });
            // Reset form fields
            setNewLoreName('');
            setNewLoreDescription('');
            setNewLoreCategory('');
            setNewLoreContent('');
            await fetchLore(); // Refresh the list
        } catch (err) {
            setError('Failed to save the new lore entry.');
        }
    };

    // --- Handlers for the ManageModal ---

    // Saves changes from the ManageModal.
    // Note: The current ManageModal only edits name and description.
    // The other fields are preserved from the original item.
    const handleSaveLore = async (updatedLore: LoreEntry) => {
        try {
            await updateLoreEntry(updatedLore.id!, {
                name: updatedLore.name,
                description: updatedLore.description,
                category: updatedLore.category, // Preserved from original
                content: updatedLore.content, // Preserved from original
            });
            await fetchLore();
        } catch (err) {
            setError('Failed to update the lore entry.');
        }
    };

    // Triggers the deletion confirmation process.
    const handleDeleteLore = (loreId: number) => {
        setManagingLoreEntry(null); // Close the manage modal
        showModal('confirmation', {
            title: 'Delete Lore Entry?',
            message: 'Are you sure you want to delete this lore entry? This action is permanent.',
            onConfirm: async () => {
                try {
                    await deleteLoreEntry(loreId);
                    await fetchLore();
                } catch (err) {
                    setError('Failed to delete the lore entry.');
                }
            },
        });
    };

    return (
        <>
            <div className="panel">
                <h2 className="panel__title">Lore</h2>

                <div className="panel__form-section">
                    <h3 className="panel__form-title">Create New Lore Entry</h3>
                    <form onSubmit={handleSubmit} className="form">
                        <div className="form__group">
                            <label htmlFor="loreName" className="form__label">
                                Title
                            </label>
                            <input
                                id="loreName"
                                type="text"
                                value={newLoreName}
                                onChange={(e) => setNewLoreName(e.target.value)}
                                className="form__input"
                                placeholder="e.g., The Sundering of the Elves"
                            />
                        </div>
                        <div className="form__group">
                            <label htmlFor="loreDescription" className="form__label">
                                One-Line Summary
                            </label>
                            <input
                                id="loreDescription"
                                type="text"
                                value={newLoreDescription}
                                onChange={(e) => setNewLoreDescription(e.target.value)}
                                className="form__input"
                                placeholder="A brief description for list view."
                            />
                        </div>
                        <div className="form__group">
                            <label htmlFor="loreCategory" className="form__label">
                                Category
                            </label>
                            <input
                                id="loreCategory"
                                type="text"
                                value={newLoreCategory}
                                onChange={(e) => setNewLoreCategory(e.target.value)}
                                className="form__input"
                                placeholder="e.g., Faction, Location, History"
                            />
                        </div>
                        <div className="form__group">
                            <label htmlFor="loreContent" className="form__label">
                                Content
                            </label>
                            <textarea
                                id="loreContent"
                                value={newLoreContent}
                                onChange={(e) => setNewLoreContent(e.target.value)}
                                className="form__textarea"
                                rows={6}
                                placeholder="Write the full text of the lore entry here..."
                            />
                        </div>
                        <button type="submit" className="button button--primary">
                            Create Entry
                        </button>
                    </form>
                </div>

                <div className="panel__list-section">
                    <h3 className="panel__list-title">The Chronicle</h3>
                    {error && <p className="error-message">{error}</p>}
                    {isLoading ? (
                        <p>Loading lore...</p>
                    ) : loreEntries.length > 0 ? (
                        <ul className="panel__list">
                            {loreEntries.map((entry) => (
                                <li key={entry.id} className="panel__list-item">
                                    <div className="panel__item-details">
                                        <h4 className="panel__item-title">{entry.name}</h4>
                                        <p className="panel__item-description">
                                            {entry.description}
                                        </p>
                                    </div>
                                    <div className="panel__item-actions">
                                        <button
                                            onClick={() => setManagingLoreEntry(entry)}
                                            className="button"
                                        >
                                            <Settings size={16} /> Manage
                                        </button>
                                        {/* We can use a status badge for the category */}
                                        <span className="status-badge">
                                            {entry.category || 'Uncategorized'}
                                        </span>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p className="panel__empty-message">
                            No lore has been written for this world yet. The page is blank...
                        </p>
                    )}
                </div>
            </div>

            <ManageModal<LoreEntry>
                isOpen={isManageModalOpen}
                onClose={() => setManagingLoreEntry(null)}
                item={managingLoreEntry}
                onSave={handleSaveLore}
                onDelete={handleDeleteLore}
                itemType="Lore Entry"
            />
        </>
    );
};
