// engine/crates/rw_core/src/foundation/mod.rs

mod primitives;

pub use primitives::{
    AbilityId, BackgroundId, CharacterId, ClassId, Dice, DiceError, DiceSize, EffectId, ItemId,
    LineageId, StatBlock, StatBlockError, StatKind,
};
