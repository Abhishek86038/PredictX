import { getUserPredictions } from './predictionService';

export const getLeaderboard = async (_timeRange = 'daily') => {
  try {
    // In a real app, we would use an indexer or a specialized contract
    // For this MVP, we'll derive it from predictions
    const allPredictions = await getUserPredictions(null); // Fetch all
    
    const userStats = {};
    allPredictions.forEach(p => {
      if (!userStats[p.creator]) {
        userStats[p.creator] = { address: p.creator, profit: 0, winRate: 0, totalPredictions: 0, wins: 0 };
      }
      userStats[p.creator].totalPredictions++;
      if (p.won) {
        userStats[p.creator].wins++;
        userStats[p.creator].profit += p.reward;
      }
    });

    const rankings = Object.values(userStats).map(u => ({
      ...u,
      winRate: Math.round((u.wins / u.totalPredictions) * 100) || 0
    })).sort((a, b) => b.profit - a.profit);

    return { rankings };
  } catch (error) {
    console.error('Error fetching leaderboard:', error);
    return { rankings: [] };
  }
};

export const getUserRank = async (walletAddress, _timeRange = 'daily') => {
  const { rankings } = await getLeaderboard();
  const index = rankings.findIndex(u => u.address === walletAddress);
  if (index !== -1) {
    return { rank: index + 1, ...rankings[index] };
  }
  return { rank: 'N/A', profit: 0, winRate: 0 };
};
