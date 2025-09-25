"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Upload, X } from "lucide-react";
import { parse } from "papaparse";
import { useCallback, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z, ZodError, type ZodIssue } from "zod";
import { type Transaction } from "@/components/history/type";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { revalidateHistory } from "@/lib/swr/use-history";
import { useUpload } from "@/lib/swr/use-upload";

const csvSchema = z.object({
  Symbol: z.string().refine((val) => val.length === 3, {
    message: "Symbol must be exactly 3 characters",
  }),
  Type: z.enum(["Buy", "Sell"], { message: "Type must be 'Buy' or 'Sell'" }),
  Amount: z
    .string()
    .refine((val) => !isNaN(parseFloat(val)) && parseFloat(val) > 0, {
      message: "Amount must be a positive number",
    }),
  Price: z
    .string()
    .refine((val) => !isNaN(parseFloat(val)) && parseFloat(val) > 0, {
      message: "Price must be a positive number",
    }),
  "Date Time": z.string().refine(
    (val) => {
      // Check format: yyyy-mm-dd HH:MM:SS
      const dateTimeRegex = /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/;
      return (
        dateTimeRegex.test(val) && !isNaN(Date.parse(val.replace(" ", "T")))
      );
    },
    {
      message: "Date Time must be in format yyyy-mm-dd HH:MM:SS",
    },
  ),
  Network: z.string().min(1, "Network is required"),
  TransactionId: z.string().refine((val) => val.length === 66, {
    message: "TransactionId must be exactly 66 characters as 0x{64} for hash",
  }),
});

const uploadFormSchema = z.object({
  fileName: z
    .string()
    .min(1, "File name is required")
    .refine((val) => val.endsWith(".csv"), {
      message: "File name must end with .csv",
    }),
  uploadDate: z.string().min(1, "Upload date is required"),
});

type UploadFormData = z.infer<typeof uploadFormSchema>;

