"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { auth } from "@/lib/repositories/supabase";

const loginSchema = z.object({
  email: z.email(),
  password: z.string().min(6, "Password must be at least 6 characters"),
  rememberToken: z.boolean(),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function Login() {
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
      rememberToken: false,
    },
  });

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true);

    const { data: authData, error: authError } = await auth.signIn(
      data.email,
      data.password,
    );

    if (authError) {
      // throw authError;
      toast.error(
        (typeof authError === "object" &&
        authError !== null &&
        "message" in authError
          ? (authError as { message?: string }).message
          : undefined) || "An error occurred during login. Please try again.",
      );
    }

    if (authData?.user) {
      // Refresh the page to ensure middleware picks up the new session
      window.location.href = "/dashboard";
      toast.success("Login successful!");
    }

    setIsLoading(false);
  };

  const handleCancel = () => {
    // TODO: Implement cancel logic (e.g., redirect to home)
    window.history.back();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-blue-800 text-foreground flex flex-col">
      {/* Header */}
      <header className="flex justify-between items-center px-8 py-6">
        <h1 className="text-xl font-bold">Crypto Portfolio</h1>
        <Link
          href="/signup"
          className="px-4 py-2 rounded-lg bg-foreground/10 hover:bg-foreground/20 transition"
        >
          Sign up
        </Link>
      </header>

      {/* Login Form */}
      <main className="flex flex-1 items-center justify-center px-6">
        <Card className="w-full max-w-md bg-foreground/10 backdrop-blur-sm border-white/20">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold text-foreground">
              Welcome Back
            </CardTitle>
            <CardDescription className="text-foreground/80">
              Sign in to your account to continue
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-6"
              >
                {/* Email Input */}
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium text-foreground">
                        Email
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="email"
                          placeholder="Enter your email"
                          className="bg-foreground/10 border-white/20 text-foreground placeholder:text-foreground/60 focus:border-white/40"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage className="text-red-400" />
                    </FormItem>
                  )}
                />

                {/* Password Input */}
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium text-foreground">
                        Password
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="password"
                          placeholder="Enter your password"
                          className="bg-foreground/10 border-white/20 text-foreground placeholder:text-foreground/60 focus:border-white/40"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage className="text-red-400" />
                    </FormItem>
                  )}
                />

                {/* Remember Token Checkbox */}
                <FormField
                  control={form.control}
                  name="rememberToken"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center space-x-1 space-y-0">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                          className="border-white/20 data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
                        />
                      </FormControl>
                      <FormLabel className="text-sm font-medium text-foreground cursor-pointer">
                        Remember me
                      </FormLabel>
                    </FormItem>
                  )}
                />

                {/* Buttons */}
                <div className="space-y-3">
                  <Button
                    type="submit"
                    className="w-full bg-blue-600 hover:bg-blue-500 text-foreground"
                    disabled={isLoading}
                  >
                    {isLoading ? "Signing in..." : "Login"}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleCancel}
                    className="w-full border-white/20 bg-foreground/10 text-foreground hover:bg-foreground/20"
                  >
                    Cancel
                  </Button>
                </div>

                {/* Sign Up Link */}
                <div className="text-center">
                  <p className="text-sm text-foreground/80">
                    {"Don't have an account? "}
                    <Link
                      href="/signup"
                      className="text-blue-400 hover:text-blue-300 underline"
                    >
                      Sign up
                    </Link>
                  </p>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </main>

      {/* Footer */}
      <footer className="text-center py-6 text-sm text-foreground/60">
        © {new Date().getFullYear()} Crypto Portfolio · All rights reserved
      </footer>
    </div>
  );
}
