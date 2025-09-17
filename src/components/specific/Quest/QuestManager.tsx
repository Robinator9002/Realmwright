// src/components/specific/Quest/QuestManager.tsx

import type { FC } from 'react';

/**
 * A placeholder component for the Quest Manager.
 * This will be fleshed out in a future phase.
 */
export const QuestManager: FC = () => {
    return (
        <div className="panel">
            <div className="panel__header-actions">
                <h2 className="panel__title" style={{ border: 'none', padding: 0 }}>
                    World Quests
                </h2>
            </div>
            <p className="panel__empty-message">
                Quest management and creation will be available here soon.
            </p>
        </div>
    );
};
