// engine/crates/rw_core/src/content/definitions.rs

use serde::{Deserialize, Serialize};

use crate::foundation::{AbilityId, Dice, EffectId, ItemId, StatKind};

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
