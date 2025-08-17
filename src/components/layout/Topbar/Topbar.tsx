// src/components/layout/Topbar/Topbar.tsx
import type { FC } from 'react';
import { useWorld } from '../../../context/WorldContext';
import { useView } from '../../../context/ViewContext';
import { useSettings } from '../../../context/SettingsContext';
import { TabButton } from './TabButton';

/**
 * The main application Topbar. It is context-aware and displays
 * navigation and actions relevant to the current view.
 */
export const Topbar: FC = () => {
    const { selectedWorld, clearWorld } = useWorld();
    const { theme, toggleTheme } = useSettings();
    const {
        currentView,
        setCurrentView,
        activeWorldTab,
        setActiveWorldTab,
        activeSettingsTab,
        setActiveSettingsTab,
    } = useView();

    // --- Navigation Handlers ---

    const handleExitWorld = () => {
        clearWorld(); // Clear the selected world from the world context
        setCurrentView('worlds'); // Switch the view back to the world manager
    };

    const handleGoToSettings = () => {
        setCurrentView('settings');
    };

    const handleGoHome = () => {
        // If inside a world, just exit to the world manager
        if (selectedWorld) {
            clearWorld();
        }
        // Always go back to the main world selection screen
        setCurrentView('worlds');
    };

    // --- Render Logic ---

    const renderTabs = () => {
        if (currentView === 'world_dashboard') {
            return (
                <nav className="flex items-end space-x-1">
                    <TabButton
                        isActive={activeWorldTab === 'campaigns'}
                        onClick={() => setActiveWorldTab('campaigns')}
                    >
                        Campaigns
                    </TabButton>
                    <TabButton
                        isActive={activeWorldTab === 'characters'}
                        onClick={() => setActiveWorldTab('characters')}
                    >
                        Characters
                    </TabButton>
                    <TabButton
                        isActive={activeWorldTab === 'rules'}
                        onClick={() => setActiveWorldTab('rules')}
                    >
                        Rules
                    </TabButton>
                </nav>
            );
        }
        if (currentView === 'settings') {
            return (
                <nav className="flex items-end space-x-1">
                    <TabButton
                        isActive={activeSettingsTab === 'appearance'}
                        onClick={() => setActiveSettingsTab('appearance')}
                    >
                        Appearance
                    </TabButton>
                    <TabButton
                        isActive={activeSettingsTab === 'data'}
                        onClick={() => setActiveSettingsTab('data')}
                    >
                        Data
                    </TabButton>
                </nav>
            );
        }
        return null;
    };

    return (
        <header className="bg-gray-900 text-white sticky top-0 z-10 border-b border-gray-700">
            <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    {/* Left side: Title (now a button to go home) */}
                    <div className="flex-shrink-0">
                        <button
                            onClick={handleGoHome}
                            className="text-2xl font-bold hover:text-blue-400 transition-colors"
                        >
                            {selectedWorld ? selectedWorld.name : 'Realmwright'}
                        </button>
                    </div>

                    {/* Right side: Actions */}
                    <div className="flex items-center space-x-4">
                        {/* Show Exit World button only when a world is selected */}
                        {selectedWorld && (
                            <button
                                onClick={handleExitWorld}
                                className="px-3 py-2 text-sm rounded-md hover:bg-gray-700"
                            >
                                &larr; Exit World
                            </button>
                        )}
                        <button onClick={toggleTheme} className="p-2 rounded-md hover:bg-gray-700">
                            {theme === 'light' ? '🌙' : '☀️'}
                        </button>
                        <button
                            onClick={handleGoToSettings}
                            className="p-2 rounded-md hover:bg-gray-700"
                        >
                            ⚙️ Settings
                        </button>
                    </div>
                </div>
            </div>

            {renderTabs() && (
                <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="border-t border-gray-700 pt-1">{renderTabs()}</div>
                </div>
            )}
        </header>
    );
};
