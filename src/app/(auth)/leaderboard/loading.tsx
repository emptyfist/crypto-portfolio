import { Trophy } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function LeaderboardLoading() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold flex items-center gap-3">
        <Trophy className="h-8 w-8 text-yellow-500" />
        Leaderboard
      </h1>

      {/* Loading Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        {Array.from({ length: 3 }).map((_, index) => (
          <Card key={index} className="bg-foreground/20">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div className="h-4 bg-foreground/10 rounded animate-pulse w-24"></div>
              <div className="h-4 w-4 bg-foreground/10 rounded animate-pulse"></div>
            </CardHeader>
            <CardContent>
              <div className="h-8 bg-foreground/10 rounded animate-pulse w-20"></div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Loading Leaderboard */}
      <Card className="bg-foreground/20">
        <CardHeader>
          <CardTitle>Portfolio Rankings</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-4 rounded-lg border bg-foreground/5 border-foreground/20"
              >
                <div className="flex items-center gap-4">
                  <div className="h-8 w-8 bg-foreground/10 rounded-full animate-pulse"></div>
                  <div className="space-y-2">
                    <div className="h-4 bg-foreground/10 rounded animate-pulse w-32"></div>
                    <div className="h-3 bg-foreground/10 rounded animate-pulse w-20"></div>
                  </div>
                </div>

                <div className="flex items-center gap-6">
                  <div className="text-right space-y-2">
                    <div className="h-3 bg-foreground/10 rounded animate-pulse w-16"></div>
                    <div className="h-4 bg-foreground/10 rounded animate-pulse w-20"></div>
                  </div>
                  <div className="text-right space-y-2">
                    <div className="h-3 bg-foreground/10 rounded animate-pulse w-12"></div>
                    <div className="h-4 bg-foreground/10 rounded animate-pulse w-16"></div>
                  </div>
                  <div className="text-right space-y-2">
                    <div className="h-3 bg-foreground/10 rounded animate-pulse w-12"></div>
                    <div className="h-4 bg-foreground/10 rounded animate-pulse w-16"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
