"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { CalendarIcon, FilterIcon, SearchIcon, XIcon } from "lucide-react";
import React from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn, replaceUrlParams } from "@/lib/utils";

const filterSchema = z.object({
  symbol: z.string().optional(),
  startDate: z.date().optional(),
  endDate: z.date().optional(),
  fileName: z.string().optional(),
});

type FilterFormData = z.infer<typeof filterSchema>;

export default function Filter() {
  const form = useForm<FilterFormData>({
    resolver: zodResolver(filterSchema),
    defaultValues: {
      symbol: "",
      startDate: undefined,
      endDate: undefined,
      fileName: "",
    },
  });

  const handleSubmit = (data: FilterFormData) => {
    replaceUrlParams({
      symbol: data.symbol,
      startDate: data.startDate
        ? format(data.startDate, "yyyy-MM-dd")
        : undefined,
      endDate: data.endDate ? format(data.endDate, "yyyy-MM-dd") : undefined,
      fileName: data.fileName,
    });
  };

  const clearFilters = () => {
    form.reset({
      symbol: "",
      startDate: undefined,
      endDate: undefined,
      fileName: "",
    });

    replaceUrlParams({
      symbol: "",
      startDate: undefined,
      endDate: undefined,
      fileName: "",
    });
  };

  return (
    <Card className="bg-foreground/10 border-foreground/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-foreground">
          <FilterIcon className="h-5 w-5" />
          Filters
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)}>
            <div className="flex space-x-4 items-end">
              <FormField
                control={form.control}
                name="symbol"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-foreground">Symbol</FormLabel>
                    <FormControl>
                      <Input
                        className="bg-foreground/5 border-foreground/20 text-foreground placeholder:text-foreground/50 w-64"
                        placeholder="Filter by symbol (e.g., BTC)"
                        {...field}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="startDate"
                render={({ field }) => (
                  <FormItem className="min-w-40">
                    <FormLabel>Start Date</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            className={cn(
                              "w-full justify-start text-left font-normal h-10 bg-foreground/5 hover:bg-foreground/10 placeholder:text-foreground/50 h-9",
                              !field.value && "text-muted-foreground",
                            )}
                          >
                            <CalendarIcon className="mr-2 size-4" />
                            {field.value ? (
                              format(field.value, "yyyy-MM-dd")
                            ) : (
                              <span>Pick a date</span>
                            )}
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                        />
                      </PopoverContent>
                    </Popover>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="endDate"
                render={({ field }) => (
                  <FormItem className="min-w-40">
                    <FormLabel>End Date</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            className={cn(
                              "w-full justify-start text-left font-normal h-10 bg-foreground/5 hover:bg-foreground/10 placeholder:text-foreground/50 h-9",
                              !field.value && "text-muted-foreground",
                            )}
                          >
                            <CalendarIcon className="mr-2 size-4" />
                            {field.value ? (
                              format(field.value, "yyyy-MM-dd")
                            ) : (
                              <span>Pick a date</span>
                            )}
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                        />
                      </PopoverContent>
                    </Popover>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="fileName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-foreground">File Name</FormLabel>
                    <FormControl>
                      <Input
                        className="bg-foreground/5 border-foreground/20 text-foreground placeholder:text-foreground/50 w-64"
                        placeholder="Filter by file name"
                        {...field}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
              <Button
                type="submit"
                variant="outline"
                className="bg-foreground/10 border-foreground/20 text-foreground hover:bg-foreground/20 size-9"
              >
                <SearchIcon className="h-4 w-4" />
              </Button>
              <Button
                type="button"
                variant="outline"
                className="bg-foreground/10 border-foreground/20 text-foreground hover:bg-foreground/20 size-9"
                onClick={clearFilters}
              >
                <XIcon className="h-4 w-4 text-destructive" />
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
