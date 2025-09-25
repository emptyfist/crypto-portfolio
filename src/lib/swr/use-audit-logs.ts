import useSWR, { mutate } from "swr";

interface AuditLogEntry {
  id: string;
  action: "import" | "create" | "update" | "delete";
  entity_type: string;
  entity_id?: string;
  description: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  old_values?: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  new_values?: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  metadata?: any;
  ip_address?: string;
  user_agent?: string;
  created_at: string;
}

interface AuditLogsSearchParams {
  page?: number;
  limit?: number;
  action?: string;
  entity_type?: string;
}

interface AuditLogsResponse {
  success: boolean;
  data: AuditLogEntry[];
  pagination: {
    page: number;
    limit: number;
    totalCount: number;
    totalPages: number;
    hasMore: boolean;
  };
  error?: string;
}

export function useAuditLogs(params: AuditLogsSearchParams = {}) {
  return useSWR(
    ["api-audit-logs", params],
    async ([, params]: [string, AuditLogsSearchParams]) => {
      const searchParams = new URLSearchParams();

      if (params.page) {
        searchParams.set("page", params.page.toString());
      }
      if (params.limit) {
        searchParams.set("limit", params.limit.toString());
      }
      if (params.action && params.action !== undefined) {
        searchParams.set("action", params.action);
      }

      const res = await fetch(`/api/audit-logs?${searchParams.toString()}`);

      if (!res.ok) {
        throw new Error("Failed to fetch audit logs");
      }

      return (await res.json()) as AuditLogsResponse;
    },
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      revalidateIfStale: false,
    },
  );
}

// Function to revalidate all audit logs queries
export function revalidateAuditLogs() {
  return mutate((key) => {
    if (Array.isArray(key) && key[0] === "api-audit-logs") {
      return true;
    }
    return false;
  });
}

interface AuditLogStats {
  totalLogs: number;
  recentActivity: number;
  actionCounts: {
    import: number;
    create: number;
    update: number;
    delete: number;
  };
}

interface AuditLogStatsResponse {
  success: boolean;
  data: AuditLogStats;
  error?: string;
}

export function useAuditLogsStats() {
  return useSWR(
    "api-audit-logs-stats",
    async () => {
      const res = await fetch("/api/audit-logs/stats");

      if (!res.ok) {
        throw new Error("Failed to fetch audit logs stats");
      }

      return (await res.json()) as AuditLogStatsResponse;
    },
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      revalidateIfStale: false,
    },
  );
}
