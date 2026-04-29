import { queryContract } from './stellar';
import { nativeToScVal } from 'stellar-sdk';

const CONTRACT_ID = import.meta.env.VITE_REWARDS_ADDRESS;

export const getUserStats = async (walletAddress) => {
  try {
    const stats = await queryContract(CONTRACT_ID, 'get_user_stats', [nativeToScVal(walletAddress, { type: 'address' })]);
    
    if (stats) {
      return {
        wins: Number(stats[0]),
        losses: Number(stats[1]),
        profit: Number(stats[2]),
        winRate: Number(stats[3]),
        totalStaked: 0, // Simplified for MVP
        recentPredictions: [] // Simplified
      };
    }
    return { wins: 0, losses: 0, profit: 0, winRate: 0, totalStaked: 0, recentPredictions: [] };
  } catch (error) {
    console.error('Error fetching user stats:', error);
    return { wins: 0, losses: 0, profit: 0, winRate: 0, totalStaked: 0, recentPredictions: [] };
  }
};

export const getReferralEarnings = async (_walletAddress) => {
  return 0; // Simplified for MVP
};

export const claimReferralBonus = async (_walletAddress) => {
  return { success: true, amount: 0 };
};
