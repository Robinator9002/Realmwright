// src/pages/WorldDashboard/WorldDashboardPage.tsx
import type { FC } from 'react';
import { useView } from '../../context/ViewContext';
import { CampaignManager } from '../../components/specific/CampaignManager/CampaignManager';
import { CharacterManager } from '../../components/specific/CharacterManager/CharacterManager';
// NEW: Import the real LoreManager component.
import { LoreManager } from '../../components/specific/LoreManager/LoreManager';

/**
 * A simple placeholder for content that is not yet implemented.
 */
const PlaceholderContent: FC<{ title: string }> = ({ title }) => (
    <div className="panel">
        <h2 className="panel__title capitalize">{title}</h2>
        <p className="panel__empty-message">This section is under construction.</p>
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
            // NEW: Replace the placeholder with the actual LoreManager component.
            case 'lore':
                return <LoreManager />;
            case 'rules':
                return <PlaceholderContent title="Rules" />;
            default:
                return <CampaignManager />;
        }
    };

    return (
        <div className="world-dashboard">
            <div className="world-dashboard__grid">{renderActiveTabContent()}</div>
        </div>
    );
};
