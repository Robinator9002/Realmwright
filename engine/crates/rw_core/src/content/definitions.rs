// engine/crates/rw_core/src/content/definitions.rs

use serde::{Deserialize, Serialize};
use thiserror::Error;

use crate::foundation::{AbilityId, Dice, DiceError, EffectId, ItemId, StatKind};

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub enum ModifierTarget {
    ArmorClass,
    DamageReduction,
    HitPoints,
    Initiative,
    Movement,
    Stat(StatKind),
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub struct Modifier {
    pub target: ModifierTarget,
    pub amount: i32,
}

#[derive(Debug, Error, Clone, PartialEq, Eq)]
pub enum ModifierError {
    #[error("modifier amount cannot be zero")]
    ZeroAmount,
}

impl Modifier {
    pub fn new(target: ModifierTarget, amount: i32) -> Result<Self, ModifierError> {
        let modifier = Self { target, amount };
        modifier.validate()?;
        Ok(modifier)
    }

    pub fn validate(&self) -> Result<(), ModifierError> {
        if self.amount == 0 {
            return Err(ModifierError::ZeroAmount);
        }

        Ok(())
    }
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub enum EffectKind {
    Modifier(Modifier),
    GrantShots(u32),
    GrantDamageDice(Dice),
    Tag(String),
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub struct Effect {
    pub id: EffectId,
    pub name: String,
    pub description: String,
    pub kind: EffectKind,
}

#[derive(Debug, Error, Clone, PartialEq, Eq)]
pub enum EffectError {
    #[error("effect name cannot be empty")]
    EmptyName,
    #[error("effect description cannot be empty")]
    EmptyDescription,
    #[error("effect has an invalid modifier")]
    InvalidModifier(#[source] ModifierError),
}

impl Effect {
    pub fn new(
        id: EffectId,
        name: impl Into<String>,
        description: impl Into<String>,
        kind: EffectKind,
    ) -> Result<Self, EffectError> {
        let effect = Self {
            id,
            name: name.into(),
            description: description.into(),
            kind,
        };
        effect.validate()?;
        Ok(effect)
    }

    pub fn validate(&self) -> Result<(), EffectError> {
        if self.name.trim().is_empty() {
            return Err(EffectError::EmptyName);
        }

        if self.description.trim().is_empty() {
            return Err(EffectError::EmptyDescription);
        }

        if let EffectKind::Modifier(modifier) = &self.kind {
            modifier.validate().map_err(EffectError::InvalidModifier)?;
        }

        Ok(())
    }
}

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
pub enum AbilityKind {
    Active,
    Passive,
    Reaction,
    Spell,
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub struct AbilityDefinition {
    pub id: AbilityId,
    pub name: String,
    pub description: String,
    pub kind: AbilityKind,
    pub effects: Vec<Effect>,
}

#[derive(Debug, Error, Clone, PartialEq, Eq)]
pub enum AbilityDefinitionError {
    #[error("ability name cannot be empty")]
    EmptyName,
    #[error("ability description cannot be empty")]
    EmptyDescription,
    #[error("ability must contain at least one effect")]
    MissingEffects,
    #[error("ability contains an invalid effect at index {index}")]
    InvalidEffect {
        index: usize,
        #[source]
        source: EffectError,
    },
}

impl AbilityDefinition {
    pub fn new(
        id: AbilityId,
        name: impl Into<String>,
        description: impl Into<String>,
        kind: AbilityKind,
        effects: Vec<Effect>,
    ) -> Result<Self, AbilityDefinitionError> {
        let ability = Self {
            id,
            name: name.into(),
            description: description.into(),
            kind,
            effects,
        };
        ability.validate()?;
        Ok(ability)
    }

    pub fn validate(&self) -> Result<(), AbilityDefinitionError> {
        if self.name.trim().is_empty() {
            return Err(AbilityDefinitionError::EmptyName);
        }

        if self.description.trim().is_empty() {
            return Err(AbilityDefinitionError::EmptyDescription);
        }

        if self.effects.is_empty() {
            return Err(AbilityDefinitionError::MissingEffects);
        }

        for (index, effect) in self.effects.iter().enumerate() {
            effect
                .validate()
                .map_err(|source| AbilityDefinitionError::InvalidEffect { index, source })?;
        }

        Ok(())
    }
}

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
pub enum ItemKind {
    Weapon,
    Armor,
    Gear,
    Consumable,
}

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
pub struct Enchantment(pub u32);

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub struct ItemDefinition {
    pub id: ItemId,
    pub name: String,
    pub description: String,
    pub kind: ItemKind,
    pub weapon_die: Option<Dice>,
    pub attack_damage: Vec<Dice>,
    pub enchantment: Option<Enchantment>,
    pub effects: Vec<Effect>,
}

#[derive(Debug, Error, Clone, PartialEq, Eq)]
pub enum ItemDefinitionError {
    #[error("item name cannot be empty")]
    EmptyName,
    #[error("item description cannot be empty")]
    EmptyDescription,
    #[error("weapon items must define a weapon die or attack damage")]
    WeaponMissingDamageProfile,
    #[error("item weapon die is invalid")]
    InvalidWeaponDie(#[source] DiceError),
    #[error("item attack damage contains invalid dice at index {index}")]
    InvalidAttackDamage {
        index: usize,
        #[source]
        source: DiceError,
    },
    #[error("item contains an invalid effect at index {index}")]
    InvalidEffect {
        index: usize,
        #[source]
        source: EffectError,
    },
}

impl ItemDefinition {
    pub fn new(
        id: ItemId,
        name: impl Into<String>,
        description: impl Into<String>,
        kind: ItemKind,
        weapon_die: Option<Dice>,
        attack_damage: Vec<Dice>,
        enchantment: Option<Enchantment>,
        effects: Vec<Effect>,
    ) -> Result<Self, ItemDefinitionError> {
        let item = Self {
            id,
            name: name.into(),
            description: description.into(),
            kind,
            weapon_die,
            attack_damage,
            enchantment,
            effects,
        };
        item.validate()?;
        Ok(item)
    }

    pub fn validate(&self) -> Result<(), ItemDefinitionError> {
        if self.name.trim().is_empty() {
            return Err(ItemDefinitionError::EmptyName);
        }

        if self.description.trim().is_empty() {
            return Err(ItemDefinitionError::EmptyDescription);
        }

        if let Some(weapon_die) = self.weapon_die {
            weapon_die
                .validate()
                .map_err(ItemDefinitionError::InvalidWeaponDie)?;
        }

        for (index, damage) in self.attack_damage.iter().enumerate() {
            damage
                .validate()
                .map_err(|source| ItemDefinitionError::InvalidAttackDamage { index, source })?;
        }

        for (index, effect) in self.effects.iter().enumerate() {
            effect
                .validate()
                .map_err(|source| ItemDefinitionError::InvalidEffect { index, source })?;
        }

        if matches!(self.kind, ItemKind::Weapon)
            && self.weapon_die.is_none()
            && self.attack_damage.is_empty()
        {
            return Err(ItemDefinitionError::WeaponMissingDamageProfile);
        }

        Ok(())
    }
}
