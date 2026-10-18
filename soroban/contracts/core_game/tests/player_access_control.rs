use core_game::{CoreGameContract, CoreGameContractClient};
use soroban_sdk::testutils::{Address as _, Ledger as _};
use soroban_sdk::{Address, BytesN, Env};

fn setup() -> (Env, CoreGameContractClient<'static>, Address, Address) {
    let env = Env::default();
    env.mock_all_auths();
    let id = env.register(CoreGameContract, ());
    let client = CoreGameContractClient::new(&env, &id);
    client.init(&Address::generate(&env));
    client.set_day_config(&1, &BytesN::from_array(&env, &[1u8; 32]), &6, &u64::MAX);
    let (alice, bob) = (Address::generate(&env), Address::generate(&env));
    (env, client, alice, bob)
}

#[test]
fn session_keys_are_scoped_to_the_creating_player() {
    let (env, client, alice, bob) = setup();
    let a = client.create_session(&alice, &1, &0);
    let b = client.create_session(&bob, &1, &0);
    // Same nonce, different players: separate sessions, separate ids.
    assert_ne!(a, b);
    assert_eq!(client.get_session(&a).player, alice);
    assert_eq!(client.get_session(&b).player, bob);
    assert!(client.is_nonce_used(&alice, &0));
    assert!(client.is_nonce_used(&bob, &0));
    let _ = env;
}

#[test]
fn another_player_cannot_submit_a_guess_to_someone_elses_session() {
    let (env, client, alice, bob) = setup();
    let session = client.create_session(&alice, &1, &0);
    let commitment = BytesN::from_array(&env, &[2u8; 32]);

    let result = client.try_submit_guess(&bob, &session, &commitment, &0, &false);
    assert!(result.is_err(), "cross-player call must be rejected");
    assert_eq!(client.get_session(&session).attempts_used, 0);
}

#[test]
fn another_player_cannot_finalize_someone_elses_session() {
    let (env, client, alice, bob) = setup();
    let session = client.create_session(&alice, &1, &0);
    let commitment = BytesN::from_array(&env, &[2u8; 32]);
    client.submit_guess(&alice, &session, &commitment, &1, &true);

    let result = client.try_finalize_session(&bob, &session);
    assert!(result.is_err(), "cross-player call must be rejected");
    assert!(!client.get_session(&session).finalized);
    // The owner can still finalize.
    assert!(client.finalize_session(&alice, &session).finalized);
}

#[test]
#[should_panic(expected = "Error(Contract, #8)")]
fn unauthorized_access_panics_with_a_descriptive_contract_error() {
    let (env, client, alice, bob) = setup();
    let session = client.create_session(&alice, &1, &0);
    client.submit_guess(&bob, &session, &BytesN::from_array(&env, &[2u8; 32]), &0, &false);
}

#[test]
fn streaks_are_stored_per_player() {
    let (env, client, alice, bob) = setup();
    // Streaks are keyed by calendar day; move off day 0.
    env.ledger().set_timestamp(10 * 86_400);
    let session = client.create_session(&alice, &1, &0);
    client.submit_guess(&alice, &session, &BytesN::from_array(&env, &[2u8; 32]), &1, &true);
    client.finalize_session(&alice, &session);
    assert_eq!(client.get_streak(&alice).current, 1);
    assert_eq!(client.get_streak(&bob).current, 0);
}
