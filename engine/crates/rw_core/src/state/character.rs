// engine/crates/rw_core/src/state/character.rs

use serde::{Deserialize, Serialize};

use crate::{AbilityId, CharacterId, OwnedItem, StatBlock};

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub struct CharacterProfile {
    pub name: String,
    pub concept: String,
    pub lineage: String,
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub struct CharacterAbility {
    pub ability_id: AbilityId,
    pub source: String,
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
