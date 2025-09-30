import { LayoutDashboard } from "lucide-react";
import Image from "next/image";
import PortfolioExportBtn from "@/components/holdings/portfolio-export-btn";
import { Holding } from "@/components/holdings/type";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { holdings } from "@/lib/repositories/supabase";
import { formatCurrency, formatNumber, getTokenImageUrl } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  let holdingsData;
  let error: string | null = null;

  try {
    holdingsData = await holdings.getHoldings();
  } catch (err) {
    error = err instanceof Error ? err.message : "Failed to fetch holdings";
    console.log(err);
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <LayoutDashboard className="h-8 w-8 text-yellow-500" />
            Dashboard
          </h1>
        </div>
        <Card className="bg-foreground/20">
          <CardContent className="pt-6">
            <p className="text-muted-foreground">
              Failed to load holdings data. Please try again.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!holdingsData) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <LayoutDashboard className="h-8 w-8 text-yellow-500" />
            Dashboard
          </h1>
        </div>
        <Card className="bg-foreground/20">
          <CardContent className="pt-6">
            <p className="text-muted-foreground">No holdings data available.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const {
    totalPortfolioValueUSD,
    totalCostUSD,
    totalProfitLossUSD,
    totalProfitLossPercentage,
    holdings: holdingsList,
  } = holdingsData;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold flex items-center gap-3">
          <LayoutDashboard className="h-8 w-8 text-yellow-500" />
          Dashboard
        </h1>
        <PortfolioExportBtn holdingsData={holdingsData} />
      </div>

      {/* Portfolio Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-foreground/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Portfolio Value
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(totalPortfolioValueUSD)}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-foreground/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Cost</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(totalCostUSD)}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-foreground/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total P&L</CardTitle>
          </CardHeader>
          <CardContent>
            <div
              className={`text-2xl font-bold ${totalProfitLossUSD >= 0 ? "text-green-600" : "text-red-600"}`}
            >
              {totalProfitLossUSD >= 0 ? "+" : ""}
              {formatCurrency(totalProfitLossUSD)}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-foreground/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total P&L %</CardTitle>
          </CardHeader>
          <CardContent>
            <div
              className={`text-2xl font-bold ${totalProfitLossPercentage >= 0 ? "text-green-600" : "text-red-600"}`}
            >
              {totalProfitLossPercentage >= 0 ? "+" : ""}
              {formatNumber(totalProfitLossPercentage, 2)}%
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Individual Holdings */}
      {holdingsList.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {holdingsList.map((holding) => (
            <HoldingCard key={holding.symbol} holding={holding} />
          ))}
        </div>
      ) : (
        <Card className="bg-foreground/20">
          <CardContent className="pt-6">
            <p className="text-muted-foreground text-center">
              No holdings found. Import some transactions to see your portfolio.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

const HoldingCard = ({ holding }: { holding: Holding }) => {
  return (
    <Card className="bg-foreground/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-3">
          <div className="relative size-10">
            <Image
              src={getTokenImageUrl(holding.symbol)}
              alt={`${holding.symbol} logo`}
              fill
              className="rounded-full object-contain"
            />
          </div>
          <span className="text-lg font-semibold">{holding.symbol}</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex justify-between">
          <span className="text-sm text-muted-foreground">Amount:</span>
          <span className="font-medium">
            {formatNumber(holding.totalAmount, 6)}
          </span>
        </div>

        <div className="flex justify-between">
          <span className="text-sm text-muted-foreground">Current Value:</span>
          <span className="font-medium">
            {formatCurrency(holding.totalValueUSD)}
          </span>
        </div>

        <div className="flex justify-between">
          <span className="text-sm text-muted-foreground">Cost Basis:</span>
          <span className="font-medium">
            {formatCurrency(holding.totalCostUSD)}
          </span>
        </div>

        <div className="flex justify-between">
          <span className="text-sm text-muted-foreground">Avg Price:</span>
          <span className="font-medium">
            {formatCurrency(holding.averagePrice)}
          </span>
        </div>

        <div className="flex justify-between">
          <span className="text-sm text-muted-foreground">P&L:</span>
          <span
            className={`font-medium ${holding.profitLossUSD >= 0 ? "text-green-600" : "text-red-600"}`}
          >
            {holding.profitLossUSD >= 0 ? "+" : ""}
            {formatCurrency(holding.profitLossUSD)}
          </span>
        </div>

        <div className="flex justify-between">
          <span className="text-sm text-muted-foreground">P&L %:</span>
          <span
            className={`font-medium ${holding.profitLossPercentage >= 0 ? "text-green-600" : "text-red-600"}`}
          >
            {holding.profitLossPercentage >= 0 ? "+" : ""}
            {formatNumber(holding.profitLossPercentage, 2)}%
          </span>
        </div>
      </CardContent>
    </Card>
  );
};
