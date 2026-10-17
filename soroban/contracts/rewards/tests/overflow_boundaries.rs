//! Boundary-condition tests for reward accrual and claiming.
//!
//! Reward balances are `u64` in this contract (emission points and balances),
//! so "extremely large" here means values approaching `u64::MAX`. The payout
//! throttle works on `i128` amounts and is covered in `payout_throttle.rs`.
//! Overflow must fail with the contract error `RewardsError::Overflow` (#5),
//! never wrap silently.

use rewards::{RewardsContract, RewardsContractClient, RewardsError};

const OVERFLOW: u32 = RewardsError::Overflow as u32;

fn overflow() -> soroban_sdk::Error {
    soroban_sdk::Error::from_contract_error(OVERFLOW)
}
use soroban_sdk::testutils::{Address as _, EnvTestConfig};
use soroban_sdk::{symbol_short, Address, Env};

struct Fixture {
    env: Env,
    contract_id: Address,
    player: Address,
}

impl Fixture {
    fn client(&self) -> RewardsContractClient<'_> {
        RewardsContractClient::new(&self.env, &self.contract_id)
    }
    fn accrue(&self, points: u64, nonce: u64) {
        self.client().accrue(&self.player, &points, &nonce, &symbol_short!("win"));
    }
    /// `Ok(())` if the accrual succeeded, otherwise the contract error it failed with.
    fn try_accrue(&self, points: u64, nonce: u64) -> Result<(), soroban_sdk::Error> {
        match self.client().try_accrue(&self.player, &points, &nonce, &symbol_short!("win")) {
            Ok(_) => Ok(()),
            Err(Ok(e)) => Err(e),
            Err(Err(invoke)) => panic!("host error instead of a contract error: {invoke:?}"),
        }
    }
}

fn setup() -> Fixture {
    let env = Env::new_with_config(EnvTestConfig { capture_snapshot_at_drop: false });
    env.mock_all_auths();
    let contract_id = env.register(RewardsContract, ());
    let admin = Address::generate(&env);
    let player = Address::generate(&env);
    RewardsContractClient::new(&env, &contract_id).init(&admin);
    Fixture { env, contract_id, player }
}

// --- accrual -----------------------------------------------------------------

#[test]
fn accruing_u64_max_in_one_go_is_representable() {
    let f = setup();
    f.accrue(u64::MAX, 1);
    assert_eq!(f.client().balance_of(&f.player), u64::MAX);
}

#[test]
fn accruing_past_u64_max_fails_with_the_overflow_error_and_keeps_the_balance() {
    let f = setup();
    f.accrue(u64::MAX - 5, 1);

    assert_eq!(f.try_accrue(6, 2), Err(overflow()));
    assert_eq!(f.client().balance_of(&f.player), u64::MAX - 5, "a rejected accrual must not change the balance");

    // The failed call did not consume its nonce, so the same nonce still works with a valid amount.
    f.accrue(5, 2);
    assert_eq!(f.client().balance_of(&f.player), u64::MAX);
}

#[test]
fn the_overflow_error_has_a_stable_descriptive_code() {
    let f = setup();
    f.accrue(u64::MAX, 1);
    assert_eq!(f.try_accrue(1, 2), Err(overflow()));
    assert_eq!(OVERFLOW, 5);
}

#[test]
fn many_accruals_summing_exactly_to_the_maximum_succeed_and_one_more_fails() {
    let f = setup();
    let chunk = u64::MAX / 5; // 5 * chunk == u64::MAX - 0 (u64::MAX is divisible by 5)
    assert_eq!(chunk as u128 * 5, u64::MAX as u128);
    for nonce in 1..=5 {
        f.accrue(chunk, nonce);
    }
    assert_eq!(f.client().balance_of(&f.player), u64::MAX);
    assert_eq!(f.try_accrue(1, 6), Err(overflow()));
}

#[test]
fn normal_accrual_sequences_add_up_exactly() {
    let f = setup();
    let amounts = [1u64, 10, 100, 1_000, 10_000];
    for (i, a) in amounts.iter().enumerate() {
        f.accrue(*a, i as u64 + 1);
    }
    assert_eq!(f.client().balance_of(&f.player), amounts.iter().sum::<u64>());
}

#[test]
fn zero_point_accruals_are_harmless_but_still_consume_the_nonce() {
    let f = setup();
    f.accrue(0, 1);
    assert_eq!(f.client().balance_of(&f.player), 0);
    assert!(f.client().try_accrue(&f.player, &5, &1, &symbol_short!("win")).is_err());
}

// --- claiming ------------------------------------------------------------------

#[test]
fn claiming_the_maximum_balance_moves_it_to_the_claimed_total() {
    let f = setup();
    f.accrue(u64::MAX, 1);
    assert_eq!(f.client().claim(&f.player), u64::MAX);
    assert_eq!(f.client().balance_of(&f.player), 0);
    assert_eq!(f.client().claimed_total(&f.player), u64::MAX);
}

#[test]
fn the_claimed_total_cannot_pass_u64_max() {
    let f = setup();
    f.accrue(u64::MAX - 10, 1);
    f.client().claim(&f.player);

    f.accrue(11, 2);
    assert_eq!(f.client().try_claim(&f.player).unwrap_err(), Ok(overflow()));

    // The failed claim left both figures untouched.
    assert_eq!(f.client().claimed_total(&f.player), u64::MAX - 10);
    assert_eq!(f.client().balance_of(&f.player), 11);

    // A claim that fits the remaining headroom of 10 is still possible after the balance is reduced.
    // (The balance cannot be lowered by the player, so the cap is a hard stop; verify it stays one.)
    assert!(f.client().try_claim(&f.player).is_err());
}

#[test]
fn claiming_an_empty_balance_is_a_no_op_that_returns_zero() {
    let f = setup();
    assert_eq!(f.client().claim(&f.player), 0);
    assert_eq!(f.client().claimed_total(&f.player), 0);
}

#[test]
fn repeated_claims_accumulate_exactly() {
    let f = setup();
    let mut expected = 0u64;
    for (nonce, points) in [(1u64, 1_000u64), (2, 2_500), (3, 40)] {
        f.accrue(points, nonce);
        expected += f.client().claim(&f.player);
    }
    assert_eq!(f.client().claimed_total(&f.player), expected);
    assert_eq!(expected, 3_540);
}

// --- views ---------------------------------------------------------------------------

#[test]
fn player_stats_saturate_instead_of_trapping_near_the_cap() {
    let f = setup();
    f.accrue(u64::MAX - 1, 1);
    f.client().claim(&f.player);
    f.accrue(10, 2);

    let stats = f.client().get_player_stats(&f.player);
    assert_eq!(stats.tokens_earned, u64::MAX, "balance + claimed would overflow; the view saturates");
}
