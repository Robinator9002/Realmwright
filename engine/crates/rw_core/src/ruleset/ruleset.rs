// engine/crates/rw_core/src/ruleset/ruleset.rs

use std::collections::BTreeMap;

use serde::{Deserialize, Serialize};
use thiserror::Error;

use crate::{
    AbilityDefinition, AbilityDefinitionError, AbilityId, ItemDefinition, ItemDefinitionError,
    ItemId,
};

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub struct Ruleset {
    pub name: String,
    pub description: String,
    pub max_level: u8,
    pub abilities: BTreeMap<AbilityId, AbilityDefinition>,
    pub items: BTreeMap<ItemId, ItemDefinition>,
}

#[derive(Debug, Error, Clone, PartialEq, Eq)]
pub enum RulesetError {
    #[error("ruleset name cannot be empty")]
    EmptyName,
    #[error("ruleset description cannot be empty")]
    EmptyDescription,
    #[error("ruleset max level must be at least 1")]
    InvalidMaxLevel,
    #[error("ruleset contains an invalid ability with id {ability_id:?}")]
    InvalidAbility {
        ability_id: AbilityId,
        #[source]
        source: AbilityDefinitionError,
    },
    #[error("ruleset contains an invalid item with id {item_id:?}")]
    InvalidItem {
        item_id: ItemId,
        #[source]
        source: ItemDefinitionError,
    },
}

impl Ruleset {
    pub fn new(
        name: impl Into<String>,
        description: impl Into<String>,
        max_level: u8,
        abilities: BTreeMap<AbilityId, AbilityDefinition>,
        items: BTreeMap<ItemId, ItemDefinition>,
    ) -> Result<Self, RulesetError> {
        let ruleset = Self {
            name: name.into(),
            description: description.into(),
            max_level,
            abilities,
            items,
        };
        ruleset.validate()?;
        Ok(ruleset)
    }

    pub fn validate(&self) -> Result<(), RulesetError> {
        if self.name.trim().is_empty() {
            return Err(RulesetError::EmptyName);
        }

        if self.description.trim().is_empty() {
            return Err(RulesetError::EmptyDescription);
        }

        if self.max_level == 0 {
            return Err(RulesetError::InvalidMaxLevel);
        }

        for (ability_id, ability) in &self.abilities {
            ability.validate().map_err(|source| RulesetError::InvalidAbility {
                ability_id: *ability_id,
                source,
            })?;
        }

        for (item_id, item) in &self.items {
            item.validate().map_err(|source| RulesetError::InvalidItem {
                item_id: *item_id,
                source,
            })?;
        }

        Ok(())
    }
}
