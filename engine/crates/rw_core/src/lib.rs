// engine/crates/rw_core/src/lib.rs

pub mod content;
pub mod foundation;

pub use content::{
    AbilityDefinition, AbilityKind, Effect, EffectKind, Enchantment, ItemDefinition, ItemKind,
    Modifier, ModifierTarget,
};
pub use foundation::{AbilityId, Dice, DiceSize, EffectId, ItemId, StatBlock, StatKind};
