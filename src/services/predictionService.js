// Prediction Service - Real-time tracking using LocalStorage (Production Simulator)

export const createPrediction = async (walletAddress, crypto, timeframe, startPrice, direction, amount) => {
  console.log('Creating prediction:', { walletAddress, crypto, timeframe, startPrice, direction, amount });
  
  const newPrediction = {
    id: Math.floor(Math.random() * 10000),
    walletAddress,
    crypto,
    timeframe,
    startPrice,
    direction,
    stake: amount,
    createdAt: new Date().toISOString(),
    status: 'active',
    won: null,
    reward: 0
  };

  // Persist to LocalStorage for real tracking
  const stored = JSON.parse(localStorage.getItem('predictx_predictions') || '[]');
  stored.unshift(newPrediction);
  localStorage.setItem('predictx_predictions', JSON.stringify(stored));

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
  const stored = JSON.parse(localStorage.getItem('predictx_predictions') || '[]');
  
  // Filter by wallet and status
  const userPredictions = stored.filter(p => p.walletAddress === walletAddress);
  
  if (filter === 'active') {
    return userPredictions.filter(p => p.status === 'active');
  } else {
    return userPredictions.filter(p => p.status === 'settled');
  }
};

export const settlePrediction = async (predictionId, endPrice, winner) => {
  const stored = JSON.parse(localStorage.getItem('predictx_predictions') || '[]');
  const index = stored.findIndex(p => p.id === predictionId);
  
  if (index !== -1) {
    stored[index].status = 'settled';
    stored[index].endPrice = endPrice;
    stored[index].won = winner;
    stored[index].reward = winner ? stored[index].stake * 1.9 : 0;
    localStorage.setItem('predictx_predictions', JSON.stringify(stored));
  }
  
  return { success: true };
};
