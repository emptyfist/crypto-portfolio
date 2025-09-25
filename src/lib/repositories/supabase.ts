import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import type { Transaction } from "@/components/history/type";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// Create a server-side Supabase client for API routes
const createServerSupabaseClient = async () => {
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
};
