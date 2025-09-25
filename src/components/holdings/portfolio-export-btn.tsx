"use client";

import { Download } from "lucide-react";
import { unparse } from "papaparse";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import type { HoldingsSummary } from "@/components/holdings/type";

interface PortfolioExportBtnProps {
  holdingsData: HoldingsSummary;
}

export default function PortfolioExportBtn({
  holdingsData,
}: PortfolioExportBtnProps) {
  // CSV Export function for portfolio holdings
  const handleExportCSV = () => {
    try {
      // Prepare CSV data with portfolio summary and individual holdings
      const csvData = [
        // Portfolio Summary Row
        {
          Symbol: "PORTFOLIO SUMMARY",
          "Total Amount": "",
          "Average Price": "",
          "Current Value (USD)": holdingsData.totalPortfolioValueUSD,
          "Cost Basis (USD)": holdingsData.totalCostUSD,
          "P&L (USD)": holdingsData.totalProfitLossUSD,
          "P&L (%)": holdingsData.totalProfitLossPercentage,
        },
        // Empty row for separation
        {
          Symbol: "",
          "Total Amount": "",
          "Average Price": "",
          "Current Value (USD)": "",
          "Cost Basis (USD)": "",
          "P&L (USD)": "",
          "P&L (%)": "",
        },
        // Individual Holdings
        ...holdingsData.holdings.map((holding) => ({
          Symbol: holding.symbol,
          "Total Amount": holding.totalAmount,
          "Average Price": holding.averagePrice,
          "Current Value (USD)": holding.totalValueUSD,
          "Cost Basis (USD)": holding.totalCostUSD,
          "P&L (USD)": holding.profitLossUSD,
          "P&L (%)": holding.profitLossPercentage,
        })),
      ];

      const csv = unparse(csvData, {
        header: true,
        delimiter: ",",
      });

      const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
      const link = document.createElement("a");
      const url = URL.createObjectURL(blob);
      link.setAttribute("href", url);
      link.setAttribute(
        "download",
        `portfolio_holdings_${new Date().toISOString().split("T")[0]}.csv`,
      );
      link.style.visibility = "hidden";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast.success("Portfolio CSV file downloaded successfully!");
    } catch (error) {
      console.error("Error exporting CSV:", error);
      toast.error("Failed to export CSV file");
    }
  };

  return (
    <Button
      onClick={handleExportCSV}
      variant="outline"
      className="bg-foreground/10 border-foreground/20 text-foreground hover:bg-foreground/20"
    >
      <Download className="h-4 w-4 mr-2" />
      Export
    </Button>
  );
}
