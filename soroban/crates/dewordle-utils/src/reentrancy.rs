//! Storage-based re-entrancy guard.
//!
//! The Soroban host already refuses most contract re-entry, so this is
//! defence in depth for functions that call other contracts: a flag in
//! *instance* storage is set while the function runs and any nested entry into
//! the guarded section of the same contract panics with
//! [`GuardError::Reentrancy`].
//!
//! The flag is released when the guard is dropped (normal return, early
//! return, or unwinding). If the whole invocation traps, the host rolls the
//! storage write back, so the flag can never stay set across transactions.

use soroban_sdk::{contracterror, contracttype, panic_with_error, Env};

#[derive(Clone)]
#[contracttype]
enum GuardKey {
    Entered,
}

/// Error code is deliberately high so it cannot collide with a contract's own
/// `contracterror` enum.
#[contracterror]
#[derive(Copy, Clone, Debug, Eq, PartialEq, PartialOrd, Ord)]
#[repr(u32)]
pub enum GuardError {
    /// A guarded function was entered while the same contract was already
    /// executing inside a guarded section.
    Reentrancy = 900,
}

pub struct ReentrancyGuard<'a> {
    env: &'a Env,
}

impl<'a> ReentrancyGuard<'a> {
    /// Acquires the guard or panics with [`GuardError::Reentrancy`].
    pub fn enter(env: &'a Env) -> Self {
        let storage = env.storage().instance();
        if storage.has(&GuardKey::Entered) {
            panic_with_error!(env, GuardError::Reentrancy);
        }
        storage.set(&GuardKey::Entered, &true);
        Self { env }
    }

    /// True while a guarded section of this contract is executing.
    pub fn is_entered(env: &Env) -> bool {
        env.storage().instance().has(&GuardKey::Entered)
    }
}

impl Drop for ReentrancyGuard<'_> {
    fn drop(&mut self) {
        self.env.storage().instance().remove(&GuardKey::Entered);
    }
}

/// Runs `f` with the guard held and releases it afterwards.
pub fn with_reentrancy_guard<T>(env: &Env, f: impl FnOnce() -> T) -> T {
    let _guard = ReentrancyGuard::enter(env);
    f()
}

#[cfg(test)]
mod tests {
    extern crate std;

    use super::*;
    use soroban_sdk::{contract, contractimpl, Address};
    use std::panic::{catch_unwind, AssertUnwindSafe};

    #[contract]
    struct Dummy;

    #[contractimpl]
    impl Dummy {}

    fn setup() -> (Env, Address) {
        let env = Env::default();
        let id = env.register(Dummy, ());
        (env, id)
    }

    #[test]
    fn guard_is_set_while_held_and_released_on_drop() {
        let (env, id) = setup();
        env.as_contract(&id, || {
            assert!(!ReentrancyGuard::is_entered(&env));
            {
                let _g = ReentrancyGuard::enter(&env);
                assert!(ReentrancyGuard::is_entered(&env));
            }
            assert!(!ReentrancyGuard::is_entered(&env));
        });
    }

    #[test]
    #[should_panic(expected = "Error(Contract, #900)")]
    fn nested_entry_panics_with_reentrancy_error() {
        let (env, id) = setup();
        env.as_contract(&id, || {
            let _outer = ReentrancyGuard::enter(&env);
            let _inner = ReentrancyGuard::enter(&env);
        });
    }

    #[test]
    #[should_panic(expected = "Error(Contract, #900)")]
    fn closure_form_blocks_reentrant_closure() {
        let (env, id) = setup();
        env.as_contract(&id, || {
            with_reentrancy_guard(&env, || with_reentrancy_guard(&env, || ()));
        });
    }

    #[test]
    fn closure_form_returns_value_and_can_be_reused() {
        let (env, id) = setup();
        env.as_contract(&id, || {
            assert_eq!(with_reentrancy_guard(&env, || 7u32), 7);
            assert_eq!(with_reentrancy_guard(&env, || 8u32), 8);
            assert!(!ReentrancyGuard::is_entered(&env));
        });
    }

    #[test]
    fn guard_is_released_when_the_guarded_section_panics() {
        let (env, id) = setup();
        env.as_contract(&id, || {
            let result = catch_unwind(AssertUnwindSafe(|| {
                with_reentrancy_guard(&env, || panic!("boom"));
            }));
            assert!(result.is_err());
            assert!(!ReentrancyGuard::is_entered(&env));
            // and the section can be entered again afterwards
            with_reentrancy_guard(&env, || ());
        });
    }

    #[test]
    fn guard_state_is_per_contract() {
        let (env, a) = setup();
        let b = env.register(Dummy, ());
        env.as_contract(&a, || {
            let _g = ReentrancyGuard::enter(&env);
            env.as_contract(&b, || {
                // A different contract's instance storage is independent.
                let _g2 = ReentrancyGuard::enter(&env);
            });
        });
    }
}
