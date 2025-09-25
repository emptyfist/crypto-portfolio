import { Trophy, TrendingUp, TrendingDown, Users } from "lucide-react";
import { LeaderboardUser } from "@/components/leaderboard/type";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { leaderboard } from "@/lib/repositories/supabase";
import { formatCurrency, formatNumber } from "@/lib/utils";

export default async function LeaderboardPage() {
  let leaderboardData: LeaderboardUser[] = [];
  let error: string | null = null;

  try {
    leaderboardData = await leaderboard.getLeaderboard();
  } catch (err) {
    error = err instanceof Error ? err.message : "Failed to fetch leaderboard";
    console.log(err);
  }

  if (error) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold flex items-center gap-3">
          <Trophy className="h-8 w-8 text-yellow-500" />
          Leaderboard
        </h1>
        <Card className="bg-foreground/20">
          <CardContent className="pt-6">
            <p className="text-muted-foreground">
              Failed to load leaderboard data. Please try again.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!leaderboardData || leaderboardData.length === 0) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold flex items-center gap-3">
          <Trophy className="h-8 w-8 text-yellow-500" />
          Leaderboard
        </h1>
        <Card className="bg-foreground/20">
          <CardContent className="pt-6">
            <p className="text-muted-foreground text-center">
              No users found. Be the first to join the leaderboard!
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold flex items-center gap-3">
        <Trophy className="h-8 w-8 text-yellow-500" />
        Leaderboard
      </h1>

      {/* Leaderboard Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="bg-foreground/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{leaderboardData.length}</div>
          </CardContent>
        </Card>

        <Card className="bg-foreground/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Top Portfolio Value
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {formatCurrency(leaderboardData[0]?.totalPortfolioValueUSD || 0)}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-foreground/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Best Performance
            </CardTitle>
            <Trophy className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {(() => {
                const bestPerformance = leaderboardData.reduce((best, user) =>
                  user.totalProfitLossPercentage >
                  best.totalProfitLossPercentage
                    ? user
                    : best,
                );
                return (
                  <span
                    className={
                      bestPerformance.totalProfitLossPercentage >= 0
                        ? "text-green-600"
                        : "text-red-600"
                    }
                  >
                    {bestPerformance.totalProfitLossPercentage >= 0 ? "+" : ""}
                    {formatNumber(bestPerformance.totalProfitLossPercentage, 2)}
                    %
                  </span>
                );
              })()}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Leaderboard Table */}
      <Card className="bg-foreground/20">
        <CardHeader>
          <CardTitle>Portfolio Rankings</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {leaderboardData.map((user, index) => (
              <LeaderboardCard
                key={user.id}
                user={user}
                rank={index + 1}
                isTopThree={index < 3}
              />
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

const LeaderboardCard = ({
  user,
  rank,
  isTopThree,
}: {
  user: LeaderboardUser;
  rank: number;
  isTopThree: boolean;
}) => {
  const getRankIcon = () => {
    if (rank === 1) {
      return "🥇";
    }
    if (rank === 2) {
      return "🥈";
    }
    if (rank === 3) {
      return "🥉";
    }
    return rank;
  };

  const getRankColor = () => {
    if (rank === 1) {
      return "text-yellow-500";
    }
    if (rank === 2) {
      return "text-gray-400";
    }
    if (rank === 3) {
      return "text-amber-600";
    }
    return "text-muted-foreground";
  };

  return (
    <div
      className={`flex items-center justify-between p-4 rounded-lg border ${
        isTopThree
          ? "bg-gradient-to-r from-yellow-500/10 via-gray-400/10 to-amber-600/10 border-yellow-500/20"
          : "bg-foreground/5 border-foreground/20"
      }`}
    >
      <div className="flex items-center gap-4">
        <div className={`text-2xl font-bold ${getRankColor()}`}>
          {getRankIcon()}
        </div>
        <div>
          <div className="font-semibold">
            {user.full_name || user.email.split("@")[0]}
          </div>
          <div className="text-sm text-muted-foreground">
            {user.holdingsCount} holdings
          </div>
        </div>
      </div>

      <div className="flex items-center gap-6 text-right">
        <div>
          <div className="text-sm text-muted-foreground">Portfolio Value</div>
          <div className="font-semibold">
            {formatCurrency(user.totalPortfolioValueUSD)}
          </div>
        </div>

        <div>
          <div className="text-sm text-muted-foreground">P&L</div>
          <div
            className={`font-semibold flex items-center gap-1 ${
              user.totalProfitLossUSD >= 0 ? "text-green-600" : "text-red-600"
            }`}
          >
            {user.totalProfitLossUSD >= 0 ? (
              <TrendingUp className="h-4 w-4" />
            ) : (
              <TrendingDown className="h-4 w-4" />
            )}
            {user.totalProfitLossUSD >= 0 ? "+" : ""}
            {formatCurrency(user.totalProfitLossUSD)}
          </div>
        </div>

        <div>
          <div className="text-sm text-muted-foreground">P&L %</div>
          <div
            className={`font-semibold ${
              user.totalProfitLossPercentage >= 0
                ? "text-green-600"
                : "text-red-600"
            }`}
          >
            {user.totalProfitLossPercentage >= 0 ? "+" : ""}
            {formatNumber(user.totalProfitLossPercentage, 2)}%
          </div>
        </div>
      </div>
    </div>
  );
};
