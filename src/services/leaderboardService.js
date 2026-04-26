export const getLeaderboard = async (timeRange = 'daily') => {
  // Mock leaderboard data
  return {
    rankings: [
      { address: 'GB...1234', profit: 1200, winRate: 75, totalPredictions: 40 },
      { address: 'GC...5678', profit: 950, winRate: 68, totalPredictions: 35 },
      { address: 'GD...9012', profit: 800, winRate: 62, totalPredictions: 30 },
      { address: 'GE...3456', profit: 750, winRate: 70, totalPredictions: 25 },
      { address: 'GF...7890', profit: 600, winRate: 55, totalPredictions: 50 },
    ]
  };
};

export const getUserRank = async (walletAddress, timeRange = 'daily') => {
  return { rank: 12, profit: 150, winRate: 58 };
};
