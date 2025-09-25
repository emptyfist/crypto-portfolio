import useSWRMutation from "swr/mutation";
import type { Transaction } from "@/components/history/type";

interface UploadResponse {
  success: boolean;
  message: string;
  count: number;
  error?: string;
}

interface UploadParams {
  transactions: Transaction[];
  fileName: string;
  uploadDate: string;
}

interface UseUploadOptions {
  onSuccess?: (data: UploadResponse) => void;
  onError?: (error: string) => void;
}

// Upload mutation function
async function uploadTransactions(
  url: string,
  { arg }: { arg: UploadParams },
): Promise<UploadResponse> {
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(arg),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || "Upload failed");
  }

  return data;
}

export function useUpload(options?: UseUploadOptions) {
  const { trigger, isMutating, error } = useSWRMutation(
    "/api/transactions/upload",
    uploadTransactions,
    {
      onSuccess: (data) => {
        options?.onSuccess?.(data);
      },
      onError: (error) => {
        const errorMessage =
          error instanceof Error ? error.message : "Upload failed";
        options?.onError?.(errorMessage);
      },
    },
  );

  const uploadTransactionsHandler = async (
    params: UploadParams,
  ): Promise<UploadResponse> => {
    try {
      const result = await trigger(params);
      return result;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Upload failed";
      return {
        success: false,
        message: errorMessage,
        count: 0,
        error: errorMessage,
      };
    }
  };

  return {
    uploadTransactions: uploadTransactionsHandler,
    isUploading: isMutating,
    error,
  };
}
