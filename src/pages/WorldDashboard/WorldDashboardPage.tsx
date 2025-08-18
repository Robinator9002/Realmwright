// src/pages/WorldDashboard/WorldDashboardPage.tsx
import type { FC } from 'react';
import { useView } from '../../context/ViewContext';
import { CampaignManager } from '../../components/specific/Campaign/CampaignManager';
import { CharacterManager } from '../../components/specific/Character/CharacterManager';
import { LoreManager } from '../../components/specific/Lore/LoreManager';
import { RuleManager } from '../../components/specific/Rules/RuleManager';
// NEW: Import the real AbilityManager component.
import { AbilityManager } from '../../components/specific/AbilityTree/AbilityManager';

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
            case 'rules':
                return <RuleManager />;
            // NEW: Replace the placeholder with the actual AbilityManager component.
            case 'abilities':
                return <AbilityManager />;
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
