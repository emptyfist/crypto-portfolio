export type LeaderboardUser = {
  id: string;
  email: string;
  full_name: string | null;
  created_at: string;
  totalPortfolioValueUSD: number;
  totalCostUSD: number;
  totalProfitLossUSD: number;
  totalProfitLossPercentage: number;
  holdingsCount: number;
};
