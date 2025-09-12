// src/components/specific/SheetBlocks/character/DetailsBlock.tsx

import type { FC } from 'react';
import type { CharacterClass } from '../../../../db/types';

export interface DetailsBlockProps {
    characterClass: CharacterClass;
}

/**
 * A sheet block component for displaying the main details of a class,
 * serving as the header of the character sheet.
 */
export const DetailsBlock: FC<DetailsBlockProps> = ({ characterClass }) => {
    return (
        <div className="details-block">
            <h1 className="details-block__name">{characterClass.name}</h1>
            <p className="details-block__description">{characterClass.description}</p>
        </div>
    );
};
