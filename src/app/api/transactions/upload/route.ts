import { revalidatePath } from "next/cache";
import { NextRequest, NextResponse } from "next/server";
import { transactions } from "@/lib/repositories/supabase";

export async function POST(request: NextRequest) {
  try {
    // Parse request body
    const body = await request.json();
    const { transactions: transactionData, fileName, uploadDate } = body;

    if (!transactionData || !Array.isArray(transactionData)) {
      return NextResponse.json(
        { error: "Invalid transactions data" },
        { status: 400 },
      );
    }

    // Upload transactions using centralized function
    const result = await transactions.uploadTransactions(
      transactionData,
      fileName,
      uploadDate,
    );

    // Revalidate the holdings page to reflect updated portfolio data
    revalidatePath("/dashboard");
    return NextResponse.json(result);
  } catch (error) {
    console.error("Upload error:", error);

    // Handle specific error types
    if (error instanceof Error) {
      if (error.message === "Unauthorized") {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
      if (error.message.includes("Validation failed")) {
        return NextResponse.json({ error: error.message }, { status: 400 });
      }
      if (error.message.includes("Failed to save transactions")) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }
    }

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
