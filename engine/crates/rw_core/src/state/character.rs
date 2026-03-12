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

#[derive(Debug, Error, Clone, PartialEq, Eq)]
pub enum CharacterOperationError {
    #[error("item quantity must be greater than zero")]
    ZeroQuantity,
    #[error("character already knows ability {ability_id:?}")]
    DuplicateAbility { ability_id: AbilityId },
    #[error("character does not know ability {ability_id:?}")]
    UnknownAbility { ability_id: AbilityId },
    #[error("character does not own item {item_id:?}")]
    UnknownItem { item_id: crate::ItemId },
    #[error("character does not have enough of item {item_id:?}: requested {requested}, available {available}")]
    InsufficientItemQuantity {
        item_id: crate::ItemId,
        requested: u32,
        available: u32,
    },
    #[error("item {item_id:?} is already equipped")]
    ItemAlreadyEquipped { item_id: crate::ItemId },
    #[error("item {item_id:?} is not equipped")]
    ItemNotEquipped { item_id: crate::ItemId },
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
        item_id: crate::ItemId,
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
        item_id: crate::ItemId,
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
        item_id: crate::ItemId,
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
        item_id: crate::ItemId,
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
}

#[cfg(test)]
mod tests {
    use crate::{
        AbilityId, Character, CharacterAbility, CharacterOperationError, CharacterProfile,
        CharacterId, ItemId, OwnedItem, StatBlock,
    };

    fn sample_character() -> Character {
        Character::new(
            CharacterId(1),
            CharacterProfile::new("Aela", "Scout", "Elf").expect("profile should be valid"),
            1,
            StatBlock::new(10, 14, 12, 10, 13, 8, 2).expect("stats should be valid"),
            vec![OwnedItem::new(ItemId(100), 1, false).expect("owned item should be valid")],
            vec![],
        )
        .expect("character should be valid")
    }

    #[test]
    fn learn_ability_rejects_duplicates() {
        let mut character = sample_character();
        let ability =
            CharacterAbility::new(AbilityId(7), "level up").expect("ability should be valid");

        character
            .learn_ability(ability.clone())
            .expect("first learn should succeed");

        let error = character
            .learn_ability(ability)
            .expect_err("second learn should fail");

        assert_eq!(
            error,
            CharacterOperationError::DuplicateAbility {
                ability_id: AbilityId(7)
            }
        );
    }

    #[test]
    fn add_and_remove_item_updates_inventory() {
        let mut character = sample_character();

        character
            .add_item(ItemId(100), 2)
            .expect("adding to existing stack should succeed");
        assert_eq!(character.inventory[0].quantity, 3);

        character
            .remove_item(ItemId(100), 2)
            .expect("partial remove should succeed");
        assert_eq!(character.inventory[0].quantity, 1);

        character
            .remove_item(ItemId(100), 1)
            .expect("final remove should succeed");
        assert!(character.inventory.is_empty());
    }

    #[test]
    fn equip_and_unequip_item_updates_flags() {
        let mut character = sample_character();

        character
            .equip_item(ItemId(100))
            .expect("equip should succeed");
        assert!(character.inventory[0].equipped);

        character
            .unequip_item(ItemId(100))
            .expect("unequip should succeed");
        assert!(!character.inventory[0].equipped);
    }

    #[test]
    fn removing_too_many_items_fails() {
        let mut character = sample_character();

        let error = character
            .remove_item(ItemId(100), 2)
            .expect_err("remove should fail");

        assert_eq!(
            error,
            CharacterOperationError::InsufficientItemQuantity {
                item_id: ItemId(100),
                requested: 2,
                available: 1,
            }
        );
    }
}
