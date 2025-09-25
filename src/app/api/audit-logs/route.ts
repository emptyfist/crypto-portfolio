import { NextRequest, NextResponse } from "next/server";
import { auditLogs } from "@/lib/repositories/audit-logs";
import { createServerSupabaseClient } from "@/lib/repositories/supabase";

export async function GET(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient();

    // Get the current user
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Parse query parameters
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const action = searchParams.get("action") as
      | "import"
      | "create"
      | "update"
      | "delete";

    const offset = (page - 1) * limit;

    // Get audit logs
    const result = await auditLogs.getUserAuditLogs(user.id, {
      limit,
      offset,
      action: action || undefined,
    });

    return NextResponse.json({
      success: true,
      data: result.logs,
      pagination: {
        page,
        limit,
        totalCount: result.totalCount,
        totalPages: Math.ceil(result.totalCount / limit),
        hasMore: result.hasMore,
      },
    });
  } catch (error) {
    console.error("Audit logs API error:", error);

    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error ? error.message : "Unknown error occurred",
      },
      { status: 500 },
    );
  }
}

// Note: POST method removed - audit logging is now handled automatically by database triggers
