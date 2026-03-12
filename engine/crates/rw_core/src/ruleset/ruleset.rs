// engine/crates/rw_core/src/ruleset/ruleset.rs

use std::collections::BTreeMap;

use serde::{Deserialize, Serialize};
use thiserror::Error;

use crate::{
    AbilityDefinition, AbilityDefinitionError, AbilityId, AbilityKind, BackgroundDefinition,
    BackgroundDefinitionError, BackgroundId, ClassDefinition, ClassDefinitionError, ClassId,
    Effect, EffectError, EffectId, EffectKind, ItemDefinition, ItemDefinitionError, ItemId,
    ItemKind, LineageDefinition, LineageDefinitionError, LineageId,
};

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub struct Ruleset {
    pub name: String,
    pub description: String,
    pub max_level: u8,
    pub abilities: BTreeMap<AbilityId, AbilityDefinition>,
    pub items: BTreeMap<ItemId, ItemDefinition>,
    pub lineages: BTreeMap<LineageId, LineageDefinition>,
    pub classes: BTreeMap<ClassId, ClassDefinition>,
    pub backgrounds: BTreeMap<BackgroundId, BackgroundDefinition>,
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
    #[error("ruleset contains an invalid lineage with id {lineage_id:?}")]
    InvalidLineage {
        lineage_id: LineageId,
        #[source]
        source: LineageDefinitionError,
    },
    #[error("ruleset contains an invalid class with id {class_id:?}")]
    InvalidClass {
        class_id: ClassId,
        #[source]
        source: ClassDefinitionError,
    },
    #[error("ruleset contains an invalid background with id {background_id:?}")]
    InvalidBackground {
        background_id: BackgroundId,
        #[source]
        source: BackgroundDefinitionError,
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
    #[error("ruleset already contains lineage {lineage_id:?}")]
    DuplicateLineage { lineage_id: LineageId },
    #[error("ruleset does not contain lineage {lineage_id:?}")]
    UnknownLineage { lineage_id: LineageId },
    #[error("generated lineage is invalid")]
    InvalidLineage(#[source] LineageDefinitionError),
    #[error("ruleset already contains class {class_id:?}")]
    DuplicateClass { class_id: ClassId },
    #[error("ruleset does not contain class {class_id:?}")]
    UnknownClass { class_id: ClassId },
    #[error("generated class is invalid")]
    InvalidClass(#[source] ClassDefinitionError),
    #[error("ruleset already contains background {background_id:?}")]
    DuplicateBackground { background_id: BackgroundId },
    #[error("ruleset does not contain background {background_id:?}")]
    UnknownBackground { background_id: BackgroundId },
    #[error("generated background is invalid")]
    InvalidBackground(#[source] BackgroundDefinitionError),
}

impl Ruleset {
    pub fn new(
        name: impl Into<String>,
        description: impl Into<String>,
        max_level: u8,
        abilities: BTreeMap<AbilityId, AbilityDefinition>,
        items: BTreeMap<ItemId, ItemDefinition>,
        lineages: BTreeMap<LineageId, LineageDefinition>,
        classes: BTreeMap<ClassId, ClassDefinition>,
        backgrounds: BTreeMap<BackgroundId, BackgroundDefinition>,
    ) -> Result<Self, RulesetError> {
        let ruleset = Self {
            name: name.into(),
            description: description.into(),
            max_level,
            abilities,
            items,
            lineages,
            classes,
            backgrounds,
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
            ability
                .validate()
                .map_err(|source| RulesetError::InvalidAbility {
                    ability_id: *ability_id,
                    source,
                })?;
        }

        for (item_id, item) in &self.items {
            item.validate()
                .map_err(|source| RulesetError::InvalidItem {
                    item_id: *item_id,
                    source,
                })?;
        }

        for (lineage_id, lineage) in &self.lineages {
            lineage
                .validate()
                .map_err(|source| RulesetError::InvalidLineage {
                    lineage_id: *lineage_id,
                    source,
                })?;
        }

        for (class_id, class) in &self.classes {
            class
                .validate()
                .map_err(|source| RulesetError::InvalidClass {
                    class_id: *class_id,
                    source,
                })?;
        }

        for (background_id, background) in &self.backgrounds {
            background
                .validate()
                .map_err(|source| RulesetError::InvalidBackground {
                    background_id: *background_id,
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

    pub fn lineage(&self, id: LineageId) -> Option<&LineageDefinition> {
        self.lineages.get(&id)
    }

    pub fn class(&self, id: ClassId) -> Option<&ClassDefinition> {
        self.classes.get(&id)
    }

    pub fn background(&self, id: BackgroundId) -> Option<&BackgroundDefinition> {
        self.backgrounds.get(&id)
    }

    pub fn contains_ability(&self, id: AbilityId) -> bool {
        self.abilities.contains_key(&id)
    }

    pub fn contains_item(&self, id: ItemId) -> bool {
        self.items.contains_key(&id)
    }

    pub fn contains_lineage(&self, id: LineageId) -> bool {
        self.lineages.contains_key(&id)
    }

    pub fn contains_class(&self, id: ClassId) -> bool {
        self.classes.contains_key(&id)
    }

    pub fn contains_background(&self, id: BackgroundId) -> bool {
        self.backgrounds.contains_key(&id)
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

    pub fn next_lineage_id(&self) -> LineageId {
        LineageId(self.lineages.keys().next_back().map_or(1, |id| id.0 + 1))
    }

    pub fn next_class_id(&self) -> ClassId {
        ClassId(self.classes.keys().next_back().map_or(1, |id| id.0 + 1))
    }

    pub fn next_background_id(&self) -> BackgroundId {
        BackgroundId(self.backgrounds.keys().next_back().map_or(1, |id| id.0 + 1))
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

    pub fn remove_ability(
        &mut self,
        ability_id: AbilityId,
    ) -> Result<AbilityDefinition, RulesetOperationError> {
        self.abilities
            .remove(&ability_id)
            .ok_or(RulesetOperationError::UnknownAbility { ability_id })
    }

    pub fn insert_item(&mut self, item: ItemDefinition) -> Result<ItemId, RulesetOperationError> {
        item.validate()
            .map_err(RulesetOperationError::InvalidItem)?;

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

    pub fn remove_item(
        &mut self,
        item_id: ItemId,
    ) -> Result<ItemDefinition, RulesetOperationError> {
        self.items
            .remove(&item_id)
            .ok_or(RulesetOperationError::UnknownItem { item_id })
    }

    pub fn insert_lineage(
        &mut self,
        lineage: LineageDefinition,
    ) -> Result<LineageId, RulesetOperationError> {
        lineage
            .validate()
            .map_err(RulesetOperationError::InvalidLineage)?;

        if self.lineages.contains_key(&lineage.id) {
            return Err(RulesetOperationError::DuplicateLineage {
                lineage_id: lineage.id,
            });
        }

        let lineage_id = lineage.id;
        self.lineages.insert(lineage_id, lineage);
        Ok(lineage_id)
    }

    pub fn create_lineage(
        &mut self,
        name: impl Into<String>,
        description: impl Into<String>,
        granted_abilities: Vec<AbilityId>,
        effects: Vec<Effect>,
    ) -> Result<LineageId, RulesetOperationError> {
        let lineage_id = self.next_lineage_id();
        let lineage =
            LineageDefinition::new(lineage_id, name, description, granted_abilities, effects)
                .map_err(RulesetOperationError::InvalidLineage)?;
        self.insert_lineage(lineage)
    }

    pub fn remove_lineage(
        &mut self,
        lineage_id: LineageId,
    ) -> Result<LineageDefinition, RulesetOperationError> {
        self.lineages
            .remove(&lineage_id)
            .ok_or(RulesetOperationError::UnknownLineage { lineage_id })
    }

    pub fn insert_class(
        &mut self,
        class: ClassDefinition,
    ) -> Result<ClassId, RulesetOperationError> {
        class
            .validate()
            .map_err(RulesetOperationError::InvalidClass)?;

        if self.classes.contains_key(&class.id) {
            return Err(RulesetOperationError::DuplicateClass { class_id: class.id });
        }

        let class_id = class.id;
        self.classes.insert(class_id, class);
        Ok(class_id)
    }

    pub fn create_class(
        &mut self,
        name: impl Into<String>,
        description: impl Into<String>,
        hit_die: crate::DiceSize,
        primary_stats: Vec<crate::StatKind>,
        granted_abilities: Vec<AbilityId>,
        starting_items: Vec<ItemId>,
    ) -> Result<ClassId, RulesetOperationError> {
        let class_id = self.next_class_id();
        let class = ClassDefinition::new(
            class_id,
            name,
            description,
            hit_die,
            primary_stats,
            granted_abilities,
            starting_items,
        )
        .map_err(RulesetOperationError::InvalidClass)?;
        self.insert_class(class)
    }

    pub fn remove_class(
        &mut self,
        class_id: ClassId,
    ) -> Result<ClassDefinition, RulesetOperationError> {
        self.classes
            .remove(&class_id)
            .ok_or(RulesetOperationError::UnknownClass { class_id })
    }

    pub fn insert_background(
        &mut self,
        background: BackgroundDefinition,
    ) -> Result<BackgroundId, RulesetOperationError> {
        background
            .validate()
            .map_err(RulesetOperationError::InvalidBackground)?;

        if self.backgrounds.contains_key(&background.id) {
            return Err(RulesetOperationError::DuplicateBackground {
                background_id: background.id,
            });
        }

        let background_id = background.id;
        self.backgrounds.insert(background_id, background);
        Ok(background_id)
    }

    pub fn create_background(
        &mut self,
        name: impl Into<String>,
        description: impl Into<String>,
        granted_abilities: Vec<AbilityId>,
        starting_items: Vec<ItemId>,
        effects: Vec<Effect>,
    ) -> Result<BackgroundId, RulesetOperationError> {
        let background_id = self.next_background_id();
        let background = BackgroundDefinition::new(
            background_id,
            name,
            description,
            granted_abilities,
            starting_items,
            effects,
        )
        .map_err(RulesetOperationError::InvalidBackground)?;
        self.insert_background(background)
    }

    pub fn remove_background(
        &mut self,
        background_id: BackgroundId,
    ) -> Result<BackgroundDefinition, RulesetOperationError> {
        self.backgrounds
            .remove(&background_id)
            .ok_or(RulesetOperationError::UnknownBackground { background_id })
    }
}
