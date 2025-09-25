import { Activity, Filter } from "lucide-react";
import AuditLogsFilter from "@/components/audit-logs/filter";
import AuditLogsList from "@/components/audit-logs/list";
import AuditLogsStats from "@/components/audit-logs/stats";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { auditLogs } from "@/lib/repositories/audit-logs";
import { createServerSupabaseClient } from "@/lib/repositories/supabase";

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

async function getAuditLogsStats(): Promise<AuditLogStats | null> {
  try {
    const supabase = await createServerSupabaseClient();

    // Get the current user
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      throw new Error("Unauthorized");
    }

    // Get audit log statistics
    const stats = await auditLogs.getAuditLogStats(user.id);

    return {
      totalLogs: stats.totalLogs,
      recentActivity: stats.recentActivity,
      actionCounts: {
        import: stats.actionCounts.import || 0,
        create: stats.actionCounts.create || 0,
        update: stats.actionCounts.update || 0,
        delete: stats.actionCounts.delete || 0,
      },
    };
  } catch (error) {
    console.error("Error fetching audit logs stats:", error);
    return null;
  }
}

export default async function AuditLogsPage() {
  const stats = await getAuditLogsStats();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold flex items-center gap-3">
          <Activity className="h-8 w-8 text-blue-500" />
          Audit Logs
        </h1>
      </div>

      {stats ? (
        <AuditLogsStats stats={stats} />
      ) : (
        <Card className="bg-red-500/10 border-red-500/20">
          <CardContent className="pt-6">
            <p className="text-red-400">Failed to load audit logs stats</p>
          </CardContent>
        </Card>
      )}
      <Card className="bg-foreground/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <AuditLogsFilter />
        </CardContent>
      </Card>
      <AuditLogsList />
    </div>
  );
}
