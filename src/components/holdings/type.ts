export type Holding = {
  symbol: string;
  totalAmount: number;
  averagePrice: number;
  totalValueUSD: number;
  totalCostUSD: number;
  profitLossUSD: number;
  profitLossPercentage: number;
};

export type HoldingsSummary = {
  totalPortfolioValueUSD: number;
  totalCostUSD: number;
  totalProfitLossUSD: number;
  totalProfitLossPercentage: number;
  holdings: Holding[];
};
