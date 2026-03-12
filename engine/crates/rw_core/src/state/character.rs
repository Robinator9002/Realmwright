// engine/crates/rw_core/src/state/character.rs

use serde::{Deserialize, Serialize};
use thiserror::Error;

use crate::{AbilityId, CharacterId, OwnedItem, OwnedItemError, StatBlock, StatBlockError};

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub struct CharacterProfile {
    pub name: String,
    pub concept: String,
    pub lineage: String,
}

#[derive(Debug, Error, Clone, PartialEq, Eq)]
pub enum CharacterProfileError {
    #[error("character name cannot be empty")]
    EmptyName,
    #[error("character concept cannot be empty")]
    EmptyConcept,
    #[error("character lineage cannot be empty")]
    EmptyLineage,
}

impl CharacterProfile {
    pub fn new(
        name: impl Into<String>,
        concept: impl Into<String>,
        lineage: impl Into<String>,
    ) -> Result<Self, CharacterProfileError> {
        let profile = Self {
            name: name.into(),
            concept: concept.into(),
            lineage: lineage.into(),
        };
        profile.validate()?;
        Ok(profile)
    }

    pub fn validate(&self) -> Result<(), CharacterProfileError> {
        if self.name.trim().is_empty() {
            return Err(CharacterProfileError::EmptyName);
        }

        if self.concept.trim().is_empty() {
            return Err(CharacterProfileError::EmptyConcept);
        }

        if self.lineage.trim().is_empty() {
            return Err(CharacterProfileError::EmptyLineage);
        }

        Ok(())
    }
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub struct CharacterAbility {
    pub ability_id: AbilityId,
    pub source: String,
}

#[derive(Debug, Error, Clone, PartialEq, Eq)]
pub enum CharacterAbilityError {
    #[error("character ability source cannot be empty")]
    EmptySource,
}

impl CharacterAbility {
    pub fn new(
        ability_id: AbilityId,
        source: impl Into<String>,
    ) -> Result<Self, CharacterAbilityError> {
        let ability = Self {
            ability_id,
            source: source.into(),
        };
        ability.validate()?;
        Ok(ability)
    }

    pub fn validate(&self) -> Result<(), CharacterAbilityError> {
        if self.source.trim().is_empty() {
            return Err(CharacterAbilityError::EmptySource);
        }

        Ok(())
    }
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub struct Character {
    pub id: CharacterId,
    pub profile: CharacterProfile,
    pub level: u8,
    pub stats: StatBlock,
    pub inventory: Vec<OwnedItem>,
    pub abilities: Vec<CharacterAbility>,
}

#[derive(Debug, Error, Clone, PartialEq, Eq)]
pub enum CharacterError {
    #[error("character level must be at least 1")]
    InvalidLevel,
    #[error("character profile is invalid")]
    InvalidProfile(#[source] CharacterProfileError),
    #[error("character stat block is invalid")]
    InvalidStatBlock(#[source] StatBlockError),
    #[error("character inventory contains an invalid item at index {index}")]
    InvalidInventoryItem {
        index: usize,
        #[source]
        source: OwnedItemError,
    },
    #[error("character abilities contain an invalid entry at index {index}")]
    InvalidAbility {
        index: usize,
        #[source]
        source: CharacterAbilityError,
    },
}

impl Character {
    pub fn new(
        id: CharacterId,
        profile: CharacterProfile,
        level: u8,
        stats: StatBlock,
        inventory: Vec<OwnedItem>,
        abilities: Vec<CharacterAbility>,
    ) -> Result<Self, CharacterError> {
        let character = Self {
            id,
            profile,
            level,
            stats,
            inventory,
            abilities,
        };
        character.validate()?;
        Ok(character)
    }

    pub fn validate(&self) -> Result<(), CharacterError> {
        if self.level == 0 {
            return Err(CharacterError::InvalidLevel);
        }

        self.profile
            .validate()
            .map_err(CharacterError::InvalidProfile)?;
        self.stats
            .validate()
            .map_err(CharacterError::InvalidStatBlock)?;

        for (index, item) in self.inventory.iter().enumerate() {
            item.validate().map_err(|source| CharacterError::InvalidInventoryItem {
                index,
                source,
            })?;
        }

        for (index, ability) in self.abilities.iter().enumerate() {
            ability
                .validate()
                .map_err(|source| CharacterError::InvalidAbility { index, source })?;
        }

        Ok(())
    }
}
