// engine/crates/rw_core/src/ruleset/ruleset.rs

use std::collections::BTreeMap;

use serde::{Deserialize, Serialize};
use thiserror::Error;

use crate::{
    AbilityDefinition, AbilityDefinitionError, AbilityId, AbilityKind, Effect, EffectError,
    EffectId, EffectKind, ItemDefinition, ItemDefinitionError, ItemId, ItemKind,
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

#[derive(Debug, Error, Clone, PartialEq, Eq)]
pub enum RulesetOperationError {
    #[error("ruleset already contains ability {ability_id:?}")]
    DuplicateAbility { ability_id: AbilityId },
    #[error("ruleset does not contain ability {ability_id:?}")]
    UnknownAbility { ability_id: AbilityId },
    #[error("ruleset already contains item {item_id:?}")]
    DuplicateItem { item_id: ItemId },
    #[error("ruleset does not contain item {item_id:?}")]
    UnknownItem { item_id: ItemId },
    #[error("generated ability is invalid")]
    InvalidAbility(#[source] AbilityDefinitionError),
    #[error("generated item is invalid")]
    InvalidItem(#[source] ItemDefinitionError),
    #[error("generated effect is invalid")]
    InvalidEffect(#[source] EffectError),
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

    pub fn ability(&self, id: AbilityId) -> Option<&AbilityDefinition> {
        self.abilities.get(&id)
    }

    pub fn item(&self, id: ItemId) -> Option<&ItemDefinition> {
        self.items.get(&id)
    }

    pub fn contains_ability(&self, id: AbilityId) -> bool {
        self.abilities.contains_key(&id)
    }

    pub fn contains_item(&self, id: ItemId) -> bool {
        self.items.contains_key(&id)
    }

    pub fn next_ability_id(&self) -> AbilityId {
        AbilityId(self.abilities.keys().next_back().map_or(1, |id| id.0 + 1))
    }

    pub fn next_item_id(&self) -> ItemId {
        ItemId(self.items.keys().next_back().map_or(1, |id| id.0 + 1))
    }

    pub fn next_effect_id(&self) -> EffectId {
        let next_ability_effect_id = self
            .abilities
            .values()
            .flat_map(|ability| ability.effects.iter().map(|effect| effect.id.0))
            .max();
        let next_item_effect_id = self
            .items
            .values()
            .flat_map(|item| item.effects.iter().map(|effect| effect.id.0))
            .max();
        let next_id = next_ability_effect_id
            .into_iter()
            .chain(next_item_effect_id)
            .max()
            .map_or(1, |id| id + 1);

        EffectId(next_id)
    }

    pub fn create_effect(
        &self,
        name: impl Into<String>,
        description: impl Into<String>,
        kind: EffectKind,
    ) -> Result<Effect, RulesetOperationError> {
        Effect::new(self.next_effect_id(), name, description, kind)
            .map_err(RulesetOperationError::InvalidEffect)
    }

    pub fn insert_ability(
        &mut self,
        ability: AbilityDefinition,
    ) -> Result<AbilityId, RulesetOperationError> {
        ability
            .validate()
            .map_err(RulesetOperationError::InvalidAbility)?;

        if self.abilities.contains_key(&ability.id) {
            return Err(RulesetOperationError::DuplicateAbility {
                ability_id: ability.id,
            });
        }

        let ability_id = ability.id;
        self.abilities.insert(ability_id, ability);
        Ok(ability_id)
    }

    pub fn create_ability(
        &mut self,
        name: impl Into<String>,
        description: impl Into<String>,
        kind: AbilityKind,
        effects: Vec<Effect>,
    ) -> Result<AbilityId, RulesetOperationError> {
        let ability_id = self.next_ability_id();
        let ability = AbilityDefinition::new(ability_id, name, description, kind, effects)
            .map_err(RulesetOperationError::InvalidAbility)?;
        self.insert_ability(ability)
    }

    pub fn remove_ability(&mut self, ability_id: AbilityId) -> Result<AbilityDefinition, RulesetOperationError> {
        self.abilities
            .remove(&ability_id)
            .ok_or(RulesetOperationError::UnknownAbility { ability_id })
    }

    pub fn insert_item(&mut self, item: ItemDefinition) -> Result<ItemId, RulesetOperationError> {
        item.validate().map_err(RulesetOperationError::InvalidItem)?;

        if self.items.contains_key(&item.id) {
            return Err(RulesetOperationError::DuplicateItem { item_id: item.id });
        }

        let item_id = item.id;
        self.items.insert(item_id, item);
        Ok(item_id)
    }

    #[allow(clippy::too_many_arguments)]
    pub fn create_item(
        &mut self,
        name: impl Into<String>,
        description: impl Into<String>,
        kind: ItemKind,
        weapon_die: Option<crate::Dice>,
        attack_damage: Vec<crate::Dice>,
        enchantment: Option<crate::Enchantment>,
        effects: Vec<Effect>,
    ) -> Result<ItemId, RulesetOperationError> {
        let item_id = self.next_item_id();
        let item = ItemDefinition::new(
            item_id,
            name,
            description,
            kind,
            weapon_die,
            attack_damage,
            enchantment,
            effects,
        )
        .map_err(RulesetOperationError::InvalidItem)?;
        self.insert_item(item)
    }

    pub fn remove_item(&mut self, item_id: ItemId) -> Result<ItemDefinition, RulesetOperationError> {
        self.items
            .remove(&item_id)
            .ok_or(RulesetOperationError::UnknownItem { item_id })
    }
}

#[cfg(test)]
mod tests {
    use std::collections::BTreeMap;

    use crate::{
        AbilityDefinition, AbilityId, AbilityKind, Effect, EffectId, EffectKind, ItemDefinition,
        ItemId, ItemKind, Ruleset, RulesetOperationError,
    };

    fn sample_effect() -> Effect {
        Effect::new(
            EffectId(1),
            "Push",
            "Push the target back.",
            EffectKind::Tag("forced-movement".into()),
        )
        .expect("sample effect should be valid")
    }

    fn sample_ability(id: AbilityId) -> AbilityDefinition {
        AbilityDefinition::new(
            id,
            "Shield Bash",
            "Drive an enemy backward.",
            AbilityKind::Active,
            vec![sample_effect()],
        )
        .expect("sample ability should be valid")
    }

    fn sample_item(id: ItemId) -> ItemDefinition {
        ItemDefinition::new(
            id,
            "Shield",
            "A reliable shield.",
            ItemKind::Armor,
            None,
            Vec::new(),
            None,
            vec![sample_effect()],
        )
        .expect("sample item should be valid")
    }

    #[test]
    fn ruleset_lookup_helpers_work() {
        let ability_id = AbilityId(10);
        let item_id = ItemId(20);

        let ruleset = Ruleset::new(
            "Core",
            "Core ruleset",
            20,
            BTreeMap::from([(ability_id, sample_ability(ability_id))]),
            BTreeMap::from([(item_id, sample_item(item_id))]),
        )
        .expect("ruleset should be valid");

        assert!(ruleset.contains_ability(ability_id));
        assert!(ruleset.contains_item(item_id));
        assert!(ruleset.ability(ability_id).is_some());
        assert!(ruleset.item(item_id).is_some());
        assert!(!ruleset.contains_ability(AbilityId(999)));
        assert!(!ruleset.contains_item(ItemId(999)));
    }

    #[test]
    fn ruleset_generates_and_tracks_ids() {
        let mut ruleset = Ruleset::new("Core", "Core ruleset", 20, BTreeMap::new(), BTreeMap::new())
            .expect("ruleset should be valid");

        let shove_effect = ruleset
            .create_effect(
                "Shove",
                "Push a creature away.",
                EffectKind::Tag("forced-movement".into()),
            )
            .expect("effect should be generated");
        let ability_id = ruleset
            .create_ability(
                "Shield Bash",
                "Drive an enemy backward.",
                AbilityKind::Active,
                vec![shove_effect],
            )
            .expect("ability should be created");

        let guard_effect = ruleset
            .create_effect(
                "Guarded",
                "Provides cover while equipped.",
                EffectKind::Tag("defensive".into()),
            )
            .expect("effect should be generated");
        let item_id = ruleset
            .create_item(
                "Shield",
                "A reliable shield.",
                ItemKind::Armor,
                None,
                Vec::new(),
                None,
                vec![guard_effect],
            )
            .expect("item should be created");

        assert_eq!(ability_id, AbilityId(1));
        assert_eq!(item_id, ItemId(1));
        assert_eq!(ruleset.ability(ability_id).expect("ability should exist").id, ability_id);
        assert_eq!(ruleset.item(item_id).expect("item should exist").id, item_id);
        assert_eq!(
            ruleset
                .ability(ability_id)
                .expect("ability should exist")
                .effects[0]
                .id,
            EffectId(1)
        );
        assert_eq!(
            ruleset.item(item_id).expect("item should exist").effects[0].id,
            EffectId(2)
        );
    }

    #[test]
    fn ruleset_rejects_duplicate_insertions() {
        let mut ruleset = Ruleset::new("Core", "Core ruleset", 20, BTreeMap::new(), BTreeMap::new())
            .expect("ruleset should be valid");
        let ability = sample_ability(AbilityId(42));

        ruleset
            .insert_ability(ability.clone())
            .expect("initial insert should succeed");

        let error = ruleset
            .insert_ability(ability)
            .expect_err("duplicate insert should fail");

        assert_eq!(
            error,
            RulesetOperationError::DuplicateAbility {
                ability_id: AbilityId(42)
            }
        );
    }
}
