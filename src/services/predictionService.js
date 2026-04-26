// Prediction Service - Real Implementation using LocalStorage for persistence
// This simulates a real backend/contract state for a single-user demo

const STORAGE_KEY = 'predictx_predictions';

export const createPrediction = async (walletAddress, crypto, timeframe, startPrice, direction, amount) => {
  console.log('Creating real prediction:', { walletAddress, crypto, timeframe, startPrice, direction, amount });
  
  const predictions = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
  
  const newPrediction = {
    id: Date.now(),
    walletAddress,
    crypto,
    timeframe, // in minutes
    startPrice,
    direction,
    stake: amount,
    createdAt: new Date().toISOString(),
    status: 'active',
    settledAt: null,
    endPrice: null,
    won: null,
    reward: 0
  };
  
  predictions.unshift(newPrediction);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(predictions));
  
  return { 
    predictionId: newPrediction.id, 
    success: true 
  };
};

export const getUserPredictions = async (walletAddress, filter = 'active') => {
  const allPredictions = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
  const userPredictions = allPredictions.filter(p => p.walletAddress === walletAddress);
  
  if (filter === 'active') {
    return userPredictions.filter(p => p.status === 'active');
  } else if (filter === 'settled') {
    return userPredictions.filter(p => p.status === 'settled');
  }
  
  return userPredictions;
};

export const settlePrediction = async (predictionId, endPrice) => {
  const predictions = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
  const index = predictions.findIndex(p => p.id === predictionId);
  
  if (index === -1) return { success: false };
  
  const p = predictions[index];
  const isUp = p.direction === 'up';
  const won = isUp ? endPrice > p.startPrice : endPrice < p.startPrice;
  
  predictions[index] = {
    ...p,
    status: 'settled',
    settledAt: new Date().toISOString(),
    endPrice,
    won,
    reward: won ? p.stake * 1.8 : 0
  };
  
  localStorage.setItem(STORAGE_KEY, JSON.stringify(predictions));
  return { success: true, won };
};
