import { Calendar } from "lucide-react";
import { Suspense } from "react";
import AuditLogsListClient from "@/components/audit-logs/audit-logs-list-client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default async function AuditLogsList() {
  return (
    <Card className="bg-foreground/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          Activity History
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Suspense fallback={<AuditLogsListSkeleton />}>
          <AuditLogsListClient />
        </Suspense>
      </CardContent>
    </Card>
  );
}

function AuditLogsListSkeleton() {
  return (
    <div className="space-y-4">
      {[1, 2, 3, 4, 5].map((i) => (
        <div
          key={i}
          className="flex items-center space-x-4 p-4 border rounded-lg"
        >
          <div className="h-8 w-8 bg-foreground/30 animate-pulse rounded-full" />
          <div className="flex-1 space-y-2">
            <div className="h-4 w-3/4 bg-foreground/30 animate-pulse rounded" />
            <div className="h-3 w-1/2 bg-foreground/30 animate-pulse rounded" />
          </div>
          <div className="h-4 w-20 bg-foreground/30 animate-pulse rounded" />
        </div>
      ))}
    </div>
  );
}
