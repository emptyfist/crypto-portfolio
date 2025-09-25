export type Transaction = {
  id: string;
  symbol: string;
  type: "buy" | "sell";
  amount: number;
  price: number;
  dateTime: string;
  network: string;
  transactionId: string;
  fileName: string;
  updatedAt: string;
};
