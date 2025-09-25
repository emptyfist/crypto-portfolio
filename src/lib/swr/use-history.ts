import useSWR from "swr";
import type { Transaction } from "@/components/history/type";

interface HistorySearchParams {
  page?: number;
  limit?: number;
  symbol?: string;
  type?: "buy" | "sell";
  startDate?: string;
  endDate?: string;
}

interface HistoryResponse {
  transactions: Transaction[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export function useHistory(params: HistorySearchParams = {}) {
  return useSWR(
    ["api-history", params],
    async ([, params]: [string, HistorySearchParams]) => {
      const searchParams = new URLSearchParams();

      if (params.page) {
        searchParams.set("page", params.page.toString());
      }
      if (params.limit) {
        searchParams.set("limit", params.limit.toString());
      }
      if (params.symbol) {
        searchParams.set("symbol", params.symbol);
      }
      if (params.type) {
        searchParams.set("type", params.type);
      }
      if (params.startDate) {
        searchParams.set("startDate", params.startDate);
      }
      if (params.endDate) {
        searchParams.set("endDate", params.endDate);
      }

      const res = await fetch(
        `/api/transactions/history?${searchParams.toString()}`,
      );

      if (!res.ok) {
        throw new Error("Failed to fetch transactions");
      }

      return (await res.json()) as HistoryResponse;
    },
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      revalidateIfStale: false,
    },
  );
}
