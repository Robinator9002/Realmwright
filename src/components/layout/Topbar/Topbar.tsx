// src/components/layout/Topbar/Topbar.tsx
import type { FC } from 'react';
// Import the necessary icons from lucide-react
import { Sun, Moon, Settings } from 'lucide-react';
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

    const handleExitWorld = () => {
        clearWorld();
        setCurrentView('worlds');
    };

    const handleGoToSettings = () => {
        setCurrentView('settings');
    };

    const handleGoHome = () => {
        if (selectedWorld) {
            clearWorld();
        }
        setCurrentView('worlds');
    };

    const renderTabs = () => {
        if (currentView === 'world_dashboard') {
            return (
                <nav className="topbar__tabs">
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
                <nav className="topbar__tabs">
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
        <header className="topbar">
            <div className="topbar__main-content">
                <div className="topbar__title-container">
                    <button onClick={handleGoHome} className="topbar__title">
                        {selectedWorld ? selectedWorld.name : 'Realmwright'}
                    </button>
                </div>

                <div className="topbar__actions">
                    {selectedWorld && (
                        <button onClick={handleExitWorld} className="topbar__action-button">
                            &larr; Exit World
                        </button>
                    )}
                    <button
                        onClick={toggleTheme}
                        className="topbar__action-button topbar__action-button--icon"
                    >
                        {/* FIX: Replaced emojis with robust Lucide icons */}
                        {theme === 'light' ? <Sun size={20} /> : <Moon size={20} />}
                    </button>
                    <button
                        onClick={handleGoToSettings}
                        className="topbar__action-button topbar__action-button--icon"
                    >
                        <Settings size={20} />
                    </button>
                </div>
            </div>

            {renderTabs()}
        </header>
    );
};
