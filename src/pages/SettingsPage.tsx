// src/pages/SettingsPage.tsx

import type { FC } from 'react';
import { useView } from '../context/ViewContext';
import { useSettings, type Theme } from '../context/SettingsContext';
import { useWorld } from '../context/WorldContext';

// An array to define our theme options for easy mapping
const themeOptions: { id: Theme; name: string; description: string }[] = [
    {
        id: 'modern-dark',
        name: 'Modern Dark',
        description: 'A sleek, dark interface with a sans-serif font.',
    },
    {
        id: 'modern-light',
        name: 'Modern Light',
        description: 'A clean, bright interface with a sans-serif font.',
    },
    {
        id: 'ancient-dark',
        name: 'Ancient Dark',
        description: 'A dark, parchment-inspired look with a serif font.',
    },
    {
        id: 'ancient-light',
        name: 'Ancient Light',
        description: 'A light, parchment-inspired look with a serif font.',
    },
];

const AppearanceSettings: FC = () => {
    const { theme, setTheme } = useSettings();

    return (
        <div className="settings-panel">
            <h3 className="settings-panel__title">Theme</h3>
            <div className="theme-selector">
                {themeOptions.map((option) => (
                    <button
                        key={option.id}
                        onClick={() => setTheme(option.id)}
                        className={`theme-option ${
                            theme === option.id ? 'theme-option--active' : ''
                        }`}
                    >
                        <span className="theme-option__name">{option.name}</span>
                        <span className="theme-option__description">{option.description}</span>
                    </button>
                ))}
            </div>
        </div>
    );
};

export const SettingsPage: FC = () => {
    const { activeSettingsTab, setCurrentView } = useView();
    const { selectedWorld } = useWorld();

    const handleGoBack = () => {
        if (selectedWorld) {
            setCurrentView('world_dashboard');
        } else {
            setCurrentView('worlds');
        }
    };

    return (
        <div className="settings-page">
            <div className="settings-page__header">
                <h1 className="settings-page__title">Settings</h1>
                <button onClick={handleGoBack} className="button button--primary">
                    &larr; Back
                </button>
            </div>

            <div className="settings-page__content">
                {activeSettingsTab === 'appearance' && <AppearanceSettings />}
            </div>
        </div>
    );
};
