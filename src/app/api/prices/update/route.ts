import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";

// CoinGecko API configuration
const COINGECKO_API_URL = "https://api.coingecko.com/api/v3";
const COINGECKO_API_KEY = process.env.COINGECKO_API_KEY; // Optional API key for higher rate limits

// Symbol to CoinGecko ID mapping
const SYMBOL_TO_COINGECKO_ID: Record<string, string> = {
  BTC: "bitcoin",
  ETH: "ethereum",
  BNB: "binancecoin",
  ADA: "cardano",
  SOL: "solana",
  DOT: "polkadot",
  MATIC: "matic-network",
  AVAX: "avalanche-2",
  LINK: "chainlink",
  UNI: "uniswap",
  ATOM: "cosmos",
  LTC: "litecoin",
  XRP: "ripple",
  DOGE: "dogecoin",
  SHIB: "shiba-inu",
  USDT: "tether",
  USDC: "usd-coin",
  BUSD: "binance-usd",
  DAI: "dai",
};

// Create Supabase client with service role key for admin operations
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

interface CoinGeckoPriceData {
  id: string;
  symbol: string;
  name: string;
  current_price: number;
  market_cap: number;
  total_volume: number;
  price_change_percentage_24h: number;
  last_updated: string;
}

async function fetchPricesFromCoinGecko(): Promise<CoinGeckoPriceData[]> {
  const coinIds = Object.values(SYMBOL_TO_COINGECKO_ID);
  const url = `${COINGECKO_API_URL}/coins/markets?vs_currency=usd&ids=${coinIds.join(",")}&order=market_cap_desc&per_page=100&page=1&sparkline=false&price_change_percentage=24h`;

  const headers: Record<string, string> = {
    Accept: "application/json",
  };

  // Add API key if available
  if (COINGECKO_API_KEY) {
    headers["x-cg-demo-api-key"] = COINGECKO_API_KEY;
  }

  const response = await fetch(url, {
    headers,
    next: { revalidate: 3600 }, // Cache for 1 hour
  });

  if (!response.ok) {
    throw new Error(
      `CoinGecko API error: ${response.status} ${response.statusText}`,
    );
  }

  const data = await response.json();
  return data as CoinGeckoPriceData[];
}

async function updatePricesInSupabase(
  prices: CoinGeckoPriceData[],
): Promise<void> {
  for (const price of prices) {
    // Find the symbol for this coin ID
    const symbol = Object.keys(SYMBOL_TO_COINGECKO_ID).find(
      (key) => SYMBOL_TO_COINGECKO_ID[key] === price.id,
    );

    if (!symbol) {
      console.warn(`No symbol mapping found for coin ID: ${price.id}`);
      continue;
    }

    try {
      // Use the upsert function to update or insert the price
      const { error } = await supabase.rpc("upsert_token_price", {
        p_symbol: symbol,
        p_name: price.name,
        p_price_usd: price.current_price,
        p_market_cap_usd: Math.round(price.market_cap),
        p_volume_24h_usd: Math.round(price.total_volume),
        p_price_change_24h: price.price_change_percentage_24h,
      });

      if (error) {
        console.error(`Error updating price for ${symbol}:`, error);
      } else {
        console.log(`Updated price for ${symbol}: $${price.current_price}`);
      }
    } catch (error) {
      console.error(`Error processing price for ${symbol}:`, error);
    }
  }
}

export async function GET(_: NextRequest) {
  try {
    console.log("Starting price update process...");

    // Fetch prices from CoinGecko
    const prices = await fetchPricesFromCoinGecko();
    console.log(`Fetched ${prices.length} prices from CoinGecko`);

    // Update prices in Supabase
    await updatePricesInSupabase(prices);

    // Get updated prices count from database
    const { count, error: countError } = await supabase
      .from("token_prices")
      .select("*", { count: "exact", head: true });

    if (countError) {
      console.error("Error getting price count:", countError);
    }

    return NextResponse.json({
      success: true,
      message: `Successfully updated ${prices.length} token prices`,
      updated_count: prices.length,
      total_prices: count || 0,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Price update error:", error);

    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error ? error.message : "Unknown error occurred",
        timestamp: new Date().toISOString(),
      },
      { status: 500 },
    );
  }
}

// Allow POST requests for manual triggers
export async function POST(request: NextRequest) {
  return GET(request);
}
