use rewards::{RewardsContract, RewardsContractClient};
use soroban_sdk::testutils::{Address as _, Events as _};
use soroban_sdk::{symbol_short, Address, Env};

fn setup() -> (Env, Address, RewardsContractClient<'static>, Address, Address) {
    let env = Env::default();
    env.mock_all_auths();
    let id = env.register(RewardsContract, ());
    let client = RewardsContractClient::new(&env, &id);
    let admin = Address::generate(&env);
    client.init(&admin);

    let alice = Address::generate(&env);
    let bob = Address::generate(&env);
    client.accrue(&alice, &10, &1, &symbol_short!("win"));
    client.accrue(&bob, &7, &1, &symbol_short!("win"));
    (env, admin, client, alice, bob)
}

#[test]
fn owner_can_claim_their_own_balance_only() {
    let (_env, _admin, client, alice, bob) = setup();
    assert_eq!(client.claim(&alice), 10);
    assert_eq!(client.balance_of(&alice), 0);
    // Bob's entry is untouched by Alice's claim.
    assert_eq!(client.balance_of(&bob), 7);
    assert_eq!(client.claimed_total(&bob), 0);
}

#[test]
fn another_player_cannot_claim_someone_elses_balance() {
    let (_env, _admin, client, alice, bob) = setup();
    // Bob names himself as caller but targets Alice's entry.
    let result = client.try_claim_for(&bob, &alice);
    assert!(result.is_err(), "cross-player claim must be rejected");
    assert_eq!(client.balance_of(&alice), 10, "victim balance unchanged");
    assert_eq!(client.claimed_total(&alice), 0);
    assert_eq!(client.balance_of(&bob), 7, "attacker balance unchanged");
}

#[test]
#[should_panic(expected = "Error(Contract, #910)")]
fn unauthorized_access_panics_with_not_owner_or_admin() {
    let (_env, _admin, client, alice, bob) = setup();
    client.claim_for(&bob, &alice);
}

#[test]
fn admin_override_is_allowed_and_audited_by_an_event() {
    let (env, admin, client, alice, _bob) = setup();
    assert_eq!(client.claim_for(&admin, &alice), 10);
    // Events of the last invocation: admin_claim (audit) then claimed.
    assert_eq!(env.events().all().len(), 2);
    assert_eq!(client.balance_of(&alice), 0);
    assert_eq!(client.claimed_total(&alice), 10);
}

#[test]
fn owner_claim_emits_no_admin_event() {
    let (env, _admin, client, alice, _bob) = setup();
    client.claim(&alice);
    assert_eq!(env.events().all().len(), 1);
}

#[test]
fn owner_claim_requires_the_owners_signature() {
    let (env, _admin, client, alice, _bob) = setup();
    // Drop the blanket authorisation: the player's own auth is now required.
    env.set_auths(&[]);
    assert!(client.try_claim(&alice).is_err());
    assert_eq!(client.balance_of(&alice), 10);
}

#[test]
fn claim_for_before_init_fails_cleanly() {
    let env = Env::default();
    env.mock_all_auths();
    let id = env.register(RewardsContract, ());
    let client = RewardsContractClient::new(&env, &id);
    let a = Address::generate(&env);
    assert!(client.try_claim_for(&a, &a).is_err());
}
