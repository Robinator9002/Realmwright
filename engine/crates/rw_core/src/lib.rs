// engine/crates/rw_core/src/lib.rs

pub mod content;
pub mod foundation;
pub mod ruleset;
pub mod state;

pub use content::{
    AbilityDefinition, AbilityDefinitionError, AbilityKind, BackgroundDefinition,
    BackgroundDefinitionError, ClassDefinition, ClassDefinitionError, Effect, EffectError,
    EffectKind, Enchantment, ItemDefinition, ItemDefinitionError, ItemKind, LineageDefinition,
    LineageDefinitionError, Modifier, ModifierError, ModifierTarget,
};
pub use foundation::{
    AbilityId, BackgroundId, CharacterId, ClassId, Dice, DiceError, DiceSize, EffectId, ItemId,
    LineageId, StatBlock, StatBlockError, StatKind,
};
pub use ruleset::{Ruleset, RulesetError, RulesetOperationError};
pub use state::{
    ActiveEffect, ActiveEffectError, Character, CharacterAbility, CharacterAbilityError,
    CharacterError, CharacterOperationError, CharacterProfile, CharacterProfileError, OwnedItem,
    OwnedItemError,
};
