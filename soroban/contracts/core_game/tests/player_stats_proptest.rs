//! Property-based tests for the statistics `core_game` accumulates per player.
//!
//! Random sequences of sessions (win or loss, 1..=6 attempts, 0..=3 idle days
//! between sessions) are played through the real contract; after every session
//! the observable state is checked against a pure model. When a property
//! fails, proptest shrinks the sequence to a minimal counter-example and prints
//! it (`minimal failing input: ...`); failing seeds are persisted next to this
//! file in `player_stats_proptest.proptest-regressions`.
//!
//! Run with more cases: `PROPTEST_CASES=1000 cargo test -p core-game --test player_stats_proptest`.

use core_game::{CoreGameContract, CoreGameContractClient};
use dewordle_types::SessionStatus;
use proptest::prelude::*;
use soroban_sdk::testutils::{Address as _, EnvTestConfig, Ledger as _};
use soroban_sdk::{Address, BytesN, Env};

const SECONDS_PER_DAY: u64 = 86_400;
const MAX_ATTEMPTS: u32 = 6;

/// One played session: did the player win, how many guesses, and how many full
/// days passed since the previous session started.
#[derive(Debug, Clone)]
struct PlayedSession {
    win: bool,
    attempts: u32,
    idle_days: u64,
}

/// Each case builds many environments; skip the per-case JSON snapshot files.
fn new_env() -> Env {
    Env::new_with_config(EnvTestConfig { capture_snapshot_at_drop: false })
}

fn session_strategy() -> impl Strategy<Value = PlayedSession> {
    (any::<bool>(), 1..=MAX_ATTEMPTS, 0u64..=3).prop_map(|(win, attempts, idle_days)| PlayedSession {
        win,
        // A loss always uses every attempt.
        attempts: if win { attempts } else { MAX_ATTEMPTS },
        idle_days,
    })
}

/// 1 to 8 sessions per case.
fn sequence_strategy() -> impl Strategy<Value = Vec<PlayedSession>> {
    prop::collection::vec(session_strategy(), 1..=8)
}

/// Pure model of the contract's streak rule (`update_streak`).
fn model_streak(days_played: &[u32]) -> (u32, u32) {
    let (mut current, mut max, mut last) = (0u32, 0u32, 0u32);
    for &day in days_played {
        if last + 1 == day {
            current += 1;
        } else if last != day {
            current = 1;
        }
        max = max.max(current);
        last = day;
    }
    (current, max)
}

struct Totals {
    games: u32,
    wins: u32,
    losses: u32,
    total_attempts: u32,
    days_played: Vec<u32>,
}

/// Plays `sequence` through the contract and returns the totals it observed.
fn play(env: &Env, sequence: &[PlayedSession]) -> (CoreGameContractClient<'static>, Address, Totals) {
    env.mock_all_auths();
    // Start well after day 0 so "last played = 0" never aliases a real day.
    env.ledger().set_timestamp(10 * SECONDS_PER_DAY);

    let contract_id = env.register(CoreGameContract, ());
    let client = CoreGameContractClient::new(env, &contract_id);
    // The client only borrows `env`, which outlives it for the whole test case.
    let client: CoreGameContractClient<'static> = unsafe { core::mem::transmute(client) };

    let admin = Address::generate(env);
    let player = Address::generate(env);
    client.init(&admin);

    let mut totals = Totals { games: 0, wins: 0, losses: 0, total_attempts: 0, days_played: vec![] };
    let mut published_days = std::collections::BTreeSet::new();

    for (nonce, s) in sequence.iter().enumerate() {
        let now = env.ledger().timestamp() + s.idle_days * SECONDS_PER_DAY;
        env.ledger().set_timestamp(now);
        let day = (now / SECONDS_PER_DAY) as u32;

        if published_days.insert(day) {
            client.set_day_config(&day, &BytesN::from_array(env, &[7u8; 32]), &MAX_ATTEMPTS, &(now + SECONDS_PER_DAY));
        }

        let session_id = client.create_session(&player, &day, &(nonce as u32));
        for attempt in 1..=s.attempts {
            let correct = s.win && attempt == s.attempts;
            let commitment = BytesN::from_array(env, &[attempt as u8; 32]);
            client.submit_guess(&player, &session_id, &commitment, &0, &correct);
        }

        let before_finalize = client.get_session(&session_id);
        match before_finalize.status {
            SessionStatus::Won => totals.wins += 1,
            SessionStatus::Lost => totals.losses += 1,
            // `SessionStatus` has no `Debug`, so report the position only.
            _ => panic!("session {nonce} ended neither won nor lost"),
        }
        totals.total_attempts += before_finalize.attempts_used;
        totals.games += 1;

        client.finalize_session(&player, &session_id);
        totals.days_played.push(day);
    }
    (client, player, totals)
}

