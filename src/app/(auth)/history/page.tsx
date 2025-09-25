import ExportBtn from "@/components/history/export-btn";
import Filter from "@/components/history/filter";
import HistoryList from "@/components/history/history-list";
import ImportBtn from "@/components/history/import-btn";
// Transaction type definition

// Mock data for demonstration
// const mockTransactions: Transaction[] = [
//   {
//     id: "1",
//     symbol: "BTC",
//     type: "buy",
//     amount: 0.5,
//     price: 45000,
//     dateTime: "2024-01-15 10:30:00",
//     network: "Bitcoin",
//     transactionId:
//       "a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6a7b8c9d0e1f2",
//     fileName: "binance_export_jan.csv",
//     createdAt: "2024-01-15T10:30:00Z",
//   },
//   {
//     id: "2",
//     symbol: "ETH",
//     type: "sell",
//     amount: 2.0,
//     price: 3200,
//     dateTime: "2024-01-20 14:15:00",
//     network: "Ethereum",
//     transactionId:
//       "b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6a7b8c9d0e1f2g3",
//     fileName: "binance_export_jan.csv",
//     createdAt: "2024-01-20T14:15:00Z",
//   },
//   {
//     id: "3",
//     symbol: "ADA",
//     type: "buy",
//     amount: 1000,
//     price: 0.45,
//     dateTime: "2024-02-01 09:45:00",
//     network: "Cardano",
//     transactionId:
//       "c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6a7b8c9d0e1f2g3h4",
//     fileName: "coinbase_export_feb.csv",
//     createdAt: "2024-02-01T09:45:00Z",
//   },
// ];

export default function History() {
  // const [currentPage, setCurrentPage] = useState(1);
  // const [itemsPerPage] = useState(10);

  // Filter transactions based on search criteria
  // useEffect(() => {
  //   let filtered = transactions;

  //   if (filters.symbol) {
  //     filtered = filtered.filter((tx) =>
  //       tx.symbol.toLowerCase().includes(filters.symbol.toLowerCase())
  //     );
  //   }

  //   if (filters.date) {
  //     filtered = filtered.filter((tx) => tx.dateTime.includes(filters.date));
  //   }

  //   if (filters.fileName) {
  //     filtered = filtered.filter((tx) =>
  //       tx.fileName.toLowerCase().includes(filters.fileName.toLowerCase())
  //     );
  //   }

  //   setFilteredTransactions(filtered);
  //   setCurrentPage(1);
  // }, [transactions, filters]);

  // Pagination logic
  // const totalPages = Math.ceil(filteredTransactions.length / itemsPerPage);
  // const startIndex = (currentPage - 1) * itemsPerPage;
  // const endIndex = startIndex + itemsPerPage;
  // const currentTransactions = filteredTransactions.slice(startIndex, endIndex);

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Transaction History</h1>
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
