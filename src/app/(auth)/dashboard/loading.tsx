import { Card, CardContent, CardHeader } from "@/components/ui/card";

export default function HoldingsLoading() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Portfolio Holdings</h1>

      {/* Portfolio Summary Cards Skeleton */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="animate-pulse bg-foreground/20">
            <CardHeader className="pb-2">
              <div className="h-4 bg-foreground/30 rounded w-3/4"></div>
            </CardHeader>
            <CardContent>
              <div className="h-8 bg-foreground/30 rounded w-1/2"></div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Individual Holdings Skeleton */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <Card key={i} className="animate-pulse bg-foreground/20">
            <CardHeader>
              <div className="h-5 bg-foreground/30 rounded w-16"></div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between">
                <div className="h-4 bg-foreground/30 rounded w-16"></div>
                <div className="h-4 bg-foreground/30 rounded w-20"></div>
              </div>
              <div className="flex justify-between">
                <div className="h-4 bg-foreground/30 rounded w-20"></div>
                <div className="h-4 bg-foreground/30 rounded w-24"></div>
              </div>
              <div className="flex justify-between">
                <div className="h-4 bg-foreground/30 rounded w-18"></div>
                <div className="h-4 bg-foreground/30 rounded w-20"></div>
              </div>
              <div className="flex justify-between">
                <div className="h-4 bg-foreground/30 rounded w-16"></div>
                <div className="h-4 bg-foreground/30 rounded w-20"></div>
              </div>
              <div className="flex justify-between">
                <div className="h-4 bg-foreground/30 rounded w-8"></div>
                <div className="h-4 bg-foreground/30 rounded w-20"></div>
              </div>
              <div className="flex justify-between">
                <div className="h-4 bg-foreground/30 rounded w-12"></div>
                <div className="h-4 bg-foreground/30 rounded w-16"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
