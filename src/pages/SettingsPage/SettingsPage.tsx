// src/pages/SettingsPage/SettingsPage.tsx
import type { FC } from 'react';
import { useView } from '../../context/ViewContext';
import { useSettings } from '../../context/SettingsContext';
import { useWorld } from '../../context/WorldContext';

const AppearanceSettings: FC = () => {
    const { theme, toggleTheme } = useSettings();

    return (
        <div className="settings-panel">
            <h3 className="settings-panel__title">Theme</h3>
            <div className="settings-panel__row">
                <p>
                    Current Theme: <span className="settings-panel__value">{theme}</span>
                </p>
                <button onClick={toggleTheme} className="button button--primary">
                    Toggle Theme
                </button>
            </div>
        </div>
    );
};

export const SettingsPage: FC = () => {
    const { activeSettingsTab, setCurrentView } = useView();
    const { selectedWorld } = useWorld();

    const handleGoBack = () => {
        // If a world is selected, go back to the world dashboard.
        // Otherwise, go back to the main world manager.
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
