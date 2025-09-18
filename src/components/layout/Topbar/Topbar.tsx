// src/components/layout/Topbar/Topbar.tsx

import type { FC } from 'react';
import {
    Sun,
    Moon,
    Settings,
    Map,
    Pin,
    ScrollText,
    Swords,
    BookUser,
    Gem,
    Library,
    BarChart,
    Sparkles,
} from 'lucide-react';
import { useWorld } from '../../../context/feature/WorldContext';
import { useView } from '../../../context/global/ViewContext';
import { useSettings } from '../../../context/global/SettingsContext';
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
                        <Swords size={16} /> Campaigns
                    </TabButton>
                    <TabButton
                        isActive={activeWorldTab === 'characters'}
                        onClick={() => setActiveWorldTab('characters')}
                    >
                        <BookUser size={16} /> Characters
                    </TabButton>
                    <TabButton
                        isActive={activeWorldTab === 'classes'}
                        onClick={() => setActiveWorldTab('classes')}
                    >
                        <Gem size={16} /> Classes
                    </TabButton>
                    <TabButton
                        isActive={activeWorldTab === 'lore'}
                        onClick={() => setActiveWorldTab('lore')}
                    >
                        <Library size={16} /> Lore
                    </TabButton>
                    <TabButton
                        isActive={activeWorldTab === 'maps'}
                        onClick={() => setActiveWorldTab('maps')}
                    >
                        <Map size={16} /> Maps
                    </TabButton>
                    <TabButton
                        isActive={activeWorldTab === 'locations'}
                        onClick={() => setActiveWorldTab('locations')}
                    >
                        <Pin size={16} /> Locations
                    </TabButton>
                    <TabButton
                        isActive={activeWorldTab === 'quests'}
                        onClick={() => setActiveWorldTab('quests')}
                    >
                        <ScrollText size={16} /> Quests
                    </TabButton>
                    <TabButton
                        isActive={activeWorldTab === 'stats'}
                        onClick={() => setActiveWorldTab('stats')}
                    >
                        <BarChart size={16} /> Stats
                    </TabButton>
                    <TabButton
                        isActive={activeWorldTab === 'abilities'}
                        onClick={() => setActiveWorldTab('abilities')}
                    >
                        <Sparkles size={16} /> Abilities
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
