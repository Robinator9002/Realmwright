// src/pages/WorldDashboard/WorldDashboardPage.tsx
import type { FC } from 'react';
import { useView } from '../../context/ViewContext';
import { CampaignManager } from '../../components/specific/CampaignManager/CampaignManager';
import { CharacterManager } from '../../components/specific/CharacterManager/CharacterManager';

/**
 * A simple placeholder for content that is not yet implemented.
 */
const PlaceholderContent: FC<{ title: string }> = ({ title }) => (
    <div className="bg-gray-800 p-6 rounded-lg">
        <h2 className="text-2xl font-semibold mb-4 capitalize">{title}</h2>
        <p className="text-gray-400">This section is under construction.</p>
    </div>
);

/**
 * Acts as a content switcher for the main world dashboard area.
 * It renders the correct manager component based on the active tab
 * selected in the Topbar.
 */
export const WorldDashboardPage: FC = () => {
    const { activeWorldTab } = useView();

    const renderActiveTabContent = () => {
        switch (activeWorldTab) {
            case 'campaigns':
                return <CampaignManager />;
            case 'characters':
                return <CharacterManager />;
            case 'rules':
                return <PlaceholderContent title="Rules" />;
            // Add cases for other tabs as they are developed
            default:
                return <CampaignManager />; // Default to campaigns view
        }
    };

    return <div className="p-8 max-w-full mx-auto">{renderActiveTabContent()}</div>;
};
