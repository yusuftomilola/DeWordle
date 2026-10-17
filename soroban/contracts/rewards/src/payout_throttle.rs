use soroban_sdk::{contracterror, symbol_short, Env};

const SECONDS_PER_DAY: u64 = 86_400;
pub const MAX_DAILY_PAYOUT_AMOUNT: i128 = 1_000_000;

#[contracterror]
#[derive(Copy, Clone, Debug, Eq, PartialEq, PartialOrd, Ord)]
#[repr(u32)]
pub enum RewardError {
    /// The payout would take the rolling 24-hour total above the cap.
    DailyCapExceeded = 1,
    /// The amount is zero or negative.
    InvalidAmount = 2,
    /// Adding the amount to the window total overflowed `i128`.
    Overflow = 3,
}

/// Records a payout against the rolling 24-hour cap.
///
/// Rejects non-positive amounts (which would otherwise lower the running
/// total), amounts that would take the window above `MAX_DAILY_PAYOUT_AMOUNT`
/// (so a single transaction can never drain more than the cap), and amounts
/// whose addition overflows.
pub fn record_payout(env: &Env, amount: i128) -> Result<(), RewardError> {
    if amount <= 0 {
        return Err(RewardError::InvalidAmount);
    }
    let key = symbol_short!("PAYOUT");
    let now = env.ledger().timestamp();

    let mut window: (i128, u64) = env.storage().instance().get(&key).unwrap_or((0, now));

    if now.saturating_sub(window.1) >= SECONDS_PER_DAY {
        window = (0, now);
    }

    let new_total = window
        .0
        .checked_add(amount)
        .ok_or(RewardError::Overflow)?;
    if new_total > MAX_DAILY_PAYOUT_AMOUNT {
        return Err(RewardError::DailyCapExceeded);
    }

    window.0 = new_total;
    env.storage().instance().set(&key, &window);
    Ok(())
}
