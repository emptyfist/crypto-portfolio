"use client";

import { Download } from "lucide-react";
import { unparse } from "papaparse";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

export default function ExportBtn() {
  // CSV Export function
  const handleExportCSV = () => {
    const csvData = [
      {
        Symbol: "BTC",
        Type: "Buy",
        Amount: 1,
        Price: 10000,
        "Date Time": "2021-01-01 12:00:00",
        Network: "Ethereum",
        TransactionId:
          "0x5e3b5ab51c7efdbb3aefc54c1ab37e5dfd9339b3b5cf81d0d7b8f7d8b6f4c7a9",
      },
    ];

    const csv = unparse(csvData);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute(
      "download",
      `transactions_${new Date().toISOString().split("T")[0]}.csv`,
    );
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast.success("CSV file downloaded successfully!");
  };

  return (
    <Button
      onClick={handleExportCSV}
      variant="outline"
      className="bg-foreground/10 border-foreground/20 text-foreground hover:bg-foreground/20"
    >
      <Download className="h-4 w-4 mr-2" />
      Download Template
    </Button>
  );
}
