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
