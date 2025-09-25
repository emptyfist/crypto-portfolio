"use client";

import { format } from "date-fns";
import { ChevronLeft, ChevronRight, Search } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useHistory } from "@/lib/swr/use-history";
import { getBlockchainScanUrl } from "@/lib/utils";

export default function HistoryList() {
  const [currentPage, setCurrentPage] = useState(1);
  const [pageInput, setPageInput] = useState("");
  const searchParams = useSearchParams();

  // Build query parameters for the API
  const query = {
    page: currentPage,
    limit: 10,
    symbol: searchParams.get("symbol") || undefined,
    startDate: searchParams.get("startDate") || undefined,
    endDate: searchParams.get("endDate") || undefined,
    fileName: searchParams.get("fileName") || undefined,
  };

  // Fetch data using the useHistory hook
  const { data, error, isLoading } = useHistory(query);

  const currentTransactions = data?.transactions || [];
  const totalPages = data?.pagination?.totalPages || 1;
  const totalRecords = data?.pagination?.total || 0;
  const startIndex = (currentPage - 1) * 10;
  const endIndex = Math.min(startIndex + 10, totalRecords);

  // Handle page navigation
  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
      setPageInput("");
    }
  };

  const handlePageInputChange = (value: string) => {
    setPageInput(value);
  };

  const handlePageInputSubmit = () => {
    const page = parseInt(pageInput);
    if (!isNaN(page) && page >= 1 && page <= totalPages) {
      setCurrentPage(page);
      setPageInput("");
    }
  };

  const handlePageInputKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handlePageInputSubmit();
    }
  };

  return (
    <Card className="bg-foreground/10 border-foreground/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-foreground">
          <Search className="h-5 w-5" />
          Transactions ({totalRecords})
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="border-foreground/20">
                <TableHead className="text-foreground">Symbol</TableHead>
                <TableHead className="text-foreground">Type</TableHead>
                <TableHead className="text-foreground text-right">
                  Amount
                </TableHead>
                <TableHead className="text-foreground text-right">
                  Price
                </TableHead>
                <TableHead className="text-foreground text-right">
                  Total Value
                </TableHead>
                <TableHead className="text-foreground">Date Time</TableHead>
                <TableHead className="text-foreground">Network</TableHead>
                <TableHead className="text-foreground">
                  Transaction ID
                </TableHead>
                <TableHead className="text-foreground">File Name</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <>
                  {Array.from({ length: 5 }).map((_, index) => (
                    <TableRow key={index} className="border-foreground/20">
                      <TableCell className="py-4">
                        <div className="h-4 bg-foreground/10 rounded animate-pulse w-16"></div>
                      </TableCell>
                      <TableCell className="py-4">
                        <div className="h-6 bg-foreground/10 rounded-full animate-pulse w-12"></div>
                      </TableCell>
                      <TableCell className="py-4">
                        <div className="h-4 bg-foreground/10 rounded animate-pulse w-20"></div>
                      </TableCell>
                      <TableCell className="py-4">
                        <div className="h-4 bg-foreground/10 rounded animate-pulse w-24"></div>
                      </TableCell>
                      <TableCell className="py-4">
                        <div className="h-4 bg-foreground/10 rounded animate-pulse w-28"></div>
                      </TableCell>
                      <TableCell className="py-4">
                        <div className="h-4 bg-foreground/10 rounded animate-pulse w-32"></div>
                      </TableCell>
                      <TableCell className="py-4">
                        <div className="h-4 bg-foreground/10 rounded animate-pulse w-20"></div>
                      </TableCell>
                      <TableCell className="py-4">
                        <div className="h-4 bg-foreground/10 rounded animate-pulse w-24"></div>
                      </TableCell>
                      <TableCell className="py-4">
                        <div className="h-4 bg-foreground/10 rounded animate-pulse w-28"></div>
                      </TableCell>
                    </TableRow>
                  ))}
                </>
              ) : error ? (
                <TableRow className="border-foreground/20">
                  <TableCell
                    colSpan={9}
                    className="text-center py-8 text-red-400"
                  >
                    Error loading transactions: {error.message}
                  </TableCell>
                </TableRow>
              ) : currentTransactions.length === 0 ? (
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
                    <TableCell className="text-foreground text-right">
                      {transaction.amount}
                    </TableCell>
                    <TableCell className="text-foreground text-right">
                      ${transaction.price.toLocaleString()}
                    </TableCell>
                    <TableCell className="text-foreground text-right">
                      $
                      {(
                        transaction.amount * transaction.price
                      ).toLocaleString()}
                    </TableCell>
                    <TableCell className="text-foreground">
                      {format(transaction.dateTime, "yyyy-MM-dd HH:mm:ss")}
                    </TableCell>
                    <TableCell className="text-foreground">
                      {transaction.network}
                    </TableCell>
                    <TableCell className="text-foreground/60 font-mono text-xs">
                      <a
                        href={getBlockchainScanUrl(
                          transaction.network,
                          transaction.transactionId,
                        )}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-400 hover:text-blue-300 hover:underline transition-colors"
                        title={`View on ${transaction.network} blockchain explorer`}
                      >
                        {transaction.transactionId.substring(0, 8)}...
                      </a>
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
              Showing {startIndex + 1} to {endIndex} of {totalRecords}{" "}
              transactions
            </div>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1">
                <span className="text-sm text-foreground/60">Go to:</span>
                <Input
                  type="number"
                  min="1"
                  max={totalPages}
                  value={pageInput}
                  onChange={(e) => handlePageInputChange(e.target.value)}
                  onKeyPress={handlePageInputKeyPress}
                  className="w-20 h-8 text-center text-sm bg-foreground/5 border-foreground/20 text-foreground placeholder:text-foreground/50"
                  placeholder="Page"
                />
              </div>
              <Button
                variant="outline"
                size="sm"
                className="bg-foreground/10 border-foreground/20 text-foreground hover:bg-foreground/20 size-8"
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <span className="text-sm text-foreground">
                Page {currentPage} of {totalPages}
              </span>

              <Button
                variant="outline"
                size="sm"
                className="bg-foreground/10 border-foreground/20 text-foreground hover:bg-foreground/20 size-8"
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
