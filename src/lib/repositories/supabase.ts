import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import type { Transaction } from "@/components/history/type";
import type { HoldingsSummary, Holding } from "@/components/holdings/type";

interface LeaderboardUser {
  user_id: string;
  email: string;
  full_name: string;
  created_at: string;
  total_portfolio_value_usd: string;
  total_cost_usd: string;
  total_profit_loss_usd: string;
  total_profit_loss_percentage: string;
  holdings_count: string;
}

interface UpdateTransactionData {
  updated_at: string;
  symbol?: string;
  type?: string;
  amount?: number;
  price?: number;
  date_time?: string;
  network?: string;
  transaction_id?: string;
  file_name?: string;
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// Create a server-side Supabase client for API routes
export const createServerSupabaseClient = async () => {
  const cookieStore = await cookies();
  return createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value, options }) => {
          cookieStore.set(name, value, options);
        });
      },
    },
  });
};

// Create a middleware-specific Supabase client
const createMiddlewareClient = (req: NextRequest, res: NextResponse) => {
  return createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return req.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value, options }) => {
          req.cookies.set(name, value);
          res.cookies.set(name, value, options);
        });
      },
    },
  });
};

// Server-side authentication functions
export const serverAuth = {
  // Check authentication for middleware
  async checkAuthentication(request: NextRequest, response: NextResponse) {
    try {
      const supabase = createMiddlewareClient(request, response);

      // Get the user from the session
      const {
        data: { user },
        error,
      } = await supabase.auth.getUser();

      if (error || !user) {
        return false;
      }

      return true;
    } catch (error) {
      console.error("Authentication check failed:", error);
      return false;
    }
  },
};

