"use client";

import { format } from "date-fns";
import {
  Download,
  Edit,
  Trash2,
  Upload,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  AlertCircle,
  Calendar,
} from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useAuditLogs } from "@/lib/swr/use-audit-logs";

const actionIcons = {
  import: Upload,
  create: Download,
  update: Edit,
  delete: Trash2,
};

const actionColors = {
  import: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  create: "bg-green-500/20 text-green-400 border-green-500/30",
  update: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
  delete: "bg-red-500/20 text-red-400 border-red-500/30",
};

export default function AuditLogsListClient() {
  const searchParams = useSearchParams();
  const [currentPage, setCurrentPage] = useState(1);

  // Build search parameters from URL
  const searchParams_obj = {
    page: currentPage,
    limit: parseInt(searchParams.get("limit") || "20"),
    action: searchParams.get("action") || undefined,
  };

  const { data, error, isLoading, mutate } = useAuditLogs(searchParams_obj);

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
  };

  const getActionIcon = (action: string) => {
    const IconComponent =
      actionIcons[action as keyof typeof actionIcons] || Upload;
    return <IconComponent className="h-4 w-4" />;
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const renderValueChange = (oldValues: any, newValues: any) => {
    if (!oldValues && !newValues) {
      return null;
    }

    return (
      <div className="mt-2 p-2 bg-muted/50 rounded text-xs">
        {oldValues && (
          <div className="mb-1">
            <span className="text-red-400">Old:</span>{" "}
            {JSON.stringify(oldValues)}
          </div>
        )}
        {newValues && (
          <div>
            <span className="text-green-400">New:</span>{" "}
            {JSON.stringify(newValues)}
          </div>
        )}
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3, 4, 5].map((i) => (
          <div
            key={i}
            className="flex items-center space-x-4 p-4 border rounded-lg animate-pulse"
          >
            <div className="h-8 w-8 bg-foreground/30 rounded-full" />
            <div className="flex-1 space-y-2">
              <div className="h-4 w-3/4 bg-foreground/30 rounded" />
              <div className="h-3 w-1/2 bg-foreground/30 rounded" />
            </div>
            <div className="h-4 w-20 bg-foreground/30 rounded" />
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-center">
        <AlertCircle className="h-12 w-12 text-red-400 mb-4" />
        <h3 className="text-lg font-semibold mb-2">
          Failed to load audit logs
        </h3>
        <p className="text-muted-foreground mb-4">
          {error instanceof Error
            ? error.message
            : "Failed to fetch audit logs"}
        </p>
        <Button onClick={() => mutate()} variant="outline">
          <RefreshCw className="h-4 w-4 mr-2" />
          Try Again
        </Button>
      </div>
    );
  }

  if (!data?.data || data.data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-center">
        <Calendar className="h-12 w-12 text-muted-foreground mb-4" />
        <h3 className="text-lg font-semibold mb-2">No audit logs found</h3>
        <p className="text-muted-foreground">
          Your activity history will appear here once you start using the
          application.
        </p>
      </div>
    );
  }

  const logs = data.data;
  const pagination = data.pagination;

  return (
    <div className="space-y-4">
      {/* Logs List */}
      {logs.map((log) => (
        <div
          key={log.id}
          className="flex items-start space-x-4 p-4 border rounded-lg hover:bg-muted/20 transition-colors"
        >
          {/* Action Icon */}
          <div className="flex-shrink-0">
            <div className="h-8 w-8 rounded-full bg-muted/50 flex items-center justify-center">
              {getActionIcon(log.action)}
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <Badge
                className={
                  actionColors[log.action as keyof typeof actionColors]
                }
              >
                {log.action.toUpperCase()}
              </Badge>
              {log.entity_type && (
                <Badge variant="outline" className="text-xs">
                  {log.entity_type}
                </Badge>
              )}
            </div>

            <p className="text-sm font-medium mb-1">{log.description}</p>

            <p className="text-xs text-muted-foreground mb-2">
              {format(new Date(log.created_at), "MM/dd/yyyy HH:mm:ss")}
            </p>

            {/* Value Changes */}
            {renderValueChange(log.old_values, log.new_values)}

            {/* Metadata */}
            {log.metadata && (
              <div className="mt-2 p-2 bg-muted/30 rounded text-xs">
                <span className="text-muted-foreground">Metadata:</span>{" "}
                {JSON.stringify(log.metadata)}
              </div>
            )}
          </div>
        </div>
      ))}

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-between pt-4 border-t">
          <div className="text-sm text-muted-foreground">
            Showing {(pagination.page - 1) * pagination.limit + 1} to{" "}
            {Math.min(
              pagination.page * pagination.limit,
              pagination.totalCount,
            )}{" "}
            of {pagination.totalCount} entries
          </div>

          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(pagination.page - 1)}
              disabled={pagination.page <= 1}
            >
              <ChevronLeft className="h-4 w-4" />
              Previous
            </Button>

            <div className="flex items-center space-x-1">
              {Array.from(
                { length: Math.min(5, pagination.totalPages) },
                (_, i) => {
                  const pageNum = i + 1;
                  return (
                    <Button
                      key={pageNum}
                      variant={
                        pagination.page === pageNum ? "default" : "outline"
                      }
                      size="sm"
                      onClick={() => handlePageChange(pageNum)}
                      className="w-8 h-8 p-0"
                    >
                      {pageNum}
                    </Button>
                  );
                },
              )}
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(pagination.page + 1)}
              disabled={!pagination.hasMore}
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
