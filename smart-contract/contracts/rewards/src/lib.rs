// Rewards Distribution - Calculate winnings, track stats, handle referrals

#![no_std]
use soroban_sdk::{contract, contractimpl, Env, Address, Symbol, i128};

#[contract]
pub struct RewardsDistributionContract;

#[contractimpl]
impl RewardsDistributionContract {
    // Initialize
    pub fn init(env: Env) {
        let storage = env.storage().persistent();
        storage.set(&Symbol::new(&env, "total_distributed"), &0i128);
    }

    // Update user statistics
    pub fn update_user_stats(
        env: Env,
        user: Address,
        won: bool,
        amount: i128,
    ) -> bool {
        let storage = env.storage().persistent();

        let wins_key = Symbol::new(&env, "wins");
        let losses_key = Symbol::new(&env, "losses");

        if won {
            let wins: u32 = storage.get(&wins_key).unwrap_or(Ok(0u32)).unwrap_or(0);
            storage.set(&wins_key, &(wins + 1));
        } else {
            let losses: u32 = storage.get(&losses_key).unwrap_or(Ok(0u32)).unwrap_or(0);
            storage.set(&losses_key, &(losses + 1));
        }

        true
    }

    // Get user statistics
    pub fn get_user_stats(env: Env, _user: Address) -> (u32, u32, i128, u32) {
        let storage = env.storage().persistent();

        let wins: u32 = storage.get(&Symbol::new(&env, "wins")).unwrap_or(Ok(0u32)).unwrap_or(0);
        let losses: u32 = storage.get(&Symbol::new(&env, "losses")).unwrap_or(Ok(0u32)).unwrap_or(0);
        
        let total = wins + losses;
        let win_rate = if total > 0 { (wins * 100) / total } else { 0 };

        (wins, losses, 0, win_rate)
    }
}
