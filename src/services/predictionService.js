import { callContract, queryContract } from './stellar';
import { nativeToScVal } from 'stellar-sdk';

const CONTRACT_ID = import.meta.env.VITE_PREDICTION_ADDRESS;

export const createPrediction = async (walletAddress, crypto, timeframe, startPrice, direction, amount) => {
  console.log('Creating real prediction:', { walletAddress, crypto, timeframe, startPrice, direction, amount });
  
  try {
    const args = [
      nativeToScVal(crypto, { type: 'string' }),
      nativeToScVal(parseInt(timeframe), { type: 'u32' }),
      nativeToScVal(BigInt(Math.floor(startPrice * 100)), { type: 'i128' }), // Use cents for precision
      nativeToScVal(BigInt(Math.floor(Date.now() / 1000)), { type: 'u64' }),
      nativeToScVal(walletAddress, { type: 'address' })
    ];

    const result = await callContract(CONTRACT_ID, 'create_prediction', args);
    return { 
      predictionId: result.hash, // Simplified for MVP
      success: true 
    };
  } catch (error) {
    console.error('Failed to create prediction:', error);
    throw error;
  }
};

export const placePrediction = async (walletAddress, predictionId, direction, amount) => {
  try {
    const args = [
      nativeToScVal(parseInt(predictionId), { type: 'u32' }),
      nativeToScVal(direction, { type: 'string' }),
      nativeToScVal(BigInt(amount), { type: 'i128' }),
      nativeToScVal(walletAddress, { type: 'address' })
    ];

    await callContract(CONTRACT_ID, 'place_prediction', args);
    return { success: true };
  } catch (error) {
    console.error('Failed to place prediction:', error);
    throw error;
  }
};

export const getUserPredictions = async (walletAddress, _filter = 'active') => {
  try {
    const count = await queryContract(CONTRACT_ID, 'get_count');
    const predictions = [];
    
    for (let i = 1; i <= count; i++) {
      const pred = await queryContract(CONTRACT_ID, 'get_prediction', [nativeToScVal(i, { type: 'u32' })]);
      if (pred && (pred.creator === walletAddress || !walletAddress)) {
        predictions.push({
          id: pred.id,
          crypto: pred.crypto,
          direction: 'up', // Needs mapping from stake storage
          startPrice: Number(pred.start_price) / 100,
          stake: 0, // Needs mapping
          timeframe: pred.timeframe,
          createdAt: new Date(Number(pred.end_time) * 1000 - pred.timeframe * 60000).toISOString(),
          won: pred.settled ? true : null,
          reward: 0
        });
      }
    }
    return predictions;
  } catch (error) {
    console.error('Error fetching predictions:', error);
    return [];
  }
};
