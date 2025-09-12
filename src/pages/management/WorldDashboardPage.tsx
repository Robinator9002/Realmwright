// src/pages/management/WorldDashboardPage.tsx

import type { FC } from 'react';
import { useView } from '../../context/global/ViewContext';
import { CampaignManager } from '../../components/specific/Campaign/CampaignManager';
import { CharacterManager } from '../../components/specific/Character/CharacterManager';
import { LoreManager } from '../../components/specific/Lore/LoreManager';
import { StatManager } from '../../components/specific/Stats/StatManager';
import { AbilityManager } from '../../components/specific/AbilityTree/AbilityManager';
// NEW: Import the ClassManager component.
import { ClassManager } from '../../components/specific/Class/ClassManager';

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
            // NEW: Add the case for the 'classes' tab.
            case 'classes':
                return <ClassManager />;
            case 'lore':
                return <LoreManager />;
            case 'stats':
                return <StatManager />;
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
