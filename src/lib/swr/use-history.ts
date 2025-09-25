import useSWR, { mutate } from "swr";
import useSWRMutation from "swr/mutation";
import type { Transaction } from "@/components/history/type";

interface HistorySearchParams {
  page?: number;
  limit?: number;
  symbol?: string;
  type?: "buy" | "sell";
  startDate?: string;
  endDate?: string;
  fileName?: string;
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
      if (params.fileName) {
        searchParams.set("fileName", params.fileName);
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

// Function to revalidate all history queries
export function revalidateHistory() {
  return mutate((key) => {
    if (Array.isArray(key) && key[0] === "api-history") {
      return true;
    }
    return false;
  });
}

// Hook for updating a transaction
export function useUpdateTransaction() {
  const {
    trigger: updateTransaction,
    isMutating,
    error,
  } = useSWRMutation(
    "update-transaction",
    async (
      _,
      { arg }: { arg: { id: string; updates: Partial<Transaction> } },
    ) => {
      const { id, updates } = arg;

      const response = await fetch(`/api/transactions/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updates),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to update transaction");
      }

      const result = await response.json();

      // Revalidate history queries after successful update
      revalidateHistory();

      return result;
    },
  );

  return {
    updateTransaction: (id: string, updates: Partial<Transaction>) =>
      updateTransaction({ id, updates }),
    isUpdating: isMutating,
    updateError: error,
  };
}

// Hook for deleting a transaction
export function useDeleteTransaction() {
  const {
    trigger: deleteTransaction,
    isMutating,
    error,
  } = useSWRMutation(
    "delete-transaction",
    async (_, { arg }: { arg: string }) => {
      const id = arg;

      const response = await fetch(`/api/transactions/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to delete transaction");
      }

      const result = await response.json();

      // Revalidate history queries after successful deletion
      revalidateHistory();

      return result;
    },
  );

  return {
    deleteTransaction: (id: string) => deleteTransaction(id),
    isDeleting: isMutating,
    deleteError: error,
  };
}
