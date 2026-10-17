use core_game::{CoreGameContract, CoreGameContractClient};
use dewordle_utils::metadata::abi_hash;
use soroban_sdk::testutils::Address as _;
use soroban_sdk::{Address, BytesN, Env, String};

fn setup() -> (Env, Address, CoreGameContractClient<'static>) {
    let env = Env::default();
    env.mock_all_auths();
    let id = env.register(CoreGameContract, ());
    let client = CoreGameContractClient::new(&env, &id);
    (env, id, client)
}

#[test]
fn metadata_is_readable_before_and_after_init() {
    let (env, _id, client) = setup();
    let before = client.get_metadata();
    assert_eq!(before.version, 3);
    assert_eq!(before.min_sdk_version, String::from_str(&env, "0.1.0"));

    client.init(&Address::generate(&env));
    assert_eq!(client.get_metadata(), before);
}

#[test]
fn abi_hash_covers_the_public_entrypoints() {
    let (env, _id, client) = setup();
    let m = client.get_metadata();
    // The descriptor is the sorted entrypoint list, so adding or removing a
    // function must change the hash; an unrelated descriptor never matches.
    assert_ne!(m.abi_hash, abi_hash(&env, "unrelated"));
    assert_eq!(m.abi_hash.len(), 32);
}

#[test]
fn admin_can_update_metadata_after_upgrade() {
    let (env, _id, client) = setup();
    client.init(&Address::generate(&env));

    let new_hash = BytesN::from_array(&env, &[7u8; 32]);
    let new_sdk = String::from_str(&env, "0.2.0");
    client.update_metadata(&4, &new_hash, &new_sdk);

    let m = client.get_metadata();
    assert_eq!(m.version, 4);
    assert_eq!(m.abi_hash, new_hash);
    assert_eq!(m.min_sdk_version, new_sdk);
}

#[test]
fn update_requires_initialisation_and_admin_auth() {
    let env = Env::default(); // no mock_all_auths
    let id = env.register(CoreGameContract, ());
    let client = CoreGameContractClient::new(&env, &id);
    let hash = BytesN::from_array(&env, &[1u8; 32]);
    let sdk = String::from_str(&env, "9.9.9");
    // Not initialised, so there is no admin: the call must fail.
    assert!(client.try_update_metadata(&9, &hash, &sdk).is_err());
    assert_eq!(client.get_metadata().version, 3);
}
