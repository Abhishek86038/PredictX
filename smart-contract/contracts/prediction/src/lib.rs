// Prediction Staking - Accept bets, manage stakes, settle winners

#![no_std]
use soroban_sdk::{contract, contractimpl, Env, Address, Symbol, String, contracttype};

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct Prediction {
    pub id: u32,
    pub crypto: String,
    pub timeframe: u32,
    pub start_price: i128,
    pub end_time: u64,
    pub creator: Address,
    pub settled: bool,
}

#[contract]
pub struct PredictionStakingContract;

#[contractimpl]
impl PredictionStakingContract {
    // Initialize prediction
    pub fn init(env: Env) {
        let storage = env.storage().persistent();
        storage.set(&Symbol::new(&env, "count"), &0u32);
    }

    // Create new prediction
    pub fn create_prediction(
        env: Env,
        crypto_symbol: String,
        timeframe_minutes: u32,
        start_price: i128,
        timestamp: u64,
        creator: Address,
    ) -> u32 {
        creator.require_auth();
        let storage = env.storage().persistent();
        
        let count: u32 = storage.get::<_, u32>(&Symbol::new(&env, "count")).unwrap_or(0);
        let pred_id = count + 1;
        
        let prediction = Prediction {
            id: pred_id,
            crypto: crypto_symbol,
            timeframe: timeframe_minutes,
            start_price,
            end_time: timestamp + (timeframe_minutes as u64 * 60),
            creator,
            settled: false,
        };

        storage.set(&pred_id, &prediction);
        storage.set(&Symbol::new(&env, "count"), &pred_id);

        env.events().publish(
            (Symbol::new(&env, "prediction_created"),),
            (pred_id, start_price, timestamp),
        );

        pred_id
    }

    // Place prediction (stake tokens)
    pub fn place_prediction(
        env: Env,
        prediction_id: u32,
        direction: String, // "up" or "down"
        amount: i128,
        user: Address,
    ) -> bool {
        user.require_auth();
        let storage = env.storage().persistent();
        
        // Store stake info (simplified)
        let stake_key = (Symbol::new(&env, "stake"), prediction_id, user.clone());
        storage.set(&stake_key, &(direction, amount));

        true
    }

    // Settle prediction
    pub fn settle_prediction(
        env: Env,
        prediction_id: u32,
        end_price: i128,
        winner_direction: String,
    ) -> bool {
        let storage = env.storage().persistent();
        if let Some(mut prediction) = storage.get::<_, Prediction>(&prediction_id) {
            prediction.settled = true;
            storage.set(&prediction_id, &prediction);

            env.events().publish(
                (Symbol::new(&env, "prediction_settled"),),
                (prediction_id, winner_direction, end_price),
            );
            return true;
        }
        false
    }
    // Get prediction by ID
    pub fn get_prediction(env: Env, prediction_id: u32) -> Option<Prediction> {
        let storage = env.storage().persistent();
        storage.get::<_, Prediction>(&prediction_id)
    }

    // Get total count
    pub fn get_count(env: Env) -> u32 {
        let storage = env.storage().persistent();
        storage.get::<_, u32>(&Symbol::new(&env, "count")).unwrap_or(0)
    }
}
