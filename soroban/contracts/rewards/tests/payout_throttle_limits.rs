//! Tests for the payout throttle: a rolling 24-hour cap that stops a single
//! transaction (or many small ones) from draining more than
//! `MAX_DAILY_PAYOUT_AMOUNT`, and that rejects amounts which would overflow.

use rewards::payout_throttle::{record_payout, RewardError, MAX_DAILY_PAYOUT_AMOUNT};
use soroban_sdk::testutils::{Address as _, EnvTestConfig, Ledger as _};
use soroban_sdk::{contract, contractimpl, symbol_short, Address, Env};

const SECONDS_PER_DAY: u64 = 86_400;

#[contract]
struct Host;
#[contractimpl]
impl Host {}

fn setup() -> (Env, Address) {
    let env = Env::new_with_config(EnvTestConfig { capture_snapshot_at_drop: false });
    let id = env.register(Host, ());
    env.ledger().set_timestamp(1_000_000);
    (env, id)
}

fn pay(env: &Env, id: &Address, amount: i128) -> Result<(), RewardError> {
    env.as_contract(id, || record_payout(env, amount))
}

#[test]
fn a_single_payout_over_the_cap_is_rejected() {
    let (env, id) = setup();
    assert_eq!(pay(&env, &id, MAX_DAILY_PAYOUT_AMOUNT + 1), Err(RewardError::DailyCapExceeded));
    // Nothing was recorded, so the full cap is still available.
    assert_eq!(pay(&env, &id, MAX_DAILY_PAYOUT_AMOUNT), Ok(()));
}

#[test]
fn payouts_up_to_exactly_the_cap_are_allowed_then_blocked() {
    let (env, id) = setup();
    assert_eq!(pay(&env, &id, 600_000), Ok(()));
    assert_eq!(pay(&env, &id, 400_000), Ok(()));
    assert_eq!(pay(&env, &id, 1), Err(RewardError::DailyCapExceeded));
}

#[test]
fn many_small_payouts_cannot_drain_past_the_cap() {
    let (env, id) = setup();
    let mut paid = 0i128;
    for _ in 0..1_000 {
        if pay(&env, &id, 7_777).is_ok() {
            paid += 7_777;
        }
    }
    assert!(paid <= MAX_DAILY_PAYOUT_AMOUNT);
    assert!(paid > MAX_DAILY_PAYOUT_AMOUNT - 7_777, "the cap should be nearly used up");
}

#[test]
fn a_failed_payout_does_not_consume_the_budget() {
    let (env, id) = setup();
    assert_eq!(pay(&env, &id, 900_000), Ok(()));
    assert_eq!(pay(&env, &id, 200_000), Err(RewardError::DailyCapExceeded));
    assert_eq!(pay(&env, &id, 100_000), Ok(()));
}

#[test]
fn the_cap_resets_after_a_day() {
    let (env, id) = setup();
    assert_eq!(pay(&env, &id, MAX_DAILY_PAYOUT_AMOUNT), Ok(()));
    assert_eq!(pay(&env, &id, 1), Err(RewardError::DailyCapExceeded));

    env.ledger().set_timestamp(1_000_000 + SECONDS_PER_DAY - 1);
    assert_eq!(pay(&env, &id, 1), Err(RewardError::DailyCapExceeded));

    env.ledger().set_timestamp(1_000_000 + SECONDS_PER_DAY);
    assert_eq!(pay(&env, &id, MAX_DAILY_PAYOUT_AMOUNT), Ok(()));
}

#[test]
fn zero_and_negative_amounts_are_rejected() {
    let (env, id) = setup();
    assert_eq!(pay(&env, &id, 0), Err(RewardError::InvalidAmount));
    assert_eq!(pay(&env, &id, -1), Err(RewardError::InvalidAmount));
    // A negative amount must not "refund" budget: fill the cap, then try to lower it.
    assert_eq!(pay(&env, &id, MAX_DAILY_PAYOUT_AMOUNT), Ok(()));
    assert_eq!(pay(&env, &id, i128::MIN), Err(RewardError::InvalidAmount));
    assert_eq!(pay(&env, &id, 1), Err(RewardError::DailyCapExceeded));
}

#[test]
fn amounts_near_i128_max_are_rejected_without_overflowing() {
    let (env, id) = setup();
    assert_eq!(pay(&env, &id, i128::MAX), Err(RewardError::DailyCapExceeded));
    assert_eq!(pay(&env, &id, i128::MAX - 1), Err(RewardError::DailyCapExceeded));
}

#[test]
fn adding_to_a_window_total_near_i128_max_reports_overflow() {
    let (env, id) = setup();
    // Seed a window that is already at the type's limit (as corrupted or
    // migrated state could be) and check the addition cannot wrap.
    env.as_contract(&id, || {
        env.storage()
            .instance()
            .set(&symbol_short!("PAYOUT"), &(i128::MAX, env.ledger().timestamp()));
    });
    assert_eq!(pay(&env, &id, 1), Err(RewardError::Overflow));
}

