#![no_std]

use soroban_sdk::{contracterror, contracttype, panic_with_error, Address, Env};

#[derive(Clone)]
#[contracttype]
pub enum AuthStorageKey {
    Admin,
}

pub fn set_admin(env: &Env, admin: &Address) {
    env.storage().instance().set(&AuthStorageKey::Admin, admin);
}

pub fn get_admin(env: &Env) -> Address {
    env.storage()
        .instance()
        .get(&AuthStorageKey::Admin)
        .expect("admin not set")
}

pub fn require_admin(env: &Env) {
    let admin = get_admin(env);
    admin.require_auth();
}

/// Errors raised by the shared access-control helpers. The code is high so it
/// cannot collide with a contract's own `contracterror` enum.
#[contracterror]
#[derive(Copy, Clone, Debug, Eq, PartialEq, PartialOrd, Ord)]
#[repr(u32)]
pub enum AuthError {
    /// The caller is neither the owner of the player-scoped entry nor the admin.
    NotOwnerOrAdmin = 910,
}

/// Player-scoped data may only be touched by its owner. An explicit admin
/// override is allowed: it requires the admin's own authorisation and returns
/// `true` so the caller can emit an audit event. Any other caller panics with
/// [`AuthError::NotOwnerOrAdmin`].
pub fn require_owner_or_admin(
    env: &Env,
    owner: &Address,
    caller: &Address,
    admin: &Address,
) -> bool {
    if caller == owner {
        owner.require_auth();
        false
    } else if caller == admin {
        admin.require_auth();
        true
    } else {
        panic_with_error!(env, AuthError::NotOwnerOrAdmin);
    }
}
