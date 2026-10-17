use dewordle_utils::ReentrancyGuard;
use rewards::{RewardsContract, RewardsContractClient};
use soroban_sdk::testutils::Address as _;
use soroban_sdk::{symbol_short, Address, Env};

fn setup() -> (Env, Address, RewardsContractClient<'static>) {
    let env = Env::default();
    env.mock_all_auths();
    let id = env.register(RewardsContract, ());
    let client = RewardsContractClient::new(&env, &id);
    let admin = Address::generate(&env);
    client.init(&admin);
    (env, id, client)
}

#[test]
fn claim_releases_the_guard_so_it_can_be_called_repeatedly() {
    let (env, id, client) = setup();
    let player = Address::generate(&env);
    client.accrue(&player, &10, &1, &symbol_short!("win"));
    assert_eq!(client.claim(&player), 10);
    env.as_contract(&id, || assert!(!ReentrancyGuard::is_entered(&env)));

    client.accrue(&player, &5, &2, &symbol_short!("win"));
    assert_eq!(client.claim(&player), 5);
    assert_eq!(client.claimed_total(&player), 15);
}

#[test]
fn claim_is_blocked_while_the_guard_is_held() {
    let (env, id, client) = setup();
    let player = Address::generate(&env);
    client.accrue(&player, &10, &1, &symbol_short!("win"));

    // Simulate "already executing inside a guarded section" by holding the
    // flag in the contract's own instance storage, as a re-entrant call would.
    env.as_contract(&id, || {
        std::mem::forget(ReentrancyGuard::enter(&env));
    });

    let result = client.try_claim(&player);
    assert!(result.is_err(), "claim must fail while the guard is held");
    // Balance untouched: nothing was paid out by the blocked call.
    assert_eq!(client.balance_of(&player), 10);
}
