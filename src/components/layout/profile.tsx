"use client";

import { User as SupabaseUser } from "@supabase/supabase-js";
import { User, LogOut, ChevronDown } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { auth } from "@/lib/repositories/supabase";

export default function Profile() {
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const router = useRouter();

  useEffect(() => {
    // Get current user - middleware already ensures user is authenticated
    const getCurrentUser = async () => {
      const { user } = await auth.getCurrentUser();
      setUser(user);
    };

    getCurrentUser();

    // Listen for auth state changes (only for logout events)
    const {
      data: { subscription },
    } = auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_OUT") {
        // User logged out, redirect to login
        router.push("/login");
      } else if (
        event === "SIGNED_IN" &&
        session &&
        typeof session === "object" &&
        "user" in session
      ) {
        // User signed in, update user state
        setUser((session as { user: SupabaseUser }).user);
      }
    });

    return () => subscription.unsubscribe();
  }, [router]);

  const handleLogout = useCallback(() => {
    auth.signOut();
  }, []);

  const handleProfile = useCallback(() => {
    // TODO: Navigate to profile page
    console.log("Profile clicked");
  }, []);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="w-full justify-start space-x-3 px-3 py-2 h-auto text-foreground hover:bg-white/10"
        >
          <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-foreground text-sm font-medium">
            {user?.user_metadata?.firstName?.charAt(0) ||
              user?.email?.charAt(0) ||
              "U"}
          </div>
          <div className="flex-1 text-left">
            <div className="text-sm font-medium text-foreground">
              {user?.user_metadata?.firstName && user?.user_metadata?.lastName
                ? `${user.user_metadata.firstName} ${user.user_metadata.lastName}`
                : user?.user_metadata?.firstName || "User"}
            </div>
            <div className="text-xs text-foreground/70">
              {user?.email || "Loading..."}
            </div>
          </div>
          <ChevronDown className="w-4 h-4 text-foreground/70" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuItem onClick={handleProfile}>
          <User className="w-4 h-4 mr-2" />
          Profile
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleLogout} variant="destructive">
          <LogOut className="w-4 h-4 mr-2" />
          Logout
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
