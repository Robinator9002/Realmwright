// engine/crates/rw_core/src/state/inventory.rs

use serde::{Deserialize, Serialize};
use thiserror::Error;

use crate::ItemId;

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub struct OwnedItem {
    pub item_id: ItemId,
    pub quantity: u32,
    pub equipped: bool,
}

#[derive(Debug, Error, Clone, PartialEq, Eq)]
pub enum OwnedItemError {
    #[error("owned item quantity must be greater than zero")]
    ZeroQuantity,
}
