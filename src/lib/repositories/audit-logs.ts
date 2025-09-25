import { createServerSupabaseClient } from "./supabase";

export interface AuditLogEntry {
  id: string;
  action: "import" | "create" | "update" | "delete";
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
  total_count?: number;
}

export interface AuditLogFilters {
  action?: "import" | "create" | "update" | "delete";
  limit?: number;
  offset?: number;
}

export interface AuditLogResponse {
  logs: AuditLogEntry[];
  totalCount: number;
  hasMore: boolean;
}

export const auditLogs = {
  // Note: Audit logging is now handled automatically by database triggers
  // This repository only provides read access to audit logs

  // Get user's audit logs with pagination
  async getUserAuditLogs(
    userId: string,
    filters: AuditLogFilters = {},
  ): Promise<AuditLogResponse> {
    try {
      const supabase = await createServerSupabaseClient();

      // Fetch audit_logs table directly with filters and pagination
      let query = supabase
        .from("audit_logs")
        .select("*", { count: "exact" })
        .eq("user_id", userId)
        .order("created_at", { ascending: false });

      if (filters.action) {
        query = query.eq("action", filters.action);
      }
      if (typeof filters.offset === "number") {
        query = query.range(
          filters.offset,
          (filters.offset || 0) + (filters.limit || 20) - 1,
        );
      } else if (typeof filters.limit === "number") {
        query = query.range(0, (filters.limit || 20) - 1);
      }

      const { data, error } = await query;

      if (error) {
        console.error("Error fetching audit logs:", error);
        throw new Error(`Failed to fetch audit logs: ${error.message}`);
      }

      if (!data || data.length === 0) {
        return {
          logs: [],
          totalCount: 0,
          hasMore: false,
        };
      }

      const totalCount = data[0]?.total_count || 0;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const logs: AuditLogEntry[] = data.map((log: any) => ({
        id: log.id,
        action: log.action,
        entity_id: log.entity_id,
        description: log.description,
        old_values: log.old_values,
        new_values: log.new_values,
        metadata: log.metadata,
        ip_address: log.ip_address,
        user_agent: log.user_agent,
        created_at: log.created_at,
      }));

      const hasMore =
        (filters.offset || 0) + (filters.limit || 20) < totalCount;

      return {
        logs,
        totalCount,
        hasMore,
      };
    } catch (error) {
      console.error("Error in getUserAuditLogs:", error);
      throw error;
    }
  },

  // Get audit log statistics
  async getAuditLogStats(userId: string): Promise<{
    totalLogs: number;
    actionCounts: Record<string, number>;
    recentActivity: number;
  }> {
    try {
      const supabase = await createServerSupabaseClient();

      // Get total logs count
      const { count: totalLogs, error: totalError } = await supabase
        .from("audit_logs")
        .select("*", { count: "exact", head: true })
        .eq("user_id", userId);

      if (totalError) {
        console.error("Error fetching total logs:", totalError);
      }

      // Get action counts
      const { data: actionData, error: actionError } = await supabase
        .from("audit_logs")
        .select("action")
        .eq("user_id", userId);

      if (actionError) {
        console.error("Error fetching action counts:", actionError);
      }

      const actionCounts: Record<string, number> = {};
      if (actionData) {
        actionData.forEach((log) => {
          actionCounts[log.action] = (actionCounts[log.action] || 0) + 1;
        });
      }

      // Get recent activity (last 24 hours)
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);

      const { count: recentActivity, error: recentError } = await supabase
        .from("audit_logs")
        .select("*", { count: "exact", head: true })
        .eq("user_id", userId)
        .gte("created_at", yesterday.toISOString());

      if (recentError) {
        console.error("Error fetching recent activity:", recentError);
      }

      return {
        totalLogs: totalLogs || 0,
        actionCounts,
        recentActivity: recentActivity || 0,
      };
    } catch (error) {
      console.error("Error in getAuditLogStats:", error);
      throw error;
    }
  },
};
