"use client";

import { Search } from "lucide-react";
import { useState } from "react";
import { type Transaction } from "@/components/history/type";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const currentTransactions: Transaction[] = [];
const totalPages = 1;

export default function HistoryList() {
  const [currentPage, setCurrentPage] = useState(1);
  // const [startIndex, setStartIndex] = useState(0);
  // const [endIndex, setEndIndex] = useState(10);
  // const [filteredTransactions, setFilteredTransactions] = useState<
  //   Transaction[]
  // >([]);

  const startIndex = 0;
  const endIndex = 10;
  const filteredTransactions = [];

  return (
    <Card className="bg-foreground/10 border-foreground/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-foreground">
          <Search className="h-5 w-5" />
          Transactions (10)
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="border-foreground/20">
                <TableHead className="text-foreground">Symbol</TableHead>
                <TableHead className="text-foreground">Type</TableHead>
                <TableHead className="text-foreground">Amount</TableHead>
                <TableHead className="text-foreground">Price</TableHead>
                <TableHead className="text-foreground">Total Value</TableHead>
                <TableHead className="text-foreground">Date Time</TableHead>
                <TableHead className="text-foreground">Network</TableHead>
                <TableHead className="text-foreground">
                  Transaction ID
                </TableHead>
                <TableHead className="text-foreground">File Name</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {currentTransactions.length === 0 ? (
                <TableRow className="border-foreground/20">
                  <TableCell
                    colSpan={9}
                    className="text-center py-8 text-foreground/60"
                  >
                    No transactions found
                  </TableCell>
                </TableRow>
              ) : (
                currentTransactions.map((transaction) => (
                  <TableRow
                    key={transaction.id}
                    className="border-foreground/20 hover:bg-foreground/5"
                  >
                    <TableCell className="font-medium text-foreground">
                      {transaction.symbol}
                    </TableCell>
                    <TableCell>
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          transaction.type === "buy"
                            ? "bg-green-500/20 text-green-300 border border-green-500/30"
                            : "bg-red-500/20 text-red-300 border border-red-500/30"
                        }`}
                      >
                        {transaction.type.toUpperCase()}
                      </span>
                    </TableCell>
                    <TableCell className="text-foreground">
                      {transaction.amount}
                    </TableCell>
                    <TableCell className="text-foreground">
                      ${transaction.price.toLocaleString()}
                    </TableCell>
                    <TableCell className="text-foreground">
                      $
                      {(
                        transaction.amount * transaction.price
                      ).toLocaleString()}
                    </TableCell>
                    <TableCell className="text-foreground">
                      {transaction.dateTime}
                    </TableCell>
                    <TableCell className="text-foreground">
                      {transaction.network}
                    </TableCell>
                    <TableCell className="text-foreground/60 font-mono text-xs">
                      {transaction.transactionId.substring(0, 8)}...
                    </TableCell>
                    <TableCell className="text-foreground/60">
                      {transaction.fileName}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between mt-4">
            <div className="text-sm text-foreground/60">
              Showing {startIndex + 1} to{" "}
              {Math.min(endIndex, filteredTransactions.length)} of{" "}
              {filteredTransactions.length} transactions
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                className="bg-foreground/10 border-foreground/20 text-foreground hover:bg-foreground/20"
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
              >
                Previous
              </Button>
              <span className="text-sm text-foreground">
                Page {currentPage} of {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                className="bg-foreground/10 border-foreground/20 text-foreground hover:bg-foreground/20"
                onClick={() =>
                  setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                }
                disabled={currentPage === totalPages}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
