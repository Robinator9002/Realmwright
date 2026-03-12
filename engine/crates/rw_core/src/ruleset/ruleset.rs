// engine/crates/rw_core/src/ruleset/ruleset.rs

use std::collections::BTreeMap;

use serde::{Deserialize, Serialize};

use crate::{AbilityDefinition, AbilityId, ItemDefinition, ItemId};

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub struct Ruleset {
    pub name: String,
    pub description: String,
    pub max_level: u8,
    pub abilities: BTreeMap<AbilityId, AbilityDefinition>,
    pub items: BTreeMap<ItemId, ItemDefinition>,
}
