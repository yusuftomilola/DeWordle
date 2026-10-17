//! Gas (CPU / memory) benchmarks for the `core_game` contract entry points.
//!
//! Run locally and print the table:
//!
//! ```bash
//! cargo test --manifest-path soroban/Cargo.toml -p core-game --test gas_benchmarks -- --nocapture
//! ```
//!
//! Each test resets the budget, calls one entry point and reads the CPU
//! instruction and memory-byte cost. The ceilings are deliberately generous
//! (see `docs/contract-benchmarks.md`): they fail on a large regression, not
//! on noise from SDK upgrades. Update the baseline table in the docs when you
//! intentionally change a function's cost.

use core_game::{CoreGameContract, CoreGameContractClient};
use soroban_sdk::testutils::{Address as _, Ledger as _};
use soroban_sdk::{Address, BytesN, Env};

struct Fixture {
    env: Env,
    contract_id: Address,
    admin: Address,
    player: Address,
}

impl Fixture {
    fn client(&self) -> CoreGameContractClient<'_> {
        CoreGameContractClient::new(&self.env, &self.contract_id)
    }
}

fn setup() -> Fixture {
    let env = Env::default();
    env.mock_all_auths();
    env.ledger().set_timestamp(1_000);
    let contract_id = env.register(CoreGameContract, ());
    let admin = Address::generate(&env);
    let player = Address::generate(&env);
    Fixture { env, contract_id, admin, player }
}

/// CPU instructions and memory bytes charged since the budget was last reset.
fn cost(env: &Env) -> (u64, u64) {
    let budget = env.cost_estimate().budget();
    (budget.cpu_instruction_cost(), budget.memory_bytes_cost())
}

fn measure<R>(env: &Env, name: &str, ceiling_cpu: u64, f: impl FnOnce() -> R) -> R {
    env.cost_estimate().budget().reset_default();
    let out = f();
    let (cpu, mem) = cost(env);
    println!("BENCH {name:<22} cpu={cpu:>10} mem={mem:>8}");
    assert!(
        cpu <= ceiling_cpu,
        "{name} used {cpu} CPU instructions, over the {ceiling_cpu} ceiling; if intentional, update docs/contract-benchmarks.md and this ceiling"
    );
    out
}

fn publish_day(f: &Fixture, day_id: u32) {
    // The puzzle commitment is opaque to the contract, so any 32 bytes will do.
    f.client().set_day_config(&day_id, &BytesN::from_array(&f.env, &[7u8; 32]), &6, &100_000);
}

#[test]
fn bench_init() {
    let f = setup();
    measure(&f.env, "init", 500_000, || f.client().init(&f.admin));
}

#[test]
fn bench_set_day_config() {
    let f = setup();
    f.client().init(&f.admin);
    measure(&f.env, "set_day_config", 500_000, || publish_day(&f, 1));
}

#[test]
fn bench_create_session() {
    let f = setup();
    f.client().init(&f.admin);
    publish_day(&f, 1);
    measure(&f.env, "create_session", 1_000_000, || f.client().create_session(&f.player, &1, &1));
}

#[test]
fn bench_submit_guess() {
    let f = setup();
    f.client().init(&f.admin);
    publish_day(&f, 1);
    let session = f.client().create_session(&f.player, &1, &1);
    let commitment = BytesN::from_array(&f.env, &[9u8; 32]);
    measure(&f.env, "submit_guess", 1_000_000, || {
        f.client().submit_guess(&f.player, &session, &commitment, &0, &false)
    });
}

#[test]
fn bench_finalize_session() {
    let f = setup();
    f.client().init(&f.admin);
    publish_day(&f, 1);
    let session = f.client().create_session(&f.player, &1, &1);
    let commitment = BytesN::from_array(&f.env, &[9u8; 32]);
    f.client().submit_guess(&f.player, &session, &commitment, &0, &true);
    measure(&f.env, "finalize_session", 1_000_000, || f.client().finalize_session(&f.player, &session));
}

#[test]
fn bench_get_session() {
    let f = setup();
    f.client().init(&f.admin);
    publish_day(&f, 1);
    let session = f.client().create_session(&f.player, &1, &1);
    measure(&f.env, "get_session", 500_000, || f.client().get_session(&session));
}
