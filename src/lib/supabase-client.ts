import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// Client-side Supabase client with cookie storage
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    storage:
      typeof window !== "undefined"
        ? {
            getItem: (key: string) => {
              const cookies = document.cookie.split(";");
              const cookie = cookies.find((c) =>
                c.trim().startsWith(`${key}=`),
              );
              return cookie ? cookie.split("=")[1] : null;
            },
            setItem: (key: string, value: string) => {
              document.cookie = `${key}=${value}; path=/; max-age=31536000; SameSite=Lax`;
            },
            removeItem: (key: string) => {
              document.cookie = `${key}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
            },
          }
        : undefined,
  },
});

// Authentication functions for client-side use
export const auth = {
  // Sign up a new user
  async signUp(
    email: string,
    password: string,
    userData?: { firstName?: string; lastName?: string },
  ) {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: userData,
        },
      });

      if (error) {
        throw error;
      }

      return { data, error: null };
    } catch (error) {
      return {
        data: null,
        error:
          (typeof error === "object" && error !== null && "message" in error
            ? (error as { message?: string }).message
            : undefined) ||
          "An error occurred during signup. Please try again.",
      };
    }
  },

  // Sign in an existing user
  async signIn(email: string, password: string) {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        throw error;
      }

      return { data, error: null };
    } catch (error) {
      return {
        data: null,
        error:
          (typeof error === "object" && error !== null && "message" in error
            ? (error as { message?: string }).message
            : undefined) || "An error occurred during login. Please try again.",
      };
    }
  },

  // Sign out the current user
  async signOut() {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        throw error;
      }
      return { error: null };
    } catch (error) {
      return { error };
    }
  },

  // Get the current user
  async getCurrentUser() {
    try {
      const {
        data: { user },
        error,
      } = await supabase.auth.getUser();
      if (error) {
        throw error;
      }
      return { user, error: null };
    } catch (error) {
      return { user: null, error };
    }
  },

  // Listen to auth state changes
  onAuthStateChange(callback: (event: string, session: unknown) => void) {
    return supabase.auth.onAuthStateChange(callback);
  },
};
