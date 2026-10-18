//! Contract metadata for frontend/SDK compatibility checks.
//!
//! Every contract exposes a read-only `get_metadata()` returning its version,
//! an ABI hash and the minimum SDK version able to talk to it. The record is
//! written to *instance* storage by `init` and rewritten by the admin-only
//! `update_metadata` after an upgrade. Contracts deployed before this existed
//! (or upgraded without calling `update_metadata`) fall back to the values
//! compiled into the current binary, so the query never fails.

use soroban_sdk::{contracttype, Bytes, BytesN, Env, String};

#[derive(Clone, Debug, Eq, PartialEq)]
#[contracttype]
pub struct ContractMetadata {
    /// Contract release number (matches `version()`).
    pub version: u32,
    /// SHA-256 of the contract's public ABI descriptor.
    pub abi_hash: BytesN<32>,
    /// Lowest `@dewordle/soroban-sdk` version (semver) that can call it.
    pub min_sdk_version: String,
}

#[derive(Clone)]
#[contracttype]
enum MetadataKey {
    Metadata,
}

/// Compile-time description of a contract, used for init and as the fallback.
pub struct MetadataDefaults {
    pub version: u32,
    /// Canonical, newline-separated list of public function signatures.
    pub abi_descriptor: &'static str,
    pub min_sdk_version: &'static str,
}

pub fn abi_hash(env: &Env, descriptor: &str) -> BytesN<32> {
    env.crypto()
        .sha256(&Bytes::from_slice(env, descriptor.as_bytes()))
        .to_bytes()
}

fn defaults_to_metadata(env: &Env, defaults: &MetadataDefaults) -> ContractMetadata {
    ContractMetadata {
        version: defaults.version,
        abi_hash: abi_hash(env, defaults.abi_descriptor),
        min_sdk_version: String::from_str(env, defaults.min_sdk_version),
    }
}

/// Writes the metadata compiled into this binary. Call from `init`.
pub fn store_defaults(env: &Env, defaults: &MetadataDefaults) {
    env.storage()
        .instance()
        .set(&MetadataKey::Metadata, &defaults_to_metadata(env, defaults));
}

/// Replaces the stored metadata. Callers must authorise the admin first.
pub fn update(env: &Env, metadata: &ContractMetadata) {
    env.storage()
        .instance()
        .set(&MetadataKey::Metadata, metadata);
}

/// Stored metadata, or the compiled-in defaults if none was ever stored.
pub fn read_or_default(env: &Env, defaults: &MetadataDefaults) -> ContractMetadata {
    env.storage()
        .instance()
        .get(&MetadataKey::Metadata)
        .unwrap_or_else(|| defaults_to_metadata(env, defaults))
}

#[cfg(test)]
mod tests {
    use super::*;
    use soroban_sdk::{contract, contractimpl, Env};

    #[contract]
    struct Dummy;

    #[contractimpl]
    impl Dummy {}

    const DEFAULTS: MetadataDefaults = MetadataDefaults {
        version: 3,
        abi_descriptor: "init(address)\nversion()->u32",
        min_sdk_version: "0.1.0",
    };

    #[test]
    fn abi_hash_is_deterministic_and_input_sensitive() {
        let env = Env::default();
        assert_eq!(abi_hash(&env, "a"), abi_hash(&env, "a"));
        assert_ne!(abi_hash(&env, "a"), abi_hash(&env, "b"));
    }

    #[test]
    fn falls_back_to_defaults_before_anything_is_stored() {
        let env = Env::default();
        let id = env.register(Dummy, ());
        env.as_contract(&id, || {
            let m = read_or_default(&env, &DEFAULTS);
            assert_eq!(m.version, 3);
            assert_eq!(m.min_sdk_version, String::from_str(&env, "0.1.0"));
            assert_eq!(m.abi_hash, abi_hash(&env, DEFAULTS.abi_descriptor));
        });
    }

    #[test]
    fn stored_values_win_over_defaults_and_can_be_updated() {
        let env = Env::default();
        let id = env.register(Dummy, ());
        env.as_contract(&id, || {
            store_defaults(&env, &DEFAULTS);
            assert_eq!(read_or_default(&env, &DEFAULTS).version, 3);

            let upgraded = ContractMetadata {
                version: 4,
                abi_hash: abi_hash(&env, "v4"),
                min_sdk_version: String::from_str(&env, "0.2.0"),
            };
            update(&env, &upgraded);
            assert_eq!(read_or_default(&env, &DEFAULTS), upgraded);
        });
    }
}
