// src/components/specific/Location/LocationManager.tsx

import type { FC } from 'react';

/**
 * A placeholder component for the Location Manager.
 * This will be fleshed out in a future phase.
 */
export const LocationManager: FC = () => {
    return (
        <div className="panel">
            <div className="panel__header-actions">
                <h2 className="panel__title" style={{ border: 'none', padding: 0 }}>
                    World Locations
                </h2>
            </div>
            <p className="panel__empty-message">
                Location management and creation will be available here soon.
            </p>
        </div>
    );
};