export const transactions = {
  // Upload transactions to Supabase
  async uploadTransactions(
    transactions: Transaction[],
    fileName: string,
    uploadDate: string,
  ) {
    try {
      const supabase = await createServerSupabaseClient();

      // Check authentication
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();

      if (authError || !user) {
        throw new Error("Unauthorized");
      }

      // Prepare data for Supabase insertion
      const transactionsToInsert = transactions.map((transaction) => ({
        user_id: user.id,
        symbol: transaction.symbol,
        type: transaction.type,
        amount: transaction.amount,
        price: transaction.price,
        date_time: transaction.dateTime,
        network: transaction.network,
        transaction_id: transaction.transactionId,
        file_name: fileName || transaction.fileName,
        upload_date: uploadDate || new Date().toISOString(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }));

      // Insert transactions into Supabase with conflict resolution
      const { error: insertError } = await supabase
        .from("transactions")
        .upsert(transactionsToInsert, {
          onConflict: "user_id,transaction_id",
          ignoreDuplicates: false,
        });

      if (insertError) {
        // Check if it's a duplicate key error
        if (insertError.code === "23505") {
          throw new Error(
            "Duplicate transaction ID detected. Please check your CSV file for duplicate transaction IDs.",
          );
        }
        throw new Error(`Failed to save transactions: ${insertError.message}`);
      }

      // Log CSV import activity using database function (after transactions are inserted)
      const { error: logError } = await supabase.rpc(
        "log_csv_import_activity",
        {
          p_user_id: user.id,
          p_file_name: fileName,
          p_transaction_count: transactions.length,
          p_symbols: [...new Set(transactions.map((t) => t.symbol))],
        },
      );

      if (logError) {
        console.warn("Failed to log CSV import activity:", logError);
      }

      return {
        success: true,
        message: `Successfully uploaded ${transactions.length} transactions`,
        count: transactions.length,
      };
    } catch (error) {
      throw error;
    }
  },

  // Get transaction history with filtering and pagination
  async getTransactionHistory(params: {
    page?: number;
    limit?: number;
    symbol?: string;
    type?: "buy" | "sell";
    startDate?: string;
    endDate?: string;
    fileName?: string;
  }) {
    try {
      const supabase = await createServerSupabaseClient();

      // Check authentication
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();

      if (authError || !user) {
        throw new Error("Unauthorized");
      }

      const {
        page = 1,
        limit = 50,
        symbol,
        type,
        startDate,
        endDate,
        fileName,
      } = params;

      // Build query
      let query = supabase
        .from("transactions")
        .select("*", { count: "exact" })
        .eq("user_id", user.id)
        .order("date_time", { ascending: false });

      // Apply filters
      if (symbol) {
        query = query.ilike("symbol", symbol);
      }
      if (type && (type === "buy" || type === "sell")) {
        query = query.ilike("type", type);
      }
      if (startDate) {
        query = query.gte("date_time", startDate);
      }
      if (endDate) {
        query = query.lte("date_time", endDate);
      }
      if (fileName) {
        query = query.ilike("file_name", `%${fileName}%`);
      }

      // Apply pagination
      const from = (page - 1) * limit;
      const to = from + limit - 1;
      query = query.range(from, to);

      // Execute query
      const { data, error, count } = await query;

      if (error) {
        throw new Error(`Failed to fetch transactions: ${error.message}`);
      }

      // Transform data to match frontend Transaction type
      const transactions =
        data?.map((transaction) => ({
          id: transaction.id,
          symbol: transaction.symbol,
          type: transaction.type,
          amount: parseFloat(transaction.amount),
          price: parseFloat(transaction.price),
          dateTime: transaction.date_time,
          network: transaction.network,
          transactionId: transaction.transaction_id,
          fileName: transaction.file_name,
          updatedAt: transaction.updated_at,
        })) || [];

      return {
        transactions,
        pagination: {
          page,
          limit,
          total: count || 0,
          totalPages: Math.ceil((count || 0) / limit),
        },
      };
    } catch (error) {
      throw error;
    }
  },

  // Update a transaction
  async updateTransaction(id: string, updates: Partial<Transaction>) {
    try {
      const supabase = await createServerSupabaseClient();

      // Check authentication
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();

      if (authError || !user) {
        throw new Error("Unauthorized");
      }

      // Prepare update data
      const updateData: UpdateTransactionData = {
        updated_at: new Date().toISOString(),
      };

      if (updates.symbol) {
        updateData.symbol = updates.symbol;
      }
      if (updates.type) {
        updateData.type = updates.type;
      }
      if (updates.amount !== undefined) {
        updateData.amount = updates.amount;
      }
      if (updates.price !== undefined) {
        updateData.price = updates.price;
      }
      if (updates.dateTime) {
        updateData.date_time = updates.dateTime;
      }
      if (updates.network) {
        updateData.network = updates.network;
      }
      if (updates.transactionId) {
        updateData.transaction_id = updates.transactionId;
      }
      if (updates.fileName) {
        updateData.file_name = updates.fileName;
      }

      const { data, error } = await supabase
        .from("transactions")
        .update(updateData)
        .eq("id", id)
        .eq("user_id", user.id)
        .select()
        .single();

      if (error) {
        throw new Error(`Failed to update transaction: ${error.message}`);
      }

      return {
        success: true,
        message: "Transaction updated successfully",
        data,
      };
    } catch (error) {
      throw error;
    }
  },

  // Delete a transaction
  async deleteTransaction(id: string) {
    try {
      const supabase = await createServerSupabaseClient();

      // Check authentication
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();

      if (authError || !user) {
        throw new Error("Unauthorized");
      }

      // Delete the transaction (audit logging is handled by database trigger)
      const { error } = await supabase
        .from("transactions")
        .delete()
        .eq("id", id)
        .eq("user_id", user.id);

      if (error) {
        throw new Error(`Failed to delete transaction: ${error.message}`);
      }

      return {
        success: true,
        message: "Transaction deleted successfully",
      };
    } catch (error) {
      throw error;
    }
  },
};

export const leaderboard = {
  // Get leaderboard data calculated by SQL function
  async getLeaderboard() {
    try {
      const supabase = await createServerSupabaseClient();

      // Try to get leaderboard data calculated by SQL function first
      let leaderboardData;
      try {
        const { data, error } = await supabase.rpc("get_leaderboard");

        if (error) {
          console.warn(
            "SQL function failed, falling back to JavaScript calculation:",
            error.message,
          );
        } else {
          leaderboardData = data || [];
        }
      } catch (rpcError) {
        console.warn(
          "SQL function error, falling back to JavaScript calculation:",
          rpcError,
        );
      }

      // Transform the data to match our expected format
      return leaderboardData.map((user: LeaderboardUser) => ({
        id: user.user_id,
        email: user.email,
        full_name: user.full_name,
        created_at: user.created_at,
        totalPortfolioValueUSD: parseFloat(
          user.total_portfolio_value_usd || "0",
        ),
        totalCostUSD: parseFloat(user.total_cost_usd || "0"),
        totalProfitLossUSD: parseFloat(user.total_profit_loss_usd || "0"),
        totalProfitLossPercentage: parseFloat(
          user.total_profit_loss_percentage || "0",
        ),
        holdingsCount: parseInt(user.holdings_count || "0"),
      }));
    } catch (error) {
      throw error;
    }
  },
};

export const holdings = {
  // Get current holdings calculated from transactions using SQL
  async getHoldings(): Promise<HoldingsSummary> {
    try {
      const supabase = await createServerSupabaseClient();

      // Check authentication
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();

      if (authError || !user) {
        throw new Error("Unauthorized");
      }

      // Try to get holdings calculated by SQL query first
      let holdingsData;
      try {
        const { data, error } = await supabase.rpc("get_user_holdings", {
          user_id_param: user.id,
        });

        if (error) {
          console.warn(
            "SQL function failed, falling back to JavaScript calculation:",
            error.message,
          );
        } else {
          holdingsData = data;
        }
      } catch (rpcError) {
        console.warn(
          "RPC call failed, falling back to JavaScript calculation:",
          rpcError,
        );
      }

      if (!holdingsData || holdingsData.length === 0) {
        return {
          totalPortfolioValueUSD: 0,
          totalCostUSD: 0,
          totalProfitLossUSD: 0,
          totalProfitLossPercentage: 0,
          holdings: [],
        };
      }

      // Calculate total portfolio metrics
      let totalPortfolioValueUSD = 0;
      let totalCostUSD = 0;

      const holdings: Holding[] = holdingsData.map(
        (holding: {
          symbol: string;
          total_amount: number;
          total_cost_usd: number;
          average_price: number;
          current_price_usd: number;
          total_value_usd: number;
          profit_loss_usd: number;
          profit_loss_percentage: number;
        }) => {
          // Use real prices from database, fallback to mock price if not available
          const currentPrice =
            holding.current_price_usd > 0 ? holding.current_price_usd : 0;
          const totalValueUSD =
            holding.total_value_usd > 0
              ? holding.total_value_usd
              : holding.total_amount * currentPrice;
          const profitLossUSD =
            holding.profit_loss_usd !== undefined
              ? holding.profit_loss_usd
              : totalValueUSD - holding.total_cost_usd;
          const profitLossPercentage =
            holding.profit_loss_percentage !== undefined
              ? holding.profit_loss_percentage
              : holding.total_cost_usd > 0
                ? (profitLossUSD / holding.total_cost_usd) * 100
                : 0;

          totalPortfolioValueUSD += totalValueUSD;
          totalCostUSD += holding.total_cost_usd;

          return {
            symbol: holding.symbol,
            totalAmount: holding.total_amount,
            averagePrice: holding.average_price,
            totalValueUSD,
            totalCostUSD: holding.total_cost_usd,
            profitLossUSD,
            profitLossPercentage,
          };
        },
      );

      const totalProfitLossUSD = totalPortfolioValueUSD - totalCostUSD;
      const totalProfitLossPercentage =
        totalCostUSD > 0 ? (totalProfitLossUSD / totalCostUSD) * 100 : 0;

      return {
        totalPortfolioValueUSD,
        totalCostUSD,
        totalProfitLossUSD,
        totalProfitLossPercentage,
        holdings: holdings.sort((a, b) => b.totalValueUSD - a.totalValueUSD),
      };
    } catch (error) {
      throw error;
    }
  },
};
