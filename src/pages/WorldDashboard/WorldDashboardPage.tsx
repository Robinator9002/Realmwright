// src/pages/WorldDashboard/WorldDashboardPage.tsx
import type { FC } from 'react';
import { useView } from '../../context/ViewContext';
import { CampaignManager } from '../../components/specific/CampaignManager/CampaignManager';
import { CharacterManager } from '../../components/specific/CharacterManager/CharacterManager';
import { LoreManager } from '../../components/specific/LoreManager/LoreManager';
// NEW: Import the real RuleManager component.
import { RuleManager } from '../../components/specific/RuleManager/RuleManager';

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
            case 'lore':
                return <LoreManager />;
            // NEW: Replace the placeholder with the actual RuleManager component.
            case 'rules':
                return <RuleManager />;
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
