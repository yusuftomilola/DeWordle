//! Gas (CPU / memory) benchmarks for the `rewards` contract entry points.
//!
//! ```bash
//! cargo test --manifest-path soroban/Cargo.toml -p rewards --test gas_benchmarks -- --nocapture
//! ```
//!
//! See `docs/contract-benchmarks.md` for how to read and update the baselines.

use rewards::{RewardsContract, RewardsContractClient};
use soroban_sdk::testutils::Address as _;
use soroban_sdk::{symbol_short, Address, Env};

struct Fixture {
    env: Env,
    contract_id: Address,
    admin: Address,
    player: Address,
}

impl Fixture {
    fn client(&self) -> RewardsContractClient<'_> {
        RewardsContractClient::new(&self.env, &self.contract_id)
    }
}

fn setup() -> Fixture {
    let env = Env::default();
    env.mock_all_auths();
    let contract_id = env.register(RewardsContract, ());
    let admin = Address::generate(&env);
    let player = Address::generate(&env);
    Fixture { env, contract_id, admin, player }
}

fn measure<R>(env: &Env, name: &str, ceiling_cpu: u64, f: impl FnOnce() -> R) -> R {
    env.cost_estimate().budget().reset_default();
    let out = f();
    let budget = env.cost_estimate().budget();
    let (cpu, mem) = (budget.cpu_instruction_cost(), budget.memory_bytes_cost());
    println!("BENCH {name:<22} cpu={cpu:>10} mem={mem:>8}");
    assert!(
        cpu <= ceiling_cpu,
        "{name} used {cpu} CPU instructions, over the {ceiling_cpu} ceiling; if intentional, update docs/contract-benchmarks.md and this ceiling"
    );
    out
}

#[test]
fn bench_init() {
    let f = setup();
    measure(&f.env, "rewards::init", 500_000, || f.client().init(&f.admin));
}

#[test]
fn bench_set_emission() {
    let f = setup();
    f.client().init(&f.admin);
    measure(&f.env, "rewards::set_emission", 500_000, || f.client().set_emission(&1, &100, &10));
}

#[test]
fn bench_accrue() {
    let f = setup();
    f.client().init(&f.admin);
    measure(&f.env, "rewards::accrue", 1_000_000, || {
        f.client().accrue(&f.player, &50, &1, &symbol_short!("win"))
    });
}

#[test]
fn bench_claim() {
    let f = setup();
    f.client().init(&f.admin);
    f.client().accrue(&f.player, &50, &1, &symbol_short!("win"));
    measure(&f.env, "rewards::claim", 1_000_000, || f.client().claim(&f.player));
}

#[test]
fn bench_balance_of() {
    let f = setup();
    f.client().init(&f.admin);
    measure(&f.env, "rewards::balance_of", 500_000, || f.client().balance_of(&f.player));
}
