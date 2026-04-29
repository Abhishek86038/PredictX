// Prediction Service - Handles interaction with prediction contract/backend

const PREDICTIONS_KEY = 'xpoll_predictions';

const getStoredPredictions = () => {
  const stored = localStorage.getItem(PREDICTIONS_KEY);
  return stored ? JSON.parse(stored) : [];
};

const savePredictions = (predictions) => {
  localStorage.setItem(PREDICTIONS_KEY, JSON.stringify(predictions));
};

export const createPrediction = async (walletAddress, crypto, timeframe, startPrice, direction, amount) => {
  console.log('Creating prediction:', { walletAddress, crypto, timeframe, startPrice, direction, amount });
  
  const newPrediction = {
    id: Math.floor(Math.random() * 1000000),
    walletAddress,
    crypto,
    timeframe,
    startPrice,
    direction,
    stake: amount,
    createdAt: new Date().toISOString(),
    status: 'active', // 'active' or 'settled'
    won: null,
    reward: 0
  };

  const predictions = getStoredPredictions();
  predictions.unshift(newPrediction);
  savePredictions(predictions);

  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({ 
        predictionId: newPrediction.id, 
        success: true 
      });
    }, 1000);
  });
};

export const getUserPredictions = async (walletAddress, filter = 'active') => {
  const allPredictions = getStoredPredictions();
  
  // Filter by wallet address and status
  return allPredictions.filter(p => 
    p.walletAddress === walletAddress && 
    (filter === 'active' ? p.status === 'active' : p.status === 'settled')
  );
};

export const settlePrediction = async (predictionId, endPrice, won) => {
  const predictions = getStoredPredictions();
  const index = predictions.findIndex(p => p.id === predictionId);
  
  if (index !== -1) {
    predictions[index].status = 'settled';
    predictions[index].won = won;
    predictions[index].endPrice = endPrice;
    predictions[index].reward = won ? predictions[index].stake * 1.8 : 0;
    savePredictions(predictions);
  }
  
  return { success: true };
};
