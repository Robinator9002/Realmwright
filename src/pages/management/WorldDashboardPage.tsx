// src/pages/management/WorldDashboardPage.tsx

import type { FC } from 'react';
import { useView } from '../../context/global/ViewContext';
import { CampaignManager } from '../../components/specific/Campaign/CampaignManager';
import { CharacterManager } from '../../components/specific/Character/CharacterManager';
import { LoreManager } from '../../components/specific/Lore/LoreManager';
import { StatManager } from '../../components/specific/Stats/StatManager';
import { AbilityManager } from '../../components/specific/AbilityTree/AbilityManager';
import { ClassManager } from '../../components/specific/Class/management/ClassManager';
// NEW: Import the new manager components
import { MapManager } from '../../components/specific/Map/MapManager';
import { LocationManager } from '../../components/specific/Location/LocationManager';
import { QuestManager } from '../../components/specific/Quest/QuestManager';

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
            case 'classes':
                return <ClassManager />;
            case 'lore':
                return <LoreManager />;
            case 'stats':
                return <StatManager />;
            case 'abilities':
                return <AbilityManager />;
            // NEW: Add cases for the map creator tabs
            case 'maps':
                return <MapManager />;
            case 'locations':
                return <LocationManager />;
            case 'quests':
                return <QuestManager />;
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