export default function ImportBtn() {
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const { uploadTransactions, isUploading } = useUpload({
    onSuccess: (data) => {
      toast.success(data.message);
      // Revalidate history data to show updated transactions
      revalidateHistory();
    },
    onError: (error) => {
      toast.error(error);
    },
  });

  const uploadForm = useForm<UploadFormData>({
    resolver: zodResolver(uploadFormSchema),
    defaultValues: {
      fileName: "",
      uploadDate: new Date().toISOString().split("T")[0],
    },
  });

  // CSV Upload function
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      setSelectedFile(null);
      return;
    }

    // Validate file type
    if (!file.name.endsWith(".csv")) {
      toast.error("Please select a CSV file");
      setSelectedFile(null);
      return;
    }

    setSelectedFile(file);
  };

  const handleSubmit = async (data: UploadFormData) => {
    if (!selectedFile) {
      toast.error("Please select a CSV file to upload");
      return;
    }

    // Process the file
    parse(selectedFile, {
      header: true,
      skipEmptyLines: true,
      complete: async (results) => {
        const { data: csvData, errors } = results;

        if (errors.length > 0) {
          toast.error(
            `CSV parsing errors: ${errors.map((e) => e.message).join(", ")}`,
          );
          return;
        }

        // Validate each row
        const validTransactions: Transaction[] = [];
        const invalidRows: string[] = [];

        csvData.forEach((row: unknown, index: number) => {
          try {
            const validatedRow = csvSchema.parse(row);
            const transaction: Transaction = {
              id: Date.now().toString() + index,
              symbol: validatedRow.Symbol,
              type: validatedRow.Type.toLowerCase() as "buy" | "sell",
              amount: parseFloat(validatedRow.Amount),
              price: parseFloat(validatedRow.Price),
              dateTime: validatedRow["Date Time"],
              network: validatedRow.Network,
              transactionId: validatedRow.TransactionId,
              fileName: data.fileName,
              updatedAt: new Date().toISOString(),
            };
            validTransactions.push(transaction);
          } catch (error) {
            let errorMsg = "Unknown error";
            if (error instanceof ZodError) {
              errorMsg = error.issues
                .map((e: ZodIssue) => `${e.path.join(".")}: ${e.message}`)
                .join("; ");
            } else if (error instanceof Error) {
              errorMsg = error.message;
            }
            invalidRows.push(`Row [${index + 1}] has error: ${errorMsg}`);
          }
        });

        if (invalidRows.length > 0) {
          toast.error(invalidRows.join("\n"), {
            duration: 10000,
          });
        }

        if (validTransactions.length > 0) {
          // Upload to Supabase
          const result = await uploadTransactions({
            transactions: validTransactions,
            fileName: data.fileName,
            uploadDate: data.uploadDate,
          });

          if (result.success) {
            setIsUploadDialogOpen(false);
            uploadForm.reset();
            setSelectedFile(null);
            // Revalidate history data to show updated transactions
            revalidateHistory();
          }
        }
      },
      error: (error) => {
        toast.error(`Error parsing CSV: ${error.message}`);
      },
    });
  };

  const handleDialogClose = (open: boolean) => {
    setIsUploadDialogOpen(open);
    if (!open) {
      // Reset form when dialog closes
      uploadForm.reset();
      setSelectedFile(null);
    }
  };

  const handleClearFile = useCallback(() => {
    setSelectedFile(null);
    // Clear the file input
    const fileInput = document.querySelector(
      'input[type="file"]',
    ) as HTMLInputElement;
    if (fileInput) {
      fileInput.value = "";
    }
  }, [setSelectedFile]);

  const handleClickClose = () => {
    handleDialogClose(false);
  };

  return (
    <Dialog open={isUploadDialogOpen} onOpenChange={handleDialogClose}>
      <DialogTrigger asChild>
        <Button className="bg-foreground/20 border-foreground/30 text-foreground hover:bg-foreground/30">
          <Upload className="h-4 w-4 mr-2" />
          Import CSV
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md bg-gradient-to-br from-blue-900 via-purple-900 to-blue-800">
        <DialogHeader>
          <DialogTitle className="text-foreground">
            Import Transactions
          </DialogTitle>
          <DialogDescription className="text-foreground/80 whitespace-pre-wrap">
            {`Upload a CSV file with your transaction data. Required columns:\nSymbol, Type, Amount, Price, Date Time, Network, TransactionId`}
          </DialogDescription>
        </DialogHeader>
        <Form {...uploadForm}>
          <form
            className="space-y-4"
            onSubmit={uploadForm.handleSubmit(handleSubmit)}
          >
            <FormField
              control={uploadForm.control}
              name="fileName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-foreground">File Name</FormLabel>
                  <FormControl>
                    <Input
                      className="bg-foreground/5 border-foreground/20 text-foreground placeholder:text-foreground/50"
                      placeholder="e.g., binance_export_jan.csv"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={uploadForm.control}
              name="uploadDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-foreground">Upload Date</FormLabel>
                  <FormControl>
                    <Input
                      className="bg-foreground/5 border-foreground/20 text-foreground placeholder:text-foreground/50"
                      type="date"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div>
              <label className="text-sm font-medium text-foreground">
                CSV File
              </label>
              <div className="flex gap-2 mt-1">
                <Input
                  className="bg-foreground/5 border-foreground/20 text-foreground placeholder:text-foreground/50 file:border-foreground/20 file:text-foreground file:rounded-md file:px-3 file:py-1 file:text-sm file:font-medium file:mr-3 file:cursor-pointer file:border-0 file:bg-transparent [&::file-selector-button]:hidden"
                  type="file"
                  accept=".csv"
                  onChange={handleFileUpload}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="bg-foreground/10 border-foreground/20 text-foreground hover:bg-foreground/20 size-9"
                  onClick={handleClearFile}
                  disabled={!selectedFile}
                >
                  <X className="h-4 w-4 text-destructive" />
                </Button>
              </div>
            </div>
            <DialogFooter>
              <Button
                type="submit"
                disabled={isUploading}
                className="bg-foreground/20 border-foreground/30 text-foreground hover:bg-foreground/30"
              >
                {isUploading ? "Uploading..." : "Upload"}
              </Button>
              <Button
                type="button"
                variant="outline"
                className="bg-foreground/10 border-foreground/20 text-foreground hover:bg-foreground/20"
                onClick={handleClickClose}
              >
                Close
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
