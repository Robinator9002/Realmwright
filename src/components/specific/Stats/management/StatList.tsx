// src/components/specific/Stats/management/StatList.tsx

/**
 * COMMIT: feat(stats): extract StatList component
 *
 * Rationale:
 * As part of the StatManager refactor, the display logic for the list of
 * existing stat definitions has been extracted into this dedicated, purely
 * presentational component.
 *
 * Implementation Details:
 * - This component is responsible for rendering the loading, error, empty,
 * and populated states of the stat list.
 * - It receives the array of stats and the necessary event handlers
 * (`onManage`, `onDelete`) as props from its parent.
 * - This change simplifies the main StatManager by offloading all display
 * logic, making the parent component's role purely state management.
 */
import type { FC } from 'react';
import { Settings, Trash2 } from 'lucide-react';
import type { StatDefinition } from '../../../../db/types';

interface StatListProps {
    stats: StatDefinition[];
    isLoading: boolean;
    error: string | null;
    onManage: (stat: StatDefinition) => void;
    onDelete: (stat: StatDefinition) => void;
}

export const StatList: FC<StatListProps> = ({ stats, isLoading, error, onManage, onDelete }) => {
    const renderContent = () => {
        if (isLoading) {
            return <p>Loading stats...</p>;
        }
        if (error) {
            return <p className="error-message">{error}</p>;
        }
        if (stats.length === 0) {
            return (
                <p className="panel__empty-message">
                    No stats have been defined for this world yet.
                </p>
            );
        }
        return (
            <ul className="panel__list">
                {stats.map((stat) => (
                    <li key={stat.id} className="panel__list-item">
                        <div className="panel__item-details">
                            <h4 className="panel__item-title">
                                {stat.name} ({stat.abbreviation})
                            </h4>
                            <p className="panel__item-description">{stat.description}</p>
                        </div>
                        <div className="panel__item-actions">
                            <button onClick={() => onManage(stat)} className="button">
                                <Settings size={16} /> Manage
                            </button>
                            <button
                                onClick={() => onDelete(stat)}
                                className="button button--danger"
                            >
                                <Trash2 size={16} />
                            </button>
                            <span className="status-badge">{stat.type}</span>
                        </div>
                    </li>
                ))}
            </ul>
        );
    };

    return (
        <div className="panel__list-section">
            <h3 className="panel__list-title">Defined Stats</h3>
            {renderContent()}
        </div>
    );
};
