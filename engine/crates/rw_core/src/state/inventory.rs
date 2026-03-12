// engine/crates/rw_core/src/state/inventory.rs

use serde::{Deserialize, Serialize};

use crate::ItemId;

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub struct OwnedItem {
    pub item_id: ItemId,
    pub quantity: u32,
    pub equipped: bool,
}
