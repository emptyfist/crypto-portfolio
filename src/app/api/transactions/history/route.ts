import { NextRequest, NextResponse } from "next/server";
import { transactions } from "@/lib/repositories/supabase";

export async function GET(request: NextRequest) {
  try {
    // Get query parameters
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "50");
    const symbol = searchParams.get("symbol");
    const type = searchParams.get("type") as "buy" | "sell" | null;
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");

    // Get transaction history using centralized function
    const result = await transactions.getTransactionHistory({
      page,
      limit,
      symbol: symbol || undefined,
      type: type || undefined,
      startDate: startDate || undefined,
      endDate: endDate || undefined,
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error("History API error:", error);

    // Handle specific error types
    if (error instanceof Error) {
      if (error.message === "Unauthorized") {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
      if (error.message.includes("Failed to fetch transactions")) {
        return NextResponse.json(
          { error: "Failed to fetch transactions", details: error.message },
          { status: 500 },
        );
      }
    }

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
