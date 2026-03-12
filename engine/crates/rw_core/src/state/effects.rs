// engine/crates/rw_core/src/state/effects.rs

use serde::{Deserialize, Serialize};
use thiserror::Error;

use crate::EffectId;

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub struct ActiveEffect {
    pub effect_id: EffectId,
    pub source: String,
    pub remaining_rounds: Option<u32>,
}

#[derive(Debug, Error, Clone, PartialEq, Eq)]
pub enum ActiveEffectError {
    #[error("active effect source cannot be empty")]
    EmptySource,
}

impl ActiveEffect {
    pub fn new(
        effect_id: EffectId,
        source: impl Into<String>,
        remaining_rounds: Option<u32>,
    ) -> Result<Self, ActiveEffectError> {
        let active_effect = Self {
            effect_id,
            source: source.into(),
            remaining_rounds,
        };
        active_effect.validate()?;
        Ok(active_effect)
    }

    pub fn validate(&self) -> Result<(), ActiveEffectError> {
        if self.source.trim().is_empty() {
            return Err(ActiveEffectError::EmptySource);
        }

        Ok(())
    }
}
