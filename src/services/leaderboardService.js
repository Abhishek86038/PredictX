const PREDICTIONS_KEY = 'xpoll_predictions';

export const getLeaderboard = async (_timeRange = 'daily') => {
  // Read all predictions from local storage
  const stored = localStorage.getItem(PREDICTIONS_KEY);
  const allPredictions = stored ? JSON.parse(stored) : [];

  // Group by wallet address
  const userStatsMap = {};

  allPredictions.forEach(p => {
    if (p.status !== 'settled') return;
    
    if (!userStatsMap[p.walletAddress]) {
      userStatsMap[p.walletAddress] = {
        address: p.walletAddress,
        profit: 0,
        wins: 0,
        losses: 0,
        totalPredictions: 0,
        winRate: 0
      };
    }

    const stats = userStatsMap[p.walletAddress];
    stats.totalPredictions += 1;
    
    if (p.won) {
      stats.wins += 1;
      stats.profit += (p.reward - p.stake);
    } else {
      stats.losses += 1;
      stats.profit -= p.stake;
    }
  });

  // Calculate win rates and create array
  const rankings = Object.values(userStatsMap).map(stats => {
    stats.winRate = stats.totalPredictions > 0 ? Math.round((stats.wins / stats.totalPredictions) * 100) : 0;
    return stats;
  });

  // Sort by profit descending
  rankings.sort((a, b) => b.profit - a.profit);

  return { rankings };
};

export const getUserRank = async (walletAddress, _timeRange = 'daily') => {
  const { rankings } = await getLeaderboard(_timeRange);
  const index = rankings.findIndex(r => r.address === walletAddress);
  
  if (index === -1) return null;
  
  return {
    rank: index + 1,
    ...rankings[index]
  };
};
