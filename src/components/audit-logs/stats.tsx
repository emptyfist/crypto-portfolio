import { Activity, Edit, Trash2, Upload } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

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

interface AuditLogsStatsProps {
  stats: AuditLogStats;
}

export default function AuditLogsStats({ stats }: AuditLogsStatsProps) {
  const actionColors = {
    import: "text-blue-500",
    create: "text-green-500",
    update: "text-yellow-500",
    delete: "text-red-500",
  };

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {/* Total Logs */}
      <Card className="bg-foreground/20">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Total Activities
          </CardTitle>
          <Activity className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.totalLogs}</div>
        </CardContent>
      </Card>

      {/* Recent Activity (24h) */}
      <Card className="bg-foreground/20">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Recent Activity</CardTitle>
          <Activity className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.recentActivity}</div>
          <p className="text-xs text-muted-foreground">Last 24 hours</p>
        </CardContent>
      </Card>

      {/* Import Activities */}
      <Card className="bg-foreground/20">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">CSV Imports</CardTitle>
          <Upload className={`h-4 w-4 ${actionColors.import}`} />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {stats.actionCounts.import || 0}
          </div>
        </CardContent>
      </Card>

      {/* Edit Activities */}
      <Card className="bg-foreground/20">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Edits</CardTitle>
          <Edit className={`h-4 w-4 ${actionColors.update}`} />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {stats.actionCounts.update || 0}
          </div>
        </CardContent>
      </Card>

      {/* Delete Activities */}
      <Card className="bg-foreground/20">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Deletions</CardTitle>
          <Trash2 className={`h-4 w-4 ${actionColors.delete}`} />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {stats.actionCounts.delete || 0}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
