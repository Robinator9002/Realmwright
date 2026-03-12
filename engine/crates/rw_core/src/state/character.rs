// engine/crates/rw_core/src/state/character.rs

use serde::{Deserialize, Serialize};
use thiserror::Error;

use crate::{AbilityId, CharacterId, OwnedItem, StatBlock};

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
}
