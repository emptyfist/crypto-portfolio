import { History } from "lucide-react";
import ExportBtn from "@/components/history/export-btn";
import Filter from "@/components/history/filter";
import HistoryList from "@/components/history/history-list";
import ImportBtn from "@/components/history/import-btn";

export default function HistoryPage() {
  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold flex items-center gap-3">
          <History className="h-8 w-8 text-yellow-500" />
          Transaction History
        </h1>
        <div className="flex gap-2">
          <ExportBtn />
          <ImportBtn />
        </div>
      </div>
      <Filter />
      <HistoryList />
    </div>
  );
}
