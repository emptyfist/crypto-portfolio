import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/repositories/supabase";

export async function GET(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient();
    const { searchParams } = new URL(request.url);
    const symbol = searchParams.get("symbol");

    if (symbol) {
      // Get price for specific symbol
      const { data, error } = await supabase.rpc("get_token_price", {
        p_symbol: symbol.toUpperCase(),
      });

      if (error) {
        return NextResponse.json(
          { error: "Failed to fetch price", details: error.message },
          { status: 500 },
        );
      }

      return NextResponse.json({
        symbol: symbol.toUpperCase(),
        price: data,
        timestamp: new Date().toISOString(),
      });
    } else {
      // Get all prices
      const { data, error } = await supabase
        .from("token_prices")
        .select("*")
        .order("market_cap_usd", { ascending: false });

      if (error) {
        return NextResponse.json(
          { error: "Failed to fetch prices", details: error.message },
          { status: 500 },
        );
      }

      return NextResponse.json({
        prices: data,
        count: data?.length || 0,
        timestamp: new Date().toISOString(),
      });
    }
  } catch (error) {
    console.error("Price fetch error:", error);

    return NextResponse.json(
      {
        error: "Internal server error",
        details: error instanceof Error ? error.message : "Unknown error",
        timestamp: new Date().toISOString(),
      },
      { status: 500 },
    );
  }
}
