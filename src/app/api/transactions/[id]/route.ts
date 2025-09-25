import { NextRequest, NextResponse } from "next/server";
import { transactions } from "@/lib/repositories/supabase";

// Update a transaction
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const updates = await request.json();

    const result = await transactions.updateTransaction(id, updates);

    return NextResponse.json(result);
  } catch (error) {
    console.error("Update transaction API error:", error);

    // Handle specific error types
    if (error instanceof Error) {
      if (error.message === "Unauthorized") {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
      if (error.message.includes("Failed to update transaction")) {
        return NextResponse.json(
          { error: "Failed to update transaction", details: error.message },
          { status: 400 },
        );
      }
    }

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

// Delete a transaction
export async function DELETE(
  _: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;

    const result = await transactions.deleteTransaction(id);

    return NextResponse.json(result);
  } catch (error) {
    console.error("Delete transaction API error:", error);

    // Handle specific error types
    if (error instanceof Error) {
      if (error.message === "Unauthorized") {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
      if (error.message.includes("Failed to delete transaction")) {
        return NextResponse.json(
          { error: "Failed to delete transaction", details: error.message },
          { status: 400 },
        );
      }
    }

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
