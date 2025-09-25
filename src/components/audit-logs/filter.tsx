"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import {
  Download,
  Edit,
  Trash2,
  Upload,
  Filter,
  RefreshCw,
} from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { replaceUrlParams } from "@/lib/utils";

const actionOptions = [
  { value: "import", label: "CSV Import", icon: Upload },
  { value: "create", label: "Create", icon: Download },
  { value: "update", label: "Edit", icon: Edit },
  { value: "delete", label: "Delete", icon: Trash2 },
] as const satisfies {
  value: string;
  label: string;
  icon: React.ElementType;
}[];

const filterSchema = z.object({
  action: z.string().optional(),
  limit: z.string().min(1, "Limit is required"),
});

type FilterFormValues = z.infer<typeof filterSchema>;

export default function AuditLogsFilter() {
  const searchParams = useSearchParams();

  const form = useForm<FilterFormValues>({
    resolver: zodResolver(filterSchema),
    defaultValues: {
      action: searchParams.get("action") || "none",
      limit: searchParams.get("limit") || "20",
    },
  });

  const onSubmit = (values: FilterFormValues) => {
    replaceUrlParams({
      action: values.action === "none" ? undefined : values.action,
      limit: values.limit,
    });
  };

  const clearFilters = () => {
    form.reset({
      action: "none",
      limit: "20",
    });
    replaceUrlParams({
      action: "none",
      limit: "20",
    });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <div className="flex flex-wrap gap-4 items-end">
          <FormField
            control={form.control}
            name="action"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Action</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger className="w-45 bg-foreground/20">
                      <SelectValue placeholder="Select action" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent className="bg-gray-700">
                    <SelectItem value="none">All Actions</SelectItem>
                    {actionOptions.map((option) => {
                      const IconComponent = option.icon;
                      return (
                        <SelectItem key={option.value} value={option.value}>
                          <div className="flex items-center gap-2">
                            <IconComponent className="h-4 w-4" />
                            {option.label}
                          </div>
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="limit"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Items per page</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger className="w-30 bg-foreground/20">
                      <SelectValue placeholder="Select limit" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent className="bg-gray-700">
                    <SelectItem value="10">10</SelectItem>
                    <SelectItem value="20">20</SelectItem>
                    <SelectItem value="50">50</SelectItem>
                    <SelectItem value="100">100</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          <div className="flex gap-2">
            <Button
              type="submit"
              variant="outline"
              className="bg-foreground/20 hover:bg-foreground/30 size-10"
            >
              <Filter className="size-6" />
            </Button>
            <Button
              type="button"
              onClick={clearFilters}
              variant="outline"
              className="bg-foreground/20 hover:bg-foreground/30 size-10"
            >
              <RefreshCw className="size-6" />
            </Button>
          </div>
        </div>
      </form>
    </Form>
  );
}
