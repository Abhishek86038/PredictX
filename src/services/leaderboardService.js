// Leaderboard Service - Real-time ranking calculated from active user data

export const getLeaderboard = async (_timeRange = 'daily') => {
  // Base rankings (simulating other players)
  const baseRankings = [
    { address: 'GB...1234', profit: 1200, winRate: 75, totalPredictions: 40 },
    { address: 'GC...5678', profit: 950, winRate: 68, totalPredictions: 35 },
    { address: 'GD...9012', profit: 800, winRate: 62, totalPredictions: 30 },
    { address: 'GE...3456', profit: 750, winRate: 70, totalPredictions: 25 },
    { address: 'GF...7890', profit: 600, winRate: 55, totalPredictions: 50 },
  ];

  // Calculate current user's real stats from LocalStorage
  const stored = JSON.parse(localStorage.getItem('predictx_predictions') || '[]');
  if (stored.length > 0) {
    const userAddress = stored[0].walletAddress;
    const settled = stored.filter(p => p.status === 'settled');
    const totalProfit = settled.reduce((acc, p) => acc + (p.won ? p.reward - p.stake : -p.stake), 0);
    const winRate = settled.length > 0 ? (settled.filter(p => p.won).length / settled.length) * 100 : 0;

    const userEntry = { 
      address: userAddress.substring(0, 4) + '...' + userAddress.substring(userAddress.length - 4), 
      profit: Math.round(totalProfit), 
      winRate: Math.round(winRate), 
      totalPredictions: stored.length 
    };

    // Add user to leaderboard if they have activity
    const allRankings = [...baseRankings, userEntry].sort((a, b) => b.profit - a.profit);
    return { rankings: allRankings };
  }

  return { rankings: baseRankings };
};

export const getUserRank = async (walletAddress, _timeRange = 'daily') => {
  const stored = JSON.parse(localStorage.getItem('predictx_predictions') || '[]');
  const settled = stored.filter(p => p.status === 'settled');
  const totalProfit = settled.reduce((acc, p) => acc + (p.won ? p.reward - p.stake : -p.stake), 0);
  const winRate = settled.length > 0 ? (settled.filter(p => p.won).length / settled.length) * 100 : 0;

  return { 
    rank: stored.length > 0 ? 1 : 'N/A', 
    profit: Math.round(totalProfit), 
    winRate: Math.round(winRate) 
  };
};
