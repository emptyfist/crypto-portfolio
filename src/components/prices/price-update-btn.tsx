"use client";

import { RefreshCw, DollarSign } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

interface PriceUpdateBtnProps {
  className?: string;
}

export default function PriceUpdateBtn({ className }: PriceUpdateBtnProps) {
  const [isUpdating, setIsUpdating] = useState(false);

  const handleUpdatePrices = async () => {
    setIsUpdating(true);

    try {
      const response = await fetch("/api/prices/update", {
        method: "POST",
      });

      const result = await response.json();

      if (result.success) {
        toast.success(
          `Updated ${result.updated_count} token prices successfully!`,
          {
            description: `Total prices in database: ${result.total_prices}`,
          },
        );
      } else {
        toast.error("Failed to update prices", {
          description: result.error || "Unknown error occurred",
        });
      }
    } catch (error) {
      console.error("Price update error:", error);
      toast.error("Failed to update prices", {
        description: error instanceof Error ? error.message : "Network error",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <Button
      onClick={handleUpdatePrices}
      disabled={isUpdating}
      variant="outline"
      size="sm"
      className={className}
    >
      <RefreshCw
        className={`h-4 w-4 mr-2 ${isUpdating ? "animate-spin" : ""}`}
      />
      <DollarSign className="h-4 w-4 mr-2" />
      {isUpdating ? "Updating..." : "Update Prices"}
    </Button>
  );
}
