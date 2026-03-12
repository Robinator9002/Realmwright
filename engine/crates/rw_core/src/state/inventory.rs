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

impl OwnedItem {
    pub fn new(item_id: ItemId, quantity: u32, equipped: bool) -> Result<Self, OwnedItemError> {
        let owned_item = Self {
            item_id,
            quantity,
            equipped,
        };
        owned_item.validate()?;
        Ok(owned_item)
    }

    pub fn validate(&self) -> Result<(), OwnedItemError> {
        if self.quantity == 0 {
            return Err(OwnedItemError::ZeroQuantity);
        }

        Ok(())
    }
}
