import { TableCell, TableRow } from "@/components/ui/table";

export default function HistorySkeleton() {
  return (
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
          <TableCell className="py-4">
            <div className="h-4 bg-foreground/10 rounded animate-pulse w-16"></div>
          </TableCell>
        </TableRow>
      ))}
    </>
  );
}
