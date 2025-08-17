// src/pages/SettingsPage/SettingsPage.tsx
import type { FC } from 'react';
import { useView } from '../../context/ViewContext';
import { useSettings } from '../../context/SettingsContext';

/**
 * A component to render the content for the 'Appearance' tab.
 */
const AppearanceSettings: FC = () => {
    const { theme, toggleTheme } = useSettings();

    return (
        <div>
            <h3 className="text-xl font-semibold mb-4">Theme</h3>
            <div className="flex items-center justify-between bg-gray-800 p-4 rounded-lg">
                <p>
                    Current Theme: <span className="font-semibold capitalize">{theme}</span>
                </p>
                <button
                    onClick={toggleTheme}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-md font-semibold"
                >
                    Toggle Theme
                </button>
            </div>
        </div>
    );
};

/**
 * The main container for all application settings.
 * It uses the ViewContext to determine which settings tab to display.
 */
export const SettingsPage: FC = () => {
    const { activeSettingsTab } = useView();

    return (
        <div className="p-8 max-w-4xl mx-auto">
            <h1 className="text-4xl font-bold mb-8">Settings</h1>

            {/* This is where we switch between different settings content panes */}
            <div>
                {activeSettingsTab === 'appearance' && <AppearanceSettings />}
                {/* Add other settings tabs here later, e.g., */}
                {/* {activeSettingsTab === 'data' && <DataSettings />} */}
            </div>
        </div>
    );
};