proptest! {
    #![proptest_config(ProptestConfig { cases: 256, ..ProptestConfig::default() })]

    /// total games always equals wins + losses, and matches what was played.
    #[test]
    fn total_games_equals_wins_plus_losses(sequence in sequence_strategy()) {
        let env = new_env();
        let (_client, _player, totals) = play(&env, &sequence);

        prop_assert_eq!(totals.games, totals.wins + totals.losses);
        prop_assert_eq!(totals.games as usize, sequence.len());
        prop_assert_eq!(totals.wins as usize, sequence.iter().filter(|s| s.win).count());
        prop_assert_eq!(totals.losses as usize, sequence.iter().filter(|s| !s.win).count());
    }

    /// The recorded attempts add up to the generated ones, so the average is exact and in range.
    #[test]
    fn average_attempts_is_mathematically_correct(sequence in sequence_strategy()) {
        let env = new_env();
        let (_client, _player, totals) = play(&env, &sequence);

        let expected_total: u32 = sequence.iter().map(|s| s.attempts).sum();
        prop_assert_eq!(totals.total_attempts, expected_total);

        // Compare as fractions to avoid rounding: avg = total / games.
        let games = totals.games as u64;
        let total = totals.total_attempts as u64;
        prop_assert!(total >= games, "every game uses at least one attempt");
        prop_assert!(total <= games * MAX_ATTEMPTS as u64, "no game exceeds the attempt limit");
        let avg_x100 = total * 100 / games;
        prop_assert!((100..=(MAX_ATTEMPTS as u64) * 100).contains(&avg_x100));
    }

    /// The streak never exceeds the games played and follows the consecutive-day rule exactly.
    #[test]
    fn streak_never_exceeds_total_games(sequence in sequence_strategy()) {
        let env = new_env();
        let (client, player, totals) = play(&env, &sequence);

        let streak = client.get_streak(&player);
        prop_assert!(streak.current <= totals.games, "current streak {} > games {}", streak.current, totals.games);
        prop_assert!(streak.max <= totals.games, "max streak {} > games {}", streak.max, totals.games);
        prop_assert!(streak.current <= streak.max);
        prop_assert!(streak.max >= 1);

        let (expected_current, expected_max) = model_streak(&totals.days_played);
        prop_assert_eq!(streak.current, expected_current);
        prop_assert_eq!(streak.max, expected_max);
        prop_assert_eq!(streak.last_day_played, *totals.days_played.last().unwrap());
    }
}

/// A fixed example so the model itself is covered by a plain, readable test.
#[test]
fn streak_model_matches_a_hand_computed_example() {
    // days: 5, 6, 7 (run of 3), 9 (gap -> reset), 9 (same day), 10 (run of 2)
    assert_eq!(model_streak(&[5, 6, 7]), (3, 3));
    assert_eq!(model_streak(&[5, 6, 7, 9]), (1, 3));
    assert_eq!(model_streak(&[5, 6, 7, 9, 9]), (1, 3));
    assert_eq!(model_streak(&[5, 6, 7, 9, 9, 10]), (2, 3));
}
