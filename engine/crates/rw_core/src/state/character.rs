// engine/crates/rw_core/src/state/character.rs

use serde::{Deserialize, Serialize};
use thiserror::Error;

use crate::{
    AbilityId, CharacterId, ItemId, OwnedItem, OwnedItemError, Ruleset, StatBlock,
    StatBlockError,
};

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

#[derive(Debug, Error, Clone, PartialEq, Eq)]
pub enum CharacterOperationError {
    #[error("item quantity must be greater than zero")]
    ZeroQuantity,
    #[error("character already knows ability {ability_id:?}")]
    DuplicateAbility { ability_id: AbilityId },
    #[error("character does not know ability {ability_id:?}")]
    UnknownAbility { ability_id: AbilityId },
    #[error("character does not own item {item_id:?}")]
    UnknownItem { item_id: ItemId },
    #[error("character does not have enough of item {item_id:?}: requested {requested}, available {available}")]
    InsufficientItemQuantity {
        item_id: ItemId,
        requested: u32,
        available: u32,
    },
    #[error("item {item_id:?} is already equipped")]
    ItemAlreadyEquipped { item_id: ItemId },
    #[error("item {item_id:?} is not equipped")]
    ItemNotEquipped { item_id: ItemId },
    #[error("ruleset does not contain ability {ability_id:?}")]
    UnknownRulesetAbility { ability_id: AbilityId },
    #[error("ruleset does not contain item {item_id:?}")]
    UnknownRulesetItem { item_id: ItemId },
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

    pub fn has_ability(&self, ability_id: AbilityId) -> bool {
        self.abilities
            .iter()
            .any(|ability| ability.ability_id == ability_id)
    }

    pub fn learn_ability(
        &mut self,
        ability: CharacterAbility,
    ) -> Result<(), CharacterOperationError> {
        if self.has_ability(ability.ability_id) {
            return Err(CharacterOperationError::DuplicateAbility {
                ability_id: ability.ability_id,
            });
        }

        self.abilities.push(ability);
        Ok(())
    }

    pub fn forget_ability(&mut self, ability_id: AbilityId) -> Result<(), CharacterOperationError> {
        let Some(index) = self
            .abilities
            .iter()
            .position(|ability| ability.ability_id == ability_id)
        else {
            return Err(CharacterOperationError::UnknownAbility { ability_id });
        };

        self.abilities.remove(index);
        Ok(())
    }

    pub fn add_item(
        &mut self,
        item_id: ItemId,
        quantity: u32,
    ) -> Result<(), CharacterOperationError> {
        if quantity == 0 {
            return Err(CharacterOperationError::ZeroQuantity);
        }

        if let Some(item) = self.inventory.iter_mut().find(|item| item.item_id == item_id) {
            item.quantity += quantity;
            return Ok(());
        }

        self.inventory.push(OwnedItem {
            item_id,
            quantity,
            equipped: false,
        });
        Ok(())
    }

    pub fn remove_item(
        &mut self,
        item_id: ItemId,
        quantity: u32,
    ) -> Result<(), CharacterOperationError> {
        if quantity == 0 {
            return Err(CharacterOperationError::ZeroQuantity);
        }

        let Some(index) = self.inventory.iter().position(|item| item.item_id == item_id) else {
            return Err(CharacterOperationError::UnknownItem { item_id });
        };

        let available = self.inventory[index].quantity;
        if quantity > available {
            return Err(CharacterOperationError::InsufficientItemQuantity {
                item_id,
                requested: quantity,
                available,
            });
        }

        if quantity == available {
            self.inventory.remove(index);
            return Ok(());
        }

        self.inventory[index].quantity -= quantity;
        Ok(())
    }

    pub fn equip_item(
        &mut self,
        item_id: ItemId,
    ) -> Result<(), CharacterOperationError> {
        let Some(item) = self.inventory.iter_mut().find(|item| item.item_id == item_id) else {
            return Err(CharacterOperationError::UnknownItem { item_id });
        };

        if item.equipped {
            return Err(CharacterOperationError::ItemAlreadyEquipped { item_id });
        }

        item.equipped = true;
        Ok(())
    }

    pub fn unequip_item(
        &mut self,
        item_id: ItemId,
    ) -> Result<(), CharacterOperationError> {
        let Some(item) = self.inventory.iter_mut().find(|item| item.item_id == item_id) else {
            return Err(CharacterOperationError::UnknownItem { item_id });
        };

        if !item.equipped {
            return Err(CharacterOperationError::ItemNotEquipped { item_id });
        }

        item.equipped = false;
        Ok(())
    }

    pub fn learn_ability_from_ruleset(
        &mut self,
        ruleset: &Ruleset,
        ability_id: AbilityId,
        source: impl Into<String>,
    ) -> Result<(), CharacterOperationError> {
        if !ruleset.contains_ability(ability_id) {
            return Err(CharacterOperationError::UnknownRulesetAbility { ability_id });
        }

        let ability =
            CharacterAbility::new(ability_id, source).expect("ruleset-driven ability source must be valid");
        self.learn_ability(ability)
    }

    pub fn add_item_from_ruleset(
        &mut self,
        ruleset: &Ruleset,
        item_id: ItemId,
        quantity: u32,
    ) -> Result<(), CharacterOperationError> {
        if !ruleset.contains_item(item_id) {
            return Err(CharacterOperationError::UnknownRulesetItem { item_id });
        }

        self.add_item(item_id, quantity)
    }

    pub fn validate_against(&self, ruleset: &Ruleset) -> Result<(), CharacterOperationError> {
        for ability in &self.abilities {
            if !ruleset.contains_ability(ability.ability_id) {
                return Err(CharacterOperationError::UnknownRulesetAbility {
                    ability_id: ability.ability_id,
                });
            }
        }

        for item in &self.inventory {
            if !ruleset.contains_item(item.item_id) {
                return Err(CharacterOperationError::UnknownRulesetItem {
                    item_id: item.item_id,
                });
            }
        }

        Ok(())
    }
}
