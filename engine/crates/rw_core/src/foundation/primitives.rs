// engine/crates/rw_core/src/foundation/primitives.rs

use serde::{Deserialize, Serialize};
use thiserror::Error;

#[derive(Debug, Clone, Copy, PartialEq, Eq, Hash, PartialOrd, Ord, Serialize, Deserialize)]
pub struct CharacterId(pub u64);

#[derive(Debug, Clone, Copy, PartialEq, Eq, Hash, PartialOrd, Ord, Serialize, Deserialize)]
pub struct ItemId(pub u64);

#[derive(Debug, Clone, Copy, PartialEq, Eq, Hash, PartialOrd, Ord, Serialize, Deserialize)]
pub struct AbilityId(pub u64);

#[derive(Debug, Clone, Copy, PartialEq, Eq, Hash, PartialOrd, Ord, Serialize, Deserialize)]
pub struct EffectId(pub u64);

#[derive(Debug, Clone, Copy, PartialEq, Eq, Hash, PartialOrd, Ord, Serialize, Deserialize)]
pub struct LineageId(pub u64);

#[derive(Debug, Clone, Copy, PartialEq, Eq, Hash, PartialOrd, Ord, Serialize, Deserialize)]
pub struct ClassId(pub u64);

#[derive(Debug, Clone, Copy, PartialEq, Eq, Hash, PartialOrd, Ord, Serialize, Deserialize)]
pub struct BackgroundId(pub u64);

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
pub enum DiceSize {
    D4,
    D6,
    D8,
    D10,
    D12,
    D20,
    D100,
}

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
pub struct Dice {
    pub count: u32,
    pub size: DiceSize,
    pub bonus: i32,
}

#[derive(Debug, Error, Clone, PartialEq, Eq)]
pub enum DiceError {
    #[error("dice count must be greater than zero")]
    ZeroCount,
}

impl Dice {
    pub fn new(count: u32, size: DiceSize, bonus: i32) -> Result<Self, DiceError> {
        let dice = Self { count, size, bonus };
        dice.validate()?;
        Ok(dice)
    }

    pub fn validate(&self) -> Result<(), DiceError> {
        if self.count == 0 {
            return Err(DiceError::ZeroCount);
        }

        Ok(())
    }
}

#[derive(Debug, Clone, Copy, PartialEq, Eq, Hash, Serialize, Deserialize)]
pub enum StatKind {
    Strength,
    Dexterity,
    Constitution,
    Intelligence,
    Wisdom,
    Charisma,
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub struct StatBlock {
    pub strength: i32,
    pub dexterity: i32,
    pub constitution: i32,
    pub intelligence: i32,
    pub wisdom: i32,
    pub charisma: i32,
    pub proficiency_bonus: i32,
}

#[derive(Debug, Error, Clone, PartialEq, Eq)]
pub enum StatBlockError {
    #[error("proficiency bonus cannot be negative")]
    NegativeProficiencyBonus,
}

impl StatBlock {
    #[allow(clippy::too_many_arguments)]
    pub fn new(
        strength: i32,
        dexterity: i32,
        constitution: i32,
        intelligence: i32,
        wisdom: i32,
        charisma: i32,
        proficiency_bonus: i32,
    ) -> Result<Self, StatBlockError> {
        let stat_block = Self {
            strength,
            dexterity,
            constitution,
            intelligence,
            wisdom,
            charisma,
            proficiency_bonus,
        };
        stat_block.validate()?;
        Ok(stat_block)
    }

    pub fn validate(&self) -> Result<(), StatBlockError> {
        if self.proficiency_bonus < 0 {
            return Err(StatBlockError::NegativeProficiencyBonus);
        }

        Ok(())
    }
}
