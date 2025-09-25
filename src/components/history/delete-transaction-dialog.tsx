"use client";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogClose,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useDeleteTransaction } from "@/lib/swr/use-history";
import type { Transaction } from "@/components/history/type";

export default function DeleteTransactionDialog({
  children,
  transaction,
}: {
  children: React.ReactNode;
  transaction: Transaction;
}) {
  const [isOpen, setIsOpen] = useState(false);

  const { deleteTransaction, isDeleting } = useDeleteTransaction();

  const handleDelete = async () => {
    if (!transaction) {
      return;
    }

    try {
      await deleteTransaction(transaction.id);
      toast.success("Transaction deleted successfully");
      setIsOpen(false);
    } catch (error) {
      console.error("Failed to delete transaction:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to delete transaction",
      );
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[400px] bg-gradient-to-bl from-blue-900 via-purple-900 to-blue-800">
        <DialogHeader>
          <DialogTitle className="text-foreground">
            Delete Transaction
          </DialogTitle>
          <DialogDescription className="text-foreground/60">
            Are you sure you want to delete this transaction? This action cannot
            be undone.
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          <div className="bg-foreground/10 border border-foreground/20 rounded-lg p-4 space-y-2">
            <div className="flex justify-between">
              <span className="text-foreground/60">Symbol:</span>
              <span className="text-foreground font-medium">
                {transaction.symbol}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-foreground/60">Type:</span>
              <span className="text-foreground font-medium uppercase">
                {transaction.type}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-foreground/60">Amount:</span>
              <span className="text-foreground font-medium">
                {transaction.amount}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-foreground/60">Price:</span>
              <span className="text-foreground font-medium">
                ${transaction.price.toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-foreground/60">Date:</span>
              <span className="text-foreground font-medium">
                {new Date(transaction.dateTime).toLocaleDateString()}
              </span>
            </div>
          </div>
        </div>

        <DialogFooter>
          <DialogClose asChild>
            <Button
              type="button"
              variant="outline"
              className="bg-foreground/10 border-foreground/20 text-foreground hover:bg-foreground/20"
            >
              Cancel
            </Button>
          </DialogClose>
          <Button
            type="button"
            variant="destructive"
            onClick={handleDelete}
            disabled={isDeleting}
            className="bg-red-600 hover:bg-red-700 text-white"
          >
            {isDeleting ? "Deleting..." : "Delete"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
