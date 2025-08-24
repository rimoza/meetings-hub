"use client";

import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { ReportFilters as FilterType } from "@/types/report";

interface ReportFiltersProps {
  filters: FilterType;
  onFiltersChange: (filters: FilterType) => void;
}

export function ReportFilters({
  filters,
  onFiltersChange,
}: Readonly<ReportFiltersProps>) {
  return (
    <div className="flex flex-col lg:flex-row justify-between gap-3 w-full p-4 bg-card/50 backdrop-blur-sm border rounded-lg shadow-sm">
      {/* Search Bar */}
      <div className="relative flex-1 lg:max-w-2xl">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4 pointer-events-none" />
        <Input
          placeholder="Search by title, description, or creator..."
          value={filters.search}
          onChange={(e) =>
            onFiltersChange({ ...filters, search: e.target.value })
          }
          className="pl-10 h-10 bg-background/60 border-muted focus:bg-background transition-colors"
        />
      </div>

      {/* Divider for larger screens */}
      <div className="hidden lg:block w-px h-10 bg-border/50 self-center" />

      {/* Filter Dropdowns */}
      <div className="flex gap-2 flex-wrap sm:flex-nowrap">
        <Select
          value={filters.createdBy}
          onValueChange={(value: string) =>
            onFiltersChange({ ...filters, createdBy: value })
          }
        >
          <SelectTrigger className="h-10 text-sm w-full sm:w-[150px] bg-background/60 border-muted hover:bg-background/80 transition-colors">
            <SelectValue placeholder="Created By" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Creators</SelectItem>
            {/* Dynamic creators can be added here based on available data */}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}