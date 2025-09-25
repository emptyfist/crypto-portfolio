"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useUpdateTransaction } from "@/lib/swr/use-history";
import type { Transaction } from "./type";

interface EditTransactionDialogProps {
  children: React.ReactNode;
  transaction: Transaction;
}

const editTransactionSchema = z.object({
  symbol: z
    .string()
    .min(3, "Symbol is required")
    .max(10, "Symbol must be 10 characters or less"),
  type: z.enum(["buy", "sell"]),
  amount: z
    .string()
    .min(1, "Amount is required")
    .refine(
      (val) => !isNaN(parseFloat(val)) && parseFloat(val) > 0,
      "Amount must be a positive number",
    ),
  network: z.string().min(1, "Network is required"),
  transactionId: z
    .string()
    .length(66, "Transaction ID must be 66 characters")
    .refine((val) => val.startsWith("0x"), "Transaction ID must start with 0x"),
  price: z
    .string()
    .min(1, "Price is required")
    .refine(
      (val) => !isNaN(parseFloat(val)) && parseFloat(val) > 0,
      "Price must be a positive number",
    ),
  dateTime: z.string().min(1, "Date is required"),
});

type EditTransactionFormData = z.infer<typeof editTransactionSchema>;

export default function EditTransactionDialog({
  children,
  transaction,
}: EditTransactionDialogProps) {
  const [isOpen, setIsOpen] = useState(false);

  const form = useForm<EditTransactionFormData>({
    resolver: zodResolver(editTransactionSchema),
    defaultValues: {
      symbol: transaction.symbol,
      type: transaction.type,
      amount: transaction.amount.toString(),
      network: transaction.network,
      transactionId: transaction.transactionId,
      price: transaction.price.toString(),
      dateTime: new Date(transaction.dateTime).toISOString().slice(0, 16),
    },
  });

  const { updateTransaction, isUpdating } = useUpdateTransaction();

  const onSubmit = async (data: EditTransactionFormData) => {
    try {
      await updateTransaction(transaction.id, {
        symbol: data.symbol,
        type: data.type,
        amount: parseFloat(data.amount),
        price: parseFloat(data.price),
        dateTime: data.dateTime,
        network: data.network,
        transactionId: data.transactionId,
      });

      toast.success("Transaction updated successfully");
      setIsOpen(false);
    } catch (error) {
      console.error("Failed to update transaction:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to update transaction",
      );
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[600px] bg-gradient-to-tr from-blue-900 via-purple-900 to-blue-800">
        <DialogHeader>
          <DialogTitle className="text-foreground">
            Edit Transaction
          </DialogTitle>
          <DialogDescription className="text-foreground/60">
            Update the transaction details below.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="symbol"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-foreground">Symbol</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="BTC"
                        className="bg-foreground/5 border-foreground/20 text-foreground"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-foreground">Type</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger className="bg-foreground/5 border-foreground/20 text-foreground">
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="bg-gray-800 border-gray-700">
                        <SelectItem value="buy">Buy</SelectItem>
                        <SelectItem value="sell">Sell</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="amount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-foreground">Amount</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="any"
                        placeholder="0.001"
                        className="bg-foreground/5 border-foreground/20 text-foreground"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="price"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-foreground">Price</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="any"
                        placeholder="50000"
                        className="bg-foreground/5 border-foreground/20 text-foreground"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="dateTime"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-foreground">Date Time</FormLabel>
                    <FormControl>
                      <Input
                        type="datetime-local"
                        className="bg-foreground/5 border-foreground/20 text-foreground"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="network"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-foreground">Network</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Ethereum"
                        className="bg-foreground/5 border-foreground/20 text-foreground"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="transactionId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-foreground">
                    Transaction ID
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="0x..."
                      className="bg-foreground/5 border-foreground/20 text-foreground"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => form.reset()}
                className="bg-foreground/10 border-foreground/20 text-foreground hover:bg-foreground/20"
              >
                Reset
              </Button>
              <Button
                type="submit"
                disabled={isUpdating}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                {isUpdating ? "Updating..." : "Update"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
