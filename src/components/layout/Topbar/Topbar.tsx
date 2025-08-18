// src/components/layout/Topbar/Topbar.tsx
import type { FC } from 'react';
import { Sun, Moon, Settings } from 'lucide-react';
import { useWorld } from '../../../context/WorldContext';
import { useView } from '../../../context/ViewContext';
import { useSettings } from '../../../context/SettingsContext';
import { TabButton } from './TabButton';

export const Topbar: FC = () => {
    const { selectedWorld, clearWorld } = useWorld();
    const { theme, setTheme } = useSettings();
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

    // This can be simplified, but we'll leave it for a future refactor.
    const handleThemeToggle = () => {
        if (theme.includes('modern')) {
            setTheme(theme === 'modern-light' ? 'modern-dark' : 'modern-light');
        } else if (theme.includes('ancient')) {
            setTheme(theme === 'ancient-light' ? 'ancient-dark' : 'ancient-light');
        }
    };

    const isLightMode = theme.includes('light');

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
                    {/* NEW: Add the TabButton for the Lore section. */}
                    <TabButton
                        isActive={activeWorldTab === 'lore'}
                        onClick={() => setActiveWorldTab('lore')}
                    >
                        Lore
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
                        onClick={handleThemeToggle}
                        className="topbar__action-button topbar__action-button--icon"
                    >
                        {isLightMode ? <Sun size={20} /> : <Moon size={20} />}
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
